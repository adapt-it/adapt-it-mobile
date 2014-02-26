/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Handlebars  = require('handlebars'),
        Backbone    = require('backbone'),
        ChapterListView = require('app/views/ChapterListView'),
        chapterModels   = require('app/models/chapter'),
        bookModels      = require('app/models/book'),
        tplText     = require('text!tpl/Lookup.html'),
        template    = Handlebars.compile(tplText);


    return Backbone.View.extend({

        initialize: function () {
            this.chapterList = new chapterModels.ChapterCollection();
            this.bookList = new bookModels.BookCollection();
            this.render();
        },

        render: function () {
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
});