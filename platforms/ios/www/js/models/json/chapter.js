define(function (require) {

    "use strict";

    var Backbone = require('backbone'),

        Chapter = Backbone.Model.extend({

            urlRoot: "http://localhost:3000/chapter"

        }),

        ChapterCollection = Backbone.Collection.extend({

            model: Chapter,

            url: "http://localhost:3000/chapters"

        });

    return {
        Chapter: Chapter,
        ChapterCollection: ChapterCollection
    };

});