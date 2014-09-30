/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Underscore  = require('underscore'),
        Handlebars  = require('handlebars'),
        Backbone    = require('backbone'),
        Marionette  = require('marionette'),
        tplText     = require('text!tpl/HomeNormal.html'),
        template    = Handlebars.compile(tplText),
        project     = null;

    return Backbone.View.extend({
        
        initialize: function () {
//            this.render();
        },

        render: function () {
            this.project = this.collection.at(0);
            this.$el.html(template(this.project.toJSON()));
            return this;
        }
    });

});