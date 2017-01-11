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
        langView        = null,
        newProjectView  = null,
        editProjectView = null,
        copyProjectView = null,
        homeView        = null,
        importDocView   = null,
        exportDocView   = null,
        db              = null,
        router          = null,
        i18n            = require('i18n'),
        lang            = "",
        models          = [],
        locale          = "en-AU",  // default


        Application = Marionette.Application.extend({
            filterlist: "",
            currentProject: null,
            
            // app initialization code. Here we'll initialize localization with the current locale 
            initialize: function (options) {
                // callback function to initialize / load the localization info
                var initialize_i18n = function (locale) {
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
                };
                // typeahead contenteditable workaround
                var original = $.fn.val;
                $.fn.val = function () {
                    if ($(this).is('*[contenteditable=true]')) {
                        return $.fn.html.apply(this, arguments);
                    }
                    return original.apply(this, arguments);
                };
                
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
                    // edb 12/20/16 - issue #204: moved the database out of the apps data directory, as it will
                    // get deleted along with the app. 
                    // test for older database location
                    // open the database
                    this.db = window.sqlitePlugin.openDatabase({name: "AIM", location: 'default'});
//                    if (device.platform === "iOS") {
//                        // ios
//                        this.db = window.sqlitePlugin.openDatabase({name: "AIM", iosDatabaseLocation: 'Documents'});   
//                    } else if (device.platform === "Android") {
//                        // android
//                        this.db = window.sqlitePlugin.openDatabase({name: "AIM", androidDatabaseLocation: externalDataDirectoryEntry.toURL()});
//                    } else {
//                        // windows?
//                        this.db = window.sqlitePlugin.openDatabase({name: "AIM", location: 'default'});
//                    }
                } else {
                    // running in browser -- use WebSQL (Chrome / Safari ONLY)
                    this.db = openDatabase('AIM', '1', 'AIM database', 2 * 1024 * 1024);
                }
                // create model collections off the Application object
                this.BookList = null;
                this.ProjectList = null;
                this.ChapterList = null;
                this.spList = null;

                // did the user specify a custom language?
                if (localStorage.getItem("UILang")) {
                    // custom language
                    initialize_i18n(localStorage.getItem("UILang"));
                } else {
                    // use normal locale settings
                    // get the user's locale - mobile or web
                    if (typeof navigator.globalization !== 'undefined') {
                        navigator.globalization.getPreferredLanguage( // per docs, falls back on getLocaleName
                            function (loc) {
                                locale = loc.value.split("-")[0];
                                initialize_i18n(locale);
                            },
                            function () {console.log('Error getting locale\n'); }
                        );
                    } else {
                        // in web browser
                        lang = (navigator.languages) ? navigator.languages[0] : (navigator.language || navigator.userLanguage);
                        locale = lang.split("-")[0];
                        initialize_i18n(locale);
                    }
                }

                // initialize the router
                this.router = new AppRouter({controller: this});

                
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
                $.when(this.ProjectList.fetch({reset: true, data: {name: ""}})).done(function () {
                    window.Application.ProjectList.each(function (model, index) {
    //                    console.log("Model: " + model.get('id'));
                        if (model.get('projectid') === "") {
                            // empty project -- mark for removal
                            models.push(model);
                        }
                    });
                    // remove the half-completed project objects
                    if (models.length > 0) {
                        window.Application.ProjectList.remove(models);
                    }
                    if (window.Application.currentProject === null) {
                        // pick the first project in the list, if there is one
                        window.Application.currentProject = window.Application.ProjectList.at(0);
                    }
                    // now display the home view
                    homeView = new HomeViews.HomeView({model: window.Application.currentProject});
                    homeView.delegateEvents();
                    window.Application.main.show(homeView);
                });
            },
            
            checkDBSchema: function () {
                // verify we're on the latest DB schema (upgrade if necessary)
                projModel.checkSchema();
            },

            help: function () {
                helpView = new HelpView();
                helpView.delegateEvents();
                this.main.show(helpView);
            },
            
            setUILanguage: function () {
                langView = new HomeViews.UILanguageView();
                langView.delegateEvents();
                window.Application.main.show(langView);
            },

            editProject: function (id) {
                // edit the selected project
                var proj = this.ProjectList.where({projectid: id});
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
                // update the book and chapter lists, then show the import docs view
                $.when(window.Application.BookList.fetch({reset: true, data: {name: ""}})).done(function () {
                    $.when(window.Application.ChapterList.fetch({reset: true, data: {name: ""}})).done(function () {
                        var proj = window.Application.ProjectList.where({projectid: id});
                        if (proj === null) {
                            console.log("no project defined");
                        }
                        importDocView = new DocumentViews.ImportDocumentView({model: proj[0]});
                        importDocView.delegateEvents();
                        window.Application.main.show(importDocView);
                    });
                });
            },

            exportBooks: function (id) {
                console.log("exportBooks");
                // update the book and chapter lists, then show the export docs view
                $.when(window.Application.BookList.fetch({reset: true, data: {name: ""}})).done(function () {
                    $.when(window.Application.ChapterList.fetch({reset: true, data: {name: ""}})).done(function () {
                        var proj = window.Application.ProjectList.where({projectid: id});
                        if (proj === null) {
                            console.log("no project defined");
                        }
                        exportDocView = new DocumentViews.ExportDocumentView({model: proj[0]});
                        exportDocView.delegateEvents();
                        window.Application.main.show(exportDocView);
                    });
                });
            },
            
            lookupChapter: function (id) {
                console.log("lookupChapter");
                var proj = this.ProjectList.where({projectid: id});
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
                window.Application.BookList.fetch({reset: true, data: {name: ""}});
                $.when(window.Application.ProjectList.fetch({reset: true, data: {name: ""}})).done(function () {
                    $.when(window.Application.ChapterList.fetch({reset: true, data: {name: ""}})).done(function () {
                        // find the chapter we want to adapt
                        var chapter = window.Application.ChapterList.findWhere({chapterid: id});
                        if (chapter) {
                            var theView = new AdaptViews.ChapterView({model: chapter});
                            var proj = window.Application.ProjectList.where({projectid: chapter.get('projectid').toString()})[0];
                            var book = window.Application.BookList.where({bookid: chapter.get('bookid').toString()})[0];
                            theView.project = proj;
                            // update the last adapted book and chapter
                            if (proj) {
                                window.Application.filterList = proj.get('FilterMarkers'); // static (always ON) filters + whatever is specified for the project
                                proj.set('lastDocument', book.get('name'));
                                proj.set('lastAdaptedBookID', chapter.get('bookid'));
                                proj.set('lastAdaptedChapterID', chapter.get('chapterid'));
                                proj.set('lastAdaptedName', chapter.get('name'));
                                proj.save();
                                window.Application.currentProject = proj;
                            }
                            window.Application.main.show(theView);
                        } else {
                            console.log("No chapter found matching id:" + id);
                        }
                    });
                });
            }
        });
    
    return {
        Application: Application
    };
});