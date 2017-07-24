/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

require.config({
    
    // 3rd party lib versions:
    // backbone         1.3.3
    // backbone.babysitter 0.1.8
    // backbone.wreqr   1.3.3
    // fastclick        1.0.6
    // featherlight     1.7.6
    // featherlight.gallery 1.7.6
    // hammer           2.0.8
    // handlebars       4.0.10
    // hopscotch        0.2.6+  ** NOTE: if upgrading, fold in the hack in hopscotch.js (search for EDB HACK) -
    //                          ** This is for hopscotch on smaller screens, issue #30 on hopscotch, or #189 on AIM 
    // i18next          1.9.0
    // jquery           3.2.1
    // marionette       2.4.2
    // require          2.3.3
    // spectrum         1.8.0
    // text             2.0.15
    // typeahead        0.11.1
    // underscore       1.8.3

    baseUrl: 'lib',

    paths: {
        // folders
        app: '../js',
        utils: '../js/utils',
        tpl: '../tpl',
        // libraries
        'backbone': 'backbone-min',
        'hammerjs': 'hammer',
        'handlebars': 'handlebars-v4.0.10',
        'jquery-hammerjs': 'jquery.hammer',
        typeahead: 'typeahead.bundle',
        'i18n': 'i18next.amd.withJQuery.min', //'jquery-i18next.min',//
        'jquery': 'jquery-3.2.1.min',
        'languages': '../js/utils/languages',
        marionette: 'backbone.marionette',
        'featherlight': 'featherlight.min',
        'featherlightGallery': 'featherlight.gallery.min',
        colorpicker: 'spectrum'
    },
    map: {
        '*': {
            'app/models': 'app/models/sql' // Use sqlite model persistence
        }
    },
    shim: {
        'featherlightGallery': {
            deps: ['featherlight', 'jquery'],
            exports: 'featherlightGallery'
        },
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
//            deps: ['underscore', 'jquery'],
            deps: ['jquery-hammerjs', 'underscore'],
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
        theApp.checkDBSchema();
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
