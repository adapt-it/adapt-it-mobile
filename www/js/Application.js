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
        spModel         = require('app/models/sourcephrase'),
        AppRouter       = require('app/router'),
        FastClick       = require('fastclick'),
        PageSlider      = require('app/utils/pageslider'),
        slider          = new PageSlider($('body')),
        ProjectList     = null,
        ChapterList     = null,
        spList          = null,
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
                // get the user's locale - mobile or web
                if (typeof navigator.globalization !== 'undefined') {
                    // on mobile phone
//                    navigator.globalization.getPreferredLanguage(
//                        function (language) {alert('language: ' + language.value + '\n');},
//                        function () {alert('Error getting language\n');}
//                    );
                    navigator.globalization.getLocaleName(
                        function (loc) {
//                            alert('locale: ' + loc.value + '\n');
                            locale = loc.value;
                        },
                        function () {console.log('Error getting locale\n'); }
                    );
                } else {
//                    console.log("No navigator.globalization object - looking in browser");
                    // in web browser
                    lang = (navigator.languages) ? navigator.languages[0] : (navigator.language || navigator.userLanguage);
//                    console.log("lang: " + lang);
                    locale = lang.split("-")[0];
                }
//                console.log("locale:" + locale);
                // initialize / load the localization info
                i18n.init({
                    lng: locale,
                    debug: true,
                    fallbackLng: 'en'
                }, function () {
                    // i18next is done asynchronously; this is the callback function
                    // Tell backbone we're ready to start loading the View classes.
                    ProjectList = new projModel.ProjectCollection();
                    ProjectList.fetch({reset: true, data: {name: ""}});
                    ChapterList = new chapterModel.ChapterCollection();
                    ChapterList.fetch({reset: true, data: {name: ""}});
                    spList = new spModel.SourcePhraseCollection();
                    spList.fetch({reset: true, data: {name: ""}});

                    Backbone.history.start();
                });

                var router  = new AppRouter({controller: this});

                $(function () {
                    FastClick.attach(document.body);
                });

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
                ProjectList.each(function (model, index) {
                    console.log("Model: " + model.get('id'));
                    if (model.get('id') === 0) {
                        // empty project -- mark for removal
                        models.push(model);
                    }
                });
                // remove the half-completed project objects
                if (models.length > 0) {
                    ProjectList.remove(models);
                }
                // now display the home view
                homeView = new HomeViews.HomeView({collection: ProjectList});
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
                var proj = ProjectList.where({id: id});
                if (proj !== null) {
                    window.Application.main.show(new ProjectViews.EditProjectView({model: proj[0]}));
                }
            },

            copyProject: function () {
                var proj = new projModel.Project();
                copyProjectView = new ProjectViews.CopyProjectView({model: proj});
                copyProjectView.delegateEvents();
                ProjectList.add(proj);
                this.main.show(copyProjectView);
            },
            
            newProject: function () {
                var proj = new projModel.Project();
                newProjectView = new ProjectViews.NewProjectView({model: proj});
                newProjectView.delegateEvents();
                ProjectList.add(proj);
                this.main.show(newProjectView);
            },
            
            importBooks: function (id) {
                console.log("importBooks");
                var proj = ProjectList.where({id: id});
                if (proj === null) {
                    console.log("no project defined");
                    // TODO: how do we want this? ID as separate or in chapters?
                }
                importDocView = new DocumentViews.ImportDocumentView({model: proj[0]});
                importDocView.delegateEvents();
                this.main.show(importDocView);
            },
            
            lookupChapter: function (id) {
                console.log("lookupChapter");
                var proj = ProjectList.where({id: id});
                if (proj === null) {
                    console.log("no project defined");
                    // TODO: how do we want this? ID as separate or in chapters?
                }
                window.Application.main.show(new SearchViews.LookupView({model: proj}));
//                var book = new chapterModel.Chapter({id: id});
//                book.fetch({
//                    success: function (data) {
////                            slider.slidePage(new LookupView({model: data}).$el);
//                        window.Application.main.show(new SearchViews.LookupView({model: data}));
//                    }
//                });
            },

            adaptChapter: function (id) {
                console.log("adaptChapter");
                ChapterList.fetch({reset: true, data: {name: ""}});
                var chapter = ChapterList.findWhere({chapterid: id});
                if (chapter) {
                    window.Application.main.show(new AdaptViews.ChapterView({model: chapter}));
                } else {
                    console.log("no chapter found");
                }
            }
        });
    
    return {
        Application: Application
    };
});