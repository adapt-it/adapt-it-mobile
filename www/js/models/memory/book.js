/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        i           = 0,
        /* OT/NT books, not counting apocrypha
        */
        books = [],
        findById = function (id) {
            var deferred = $.Deferred(),
                book = null,
                l = books.length;
            for (i = 0; i < l; i++) {
                if (books[i].id === id) {
                    book = books[i];
                    break;
                }
            }
            deferred.resolve(book);
            return deferred.promise();
        },

        findByName = function (searchKey) {
            var deferred = $.Deferred();
            var results = books.filter(function (element) {
                return element.name.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
            deferred.resolve(results);
            return deferred.promise();
        },

        Book = Backbone.Model.extend({
            defaults: {
                id: "",
                name: "",
                chapters: 0
            },
            sync: function (method, model, options) {
                if (method === "read") {
                    findById(this.id).done(function (data) {
                        options.success(data);
                    });
                }
            }

        }),

        BookCollection = Backbone.Collection.extend({

            model: Book,

            sync: function (method, model, options) {
                if (method === "read") {
                    findByName(options.data.name).done(function (data) {
                        options.success(data);
                    });
                }
            }

        });

    return {
        Book: Book,
        BookCollection: BookCollection
    };

});