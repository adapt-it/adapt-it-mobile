/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var Handlebars  = require('handlebars'),
        Marionette  = require('marionette'),
        tplText     = require('text!tpl/LanguagesList.html'),
        template = Handlebars.compile(tplText);


    return Marionette.ItemView.extend({
        template: Handlebars.compile(tplText)
    });

});