/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
require.config({

    baseUrl: 'lib',

    paths: {
        // folders
        app: '../js',
        utils: '..//js/utils',
        tpl: '../tpl',
        // libraries
        'i18n': 'i18next.amd.withJQuery.min',
        'jquery': 'jquery-2.1.0.min',
        marionette: 'backbone.marionette'
    },
    map: {
        '*': {
            'app/models': 'app/models/memory'
        }
    },
    shim: {
        'handlebars': {
            exports: 'Handlebars'
        },
        marionette: {
            deps: ['backbone'],
            exports: 'Marionette'
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },
        'jquery': {
            exports: '$'
        }
    }

});

// start the main application object in app.js
require(["app/Application"], function (Application) {
    "use strict";
    
    var theApp = new Application.Application();
    theApp.start();
    window.Application = theApp;
});

//require(['app/app', 'backbone', 'routers/index', 'controllers/index'], function (app, Backbone, Router, Controller) {
//	'use strict';
//
//	app.start();
//
//	new Router({ controller: Controller });
//
//	Backbone.history.start();
//});
