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
        userModels      = require('app/models/user'),
        AppRouter       = require('app/router'),
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
        newTransView    = null,
        editTUView      = null,
        i18n            = require('i18n'),
        lang            = "",
        models          = [],
        DB_NAME         = "AIM",
        db_dir          = "",
        LOCAL_USER      = "LocalUser",  // user for local AIM db
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
            currentBookmark: null,
            user: null,
            localURLs: [],
            version: "1.20.0", // appended with Android / iOS build info
            AndroidBuild: "67", // (was milestone release #)
            iOSBuild: "1", // iOS uploaded build number for this release (increments from 1 for each release) 
            importingURL: "", // for other apps in Android-land sending us files to import

            // Utility function from https://www.sobyte.net/post/2022-02/js-crypto-randomuuid/
            // Generate a new UUID, with polyfills for Android, others
            generateUUID : function () {
                if (typeof self.crypto === 'object') {
                if (typeof self.crypto.randomUUID === 'function') {
                    // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
                    return self.crypto.randomUUID();
                }
                if (typeof self.crypto.getRandomValues === 'function' && typeof Uint8Array === 'function') {
                    // https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
                    const callback = (c) => {
                    const num = Number(c);
                    return (num ^ (self.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (num / 4)))).toString(16);
                    };
                    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, callback);
                }
                }
                var timestamp = new Date().getTime();
                var perforNow = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0;
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                let random = Math.random() * 16;
                if (timestamp > 0) {
                    random = (timestamp + random) % 16 | 0;
                    timestamp = Math.floor(timestamp / 16);
                } else {
                    random = (perforNow + random) % 16 | 0;
                    perforNow = Math.floor(perforNow / 16);
                }
                return (c === 'x' ? random : (random & 0x3) | 0x8).toString(16);
                });
            },

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
                        cordova.file.sharedDirectory,
                        cordova.file.dataDirectory,
                        cordova.file.syncedDataDirectory
                    ];
                }
                // create / open the database
                if (device && (device.platform !== "browser")) {
                    if (device.platform === "browser") {
                        // running in browser -- use indexedDB (Chrome / Safari ONLY)
                        const DBOpenRequest = window.indexedDB.open(DB_NAME);
                        DBOpenRequest.onerror = (event) => {
                            console.error("Initialize() - browser indexedDB open error: " + event);
                        };
                        DBOpenRequest.onsuccess = (event) => {
                            // store the result of opening the database in the db
                            // variable. This is used a lot later on, for opening
                            // transactions and suchlike.
                            this.db = DBOpenRequest.result;
                            this.onInitDB();
                        };                        
                    } else if (device.platform === "iOS") {
                        // iOS -- Documents dir: db is visible to iTunes, backed up by iCloud
                        // Attempt to create / open our AIM database now
                        this.db = window.sqlitePlugin.openDatabase({name: DB_NAME, iosDatabaseLocation: 'Documents'}, function(db) {
                            console.log("ios db open ok, checking schema");
                            window.Application.checkDBSchema().then(window.Application.onInitDB());
                        });
                    } else if (device.platform === "Android") {
                        // Android -- scoped storage wonkiness introduced in stages starting with API 30
                        // first check the data directory, then check the "default" location
                        db_dir = cordova.file.dataDirectory;
                        console.log("db_dir: " + db_dir);
                        // now attempt to get the directory
                        window.resolveLocalFileSystemURL(db_dir, function (directoryEntry) {
                            console.log("Got directoryEntry. Attempting to create / open AIM DB at: " + directoryEntry.nativeURL);
                            // Attempt to create / open our AIM database now
                            window.Application.db = window.sqlitePlugin.openDatabase({name: DB_NAME, androidDatabaseLocation: directoryEntry.nativeURL}, function(db) {
                                window.Application.checkDBSchema().then(window.Application.onInitDB());
                            }, function (err) {
                                console.log("Open database ERROR: " + JSON.stringify(err));
                            });
                        }, function (err) {
                            console.log("resolveLocalFileSustemURL error: " + err.message);
                        });
                    } else {
                        // something else -- just use the default location
                        this.db = window.sqlitePlugin.openDatabase({name: DB_NAME, location: 'default'});
                        this.onInitDB();
                    }
                } else {
                    const DBOpenRequest = window.indexedDB.open(DB_NAME);
                    DBOpenRequest.onerror = (event) => {
                        console.error("Initialize() - indexedDB open error: " + event);
                    };
                    DBOpenRequest.onsuccess = (event) => {
                        // store the result of opening the database in the db
                        // variable. This is used a lot later on, for opening
                        // transactions and suchlike.
                        this.db = DBOpenRequest.result;
                        this.onInitDB();
                    };                        
                }
            },
            
            // Callback to finish initialization once the AIM database has successfully been created / opened.
            // This code was moved from initialize() above, and is called from there once the DB is okay to use.
            onInitDB: function () {
                // Method initialize localization for the app. Calls init_collections_and_go once complete.
                var initialize_i18n = function (locale) {
                    i18n.init({
                        lng: locale,
                        debug: true,
                        fallbackLng: 'en'
                    }, function () {
                        var IMPORTED_KB_FILE = "**ImportedKBFile**";
                        // Localization done -- 
                        // Create the app-wide collections
                        window.Application.ProjectList = new projModel.ProjectCollection();
                        window.Application.BookList = new bookModel.BookCollection();
                        window.Application.ChapterList = new chapterModel.ChapterCollection();
                        window.Application.kbList = new kbModels.TargetUnitCollection();
                        window.Application.spList = new spModel.SourcePhraseCollection();
                        window.Application.bookmarkList = new userModels.BookmarkCollection();
                        // (Note on these collections:
                        // The ProjectList is populated at startup in home() below; if there is a current project,
                        // the books, chapters, and KB are loaded for the current project in home() as well.   
                        // The sourcephrases are not held as an app-wide collection (for a NT, this could result in ~300MB of memory) --
                        // Instead, they are instantiated on the pages that need them
                        // (DocumentViews for doc import/export and AdaptViews for adapting))

                        // check the local db for our LocalUser; create if needed
                        var userList = new userModels.UserCollection();
                        $.when(userList.fetch({reset: true, data: {username: ""}})).done(function () {
                            console.log("userList length: " + userList.length);
                            var localUser = userList.findWhere({username: LOCAL_USER});
                            if (localUser === undefined) {
                                console.log("init_collections_and_go() - No local user, creating");
                                var userid = window.Application.generateUUID();
                                localUser = new userModels.User({
                                    username: LOCAL_USER,
                                    userid: userid,
                                    roles: [],
                                    bookmarks: [],
                                    copysource: 0,
                                    wrapusfm: 0,
                                    stopatboundaries: 0,
                                    alloweditblanksp: 0,
                                    showtranslationchecks: 0,
                                    defaultfttarget: 0,
                                    uilang: 0,
                                    darkmode: 1,
                                    wordspacing: 2
                                });
                                // save the user to the DB
                                localUser.save();
                                window.Application.user = localUser;            
                            } else {
                                // there's a local user set in the DB - use it
                                console.log("init_collections_and_go() - found local user, setting");
                                window.Application.user = localUser;
                            }
                            // Startup initialization is complete
                            // Tell backbone we're ready to start loading the View classes.
                            Backbone.history.start();
                        });                        
                    });
                };
                // create model collections off the Application object
                this.BookList = null;
                this.ProjectList = null;
                this.ChapterList = null;
                this.spList = null;
                this.kbList = null;
                this.bookmarkList = null;
                this.user = null;
                
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

                // Process back arrow button event 
                // (not the one in the browser, the one we render on our html page).
                $("body").on("click", ".back-button", function (event) {
                    event.preventDefault();
                    window.history.back();
                });
            },

            onStart: function (app, options) {
                // check the database schema now that we've created / opened it
                // this.checkDBSchema();
            },
            
            checkDBSchema: function () {
                // verify we're on the latest DB schema (upgrade if necessary)
                console.log("checkDBSchema: entry");
                return projModel.checkSchema();
            },

            // Helper method to populate Application.bookmarkList:
            // - If we're upgrading from a previous release, the LastAdapted<x> properties in the project collection
            //   get copied over to new bookmark objects in our DB, as well as to a "bookmarks" array property for 
            //   window.Application.user
            // This method is called from HomeViews:OnShow() before rendering the search/adapt links
            setBookmarks: function () {
                var deferred = $.Deferred();
                // Each AIM instance has a local user associated with the project(s) in the local DB
                console.log("setBookmarks() - entry");
                // sanity check -- make sure window.Application.user is set
                if (window.Application.user === null) {
                    console.log("setBookmarks() error -- no local user set, exiting");
                    return;
                }

                // verify / update the bookmark list
                if (window.Application.user.get("bookmarks").length === 0) {
                    console.log("setBookmarks() - user has no bookmarks set; setting for each project (if there are any)");
                    var bookmarks = window.Application.user.get("bookmarks"); // s/b empty array of bookmarkids, not collection
                    if (window.Application.ProjectList.length > 0) {
                        window.Application.ProjectList.each(function (model, index) {
                            // If we're here, we're likely upgrading from a previous version of AIM, and the project _should_
                            // have the info to populate this bookmark (leave blank if not)
                            var bookmarkid = window.Application.generateUUID();
                            var newBookmark = new userModels.Bookmark({
                                bookmarkid: bookmarkid,
                                projectid: model.get('projectid'),
                                name: (model.get('lastAdaptedName').length > 0) ? model.get('lastAdaptedName') : "",
                                bookid: (model.get('lastAdaptedBookID').length > 0) ? model.get('lastAdaptedBookID') : "",
                                chapterid: (model.get('lastAdaptedChapterID').length > 0) ? model.get('lastAdaptedChapterID') : "",
                                spid: (model.get('lastAdaptedSPID').length > 0) ? model.get('lastAdaptedSPID') : ""
                            });
                            // save and add to the collection
                            newBookmark.save();
                            if (model.get('projectid') === window.Application.currentProject.get('projectid')) {
                                // this is the current project -- set this bookmark as the current bookmark
                                console.log("setBookmarks() - also setting current bookmark: " + bookmarkid + " for projectid: " + model.get('projectid'));
                                window.Application.currentBookmark = newBookmark;
                            }
                            window.Application.bookmarkList.add(newBookmark);
                            // add this to the user's bookmarkid array
                            bookmarks.push(bookmarkid);
                        });
                        // done looping through the project list -- update the user's bookmarks
                        window.Application.user.set("bookmarks", bookmarks, {silent: true});
                        window.Application.user.update();
                        // done populating user/bookmarks
                        deferred.resolve();
                    } else {
                        console.log("No bookmarks added (no projects in list)");
                        deferred.resolve();
                    }
                } else {
                    console.log("setBookmarks() - user has bookmarks defined");
                    if (window.Application.ProjectList.length === 0) {
                        var msg = "ERROR: user has bookmarks, but there are no projects defined";
                        console.log(msg);
                        deferred.reject(msg);
                        return;
                    }
                    // there should be a bookmarkid in the user's bookmark array that points to the current project -
                    // set our current bookmark to that one
                    window.Application.bookmarkList.fetch({reset: true, data: {projectid: window.Application.currentProject.get("projectid")}}).then(function () {
                        console.log("setBookmarks() - bookmark list retrieved, length: " + window.Application.bookmarkList.length);
                        if (window.Application.bookmarkList.length === 0) {
                            // Ugh. No bookmarks retrieved, but the user has some defined. 
                            // Create one for this projectid and use it for the currentBookmark (and add it to the user array)
                            var bookmarks = window.Application.user.get("bookmarks"); // s/b empty array of bookmarkids, not collection
                            var proj = window.Application.currentProject;
                            var bookmarkid = window.Application.generateUUID();
                            var newBookmark = new userModels.Bookmark({
                                bookmarkid: bookmarkid,
                                projectid: proj.get('projectid'),
                                name: (proj.get('lastAdaptedName').length > 0) ? proj.get('lastAdaptedName') : "",
                                bookid: (proj.get('lastAdaptedBookID').length > 0) ? proj.get('lastAdaptedBookID') : "",
                                chapterid: (proj.get('lastAdaptedChapterID').length > 0) ? proj.get('lastAdaptedChapterID') : "",
                                spid: (proj.get('lastAdaptedSPID').length > 0) ? proj.get('lastAdaptedSPID') : ""
                            });
                            // save and add to the collection
                            newBookmark.save();
                            // set this bookmark as the current bookmark
                            console.log("setBookmarks() - no bookmarks found(!). Created new bookmark: " + bookmarkid + " for projectid: " + proj.get('projectid'));
                            window.Application.currentBookmark = newBookmark;
                            window.Application.bookmarkList.add(newBookmark);
                            // add this to the user's bookmarkid array
                            bookmarks.push(bookmarkid);
                            window.Application.user.set("bookmarks", bookmarks);
                            window.Application.user.save();
                        } else {
                            // At least one bookmark retrieved. See if it lines up with the projectid and user bookmark array
                            var projid = window.Application.currentProject.get("projectid");
                            for(var i=0; i<window.Application.bookmarkList.length; i++) {
                                if (window.Application.bookmarkList.at(i).get("projectid") === projid) {
                                    // this bookmark refers to the current project. Is it in our user's bookmarks array?
                                    if (window.Application.user.get("bookmarks").indexOf(window.Application.bookmarkList.at(i).get("bookmarkid")) > -1) {
                                        // yes -- this is the bookmarkid we want
                                        console.log("setBookmarks() - found matching bookmark, setting");
                                        window.Application.currentBookmark = window.Application.bookmarkList.at(i);
                                        deferred.resolve();
                                        return;
                                    }
                                }
                            }
                        }
                        // Sanity check for a valid bookmark
                        if (window.Application.currentBookmark === null) {
                            console.log("setBookmarks() - didn't find a matching bookmark, setting to the first in the list");
                            window.Application.currentBookmark = window.Application.bookmarkList.at(0);
                            deferred.resolve();    
                        }
                    });
                }

                return deferred.promise();
            },

            // -----------
            // Routes from AppRouter (router.js)
            // -----------

            // Home page (main view)
            home: function () {
                // First, look for projects in the project list that aren't complete;
                // this can happen if the user clicks the back button before completing the 
                // new project wizard. These objects with no id defined are only in memory;
                // once the source and target language are defined, an id is set and
                // the project is saved in the device's localStorage.
                // $.when(this.ProjectList.fetch()).done(function () {
                this.ProjectList.fetch({reset: true, data: {name: ""}}).then(function () {
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
                    if (!window.Application.currentProject) {
                        console.log("Home() - No current project set");
                        // check to see if we saved a current project
                        if (localStorage.getItem("CurrentProjectID")) {
                            console.log("Attempting to use CurrentProjectID from local storage");
                            window.Application.currentProject = window.Application.ProjectList.where({projectid: localStorage.getItem("CurrentProjectID")})[0];
                        }
                        if (!window.Application.currentProject) {
                            // project list was a dud. Set to the first item in the list if we can
                            console.log("No localStorage, or attempt to set failed. Trying the first item in the project list (if there is one)");
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
                        console.log("creating home view");
                        homeView = new HomeViews.HomeView({model: window.Application.currentProject});
                        homeView.delegateEvents();
                        window.Application.main.show(homeView);
                    }
                });
            },
            // Set UI language view (language can also be set within project settings / edit project view > UI settings)
            setUILanguage: function () {
                langView = new HomeViews.UILanguageView();
                langView.delegateEvents();
                window.Application.main.show(langView);
            },
            // Edit project view
            editProject: function (id) {
                // edit the selected project
                var proj = this.ProjectList.where({projectid: id});
                if (proj !== null) {
                    window.Application.main.show(new ProjectViews.EditProjectView({model: proj[0]}));
                }
            },
            editProjectPage: function (id, page) {
                // edit the selected project
                var proj = this.ProjectList.where({projectid: id});
                var projView = new ProjectViews.EditProjectView({model: proj[0]});
                if (proj !== null) {
                    window.Application.main.show(projView);
                    projView.ShowView(parseInt(page, 10));
                }
            },
            // Copy project view
            copyProject: function () {
                var proj = new projModel.Project();
                copyProjectView = new ProjectViews.CopyProjectView({model: proj});
                copyProjectView.delegateEvents();
                this.ProjectList.add(proj);
                this.main.show(copyProjectView);
            },
            // New Project view (wizard)
            newProject: function () {
                var proj = new projModel.Project();
                var newBookmark = new userModels.Bookmark(); // nothing set yet
                newProjectView = new ProjectViews.NewProjectView({model: proj});
                newProjectView.delegateEvents();
                newProjectView.bookmark = newBookmark;
                this.bookmarkList.add(newBookmark);
                this.ProjectList.add(proj);
                this.main.show(newProjectView);
            },
            // KB editor view
            editKB: function (id) {
                console.log("editKB");
                // show the KB editor view (KB refresh happens inside the view's onShow())
                var proj = window.Application.ProjectList.where({projectid: id});
                editTUView = new SearchViews.TUListView({model: proj[0]});
                editTUView.delegateEvents();
                window.Application.main.show(editTUView);
            },
            // New Target Unit view
            newTU: function() {
                console.log("newTU");
                newTransView = new SearchViews.NewTUView();
                newTransView.delegateEvents();
                window.Application.main.show(newTransView);
            },
            // View / edit TU
            editTU: function (id) {
                console.log("editTU");
                var theTU = null;
                // show the selected TU
                var tu = window.Application.kbList.where({tuid: id});
                if (tu === null) {
                    console.log("KB Entry not found:" + id);
                    return; // don't do anything -- this TU is supposed to exist
                }
                theTU = tu[0];
                showTransView = new SearchViews.TUView({model: theTU});
                showTransView.spObj = null; // NO current sourcephrase (this is coming from the KB editor)
                showTransView.bNewTU = false;
                showTransView.delegateEvents();
                window.Application.main.show(showTransView);
            },
            // Show translations (edit TU, but also includes the "current translation" / SP)
            showTranslations: function (id) {
                console.log("showTranslations");
                // update the KB and source phrase list, then display the Translations screen with the currently-selected sourcephrase
                $.when(window.Application.kbList.fetch({reset: true, data: {projectid: window.Application.currentProject.get('projectid'), isGloss: 0}})).done(function () {
                    $.when(window.Application.spList.fetch({reset: true, data: {spid: id}})).done(function () {
                        var sp = window.Application.spList.where({spid: id});
                        if (sp === null || sp.length === 0) {
                            console.log("sp Entry not found:" + id);
                        } else {
                            // KB lookup involves modifying the case and stripping out the punctuation (see autoRemoveCaps()
                            // and stripPunctuation() calls in AdaptViews and DocumentViews). 
                            var src = sp[0].get("source"),
                                punctsSource = [],
                                startIdx = 0,
                                endIdx = src.length;
                            // First up: stripping out the punctuation
                            window.Application.currentProject.get('PunctPairs').forEach(function (elt, idx, array) {
                                punctsSource.push(elt.s);
                            });
                            // starting index
                            while (startIdx < (src.length - 1) && punctsSource.indexOf(src.charAt(startIdx)) > -1) {
                                startIdx++;
                            }
                            // ending index
                            while (endIdx > 0 && punctsSource.indexOf(src.charAt(endIdx - 1)) > -1) {
                                endIdx--;
                            }
                            if (endIdx <= startIdx) {
                                src = "";
                            }
                            src = src.substr(startIdx, (endIdx) - startIdx);
                            // Next up: set the case as appropriate
                            if (window.Application.currentProject.get("AutoCapitalization") === "true") {
                                // build up the caseSource array
                                var caseSource = [];
                                window.Application.currentProject.get('CasePairs').forEach(function (elt, idx, array) {
                                    caseSource.push(elt.s);
                                });
                                // find the starting character in the source and change it if needed
                                for (var i = 0; i < caseSource.length; i++) {
                                    if (caseSource[i].charAt(1) === src.charAt(0)) {
                                        // uppercase -- convert the first character to lowercase and exit the loop
                                        src = caseSource[i].charAt(0) + src.substr(1);
                                        break;
                                    }
                                }
                            }
                            // Okay, now look up the modified source in the KB
                            var tu = window.Application.kbList.findWhere({'source': src, 'isGloss': 0});
                            if (tu !== null) {
                                showTransView = new SearchViews.TUView({model: tu});
                                showTransView.spObj = sp[0];
                                showTransView.delegateEvents();
                                window.Application.main.show(showTransView);        
                            } else {
                                // shouldn't happen?
                                console.log("showTranslations: source not found in KB -- ignoring call");
                            }
                        }
                    });
                });
            },
            // import doc view
            importBooks: function (id) {
                console.log("importBooks");
                // update the book and chapter lists, then show the import docs view
                $.when(window.Application.BookList.fetch({reset: true, data: {projectid: window.Application.currentProject.get("projectid")}})).done(function () {
                    $.when(window.Application.ChapterList.fetch({reset: true, data: {projectid: window.Application.currentProject.get("projectid")}})).done(function () {
                        var proj = window.Application.currentProject;
                        if (proj !== null) {
                            importDocView = new DocumentViews.ImportDocumentView({model: proj});
                            importDocView.isLoadingFromURL = false;
                            importDocView.delegateEvents();
                            window.Application.main.show(importDocView);
                        } else {
                            alert("No current project defined -- ignoring open() call");
                        }
                    });
                });
            },
            // Export doc view
            exportBooks: function (id) {
                console.log("exportBooks");
                var proj = window.Application.currentProject;
                if (proj === null) {
                    console.log("no project defined");
                } else {
                    exportDocView = new DocumentViews.ExportDocumentView({model: proj});
                    exportDocView.delegateEvents();
                    window.Application.main.show(exportDocView);
                }
            },
            // Search / browse chapter view -- all books/chapters in current project
            lookupChapter: function (id) {
                console.log("lookupChapter");
                $.when(window.Application.BookList.fetch({reset: true, data: {projectid: window.Application.currentProject.get("projectid")}})).done(function () {
                    $.when(window.Application.ChapterList.fetch({reset: true, data: {projectid: window.Application.currentProject.get("projectid")}})).done(function () {
                        var proj = window.Application.currentProject;
                        if (proj !== null) {
                            lookupView = new SearchViews.LookupView({model: proj});
                            window.Application.main.show(lookupView);
                        } else {
                            alert("No current project defined -- ignoring open() call");
                        }
                    });
                });
            },
            // Adapt View (the reason we're here)
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
                                // do we have a current bookmark?
                                if (window.Application.currentBookmark === null) {
                                    // no -- create one
                                    var bookmarkid = window.Application.generateUUID();
                                    var newBookmark = new userModels.Bookmark({
                                        bookmarkid: bookmarkid,
                                        projectid: proj.get('projectid'),
                                        name: chapter.get("name"),
                                        bookid: book.get("bookid"),
                                        chapterid: chapter.get('chapterid')
                                    });
                                    // save and add to the collection
                                    newBookmark.save();
                                    window.Application.bookmarkList.add(newBookmark);
                                    // this is the current project -- set this bookmark as the current bookmark
                                    window.Application.currentBookmark = newBookmark;
                                } else {
                                    // we have a current bookmark -- update it
                                    window.Application.currentBookmark.set('name', chapter.get('name'));
                                    window.Application.currentBookmark.set('bookid', book.get('bookid'));
                                    window.Application.currentBookmark.set('chapterid', chapter.get('chapterid'));
                                }
                            }
                            window.Application.main.show(theView);
                        } else {
                            console.log("No chapter found matching id:" + id);
                        }
                    });
                });
            },
            // ----
            // External document route helper methods:
            // Another process has sent us a file via URL.
            // ----
            // Helper method to get the File handle from the external process and send it along to
            // importFileFromURL (below).
            processFileEntry: function (fileEntry) {
                console.log("processFileEntry: enter");
                fileEntry.file(window.Application.importFileFromURL, window.Application.importFail);
            },
            // helper callback to report errors that happened during the open / import file process (i.e., from another process)
            processError: function (error) {
                // log the error and continue processing
                if (navigator.notification) {
                    navigator.notification.alert(i18n.t("view.ErrImportDoc", {error: error.message}), function () {
                        window.Application.home();
                    });
                } else {
                    alert(i18n.t("view.ErrImportDoc", {error: error.message}));
                    window.Application.home();
                }
            },
            // This is similar to importBooks, EXCEPT that another process is sending a file to us to
            // open/import (rather than the user picking a file out of a list). Call
            // ImportDocumentView::importFile() to import the file.
            importFileFromURL: function (file) {
                console.log("importFile: enter");
                var proj = window.Application.currentProject;
                // we want books and chapters to be current, in case we're merging
                $.when(window.Application.BookList.fetch({reset: true, data: {name: ""}})).done(function () {
                    $.when(window.Application.ChapterList.fetch({reset: true, data: {name: ""}})).done(function () {
                        if (proj !== null) {
                            // We have a project -- load the ImportDocumentView to do the work
                            importDocView = new DocumentViews.ImportDocumentView({model: proj});
                            importDocView.isLoadingFromURL = true;
                            importDocView.delegateEvents();
                            window.Application.main.show(importDocView);
                            // call ImportDocumentView::importFromURL() to import the file
                            importDocView.importFromURL(file, proj);
                        } else {
                            // in this case we don't want to fail silently -- tell the user what's going on.
                            if (navigator.notification) {
                                navigator.notification.alert(
                                    i18n.t("view.ErrImportNoProjectDefined"),
                                    function () {
                                        console.log("No current project defined -- ignoring open() call");
                                        window.Application.home();
                                    });
                            } else {
                                alert(i18next.t("view.ErrImportNoProjectDefined"));
                                i18n.log("No current project defined -- ignoring open() call");
                                window.Application.home();
                            }

                        }
                    });
                });
            },
            // Helper callback for processFileEntry() failure (above)
            importFail: function () {
                alert("Unable to open file.");
            }
        });
    
    return {
        Application: Application
    };
});
