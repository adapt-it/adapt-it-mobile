/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

require.config({
    
    // 3rd party lib versions:
    // backbone         1.4.0
    // backbone.babysitter 0.1.12
    // backbone.wreqr   1.4.0
    // circular-progress-bar 1.0.6
    // fastclick        1.0.6
    // featherlight     1.7.6
    // featherlight.gallery 1.7.6
    // hammer           2.0.8
    // handlebars       4.7.7
    // hopscotch        0.3.1+  ** NOTE: if upgrading, fold in the hack in hopscotch.js (search for EDB HACK) -
    //                          ** This is for hopscotch on smaller screens, issue #30 on hopscotch, or #189 on AIM 
    // i18next          1.9.0
    // jquery           3.5.1
    // marionette       2.4.2
    // require          2.3.6
    // spectrum         1.8.1
    // text             2.0.15
    // typeahead        0.11.1
    // underscore       1.9.1

    baseUrl: 'lib',

    paths: {
        // folders
        app: '../js',
        utils: '../js/utils',
        tpl: '../tpl',
        // libraries
        'backbone': 'backbone-min',
        'hammerjs': 'hammer',
        'handlebars': 'handlebars.min-v4.7.7',
        'jquery-hammerjs': 'jquery.hammer',
        typeahead: 'typeahead.bundle',
        'i18n': 'i18next.amd.withJQuery.min', //'jquery-i18next.min',//
        'jquery': 'jquery-3.5.1.min',
        'languages': '../js/utils/languages',
        marionette: 'backbone.marionette',
        'featherlight': 'featherlight.min',
        'underscore': 'underscore-min',
        'featherlightGallery': 'featherlight.gallery.min',
        'circularProgressBar': 'circularProgressBar.min',
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
            deps: ['jquery-hammerjs', 'underscore-min'],
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

// Handler for opening / importing a file from another process. This could be called when AIM
// is up and running, or the OS could be sending us this file before we've initialized
// (i.e., on startup). Check to see if there's an Application; if there isn't one yet, store
// the URL in localStorage until we're ready for it (see Application::onInitDB's i18n.init() callback)
window.handleOpenURL = function(url) {
    console.log("handleOpenURL: " + url);
    if (window.Application) {
        // ready event has fired and app is ready for events... handle the URL
        console.log("handleOpenURL: app is already open; attempting to process file");
        if (url.indexOf("content:") !== -1) {
            // content://path from Android -- pull out the filename and store it on the application obj
            window.FilePath.resolveNativePath(url, function(absolutePath) {
                window.Application.importingURL = absolutePath;
                window.resolveLocalFileSystemURL(url, window.Application.processFileEntry, window.Application.processError);
              });
        } else {
            // not a content://path url -- resolve and process file
            window.Application.importingURL = ""; // clear
            window.resolveLocalFileSystemURL(url, window.Application.processFileEntry, window.Application.processError);
        }
    } else {
        // we're still waking up... store the url 
        // (it'll get processed in Application.js when we go to the home page)
        localStorage.setItem('share_url', url);
    }
};

// start the main application object in app.js
require(["app/Application"], function (Application) {
    "use strict";

    var runningOnApp = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
    
    var startTheApp = function () {
        var theApp = new Application.Application();
        window.Application = theApp;
        theApp.start();
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
