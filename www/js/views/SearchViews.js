/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

// SearchViews.js
// Passage / document lookup functionality. Allows the user to search for a document / book and chapter
// to start adapting.
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Handlebars  = require('handlebars'),
        Marionette  = require('marionette'),
        chapterModels   = require('app/models/chapter'),
        bookModels      = require('app/models/book'),
        spModels        = require('app/models/sourcephrase'),
        tplChapterList  = require('text!tpl/ChapterList.html'),
        tplLookup       = require('text!tpl/Lookup.html'),
        tplSourceList   = require('text!tpl/SearchSourceList.html'),
//        tplTargetList   = require('text!tpl/SearchTargetList.html'),
        chapTemplate    = Handlebars.compile(tplChapterList),
        template        = null,
        
        NoChildrenView = Marionette.ItemView.extend({
            template: Handlebars.compile("<div id=\"nochildren\"></div>")
        }),
        
        ChapterItemView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplChapterList)
        }),

        SourceItemView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplSourceList)
        }),

//        TargetItemView = Marionette.ItemView.extend({
//            template: Handlebars.compile(tplTargetList)
//        }),

        ChapterResultsView = Marionette.CollectionView.extend({
            childView: ChapterItemView,
            emptyView: NoChildrenView,

            initialize: function () {
                this.collection.on("reset", this.render, this);
            }

        }),

        SourceResultsView = Marionette.CollectionView.extend({
            childView: SourceItemView,
            emptyView: NoChildrenView,

            initialize: function () {
                this.collection.on("reset", this.render, this);
            }

        }),

//        TargetResultsView = Marionette.CollectionView.extend({
//            childView: TargetItemView,
//            emptyView: NoChildrenView,
//
//            initialize: function () {
//                this.collection.on("reset", this.render, this);
//            }
//
//        }),

        LookupView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplLookup),

            initialize: function () {
                this.chapterList = new chapterModels.ChapterCollection();
                this.bookList = new bookModels.BookCollection();
                this.SourceList = new spModels.SourcePhraseCollection();
//                this.TargetList = new spModels.SourcePhraseCollection();
                this.render();
            },

            events: {
                "input #search":    "search",
                "click .ttlbook":   "onSelectBook",
                "click #btnSearch": "onShowSearch",
                "click #btnSelectDocument": "onShowSelectDocument"
            },
            
            onShowSearch: function () {
                // show the chapters list
                $("#rdoSearch").prop("checked", true);
                $("#grpSearch").removeAttr("style");
                $("#grpSelectDocument").attr("style", "display:none");
            },
            
            onShowSelectDocument: function () {
                // show the source words list
                $("#rdoSelectDocument").prop("checked", true);
                $("#grpSearch").attr("style", "display:none");
                $("#grpSelectDocument").removeAttr("style");
            },
            
            onShow: function () {
                var lstBooks = "";
                this.bookList.fetch({reset: true, data: {projectid: this.model.get('projectid')}});
                this.bookList.each(function (model) {
                    lstBooks += "<h3 class=\"topcoat-list__header ttlbook\" id=\"ttl" + model.get("name") + "\">" + model.get("name") + "</h3><ul class=\"topcoat-list__container chapter-list\" id=\"lst" + model.get("name") + "\" style=\"display:none\"></ul>";
                });
                $("#lstBooks").html(lstBooks);
                // if there's only one book, "open" it and show the chapters
                if (this.bookList.length === 1) {
                    $("#lstBooks > h3").first().mouseup();
                }
                this.onShowSearch(); // show the search tab
                $("#search").focus();
            },
            
            search: function (event) {
                var lstChapters = "";
                if (event.keycode === 13) { // enter key pressed
                    event.preventDefault();
                }
                var key = $('#search').val();
                // hide the other chapters
                $("#lstBooks > ul").attr("style", "display:none");
                this.chapterList.fetch({reset: true, data: {name: key}});
                this.chapterList.each(function (model) {
                    lstChapters += chapTemplate(model.attributes);
                });
                if (this.chapterList.length > 0) {
                    $("#lstSearchResults").html(lstChapters);
                    $("#lblSearchResults").removeAttr("style");
                } else {
                    $("#lblSearchResults").attr("style", "display:none");
                }
            },

            onSelectBook: function (event) {
                var key = event.currentTarget.id.substr(3);
                var lstChapters = "";
                console.log("onSelectBook:" + key);
                // hide the other chapters
                $("#lstBooks > ul").attr("style", "display:none");
                $("#lst" + key).removeAttr("style");
                // find each chapter of this book in the chapterlist collection
                this.chapterList.fetch({reset: true, data: {name: key}});
                this.chapterList.each(function (model) {
                    lstChapters += chapTemplate(model.attributes);
                });
                if (this.chapterList.length > 0) {
                    $("#lst" + key).html(lstChapters);
                }
            }
        });
            
    return {
        LookupView: LookupView,
        SourceResultsView: SourceResultsView,
//        TargetResultsView: TargetResultsView,
        ChapterResultsView: ChapterResultsView
    };
});