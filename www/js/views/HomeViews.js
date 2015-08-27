/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $               = require('jquery'),
        Handlebars      = require('handlebars'),
        Backbone        = require('backbone'),
        Marionette      = require('marionette'),
        i18n            = require('i18n'),
        tplHome         = require('text!tpl/Home.html'),
        tplGetStarted   = require('text!tpl/GetStarted.html'),
        projModel       = require('app/models/project'),
        bookModel       = require('app/models/book'),
        chapterModel    = require('app/models/chapter'),
        spModel         = require('app/models/sourcephrase'),
        kbmodel         = require('app/models/targetunit'),
        clickCount      = 0,
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
                        navigator.notification.confirm(i18n.t('view.dscReset'), function (buttonIndex) {
                            if (buttonIndex === 1) {
                                resetAIM();
                            }
                        }, i18n.t('view.ttlReset'));
                    } else {
                        // in browser
                        if (confirm(i18n.t('view.dscReset'))) {
                            resetAIM();
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
        GetStartedView: GetStartedView
    };

});