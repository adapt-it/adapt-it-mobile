/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        Handlebars  = require('handlebars'),
        i18n        = require('i18n'),
        PageSlider  = require('app/utils/pageslider'),
        HelpView    = require('app/views/HelpView'),
        HomeView    = require('app/views/HomeView'),
        WelcomeView = require('app/views/WelcomeView'),
        NewProjectView = require('app/views/NewProjectView'),
        LookupView  = require('app/views/LookupView'),
        projModel   = require('app/models/project'),
        slider      = new PageSlider($('body')),
        lookupView  = null,
        helpView    = null,
        newProjectView = null,
        welcomeView = null,
        homeView    = null;
    
    /** Handlebars helper methods **/
    Handlebars.registerHelper('t', function (i18n_key) {
        var result = i18n.t(i18n_key);
//        console.log(i18n_key + ":" + result);
        return new Handlebars.SafeString(result);
    });
    Handlebars.registerHelper('tr', function (context, options) {
        var opts = i18n.functions.extend(options.hash, context);
        if (options.fn) {
            opts.defaultValue = options.fn(context);
        }
        var result = i18n.t(opts.key, opts);

        return new Handlebars.SafeString(result);
    });
    Handlebars.registerHelper('chapter', function () {
        // extract and return the chapter number from the markers
        var result = parseInt(this.markers.substring(this.markers.indexOf('c') + 1), 10);
//        console.log(this.markers.substring(this.markers.indexOf('c')));
        return new Handlebars.SafeString(result);
    });
    Handlebars.registerHelper('verse', function () {
        // extract and return the verse number from the markers
        var result = parseInt(this.markers.substring(this.markers.indexOf('v') + 1), 10);
//        console.log(this.markers.substring(this.markers.indexOf('v') + 1));
        return new Handlebars.SafeString(result);
    });
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
            "":             "home",             // (top level)
            "welcome":      "welcome",          // #welcome (first-time landing page)
            "help":         "help",             // #help
            "project":      "project",          // #project
            "lookup":       "lookupChapter",    // #lookup
            "adapt/:id":    "adaptChapter"      // #adapt/RUT001 (3-letter ID of book + 3 digit chapter number)
        },

        home: function () {
            homeView = new HomeView();
            homeView.delegateEvents();
            slider.slidePage(homeView.$el);
        },
        
        help: function () {
            helpView = new HelpView();
            helpView.delegateEvents();
            slider.slidePage(helpView.$el);
        },
        
        welcome: function () {
            welcomeView = new WelcomeView();
            welcomeView.delegateEvents();
            slider.slidePage(welcomeView.$el);
        },
        
        project: function () {
            var proj = new projModel.Project();
            newProjectView = new NewProjectView({model: proj});
            newProjectView.delegateEvents();
            slider.slidePage(newProjectView.$el);
        },

        lookupChapter: function (id) {
            lookupView = new LookupView();
            require(["app/models/chapter", "app/views/LookupView"], function (models, LookupView) {
                var book = new models.Chapter({id: id});
                book.fetch({
                    success: function (data) {
                        slider.slidePage(new LookupView({model: data}).$el);
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