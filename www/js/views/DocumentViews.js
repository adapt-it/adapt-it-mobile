/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $               = require('jquery'),
        Handlebars      = require('handlebars'),
        Backbone        = require('backbone'),
        Marionette      = require('marionette'),
        i18n            = require('i18n'),
        sax             = require('sax'),
        tplImportDoc    = require('text!tpl/CopyOrImport.html'),
        projModel       = require('app/models/project'),
        bookModel       = require('app/models/book'),
        spModel         = require('app/models/sourcephrase'),
        chapModel       = require('app/models/chapter'),
        bookIDs         = require('app/utils/bookIDs'),
        lines           = [],

        ImportDocumentView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplImportDoc),
            events: {
                "change #selFile": "importDocument",
                "click #OK": "onOK"
            },
            onOK: function (event) {
                // save the model
                this.model.trigger('change');
                // head back to the home page
                window.history.go(-1);
            },
            importDocument: function (event) {
                console.log("importDocument");
                var model = this.model;
                var status = "";
                var reader = new FileReader();
                var proj = this.model;
                var i = 0;
                var name = "";
                var doc = null;
                var files = event.currentTarget.files;
                var readFile = function (fileindex) {
                    if (fileindex >= files.length) {
                        return;
                    }
                    
                    var file = files[fileindex];
                    reader.onloadend = function (e) {
                        var value = "",
                            bookID = null,
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
                            arr = [];
                        var readTextDoc = function (contents) {
                            console.log("Fallback -- reading text file");
                            if (status.length > 0) {
                                status += "<br>";
                            }
                            status += i18n.t("view.dscCopyDocumentFound", {document: bookName});
                        };
                        var readXMLDoc = function (contents) {
                            console.log("Reading XML file");
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
                            var bookIDList = new bookIDs.BookIDCollection();
                            bookIDList.fetch({reset: true, data: {id: ""}});
                            index = contents.indexOf("\\id");
                            if (index === -1) {
                                // no ID found -- just return
                                return null;
                            }
                            bookID = bookIDList.where({id: contents.substr(index + 4, 3)})[0];
                            books.fetch({reset: true, data: {name: ""}});
                            if (books.where({id: (proj.get('id') + ".." + bookID)}).length > 0) {
                                // this book is already in the list -- just return
                                return null;
                            }
                            index = contents.indexOf("\\h ");
                            if (index > -1) {
                                // get the name from the usfm itself
                                bookName = contents.substr(index + 3, (contents.indexOf("\n", index) - (index + 3)));
                            }
                            // add a book and chapters
                            arr = bookID.get('chapters');
                            for (i = 0; i < arr.length; i++) {
                                // book ID + chapter #, padded with zeros (using slice to get last 3 digits)
                                chapters.add(new chapModel.Chapter({
                                    id: bookID.get('id') + ("00" + (i + 1)).slice(-3),
                                    name: (bookName + " " + (i + 1)),
                                    lastAdapted: 0,
                                    verseCount: arr[i]
                                }));
                            }
                            book = new bookModel.Book({
                                id: proj.get('id') + ".." + bookID.get('id'),
                                name: bookName,
                                chapters: arr
                            });
                            books.add(book);
                            book.trigger('change');
                            if (proj.get('lastAdaptedID') === "") {
                                if (bookID !== null) {
                                    proj.set('lastAdaptedID', bookID.get('id') + "001");
                                }
                            }
                            if (proj.get('lastAdaptedName') === "") {
                                // TODO: localization of chapter numbers?
                                proj.set('lastAdaptedName', bookName + " 1");
                            }
                            // build SourcePhrases
    //                        while (i < contents.length) {
                            if (status.length > 0) {
                                status += "<br>";
                            }
                            status += i18n.t("view.dscCopyDocumentFound", {document: bookName});
                        };

                        // read doc as appropriate
                        if (file.name.indexOf(".usfm") > 0) {
                            readUSFMDoc(this.result);
                        } else if (file.name.indexOf(".xml") > 0) {
                            readXMLDoc(this.result);
                        } else {
                            // something else -- try reading it as a text document
                            readTextDoc(this.result);
                        }
                        // set the lastDocument / lastAdapted<xxx> values if not already set
                        if (proj.get('lastDocument') === "") {
                            proj.set('lastDocument', name);
                        }
                        if (proj.get('lastAdaptedID') === "") {
                            if (bookID !== null) {
                                proj.set('lastAdaptedID', bookID.get('id') + "001");
                            }
                        }
                        if (proj.get('lastAdaptedName') === "") {
                            // TODO: localization of chapter numbers?
                            proj.set('lastAdaptedName', bookName + " 1");
                        }
                        // done -- display the OK button
                        $("#lblStatus").html(status);
                        $("#OK").show();
                        
                        readFile(fileindex + 1);
                    };
                    reader.readAsText(file);
                };
                readFile(0);
            },
            onShow: function () {
                $("#selFile").attr("accept", ".xml,.usfm");
                $("#selFile").attr("multiple", "true");
                $("#title").html(i18n.t('view.lblImportDocuments'));
                $("#lblDirections").html(i18n.t('view.dscImportDocuments'));
                $("#OK").hide();
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