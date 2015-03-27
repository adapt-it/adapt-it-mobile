/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        i           = 0,
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
            var results = null;
            if (books !== null) {
                results = books.filter(function (element) {
                    return element.attributes.name.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
                });
            }
            deferred.resolve(results);
            return deferred.promise();
        },

        Book = Backbone.Model.extend({
            defaults: {
                id: "",
                name: "",
                filename: "",
                chapters: 0
            },
            initialize: function () {
                this.on('change', this.save, this);
            },
            fetch: function () {
                // search for our key - b.<id>
                this.set(JSON.parse(localStorage.getItem("b." + this.id)));
            },
            save: function (attributes) {
                // only save if the id actually has a value
                if (this.id.length > 1) {
                    // save with a key of b.<id>
                    localStorage.setItem(("b." + this.id), JSON.stringify(this));
                }
            },
            destroy: function (options) {
                localStorage.removeItem(this.id);
            },

            sync: function (method, model, options) {
                switch (method) {
                case 'create':
                    options.success(model);
                    break;
                        
                case 'read':
                    findById(this.id).done(function (data) {
                        options.success(data);
                    });
                    break;
                        
                case 'update':
                    model.save();
                    options.success(model);
                    break;
                        
                case 'delete':
                    model.destroy(options);
                    options.success(model);
                    break;
                }
            }
        }),

        BookCollection = Backbone.Collection.extend({

            model: Book,

            resetFromLocalStorage: function () {
                var i = 0,
                    len = 0;
                for (i = 0, len = localStorage.length; i < len; ++i) {
                    // if this is a book, add it to our collection
                    if (localStorage.key(i).substr(0, 2) === "b.") {
                        var bk = new Book();
                        bk.set(JSON.parse(localStorage.getItem(localStorage.key(i))));
                        books.push(bk);
                    }
                }
            },

            resetFromDB: function (callback) {
                directory.db.transaction(
                    function (tx) {
                        var sql =
                            "CREATE TABLE IF NOT EXISTS book ( " +
                            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                            "name VARCHAR(50), " +
                            "chapters VARCHAR(50), ";
                        console.log('Creating BOOK table');
                        tx.executeSql(sql);
                    }
                );
            },

            initialize: function () {
                this.resetFromLocalStorage();
            },

            sync: function (method, model, options) {
                if (method === "read") {
                    if (options.data.hasOwnProperty('id')) {
                        findById(options.data.id).done(function (data) {
                            options.success(data);
                        });
                    } else if (options.data.hasOwnProperty('name')) {
                        findByName(options.data.name).done(function (data) {
                            options.success(data);
                        });
                    }
                }
            }

        });

    return {
        Book: Book,
        BookCollection: BookCollection
    };

});