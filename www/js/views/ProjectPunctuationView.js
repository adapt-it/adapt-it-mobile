/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Underscore  = require('underscore'),
        Handlebars  = require('handlebars'),
        Backbone    = require('backbone'),
        Marionette  = require('marionette'),
        tplText     = require('text!tpl/ProjectPunctuation.html'),
        template    = Handlebars.compile(tplText);

    return Marionette.ItemView.extend({
        template: Handlebars.compile(tplText),
        
        events: {
            "click #CopyPunctuation": "onClickCopyPunctuation"
        },

        onClickCopyPunctuation: function (event) {
            // enable / disable the autocapitalize checkbox based on the value
            if ($("#CopyPunctuation").is(':checked') === true) {
                $("#PunctMappings").prop('hidden', false);
            } else {
                $("#PunctMappings").prop('hidden', true);
            }
        }
    });

});