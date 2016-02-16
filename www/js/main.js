/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

require.config({
    
    // 3rd party lib versions:
    // backbone         1.2.1
    // backbone.babysitter 0.1.8
    // backbone.wreqr   1.3.3
    // fastclick        1.0.6
    // handlebars       3.0.3
    // hopscotch        0.2.5
    // i18next          1.9.0
    // jquery           2.1.4
    // marionette       2.4.2
    // require          2.1.18
    // spectrum         1.7.0
    // text             2.0.14
    // typeahead        0.11.1
    // underscore       1.8.3

    baseUrl: 'lib',

    paths: {
        // folders
        app: '../js',
        utils: '../js/utils',
        tpl: '../tpl',
        // libraries
        typeahead: 'typeahead.bundle',
        'i18n': 'i18next.amd.withJQuery.min',
        'jquery': 'jquery-2.1.4.min',
        'languages': '../js/utils/languages',
        marionette: 'backbone.marionette',
        colorpicker: 'spectrum'
    },
    map: {
        '*': {
            'app/models': 'app/models/sql' // Use sqlite model persistence
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
        typeahead: {
            deps: ['jquery'],
            init: function ($) {
                "use strict";
                // typeahead has a naming bug that conflicts with requirejs; 
                // workaround is from here: https://github.com/twitter/typeahead.js/issues/1211
                return require.s.contexts._.registry['typeahead.js'].factory($);
            }
        },
        colorpicker: {
            deps: ['jquery']
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

    var runningOnApp = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
    
    var startTheApp = function () {
        var theApp = new Application.Application();
        theApp.start();
        window.Application = theApp;
    };

    if (runningOnApp) {
        // "real" Cordova application - start the app after DeviceReady is fired
        document.addEventListener("deviceready", startTheApp, true);
    } else {
        // Local web page - no cordova.js installed and no access to native plugins;
        // just start up the app now
        startTheApp();
    }
    
});
