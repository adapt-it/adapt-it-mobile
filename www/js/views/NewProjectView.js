/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Handlebars  = require('handlebars'),
        Backbone    = require('backbone'),
        i18n        = require('i18n'),
        tplText     = require('text!tpl/NewProject.html'),
        ProjectCasesView = require('app/views/ProjectCasesView'),
        ProjectFontsView = require('app/views/ProjectFontsView'),
        ProjectLanguagesView = require('app/views/ProjectLanguagesView'),
        ProjectPunctuationView = require('app/views/ProjectPunctuationView'),
        ProjectUSFMFilteringView = require('app/views/ProjectUSFMFilteringView'),
        projModel   = require('app/models/project'),
        obj         = {},
        project     = null,
        step        = 1,
        template    = Handlebars.compile(tplText);


    return Backbone.View.extend({

        initialize: function () {
            obj.indexedDB = {};
            obj.indexedDB.db = null;
            this.render();
            this.OnNewProject();
        },

        render: function () {
            this.$el.html(template());
            return this;
        },
        
        events: {
            "click #Prev": "OnPrevStep",
            "click #Next": "OnNextStep"
        },
        
        OnPrevStep: function (event) {
            // pull the info from the 
            if (step > 1) {
                step--;
            } else {
                // last step -- finish up
            }
            this.ShowStep(step);
        },

        OnNextStep: function (event) {
            if (step < 5) {
                step++;
            } else {
                // last step -- finish up
            }
            this.ShowStep(step);
        },

        OnNewProject: function () {
            // create a new project model object
            //this.openDB();
            this.project = projModel.Project;
            // start the wizard
            this.ShowStep(step);
        },
        
        ShowStep: function (number) {
            console.log("ShowStep: " + number);
            var view = null;
            switch (number) {
            case 1: // languages
                view = new ProjectLanguagesView({ model: this.project});
                // title
                this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                // instructions
                this.$("#StepInstructions").html(i18n.t('view.dscProjectLanguages'));
                // controls
                this.$('#StepContainer').html(view.render().el.childNodes);
                // first step -- disable the prev button
                this.$("#Prev").attr('disabled', 'true');
                break;
            case 2: // fonts
                view = new ProjectFontsView({ model: this.project});
                // title
                $("#StepTitle").html(i18n.t('view.lblCreateProject'));
                // instructions
                $("#StepInstructions").html(i18n.t('view.dscProjectFonts'));
                // controls
                $('#StepContainer').html(view.render().el.childNodes);
                // Second step -- enable the prev button
                this.$("#Prev").attr('disabled', 'false');
                break;
            case 3: // punctuation
                view = new ProjectPunctuationView({ model: this.project});
                // title
                this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                // instructions
                this.$("#StepInstructions").html(i18n.t('view.dscProjectPunctuation'));
                // controls
                this.$('#StepContainer').html(view.render().el.childNodes);
                break;
            case 4: // cases
                view = new ProjectCasesView({ model: this.project});
                // title
                this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                // instructions
                this.$("#StepInstructions").html(i18n.t('view.dscProjectCases'));
                // controls
                this.$('#StepContainer').html(view.render().el.childNodes);
                // Penultimate step -- enable the next button (only needed
                // if the user happens to back up from the last one)
                this.$("#lblNext").html(i18n.t('view.dscCreateProject'));
                break;
            case 5: // USFM filtering
                view = new ProjectUSFMFilteringView({ model: this.project});
                // title
                this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                // instructions
                this.$("#StepInstructions").html(i18n.t('view.dscProjectUSFMFiltering'));
                // controls
                this.$('#StepContainer').html(view.render().el.childNodes);
                // Last step -- change the text of the Next button to "finish"
                this.$("#lblNext").attr('disabled', 'true');
                break;
            }
        },

        openDB: function () {
            var version = 1,
                request = obj.indexedDB.open("project", version);

            // We can only create Object stores in a versionchange transaction.
            request.onupgradeneeded = function (e) {
                var db = e.target.result;

                // A versionchange transaction is started automatically.
                e.target.transaction.onerror = obj.indexedDB.onerror;

                if (db.objectStoreNames.contains("project")) {
                    db.deleteObjectStore("project");
                }

                var store = db.createObjectStore("project", {keyPath: "timeStamp"});
            };

            request.onsuccess = function (e) {
                obj.indexedDB.db = e.target.result;
                obj.indexedDB.getAllTodoItems();
            };

            request.onerror = obj.indexedDB.onerror;
        },
    
        addTodo: function (todoText) {
            var db = obj.indexedDB.db,
                trans = db.transaction(["project"], "readwrite"),
                store = trans.objectStore("project"),
                request = store.put({
                    "text": todoText,
                    "timeStamp" : new Date().getTime()
                });

            request.onsuccess = function (e) {
                // Re-render all the todo's
                obj.indexedDB.getAllTodoItems();
            };

            request.onerror = function (e) {
                console.log(e.value);
            };
        },
            
        OnLoadProject: function (event) {
            this.downloadFile();
        },

        // Download a file / from:
        // http://stackoverflow.com/questions/6417055/download-files-and-store-them-locally-with-phonegap-jquery-mobile-android-and-io#
        downloadFile: function () {
            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
            window.requestFileSystem(window.PERSISTENT, 0, this.gotFS, this.fail);
        },

        gotFS: function (fileSystem) {
            console.log("gotFS: " + fileSystem);
            fileSystem.root.getFile("readme.txt", null, this.gotFileEntry, this.fail);
        },

        gotFileEntry: function (fileEntry) {
            console.log("gotFileEntry: " + fileEntry);
            fileEntry.file(this.gotFile, this.fail);
        },

        gotFile: function (file) {
            console.log("gotFile: " + file);
            this.readDataUrl(file);
            this.readAsText(file);
        },

        readDataUrl: function (file) {
            var reader = new FileReader();
            reader.onloadend = function (evt) {
                console.log("Read as data URL");
                console.log(evt.target.result);
            };
            reader.readAsDataURL(file);
        },

        readAsText: function (file) {
            var reader = new FileReader();
            reader.onloadend = function (evt) {
                console.log("Read as text");
                console.log(evt.target.result);
            };
            reader.readAsText(file);
        },

        fail: function (error) {
            console.log("error: " + error);
            console.log(error.code);
        }
            
//            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
//            window.webkitStorageInfo.requestQuota(window.PERSISTENT, 1024 * 1024,
//                function (grantedBytes) {
//                    window.requestFileSystem(window.PERSISTENT, 0, function onFileSystemSuccess(fileSystem) {
//                        fileSystem.root.getFile(
//                            "dummy.html",
//                            {create: true, exclusive: false},
//                            function gotFileEntry(fileEntry) {
//                                var sPath = fileEntry.fullPath.replace("dummy.html", "");
//                                var fileTransfer = new FileTransfer();
//                                fileEntry.remove();
//
//                                fileTransfer.download(
//                                    "http://localhost/aim/Spanish%20to%20Rioplatense%20adaptations.zip",
//                                    sPath + "Spanish%20to%20Rioplatense%20adaptations.zip",
//                                    function (theFile) {
//                                        console.log("download complete: " + theFile.toURI());
//            //                            showLink(theFile.toURI());
//                                    },
//                                    function (error) { // if fileTransfer fails
//                                        console.log("download error source " + error.source);
//                                        console.log("download error target " + error.target);
//                                        console.log("upload error code: " + error.code);
//                                    }
//                                );
//                            },
//                            function (error) { // if gotFileEntry fails
//                                console.log("file entry error: " + error);
//                            }
//                        );
//                    });
//                },
//                function (errorCode) {
//                    console.log("Storage not granted.");
//                });
//        }
    });
});