/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require) {

    "use strict";

    var Backbone = require('backbone'),

        Font = Backbone.Model.extend({

            urlRoot: "http://localhost:3000/font"

        }),

        FontCollection = Backbone.Collection.extend({

            model: Font,

            url: "http://localhost:3000/fonts"

        });

    return {
        Font: Font,
        FontCollection: FontCollection
    };

});