/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Underscore  = require('underscore'),
        Handlebars  = require('handlebars'),
        Backbone    = require('backbone'),
        Marionette  = require('marionette'),
        usfm       = require('utils/usfm'),
        tplText     = require('text!tpl/ProjectUSFMFiltering.html'),
        template    = Handlebars.compile(tplText);

    return Marionette.CompositeView.extend({
        template: Handlebars.compile(tplText),
        
        initialize: function () {
            this.coll = new usfm.MarkerCollection();
//            this.render();
        },

        render: function () {
            this.coll.fetch({reset: true, data: {name: ""}}); // return all results
            
            var contents = template(this.coll.toJSON());
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