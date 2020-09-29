/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require) {

    "use strict";

    var Backbone = require('backbone'),

        Book = Backbone.Model.extend({

            urlRoot: "/book"

        }),

        BookCollection = Backbone.Collection.extend({

            model: Book,

            url: "/books"

        });

    return {
        Book: Book,
        BookCollection: BookCollection
    };

});