/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $               = require('jquery'),
        Backbone        = require('backbone'),
        Handlebars      = require('handlebars'),
        Helpers         = require('app/utils/HandlebarHelpers'),
        Marionette      = require('marionette'),
        HomeViews       = require('app/views/HomeViews'),
        HelpView        = require('app/views/HelpView'),
        ProjectViews    = require('app/views/ProjectViews'),
        DocumentViews   = require('app/views/DocumentViews'),
        SearchViews     = require('app/views/SearchViews'),
        AdaptViews      = require('app/views/AdaptViews'),
        projModel       = require('app/models/project'),
        chapterModel    = require('app/models/chapter'),
        bookModel       = require('app/models/book'),
        spModel         = require('app/models/sourcephrase'),
        AppRouter       = require('app/router'),
        FastClick       = require('fastclick'),
        PageSlider      = require('app/utils/pageslider'),
        slider          = new PageSlider($('body')),
        lookupView      = null,
        helpView        = null,
        newProjectView  = null,
        editProjectView = null,
        copyProjectView = null,
        homeView        = null,
        importDocView   = null,
        db              = null,
        i18n            = require('i18n'),
        lang            = "",
        models          = [],
        locale          = "en-AU",  // default


        Application = Marionette.Application.extend({
            // app initialization code. Here we'll initialize localization with the current locale 
            initialize: function (options) {
                // add the UI regions (just the main "content" for now)
                this.addRegions({
                    main: '#main'
                });
                // main Region's show event handler -- we use it to do
                // page transition animations.
                this.main.on("show", function (view) {
                  // manipulate the `view` or do something extra
                  // with the region via `this`
                    slider.slidePage(view.$el);
                });
                // sqlitePlugin -- available on DeviceReady (mobile app)
                if (window.sqlitePlugin) {
                    this.db = window.sqlitePlugin.openDatabase({name: "AIM"});
                } else {
                    // running in browser -- use WebSQL (Chrome / Safari ONLY)
                    this.db = openDatabase('AIM', '1', 'AIM database', 2 * 1024 * 1024);
                }
                // create model collections off the Application object
                this.BookList = null;
                this.ProjectList = null;
                this.ChapterList = null;
                this.spList = null;

                // get the user's locale - mobile or web
                if (typeof navigator.globalization !== 'undefined') {
                    // on mobile phone
//                    navigator.globalization.getPreferredLanguage(
//                        function (language) {alert('language: ' + language.value + '\n');},
//                        function () {alert('Error getting language\n');}
//                    );
                    navigator.globalization.getLocaleName(
                        function (loc) {
                            locale = loc.value;
                        },
                        function () {console.log('Error getting locale\n'); }
                    );
                } else {
                    // in web browser
                    lang = (navigator.languages) ? navigator.languages[0] : (navigator.language || navigator.userLanguage);
                    locale = lang.split("-")[0];
                }
//                console.log("locale:" + locale);
                // initialize / load the localization info
                i18n.init({
                    lng: locale,
                    debug: true,
                    fallbackLng: 'en'
                }, function () {
                    // Callback when i18next is finished initializing
                    
                    // Load any app-wide collections
                    window.Application.BookList = new bookModel.BookCollection();
                    window.Application.BookList.fetch({reset: true, data: {name: ""}});
                    window.Application.ProjectList = new projModel.ProjectCollection();
                    window.Application.ProjectList.fetch({reset: true, data: {name: ""}});
                    window.Application.ChapterList = new chapterModel.ChapterCollection();
                    window.Application.ChapterList.fetch({reset: true, data: {name: ""}});
                    // Note: sourcephrases are not held as a singleton (for a NT, this could result in ~300MB of memory) --
                    // Instead, they are instantiated on the pages that need them
                    // (DocumentViews for doc import/export and AdaptViews for adapting)

                    // Tell backbone we're ready to start loading the View classes.
                    Backbone.history.start();
                });

                // initialize the router
                var router  = new AppRouter({controller: this});

                // Attach touch screen function to avoid delay in double-click
                $(function () {
                    FastClick.attach(document.body);
                });

                // Process back arrow button event 
                // (not the one in the browser, the one we render on our html page).
                $("body").on("click", ".back-button", function (event) {
                    event.preventDefault();
                    window.history.back();
                });
            },
            
            // Routes from AppRouter (router.js)
            home: function () {
                // First, look for projects in the project list that aren't complete;
                // this can happen if the user clicks the back button before completing the 
                // new project wizard. These objects with no id defined are only in memory;
                // once the source and target language are defined, an id is set and
                // the project is saved in the device's localStorage.
                this.ProjectList.fetch({reset: true, data: {name: ""}});
                this.ProjectList.each(function (model, index) {
//                    console.log("Model: " + model.get('id'));
                    if (model.get('id') === 0) {
                        // empty project -- mark for removal
                        models.push(model);
                    }
                });
                // remove the half-completed project objects
                if (models.length > 0) {
                    this.ProjectList.remove(models);
                }
                // now display the home view
                homeView = new HomeViews.HomeView({collection: this.ProjectList});
                homeView.delegateEvents();
                this.main.show(homeView);
            },

            help: function () {
                helpView = new HelpView();
                helpView.delegateEvents();
                this.main.show(helpView);
            },

            editProject: function (id) {
                // edit the selected project
                var proj = this.ProjectList.where({id: id});
                if (proj !== null) {
                    window.Application.main.show(new ProjectViews.EditProjectView({model: proj[0]}));
                }
            },

            copyProject: function () {
                var proj = new projModel.Project();
                copyProjectView = new ProjectViews.CopyProjectView({model: proj});
                copyProjectView.delegateEvents();
                this.ProjectList.add(proj);
                this.main.show(copyProjectView);
            },
            
            newProject: function () {
                var proj = new projModel.Project();
                newProjectView = new ProjectViews.NewProjectView({model: proj});
                newProjectView.delegateEvents();
                this.ProjectList.add(proj);
                this.main.show(newProjectView);
            },
            
            importBooks: function (id) {
                console.log("importBooks");
                var proj = this.ProjectList.where({id: id});
                if (proj === null) {
                    console.log("no project defined");
                }
                importDocView = new DocumentViews.ImportDocumentView({model: proj[0]});
                importDocView.delegateEvents();
                this.main.show(importDocView);
            },
            
            lookupChapter: function (id) {
                console.log("lookupChapter");
                var proj = this.ProjectList.where({id: id});
                if (proj !== null) {
                    lookupView = new SearchViews.LookupView({model: proj[0]});
                    window.Application.main.show(lookupView);
                } else {
                    console.log("no project defined");
                }
            },

            adaptChapter: function (id) {
                console.log("adaptChapter");
                // refresh the models
                this.ChapterList.fetch({reset: true, data: {name: ""}});
                this.BookList.fetch({reset: true, data: {name: ""}});
                this.ProjectList.fetch({reset: true, data: {name: ""}});
                // find the chapter we want to adapt
                var chapter = this.ChapterList.findWhere({chapterid: id});
                if (chapter) {
                    var theView = new AdaptViews.ChapterView({model: chapter});
                    var proj = this.ProjectList.where({id: chapter.get('projectid').toString()})[0];
                    var book = this.BookList.where({bookid: chapter.get('bookid').toString()})[0];
                    theView.project = proj;
                    // update the last adapted book and chapter
                    if (proj) {
                        proj.set('lastDocument', book.get('name'));
                        proj.set('lastAdaptedBookID', chapter.get('bookid'));
                        proj.set('lastAdaptedChapterID', chapter.get('chapterid'));
                        proj.set('lastAdaptedName', chapter.get('name'));
                    }
                    window.Application.main.show(theView);
//                    window.Application.main.show(new AdaptViews.ChapterView({model: chapter}));
                } else {
                    console.log("No chapter found matching id:" + id);
                }
            }
        });
    
    return {
        Application: Application
    };
});