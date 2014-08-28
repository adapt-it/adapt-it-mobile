/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Underscore  = require('underscore'),
        Handlebars  = require('handlebars'),
        Backbone    = require('backbone'),
        tplText     = require('text!tpl/ProjectUSFMFiltering.html'),
        template    = Handlebars.compile(tplText);

    return Backbone.View.extend({
        
        initialize: function () {
//            this.render();
        },

        render: function () {
            var contents = template(this.model.toJSON());
            this.$el.html(contents);
            return this;
        },
        
        events: {
            "click #CustomFilters": "onClickCustomFilters"
        },

        onClickCustomFilters: function (event) {
            // enable / disable the autocapitalize checkbox based on the value
            if ($("#CustomFilters").is(':checked') === true) {
                $("#USFMFilters").prop('hidden', false);
            } else {
                $("#USFMFilters").prop('hidden', true);
            }
        }
    });

});