define(function (require) {

    "use strict";

    var Backbone = require('backbone'),

        Book = Backbone.Model.extend({

            urlRoot: "http://localhost:3000/book"

        }),

        BookCollection = Backbone.Collection.extend({

            model: Book,

            url: "http://localhost:3000/books"

        });

    return {
        Book: Book,
        BookCollection: BookCollection
    };

});