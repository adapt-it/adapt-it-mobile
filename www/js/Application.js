/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $               = require('jquery'),
        Backbone        = require('backbone'),
        Marionette      = require('marionette'),
        HomeView        = require('app/views/HomeView'),
        projModel       = require('app/models/project'),
        Router          = require('app/router'),
        FastClick       = require('fastclick'),
        i18n            = require('i18n'),
        lang            = "",
        locale          = "en-AU";  // default


    return Marionette.Application.extend({

        // app initialization code. Here we'll initialize localization with the current locale 
        initialize: function (options) {
            // add the UI regions (just the main "content" for now)
            this.addRegions({
                main: '#content'
            });
            // get the user's locale - mobile or web
            if (typeof navigator.globalization !== 'undefined') {
                // on mobile phone
                navigator.globalization.getLocaleName(
                    function (loc) {locale = loc.value; },
                    function () {console.log('Error getting locale\n'); }
                );
            } else {
                // in web browser
                lang = navigator.language.split("-");
                locale = lang[0];
            }
        //    console.log("locale:" + locale);
            // initialize / load the localization info
            i18n.init({
                lng: locale,
                debug: true,
                fallbackLng: 'en'
            }, function () {
                // i18next is done asynchronously; this is the callback function
                // Tell backbone we're ready to start loading the View classes.
                Backbone.history.start();

                var coll = new projModel.ProjectCollection();
                coll.fetch({reset: true, data: {name: ""}});

                var home = new HomeView({collection: coll});
                
                // note: our context in this callback is the window object; we've saved the application
                // there in main.js as window.Application
                this.Application.main.show(home);

                coll.fetch();
            });

            var router  = new Router();

            $(function () {
                FastClick.attach(document.body);
            });

            $("body").on("click", ".back-button", function (event) {
                event.preventDefault();
                window.history.back();
            });
        }
    });
});