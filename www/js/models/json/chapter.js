/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require) {

    "use strict";

    var Backbone = require('backbone'),

        Chapter = Backbone.Model.extend({

            urlRoot: "/chapter"

        }),

        ChapterCollection = Backbone.Collection.extend({

            model: Chapter,

            url: "/chapters"

        });

    return {
        Chapter: Chapter,
        ChapterCollection: ChapterCollection
    };

});