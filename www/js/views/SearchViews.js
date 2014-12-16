/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Handlebars  = require('handlebars'),
        Backbone    = require('backbone'),
        Marionette  = require('marionette'),
        chapterModels   = require('app/models/chapter'),
        bookModels      = require('app/models/book'),
        tplChapterList  = require('text!tpl/ChapterList.html'),
        tplLookup     = require('text!tpl/Lookup.html'),
        template = null,

        ChapterListView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplChapterList),

            initialize: function () {
                this.render();
                this.collection.on("reset", this.render, this);
            }

//            render: function () {
//                this.$el.html(template(this.collection.toJSON()));
//                return this;
//            }

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
                this.listView = new ChapterListView({collection: this.chapterList, el: $(".scroller", this.el)});
                return this;
            },

            events: {
                "keyup .search-key":    "search",
                "keypress .search-key": "onkeypress",
                "change #book":         "onSelectBook"
            },

            search: function (event) {
                var key = $('.search-key').val();
                this.chapterList.fetch({reset: true, data: {name: key}});
            },

            onkeypress: function (event) {
                if (event.keycode === 13) { // enter key pressed
                    event.preventDefault();
                }
            },

            onSelectBook: function (event) {
                var key = $('#book').val();
                this.chapterList.fetch({reset: true, data: {name: key}});
            }
        });
            
    return {
        LookupView: LookupView,
        ChapterListView: ChapterListView
    };
});