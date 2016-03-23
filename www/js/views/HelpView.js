/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $               = require('jquery'),
        Handlebars      = require('handlebars'),
        Backbone        = require('backbone'),
        Marionette      = require('marionette'),
        tplText         = require('text!tpl/Help.html'),
        template = Handlebars.compile(tplText);


    return Backbone.View.extend({
        template: Handlebars.compile(tplText)
    });

});