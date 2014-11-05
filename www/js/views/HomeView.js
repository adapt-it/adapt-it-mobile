/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $               = require('jquery'),
        Handlebars      = require('handlebars'),
        Backbone        = require('backbone'),
        Marionette      = require('marionette'),
        GetStartedView  = require('app/views/GetStartedView'),
        tplText         = require('text!tpl/Home.html'),
        projModel       = require('app/models/project'),
        template        = Handlebars.compile(tplText);


    return Marionette.ItemView.extend({
        template: Handlebars.compile(tplText),
        
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
            var elt = document.getElementById('f-' + index);
            var cl = elt.classList;
            if (cl.contains('project-folder-open')) {
                cl.add('project-folder');
                cl.remove('project-folder-open');
            } else {
                cl.add('project-folder-open');
                cl.remove('project-folder');
            }
        }
    });

});