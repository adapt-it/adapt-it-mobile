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
        chapterView     = require('app/models/chapter'),
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
                var reader = new FileReader();
                var i = 0;
                var name = "";
                var doc = null;
                // callback for when the selected file finishes loading
                reader.onloadend = function (e) {
                    var value = "",
                        bookID = "",
                        chap = 0,
                        verse = 0,
                        index = 0,
                        s = "",
                        t = "",
                        markers = "",
                        orig = null,
                        prepuncts = "",
                        midpuncts = "",
                        follpuncts = "",
                        newSP = null,
                        arr = [];
                    var readXMLDoc = function (contents) {
                        console.log("Reading XML file");
                        // add chapters
                        // add sourcephrases
                        return doc;
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
                        // build SourcePhrases
//                        while (i < contents.length) {
//                            // get the next source word
////                            s = parseWord(contents, i);
//                            
//                            // build the SourcePhrase
//                            newSP = new spModel.SourcePhrase({
//                                id: bookID + chap + "-" + index,
//                                markers: "",
//                                orig: null,
//                                prepuncts: "",
//                                midpuncts: "",
//                                follpuncts: "",
//                                source: s,
//                                target: ""
//                            });
//                        }
                        // split out the .usfm file into an array (one entry per usfm tag)
//                        lines = contents.split("\\");
                        return doc;
                    };

                    // read doc as appropriate
                    if (name.indexOf(".usfm") > 0) {
                        doc = readUSFMDoc(this.result);
                    } else if (name.indexOf(".xml") > 0) {
                        doc = readXMLDoc(this.result);
                    } else {
                        // error out
                        console.log("Unrecognized document format");
                    }
                    // add to documents list
                    // doc = 

                    // done -- display the OK button
                    $("#OK").show();
                };
                // read each file
                for (i = 0; i < event.currentTarget.files.length; i++) {
                    name = event.currentTarget.files[i].name;
                    reader.readAsText(event.currentTarget.files[i]);
                }
            },
            onShow: function () {
                $("#selFile").attr("accept", ".xml,.usfm");
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