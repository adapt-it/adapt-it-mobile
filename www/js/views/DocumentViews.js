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
        tplImportDoc    = require('text!tpl/CopyOrImport.html'),
        projModel       = require('app/models/project'),
        bookModel       = require('app/models/book'),
        spModel         = require('app/models/sourcephrase'),
        chapModel       = require('app/models/chapter'),
        scrIDs          = require('utils/scrIDs'),
        USFM            = require('utils/usfm'),
        lines           = [],
        fileList        = [],
        fileCount       = 0,
        punctExp        = "",
        puncts          = [],
        curFileIdx      = 0,

        // Helper method to import the selected file into the specified project.
        // This method has sub-methods for text, usfm, usx and xml (Adapt It document) file types.
        importFile = function (file, project) {
            var status = "";
            var reader = new FileReader();
            var i = 0;
            var name = "";
            var doc = null;
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
                    markers = "",
                    orig = null,
                    prepuncts = "",
                    midpuncts = "",
                    follpuncts = "",
                    newSP = null,
                    punctIdx = 0,
                    chapter = null,
                    book = null,
                    books = new bookModel.BookCollection(),
                    chapters = new chapModel.ChapterCollection(),
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
                    var sp = null;
                    console.log("Reading text file:" + file.name);
                    index = 1;
                    bookName = file.name;
                    bookID = Underscore.uniqueId();
                    // Create the book and chapter 
                    book = new bookModel.Book({
                        bookid: bookID,
                        projectid: project.get('id'),
                        name: bookName,
                        filename: file.name,
                        chapters: []
                    });
                    books.add(book);
                    book.trigger('change');
                    // (for now, just one chapter -- eventually we could chunk this out based on file size)
                    chapterID = Underscore.uniqueId();
                    chapter = new chapModel.Chapter({
                        chapterid: chapterID,
                        bookid: bookID,
                        projectid: project.get('id'),
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
                                sourcePhrases.add(sp);
                                sp.trigger('change');
                                i++;
                            }
                        }
                    }

                    // for non-scripture texts, there are no verses. Keep track of how far we are by using a 
                    // negative value for the # of SourcePhrases in the text.
                    chapter.set('versecount', -(index));
                    // Update the status string
                    if (status.length > 0) {
                        status += "<br>";
                    }
                    status += i18n.t("view.dscCopyDocumentFound", {document: bookName});
                    // update the status
                    var curStatus = $("#status2").html();
                    if (curStatus.length > 0) {
                        curStatus += "<br>";
                    }
                    $("#status2").html(curStatus + status);
                    curFileIdx++;
                    var newWidth = "width:" + (100 / fileCount * curFileIdx) + "%;";
                    $("#progress").attr("style", newWidth);
                    if (fileCount === curFileIdx) {
                        // last document -- display the OK button
                        $("#OK").removeAttr("disabled");
                    }
                };
                
                // Paratext USX document
                // These are XML-flavored markup files exported from Paratext
                var readUSXDoc = function (contents) {
                    var prepunct = "";
                    var follpunct = "";
                    var sp = null;
                    var re = /\s+/;
                    var xmlDoc = $.parseXML(contents);
                    var $xml = $(xmlDoc);
                    var chapterName = "";
                    // find the USFM ID of this book
                    var scrIDList = new scrIDs.ScrIDCollection();
                    var verseCount = 0;
                    var verses = [];
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
                                    chapter.set('versecount', verseCount);
                                    chapter.trigger('change');
                                    verses.push(verseCount); // add this chapter's verseCount to the array
                                    verseCount = 0; // reset for the next chapter
                                    lastAdapted = 0; // reset for the next chapter
                                    // now create the new chapter
                                    chapterName = i18n.t("view.lblChapterName", {bookName: bookName, chapterNumber: element.attributes.item("number").nodeValue});
                                    chapterID = Underscore.uniqueId();
                                    chapter = new chapModel.Chapter({
                                        chapterid: chapterID,
                                        bookid: bookID,
                                        projectid: project.get('id'),
                                        name: chapterName,
                                        lastadapted: 0,
                                        versecount: 0
                                    });
                                    chapters.add(chapter);
                                    chapter.trigger('change');
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
                                        sourcePhrases.add(sp);
                                        sp.trigger('change');
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
                    console.log("Reading XML file:" + file.name);
                    scrIDList.fetch({reset: true, data: {id: ""}});
                    // the book ID (e.g., "MAT") is in a singleton <book> element of the USX file
                    scrID = scrIDList.where({id: $($xml).find("book").attr("code")})[0];
                    if (scrID === null) {
                        console.log("No ID matching this document: " + $($xml).find("book").attr("code"));
                        return null;
                    }
                    arr = scrID.get('chapters');
                    books.fetch({reset: true, data: {name: ""}});
                    if (books.where({scrid: (scrID.get('id'))}).length > 0) {
                        // this book is already in the list -- just return
                        return null;
                    }
                    index = 1;
                    bookName = file.name.substr(0, file.name.indexOf("."));
                    bookID = Underscore.uniqueId();
                    // Create the book and chapter 
                    book = new bookModel.Book({
                        bookid: bookID,
                        projectid: project.get('id'),
                        scrid: scrID.get('id'),
                        name: bookName,
                        filename: file.name,
                        chapters: []
                    });
                    books.add(book);
                    book.trigger('change');
                    chapterID = Underscore.uniqueId();
                    chapterName = i18n.t("view.lblChapterName", {bookName: bookName, chapterNumber: "1"});
                    chapter = new chapModel.Chapter({
                        chapterid: chapterID,
                        bookid: bookID,
                        projectid: project.get('id'),
                        name: chapterName,
                        lastadapted: 0,
                        versecount: 0
                    });
                    chapters.add(chapter);
                    chapter.trigger('change');
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
                    // update the last chapter's verseCount
                    chapter.set('versecount', verseCount);
                    chapter.trigger('change');
                    // update the verse count and last adapted verse for the book
                    if (verseCount > 0) {
                        verses.push(verseCount);
                    }
                    book.set('chapters', verses);
                    // update the status
                    var curStatus = $("#status2").html();
                    if (curStatus.length > 0) {
                        curStatus += "<br>";
                    }
                    $("#status2").html(curStatus + status);
                    curFileIdx++;
                    var newWidth = "width:" + (100 / fileCount * curFileIdx) + "%;";
                    $("#progress").attr("style", newWidth);
                    if (fileCount === curFileIdx) {
                        // last document -- display the OK button
                        $("#OK").removeAttr("disabled");
                    }
                };
                
                // Adapt It XML document
                // While XML is a general purpose document format, we're looking
                // specifically for Adapt It XML document files; other files
                // will be skipped (for now)
                var readXMLDoc = function (contents) {
                    var prepunct = "";
                    var re = /\s+/;
                    var follpunct = "";
                    var sp = null;
                    var xmlDoc = $.parseXML(contents);
                    var chapterName = "";
                    // find the USFM ID of this book
                    var scrIDList = new scrIDs.ScrIDCollection();
                    var verseCount = 0;
                    var verses = [];
                    var lastAdapted = 0;
                    var firstChapterID = "";
                    var markers = "";
                    var i = 0;
                    console.log("Reading XML file:" + file.name);
                    scrIDList.fetch({reset: true, data: {id: ""}});
                    // Starting at the SourcePhrases ( <S ...> ), look for the \id element
                    // in the markers. We'll test this against the canonical usfm markers to learn more about this document.
                    i = contents.indexOf("<S ");
                    index = contents.indexOf("\\id", i);
                    if (index === -1) {
                        // no ID found -- this is most likely not an AI xml document.
                        // We'll just return for now
                        console.log("No ID element found (is this an AI XML document?) -- exiting.");
                        return null;
                    }
                    // we've found the \id element in the markers -- to get the value, we have to work
                    // backwards until we find the nearest "s" attribute
                    // e.g., <S s="MAT" ...>.
                    index = contents.lastIndexOf("s=", index) + 3;
                    scrID = scrIDList.where({id: contents.substr(index, contents.indexOf("\"", index) - index)})[0];
                    arr = scrID.get('chapters');
                    books.fetch({reset: true, data: {name: ""}});
                    if (books.where({scrid: (scrID.get('id'))}).length > 0) {
                        // this book is already in the list -- just return
                        return null;
                    }
                    index = 1;
                    bookName = file.name.substr(0, file.name.indexOf("."));
                    bookID = Underscore.uniqueId();
                    // Create the book and chapter 
                    book = new bookModel.Book({
                        bookid: bookID,
                        projectid: project.get('id'),
                        scrid: scrID.get('id'),
                        name: bookName,
                        filename: file.name,
                        chapters: []
                    });
                    books.add(book);
                    chapterID = Underscore.uniqueId();
                    chapterName = i18n.t("view.lblChapterName", {bookName: bookName, chapterNumber: "1"});
                    chapter = new chapModel.Chapter({
                        chapterid: chapterID,
                        bookid: bookID,
                        projectid: project.get('id'),
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
                    $($xml).find("S").each(function (i) {
                        // If this is a new chapter (starting for ch 2 -- chapter 1 is created above),
                        // create a new chapter object
                        markers = $(this).attr('m');
                        if (markers && markers.indexOf("\\c ") !== -1 && markers.indexOf("\\c 1 ") === -1) {
                            // update the last adapted for the previous chapter before closing it out
                            chapter.set('versecount', verseCount);
                            chapter.set('lastadapted', lastAdapted);
                            verses.push(verseCount); // add this chapter's verseCount to the array
                            verseCount = 0; // reset for the next chapter
                            lastAdapted = 0; // reset for the next chapter
                            stridx = markers.indexOf("\\c ") + 3;
                            chapterName = i18n.t("view.lblChapterName", {bookName: bookName, chapterNumber: markers.substr(stridx, markers.indexOf(" ", stridx) - stridx)});
                            chapterID = Underscore.uniqueId();
                            // create the new chapter
                            chapter = new chapModel.Chapter({
                                chapterid: chapterID,
                                bookid: bookID,
                                projectid: project.get('id'),
                                name: chapterName,
                                lastadapted: 0,
                                versecount: 0
                            });
                            chapters.add(chapter);
                            chapter.trigger('change');
                            console.log(": " + $(this).attr('s') + ", " + chapterID);
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
                                    console.log("filter");
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
                                    sourcePhrases.add(sp);
                                    sp.trigger('change');
                                    markers = ""; // reset
                                } else {
                                    // regular token - add as a new sourcephrase
                                    spID = Underscore.uniqueId();
                                    sp = new spModel.SourcePhrase({
                                        spid: spID,
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
                                    sourcePhrases.add(sp);
                                    sp.trigger('change');
                                    markers = ""; // reset
                                }
                            });
                        }
                        // create the next sourcephrase
//                        console.log(i + ": " + $(this).attr('s') + ", " + chapterID);
                        spID = Underscore.uniqueId();
                        sp = new spModel.SourcePhrase({
                            spid: spID,
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
                        sourcePhrases.add(sp);
                        sp.trigger('change');
                    });
                    // update the last chapter's verseCount
                    chapter.set('versecount', verseCount);
                    chapter.trigger('change');
                    // update the verse count and last adapted verse for the book
                    if (verseCount > 0) {
                        verses.push(verseCount);
                    }
                    book.set('chapters', verses);
                    if (status.length > 0) {
                        status += "<br>";
                    }
                    status += i18n.t("view.dscCopyDocumentFound", {document: bookName});
                    // update the status
                    var curStatus = $("#status2").html();
                    if (curStatus.length > 0) {
                        curStatus += "<br>";
                    }
                    $("#status2").html(curStatus + status);
                    curFileIdx++;
                    var newWidth = "width:" + (100 / fileCount * curFileIdx) + "%;";
                    $("#progress").attr("style", newWidth);
                    if (fileCount === curFileIdx) {
                        // last document -- display the OK button
                        $("#OK").removeAttr("disabled");
                    }
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
                    var verses = 0;
                    var verseCount = 0;
                    var hasPunct = false;
                    var punctIdx = 0;
                    var stridx = 0;

                    console.log("Reading USFM file:" + file.name);
                    // find the ID of this book
                    index = contents.indexOf("\\id");
                    if (index === -1) {
                        // no ID found -- just return
                        return null;
                    }
                    markerList.fetch({reset: true, data: {name: ""}});
                    scrIDList.fetch({reset: true, data: {id: ""}});
                    scrID = scrIDList.where({id: contents.substr(index + 4, 3)})[0];
                    books.fetch({reset: true, data: {name: ""}});
                    if (books.where({scrid: (scrID.get('id'))}).length > 0) {
                        // this book is already in the list -- just return
                        return null;
                    }
                    index = contents.indexOf("\\h ");
                    if (index > -1) {
                        // get the name from the usfm itself
                        bookName = contents.substr(index + 3, (contents.indexOf("\n", index) - (index + 3)));
                    }
                    // add a book and chapter
                    bookID = Underscore.uniqueId();
                    book = new bookModel.Book({
                        bookid: bookID,
                        projectid: project.get('id'),
                        scrid: scrID.get('id'),
                        name: bookName,
                        filename: file.name,
                        chapters: [] // arr
                    });
                    books.add(book);
                    book.trigger('change');
                    // Note that we're adding chapter 1 before we reach the \c 1 marker in the file --
                    // Usually there's a fair amount of front matter before we reach the chapter itself;
                    // rather than creating a chapter 0 (which would throw off the search stuff), we'll
                    // just add the front matter to chapter 1.
                    chapterID = Underscore.uniqueId();
                    chapterName = i18n.t("view.lblChapterName", {bookName: bookName, chapterNumber: "1"});
                    chapter = new chapModel.Chapter({
                        chapterid: chapterID,
                        bookid: bookID,
                        projectid: project.get('id'),
                        name: chapterName,
                        lastadapted: 0,
                        versecount: 0
                    });
                    chapters.add(chapter);
                    chapter.trigger('change');
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
                            // Check for markers with more than one token (and merge the two marker tokens)
                            if ((arr[i] === "\\x") || (arr[i] === "\\f") ||
                                    (arr[i] === "\\c") || (arr[i] === "\\ca") || (arr[i] === "\\cp") ||
                                    (arr[i] === "\\v") || (arr[i] === "\\va") || (arr[i] === "\\vp")) {
                                // join with the next
                                i++;
                                markers += arr[i];
                            }
                            i++;
                        } else if (arr[i].length === 0) {
                            // nothing in this token -- skip
                            i++;
                        } else if (arr[i].length === 1 && puncts.indexOf(arr[i]) > -1) {
                            // punctuation token -- add to the prepuncts
                            prepuncts += arr[i];
                            i++;
                        } else {
                            // "normal" sourcephrase token
                            // Before creating the sourcephrase, look to see if we need to create a chapter element
                            // (note that we've already created chapter 1, so skip it if we come across it)
                            if (markers && markers.indexOf("\\c ") !== -1 && markers.indexOf("\\c 1 ") === -1) {
                                // update the last adapted for the previous chapter before closing it out
                                chapter.set('versecount', verseCount);
                                chapter.set('lastadapted', lastAdapted);
                                verses.push(verseCount); // add this chapter's verseCount to the array
                                verseCount = 0; // reset for the next chapter
                                lastAdapted = 0; // reset for the next chapter
                                stridx = markers.indexOf("\\c ") + 3;
                                chapterName = i18n.t("view.lblChapterName", {bookName: bookName, chapterNumber: markers.substr(stridx, markers.indexOf(" ", stridx) - stridx)});
                                chapterID = Underscore.uniqueId();
                                // create the new chapter
                                chapter = new chapModel.Chapter({
                                    chapterid: chapterID,
                                    bookid: bookID,
                                    projectid: project.get('id'),
                                    name: chapterName,
                                    lastadapted: 0,
                                    versecount: 0
                                });
                                chapters.add(chapter);
                                chapter.trigger('change');
                                console.log(": " + $(this).attr('s') + ", " + chapterID);
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
                                sourcePhrases.add(sp);
                                sp.trigger('change');
                                i++;
                            }
                        }
                    }
                    // update the last chapter's verseCount
                    chapter.set('versecount', verseCount);
                    chapter.trigger('change');
                    // update the verse count and last adapted verse for the book
                    if (verseCount > 0) {
                        verses.push(verseCount);
                    }
                    book.set('chapters', verses);

                    // done parsing -- update the status
                    if (status.length > 0) {
                        status += "<br>";
                    }
                    status += i18n.t("view.dscCopyDocumentFound", {document: bookName});
                    // update the status
                    var curStatus = $("#status2").html();
                    if (curStatus.length > 0) {
                        curStatus += "<br>";
                    }
                    $("#status2").html(curStatus + status);
                    curFileIdx++;
                    var newWidth = "width:" + (100 / fileCount * curFileIdx) + "%;";
                    $("#progress").attr("style", newWidth);
                    if (fileCount === curFileIdx) {
                        // last document -- display the OK button
                        $("#OK").removeAttr("disabled");
                    }
                };

                // read doc as appropriate
                if ((file.name.indexOf(".usfm") > 0) || (file.name.indexOf(".sfm") > 0)) {
                    readUSFMDoc(this.result);
                } else if (file.name.indexOf(".usx") > 0) {
                    readUSXDoc(this.result);
                           
                } else if (file.name.indexOf(".xml") > 0) {
                    readXMLDoc(this.result);
                } else {
                    // something else -- try reading it as a text document
                    readTextDoc(this.result);
                }
            };
            reader.readAsText(file);
        },
        
        // ImportDocumentView
        // Select and import documents (txt, usfm, sfm, usx, xml) into 
        // AIM from the device or PC, depending on where AIM is run from. 
        ImportDocumentView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplImportDoc),
            ////
            // Event Handlers
            ////
            events: {
                "change #selFile": "browserImportDocs",
                "click #Import": "mobileImportDocs",
                "click .c": "onClickFileRow",
                "click #OK": "onOK"
            },
            // Handler for when the user checks / unchecks a file in the list.
            // Looks to see if there are any files selected, and if so, enables
            // the Import button.
            onClickFileRow: function (event) {
                var found = false;
                // if there is at least one selected row, enable the import button
                if ($(event.currentTarget).is(':checked') === true) {
                    // easy answer -- the current target is checked, so enable
                    found = true;
                } else {
                    // harder answer -- check _all_ the file rows
                    $("tr").each(function () {
                        if ($(this).find(".c").is(':checked') === true) {
                            found = true;
                        }
                    });
                }
                if (found === false) {
                    $("#Import").attr('disabled', true);
                } else {
                    $("#Import").removeAttr('disabled');
                }
            },
            // Handler for when the user clicks the Select button
            // (this is the html <input type=file> element  displayed for the browser only) --
            // file selections are returned by the browser in the event.currentTarget.files array
            browserImportDocs: function (event) {
                console.log("browserImportDocs");
                $(".topcoat-progress-bar").show();
                $("#progress").attr("style", "width: 0%;");
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
            // Handler for the Import button click event (mobile only) -
            // this handler is more of a manual process than the browserImportDocs handler;
            // we need to look at the checkboxes in the <tr> rows and gather the file paths
            // from that list, then reconstitute file objects from the paths using the
            // cordova-plugin-file / filesystem API.
            mobileImportDocs: function (event) {
                console.log("mobileImportDocs");
                $(".topcoat-progress-bar").show();
                $("#progress").attr("style", "width: 0%;");
                // find all the selected files
                var selected = [];
                $("tr").each(function () {
                    if ($(this).find(".c").is(':checked') === true) {
                        selected.push($(this).find(".c").attr('id'));
                    }
                });
                fileCount = selected.length;
                // Get a "real" file object for each of the selected files.
                // This requires using the html5 filesystem API.
                var fileindex = 0;
                var i = 0;
                var project = this.model;
                var processFile = function (url) {
                    window.resolveLocalFileSystemURL(url,
                        function (entry) {
                            entry.file(
                                function (file) {
                                    importFile(file, project);
                                },
                                function (error) {
                                    console.log("FileEntry.file error: " + error.code);
                                }
                            );
                        },
                        function (error) {
                            console.log("resolveLocalFileSystemURL error: " + error.code);
                        });
                };
                while (fileindex < selected.length) {
                    // process just the selected ones in the file list
                    i = selected[fileindex];
                    console.log(i + ", fileList: " + fileList[i]);
                    processFile(fileList[selected[fileindex]]);
                    fileindex++;
                }
            },
            // Handler for the OK button -- just returns to the home screen.
            onOK: function (event) {
                // save the model
                this.model.trigger('change');
                // head back to the home page
                window.history.go(-1);
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
                
                // cheater way to tell if running on mobile device
                if (window.sqlitePlugin) {
                    // running on device -- use cordova file plugin to select file
                    $("#browserSelect").hide();
                    var localURLs    = [
                        cordova.file.dataDirectory,
                        cordova.file.documentsDirectory,
                        cordova.file.externalApplicationStorageDirectory,
                        cordova.file.externalCacheDirectory,
                        cordova.file.externalRootDirectory,
                        cordova.file.externalDataDirectory,
                        cordova.file.sharedDirectory,
                        cordova.file.syncedDataDirectory
                    ];
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
                                        if ((entries[i].name.indexOf(".txt") > 0) ||
                                                (entries[i].name.indexOf(".usx") > 0) ||
                                                (entries[i].name.indexOf(".usfm") > 0) ||
                                                (entries[i].name.indexOf(".sfm") > 0) ||
                                                (entries[i].name.indexOf(".xml") > 0)) {
                                            fileList[index] = entries[i].toURL();
                                            fileStr += "<tr><td><label class='topcoat-checkbox'><input class='c' type='checkbox' id='" + index + "'><div class='topcoat-checkbox__checkmark'></div></label><td><span class='n'>" + entries[i].fullPath + "</span></td></tr>";
                                            index++;
                                        }
                                    }
                                }
                                statusStr += fileStr;
                                if (statusStr.length > 0) {
                                    $("#mobileSelect").html("<table class=\"topcoat-table\"><colgroup><col style=\"width:2.5rem;\"><col></colgroup><thead><tr><th></th><th>" + i18n.t('view.lblName') + "</th></tr></thead><tbody id=\"tb\"></tbody></table><div><button class=\"topcoat-button\" id=\"Import\" disabled>" + i18n.t('view.lblImport') + "</button></div>");
                                    $("#tb").html(statusStr);
                                    $("#OK").attr("disabled", true);
                                } else {
                                    // nothing to select -- inform the user
                                    $("#mobileSelect").html("<span class=\"topcoat-notification\">!</span> <em>" + i18n.t('view.dscNoDocumentsFound') + "</em>");
                                    $("#OK").removeAttr("disabled");
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
                        }
                    }
                } else {
                    // running in browser -- use html <input> to select file
                    $("#mobileSelect").hide();
                }
            }
        }),
        
        ExportDocumentView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplImportDoc)
        });
    
    return {
        ImportDocumentView: ImportDocumentView,
        ExportDocumentView: ExportDocumentView
    };

});
