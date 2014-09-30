/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Handlebars  = require('handlebars'),
        Backbone    = require('backbone'),
        Marionette  = require('marionette'),
        tplText     = require('text!tpl/ChapterList.html'),
        template = Handlebars.compile(tplText);


    return Marionette.CollectionView.extend({

        initialize: function () {
            this.render();
            this.collection.on("reset", this.render, this);
        },

        render: function () {
            this.$el.html(template(this.collection.toJSON()));
            return this;
        }

    });

});