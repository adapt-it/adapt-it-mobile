/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

// HomeViews.js
// Getting Started, Home (main) screen, UI language screen.
// Also handles the (hidden) reset functionality for AIM.
define(function (require) {

    "use strict";

    var $               = require('jquery'),
        Handlebars      = require('handlebars'),
        Backbone        = require('backbone'),
        Marionette      = require('marionette'),
        i18n            = require('i18n'),
        tplHome         = require('text!tpl/Home.html'),
        tplGetStarted   = require('text!tpl/GetStarted.html'),
        tplUILanguage   = require('text!tpl/UILanguage.html'),
        projModel       = require('app/models/project'),
        bookModel       = require('app/models/book'),
        chapterModel    = require('app/models/chapter'),
        spModel         = require('app/models/sourcephrase'),
        kbmodel         = require('app/models/targetunit'),
        clickCount      = 0,
        strPassword     = "dangerous",
        books           = null,
        chapters        = null,
        sourcephrases   = null,
        targetunits     = null,
        projects        = null,
        
        // Helper method to completely reset AIM. Called when the user clicks on the
        // title ("Adapt It Mobile") 5 TIMES on the Home View without clicking elsewhere,
        // and then confirming the action in a popup dialog.
        resetAIM = function () {
            // user wants to reset
            projects = new projModel.ProjectCollection();
            chapters = new chapterModel.ChapterCollection();
            sourcephrases = new spModel.SourcePhraseCollection();
            targetunits = new kbmodel.TargetUnitCollection();
            // clear all documents
            sourcephrases.clearAll();
            chapters.clearAll();
            books.clearAll();
            // clear KB
            targetunits.clearAll();
            // clear all project data
            window.Application.currentProject = null;
            projects.clearAll();
            // refresh the view
            window.Application.ProjectList.fetch({reset: true, data: {name: ""}});
            Backbone.history.loadUrl(Backbone.history.fragment);
        },

        // UILanguageView
        // Simple view to allow the user to override the language setting for the user interface.
        // Normally we just follow the locale settings for the phone, but some devices do not support
        // minority languages like Tok Pisin. This view allows them to either follow the device's locale settings
        // or override the setting for AIM and select another language instead.
        UILanguageView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplUILanguage),
            events: {
                "change #language":   "onSelectCustomLanguage",
                "click #OK":                "onOK",
                "click #Cancel":            "onCancel"
            },
            // User has selected a language from the drop-down list. Make sure "custom" is selected from
            // the radio buttons.
            onSelectCustomLanguage: function (event) {
                // change the radio button selection
                $("#customLanguage").prop("checked", true);
            },
            // Load the setting from localStorage (stored with "UILang" as the key). If there's nothing there,
            // the user has selected the standard locale on their device.
            onShow: function (event) {
                if (localStorage.getItem("UILang")) {
                    // use custom language -- select the language used
                    $('#language').val(localStorage.getItem("UILang"));
                    $("#customLanguage").prop("checked", true); // onSelectCustomLanguage() should already do this, but just in case...
                } else {
                    // use device language
                    $("#deviceLanguage").prop("checked", true);
                }
            },
            // User has clicked on the OK button. Change to the selected locale if needed, and then return.
            onOK: function (event) {
                var loc = "";
                var locale = "";
                if ($("#customLanguage").is(":checked")) {
                    // Use a custom language
                    loc = $('#language').val();
                    // set the language in local storage
                    localStorage.setItem(("UILang"), loc);
                    // set the locale, then return
                    i18n.setLng(loc, function (err, t) {
                        // go back to the previous page
                        window.history.go(-1);
                    });
                } else {
                    // use the mobile device's setting
                    // remove the language in local storage (so we get it dynamically the next time the app is launched)
                    localStorage.removeItem("UILang");
                    // get the user's locale - mobile or web
                    if (typeof navigator.globalization !== 'undefined') {
                        navigator.globalization.getPreferredLanguage( // per docs, falls back on getLocaleName
                            function (loc) {
                                locale = loc.value.split("-")[0];
                                // set the locale, then return
                                i18n.setLng(locale, function (err, t) {
                                    // go back to the previous page
                                    window.history.go(-1);
                                });
                            },
                            function () {console.log('Error getting locale\n'); }
                        );
                    } else {
                        // in web browser
                        var lang = (navigator.languages) ? navigator.languages[0] : (navigator.language || navigator.userLanguage);
                        locale = lang.split("-")[0];
                        // set the locale, then return
                        i18n.setLng(locale, function (err, t) {
                            // go back to the previous page
                            window.history.go(-1);
                        });
                    }
                }
            },
            // User clicked the Cancel button. Here we don't do anything -- just return
            OnCancel: function (event) {
                // go back to the previous page
                window.history.go(-1);
            }
        }),

        // GetStartedView
        // Simple view to allow the user to either create or copy a project
        GetStartedView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplGetStarted)
        }),

        // HomeView
        // Main view / launchpad for projects. Displays the available actions for the current
        // project (window.Application.currentProject, initialized in application.js).
        HomeView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplHome),
            
            onShow: function () {
                books = new bookModel.BookCollection();
                books.fetch({reset: true, data: {name: ""}});
                clickCount = 0;
            },

            ////
            // Event Handlers
            ////
            events: {
                "click #Continue": "onContinue",
                "click #projTitle": "onClickTitle"
            },
            // User clicked on the title ("Adapt It Mobile").
            // Keeps track of the number of times they've clicked -- if they've clicked 5 times,
            // displays a confirmation dialog, and then resets AIM if that's what the user wanted to do.
            onClickTitle: function (event) {
                clickCount++;
                if (clickCount === 5) {
                    clickCount = 0;
                    console.log("Hard reset called");
                    
                    if (navigator.notification) {
                        // on mobile device
                        navigator.notification.prompt(i18n.t('view.dscPassword'), function (results) {
                            if (results.buttonIndex === 1 && results.input1 === strPassword) {
                                navigator.notification.confirm(i18n.t('view.dscReset'), function (buttonIndex) {
                                    if (buttonIndex === 1) {
                                        resetAIM();
                                    }
                                }, i18n.t('view.ttlReset'));
                            }
                        }, i18n.t('view.ttlReset'));
                    } else {
                        // in browser
                        if (prompt(i18n.t('view.dscPassword')) === strPassword) {
                            if (confirm(i18n.t('view.dscReset'))) {
                                resetAIM();
                            }
                        }
                    }
                }
            },
            // User clicked on the Continue button (initial startup screen). Redirects the user to
            // the GetStartedView
            onContinue: function (event) {
                var currentView = new GetStartedView();
                this.$('#Container').html(currentView.render().el.childNodes);
                clickCount = 0;
            }
        });
    
    return {
        HomeView: HomeView,
        UILanguageView: UILanguageView,
        GetStartedView: GetStartedView
    };

});