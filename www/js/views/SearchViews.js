/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Underscore  = require('underscore'),
        Handlebars  = require('handlebars'),
        Backbone    = require('backbone'),
        Marionette  = require('marionette'),
        chapterModels   = require('app/models/chapter'),
        bookModels      = require('app/models/book'),
        tplChapterList  = require('text!tpl/ChapterList.html'),
        tplLookup     = require('text!tpl/Lookup.html'),
        template = null,
        
        NoChildrenView = Marionette.ItemView.extend({
            template: Handlebars.compile("<div id=\"nochildren\"></div>")
        }),
        
        ChildrenView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplChapterList)
        }),

        ChapterListView = Marionette.CollectionView.extend({
            childView: ChildrenView,
            emptyView: NoChildrenView,

            initialize: function () {
                this.collection.on("reset", this.render, this);
            }

        }),

        LookupView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplLookup),

            initialize: function () {
                this.chapterList = new chapterModels.ChapterCollection();
                this.bookList = new bookModels.BookCollection();
                this.render();
            },

            render: function () {
                template = Handlebars.compile(tplLookup);
                this.$el.html(template());
                this.listView = new ChapterListView({collection: this.chapterList, el: $(".chapter-list", this.el)});
                return this;
            },

            events: {
                "input #search":    "search",
                "focus #book":          "onFocusBook",
                "change #book":         "onSelectBook"
            },
            
            onShow: function () {
                var options = "";
                this.bookList.fetch({reset: true, data: {projectid: this.model.get('projectid')}});
                this.bookList.each(function (model, index) {
                    options += "<option value=\"" + model.get("name") +  "\">" + model.get("name") + "</option>";
                });
                $("#book").html(options);
                $("#book").val("");
                $("#search").focus();
            },
            
            search: function (event) {
                if (event.keycode === 13) { // enter key pressed
                    event.preventDefault();
                }
                var key = $('#search').val();
                this.chapterList.fetch({reset: true, data: {name: key}});
                if (this.chapterList.length > 0) {
                    $("#lblChooseChapter").removeAttr("style");
                } else {
                    $("#lblChooseChapter").attr("style", "display:none");
                }
            },

            onFocusBook: function (event) {
                $("#book").val("");
            },

            onSelectBook: function (event) {
                var key = $('#book').val().trim();
                // find each chapter of this book in the chapterlist collection
                this.chapterList.fetch({reset: true, data: {name: key}});
                if (this.chapterList.length > 0) {
                    $("#lblChooseChapter").removeAttr("style");
                } else {
                    $("#lblChooseChapter").attr("style", "display:none");
                }
            }
        });
            
    return {
        LookupView: LookupView,
        ChapterListView: ChapterListView
    };
});