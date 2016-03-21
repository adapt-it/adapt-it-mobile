/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
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
        lines           = [],
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
                $("#status").html(i18n.t("view.dscStatusImportSuccess", {document: file.name}));
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
                $("#status").html(i18n.t("view.dscCopyDocumentFailed", {document: file.name, reason: e.message}));
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
                    orig = null,
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
                    arr = [],
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
                    var re = /\s+/;
                    var newline = new RegExp('[\n\r\f\u2028\u2029]+', 'g');
                    var prepunct = "";
                    var follpunct = "";
                    var needsNewLine = false;
                    var chaps = [];
                    var sp = null;
                    console.log("Reading text file:" + file.name);
                    index = 1;
                    bookName = file.name;
                    bookID = Underscore.uniqueId();
                    // Create the book and chapter 
                    book = new bookModel.Book({
                        bookid: bookID,
                        projectid: project.get('projectid'),
                        name: bookName,
                        filename: file.name,
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
                    arr = contents.replace(newline, " <p> ").split(re); // insert special <p> for linefeeds, then split on whitespace
//                            arr = contents.split(re);
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
                    var re = /\s+/;
                    var chaps = [];
                    var xmlDoc = $.parseXML(contents);
                    var $xml = $(xmlDoc);
                    var chapterName = "";
                    // find the USFM ID of this book
                    var scrIDList = new scrIDs.ScrIDCollection();
                    var verseCount = 0;
                    var punctIdx = 0;
                    var lastAdapted = 0;
                    var firstChapterID = "";
                    var innerText = "";
                    var i = 0;
                    var tmpVal = null;
                    var closingMarker = "";
                    var parseNode = function (element) {
                        closingMarker = "";
                        // process the node itself
                        if ($(element)[0].nodeType === 1) {
                            switch ($(element)[0].tagName) {
                            case "chapter":
                                if (markers.length > 0) {
                                    markers += " ";
                                }
                                markers += "\\c " + element.attributes.item("number").nodeValue;
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
                                markers += "\\v " + element.attributes.item("number").nodeValue;
                                break;
                            case "para":
                                // the para kind is in the style tag
                                if (markers.length > 0) {
                                    markers += " ";
                                }
                                markers += "\\" + element.attributes.item("style").nodeValue;
                                break;
                            case "char":
                                break;
                            case "figure":
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
                            case "reference":
                                break;
                            default: // no processing for other nodes
                                break;
                            }
                        }
                        
                        // If this is a text node, create any needed sourcephrases
                        if ($(element)[0].nodeType === 3) {
                            // Split the text into an array
                            // Note that this is analogous to the AI "strip" of text, and not the whole document
                            arr = ($(element)[0].nodeValue).trim().split(re);
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
                    console.log("Reading USX file:" + file.name);
                    bookName = file.name.substr(0, file.name.indexOf("."));
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
                        filename: file.name,
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
                    var re = /\s+/;
                    var follpunct = "";
                    var sp = null;
                    var chaps = [];
                    var xmlDoc = $.parseXML(contents);
                    var chapterName = "";
                    // find the USFM ID of this book
                    var scrIDList = new scrIDs.ScrIDCollection();
                    var verseCount = 0;
                    var lastAdapted = 0;
                    var firstChapterID = "";
                    var markers = "";
                    var firstChapterNumber = "1";
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
                    
                    console.log("Reading XML file:" + file.name);
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
                        bookName = file.name.substr(0, file.name.indexOf("."));
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
                            filename: file.name,
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
                    $($xml).find("S").each(function (i) {
                        if (i === 0 && firstBook === false) {
                            // merged (collaboration) documents have an extra "\id" element at the beginning of subsequent chapters;
                            // ignore this element and continue to the next one
                            return true; // jquery equivalent of continue in loop
                        }
                        // If this is a new chapter (starting for ch 2 -- chapter 1 is created above),
                        // create a new chapter object
                        markers = $(this).attr('m');
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
                        // if there are filtered text items, insert them now
                        if ($(this).attr('fi')) {
                            markers = "";
                            $(this).attr('fi').split(re).forEach(function (elt, index, array) {
                                if (elt.indexOf("~FILTER") > -1) {
                                    // do nothing -- skip first and last elements
//                                    console.log("filter");
                                } else if (elt.indexOf("\\") === 0) {
                                    // starting marker
                                    markers += elt;
                                } else if (elt.indexOf("\\") > 0) {
                                    // ending marker - it's concatenated with the preceding token, no space
                                    // create a sourcephrase with the first part of the token, using the marker
                                    // from the end
                                    markers += elt.substr(elt.indexOf("\\"));
                                    spID = Underscore.uniqueId();
                                    sp = new spModel.SourcePhrase({
                                        spid: spID,
                                        norder: norder,
                                        chapterid: chapterID,
                                        markers: markers,
                                        orig: null,
                                        prepuncts: $(this).attr('pp'),
                                        midpuncts: "",
                                        follpuncts: $(this).attr('fp'),
                                        source: elt.substr(0, elt.indexOf("\\") - 1),
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
                                } else {
                                    // regular token - add as a new sourcephrase
                                    spID = Underscore.uniqueId();
                                    sp = new spModel.SourcePhrase({
                                        spid: spID,
                                        norder: norder,
                                        chapterid: chapterID,
                                        markers: markers,
                                        orig: null,
                                        prepuncts: $(this).attr('pp'),
                                        midpuncts: "",
                                        follpuncts: $(this).attr('fp'),
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
                        spID = Underscore.uniqueId();
                        sp = new spModel.SourcePhrase({
                            spid: spID,
                            norder: norder,
                            chapterid: chapterID,
                            markers: $(this).attr('m'),
                            orig: null,
                            prepuncts: $(this).attr('pp'),
                            midpuncts: "",
                            follpuncts: $(this).attr('fp'),
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
                    var re = /\s+/;
                    var markerList = new USFM.MarkerCollection();
                    var marker = null;
                    var lastAdapted = 0;
                    var verseCount = 0;
                    var hasPunct = false;
                    var punctIdx = 0;
                    var stridx = 0;
                    var chaps = [];

                    console.log("Reading USFM file:" + file.name);
                    index = contents.indexOf("\\h ");
                    if (index > -1) {
                        // get the name from the usfm itself
                        bookName = contents.substr(index + 3, (contents.indexOf("\n", index) - (index + 3))).trim();
                    } else {
                        bookName = file.name;
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
//                    books.fetch({reset: true, data: {name: ""}});
                    if (books.where({scrid: (scrID.get('id'))}).length > 0) {
                        // this book is already in the list -- return
                        errMsg = i18n.t("view.dscErrDuplicateFile");
                        return false;
                    }
                    // add a book and chapter
                    bookID = Underscore.uniqueId();
                    book = new bookModel.Book({
                        bookid: bookID,
                        projectid: project.get('projectid'),
                        scrid: scrID.get('id'),
                        name: bookName,
                        filename: file.name,
                        chapters: [] // arr
                    });
                    books.add(book);
                    // Note that we're adding chapter 1 before we reach the \c 1 marker in the file --
                    // Usually there's a fair amount of front matter before we reach the chapter itself;
                    // rather than creating a chapter 0 (which would throw off the search stuff), we'll
                    // just add the front matter to chapter 1.
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
                    
                    // build SourcePhrases                    
                    arr = contents.replace(/\\/gi, " \\").split(re); // add space to make sure markers get put in a separate token
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
                            if (markers && markers.indexOf("\\c ") !== -1 && markers.indexOf("\\c 1 ") === -1) {
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
                if ((file.name.indexOf(".usfm") > 0) || (file.name.indexOf(".sfm") > 0)) {
                    result = readUSFMDoc(this.result);
                } else if (file.name.indexOf(".usx") > 0) {
                    result = readUSXDoc(this.result);
                } else if (file.name.indexOf(".xml") > 0) {
                    result = readXMLDoc(this.result);
                } else if (file.name.indexOf(".txt") > 0) {
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
                    // some other extension -- try reading it as a text document
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
            ///

            // Plain Text document
            // We assume these are just text with no markup,
            // in a single chapter (this could change if needed)
            var exportText = function () {
                var chapters = window.Application.ChapterList.where({bookid: bookid});
                var content = "";
                var spList = new spModel.SourcePhraseCollection();
                var i = 0;
                var value = null;
                var chaptersLeft = chapters.length;
                writer.onwriteend = function (e) {
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
                chapters.forEach(function (entry) {
                    // for each chapter, get the sourcephrases
                    spList.fetch({reset: true, data: {chapterid: entry.get("chapterid")}}).done(function () {
                        for (i = 0; i < spList.length; i++) {
                            value = spList.at(i);
                            // plain text -- ignore markers other than paragraph breaks
                            if (value.get("markers").indexOf("\\p") > -1) {
                                content += "\n"; // newline
                            }
                            content += value.get("prepuncts") + value.get("target") + value.get("follpuncts") + " ";
                        }
                        var blob = new Blob([content], {type: 'text/plain'});
                        chaptersLeft--;
                        writer.write(blob);
                        content = ""; // clear out the content string for the next chapter
                    });
                });
            };

            // USFM document
            var exportUSFM = function () {
                var chapters = window.Application.ChapterList.where({bookid: bookid});
                var content = "";
                var spList = new spModel.SourcePhraseCollection();
                var markers = "";
                var i = 0;
                var value = null;
                var chaptersLeft = chapters.length;
                writer.onwriteend = function (e) {
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
                chapters.forEach(function (entry) {
                    // for each chapter, get the sourcephrases
                    spList.fetch({reset: true, data: {chapterid: entry.get("chapterid")}}).done(function () {
                        for (i = 0; i < spList.length; i++) {
                            value = spList.at(i);
                            markers = value.get("markers");
                            // add markers, and if needed, pretty-print the text on a newline
                            if (markers.length > 0) {
                                if ((markers.indexOf("\\v") > -1) || (markers.indexOf("\\c") > -1) || (markers.indexOf("\\p") > -1) || (markers.indexOf("\\id") > -1) || (markers.indexOf("\\h") > -1) || (markers.indexOf("\\toc") > -1) || (markers.indexOf("\\mt") > -1)) {
                                    // pretty-printing -- add a newline so the output looks better
                                    content += "\n"; // newline
                                }
                                // now add the markers and a space
                                content += value.get("markers") + " ";
                            }
                            content += value.get("prepuncts") + value.get("target") + value.get("follpuncts") + " ";
                        }
                        var blob = new Blob([content], {type: 'text/plain'});
                        chaptersLeft--;
                        writer.write(blob);
                        content = ""; // clear out the content string for the next chapter
                    });
                });
            };

            // USX document
            var exportUSX = function () {
                writer.onwriteend = function (e) {
                    console.log("write completed.");
                    exportSuccess();
                };
                writer.onerror = function (e) {
                    console.log("write failed: " + e.toString());
                    exportFail(e);
                };
                var blob = new Blob(['lorem ipsum'], {type: 'text/plain'});
                writer.write(blob);
            };

            // XML document
            var exportXML = function () {
                writer.onwriteend = function (e) {
                    console.log("write completed.");
                    exportSuccess();
                };
                writer.onerror = function (e) {
                    console.log("write failed: " + e.toString());
                    exportFail(e);
                };
                var blob = new Blob(['lorem ipsum'], {type: 'text/plain'});
                writer.write(blob);
            };

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
                    // Android
                    exportDirectory = cordova.file.externalDataDirectory;
                }
                window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
                window.resolveLocalFileSystemURL(exportDirectory, function (directoryEntry) {
                    console.log("Got directoryEntry.");
                    directoryEntry.getFile(filename, {create: true}, function (fileEntry) {
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
                        }, exportFail(e));
                    }, exportFail(e));
                }, exportFail(e));
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
                            }, exportFail(e));
                        }, exportFail(e));
                    }, exportFail(e));
                }, exportFail(e));
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
                console.log("index: " + index + ", FileList[index]: " + fileList[index]);
                // request the persistent file system
                window.resolveLocalFileSystemURL(fileList[index],
                    function (entry) {
                        entry.file(
                            function (file) {
                                $("#status").html(i18n.t("view.dscStatusReading", {document: file.name}));
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
                    var addFileEntry = function (entry) {
                        var dirReader = entry.createReader();
                        dirReader.readEntries(
                            function (entries) {
                                var fileStr = "";
                                var i;
                                for (i = 0; i < entries.length; i++) {
                                    if (entries[i].isDirectory === true) {
                                        // Recursive -- call back into this subdirectory
                                        addFileEntry(entries[i]);
                                    } else {
                                        console.log(entries[i].fullPath);
                                        if (entries[i].fullPath.indexOf("Download") > 0 || entries[i].fullPath.indexOf("Document") > 0 || entries[i].fullPath.lastIndexOf('/') === 0) {
                                            // only take files from the Download or Document directories
                                            if ((entries[i].name.indexOf(".txt") > 0) ||
                                                    (entries[i].name.indexOf(".usx") > 0) ||
                                                    (entries[i].name.indexOf(".usfm") > 0) ||
                                                    (entries[i].name.indexOf(".sfm") > 0) ||
                                                    (entries[i].name.indexOf(".xml") > 0)) {
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
                        console.log("getDirectory error: " + error.code);
                        statusStr += "<p>getDirectory error: " + error.code + ", " + error.message + "</p>";
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
            template: Handlebars.compile(tplExportDoc),
            initialize: function () {
                document.addEventListener("resume", this.onResume, false);
            },
            
            ////
            // Event Handlers
            ////
            events: {
                "click .topcoat-list__item": "selectDoc",
                "change .topcoat-radio-button": "changeType",
                "click #OK": "onOK",
                "click #Cancel": "onCancel"
            },
            // Resume handler -- user placed the app in the background, then resumed.
            // Assume the file list could have changed, and reload this page
            onResume: function () {
                // refresh the view
                Backbone.history.loadUrl(Backbone.history.fragment);
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
                    if (filename.length === 0) {
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
                var bookName = event.currentTarget.innerText;
                bookid = $(event.currentTarget).attr('id').trim();
                // show the next screen
                $("#lblDirections").html(i18n.t('view.lblDocSelected') + bookName);
                $("#Container").html(Handlebars.compile(tplExportFormat));
                // select a default of TXT for the export format (for now)
                $("#exportTXT").prop("checked", true);
                $("#Filename").val(bookName + ".txt");
            },
            onShow: function () {
                var list = "";
                var pid = this.model.get('projectid');
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
