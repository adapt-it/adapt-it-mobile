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
//        sax             = require('sax'),
        tplImportDoc    = require('text!tpl/CopyOrImport.html'),
        projModel       = require('app/models/project'),
        bookModel       = require('app/models/book'),
        spModel         = require('app/models/sourcephrase'),
        chapModel       = require('app/models/chapter'),
        scrIDs          = require('app/utils/scrIDs'),
        lines           = [],
        fileList        = [],
        importFile      = function (file, project) {
            var status = "";
            var reader = new FileReader();
            var i = 0;
            var name = "";
            var doc = null;
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
                    chapter = null,
                    book = null,
                    books = new bookModel.BookCollection(),
                    chapters = new chapModel.ChapterCollection(),
                    sourcePhrases = new spModel.SourcePhraseCollection(),
                    arr = [],
                    bookID = "",
                    chapterID = "",
                    spID = "";
                var readTextDoc = function (contents) {
                    var re = /\s+/;
                    var newline = new RegExp('[\n\r\f\u2028\u2029]+', 'g');
                    var prepunct = "";
                    var follpunct = "";
                    var needsNewLine = false;
                    var sp = null;
                    console.log("Fallback -- reading text file");
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
                    for (i = 0; i < arr.length; i++) {
                        // text becomes a new SourcePhrase, <p> and punctuation become markers / punct
                        if (arr[i] === "<p>") {
                            // newline -- make a note and keep going
                            needsNewLine = true;
                            continue;
                        }
                        if (arr[i].length === 0) {
                            continue; // blank entry -- skip
                        }
                        // punctuation -- have to check our punctuation pairs
//                                if (false) {
//                                    // is this before or after a space? <<<<<<<<<<<<<<<<
//                                    break;
//                                }
                        // if we got here, it's a regular SourcePhrase word. Create a new SP and add any LF / punctuation
                        spID = Underscore.uniqueId();
                        sp = new spModel.SourcePhrase({
                            spid: spID,
                            chapterid: chapterID,
                            markers: (needsNewLine === true) ? "\\p" : "",
                            orig: null,
                            prepuncts: "",
                            midpuncts: "",
                            follpuncts: "",
                            source: arr[i],
                            target: ""
                        });
                        index++;
                        sourcePhrases.add(sp);
                        sp.trigger('change');
                        needsNewLine = false;
                    }
                    // for non-scripture texts, there are no verses. Keep track of how far we are by using a 
                    // negative value for the # of SourcePhrases in the text.
                    chapter.set('versecount', -(index));
//                            chapter.trigger('change');
                    // Update the status string
                    if (status.length > 0) {
                        status += "<br>";
                    }
                    status += i18n.t("view.dscCopyDocumentFound", {document: bookName});
                };
                var readXMLDoc = function (contents) {
                    var re = /\s+/;
                    var newline = new RegExp('[\n\r\f\u2028\u2029]+', 'g');
                    var prepunct = "";
                    var follpunct = "";
                    var needsNewLine = false;
                    var sp = null;
                    var xmlDoc = $.parseXML(contents);
                    console.log("Reading XML file");
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
                    var $xml = $(xmlDoc);
                    $.get($xml, function (toc) {
                        function processSP() {
                            // test for new Chapter
                            // if (this.m.indexof("\\c ") > -1) {
                            // // > create a chapter -- use new chapterID
                            // }
                            //
//                                    spID = Underscore.uniqueId();
//                                    sp = new spModel.SourcePhrase({
//                                        spid: spID,
//                                        chapterid: chapterID,
//                                        markers: (needsNewLine === true) ? "\\p" : "",
//                                        orig: null,
//                                        prepuncts: "",
//                                        midpuncts: "",
//                                        follpuncts: "",
//                                        source: arr[i],
//                                        target: ""
//                                    });
//                                    index++;
//                                    sourcePhrases.add(sp);
//                                    sp.trigger('change');                                    
                        }
                        $xml.children().each(processSP);
                    });
                    $($xml.find("S")).each(function (index) {
                        console.log(index + ": " + $(this).text());

                    });
                    // add chapters
                    // add sourcephrases
                    if (status.length > 0) {
                        status += "<br>";
                    }
                    status += i18n.t("view.dscCopyDocumentFound", {document: bookName});
                };
                var readUSFMDoc = function (contents) {
                    console.log("Reading USFM file");
                    // find the ID of this book
                    var scrIDList = new scrIDs.ScrIDCollection();
                    var firstChapterID = "";
                    scrIDList.fetch({reset: true, data: {id: ""}});
                    index = contents.indexOf("\\id");
                    if (index === -1) {
                        // no ID found -- just return
                        return null;
                    }
                    scrID = scrIDList.where({id: contents.substr(index + 4, 3)})[0];
                    arr = scrID.get('chapters');
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
                    // add a book and chapters
                    bookID = Underscore.uniqueId();
                    book = new bookModel.Book({
                        bookid: bookID,
                        projectid: project.get('id'),
                        scrid: scrID.get('id'),
                        name: bookName,
                        filename: file.name,
                        chapters: arr
                    });
                    books.add(book);
                    book.trigger('change');
                    firstChapterID = chapterID = Underscore.uniqueId();
                    for (i = 0; i < arr.length; i++) {
                        // book ID + chapter #, padded with zeros (using slice to get last 3 digits)
//                                    id: proj.get('id') + ".." + scrID.get('id') + ("00" + (i + 1)).slice(-3),
                        chapter = new chapModel.Chapter({
                            chapterid: chapterID,
                            bookid: bookID,
                            projectid: project.get('id'),
                            name: (bookName + " " + (i + 1)),
                            lastadapted: 0,
                            versecount: arr[i]
                        });
                        chapterID = Underscore.uniqueId();
                        chapters.add(chapter);
                        chapter.trigger('change');
                    }
                    if (project.get('lastAdaptedBookID') === 0) {
                        project.set('lastAdaptedBookID', bookID);
                        project.set('lastAdaptedChapterID', firstChapterID);
                    }
                    if (project.get('lastAdaptedName') === "") {
                        // TODO: localization of chapter numbers?
                        project.set('lastAdaptedName', bookName + " 1");
                    }
                    // build SourcePhrases
//                        while (i < contents.length) {
                    if (status.length > 0) {
                        status += "<br>";
                    }
                    status += i18n.t("view.dscCopyDocumentFound", {document: bookName});
                };

                // read doc as appropriate
                if ((file.name.indexOf(".usfm") > 0) || (file.name.indexOf(".sfm") > 0)) {
                    readUSFMDoc(this.result);
                } else if (file.name.indexOf(".xml") > 0) {
                    readXMLDoc(this.result);
                } else {
                    // something else -- try reading it as a text document
                    readTextDoc(this.result);
                }
                // set the lastDocument / lastAdapted<xxx> values if not already set
                if (project.get('lastDocument') === "") {
                    project.set('lastDocument', name);
                }
                if (project.get('lastAdaptedName') === "") {
                    // TODO: localization of chapter numbers?
                    project.set('lastAdaptedName', bookName + " 1");
                }
                // done -- display the OK button
                $("#lblStatus").html(status);
                $("#OK").show();
            };
            reader.readAsText(file);
        },

        ImportDocumentView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplImportDoc),
            events: {
                "change #selFile": "browserImportDocs",
                "click #Import": "mobileImportDocs",
                "click .c": "onClickFileRow",
                "click #OK": "onOK"
            },
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
            browserImportDocs: function (event) {
                // click on the html <input type=file> element (browser only) --
                // file selections are in event.currentTarget.files
                console.log("browserImportDocs");
                var fileindex = 0;
                var files = event.currentTarget.files;
                // each of the files items is a file object already; there's no need to use
                // the file plugin like we need to below. Just call importFile() directly.
                while (fileindex < files.length) {
                    importFile(files[fileindex], this.model);
                    fileindex++;
                }
            },
            mobileImportDocs: function (event) {
                // click on the import button (mobile only) --
                // file selections are the checkboxes in the <tr> rows
                console.log("mobileImportDocs");
                // find all the selected files
                var selected = [];
                $("tr").each(function () {
                    if ($(this).find(".c").is(':checked') === true) {
                        selected.push($(this).find(".c").attr('id'));
                    }
                });
                // Get a "real" file object for each of the selected files.
                // This requires using the html5 filesystem API.
                var fileindex = 0;
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
                while (fileindex < fileList.length) {
                    processFile(fileList[fileindex]);
                    fileindex++;
                }
            },
            onOK: function (event) {
                // save the model
                this.model.trigger('change');
                // head back to the home page
                window.history.go(-1);
            },

            onShow: function () {
//                $("#selFile").attr("accept", ".xml,.usfm");
                $("#title").html(i18n.t('view.lblImportDocuments'));
                $("#lblDirections").html(i18n.t('view.dscImportDocuments'));
                $("#OK").hide();
                // cheater way to tell if running on mobile device
                if (window.sqlitePlugin) {
                    // running on device -- use cordova file plugin to select file
                    $("#browserSelect").hide();
//                    localURL = cordova.file.dataDirectory;
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
                                } else {
                                    // nothing to select -- inform the user
                                    $("#mobileSelect").html("<span class=\"topcoat-notification\">!</span> <em>" + i18n.t('view.dscNoDocumentsFound') + "</em>");
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
                        if (localURLs[i] === null || localURLs[i].length === 0) {
                            continue; // skip blank / non-existent paths for this platform
                        }
                        window.resolveLocalFileSystemURL(localURLs[i], addFileEntry, addError);
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