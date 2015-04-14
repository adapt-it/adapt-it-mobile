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
        books           = null,

        GetStartedView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplGetStarted)
        }),
        
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
                "click .project-item": "toggleProjectFolder"
            },
            onContinue: function (event) {
                var currentView = new GetStartedView();
                this.$('#Container').html(currentView.render().el.childNodes);
            },
            // Display / hide the contents of the selected project folder
            toggleProjectFolder: function (event) {
                var index = event.currentTarget.id.substr(2);
                var model = this.collection.at(index);
                var elt = document.getElementById('folder');
                books.fetch({reset: true, data: {name: ""}});
                var adaptHref = "";
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