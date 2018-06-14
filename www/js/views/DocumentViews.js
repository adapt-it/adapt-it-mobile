/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

// DocumentViews.js 
// Document import / export functionality for AIM. Current formats supported:
// - Plain text (no formatting, other than paragraph breaks)
// - USFM 2.4
// - USX 2.5
// - Adapt It document (xml)
define(function (require) {

    "use strict";

    var $               = require('jquery'),
        Underscore      = require('underscore'),
        Handlebars      = require('handlebars'),
        Backbone        = require('backbone'),
        Marionette      = require('marionette'),
        i18n            = require('i18n'),
        tplLoadingPleaseWait = require('text!tpl/LoadingPleaseWait.html'),
        tplImportDoc    = require('text!tpl/CopyOrImport.html'),
        tplExportDoc    = require('text!tpl/Export.html'),
        tplExportFormat = require('text!tpl/ExportChooseFormat.html'),
        projModel       = require('app/models/project'),
        bookModel       = require('app/models/book'),
        spModel         = require('app/models/sourcephrase'),
        chapModel       = require('app/models/chapter'),
        kbModels        = require('app/models/targetunit'),
        scrIDs          = require('utils/scrIDs'),
        USFM            = require('utils/usfm'),
        kblist          = null, // populated in onShow
        bookName        = "",
        scrID           = "",
        fileName        = "",
        isClipboard     = false,
        fileList        = [],
        fileCount       = 0,
        punctExp        = "",
        bookid          = "",
        puncts          = [],
        caseSource      = [],
        caseTarget      = [],
        deferreds       = [],
        MAX_BATCH       = 10000,    // maximum transaction size for SQLite 
                                    // (number can be tuned if needed - this is to avoid memory issues - see issue #138)
        FileTypeEnum    = {
            TXT: 1,
            USFM: 2,
            USX: 3,
            XML: 4
        },
        DestinationEnum = {
            FILE: 1,
            CLIPBOARD: 2,
            GDRIVE: 3,      // Google Drive (post 1.0)
            ACLOUD: 4       // Apple iCloud (post 1.0)
        },

        // Helper method to build an html list of documents in the AIM database.
        // Used by ExportDocument.
        buildDocumentList = function (pid) {
            var str = "";
            var i = 0;
            var entries = window.Application.BookList.where({projectid: pid});
            for (i = 0; i < entries.length; i++) {
                str += "<li class='topcoat-list__item' id=" + entries[i].attributes.bookid + ">" + entries[i].attributes.name + "<span class='chevron'></span></li>";
            }
            return str;
        },
        
        // Helper method to store the specified source and target text in the KB.
        saveInKB = function (sourceValue, targetValue, oldTargetValue, projectid) {
            var elts = kblist.filter(function (element) {
                return (element.attributes.projectid === projectid &&
                   element.attributes.source === sourceValue);
            });
            var tu = null,
                curDate = new Date(),
                timestamp = (curDate.getFullYear() + "-" + (curDate.getMonth() + 1) + "-" + curDate.getDay() + "T" + curDate.getUTCHours() + ":" + curDate.getUTCMinutes() + ":" + curDate.getUTCSeconds() + "z");
            if (elts.length > 0) {
                tu = elts[0];
            }
            if (tu) {
                var i = 0,
                    found = false,
                    refstrings = tu.get('refstring');
                // delete or decrement the old value
                if (oldTargetValue.length > 0) {
                    // there was an old value -- try to find and remove the corresponding KB entry
                    for (i = 0; i < refstrings.length; i++) {
                        if (refstrings[i].target === oldTargetValue) {
                            if (refstrings[i].n !== '0') {
                                // more than one refcount -- decrement it
                                refstrings[i].n--;
                            }
                            break;
                        }
                    }
                }
                // add or increment the new value
                for (i = 0; i < refstrings.length; i++) {
                    if (refstrings[i].target === targetValue) {
                        refstrings[i].n++;
                        found = true;
                        break;
                    }
                }
                if (found === false) {
                    // no entry in KB with this source/target -- add one
                    var newRS = {
                            'target': targetValue,
                            'n': '1'
                        };
                    refstrings.push(newRS);
                }
                // sort the refstrings collection on "n" (refcount)
                refstrings.sort(function (a, b) {
                    // high to low
                    return parseInt(b.n, 10) - parseInt(a.n, 10);
                });
                // update the KB model
                tu.set('refstring', refstrings, {silent: true});
                tu.set('timestamp', timestamp, {silent: true});
                tu.update();
            } else {
                // no entry in KB with this source -- add one
                var newID = Underscore.uniqueId(),
                    newTU = new kbModels.TargetUnit({
                        tuid: newID,
                        projectid: projectid,
                        source: sourceValue,
                        refstring: [
                            {
                                target: targetValue,
                                n: "1"
                            }
                        ],
                        timestamp: timestamp,
                        user: ""
                    });
                kblist.add(newTU);
                newTU.save();
            }
        },
        

        // Helper method to import the selected file into the specified project.
        // This method has sub-methods for text, usfm, usx and xml (Adapt It document) file types.
        importFile = function (file, project) {
            var status = "";
            var reader = new FileReader();
            var i = 0;
            var name = "";
            var doc = null;
            var result = false;
            var errMsg = "";
            var sps = [];
            // Callback for when the file is imported / saved successfully
            var importSuccess = function () {
                console.log("importSuccess()");
                // update status
                $("#status").html(i18n.t("view.dscStatusImportSuccess", {document: fileName}));
                if ($("#loading").length) {
                    // mobile "please wait" UI
                    $("#loading").hide();
                    $("#waiting").hide();
                    $("#OK").show();
                }
                // display the OK button
                $("#OK").removeAttr("disabled");
            };
            // Callback for when the file failed to import
            var importFail = function (e) {
                console.log("importFail(): " + e.message);
                // update status
                $("#status").html(i18n.t("view.dscCopyDocumentFailed", {document: fileName, reason: e.message}));
                if ($("#loading").length) {
                    // mobile "please wait" UI
                    $("#loading").hide();
                    $("#waiting").hide();
                    $("#OK").show();
                }
                // display the OK button
                $("#OK").removeAttr("disabled");
            };
            
            // callback method for when the FileReader has finished loading in the file
            reader.onloadend = function (e) {
                var value = "",
                    scrID = null,
                    bookName = "",
                    chap = 0,
                    verse = 0,
                    s = "",
                    t = "",
                    index = 0,
                    norder = 1,
                    markers = "",
                    prepuncts = "",
                    midpuncts = "",
                    follpuncts = "",
                    newSP = null,
                    punctIdx = 0,
                    chapter = null,
                    book = null,
                    books = window.Application.BookList,
                    chapters = window.Application.ChapterList,
                    sourcePhrases = new spModel.SourcePhraseCollection(),
                    arr = [],   // array of content words (for sourcephrases)
                    arrSP = [], // array of spaces (for )
                    bookID = "",
                    chapterID = "",
                    spID = "";
                ///
                // FILE TYPE READERS
                ///
                
                // Plain Text document
                // We assume these are just text with no markup,
                // in a single chapter (this could change if needed)
                var readTextDoc = function (contents) {
                    var spaceRE = /\s+/;        // select 1+ space chars
                    var nonSpaceRE = /[^\s+]/;  // select 1+ non-space chars
                    var newline = new RegExp('[\n\r\f\u2028\u2029]+', 'g');
                    var prepunct = "";
                    var follpunct = "";
                    var needsNewLine = false;
                    var chaps = [];
                    var sp = null;
                    console.log("Reading text file:" + fileName);
                    index = 1;
                    bookName = fileName;
                    bookID = Underscore.uniqueId();
                    // Create the book and chapter 
                    book = new bookModel.Book({
                        bookid: bookID,
                        projectid: project.get('projectid'),
                        name: bookName,
                        filename: fileName,
                        chapters: []
                    });
                    books.add(book);
                    // (for now, just one chapter -- eventually we could chunk this out based on file size)
                    chapterID = Underscore.uniqueId();
                    chaps.push(chapterID);
                    chapter = new chapModel.Chapter({
                        chapterid: chapterID,
                        bookid: bookID,
                        projectid: project.get('projectid'),
                        name: bookName,
                        lastadapted: 0,
                        versecount: 0
                    });
                    chapters.add(chapter);
                    // set the lastDocument / lastAdapted<xxx> values if not already set
                    if (project.get('lastDocument') === "") {
                        project.set('lastDocument', bookName);
                    }
                    if (project.get('lastAdaptedBookID') === 0) {
                        project.set('lastAdaptedBookID', bookID);
                        project.set('lastAdaptedChapterID', chapterID);
                    }
                    if (project.get('lastAdaptedName') === "") {
                        project.set('lastAdaptedName', bookName);
                    }
                    // parse the text file and create the SourcePhrases
                    // insert special <p> for linefeeds, then split on whitespace (doesn't keep whitespace)
                    arr = contents.replace(newline, " <p> ").split(spaceRE);
                    arrSP = contents.replace(newline, " <p> ").split(nonSpaceRE);  // do the inverse (keep spaces)
                    i = 0;
                    while (i < arr.length) {
                        // check for a marker
                        if (arr[i].length === 0) {
                            // nothing in this token -- skip
                            i++;
                        } else if (arr[i] === "<p>") {
                            // newline -- make a note and keep going
                            markers = "\\p";
                            i++;
                        } else if (arr[i].length === 1 && puncts.indexOf(arr[i]) > -1) {
                            // punctuation token -- add to the prepuncts
                            prepuncts += arr[i];
                            i++;
                        } else {
                            // "normal" sourcephrase token
                            s = arr[i];
                            // look for leading and trailing punctuation
                            // leading...
                            if (puncts.indexOf(arr[i].charAt(0)) > -1) {
                                // leading punct 
                                punctIdx = 0;
                                while (puncts.indexOf(arr[i].charAt(punctIdx)) > -1 && punctIdx < arr[i].length) {
                                    prepuncts += arr[i].charAt(punctIdx);
                                    punctIdx++;
                                }
                                // remove the punctuation from the "source" of the substring
                                s = s.substr(punctIdx);
                            }
                            if (s.length === 0) {
                                // it'a ALL punctuation -- jump to the next token
                                i++;
                            } else {
                                // not all punctuation -- check following punctuation, then create a sourcephrase
                                if (puncts.indexOf(s.charAt(s.length - 1)) > -1) {
                                    // trailing punct 
                                    punctIdx = s.length - 1;
                                    while (puncts.indexOf(s.charAt(punctIdx)) > -1 && punctIdx > 0) {
                                        follpuncts += s.charAt(punctIdx);
                                        punctIdx--;
                                    }
                                    // remove the punctuation from the "source" of the substring
                                    s = s.substr(0, punctIdx + 1);
                                }
                                // Now create a new sourcephrase
                                spID = Underscore.uniqueId();
                                sp = new spModel.SourcePhrase({
                                    spid: spID,
                                    norder: norder,
                                    chapterid: chapterID,
                                    markers: markers,
                                    orig: null,
                                    prepuncts: prepuncts,
                                    midpuncts: midpuncts,
                                    follpuncts: follpuncts,
                                    srcwordbreak: arrSP[i],
                                    source: s,
                                    target: ""
                                });
                                markers = "";
                                prepuncts = "";
                                follpuncts = "";
                                punctIdx = 0;
                                index++;
                                sps.push(sp);
                                // if necessary, send the next batch of SourcePhrase INSERT transactions
                                if ((sps.length % MAX_BATCH) === 0) {
                                    deferreds.push(sourcePhrases.addBatch(sps.slice(sps.length - MAX_BATCH)));
                                }
                                i++;
                                norder++;
                            }
                        }
                    }

                    // add any remaining sourcephrases
                    if ((sps.length % MAX_BATCH) > 0) {
                        $("#status").html(i18n.t("view.dscStatusSaving"));
                        deferreds.push(sourcePhrases.addBatch(sps.slice(sps.length - (sps.length % MAX_BATCH))));
                    }
                    // track all those deferred calls to addBatch -- when they all complete, report the results to the user
                    $.when.apply($, deferreds).done(function (value) {
                        importSuccess();
                    }).fail(function (e) {
                        importFail(e);
                    });
                    // for non-scripture texts, there are no verses. Keep track of how far we are by using a 
                    // negative value for the # of SourcePhrases in the text.
                    chapter.set('versecount', -(index), {silent: true});
                    chapter.save();
                    book.set('chapters', chaps, {silent: true});
                    book.save();
                    return true; // success
                    // END readTextDoc()
                };
                
                // Paratext USX document
                // These are XML-flavored markup files exported from Paratext
                var readUSXDoc = function (contents) {
                    var prepunct = "";
                    var follpunct = "";
                    var sp = null;
                    var spaceRE = /\s+/;        // select 1+ space chars
                    var nonSpaceRE = /[^\s+]/;  // select 1+ non-space chars
                    var chaps = [];
                    var xmlDoc = $.parseXML(contents);
                    var $xml = $(xmlDoc);
                    var chapterName = "";
                    // find the USFM ID of this book
                    var scrIDList = new scrIDs.ScrIDCollection();
                    var verseCount = 0;
                    var punctIdx = 0;
                    var lastAdapted = 0;
                    var i = 0;
                    var closingMarker = "";
                    var parseNode = function (element) {
                        closingMarker = "";
                        // process the node itself
                        if ($(element)[0].nodeType === 1) {
                            switch ($(element)[0].tagName) {
                            case "book":
                                markers += "\\id " + element.attributes.item("code").nodeValue;
                                break;
                            case "chapter":
                                if (markers.length > 0) {
                                    markers += " ";
                                }
                                markers += "\\c " + element.attributes.item("number").nodeValue;
                                // does this have alt or publishing numbers?
                                if (element.getAttribute("pubnumber") && element.getAttribute("pubnumber").length > 0) {
                                    // verse where the published numbering differs from the number
                                    markers += " \\cp " + element.getAttribute("pubnumber");
                                } else if (element.getAttribute("altnumber") && element.getAttribute("altnumber").length > 0) {
                                    // verse with an alternate numbering
                                    markers += " \\ca " + element.getAttribute("altnumber") + "\\ca*";
                                }
                                if (element.attributes.item("number").nodeValue !== "1") {
                                    // not the first chapter
                                    // first, close out the previous chapter
                                    chapter.set('versecount', verseCount, {silent: true});
                                    chapter.save();
                                    verseCount = 0; // reset for the next chapter
                                    lastAdapted = 0; // reset for the next chapter
                                    // now create the new chapter
                                    chapterName = i18n.t("view.lblChapterName", {bookName: bookName, chapterNumber: element.attributes.item("number").nodeValue});
                                    chapterID = Underscore.uniqueId();
                                    chaps.push(chapterID);
                                    chapter = new chapModel.Chapter({
                                        chapterid: chapterID,
                                        bookid: bookID,
                                        projectid: project.get('projectid'),
                                        name: chapterName,
                                        lastadapted: 0,
                                        versecount: 0
                                    });
                                    chapters.add(chapter);
                                }
                                break;
                            case "verse":
                                verseCount++;
                                if (markers.length > 0) {
                                    markers += " ";
                                }
                                // first, get the verse and number
                                markers += "\\v " + element.attributes.item("number").nodeValue;
                                // does this have alt or publishing numbers?
                                if (element.attributes.item("pubnumber")) {
                                    // verse where the published numbering differs from the number
                                    markers += " \\vp " + element.getAttribute("pubnumber") + "\\vp*";
                                } else if (element.attributes.item("altnumber")) {
                                    // verse with an alternate numbering
                                    markers += " \\va " + element.getAttribute("altnumber") + "\\va*";
                                }
                                break;
                            case "para":
                                // the para kind is in the style tag
                                if (markers.length > 0) {
                                    markers += " ";
                                }
                                markers += "\\" + element.attributes.item("style").nodeValue;
                                break;
                            case "char":
                                // char-related markers, kept in the style attribute
                                if (markers.length > 0) {
                                    markers += " ";
                                }
                                markers += "\\" + element.attributes.item("style").nodeValue;
                                closingMarker = "\\" + element.attributes.item("style").nodeValue + "*";
                                break;
                            case "figure":
                                markers += "\\fig ";
                                markers += element.attributes.item("desc").nodeValue;
                                markers += "|";
                                markers += element.attributes.item("file").nodeValue;
                                markers += "|";
                                markers += element.attributes.item("size").nodeValue;
                                markers += "|";
                                markers += element.attributes.item("loc").nodeValue;
                                markers += "|";
                                markers += element.attributes.item("copy").nodeValue;
                                markers += "|";
                                markers += element.childNodes[0].nodeValue; // inner text is the figure caption
                                markers += "|";
                                markers += element.attributes.item("ref").nodeValue;
                                markers += "\\fig*";
                                break;
                            case "note":
                                    //caller, style
                                if (markers.length > 0) {
                                    markers += " ";
                                }
                                markers += "\\" + element.attributes.item("style").nodeValue;
                                if (element.attributes.item("caller")) {
                                    markers += " " + element.attributes.item("caller").nodeValue;
                                }
                                closingMarker = "\\" + element.attributes.item("style").nodeValue + "*";
                                break;
                            case "table":
                                break; // do nothing -- table rows are kept
                            case "row":
                                if (markers.length > 0) {
                                    markers += " ";
                                }
                                markers += "\\tr";
                                break;
                            case "cell":
                                if (markers.length > 0) {
                                    markers += " ";
                                }
                                // could be header or cell; cells also contain alignment
                                markers += "\\" + element.attributes.item("style").nodeValue;
                                break;
                            case "sidebar":
                                if (markers.length > 0) {
                                    markers += " ";
                                }
                                markers += "\\" + element.attributes.item("style").nodeValue;
                                closingMarker = "\\esbe";
                                break;
                            case "ref":
                                if (markers.length > 0) {
                                    markers += " ";
                                }
                                markers += "\\x \\xt";
                                closingMarker = "\\x*";
                                break;
                            default: // no processing for other nodes
                                break;
                            }
                        }
                        
                        // If this is a text node, create any needed sourcephrases
                        if ($(element)[0].nodeType === 3) {
                            // Split the text into an array
                            // Note that this is analogous to the AI "strip" of text, and not the whole document
                            arr = ($(element)[0].nodeValue).trim().split(spaceRE);
                            arrSP = ($(element)[0].nodeValue).trim().split(nonSpaceRE);
                            i = 0;
                            while (i < arr.length) {
                                // check for a marker
                                if (arr[i].length === 0) {
                                    // nothing in this token -- skip
                                    i++;
                                } else if (arr[i].length === 1 && puncts.indexOf(arr[i]) > -1) {
                                    // punctuation token -- add to the prepuncts
                                    prepuncts += arr[i];
                                    i++;
                                } else {
                                    // "normal" sourcephrase token
                                    s = arr[i];
                                    // look for leading and trailing punctuation
                                    // leading...
                                    if (puncts.indexOf(arr[i].charAt(0)) > -1) {
                                        // leading punct 
                                        punctIdx = 0;
                                        while (puncts.indexOf(arr[i].charAt(punctIdx)) > -1 && punctIdx < arr[i].length) {
                                            prepuncts += arr[i].charAt(punctIdx);
                                            punctIdx++;
                                        }
                                        // remove the punctuation from the "source" of the substring
                                        s = s.substr(punctIdx);
                                    }
                                    if (s.length === 0) {
                                        // it'a ALL punctuation -- jump to the next token
                                        i++;
                                    } else {
                                        // not all punctuation -- check following punctuation, then create a sourcephrase
                                        if (puncts.indexOf(s.charAt(s.length - 1)) > -1) {
                                            // trailing punct 
                                            punctIdx = s.length - 1;
                                            while (puncts.indexOf(s.charAt(punctIdx)) > -1 && punctIdx > 0) {
                                                follpuncts += s.charAt(punctIdx);
                                                punctIdx--;
                                            }
                                            // remove the punctuation from the "source" of the substring
                                            s = s.substr(0, punctIdx + 1);
                                        }
                                        // Now create a new sourcephrase
                                        spID = Underscore.uniqueId();
                                        sp = new spModel.SourcePhrase({
                                            spid: spID,
                                            norder: norder,
                                            chapterid: chapterID,
                                            markers: markers,
                                            orig: null,
                                            prepuncts: prepuncts,
                                            midpuncts: midpuncts,
                                            follpuncts: follpuncts,
                                            srcwordbreak: arrSP[i],
                                            source: s,
                                            target: ""
                                        });
                                        markers = "";
                                        prepuncts = "";
                                        follpuncts = "";
                                        punctIdx = 0;
                                        index++;
                                        norder++;
                                        sps.push(sp);
                                        // if necessary, send the next batch of SourcePhrase INSERT transactions
                                        if ((sps.length % MAX_BATCH) === 0) {
                                            deferreds.push(sourcePhrases.addBatch(sps.slice(sps.length - MAX_BATCH)));
                                        }
                                        i++;
                                    }
                                }
                            }
                        }
                        // recurse into children
                        if ($(element).contents().length > 0) {
                            $(element).contents().each(function (idx, elt) {
                                parseNode(elt);
                            });
                        }
                    };
                    console.log("Reading USX file:" + fileName);
                    bookName = fileName.substr(0, fileName.indexOf("."));
                    scrIDList.fetch({reset: true, data: {id: ""}});
                    // the book ID (e.g., "MAT") is in a singleton <book> element of the USX file
                    scrID = scrIDList.where({id: $($xml).find("book").attr("code")})[0];
                    if (scrID === null) {
                        console.log("No ID matching this document: " + $($xml).find("book").attr("code"));
                        errMsg = i18n.t("view.dscErrCannotFindID");
                        return false;
                    }
                    arr = scrID.get('chapters');
                    if (books.where({scrid: (scrID.get('id'))}).length > 0) {
                        // this book is already in the list -- just return
                        errMsg = i18n.t("view.dscErrDuplicateFile");
                        return false;
                    }
                    index = 1;
                    bookID = Underscore.uniqueId();
                    // Create the book and chapter 
                    book = new bookModel.Book({
                        bookid: bookID,
                        projectid: project.get('projectid'),
                        scrid: scrID.get('id'),
                        name: bookName,
                        filename: fileName,
                        chapters: []
                    });
                    books.add(book);
                    chapterID = Underscore.uniqueId();
                    chaps.push(chapterID);
                    chapterName = i18n.t("view.lblChapterName", {bookName: bookName, chapterNumber: "1"});
                    chapter = new chapModel.Chapter({
                        chapterid: chapterID,
                        bookid: bookID,
                        projectid: project.get('projectid'),
                        name: chapterName,
                        lastadapted: 0,
                        versecount: 0
                    });
                    chapters.add(chapter);
                    // set the lastDocument / lastAdapted<xxx> values if not already set
                    if (project.get('lastDocument') === "") {
                        project.set('lastDocument', bookName);
                    }
                    if (project.get('lastAdaptedBookID') === 0) {
                        project.set('lastAdaptedBookID', bookID);
                        project.set('lastAdaptedChapterID', chapterID);
                    }
                    if (project.get('lastAdaptedName') === "") {
                        project.set('lastAdaptedName', chapterName);
                    }
                    // now read the contents of the file
                    parseNode($($xml).find("usx"));
                    // add any remaining sourcephrases
                    if ((sps.length % MAX_BATCH) > 0) {
                        $("#status").html(i18n.t("view.dscStatusSaving"));
                        deferreds.push(sourcePhrases.addBatch(sps.slice(sps.length - (sps.length % MAX_BATCH))));
                    }
                    // track all those deferred calls to addBatch -- when they all complete, report the results to the user
                    $.when.apply($, deferreds).done(function (value) {
                        importSuccess();
                    }).fail(function (e) {
                        importFail(e);
                    });
                    // update the last chapter's verseCount
                    chapter.set('versecount', verseCount, {silent: true});
                    chapter.save();
                    book.set('chapters', chaps, {silent: true});
                    book.save();
                    return true; // success
                    // END readUSXDoc()
                };
                
                // Adapt It XML document
                // While XML is a general purpose document format, we're looking
                // specifically for Adapt It XML document files; other files
                // will be skipped (for now). 
                // This import also populates the KB and sets the last translated verse in each chapter.
                var readXMLDoc = function (contents) {
                    var prepunct = "";
                    var spaceRE = /\s+/;        // select 1+ space chars
                    var nonSpaceRE = /[^\s+]/;  // select 1+ non-space chars
                    var follpunct = "";
                    var sp = null;
                    var chaps = [];
                    var xmlDoc = $.parseXML(contents);
                    var chapterName = "";
                    // find the USFM ID of this book
                    var scrIDList = new scrIDs.ScrIDCollection();
                    var verseCount = 0;
                    var lastAdapted = 0;
                    var markers = "";
                    var firstChapterNumber = "1";
                    var origTarget = "";
                    var i = 0;
                    var firstBook = false;
                    var isMergedDoc = false;
                    
                    // Helper method to convert theString to lower case using either the source or target case equivalencies.
                    var autoRemoveCaps = function (theString, isSource) {
                        var i = 0,
                            result = "";
                        // If we aren't capitalizing for this project, just return theString
                        if (project.get('AutoCapitalization') === 'false') {
                            return theString;
                        }
                        // is the first letter capitalized?
                        if (isSource === true) {
                            // use source case equivalencies
                            for (i = 0; i < caseSource.length; i++) {
                                if (caseSource[i].charAt(1) === theString.charAt(0)) {
                                    // uppercase -- convert the first character to lowercase and return the result
                                    result = caseSource[i].charAt(0) + theString.substr(1);
                                    return result;
                                }
                            }
                        } else {
                            // use target case equivalencies
                            for (i = 0; i < caseTarget.length; i++) {
                                if (caseTarget[i].charAt(1) === theString.charAt(0)) {
                                    // uppercase -- convert the first character to lowercase and return the result
                                    result = caseTarget[i].charAt(0) + theString.substr(1);
                                    return result;
                                }
                            }
                        }
                        // If we got here, the string wasn't uppercase -- just return the same string
                        return theString;
                    };
                    
                    console.log("Reading XML file:" + fileName);
                    bookName = ""; // reset
                    // Book name
                    // Try to get the adapted book name from the \h marker, if it exists
                    if (contents.indexOf("\\h ") > 0) {
                        // there is a \h marker -- look backwards for the nearest "a" attribute (this is the adapted name)
                        index = contents.indexOf("\\h ");
                        i = contents.lastIndexOf("s=", index) + 3;
                        // Sanity check -- this \\h element might not have an adaptation
                        // (if it doesn't, there won't be a a="" after the s="" attribute)
                        if (contents.lastIndexOf("a=", index) > i) {
                            // Okay, this looks legit. Pull out the adapted book name from the file.
                            index = contents.lastIndexOf("a=", index) + 3;
                            bookName = contents.substr(index, contents.indexOf("\"", index) - index);
                        }
                    }
                    // If that didn't work, use the filename
                    if (bookName === "") {
                        bookName = fileName.substr(0, fileName.indexOf("."));
                        if (bookName.indexOf("_Collab") > -1) {
                            // Collab document -- strip out the _Collab_ and _CH<#> for the name
                            bookName = bookName.substr(8, bookName.lastIndexOf("_CH") - 8);
                        }
                    }
                    // Sanity check -- this needs to be an AI XML document (we don't support other xml files right now)
                    scrIDList.fetch({reset: true, data: {id: ""}});
                    // Starting at the SourcePhrases ( <S ...> ), look for the \id element
                    // in the markers. We'll test this against the canonical usfm markers to learn more about this document.
                    i = contents.indexOf("<S ");
                    index = contents.indexOf("\\id", i);
                    if (index === -1) {
                        // No ID found -- this is most likely not an AI xml document.
                        // Return; we can't parse random xml files.
                        console.log("No ID element found (is this an AI XML document?) -- exiting.");
                        errMsg = i18n.t("view.dscErrCannotFindID");
                        return false;
                    }
                    // We've found the \id element in the markers -- to get the value, we have to work
                    // backwards until we find the nearest "s" attribute
                    // e.g., <S s="MAT" ...>.
                    index = contents.lastIndexOf("s=", index) + 3;
                    scrID = scrIDList.where({id: contents.substr(index, contents.indexOf("\"", index) - index)})[0];
                    arr = scrID.get('chapters');
                    if (books.where({scrid: (scrID.get('id'))}).length > 0) {
                        // ** COLLABORATION SUPPORT **
                        // This book is already in our database -
                        // it could either be a duplicate book / file OR a different chapter from a
                        // collaboration document. Figure out which by finding the first chapter marker
                        // and seeing if it's already in our database
                        book = books.where({scrid: (scrID.get('id'))})[0]; // set to the existing book
                        index = contents.indexOf("\\c ", 0); // first chapter marker
                        if (index > 0) {
                            // pull out the chapter number
                            firstChapterNumber = contents.substr(index + 3, contents.indexOf(" ", index + 3) - (index + 3));
                            if (firstChapterNumber === "1") {
                                firstBook = true;
                            }
                            // look up the chapter number -- is it something we already have?
                            chapterName = i18n.t("view.lblChapterName", {bookName: book.get("bookid"), chapterNumber: firstChapterNumber});
                            if (chapters.where({name: chapterName}).length > 0) {
                                // This is a duplicate -- return
                                errMsg = i18n.t("view.dscErrDuplicateFile");
                                return false;
                            }
                            // If we got this far, we're looking at a collaboration document -
                            // we'll be merging in the new data into the existing book
                            isMergedDoc = true;
                            if (firstBook === true) {
                                // The user has merged in the first chapter AFTER importing a subsequent chapter --
                                // this shouldn't happen (see the logic block below that disallows it). Just in case,
                                // try to offset the damage by updating the book name to what this chapter holds.
                                book.set('name', bookName);
                            } else {
                                // Not the first chapter -- use the book name in the database object.
                                bookName = book.get("name");
                            }
                            bookID = book.get("bookid");
                            chaps = book.get("chapters"); // set to the chapters already imported in the book (we'll add to this array)
                        } else {
                            // No chapter found (but there is an ID) -- return
                            errMsg = i18n.t("view.dscErrCannotFindChapter");
                            return false;
                        }
                    } else {
                        // This is a new book
                        // Make a note of the first chapter number. Disallow collab documents where the first chapter is
                        // NOT the first document being imported, as this creates a headache for book naming / lookups.
                        index = contents.indexOf("\\c ", 0); // first chapter marker
                        if (index > 0) {
                            // pull out the chapter number
                            firstChapterNumber = contents.substr(index + 3, contents.indexOf(" ", index + 3) - (index + 3));
                            if (firstChapterNumber === "1") {
                                firstBook = true;
                            } else {
                                // User attempting to import collab document without importing the first chapter first;
                                // error out
                                errMsg = i18n.t("view.dscErrImportFirstChapterFirst");
                                return false;
                            }
                        }
                        // Create the book and chapter 
                        bookID = Underscore.uniqueId();
                        book = new bookModel.Book({
                            bookid: bookID,
                            projectid: project.get('projectid'),
                            scrid: scrID.get('id'),
                            name: bookName,
                            filename: fileName,
                            chapters: []
                        });
                        books.add(book);
                    }
                    // Reset the index to the beginning of the file
                    index = 1;
                    // Add the first chapter
                    chapterID = Underscore.uniqueId();
                    chaps.push(chapterID);
                    chapterName = i18n.t("view.lblChapterName", {bookName: bookName, chapterNumber: firstChapterNumber});
                    chapter = new chapModel.Chapter({
                        chapterid: chapterID,
                        bookid: bookID,
                        projectid: project.get('projectid'),
                        name: chapterName,
                        lastadapted: 0,
                        versecount: 0
                    });
                    chapters.add(chapter);
                    // set the lastDocument / lastAdapted<xxx> values if not already set
                    if (project.get('lastDocument') === "") {
                        project.set('lastDocument', bookName);
                    }
                    if (project.get('lastAdaptedBookID') === 0) {
                        project.set('lastAdaptedBookID', bookID);
                        project.set('lastAdaptedChapterID', chapterID);
                    }
                    if (project.get('lastAdaptedName') === "") {
                        project.set('lastAdaptedName', chapterName);
                    }
                    // create the sourcephrases
                    var $xml = $(xmlDoc);
                    var stridx = 0;
                    var chapNum = "";
                    markers = "";
                    $($xml).find("AdaptItDoc > S").each(function (i) {
                        origTarget = ""; // initialize merge original target text
                        if (i === 0 && firstBook === false) {
                            // merged (collaboration) documents have an extra "\id" element at the beginning of subsequent chapters;
                            // ignore this element and continue to the next one
                            return true; // jquery equivalent of continue in loop
                        }
                        // If this is a new chapter (starting for ch 2 -- chapter 1 is created above),
                        // create a new chapter object
                        // EDB 22 Aug 17 note: we're adding to the markers rather than setting; for the \x* ending marker, we need to
                        // move it forward to the next source phrase. MAKE SURE [markers] GETS CLEARED OUT IN OTHER CASES.
                        if ($(this).attr('m')) {
                            markers += $(this).attr('m');
                        }
                        if (markers && markers.indexOf("\\c ") !== -1) {
                            // is this the first chapter marker? If so, ignore it (we already created it above)
                            stridx = markers.indexOf("\\c ") + 3;
                            chapNum = markers.substr(stridx, markers.indexOf(" ", stridx) - stridx);
                            if (chapNum !== firstChapterNumber) {
                                // This is not our first chapter, so we can create it
                                // update the last adapted for the previous chapter before closing it out
                                chapter.set('versecount', verseCount, {silent: true});
                                chapter.set('lastadapted', lastAdapted, {silent: true});
                                chapter.save();
                                verseCount = 0; // reset for the next chapter
                                lastAdapted = 0; // reset for the next chapter
                                stridx = markers.indexOf("\\c ") + 3;
                                chapterName = i18n.t("view.lblChapterName", {bookName: bookName, chapterNumber: markers.substr(stridx, markers.indexOf(" ", stridx) - stridx)});
                                chapterID = Underscore.uniqueId();
                                chaps.push(chapterID);
                                // create the new chapter
                                chapter = new chapModel.Chapter({
                                    chapterid: chapterID,
                                    bookid: bookID,
                                    projectid: project.get('projectid'),
                                    name: chapterName,
                                    lastadapted: 0,
                                    versecount: 0
                                });
                                chapters.add(chapter);
    //                            console.log(": " + $(this).attr('s') + ", " + chapterID);
                            }
                        }
                        if (markers && markers.indexOf("\\v ") !== -1) {
                            verseCount++;
                            // check this sourcephrase for a target - if there is one, consider this verse adapted
                            // (note that we're only checking the FIRST sp of each verse, not EVERY sp in the verse)
                            if ($(this).attr('t')) {
                                lastAdapted++;
                            }
                        }
                        
                        // phrase -- collect the original target words
                        if ($(this).attr('w') > 1) {
                            // child sourcephrases -- a merge?
                            $(this).children().each(function (childIdx, childVal) {
                                if (childIdx > 0) {
                                    origTarget += "|";
                                }
                                if ($(childVal).attr('t')) {
                                    origTarget += $(childVal).attr("t");
                                }
                            });
                        }
                        
                        // if there are filtered text items, insert them now
                        if ($(this).attr('fi')) {
                            console.log("fi: " + $(this).attr('fi'));
//                            markers = "";
                            $(this).attr('fi').split(spaceRE).forEach(function (elt, index, array) {
//                                console.log("- " + elt);
                                if (elt.indexOf("~FILTER") > -1) {
                                    // do nothing -- skip first and last elements
//                                    console.log("filter");
                                } else if (elt.indexOf("\\") === 0) {
                                    // starting marker
                                    markers += elt;
                                } else if (elt.indexOf("\\") > 0) {
                                    // ending marker - it's concatenated with the preceding token, no space
                                    // (1) create a sourcephrase with the first part of the token (without the ending marker)
                                    if (origTarget.length > 0) {
                                        // phrase -- spID has a prefix of "phr-"
                                        spID = "phr-" + Underscore.uniqueId();
                                    } else {
                                        spID = Underscore.uniqueId();
                                    }
                                    sp = new spModel.SourcePhrase({
                                        spid: spID,
                                        norder: norder,
                                        chapterid: chapterID,
                                        markers: markers,
                                        orig: (origTarget.length > 0) ? origTarget : null,
                                        prepuncts: "",
                                        midpuncts: "",
                                        follpuncts: "",
                                        flags: "",
                                        texttype: 0,
                                        gloss: "",
                                        freetrans: "",
                                        note: "",
                                        srcwordbreak: $(this).attr('swbk'),
                                        tgtwordbreak: $(this).attr('twbk'),
                                        source: elt.substr(0, elt.indexOf("\\")),
                                        target: ""
                                    });
                                    index++;
                                    norder++;
                                    sps.push(sp);
                                    // if necessary, send the next batch of SourcePhrase INSERT transactions
                                    if ((sps.length % MAX_BATCH) === 0) {
                                        deferreds.push(sourcePhrases.addBatch(sps.slice(sps.length - MAX_BATCH)));
                                    }
                                    // (2) now set the markers to the ending marker, for the next sourcephrase
                                    markers = elt.substr(elt.indexOf("\\"));
                                    //markers = ""; // reset
                                } else {
                                    // regular token - add as a new sourcephrase
                                    if (origTarget.length > 0) {
                                        // phrase -- spID has a prefix of "phr-"
                                        spID = "phr-" + Underscore.uniqueId();
                                    } else {
                                        spID = Underscore.uniqueId();
                                    }
                                    sp = new spModel.SourcePhrase({
                                        spid: spID,
                                        norder: norder,
                                        chapterid: chapterID,
                                        markers: markers,
                                        orig: (origTarget.length > 0) ? origTarget : null,
                                        prepuncts: "",
                                        midpuncts: "",
                                        follpuncts: "",
                                        flags: "",
                                        texttype: 0,
                                        gloss: "",
                                        freetrans: "",
                                        note: "",
                                        srcwordbreak: $(this).attr('swbk'),
                                        tgtwordbreak: $(this).attr('twbk'),
                                        source: elt,
                                        target: ""
                                    });
                                    index++;
                                    norder++;
                                    sps.push(sp);
                                    // if necessary, send the next batch of SourcePhrase INSERT transactions
                                    if ((sps.length % MAX_BATCH) === 0) {
                                        deferreds.push(sourcePhrases.addBatch(sps.slice(sps.length - MAX_BATCH)));
                                    }
                                    markers = ""; // reset
                                }
                            });
                        }
                        // create the next sourcephrase
//                        console.log(i + ": " + $(this).attr('s') + ", " + chapterID);
                        if (origTarget.length > 0) {
                            // phrase -- spID has a prefix of "phr-"
                            spID = "phr-" + Underscore.uniqueId();
                        } else {
                            spID = Underscore.uniqueId();
                        }
                        sp = new spModel.SourcePhrase({
                            spid: spID,
                            norder: norder,
                            chapterid: chapterID,
                            markers: markers, //$(this).attr('m'),
                            orig: (origTarget.length > 0) ? origTarget : null,
                            prepuncts: $(this).attr('pp'),
                            midpuncts: "",
                            follpuncts: $(this).attr('fp'),
                            flags: $(this).attr('f'),
                            texttype: $(this).attr('ty'),
                            gloss: $(this).attr('g'),
                            freetrans: $(this).attr('ft'),
                            note: $(this).attr('no'),
                            srcwordbreak: $(this).attr('swbk'),
                            tgtwordbreak: $(this).attr('twbk'),
                            source: $(this).attr('k'), // source w/o punctuation
                            target: $(this).attr('t')
                        });
                        index++;
                        norder++;
                        sps.push(sp);
                        // if necessary, send the next batch of SourcePhrase INSERT transactions
                        if ((sps.length % MAX_BATCH) === 0) {
                            deferreds.push(sourcePhrases.addBatch(sps.slice(sps.length - MAX_BATCH)));
                        }
                        // add this item to the KB
                        // TODO: build up punctpairs
                        if (sp.get('target').length > 0) {
                            saveInKB(autoRemoveCaps(sp.get('source'), true), autoRemoveCaps($(this).attr('a'), false),
                                            "", project.get('projectid'));
                        }
                        markers = ""; // clear out the markers for the next wourcephrase
                    });
                    // add any remaining sourcephrases
                    if ((sps.length % MAX_BATCH) > 0) {
                        $("#status").html(i18n.t("view.dscStatusSaving"));
                        deferreds.push(sourcePhrases.addBatch(sps.slice(sps.length - (sps.length % MAX_BATCH))));
                    }
                    // track all those deferred calls to addBatch -- when they all complete, report the results to the user
                    $.when.apply($, deferreds).done(function (value) {
                        importSuccess();
                    }).fail(function (e) {
                        importFail(e);
                    });
                    // update the last chapter's verseCount and last adapted verse
                    chapter.set('lastadapted', lastAdapted, {silent: true});
                    chapter.set('versecount', verseCount, {silent: true});
                    chapter.save();
                    if (isMergedDoc === true) {
                        var chapList = [];
                        var number = 0;
                        var tmpString = "";
                        // If this is a merged document, the chapters might be out of order -- 
                        // sort them here
                        for (i = 0; i < chaps.length; i++) {
                            tmpString = chapters.findWhere({chapterid: chaps[i]}).get("name");
                            number = parseInt(tmpString.substr(tmpString.lastIndexOf(" " + 1)), 10); // just the number part
                            chapList.push({chapid: chaps[i], number: number});
                        }
                        var result = Underscore.sortBy(chapList, function (element) {
                            return element.number;
                        });
                        // transfer the sorted list back into chaps
                        chaps.length = 0; // clear chaps
                        for (i = 0; i < result.length; i++) {
                            chaps.push(result[i].chapid);
                        }
                    }
                    book.set('chapters', chaps, {silent: true});
                    book.save();
                    return true; // success
                    // END readXMLDoc()
                };
                
                // USFM document
                // This is the file format for Bibledit and Paratext
                // See http://paratext.org/about/usfm for format specification
                var readUSFMDoc = function (contents) {
                    var scrIDList = new scrIDs.ScrIDCollection();
                    var chapterName = "";
                    var sp = null;
                    var spaceRE = /\s+/;        // select 1+ space chars
                    var nonSpaceRE = /[^\s+]/;  // select 1+ non-space chars
                    var markerList = new USFM.MarkerCollection();
                    var marker = null;
                    var lastAdapted = 0;
                    var verseCount = 0;
                    var hasPunct = false;
                    var punctIdx = 0;
                    var stridx = 0;
                    var isPortion = false;      // issue #246: Scripture portion support
                    var chaps = [];
                    var regex1 = RegExp(/\\c\s1\s/);

                    console.log("Reading USFM file:" + fileName);
                    index = contents.indexOf("\\h ");
                    if (index > -1) {
                        // get the name from the usfm itself
                        bookName = contents.substr(index + 3, (contents.indexOf("\n", index) - (index + 3))).trim();
                        if (bookName.length === 0) {
                            // fall back on the file name
                            bookName = fileName;
                        }
                    } else {
                        bookName = fileName;
                    }
                    // find the ID of this book
                    index = contents.indexOf("\\id");
                    if (index === -1) {
                        // no ID found -- return
                        errMsg = i18n.t("view.dscErrCannotFindID");
                        return false;
                    }
                    markerList.fetch({reset: true, data: {name: ""}});
                    scrIDList.fetch({reset: true, data: {id: ""}});
                    scrID = scrIDList.where({id: contents.substr(index + 4, 3)})[0];
                    // Issue #246: scripture portion support -- 2 checks for portions:
                    // #1 (here): \id, but no chapter 1 --> assume the user is importing a portion from later in the book
                    // #2 (below): \id and \c 1, but versification doesn't match our knowledge --> assume portion of chapter 1 (and maybe more)
                    // These are not perfect checks -- versification sometimes doesn't match
                    if (regex1.test(contents) === false) {
                        // there is an \id, but no chapter 1 --> assume scripture portion
                        isPortion = true;
                    }
                    // check for duplicate book imports
                    if (isPortion === false) {
                        var entries = books.where({scrid: (scrID.get('id'))});
                        for (i = 0; i < entries.length; i++) {
                            if (entries[i].attributes.bookid.indexOf("p_") === -1) {
                                // attempting to import a duplicate full book -- error out
                                errMsg = i18n.t("view.dscErrDuplicateFile");
                                return false;
                            }
                        }
                    }
                    // add a book and chapter
                    if (isPortion === true) {
                        bookID = Underscore.uniqueId('p_');
                    } else {
                        bookID = Underscore.uniqueId();
                    }
                    book = new bookModel.Book({
                        bookid: bookID,
                        projectid: project.get('projectid'),
                        scrid: scrID.get('id'),
                        name: bookName,
                        filename: fileName,
                        chapters: [] // arr
                    });
                    books.add(book);
                    // Note that we're adding chapter 1 before we reach the \c 1 marker in the file --
                    // Usually there's a fair amount of front matter before we reach the chapter itself;
                    // rather than creating a chapter 0 (which would throw off the search stuff), we'll
                    // just add the front matter to chapter 1.
                    chapterID = Underscore.uniqueId();
                    chaps.push(chapterID);
                    if (isPortion === true) {
                        var portion = i18n.t("view.lblPortion");
                        chapterName = i18n.t("view.lblChapterName", {bookName: bookName, chapterNumber: portion});
                    } else {
                        chapterName = i18n.t("view.lblChapterName", {bookName: bookName, chapterNumber: "1"});
                    }
                    chapter = new chapModel.Chapter({
                        chapterid: chapterID,
                        bookid: bookID,
                        projectid: project.get('projectid'),
                        name: chapterName,
                        lastadapted: 0,
                        versecount: 0
                    });
                    chapters.add(chapter);
                    // set the lastDocument / lastAdapted<xxx> values if not already set
                    if (project.get('lastDocument') === "") {
                        project.set('lastDocument', bookName);
                    }
                    if (project.get('lastAdaptedBookID') === 0) {
                        project.set('lastAdaptedBookID', bookID);
                        project.set('lastAdaptedChapterID', chapterID);
                    }
                    if (project.get('lastAdaptedName') === "") {
                        project.set('lastAdaptedName', chapterName);
                    }
                    
                    // build SourcePhrases                    
                    arr = contents.replace(/\\/gi, " \\").split(spaceRE); // add space to make sure markers get put in a separate token
                    arrSP = contents.replace(/\\/gi, " \\").split(nonSpaceRE); // add space to make sure markers get put in a separate token
                    i = 0;
                    while (i < arr.length) {
                        // check for a marker
                        if (arr[i].indexOf("\\") === 0) {
                            // marker token
                            if (markers.length > 0) {
                                markers += " ";
                            }
                            markers += arr[i];
                            // If this is the start of a new paragraph, etc., check to see if there's a "dangling"
                            // punctuation mark. If so, it belongs as a follPunct of the precious SourcePhrase
                            if ((arr[i] === "\\p" || arr[i] === "\\c" || arr[i] === "\\v") && prepuncts.length > 0) {
                                sp.set("follpuncts", (sp.get("follpuncts") + prepuncts), {silent: true});
                                prepuncts = ""; // clear out the punctuation -- it's set on the previous sp now
                            }
                            // Check for markers with more than one token (and merge the two marker tokens)
                            if ((arr[i] === "\\x") || (arr[i] === "\\f") ||
                                    (arr[i] === "\\c") || (arr[i] === "\\ca") || (arr[i] === "\\cp") ||
                                    (arr[i] === "\\v") || (arr[i] === "\\va") || (arr[i] === "\\vp")) {
                                // join with the next
                                i++;
                                markers += " " + arr[i];
                            }
                            i++;
                        } else if (arr[i].length === 0) {
                            // nothing in this token -- skip
                            i++;
                        } else if (arr[i].length === 1 && puncts.indexOf(arr[i]) > -1) {
                            // punctuation token -- add to the prepuncts
                            prepuncts += arr[i];
                            i++;
                        } else if (arr[i].length === 2 && puncts.indexOf(arr[i]) > -1) {
                            // 2-char punctuation token -- add to the prepuncts
                            prepuncts += arr[i];
                            i++;
                        } else {
                            // "normal" sourcephrase token
                            // Before creating the sourcephrase, look to see if we need to create a chapter element
                            // (note that we've already created chapter 1, so skip it if we come across it)
                            // Also note that we don't do the new chapter if this is a Scripture portion
                            if (markers && markers.indexOf("\\c ") !== -1 && markers.indexOf("\\c 1 ") === -1 && isPortion === false) {
                                // update the last adapted for the previous chapter before closing it out
                                chapter.set('versecount', verseCount, {silent: true});
                                chapter.set('lastadapted', lastAdapted, {silent: true});
                                chapter.save();
                                verseCount = 0; // reset for the next chapter
                                lastAdapted = 0; // reset for the next chapter
                                stridx = markers.indexOf("\\c ") + 3;
                                if (markers.lastIndexOf(" ") < stridx) {
                                    // no space after the chapter # (it's the ending of the string)
                                    chapterName = i18n.t("view.lblChapterName", {bookName: bookName, chapterNumber: markers.substr(stridx)});
                                } else {
                                    // space after the chapter #
                                    chapterName = i18n.t("view.lblChapterName", {bookName: bookName, chapterNumber: markers.substr(stridx, markers.indexOf(" ", stridx) - stridx)});
                                }
                                chapterID = Underscore.uniqueId();
                                chaps.push(chapterID);
                                // create the new chapter
                                chapter = new chapModel.Chapter({
                                    chapterid: chapterID,
                                    bookid: bookID,
                                    projectid: project.get('projectid'),
                                    name: chapterName,
                                    lastadapted: 0,
                                    versecount: 0
                                });
                                chapters.add(chapter);
//                                console.log(chapterName + ": " + chapterID);
                            }
                            // also do some processing for verse markers
                            if (markers && markers.indexOf("\\v ") !== -1) {
                                verseCount++;
                                // check this sourcephrase for a target - if there is one, consider this verse adapted
                                // (note that we're only checking the FIRST sp of each verse, not EVERY sp in the verse)
                                if ($(this).attr('t')) {
                                    lastAdapted++;
                                }
                            }
                            s = arr[i];
                            // look for leading and trailing punctuation
                            // leading...
                            if (puncts.indexOf(arr[i].charAt(0)) > -1) {
                                // leading punct 
                                punctIdx = 0;
                                while (puncts.indexOf(arr[i].charAt(punctIdx)) > -1 && punctIdx < arr[i].length) {
                                    prepuncts += arr[i].charAt(punctIdx);
                                    punctIdx++;
                                }
                                // remove the punctuation from the "source" of the substring
                                s = s.substr(punctIdx);
                            }
                            if (s.length === 0) {
                                // it'a ALL punctuation -- jump to the next token
                                i++;
                            } else {
                                // not all punctuation -- check following punctuation, then create a sourcephrase
                                if (puncts.indexOf(s.charAt(s.length - 1)) > -1) {
                                    // trailing punct 
                                    punctIdx = s.length - 1;
                                    while (puncts.indexOf(s.charAt(punctIdx)) > -1 && punctIdx > 0) {
                                        follpuncts = s.charAt(punctIdx) + follpuncts;
                                        punctIdx--;
                                    }
                                    // remove the punctuation from the "source" of the substring
                                    s = s.substr(0, punctIdx + 1);
                                }
                                // Now create a new sourcephrase
                                spID = Underscore.uniqueId();
                                sp = new spModel.SourcePhrase({
                                    spid: spID,
                                    norder: norder,
                                    chapterid: chapterID,
                                    markers: markers,
                                    orig: null,
                                    prepuncts: prepuncts,
                                    midpuncts: midpuncts,
                                    follpuncts: follpuncts,
                                    source: s,
                                    target: ""
                                });
                                markers = "";
                                prepuncts = "";
                                follpuncts = "";
                                punctIdx = 0;
                                index++;
                                norder++;
                                sps.push(sp);
                                // if necessary, send the next batch of SourcePhrase INSERT transactions
                                if ((sps.length % MAX_BATCH) === 0) {
                                    deferreds.push(sourcePhrases.addBatch(sps.slice(sps.length - MAX_BATCH)));
                                }
                                i++;
                            }
                        }
                    }
                    // add any remaining sourcephrases
                    if ((sps.length % MAX_BATCH) > 0) {
                        $("#status").html(i18n.t("view.dscStatusSaving"));
                        deferreds.push(sourcePhrases.addBatch(sps.slice(sps.length - (sps.length % MAX_BATCH))));
                    }
                    // track all those deferred calls to addBatch -- when they all complete, report the results to the user
                    $.when.apply($, deferreds).done(function (value) {
                        importSuccess();
                    }).fail(function (e) {
                        importFail(e);
                    });
                    // update the last chapter's verseCount
                    chapter.set('versecount', verseCount, {silent: true});
                    chapter.save();
                    book.set('chapters', chaps, {silent: true});
                    book.save();
                    return true; // success
                    // END readUSFMDoc()
                };

                ///
                // END FILE TYPE READERS
                ///
                
                // read doc as appropriate
                if ((fileName.toLowerCase().indexOf(".usfm") > 0) || (fileName.toLowerCase().indexOf(".sfm") > 0)) {
                    result = readUSFMDoc(this.result);
                } else if (fileName.toLowerCase().indexOf(".usx") > 0) {
                    result = readUSXDoc(this.result);
                } else if (fileName.toLowerCase().indexOf(".xml") > 0) {
                    result = readXMLDoc(this.result);
                } else if (fileName.toLowerCase().indexOf(".txt") > 0) {
                    // .txt -- check to see if it's really USFM under the hood
                    // find the ID of this book
                    index = this.result.indexOf("\\id");
                    if (index >= 0) {
                        // _probably_ USFM under the hood -- at least try to read it as USFM
                        result = readUSFMDoc(this.result);
                    } else {
                        // not USFM -- try reading it as a text document
                        result = readTextDoc(this.result);
                    }
                } else {
                    // some other extension (or no extension) -- try reading it as a text document
                    result = readTextDoc(this.result);
                }
                if (result === false) {
                    importFail(new Error(errMsg));
                }
            };
            reader.readAsText(file);
        },
        
        // Helper method to export the given bookid to the specified file format.
        // Called from ExportDocumentView::onOK once the book, format and filename have been chosen.
        exportDocument = function (bookid, format, filename) {
            var status = "";
            var writer = null;
            var errMsg = "";
            var sourcephrases = null;
            var exportDirectory = "";
            var subdir = "AIM_Exports_";
            var tabLevel = 0;
            
            // Callback for when the file is imported / saved successfully
            var exportSuccess = function () {
                console.log("exportSuccess()");
                // update status
                $("#status").html(i18n.t("view.dscStatusExportSuccess", {document: filename}));
                // display the OK button
                $("#loading").hide();
                $("#waiting").hide();
                $("#OK").show();
                $("#OK").removeAttr("disabled");
            };
            // Callback for when the file failed to import
            var exportFail = function (e) {
                console.log("exportFail(): " + e.message);
                // update status
                $("#status").html(i18n.t("view.dscExportFailed", {document: filename, reason: e.message}));
                $("#loading").hide();
                $("#waiting").hide();
                // display the OK button
                $("#OK").show();
                $("#OK").removeAttr("disabled");
            };
            
            ///
            // FILE TYPE WRITERS
            // 2 loops for each file type -- a chapter and source phrase loop.
            // The AI XML export will dump out the entire book; the others use the following logic:
            // - If the chapter has at least some adaptations in it, we'll export it
            // - If we encounter the lastSPID, we'll break out of the export loop of the chapter.
            // This logic works well if the user is adapting sequentially. If the user is jumping around in their adaptations,
            // some chapters might have extraneous punctuation from areas where they haven't adapted.
            ///

            // Plain Text document
            // We assume these are just text with no markup,
            // in a single chapter (this could change if needed)
            var exportText = function () {
                var chapters = window.Application.ChapterList.where({bookid: bookid});
                var content = "";
                var spList = new spModel.SourcePhraseCollection();
                var markerList = new USFM.MarkerCollection();
                var i = 0;
                var idxFilters = 0;
                var value = null;
                var filterAry = window.Application.currentProject.get('FilterMarkers').split("\\");
                var lastSPID = window.Application.currentProject.get('lastAdaptedSPID');
                var chaptersLeft = chapters.length;
                var filtered = false;
                var needsEndMarker = "";
                var mkr = "";
                writer.onwriteend = function () {
                    console.log("write completed.");
                    if (chaptersLeft === 0) {
                        exportSuccess();
                    }
                };
                writer.onerror = function (e) {
                    console.log("write failed: " + e.toString());
                    exportFail(e);
                };
                // get the chapters belonging to our book
                markerList.fetch({reset: true, data: {name: ""}});
                console.log("markerList count: " + markerList.length);
                lastSPID = lastSPID.substring(lastSPID.lastIndexOf("-") + 1);
                console.log("filterAry: " + filterAry.toString());
                chapters.forEach(function (entry) {
                    // for each chapter with some adaptation done, get the sourcephrases
                    if (entry.get('lastadapted') !== 0) {
                        // add a placeholder string for this chapter, so that it ends up in order (the call to
                        // fetch() is async, and sometimes the chapters are returned out of order)
                        content += "**" + entry.get("chapterid") + "**";
                        spList.fetch({reset: true, data: {chapterid: entry.get("chapterid")}}).done(function () {
                            var chapterString = "";
                            console.log("spList: " + spList.length + " items, last id = " + lastSPID);
                            for (i = 0; i < spList.length; i++) {
                                value = spList.at(i);
                                // plain text -- we're not all that interested in formatting, but do add some
                                // line breaks for chapter, verse, paragraph marks
                                if ((value.get("markers").indexOf("\\c") > -1) || (value.get("markers").indexOf("\\v") > -1) ||
                                        (value.get("markers").indexOf("\\h") > -1) || (value.get("markers").indexOf("\\p") > -1)) {
                                    chapterString += "\n"; // newline
                                }
                                // check to see if this sourcephrase is filtered (only looking at the top level)
                                if (filtered === false) {
                                    for (idxFilters = 0; idxFilters < filterAry.length; idxFilters++) {
                                        // sanity check for blank filter strings
                                        if (filterAry[idxFilters].trim().length > 0) {
                                            if (value.get("markers").indexOf(filterAry[idxFilters]) >= 0) {
                                                // this is a filtered sourcephrase -- do not export it
                                                console.log("filtered: " + value.get("markers"));
                                                // if there is an end marker associated with this marker,
                                                // do not export any source phrases until we come across the end marker
                                                mkr = markerList.where({name: filterAry[idxFilters].trim()});
                                                if (mkr[0].get("endMarker")) {
                                                    needsEndMarker = mkr[0].get("endMarker");
                                                }
                                                filtered = true;
                                            }
                                        }
                                    }
                                }
                                if (value.get("markers").indexOf(needsEndMarker) >= 0) {
                                    // found our ending marker -- this sourcephrase is not filtered
                                    needsEndMarker = "";
                                    filtered = false;
                                }
                                if (filtered === false) {
                                    // only emit soursephrase pre/foll puncts if we have something translated in the target
                                    if (value.get("source").length > 0 && value.get("target").length > 0) {
                                        chapterString += value.get("prepuncts") + value.get("target") + value.get("follpuncts") + " ";
                                    }
                                }
                                if (value.get('spid') === lastSPID) {
                                    // done -- quit after this sourcePhrase
                                    console.log("Found last SPID: " + lastSPID);
                                    break;
                                }
                            }
                            // Now take the string from this chapter's sourcephrases that we've just built and
                            // insert them into the correct location in the file's content string
                            content = content.replace(("**" + entry.get("chapterid") + "**"), chapterString);
                            // decrement the chapter count, closing things out if needed
                            chaptersLeft--;
                            if (chaptersLeft === 0) {
                                console.log("finished within sp block");
                                // done with the chapters
                                if (isClipboard === true) {
                                    // write (copy) text to clipboard
                                    cordova.plugins.clipboard.copy(content);
                                    // done copying -- reset the clipboard flag
                                    isClipboard = false;
                                    // directly call success (it's a callback for the file writer)
                                    exportSuccess();
                                } else {
                                    // ** we are now done with all the chapters -- write out the file
                                    var blob = new Blob([content], {type: 'text/plain'});
                                    writer.write(blob);
                                }
                            }
                        });
                    } else {
                        // no sourcephrases to export -- just decrement the chapters, and close things out if needed
                        chaptersLeft--;
                        if (chaptersLeft === 0) {
                            console.log("finished in a blank block");
                            // done with the chapters
                            if (isClipboard === true) {
                                // write (copy) text to clipboard
                                cordova.plugins.clipboard.copy(content);
                                // done copying -- reset the clipboard flag
                                isClipboard = false;
                                // directly call success (it's a callback for the file writer)
                                exportSuccess();
                            } else {
                                var blob = new Blob([content], {type: 'text/plain'});
                                writer.write(blob);
                            }
                            content = ""; // clear out the content string
                        }
                    }
                });
            };

            // USFM document
            var exportUSFM = function () {
                var chapters = window.Application.ChapterList.where({bookid: bookid});
                var content = "";
                var spList = new spModel.SourcePhraseCollection();
                var markerList = new USFM.MarkerCollection();
                var markers = "";
                var i = 0;
                var idxFilters = 0;
                var value = null;
                var chaptersLeft = chapters.length;
                var filtered = false;
                var needsEndMarker = "";
                var mkr = "";
                var filterAry = window.Application.currentProject.get('FilterMarkers').split("\\");
                var lastSPID = window.Application.currentProject.get('lastAdaptedSPID');
                writer.onwriteend = function () {
                    console.log("write completed.");
                    if (chaptersLeft === 0) {
                        exportSuccess();
                    }
                };
                writer.onerror = function (e) {
                    console.log("write failed: " + e.toString());
                    exportFail(e);
                };
                markerList.fetch({reset: true, data: {name: ""}});
                console.log("markerList count: " + markerList.length);
                lastSPID = lastSPID.substring(lastSPID.lastIndexOf("-") + 1);
                chapters.forEach(function (entry) {
                    // for each chapter with some adaptation done, get the sourcephrases
                    if (entry.get('lastadapted') !== 0) {
                        // add a placeholder string for this chapter, so that it ends up in order (the call to
                        // fetch() is async, and sometimes the chapters are returned out of order)
                        content += "**" + entry.get("chapterid") + "**";
                        spList.fetch({reset: true, data: {chapterid: entry.get("chapterid")}}).done(function () {
                            var chapterString = "";
                            console.log("spList: " + spList.length + " items, last id = " + lastSPID);
                            for (i = 0; i < spList.length; i++) {
                                value = spList.at(i);
                                markers = value.get("markers");
                                // check to see if this sourcephrase is filtered (only looking at the top level)
                                if (filtered === false) {
                                    for (idxFilters = 0; idxFilters < filterAry.length; idxFilters++) {
                                        // sanity check for blank filter strings
                                        if (filterAry[idxFilters].trim().length > 0) {
                                            if (markers.indexOf(filterAry[idxFilters]) >= 0) {
                                                // this is a filtered sourcephrase -- do not export it
                                                console.log("filtered: " + markers);
                                                // however, if there are some markers before we hit our filtered one, 
                                                // make sure they get exported now
                                                markers = markers.substr(0, markers.indexOf(filterAry[idxFilters]) - 1);
                                                if (markers.length > 0) {
                                                    if ((markers.indexOf("\\v") > -1) || (markers.indexOf("\\c") > -1) ||
                                                            (markers.indexOf("\\p") > -1) || (markers.indexOf("\\id") > -1) ||
                                                            (markers.indexOf("\\h") > -1) || (markers.indexOf("\\toc") > -1) || (markers.indexOf("\\mt") > -1)) {
                                                        // pretty-printing -- add a newline so the output looks better
                                                        chapterString += "\n"; // newline
                                                    }
                                                    // now add the markers and a space
                                                    chapterString += markers + " ";
                                                }
                                                chapterString += (markers.substr(0, markers.indexOf(filterAry[idxFilters]))) + " ";
                                                // if there is an end marker associated with this marker,
                                                // do not export any source phrases until we come across the end marker
                                                mkr = markerList.where({name: filterAry[idxFilters].trim()});
                                                if (mkr[0].get("endMarker")) {
                                                    needsEndMarker = mkr[0].get("endMarker");
                                                }
                                                filtered = true;
                                            }
                                        }
                                    }
                                }
                                if ((needsEndMarker.length > 0) && (markers.indexOf(needsEndMarker) >= 0)) {
                                    // found our ending marker -- this sourcephrase is not filtered
                                    // first, remove the marker from the markers string so it doesn't print out
                                    markers = markers.replace(("\\" + needsEndMarker), '');
                                    // now clear our flags so the sourcephrase exports
                                    needsEndMarker = "";
                                    filtered = false;
                                }
                                if (filtered === false) {
                                    // add markers, and if needed, pretty-print the text on a newline
                                    if (markers.trim().length > 0) {
                                        if ((markers.indexOf("\\v") > -1) || (markers.indexOf("\\c") > -1) || (markers.indexOf("\\p") > -1) || (markers.indexOf("\\id") > -1) || (markers.indexOf("\\h") > -1) || (markers.indexOf("\\toc") > -1) || (markers.indexOf("\\mt") > -1)) {
                                            // pretty-printing -- add a newline so the output looks better
                                            chapterString += "\n"; // newline
                                        }
                                        // now add the markers and a space
                                        chapterString += markers + " ";
                                    }
                                    // only emit soursephrase pre/foll puncts if we have something translated in the target
                                    if (value.get("source").length > 0 && value.get("target").length > 0) {
                                        chapterString += value.get("prepuncts") + value.get("target") + value.get("follpuncts") + " ";
                                    }
                                }
                                if (value.get('spid') === lastSPID) {
                                    // done -- quit after this sourcePhrase
                                    console.log("Found last SPID: " + lastSPID);
                                    break;
                                }
                            }
                            // Now take the string from this chapter's sourcephrases that we've just built and
                            // insert them into the correct location in the file's content string
                            content = content.replace(("**" + entry.get("chapterid") + "**"), chapterString);
                            // decrement the chapter count, closing things out if needed
                            chaptersLeft--;
                            if (chaptersLeft === 0) {
                                console.log("finished within sp block");
                                // done with the chapters
                                if (isClipboard === true) {
                                    // write (copy) text to clipboard
                                    cordova.plugins.clipboard.copy(content);
                                    // done copying -- reset the clipboard flag
                                    isClipboard = false;
                                    // directly call success (it's a callback for the file writer)
                                    exportSuccess();
                                } else {
                                    // ** we are now done with all the chapters -- write out the file
                                    var blob = new Blob([content], {type: 'text/plain'});
                                    writer.write(blob);
                                }
                            }
                        });
                    } else {
                        // no sourcephrases to export -- just decrement the chapters, and close things out if needed
                        chaptersLeft--;
                        if (chaptersLeft === 0) {
                            console.log("finished in a blank block");
                            if (isClipboard === true) {
                                // write (copy) text to clipboard
                                cordova.plugins.clipboard.copy(content);
                                // done copying -- reset the clipboard flag
                                isClipboard = false;
                                // directly call success (it's a callback for the file writer)
                                exportSuccess();
                            } else {
                                // done with the chapters
                                var blob = new Blob([content], {type: 'text/plain'});
                                writer.write(blob);
                            }
                            content = ""; // clear out the content string
                        }
                    }
                });
            };

            // USX document
            var exportUSX = function () {
                var chapters = window.Application.ChapterList.where({bookid: bookid});
                var book = window.Application.BookList.where({bookid: bookid})[0];
                var bookID = book.get('scrid');
                var content = "";
                var XML_PROLOG = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
                var spList = new spModel.SourcePhraseCollection();
                var markerList = new USFM.MarkerCollection();
                var filterAry = window.Application.currentProject.get('FilterMarkers').split("\\");
                var lastSPID = window.Application.currentProject.get('lastAdaptedSPID');
                var filtered = false;
                var exportMarkers = false;
                var needsEndMarker = "";
                var markers = "";
                var i = 0;
                var idxFilters = 0;
                var versenum = 1;
                var closeNode = ""; // holds ending string for <para> and <book> XML nodes
                var value = null;
                var mkr = "";
                var chaptersLeft = chapters.length;
                writer.onwriteend = function () {
                    console.log("write completed.");
                    if (chaptersLeft === 0) {
                        exportSuccess();
                    }
                };
                writer.onerror = function (e) {
                    console.log("write failed: " + e.toString());
                    exportFail(e);
                };
                // starting material -- xml prolog and usx tag
                // using USX 2.5 (https://github.com/ubsicap/usx/releases/tag/v2.5)
                content = XML_PROLOG + "\n<usx version=\"2.5\">\n";
                // get the chapters belonging to our book
                markerList.fetch({reset: true, data: {name: ""}});
                console.log("markerList count: " + markerList.length);
                lastSPID = lastSPID.substring(lastSPID.lastIndexOf("-") + 1);
                chapters.forEach(function (entry) {
                    // for each chapter with some adaptation done, get the sourcephrases
                    if (entry.get('lastadapted') !== 0) {
                        // add a placeholder string for this chapter, so that it ends up in order (the call to
                        // fetch() is async, and sometimes the chapters are returned out of order)
                        content += "**" + entry.get("chapterid") + "**";
                        spList.fetch({reset: true, data: {chapterid: entry.get("chapterid")}}).done(function () {
                            var chapterString = "";
                            console.log("spList: " + spList.length + " items, last id = " + lastSPID);
                            for (i = 0; i < spList.length; i++) {
                                value = spList.at(i);
                                markers = value.get("markers");
                                if (filtered === true && markers.length > 0 && needsEndMarker.length === 0) {
                                    // hit the next strip; this is an implicit end to the filtering (there's no end marker)
                                    filtered = false;
                                }
                                // check to see if this sourcephrase is filtered (only looking at the top level)
                                if (filtered === false) {
                                    for (idxFilters = 0; idxFilters < filterAry.length; idxFilters++) {
                                        // sanity check for blank filter strings
                                        if (filterAry[idxFilters].trim().length > 0) {
                                            if (markers.indexOf(filterAry[idxFilters].trim()) >= 0) {
                                                // this is a filtered sourcephrase -- do not export it
                                                // if there is an end marker associated with this marker,
                                                // do not export any source phrases until we come across the end marker
                                                mkr = markerList.where({name: filterAry[idxFilters].trim()});
                                                if (mkr[0].get("endMarker")) {
                                                    needsEndMarker = mkr[0].get("endMarker");
                                                }
                                                filtered = true;
                                                console.log("filtered: " + markers + ", needsEndMarker: " + needsEndMarker);
                                                // We have a couple exceptions to the filter:
                                                // - if the ending marker is in the same marker string, clear the filter flag
                                                // - if there are markers before the filtered marker, export them
                                                if ((needsEndMarker.length > 0) && (markers.indexOf(needsEndMarker) >= 0)) {
                                                    // found our ending marker -- this sourcephrase is not filtered
                                                    // first, remove the marker from the markers string so it doesn't print out
                                                    markers = markers.replace(("\\" + needsEndMarker), '');
                                                    // now clear our flags so the sourcephrase exports
                                                    needsEndMarker = "";
                                                    filtered = false;
                                                } else {
                                                    markers = markers.substr(0, markers.indexOf(filterAry[idxFilters].trim()) - 1);
                                                    if (markers.length > 0) {
                                                        // some markers before we hit the filtered marker -- export them
                                                        exportMarkers = true;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                if ((needsEndMarker.length > 0) && (markers.indexOf(needsEndMarker) >= 0)) {
                                    // found our ending marker -- this sourcephrase is not filtered
                                    // first, remove the marker from the markers string so it doesn't print out
                                    markers = markers.replace(("\\" + needsEndMarker), '');
                                    // now clear our flags so the sourcephrase exports
                                    needsEndMarker = "";
                                    filtered = false;
                                }
                                if (filtered === false || exportMarkers === true) {
                                    // Export the markers
                                    if (markers.length > 0) {
                                        // <book> id
                                        if ((markers.indexOf("\\id ")) > -1) {
                                            chapterString += "<book code=\"" + bookID + "\" style=\"id\"";
                                            if (markers.lastIndexOf("\\") === markers.indexOf("\\id")) {
                                                chapterString += ">" + value.get("target");
                                                // this is a simple \\id marker -- more inner text could follow, 
                                                // so set the closeNode and skip to the next item
                                                closeNode = "</book>";
                                                continue; // skip to the next entry
                                            } else {
                                                // there are more markers after the \\id -- close out the <book> elt and keep processing
                                                closeNode = "";
                                                chapterString += " />\n";
                                            }
                                        }
                                        // <chapter>
                                        if (markers.indexOf("\\c ") > -1) {
                                            if (closeNode.length > 0) {
                                                chapterString += closeNode;
                                                closeNode = ""; // clear it out
                                            }
                                            var chpos = markers.indexOf("\\c ");
                                            chapterString += "\n<chapter number=\"";
                                            chapterString += markers.substr(chpos + 3, (markers.indexOf(" ", chpos + 3) - (chpos + 3)));
                                            if (markers.indexOf("\\cp") > -1) {
                                                // publishing numbering
                                                var cppos = markers.indexOf("\\cp");
                                                chapterString += "\" pubnumber=\"";
                                                if (markers.indexOf("\\", cppos + 3) < 0) {
                                                    chapterString += markers.substr(cppos + 4);
                                                } else {
                                                    chapterString += markers.substr(cppos + 4, (markers.indexOf("\\", cppos + 4) - (cppos + 4)));
                                                }
                                            }
                                            if (markers.indexOf("\\ca") > -1) {
                                                // publishing numbering
                                                var capos = markers.indexOf("\\ca");
                                                chapterString += "\" altnumber=\"";
                                                if (markers.indexOf("\\", capos + 3) < 0) {
                                                    chapterString += markers.substr(capos + 4);
                                                } else {
                                                    chapterString += markers.substr(capos + 4, (markers.indexOf("\\", capos + 4) - (capos + 4)));
                                                }
                                            }
                                            chapterString += "\" style=\"c\" />";
                                        }
                                        // other <para> styles
                                        if (markers.indexOf("\\b ") > -1) {
                                            if (closeNode.length > 0) {
                                                chapterString += closeNode;
                                                closeNode = ""; // clear it out
                                            }
                                            chapterString += "\n<para style=\"b\" />";
                                        }
                                        if ((markers.indexOf("\\p") > -1) || (markers.indexOf("\\q") > -1) || (markers.indexOf("\\ide") > -1) || (markers.indexOf("\\cl") > -1) || (markers.indexOf("\\h") > -1) || (markers.indexOf("\\m") > -1) || (markers.indexOf("\\imt") > -1) || (markers.indexOf("\\rem") > -1) || (markers.indexOf("\\toc") > -1)) {
                                            if (closeNode.length > 0) {
                                                chapterString += closeNode;
                                            }
                                            chapterString += "\n<para style=\"";
                                            if (markers.indexOf("\\p") > -1) {
                                                var ppos = markers.indexOf("\\p");
                                                if (markers.indexOf(" ", ppos) > -1) {
                                                    chapterString += markers.substring(ppos + 1, (markers.indexOf(" ", ppos)));
                                                } else {
                                                    chapterString += markers.substr(ppos + 1);
                                                }
                                            } else if (markers.indexOf("\\q") > -1) {
                                                // extract out what kind of quote this is (e.g., "q2") - this goes in the style attribute
                                                var qpos = markers.indexOf("\\q");
                                                if (markers.indexOf(" ", qpos) > -1) {
                                                    chapterString += markers.substring(qpos + 1, (markers.indexOf(" ", qpos)));
                                                } else {
                                                    chapterString += markers.substr(qpos + 1);
                                                }
                                            } else if (markers.indexOf("\\cl") > -1) {
                                                // extract out what kind of quote this is (e.g., "q2") - this goes in the style attribute
                                                chapterString += "cl";
                                            } else if (markers.indexOf("\\ide") > -1) {
                                                chapterString += "ide";
                                            } else if (markers.indexOf("\\h") > -1) {
                                                var hpos = markers.indexOf("\\h");
                                                if (markers.indexOf(" ", hpos) > -1) {
                                                    chapterString += markers.substring(hpos + 1, (markers.indexOf(" ", hpos)));
                                                } else {
                                                    chapterString += markers.substr(hpos + 1);
                                                }
                                            } else if (markers.indexOf("\\rem") > -1) {
                                                chapterString += "rem";
                                            } else if (markers.indexOf("\\imt") > -1) {
                                                // extract out what kind this is (e.g., "imt2") - 
                                                // this goes in the style attribute
                                                var imtpos = markers.indexOf("\\imt");
                                                if (markers.indexOf(" ", imtpos) > -1) {
                                                    chapterString += markers.substring(imtpos + 1, (markers.indexOf(" ", imtpos)));
                                                } else {
                                                    chapterString += markers.substr(imtpos + 1);
                                                }
                                            } else if (markers.indexOf("\\m") > -1) {
                                                // extract out what kind this is (e.g., "m" or "mt2", etc.) - 
                                                // this goes in the style attribute
                                                var mpos = markers.indexOf("\\m");
                                                if (markers.indexOf(" ", mpos) > -1) {
                                                    chapterString += markers.substring(mpos + 1, (markers.indexOf(" ", mpos)));
                                                } else {
                                                    chapterString += markers.substr(mpos + 1);
                                                }
                                            } else if (markers.indexOf("\\toc") > -1) {
                                                // extract out what kind this is (e.g., "toc2") - 
                                                // this goes in the style attribute
                                                var tocpos = markers.indexOf("\\toc");
                                                if (markers.indexOf(" ", tocpos) > -1) {
                                                    chapterString += markers.substring(tocpos + 1, (markers.indexOf(" ", tocpos)));
                                                } else {
                                                    chapterString += markers.substr(tocpos + 1);
                                                }
                                            }
                                            chapterString += "\">";
                                            closeNode = "</para>";
                                        }
//                                        if (markers.indexOf("\\+ ") > -1) {
//                                            chapterString += "<note caller=\"+\" style=\"f\">";
//                                        }
                                        // <verse>
                                        if (markers.indexOf("\\v ") > -1) {
                                            var vpos = markers.indexOf("\\v ");
                                            chapterString += "<verse number=\"";
                                            if (markers.indexOf(" ", vpos + 3) > -1) {
                                                chapterString += markers.substring(vpos + 3, (markers.indexOf(" ", vpos + 3)));
                                            } else {
                                                chapterString += markers.substr(vpos + 3);
                                            }
                                            chapterString += "\" style=\"v";
                                            if (markers.indexOf("\\vp") > -1) {
                                                // publishing numbering
                                                var vppos = markers.indexOf("\\vp");
                                                chapterString += "\" pubnumber=\"";
                                                if (markers.indexOf("\\", vppos + 3) < 0) {
                                                    chapterString += markers.substr(vppos + 4);
                                                } else {
                                                    chapterString += markers.substr(vppos + 4, (markers.indexOf("\\", vppos + 4) - (vppos + 4)));
                                                }
                                            }
                                            if (markers.indexOf("\\va") > -1) {
                                                // publishing numbering
                                                var vapos = markers.indexOf("\\va");
                                                chapterString += "\" altnumber=\"";
                                                if (markers.indexOf("\\", vapos + 3) < 0) {
                                                    chapterString += markers.substr(vapos + 4);
                                                } else {
                                                    chapterString += markers.substr(vapos + 4, (markers.indexOf("\\", vapos + 4) - (vapos + 4)));
                                                }
                                            }
                                            chapterString += "\" />";
                                        }
                                    }
                                    if (exportMarkers === true) {
                                        // done exporting the marker subset before the filtered marker -- clear our flag
                                        exportMarkers = false;
                                    }
                                    if (filtered === false) {
                                        // only export the text if not filtered AND
                                        // only emit soursephrase pre/foll puncts if we have something translated in the target
                                        if (value.get("source").length > 0 && value.get("target").length > 0) {
                                            chapterString += value.get("prepuncts") + value.get("target") + value.get("follpuncts") + " ";
                                        }
                                    }
                                }
                                // done dealing with the source phrase -- is it the last one?
                                if (value.get('spid') === lastSPID) {
                                    // last phrase -- exit
                                    console.log("Found last SPID: " + lastSPID);
                                    break;
                                }
                            }
                            // Now take the string from this chapter's sourcephrases that we've just built and
                            // insert them into the correct location in the file's content string
                            content = content.replace(("**" + entry.get("chapterid") + "**"), chapterString);
                            // decrement the chapter count, closing things out if needed
                            chaptersLeft--;
                            if (chaptersLeft === 0) {
                                console.log("finished within sp block");
                                // done with the chapters
                                // add a closing paragraph if necessary
                                if (closeNode.length > 0) {
                                    content += closeNode;
                                }
                                // add the ending node
                                content += "\n</usx>\n";
                                if (isClipboard === true) {
                                    // write (copy) text to clipboard
                                    cordova.plugins.clipboard.copy(content);
                                    // done copying -- reset the clipboard flag
                                    isClipboard = false;
                                    // directly call success (it's a callback for the file writer)
                                    exportSuccess();
                                } else {
                                    // ** we are now done with all the chapters -- write out the file
                                    var blob = new Blob([content], {type: 'text/plain'});
                                    writer.write(blob);
                                }
                            }
                        });
                    } else {
                        // BUGBUG: can we end up here if there are chapters?
                        // no sourcephrases to export -- just decrement the chapters, and close things out if needed
                        chaptersLeft--;
                        if (chaptersLeft === 0) {
                            console.log("finished in a blank block");
                            // done with the chapters
                            // add a closing paragraph if necessary
                            if (closeNode.length > 0) {
                                content += closeNode;
                            }
                            // add the ending node
                            content += "\n</usx>\n";
                            if (isClipboard === true) {
                                // write (copy) text to clipboard
                                cordova.plugins.clipboard.copy(content);
                                // done copying -- reset the clipboard flag
                                isClipboard = false;
                                // directly call success (it's a callback for the file writer)
                                exportSuccess();
                            } else {
                                var blob = new Blob([content], {type: 'text/plain'});
                                writer.write(blob);
                            }
                            content = ""; // clear out the content string for the next chapter
                        }
                    }
                });
            };

            // XML document
            // Note that this export is a full dump of the document, not just the parts that have been adapted.
            // This is because we're exporting the source as well as the target text.
            // EDB 8/13/16: partially working. Still need:
            // - ~FILTER text folded in
            // -- lower priority, but need for AI compatibility: other bits implemented
            var exportXML = function () {
                var chapters = window.Application.ChapterList.where({bookid: bookid});
                var book = window.Application.BookList.where({bookid: bookid});
                var markerList = new USFM.MarkerCollection();
                var filterAry = window.Application.currentProject.get('FilterMarkers').split("\\");
                var content = "";
                var words = [];
                var XML_PROLOG = "<?xml version=\"1.0\" encoding=\"utf-8\" standalone=\"yes\"?>";
                var spList = new spModel.SourcePhraseCollection();
                var markers = "";
                var filtered = false;
                var exportMarkers = false;
                var needsEndMarker = "";
                var cNum = "";
                var vNum = "";
                var i = 0;
                var idxFilters = 0;
                var sn = 0;
                var fi = "";
                var curTY = "2";
                var lastTY = "2";
                var value = null;
                var mkr = null;
                var atts = {
                    name: [],
                    value: []
                };
                var project = window.Application.currentProject;
                var chaptersLeft = chapters.length;
                var hexToWXColor = function (color) {
                    // AIM (.html) --> #rrggbb  (in hex)
                    // Adapt It  --> 0x00bbggrr (in base 10)
                    console.log("hexToWXColor - input: " + color);
                    var result = "0x00";
                    result += color.substr(5, 2); // bb
                    result += color.substr(3, 2); // gg
                    result += color.substr(1, 2); // rr
                    var tmpInt = parseInt(result, 16);
                    result = tmpInt.toString(10);
                    console.log("hexToWXColor - output: " + result);
                    return result;
                };
                var buildFlags = function (sourcephrase) {
                    var markers = sourcephrase.get("markers");
                    // (code in XML.cpp ~ line 5568)
                    var val = "";
                    val += "0"; // unused (22)
                    val += (markers.indexOf("\\f*") >= 0) ? "1" : "0"; // footnote end (21)
                    val += (markers.indexOf("\\f ") >= 0) ? "1" : "0"; // footnote (20)
                    val += "00"; // internal markers / punctuation (19/18)
                    val += (markers.indexOf("\\c ") >= 0) ? "1" : "0"; // chapter mask (17)
                    val += (markers.indexOf("\\v ") >= 0) ? "1" : "0"; // verse mask (16)
                    val += "0"; // sectionByVerse (15)
                    val += (markers.indexOf("\\n ") >= 0) ? "1" : "0"; // note mask (14)
                    val += "000"; // free translation masks (11-13)
                    val += "000"; // retranslation masks (8-10)
                    val += "0"; // null source phrase (7)
                    val += "00"; // boundary masks (5-6)
                    val += (markers.indexOf("\\s ") >= 0) ? "1" : "0"; // special text (4)
                    val += "0"; // glossing KB entry (3)
                    val += "00"; // KB entries (1-2)
                    //val += (sourcephrase.get)
                    return val;
                };
                var buildTY = function (sourcephrase, lastTY) {
                    console.log("buildTY");
                    // (code in SourcePhrase.h ~ line 55 / CAdaptIt_Doc.cpp - line 18859)
                    var val = (lastTY.length > 0) ? lastTY : "1"; // default -- last type (verse if not there)
                    var markers = sourcephrase.get("markers");
                    if (markers.indexOf("\\v ") >= 0) {
                        val = "1"; // verse
                    }
                    if (markers.indexOf("\\p ") >= 0) {
                        val = "2"; // poetry
                    }
                    if (markers.indexOf("\\s ") >= 0) {
                        val = "3"; // section head
                    }
                    if ((markers.indexOf("\\mt2") >= 0) || (markers.indexOf("\\mt3") >= 0) || (markers.indexOf("\\mt4") >= 0)) {
                        val = "4"; // secondary title
                    }
                    if (markers.indexOf("\\f ") >= 0) {
                        // ord, bd, it, em, bdit, sc, pro, ior, w, wr, wh, wg, ndx, k, pn, qs, fk, xk
                        val = "6"; // none
                    }
                    if (markers.indexOf("\\f ") >= 0) {
                        val = "9"; // footnote
                    }
                    if ((markers.indexOf("\\h2") >= 0) || (markers.indexOf("\\h3") >= 0) || (markers.indexOf("\\h4") >= 0)) {
                        val = "10"; // header
                    }
                    if (markers.indexOf("\\id") >= 0) {
                        val = "11"; // identification
                    }
                    if (markers.indexOf("\\ref ") >= 0) {
                        val = "32"; // right Margin reference
                    }
                    if (markers.indexOf("\\cr ") >= 0) {
                        val = "33"; // cross reference
                    }
                    if (markers.indexOf("\\n ") >= 0) {
                        val = "34"; // note
                    }
                    return val;
                };
                writer.onwriteend = function () {
                    console.log("write completed.");
                    if (chaptersLeft === 0) {
                        exportSuccess();
                    }
                };
                writer.onerror = function (e) {
                    console.log("write failed: " + e.toString());
                    exportFail(e);
                };
                // build the USFM marker list
                markerList.fetch({reset: true, data: {name: ""}});
                console.log("markerList count: " + markerList.length);
                // opening content
                content = XML_PROLOG;
                content += "\n<!--\n     Note: Using Microsoft WORD 2003 or later is not a good way to edit this xml file.\n     Instead, use NotePad or WordPad. -->\n<AdaptItDoc>\n";
                // Settings: AIM doesn't do per-document settings; just copy over the project settings
                content += "<Settings docVersion=\"9\" bookName=\"" + bookName + "\" owner=\"";
                if (window.sqlitePlugin) {
                    content += device.uuid;
                } else {
                    content += "Browser";
                }
                content += "\" commitcnt=\"****\" revdate=\"\" actseqnum=\"0\" sizex=\"553\" sizey=\"62464\" ftsbp=\"1\"";
                // colors
                content += " specialcolor=\"" + hexToWXColor(project.get('SpecialTextColor')) + "\" retranscolor=\"" + hexToWXColor(project.get('RetranslationColor')) + "\" navcolor=\"" + hexToWXColor(project.get('NavigationColor')) + "\"";
                // project info
                content += " curchap=\"1:\" srcname=\"" + project.get('SourceLanguageName') + "\" tgtname=\"" + project.get('TargetLanguageName') + "\" srccode=\"" + project.get('SourceLanguageCode') + "\" tgtcode=\"" + project.get('TargetLanguageCode') + "\"";
                // filtering
                content += " others=\"@#@#:F:-1:0:";
                content += project.get('FilterMarkers');
                content += "::\"/>\n";
                // END settings xml node
                // CONTENT PART: get the chapters belonging to our book
                chapters.forEach(function (entry) {
                    // add a placeholder string for this chapter, so that it ends up in order (the call to
                    // fetch() is async, and sometimes the chapters are returned out of order)
                    content += "**" + entry.get("chapterid") + "**";
                    // for each chapter (regardless of whether there's some adaptation done), get the sourcephrases
                    spList.fetch({reset: true, data: {chapterid: entry.get("chapterid")}}).done(function () {
                        var chapterString = "";
                        var addLF = false;
                        for (i = 0; i < spList.length; i++) {
                            value = spList.at(i);
                            markers = value.get("markers");
                            // before we begin -- do some checks for filtered sourcephrases
                            // With the XML export, filtered text is exported in the "fi" attribute. We'll collect all the filtered
                            // text and markers in that attribute, and then export the attribute with the first non-filtered string.
                            if (filtered === true && markers.length > 0 && needsEndMarker.length === 0) {
                                // hit the next strip; this is an implicit end to the filtering (there's no end marker)
                                filtered = false;
                                fi += " \\~FILTER*";
                            }
                            // check to see if this sourcephrase is filtered (only looking at the top level)
                            if (filtered === false) {
                                for (idxFilters = 0; idxFilters < filterAry.length; idxFilters++) {
                                    // sanity check for blank filter strings
                                    if (filterAry[idxFilters].trim().length > 0) {
                                        if (markers.indexOf(filterAry[idxFilters].trim()) >= 0) {
                                            // this is a filtered sourcephrase -- do not export it; add it to the "fi" variable
                                            // if there is an end marker associated with this marker,
                                            // do not export any source phrases until we come across the end marker
                                            mkr = markerList.where({name: filterAry[idxFilters].trim()});
                                            if (mkr[0].get("endMarker")) {
                                                needsEndMarker = mkr[0].get("endMarker");
                                            }
                                            filtered = true;
                                            fi = "\\~FILTER ";
                                            console.log("filtered: " + markers + ", needsEndMarker: " + needsEndMarker);
                                            // We have a couple exceptions to the filter:
                                            // - if the ending marker is in the same marker string, clear the filter flag
                                            // - if there are markers before the filtered marker, export them
                                            if ((needsEndMarker.length > 0) && (markers.indexOf(needsEndMarker) >= 0)) {
                                                // found our ending marker -- this sourcephrase is not filtered
                                                // first, remove the marker from the markers string so it doesn't print out
                                                markers = markers.replace(("\\" + needsEndMarker), '');
                                                // now clear our flags so the sourcephrase exports
                                                needsEndMarker = "";
                                                filtered = false;
                                                // build the rest of the fi string
                                                fi += markers + value.get("prepuncts") + value.get("source") + value.get("follpuncts") + " \\~FILTER*";
                                            }
//                                            else {
//                                                markers = markers.substr(0, markers.indexOf(filterAry[idxFilters].trim()) - 1);
//                                                if (markers.length > 0) {
//                                                    // some markers before we hit the filtered marker -- export them
//                                                    exportMarkers = true;
//                                                }
//                                            }
                                        }
                                    }
                                }
                            }
                            if ((needsEndMarker.length > 0) && (markers.indexOf(needsEndMarker) >= 0)) {
                                // found our ending marker
                                // add this sourcephrase to the filter string, with the end marker last (with no space before it)
                                fi += value.get("prepuncts") + value.get("source") + value.get("follpuncts") + markers + " " + "\\~FILTER*";
                                // clear our flags so the next sourcephrase exports
                                needsEndMarker = "";
                                filtered = false;
                                continue;
                            }
                            if (filtered === true) {
                                // add this sourcephrase to the filter string
                                fi += markers + " " + value.get("prepuncts") + value.get("source") + value.get("follpuncts") + " ";
                            }
                            if (filtered === false) {
                                // format for <S> nodes found in CSourcePhrase::MakeXML (SourcePhrase.cpp)
                                // line 1 -- source, key, target, adaptation
                                chapterString += "<S s=\"";
                                if (value.get("prepuncts").length > 0) {
                                    chapterString += Underscore.escape(value.get("prepuncts"));
                                }
                                chapterString += value.get("source");
                                if (value.get("follpuncts").length > 0) {
                                    chapterString += Underscore.escape(value.get("follpuncts"));
                                }
                                chapterString += "\" k=\"" + value.get("source") + "\"";
                                if (value.get("target").length > 0) {
                                    chapterString += " t=\"" + value.get("target") + "\" a=\"";
                                    if (value.get("follpuncts").length > 0) {
                                        // the "a" attribute does not include following punctuation
                                        chapterString += value.get("target").substr(0, value.get("target").indexOf(value.get("follpuncts")));
                                    } else {
                                        chapterString += value.get("target");
                                    }
                                    // extract any trailiing punct for the "a" attribute
                                    chapterString += "\"";
                                }
                                // line 2 -- flags, sequNumber, SrcWords, TextType
                                chapterString += "\n f=\"";
                                if (value.get("flags").length > 0) {
                                    chapterString += value.get("flags");
                                } else {
                                    chapterString += buildFlags(value);
                                }
                                chapterString += "\" sn=\"" + sn;
                                sn++; // increment our counter
                                words = value.get("source").match(/\S+/g);
                                if (words) {
                                    chapterString += "\" w=\"" + words.length + "\"";
                                } else {
                                    chapterString += "\" w=\"1\"";
                                }
                                if (value.get("srcwordbreak").length > 0) {
                                    // this doc was imported from AI -- just copy over the existing ty value
                                    curTY = value.get("texttype");
                                } else {
                                    // this doc didn't come form AI -- need to build the ty value
                                    curTY = buildTY(value, lastTY);
                                }
                                chapterString += " ty=\"" + curTY + "\"";
                                lastTY = curTY; // for the next item
                                // line 3 -- 6 atts (optional)
                                addLF = true;
                                if (value.get("prepuncts").length > 0) {
                                    if (addLF === true) {
                                        chapterString += "\n";
                                        addLF = false;
                                    }
                                    chapterString += " pp=\"" + Underscore.escape(value.get("prepuncts")) + "\"";
                                }
                                if (value.get("follpuncts").length > 0) {
                                    if (addLF === true) {
                                        chapterString += "\n";
                                        addLF = false;
                                    }
                                    chapterString += " fp=\"" + Underscore.escape(value.get("follpuncts")) + "\"";
                                }
                                // inform marker
                                var markerAry = markers.split("\\");
                                var idxMkr = 0;
                                var inform = markers;
                                for (idxMkr = 0; idxMkr < markerAry.length; idxMkr++) {
                                    // sanity check for blank filter strings
                                    if ((markerAry[idxMkr].trim().length > 0) && markerAry[idxMkr].trim() !== "p") {
                                        mkr = markerList.where({name: markerAry[idxMkr].trim()})[0];
                                        if (mkr && mkr.get('inform') === "1") {
                                            if (mkr.get('navigationText')) {
                                                inform = mkr.get('navigationText');
                                            }
                                            if (addLF === true) {
                                                chapterString += "\n";
                                                addLF = false;
                                            }
                                            chapterString += " i=\"" + inform + "\"";
                                        }
                                    }
                                }
                                if (markers.indexOf("\\v") > -1) {
                                    if (addLF === true) {
                                        chapterString += "\n";
                                        addLF = false;
                                    }
                                    if (markers.indexOf(" ", markers.indexOf("\\v") + 3) > 0) {
                                        // embedded verse number -- go to the next space
                                        vNum = markers.substr(markers.indexOf("\\v") + 3, markers.indexOf(" ", markers.indexOf("\\v") + 3)).trim();
                                    } else {
                                        // last marker -- just take the rest of the string
                                        vNum = markers.substr(markers.indexOf("\\v") + 3);
                                    }
                                    cNum = entry.get("name").substr(entry.get("name").lastIndexOf(" ") + 1);
                                    // add chapter/verse (c:v)
                                    chapterString += " c=\"" + cNum + ":" + vNum + "\"";
                                }
                                // line 4 -- markers, end markers, inline binding markers, inline binding end markers,
                                //           inline nonbinding markers, inline nonbinding end markers
                                addLF = true;
                                if (markers.length > 0) {
                                    if (addLF === true) {
                                        chapterString += "\n";
                                        addLF = false;
                                    }
                                    chapterString += "m=\"" + markers + "\"";
                                }
                                // line 5-8 -- free translation, note, back translation, filtered info
                                addLF = true;
                                if (value.get("freetrans").length > 0) {
                                    if (addLF === true) {
                                        chapterString += "\n";
                                        addLF = false;
                                    }
                                    chapterString += "ft=\"" + value.get("freetrans") + "\"";
                                }
                                addLF = true;
                                if (value.get("note").length > 0) {
                                    if (addLF === true) {
                                        chapterString += "\n";
                                        addLF = false;
                                    }
                                    chapterString += "no=\"" + value.get("note") + "\"";
                                }
                                addLF = true;
                                if (fi.length > 0) {
                                    if (addLF === true) {
                                        chapterString += "\n";
                                        addLF = false;
                                    }
                                    chapterString += "fi=\"" + Underscore.escape(fi) + "\"";
                                    fi = ""; // clear out filter string
                                }
                                // line 9 -- lapat, tmpat, gmpat, pupat
    //                            chapterString += ">";
                                // 3 more possible info types
                                // medial puncts, medial markers, saved words (another <s>)
                                if (value.get("midpuncts").length > 0) {
                                    chapterString += "\n<MP mp=\"" + value.get("midpuncts") + "\"/>";
                                }
                                // line 10 -- source word break (swbk), target word break (twbk)
                                addLF = true;
                                if (value.get("srcwordbreak").length > 0) {
                                    if (addLF === true) {
                                        chapterString += "\n";
                                        addLF = false;
                                    }
                                    chapterString += "swbk=\"" + value.get("srcwordbreak") + "\"";
                                }
                                if (value.get("tgtwordbreak").length > 0) {
                                    if (addLF === true) {
                                        chapterString += "\n";
                                        addLF = false;
                                    }
                                    chapterString += "twbk=\"" + value.get("tgtwordbreak") + "\"";
                                }
                                chapterString += ">";
                                chapterString += "\n</S>\n";
                            }
                        }
                        // Now take the string from this chapter's sourcephrases that we've just built and
                        // insert them into the correct location in the file's content string
                        content = content.replace(("**" + entry.get("chapterid") + "**"), chapterString);
                        chaptersLeft--;
                        if (chaptersLeft === 0) {
                            // done with the chapters -- add the ending node
                            content += "</AdaptItDoc>\n";
                            if (isClipboard === true) {
                                // write (copy) text to clipboard
                                cordova.plugins.clipboard.copy(content);
                                // done copying -- reset the clipboard flag
                                isClipboard = false;
                                // directly call success (it's a callback for the file writer)
                                exportSuccess();
                            } else {
                                var blob = new Blob([content], {type: 'text/plain'});
                                writer.write(blob);
                            }
                            content = ""; // clear out the content string for the next chapter
                        }
                    });
                });
            };
            
            // add the project's target language code to the subdirectory
            subdir += window.Application.currentProject.get("TargetLanguageCode");

            if (window.sqlitePlugin) {
                // mobile device
                if (cordova.file.documentsDirectory !== null) {
                    // iOS, OSX
                    exportDirectory = cordova.file.documentsDirectory;
                } else if (cordova.file.sharedDirectory !== null) {
                    // BB10
                    exportDirectory = cordova.file.sharedDirectory;
                } else if (cordova.file.externalRootDirectory !== null) {
                    // Android, BB10
                    exportDirectory = cordova.file.externalRootDirectory;
                } else {
                    // iOS, Android, BlackBerry 10, windows
                    exportDirectory = cordova.file.DataDirectory;
                }
                window.resolveLocalFileSystemURL(exportDirectory, function (directoryEntry) {
                    console.log("Got directoryEntry. Attempting to open / create subdirectory:" + subdir);
                    directoryEntry.getDirectory(subdir, {create: true}, function (subdirEntry) {
                        subdirEntry.getFile(filename, {create: true}, function (fileEntry) {
                            console.log("Got fileEntry for: " + filename);
                            fileEntry.createWriter(function (fileWriter) {
                                console.log("Got fileWriter");
                                writer = fileWriter;
                                // now export based on the specified format
                                switch (format) {
                                case FileTypeEnum.TXT:
                                    exportText();
                                    break;
                                case FileTypeEnum.USFM:
                                    exportUSFM();
                                    break;
                                case FileTypeEnum.USX:
                                    exportUSX();
                                    break;
                                case FileTypeEnum.XML:
                                    exportXML();
                                    break;
                                }
                            }, exportFail);
                        }, exportFail);
                    }, exportFail);
                }, exportFail);
            } else {
                // browser
                var requestedBytes = 10 * 1024 * 1024; // 10MB
                window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
                navigator.webkitPersistentStorage.requestQuota(requestedBytes, function (grantedBytes) {
                    window.requestFileSystem(window.PERSISTENT, grantedBytes, function (fs) {
                        fs.root.getFile(filename, {create: true}, function (fileEntry) {
                            fileEntry.createWriter(function (fileWriter) {
                                console.log("Got fileWriter");
                                writer = fileWriter;
                                // now export based on the specified format
                                switch (format) {
                                case FileTypeEnum.TXT:
                                    exportText();
                                    break;
                                case FileTypeEnum.USFM:
                                    exportUSFM();
                                    break;
                                case FileTypeEnum.USX:
                                    exportUSX();
                                    break;
                                case FileTypeEnum.XML:
                                    exportXML();
                                    break;
                                }
                            }, exportFail);
                        }, exportFail);
                    }, exportFail);
                }, exportFail);
            }
        },
        
        // ****************************************
        // END static methods
        // ****************************************
        
        // ImportDocumentView
        // Select and import documents (txt, usfm, sfm, usx, xml) into 
        // AIM from the device or PC, depending on where AIM is run from. 
        ImportDocumentView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplImportDoc),
            
            initialize: function () {
                document.addEventListener("resume", this.onResume, false);
                this.bookList = new bookModel.BookCollection();
            },
            
            ////
            // Event Handlers
            ////
            events: {
                "change #selFile": "browserImportDocs",
                "click .topcoat-list__item": "mobileImportDocs",
                "click #OK": "onOK"
            },
            // Resume handler -- user placed the app in the background, then resumed.
            // Assume the file list could have changed, and reload this page
            onResume: function () {
                // refresh the view
                Backbone.history.loadUrl(Backbone.history.fragment);
            },
            // Handler for when the user clicks the Select button (browser only) -
            // (this is the html <input type=file> element  displayed for the browser only) --
            // file selections are returned by the browser in the event.currentTarget.files array
            browserImportDocs: function (event) {
                var fileindex = 0;
                var files = event.currentTarget.files;
                fileCount = files.length;
                // each of the files items is a file object already; there's no need to use
                // the file plugin like we need to below. Just call importFile() directly.
                while (fileindex < fileCount) {
                    fileName = files[fileindex].name;
                    importFile(files[fileindex], this.model);
                    fileindex++;
                }
            },
            // Handler for the when the user clicks a document in the list to import (mobile only) -
            // we gather the file path from the selection, then reconstitute file objects
            // from the path using the cordova-plugin-file / filesystem API.
            mobileImportDocs: function (event) {
                // replace the selection UI with the import UI
                $("#mobileSelect").html(Handlebars.compile(tplLoadingPleaseWait));
                $("#OK").hide();
                // find all the selected file
                var index = $(event.currentTarget).attr('id').trim();
                var model = this.model;
                if (index === "clipboard") {
                    // EDB 5/29 HACK: clipboard text -- create a blob instead of a file and read it:
                    // Cordova-ios uses an older web view that has a buggy / outdated JS engine w.r.t the File object;
                    // it places the contents in the name attribute. The FileReader does
                    // accept a Blob (the File object derives from Blob), which is why importFile works.
                    cordova.plugins.clipboard.paste(function (text) {
                        console.log("Clipboard selected. Creating ad hoc file from text.");
                        var clipboardFile = new Blob([text], {type: "text/plain"});
                        $("#status").html(i18n.t("view.dscStatusReading", {document: clipboardFile.name}));
                        fileName = i18n.t("view.lblText") + "-" + (Underscore.uniqueId());
                        importFile(clipboardFile, model);
                    }, function (error) {
                        console.log("resolveLocalFileSystemURL error: " + error.code);
                    });
                } else {
                    // regular file
                    console.log("index: " + index + ", FileList[index]: " + fileList[index]);
                    // request the persistent file system
                    window.resolveLocalFileSystemURL(fileList[index],
                        function (entry) {
                            entry.file(
                                function (file) {
                                    $("#status").html(i18n.t("view.dscStatusReading", {document: file.name}));
                                    fileName = file.name;
                                    importFile(file, model);
                                },
                                function (error) {
                                    console.log("FileEntry.file error: " + error.code);
                                }
                            );
                        },
                        function (error) {
                            console.log("resolveLocalFileSystemURL error: " + error.code);
                        });
                }
            },
            // Handler for the OK button -- just returns to the home screen.
            onOK: function (event) {
                // save the model
                this.model.save();
                window.Application.currentProject = this.model;
                // head back to the home page
                window.history.back();
            },
            // Show event handler (from MarionetteJS):
            // - if we're running in a mobile device, we'll use the cordova-plugin-file
            //   API to search through the device directories and add any valid files
            //   to a table grid
            // - If we're running in a mobile device, also test the clipboard for any text.
            //   If there is any, add an option to create a new "book" from the clipboard text.
            // - If we're in a browser, just show the html <input type=file> to allow
            //   for file selection
            onShow: function () {
//                $("#selFile").attr("accept", ".xml,.usfm");
                $("#title").html(i18n.t('view.lblImportDocuments'));
                $("#lblDirections").html(i18n.t('view.dscImportDocuments'));
                $(".topcoat-progress-bar").hide();
                $("#OK").attr("disabled", true);
                // build the regular expression to identify punctuation
                // (this allows us to split out punctuation as separate tokens when importing
                punctExp = "[\\s";
                this.model.get('PunctPairs').forEach(function (elt, idx, array) {
                    // Unicode-encoded punctuation, formatted to get leading 00 padding (e.g., \U0065 for "a"),
                    // each punctuation marker is bound in "capturing parentheses", meaning that
                    // the punctuation itself is kept as a separate token in the array when we perform our split() call.
                    // Note that we have to do a charCodeAt(), which returns the decimal value of the unicode char,
                    // then convert it to hex using toString(16).
                    puncts.push(elt.s);
                    punctExp += "(\\u" + ("000" + elt.s.charCodeAt(0).toString(16)).slice(-4) + ")";
                });
                punctExp += "]+"; // one or more of ANY of the above will trigger a new token

                // load the source / target case pairs
                this.model.get('CasePairs').forEach(function (elt, idx, array) {
                    caseSource.push(elt.s);
                    caseTarget.push(elt.t);
                });
                // instantiate the KB in case we import an AI XML document (we'll populate the KB if that happens)
                kblist = new kbModels.TargetUnitCollection();
                kblist.fetch({reset: true, data: {source: ""}});
                
                // cheater way to tell if running on mobile device
                if (window.sqlitePlugin) {
                    // running on device -- use cordova file plugin to select file
                    $("#browserGroup").hide();
                    $("#mobileSelect").html(Handlebars.compile(tplLoadingPleaseWait));
                    var localURLs    = [
                        cordova.file.dataDirectory,
                        cordova.file.documentsDirectory,
                        cordova.file.externalRootDirectory,
                        cordova.file.sharedDirectory,
                        cordova.file.syncedDataDirectory
                    ];
                    var DirsRemaining = localURLs.length;
                    var index = 0;
                    var i;
                    var statusStr = "";
                    // running on device -- check the clipboard for text
                    DirsRemaining++; // add a placeholder "directory" for the clipboard test
                    cordova.plugins.clipboard.paste(function (text) {
                        console.log("Clipboard returned: " + text);
                        if (text !== null && text.length > 0) {
                            // something on the clipboard -- add an option to paste the text as a new Book
                            statusStr += "<li class='topcoat-list__item' id='clipboard'><span class='topcoat-icon topcoat-icon--clipboard'></span> " + i18n.t('view.lblCopyClipboardText') + "<span class='chevron'></span></li>";
                            index++;
                        }
                        DirsRemaining--; // done checking -- remove the placeholder "directory"
                    }, function (error) {
                        // error in clipboard retrieval -- skip entry
                        // (seen this when there's data on the clipboard that isn't text/plain)
                        console.log("Error retrieving clipboard data:" + error);
                        DirsRemaining--;
                    });
                    var addFileEntry = function (entry) {
                        var dirReader = entry.createReader();
                        dirReader.readEntries(
                            function (entries) {
                                var fileStr = "";
                                var i;
                                for (i = 0; i < entries.length; i++) {
                                    if (entries[i].isDirectory === true) {
                                        // Recursive -- call back into this subdirectory
                                        DirsRemaining++;
                                        addFileEntry(entries[i]);
                                    } else {
                                        console.log(entries[i].fullPath);
                                        if ((entries[i].fullPath.match(/download/i)) || (entries[i].fullPath.match(/document/i)) || entries[i].fullPath.lastIndexOf('/') === 0) {
                                            // only take files from the Download or Document directories
                                            if ((entries[i].name.toLowerCase().indexOf(".txt") > 0) ||
                                                    (entries[i].name.toLowerCase().indexOf(".usx") > 0) ||
                                                    (entries[i].name.toLowerCase().indexOf(".usfm") > 0) ||
                                                    (entries[i].name.toLowerCase().indexOf(".sfm") > 0) ||
                                                    (entries[i].name.toLowerCase().indexOf(".xml") > 0)) {
                                                fileList[index] = entries[i].toURL();
                                                fileStr += "<li class='topcoat-list__item' id=" + index + ">" + entries[i].fullPath + "<span class='chevron'></span></li>";
//                                                fileStr += "<tr><td><label class='topcoat-checkbox'><input class='c' type='checkbox' id='" + index + "'><div class='topcoat-checkbox__checkmark'></div></label><td><span class='n'>" + entries[i].fullPath + "</span></td></tr>";
                                                index++;
                                            }
                                        }
                                    }
                                }
                                statusStr += fileStr;
                                DirsRemaining--;
                                if (DirsRemaining <= 0) {
                                    if (statusStr.length > 0) {
                                        $("#mobileSelect").html("<div class='wizard-instructions'>" + i18n.t('view.dscImportDocuments') + "</div><div class='topcoat-list__container chapter-list'><ul class='topcoat-list__container chapter-list'>" + statusStr + "</ul></div>");
//                                        $("#mobileSelect").html("<table class=\"topcoat-table\"><colgroup><col style=\"width:2.5rem;\"><col></colgroup><thead><tr><th></th><th>" + i18n.t('view.lblName') + "</th></tr></thead><tbody id=\"tb\"></tbody></table><div><button class=\"topcoat-button\" id=\"Import\" disabled>" + i18n.t('view.lblImport') + "</button></div>");
                                        $("#tb").html(statusStr);
                                        $("#OK").attr("disabled", true);
                                    } else {
                                        // nothing to select -- inform the user
                                        $("#mobileSelect").html("<span class=\"topcoat-notification\">!</span> <em>" + i18n.t('view.dscNoDocumentsFound') + "</em>");
                                        $("#OK").removeAttr("disabled");
                                    }
                                }
                            },
                            function (error) {
                                console.log("readEntries error: " + error.code);
                                statusStr += "<p>readEntries error: " + error.code + "</p>";
                            }
                        );
                    };
                    var addError = function (error) {
                        // log the error and continue processing
                        console.log("getDirectory error: " + error.code);
                        DirsRemaining--;
                    };
                    for (i = 0; i < localURLs.length; i++) {
                        if (localURLs[i] !== null && localURLs[i].length > 0) {
                            window.resolveLocalFileSystemURL(localURLs[i], addFileEntry, addError);
                        } else {
                            DirsRemaining--;
                        }
                    }
                } else {
                    // running in browser -- use html <input> to select file
                    $("#mobileSelect").hide();
                }
            }
        }),
        
        ExportDocumentView = Marionette.ItemView.extend({
            destination: DestinationEnum.FILE,
            template: Handlebars.compile(tplExportDoc),
            initialize: function () {
                document.addEventListener("resume", this.onResume, false);
            },
            
            ////
            // Event Handlers
            ////
            events: {
                "click .topcoat-list__item": "selectDoc",
                "mouseup #Filename": "editFilename",
                "blur #Filename": "blurFilename",
                "change .topcoat-radio-button": "changeType",
                "click #btnToClipboard": "onToClipboard",
                "click #btnToFile": "onToFile",
                "click #OK": "onOK",
                "click #Cancel": "onCancel"
            },
            // Resume handler -- user placed the app in the background, then resumed.
            // Assume the file list could have changed, and reload this page
            onResume: function () {
                // refresh the view
                Backbone.history.loadUrl(Backbone.history.fragment);
            },
            editFilename: function (event) {
                console.log("editFilename");
                // scroll up if there's not enough room for the keyboard
                if (($(window).height() - $(".control-group").height()) < 300) {
                    var top = event.currentTarget.offsetTop - $("#Filename").outerHeight();
                    $("#mobileSelect").scrollTop(top);
                }
            },
            blurFilename: function (event) {
                $("#mobileSelect").scrollTop(0);
            },
            // User changed the export format type. Add the appropriate extension
            changeType: function (event) {
                // strip any existing trailing extension from the filename
                var filename = $("#Filename").val().trim();
                if (filename.length > 0) {
                    if ((filename.indexOf(".xml") > -1) || (filename.indexOf(".txt") > -1) || (filename.indexOf(".sfm") > -1) || (filename.indexOf(".usx") > -1)) {
                        filename = filename.substr(0, filename.length - 4);
                    }
                }
                // get the desired format
                if ($("#exportXML").is(":checked")) {
                    filename += ".xml";
                } else if ($("#exportUSX").is(":checked")) {
                    filename += ".usx";
                } else if ($("#exportUSFM").is(":checked")) {
                    filename += ".sfm";
                } else {
                    // fallback to plain text
                    filename += ".txt";
                }
                // replace the filename text
                $("#Filename").val(filename);
            },
            onToFile: function (event) {
                console.log("File selected");
                $("#toFile").prop("checked", true);
                this.destination = DestinationEnum.FILE;
                // show the filename UI -- need to specify a filename
                $("#grpFilename").show();
            },
            onToClipboard: function (event) {
                console.log("Clipboard selected");
                $("#toClipboard").prop("checked", true);
                this.destination = DestinationEnum.CLIPBOARD;
                // hide the filename UI -- not needed
                $("#grpFilename").hide();
            },
            // User clicked the OK button. Export the selected document to the specified format.
            onOK: function (event) {
                if ($("#exportXML").length === 0) {
                    // if this is the export complete page,
                    // go back to the previous page
                    window.history.go(-1);
                } else {
                    var format = FileTypeEnum.TXT;
                    var filename = $("#Filename").val().trim();
                    // validate input
                    if ((filename.length === 0) && (this.destination !== DestinationEnum.CLIPBOARD)) {
                        // user didn't type anything in
                        // just tell them to enter something
                        if (navigator.notification) {
                            // on mobile device -- use notification plugin API
                            navigator.notification.alert(i18n.t('view.errNoFilename'));
                        } else {
                            // in browser -- use window.confirm / window.alert
                            alert(i18n.t('view.errNoFilename'));
                        }
                        $("#Filename").focus();
                    } else {
                        // get the desired format
                        if ($("#exportXML").is(":checked")) {
                            format = FileTypeEnum.XML;
                        } else if ($("#exportUSX").is(":checked")) {
                            format = FileTypeEnum.USX;
                        } else if ($("#exportUSFM").is(":checked")) {
                            format = FileTypeEnum.USFM;
                        } else {
                            // fallback to plain text
                            format = FileTypeEnum.TXT;
                        }
                        // update the UI
                        $("#mobileSelect").html(Handlebars.compile(tplLoadingPleaseWait));
                        $("#loading").html(i18n.t("view.lblExportingPleaseWait"));
                        $("#status").html(i18n.t("view.dscExporting", {file: filename}));
                        $("#OK").hide();
                        // perform the export
                        if (this.destination === DestinationEnum.CLIPBOARD) {
                            isClipboard = true;
                        }
                        exportDocument(bookid, format, filename);
                    }
                }
            },
            // User clicked the Cancel button. Here we don't do anything -- just return
            onCancel: function (event) {
                // go back to the previous page
                window.history.go(-1);
            },
            selectDoc: function (event) {
                // get the info for this document
                bookName = event.currentTarget.innerText;
                bookid = $(event.currentTarget).attr('id').trim();
                // show the next screen
                $("#lblDirections").html(i18n.t('view.lblDocSelected') + bookName);
                $("#Container").html(Handlebars.compile(tplExportFormat));
                // select a default of TXT for the export format (for now)
                $("#exportTXT").prop("checked", true);
                $("#toFile").prop("checked", true);
                if (window.sqlitePlugin) {
                    // mobile device -- show clipboard option
                    $("#clipboardTab").removeClass('hide');
                }
                if (bookName.length > 0) {
                    if ((bookName.indexOf(".xml") > -1) || (bookName.indexOf(".txt") > -1) || (bookName.indexOf(".sfm") > -1) || (bookName.indexOf(".usx") > -1)) {
                        bookName = bookName.substr(0, bookName.length - 4);
                    }
                }
                $("#Filename").val(bookName + ".txt");
            },
            onShow: function () {
                var list = "";
                var pid = this.model.get('projectid');
                // initial selection - file export
                $("#toFile").prop("checked", true);
                $.when(window.Application.BookList.fetch({reset: true, data: {name: ""}}).done(function () {
                    list = buildDocumentList(pid);
                    $("#Container").html("<ul class='topcoat-list__container chapter-list'>" + list + "</ul>");
                    $('#lblDirections').html(i18n.t('view.lblExportSelectDocument'));
                }));
            }
        });
    
    return {
        ImportDocumentView: ImportDocumentView,
        ExportDocumentView: ExportDocumentView
    };

});
