/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $               = require('jquery'),
        Handlebars      = require('handlebars'),
        Backbone        = require('backbone'),
        Marionette      = require('marionette'),
        GetStartedView  = require('app/views/GetStartedView'),
        WelcomeView     = require('app/views/WelcomeView'),
        HomeNormalView  = require('app/views/HomeNormalView'),
        tplText         = require('text!tpl/Home.html'),
        projModel       = require('app/models/project'),
        template = Handlebars.compile(tplText);


    return Marionette.ItemView.extend({

        initialize: function () {
            this.render();
        },

        render: function () {
            var currentView,
                coll = new projModel.ProjectCollection();
            coll.fetch({reset: true, data: {name: ""}});
            this.$el.html(template());
            console.log("Projects:" + coll.length);
            // if this is a new install, show the welcome screen
            if (coll.length === 0) {
                // no project -- show welcome subview
                currentView = new WelcomeView();
                this.$('#Container').html(currentView.render().el.childNodes);
            } else {
                // project(s) -- display normal view
                currentView = new HomeNormalView({collection: coll});
                this.$('#Container').html(currentView.render().el.childNodes);
            }
            return this;
        },
        
        ////
        // Event Handlers
        ////
        events: {
            "click #Continue": "onContinue"
        },
        
        onContinue: function (event) {
            console.log("onContinue");
            var currentView = new GetStartedView();
            this.$('#Container').html(currentView.render().el.childNodes);
        }
    });

});