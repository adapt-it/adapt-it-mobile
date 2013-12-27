define(function (require) {

    "use strict";

    var $ = require('jquery'),
        Backbone = require('backbone'),
        Handlebars  = require('handlebars'),
        PageSlider = require('app/utils/pageslider'),
        HomeView = require('app/views/HomeView'),

        slider = new PageSlider($('body')),

        homeView = new HomeView();
    
    Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
    
        /* edb 13 Dev 2013: Handlebars doesn't directly perform conditional expression evaluation;
           this block was modified from the following post:
           http://stackoverflow.com/questions/8853396/logical-operator-in-a-handlebars-js-if-conditional
        */
        switch (operator) {
        case 'contains':
            return (v1.indexOf(v2) !== -1) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
        }
    });

    return Backbone.Router.extend({

        routes: {
            "": "home",
            "chapters/:id": "adaptChapter",
            "books/:id": "selectBook"
        },

        home: function () {
            homeView.delegateEvents();
            slider.slidePage(homeView.$el);
        },

        selectBook: function (id) {
            require(["app/models/book", "app/views/BookView"], function (models, BookView) {
                var book = new models.Book({id: id});
                book.fetch({
                    success: function (data) {
                        slider.slidePage(new BookView({model: data}).$el);
                    }
                });
            });
        },

        adaptChapter: function (id) {
            require(["app/models/chapter", "app/views/ChapterView"], function (models, ChapterView) {
                var chapter = new models.Chapter({id: id});
                chapter.fetch({
                    success: function (data) {
                        slider.slidePage(new ChapterView({model: data}).$el);
                    }
                });
            });
        }

    });

});