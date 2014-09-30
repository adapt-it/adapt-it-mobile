/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Underscore  = require('underscore'),
        Handlebars  = require('handlebars'),
        Marionette  = require('marionette'),
        tplText     = require('text!tpl/SourcePhrase.html'),
        template    = Handlebars.compile(tplText);

    return Marionette.ItemView.extend({
//        template: Handlebars.compile(tplText),
//        model: this.model
        initialize: function () {
			//this.listenTo(this.model, 'change', this.render);
            this.model.bind('change', this.render, this);
			this.listenTo(this.model, 'destroy', this.remove);
        },

        render: function () {
            var contents = template(this.model.toJSON());
            this.$el.html(contents);
            return this;
        }
    });

});