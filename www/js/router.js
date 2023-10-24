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
            "lang":         "setUILanguage",    // #lang (set UI language)
            "copy":        "copyProject",       // #copy
            "project":      "newProject",       // #project
            "project/:id":  "editProject",      // #project/projectID
            "search/:id":   "lookupChapter",    // #search/projectID
            "kb/:id":       "editKB",           // #kb/projectID (KB editor)
            "tu":           "newTU",            // #tu (create a new TU)
            "tu/:tuid":     "editTU",           // #tu/target unit ID (TU editor)
            "sp/:spid":     "showTranslations", // #sp/source phrase ID (show translations for SP)
            "import/:id":   "importBooks",      // #import/projectID (import books into projectID)
            "export/:id":   "exportBooks",      // #export/projectID (export books from projectID)
            "adapt/:chapterid":    "adaptChapter"      // #adapt/chapterID (adapt chapterID)
        }
    });
});