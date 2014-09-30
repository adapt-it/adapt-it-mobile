/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Underscore  = require('underscore'),
        Handlebars  = require('handlebars'),
        Backbone    = require('backbone'),
        Marionette  = require('marionette'),
        fontColor   = "#000",
        fontSize    = "16px",
        fontName    = "Source Sans",
        tplText     = require('text!tpl/ProjectFont.html'),
        template    = Handlebars.compile(tplText);

    return Marionette.ItemView.extend({
        
        initialize: function () {
//            this.render();
        },

        render: function () {
            var contents = template(this.model.toJSON());
            this.$el.html(contents);
            return this;
        }
    });

});