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
        ProjectFontView = require('app/views/ProjectFontView'),
        ProjectSourceLanguageView = require('app/views/ProjectSourceLanguageView'),
        ProjectTargetLanguageView = require('app/views/ProjectTargetLanguageView'),
        ProjectPunctuationView = require('app/views/ProjectPunctuationView'),
        ProjectUSFMFilteringView = require('app/views/ProjectUSFMFilteringView'),
        projModel   = require('app/models/project'),
        obj         = {},
        currentView = null, // view
        projCasesView = null,
        projFontsView = null,
        projFontView = null,
        projSourceLanguageView = null,
        projTargetLanguageView = null,
        projPunctuationView = null,
        projUSFMFiltingView = null,
        step        = 1,
        template    = Handlebars.compile(tplText);


    return Backbone.View.extend({

        initialize: function () {
//            obj.indexedDB = {};
//            obj.indexedDB.db = null;
            this.OnNewProject();
            this.render();
            // start the wizard
            this.ShowStep(step);
        },

        render: function () {
            this.$el.html(template());
            return this;
        },
        
        ////
        // Event Handlers
        ////
        events: {
            "click #sourceFont": "OnEditSourceFont",
            "click #targetFont": "OnEditTargetFont",
            "click #navFont": "OnEditNavFont",
            "keyup #SourceLanguageName":    "searchSource",
            "keypress #SourceLanguageName": "onkeypressSourceName",
            "keyup #TargetLanguageName":    "searchTarget",
            "keypress #TargetLanguageName": "onkeypressTargetName",
            "click .autocomplete-suggestion": "selectLanguage",
            "click #CopyPunctuation": "OnClickCopyPunctuation",
            "click #SourceHasCases": "OnClickSourceHasCases",
            "click #AutoCapitalize": "OnClickAutoCapitalize",
            "click #CustomFilters": "OnClickCustomFilters",
            "click #Prev": "OnPrevStep",
            "click #Next": "OnNextStep"
        },

        searchSource: function (event) {
            currentView.search(event);
        },

        onkeypressSourceName: function (event) {
            currentView.onkeypress(event);
        },
        
        searchTarget: function (event) {
            currentView.search(event);
        },

        onkeypressTargetName: function (event) {
            currentView.onkeypress(event);
        },

        selectLanguage: function (event) {
            currentView.onSelectLanguage(event);
        },
        
        OnClickCopyPunctuation: function (event) {
            currentView.onClickCopyPunctuation(event);
        },

        OnClickSourceHasCases: function (event) {
            currentView.onClickSourceHasCases(event);
        },
        
        OnClickAutoCapitalize: function (event) {
            currentView.onClickAutoCapitalize(event);
        },

        OnClickCustomFilters: function (event) {
            currentView.onClickCustomFilters(event);
        },
        
        OnEditSourceFont: function (event) {
            console.log("OnEditSourceFont");
//            currentView = new ProjectFontView({ model: this.model});
//            // title
//            this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
//            // instructions
//            this.$("#StepInstructions").html(i18n.t('view.dscProjectSourceLanguage'));
//            // controls
//            this.$('#StepContainer').html(currentView.render().el.childNodes);
//            // first step -- disable the prev button
//            this.$("#Prev").attr('disabled', 'true');
//            this.$("#lblPrev").html(i18n.t('view.lblPrev'));
//            this.$("#lblNext").html(i18n.t('view.lblNext'));
        },

        OnEditTargetFont: function (event) {
            console.log("OnEditTargetFont");
        },

        OnEditNavFont: function (event) {
            console.log("OnEditNavFont");
        },
        
        OnPrevStep: function (event) {
            // pull the info from the current step
            this.GetProjectInfo(step);
            if (step > 1) {
                step--;
            }
            this.ShowStep(step);
        },

        OnNextStep: function (event) {
            var coll = null;
            // pull the info from the current step
            this.GetProjectInfo(step);
            if (step < 6) {
                step++;
            } else {
                // last step -- finish up
                coll = new projModel.ProjectCollection();
                // add the project to the collection
                coll.add(this.model);
                // head back to the home page
                console.log("last step - project count:" + coll.length);
                $(".back-button").trigger("click");
            }
            this.ShowStep(step);
        },
        
        GetProjectInfo: function (step) {
            var value = null,
                index = 0,
                punctPairs = null,
                trimmedValue = null;
            switch (step) {
            case 1: // source language
                this.model.set("SourceLanguageName", currentView.langName);
                this.model.set("SourceLanguageCode", currentView.langCode);
                this.model.set("SourceDir", ($('#SourceRTL').is(':checked') === true) ? "rtl" : "ltr");
                break;
            case 2: // target language
                this.model.set("SourceLanguageName", currentView.langName);
                this.model.set("SourceLanguageCode", currentView.langCode);
                this.model.set("TargetDir", ($('#TargetRTL').is(':checked') === true) ? "rtl" : "ltr");
                break;
            case 3: // fonts
                break;
            case 4: // punctuation
                punctPairs = this.model.get("PunctPairs");
                for (index = 0; index < punctPairs.length; index++) {
//                    punctPairs[index]
                }
                break;
            case 5: // cases
                break;
            case 6: // USFM filtering
                break;
            }
        },

        OnNewProject: function () {
            // create a new project model object
            //this.openDB();
            // create the view objects
            projCasesView = new ProjectCasesView({ model: this.model});
            projFontsView = new ProjectFontsView({ model: this.model});
            projSourceLanguageView =  new ProjectSourceLanguageView({ model: this.model});
            projTargetLanguageView =  new ProjectTargetLanguageView({ model: this.model});
            projPunctuationView = new ProjectPunctuationView({ model: this.model});
            projUSFMFiltingView = new ProjectUSFMFilteringView({ model: this.model});
        },
        
        ShowStep: function (number) {
            // clear out the old view (if any)
            currentView = null;
            switch (number) {
            case 1: // source language
                currentView = projSourceLanguageView;
                // title
                this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                // instructions
                this.$("#StepInstructions").html(i18n.t('view.dscProjectSourceLanguage'));
                // controls
                this.$('#StepContainer').html(currentView.render().el.childNodes);
                // first step -- disable the prev button
                this.$("#Prev").attr('disabled', 'true');
                this.$("#lblPrev").html(i18n.t('view.lblPrev'));
                this.$("#lblNext").html(i18n.t('view.lblNext'));
                break;
            case 2: // target language
                currentView = projTargetLanguageView;
                // title
                this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                // instructions
                this.$("#StepInstructions").html(i18n.t('view.dscProjectTargetLanguage'));
                // controls
                this.$('#StepContainer').html(currentView.render().el.childNodes);
                this.$("#Prev").removeAttr('disabled');
                break;
            case 3: // fonts
                currentView = projFontsView;
                // title
                $("#StepTitle").html(i18n.t('view.lblCreateProject'));
                // instructions
                $("#StepInstructions").html(i18n.t('view.dscProjectFonts'));
                // controls
                $('#StepContainer').html(currentView.render().el.childNodes);
                // Second step -- enable the prev button
                break;
            case 4: // punctuation
                currentView = projPunctuationView;
                // title
                this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                // instructions
                this.$("#StepInstructions").html(i18n.t('view.dscProjectPunctuation'));
                // controls
                this.$('#StepContainer').html(currentView.render().el.childNodes);
                break;
            case 5: // cases
                currentView = projCasesView;
                // title
                this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                // instructions
                this.$("#StepInstructions").html(i18n.t('view.dscProjectCases'));
                // controls
                this.$('#StepContainer').html(currentView.render().el.childNodes);
                // Penultimate step -- enable the next button (only needed
                // if the user happens to back up from the last one)
                this.$("#lblNext").html(i18n.t('view.lblNext'));
                this.$("#imgNext").removeAttr("style");
                break;
            case 6: // USFM filtering
                currentView = projUSFMFiltingView;
                // title
                this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                // instructions
                this.$("#StepInstructions").html(i18n.t('view.dscProjectUSFMFiltering'));
                // controls
                this.$('#StepContainer').html(currentView.render().el.childNodes);
                // Last step -- change the text of the Next button to "finish"
                this.$("#lblNext").html(i18n.t('view.lblFinish'));
                this.$("#imgNext").attr("style", "display:none");
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