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
        ProjectViews    = require('app/views/ProjectViews'),
        DocumentViews   = require('app/views/DocumentViews'),
        SearchViews     = require('app/views/SearchViews'),
        AdaptViews      = require('app/views/AdaptViews'),
        projModel       = require('app/models/project'),
        chapterModel    = require('app/models/chapter'),
        bookModel       = require('app/models/book'),
        spModel         = require('app/models/sourcephrase'),
        kbModels        = require('app/models/targetunit'),
        AppRouter       = require('app/router'),
        FastClick       = require('fastclick'),
        PageSlider      = require('app/utils/pageslider'),
        slider          = new PageSlider($('body')),
        lookupView      = null,
        langView        = null,
        newProjectView  = null,
        copyProjectView = null,
        homeView        = null,
        importDocView   = null,
        exportDocView   = null,
        showTransView   = null,
        i18n            = require('i18n'),
        lang            = "",
        models          = [],
        DB_NAME         = "AIM",
        db_dir          = "",
        locale          = "en-AU",  // default

        // Utility function from https://gist.github.com/nikdo/1b62c355dae50df6410109406689cd6e
        // https://stackoverflow.com/a/35940276/5763764
        getScrollableParent = function (element) {
            if (!element) {
                // falsey -- undefined / null / 0 all fit this
                return null;
            }
            return (element.scrollHeight > element.clientHeight)
                ? element : getScrollableParent(element.parentNode);
        },
        getContainerOffset = function (element, container) {
            return element.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
        },
        getCenterOffset = function (element, container) {
            return (container.getBoundingClientRect().height - element.getBoundingClientRect().height) / 2;
        },
        // https://stackoverflow.com/a/8918062/5763764
        scrollTo = function (element, to, duration) {
            if (duration <= 0) {
                return;
            }
            var difference = to - element.scrollTop;
            var perTick = difference / duration * 10;
            setTimeout(function () {
                element.scrollTop = element.scrollTop + perTick;
                if (element.scrollTop === to) {
                    return;
                }
                scrollTo(element, to, duration - 10);
            }, 10);
        },

        Application = Marionette.Application.extend({
            filterlist: "",
            searchList: null,
            searchIndex: 0,
            currentProject: null,
            localURLs: [],
            usingImportedKB: false,
            version: "1.5.0", // appended with milestone / iOS build info
            AndroidBuild: "34", // (was milestone release #)
            iOSBuild: "1.5.1",
            importingURL: "", // for other apps in Android-land sending us files to import

            // Mimics Element.scrollIntoView({"block": "center", "behavior": "smooth"}) for
            // browsers that do not support this scrollIntoViewOptions yet.
            scrollIntoViewCenter : function (element) {
                var scrollable = getScrollableParent(element);
                if (scrollable) {
                    var centerOffset = getCenterOffset(element, scrollable);
                    scrollTo(scrollable, getContainerOffset(element, scrollable) - Math.max(0, centerOffset), 150);
                }
            },

            // App initialization code. App initialization comes in a few callbacks:
            // 1. Cordova initialization (startTheApp() in main.js)
            // 2. Database initialization (this code)
            // 3. Locale / i18next initialization (onInitDB() below)
            // 4. The actual view display loading
            initialize: function (options) {
                
                // typeahead contenteditable workaround
                var original = $.fn.val;
                $.fn.val = function () {
                    if ($(this).is('*[contenteditable=true]')) {
                        return $.fn.html.apply(this, arguments);
                    }
                    return original.apply(this, arguments);
                };
                
                // ios page height workaround
                if (device.platform === "iOS") {
                    var sheet = window.document.styleSheets[window.document.styleSheets.length - 1]; // current stylesheet
                    var theRule = "";
                    theRule = ".page {";
                    theRule += "height: " + parseInt(window.outerHeight, 10) + "px;";
                    theRule += "}";
                    sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)                
                }
                
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
                // keyboard plugin (mobile app only)
                if (device.platform === "iOS") {
                    // a couple iOS-specific settings
                    Keyboard.shrinkView(true); // resize the view when the keyboard displays
                    Keyboard.hideFormAccessoryBar(true); // don't show the iOS "<> Done" line
                }
                // Window font size / zoom (Android only)
                if (window.MobileAccessibility) {
                    window.MobileAccessibility.usePreferredTextZoom(false);
                }
                // version info
                if (device.platform === "iOS") {
                    // iOS - internal build #
                    this.version += " (" + this.iOSBuild + ")";
                } else {
                    // Android (+ Windows + browser) -- Android build #
                    this.version += " (" + this.AndroidBuild + ")";
                }
                // local dirs (mobile app only)
                if (device && (device.platform !== "browser")) {
                    // initialize localURLs
                    this.localURLs    = [
                        cordova.file.documentsDirectory,
                        cordova.file.externalRootDirectory,
                        cordova.file.sharedDirectory,
                        cordova.file.dataDirectory,
                        cordova.file.externalDataDirectory,
                        cordova.file.syncedDataDirectory
                    ];
                    if (device.platform === "Android") {
                        // request read access to the external storage if we don't have it
                        cordova.plugins.diagnostic.getExternalStorageAuthorizationStatus(function (status) {
                            if (status === cordova.plugins.diagnostic.permissionStatus.GRANTED) {
                                console.log("External storage use is authorized");
                            } else {
                                cordova.plugins.diagnostic.requestExternalStorageAuthorization(function (result) {
                                    console.log("Authorization request for external storage use was " + (result === cordova.plugins.diagnostic.permissionStatus.GRANTED ? "granted" : "denied"));
                                }, function (error) {
                                    console.error(error);
                                });
                            }
                        }, function (error) {
                            console.error("The following error occurred: " + error);
                        });
                        // request runtime permissions if needed
                        cordova.plugins.diagnostic.getPermissionsAuthorizationStatus(function(statuses){
                            for (var permission in statuses){
                                switch(statuses[permission]){
                                    case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                                        console.log("Permission granted to use "+permission);
                                        break;
                                    case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                                        console.log("Permission to use "+permission+" has not been requested yet; asking now");
                                        cordova.plugins.diagnostic.requestRuntimePermission(function(status){
                                            console.log("Runtime permission request result: " + status.toString());
                                        }, function(error){
                                            console.error("The following error occurred: "+error);
                                        }, permission);
                                        break;
                                    case cordova.plugins.diagnostic.permissionStatus.DENIED_ONCE:
                                        console.log("Permission denied to use "+permission+" - ask again?");
                                        break;
                                    case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
                                        console.log("Permission permanently denied to use "+permission+" - guess we won't be using it then!");
                                        break;
                                }
                            }
                        }, function(error){
                            console.error("The following error occurred: "+error);
                        },[
                            cordova.plugins.diagnostic.permission.WRITE_EXTERNAL_STORAGE,
                            cordova.plugins.diagnostic.permission.READ_EXTERNAL_STORAGE
                        ]);
                    }
                }
                // social sharing plugin / iPad popover coords
                if (device && (device.platform !== "browser")) {
                    window.plugins.socialsharing.iPadPopupCoordinates = function () {
                        var rect = document.getElementById('share_button').getBoundingClientRect();
                        return rect.left + "," + rect.top + "," + rect.width + "," + rect.height;
                    };
                }
                // create / open the database
                if (device && (device.platform !== "browser")) {
                    if (device.platform === "browser") {
                        // running in browser -- use WebSQL (Chrome / Safari ONLY)
                        this.db = openDatabase(DB_NAME, '1', 'AIM database', 2 * 1024 * 1024);
                        this.onInitDB();
                    } else if (device.platform === "iOS") {
                        // iOS -- Documents dir: db is visible to iTunes, backed up by iCloud
                        this.db = window.sqlitePlugin.openDatabase({name: DB_NAME, iosDatabaseLocation: 'Documents'});
                        this.onInitDB();

                    } else if (device.platform === "Android") {
                        // Android -- this could either be on an external SD card or on the device itself
                        if (cordova.file.externalDataDirectory !== null) {
                            // has SD card -- use it
                            db_dir = cordova.file.externalDataDirectory;
                        } else {
                            // no SD card -- use the device itself
                            db_dir = cordova.file.DataDirectory;
                        }
                        // now attempt to get the directory
                        window.resolveLocalFileSystemURL(db_dir, function (directoryEntry) {
                            console.log("Got directoryEntry. Attempting to create / open AIM DB at: " + directoryEntry.toURL());
                            // Attempt to create / open our AIM database now
                            window.Application.db = window.sqlitePlugin.openDatabase({name: DB_NAME, androidDatabaseLocation: directoryEntry.toURL()});
                            window.Application.checkDBSchema(); // Android only (iOS calls directly)
                            window.Application.onInitDB();
                        }, function (err) {
                            console.log("resolveLocalFileSustemURL error: " + err.message);
                        });
                    } else {
                        // something else -- just use the default location
                        this.db = window.sqlitePlugin.openDatabase({name: DB_NAME, location: 'default'});
                        this.onInitDB();
                    }
                } else {
                    // no sqlite plugin defined -- try just using webSQL
                    this.db = openDatabase(DB_NAME, '1', 'AIM database', 2 * 1024 * 1024);
                    this.onInitDB();
                }
            },
            
            // Callback to finish initialization once the AIM database has successfully been created / opened.
            // This code was moved from initialize() above, and is called from there once the DB is okay to use.
            onInitDB: function () {
                // callback function to initialize / load the localization info
                var initialize_i18n = function (locale) {
                    i18n.init({
                        lng: locale,
                        debug: true,
                        fallbackLng: 'en'
                    }, function () {
                        // Callback when i18next is finished initializing
                        var IMPORTED_KB_FILE = "**ImportedKBFile**";

                        // Load any app-wide collections
                        window.Application.BookList = new bookModel.BookCollection();
                        window.Application.BookList.fetch({reset: true, data: {name: ""}});
                        window.Application.ProjectList = new projModel.ProjectCollection();
                        window.Application.ProjectList.fetch({reset: true, data: {name: ""}});
                        window.Application.ChapterList = new chapterModel.ChapterCollection();
                        window.Application.ChapterList.fetch({reset: true, data: {name: ""}});
                        window.Application.kbList = new kbModels.TargetUnitCollection();
                        $.when(window.Application.kbList.fetch({reset: true, data: {name: ""}})).done(function () {
                            var result = window.Application.kbList.findWhere({'source': IMPORTED_KB_FILE});
                            if (typeof result !== 'undefined') {
                                window.Application.usingImportedKB = true;
                            }
                        });
                        window.Application.spList = new spModel.SourcePhraseCollection();
                        // Note: sourcephrases are not held as a singleton (for a NT, this could result in ~300MB of memory) --
                        // Instead, they are instantiated on the pages that need them
                        // (DocumentViews for doc import/export and AdaptViews for adapting)

                        // Tell backbone we're ready to start loading the View classes.
                        Backbone.history.start();
                    });
                };
                // create model collections off the Application object
                this.BookList = null;
                this.ProjectList = null;
                this.ChapterList = null;
                this.spList = null;
                this.kbList = null;
                
                // did the user specify a custom language?
                if (localStorage.getItem("UILang")) {
                    // custom language
                    initialize_i18n(localStorage.getItem("UILang"));
                } else {
                    // use normal locale settings
                    // get the user's locale - mobile or web
                    if (window.Intl && typeof window.Intl === 'object') {
                        // device supports ECMA Internationalization API
                        locale = navigator.language.split("-")[0];
                        initialize_i18n(locale);
                    } else {
                        // fall back on web browser languages metadata
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
            
            onStart: function (app, options) {
                // check the database schema now that we've created / opened it
                this.checkDBSchema();
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
                        // check to see if we saved a current project
                        if (localStorage.getItem("CurrentProjectID")) {
                            window.Application.currentProject = window.Application.ProjectList.where({projectid: localStorage.getItem("CurrentProjectID")})[0];
                        } else {
                            // pick the first project in the list, if there is one
                            if (window.Application.ProjectList.length > 0) {
                                window.Application.currentProject = window.Application.ProjectList.at(0);
                                // save the value for later
                                localStorage.setItem("CurrentProjectID", window.Application.currentProject.get("projectid"));
                            }
                        }                        
                    }
                    // Did another task launch us (i.e., did our handleOpenURL() from main.js
                    // get called)? If so, pull out the URL and process the resulting file
                    var shareURL = window.localStorage.getItem('share_url');
                    if (shareURL && shareURL.length > 0) {
                        console.log("Found stored URL to process:" + shareURL);
                        window.localStorage.removeItem('share_url'); // clear out value
                        if (shareURL.indexOf("content:") !== -1) {
                            // content://path from Android 
                            window.FilePath.resolveNativePath(shareURL, function(absolutePath) {
                                window.Application.importingURL = absolutePath;
                                window.resolveLocalFileSystemURL(shareURL, window.Application.processFileEntry, window.Application.processError);
                              });
                        } else {
                            // not a content://path url -- resolve and process file
                            window.Application.importingURL = "";
                            window.resolveLocalFileSystemURL(shareURL, window.Application.processFileEntry, window.Application.processError);
                        }
                    } else {
                        // No pending import requests -- display the home view
                        homeView = new HomeViews.HomeView({model: window.Application.currentProject});
                        homeView.delegateEvents();
                        window.Application.main.show(homeView);
                    }
                });
            },
            
            checkDBSchema: function () {
                // verify we're on the latest DB schema (upgrade if necessary)
                projModel.checkSchema();
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
            
            lookupKB: function (id) {
                console.log("lookupKB");
                // update the book and chapter lists, then show the import docs view
                $.when(window.Application.kbList.fetch({reset: true, data: {projectid: window.Application.currentProject.get('projectid')}})).done(function () {
                    $.when(window.Application.spList.fetch({reset: true, data: {spid: window.Application.currentProject.get('lastAdaptedSPID')}})).done(function () {
                        var tu = window.Application.kbList.where({tuid: id});
                        if (tu === null) {
                            console.log("KB Entry not found:" + id);
                        }
                        showTransView = new SearchViews.KBView({model: tu[0]});
                        showTransView.spObj = window.Application.spList[0];
                        showTransView.delegateEvents();
                        window.Application.main.show(showTransView);
                    });
                });
            },

            // Another process has sent us a file via URL. Get the File handle and send it along to
            // importFileFromURL (below).
            processFileEntry: function (fileEntry) {
                console.log("processFileEntry: enter");
                fileEntry.file(window.Application.importFileFromURL, window.Application.importFail);
            },

            processError: function (error) {
                // log the error and continue processing
                console.log("getDirectory error: " + error.code);
                alert("error: " + error.code);
            },

            // This is similar to importBooks, EXCEPT that another process is sending a file to us to
            // open/import (rather than the user picking a file out of a list). Call
            // ImportDocumentView::importFile() to import the file.
            importFileFromURL: function (file) {
                console.log("importFile: enter");
                var proj = window.Application.currentProject;
                if (proj !== null) {
                    // We have a project -- load the ImportDocumentView to do the work
                    importDocView = new DocumentViews.ImportDocumentView({model: proj});
                    importDocView.isLoadingFromURL = true;
                    importDocView.delegateEvents();
                    window.Application.main.show(importDocView);
                    // call ImportDocumentView::importFromURL() to import the file
                    importDocView.importFromURL(file, proj);
                } else {
                    alert("No current project defined -- ignoring open() call");
                }
            },

            importFail: function () {
                alert("Unable to open file.");
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
                        importDocView.isLoadingFromURL = false;
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
                            var bookName = book.get('name');
                            theView.project = proj;
                            // update the last adapted book and chapter
                            if (proj) {
                                window.Application.filterList = proj.get('FilterMarkers'); // static (always ON) filters + whatever is specified for the project
                                
                                if (bookName.length === 0) {
                                    // sanity check -- if this is the case, set it to the book's filename (and update the book name)
                                    bookName = book.get('filename');
                                    book.set('name', bookName);
                                    book.save();
                                }
                                proj.set('lastDocument', book.get('name'));
                                proj.set('lastAdaptedBookID', chapter.get('bookid'));
                                proj.set('lastAdaptedChapterID', chapter.get('chapterid'));
                                proj.set('lastAdaptedName', chapter.get('name'));
                                proj.save();
                                window.Application.currentProject = proj;
                                localStorage.setItem("CurrentProjectID", proj.get("projectid"));
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
