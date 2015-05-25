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
        // Main view / launchpad for projects. Displays the available projects;
        // when the user clicks on one, it displays the available actions for that particular
        // project. The user can also create or copy a project.
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
                "click .project-item": "toggleProjectFolder",
                "click .topcoat-navigation-bar__title": "onClickTitle"
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
            },
            // Display / hide the contents of the selected project folder
            toggleProjectFolder: function (event) {
                var index = event.currentTarget.id.substr(2);
                var model = this.collection.at(index);
                var elt = document.getElementById('folder');
                var adaptHref = "";
                clickCount = 0;
                // filter out the books for the selected project
                books.fetch({reset: true, data: {projectid: model.get('id')}});
                $('#projTitle').html($(event.currentTarget).find('.txt').html());
                if (model) {
                    $("#settings").attr("href", "#project/" + model.get("id"));
                    $("#import").attr("href", "#import/" + model.get("id"));
                    if (books.length === 0) {
                        // no books imported -- hide the search and adapt links
                        $("#search").hide();
                        $("#adapt").hide();
                    } else {
                        // at least one book imported -- display the search and adapt links
                        $("#search").show();
                        $("#adapt").show();
                        $("#search").attr("href", "#search/" + model.get("id"));
                        if (model.get('lastAdaptedBookID').length !== 0) {
                            adaptHref = "#adapt/" + model.get('lastAdaptedChapterID');
                        }
                        $("#adapt").attr("href", adaptHref);
                        if (model.get('lastAdaptedName').length > 0) {
                            $('#lblAdapt').html(model.get('lastAdaptedName'));
                        } else {
                            // no last adapted Name
                            $('#lblAdapt').html(i18n.t('view.lblAdapt'));
                        }
                    }
                } else {
                    // no last adapted Name
                    $('#lblAdapt').html(i18n.t('view.lblAdapt'));
                }
                var cl = elt.classList;
                if (cl.contains('project-folder-open')) {
                    $(event.currentTarget).addClass('no-bg');
                    $(event.currentTarget).removeClass('light-bg');
                    cl.add('project-folder');
                    cl.remove('project-folder-open');
                } else {
                    $(event.currentTarget).addClass('light-bg');
                    $(event.currentTarget).removeClass('no-bg');
                    cl.add('project-folder-open');
                    cl.remove('project-folder');
                }
            }
        });
    
    return {
        HomeView: HomeView,
        GetStartedView: GetStartedView
    };

});