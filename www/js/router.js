/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var Marionette  = require('marionette');

    // Unlike the Backbone.Router class, the AppRouter's appRoutes property refers
    // to helper methods on the controller.
    // This class now just provides the wiring; the helper methods (e.g., "lookupChapter") are
    // in Application.js.
    return Marionette.AppRouter.extend({
        appRoutes: {
            "":             "home",             // (top level)
            "help":         "help",             // #help
            "project":      "project",          // #project
            "lookup":       "lookupChapter",    // #lookup
            "adapt/:id":    "adaptChapter"      // #adapt/RUT001 (3-letter ID of book + 3 digit chapter number)
        }
    });
});