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
                bookid: "",
                projectid: 0,
                scrid: "",
                name: "",
                filename: "",
                chapters: ""
            },
            initialize: function () {
                this.on('change', this.save, this);
            },
            fetch: function () {
                var attributes = this.attributes;
                window.Application.db.transaction(function (tx) {
                    tx.executeSql("SELECT * from book WHERE bookid=?;", [attributes.bookid], function (tx, res) {
                        console.log("SELECT ok: " + res.rows);
                        this.set(res.rows.item(0));
                    });
                }, function (tx, err) {
                    console.log("SELECT error: " + err.toString());
                });
            },
            save: function () {
                // is there a record already?
                var attributes = this.attributes;
                window.Application.db.transaction(function (tx) {
                    tx.executeSql("SELECT COUNT(id) AS cnt FROM book WHERE projectid=? AND scrid=?;", [attributes.projectid, attributes.scrid], function (tx, res) {
                        console.log("SELECT ok: " + res.toString());
                        if (res.rows.item(0).cnt > 0) {
                            // there's already a record for this id -- update the values
                            window.Application.db.transaction(function (tx) {
                                tx.executeSql("UPDATE book SET bookid=?, name=?, filename=?, chapters=? WHERE projectid=? and scrid=?;", [attributes.bookid, attributes.name, attributes.filename, attributes.chapters, attributes.projectid, attributes.scrid], function (tx, res) {
                                    console.log("UPDATE ok: " + res.toString());
                                });
                            }, function (err) {
                                console.log("UPDATE error: " + err.toString());
                            });
                        } else {
                            // new record -- insert
                            window.Application.db.transaction(function (tx) {
                                tx.executeSql("INSERT INTO book (bookid,projectid,scrid,name,filename,chapters) VALUES (?,?,?,?,?,?);", [attributes.bookid, attributes.projectid, attributes.scrid, attributes.name, attributes.filename, attributes.chapters], function (tx, res) {
                                    console.log("INSERT ok: " + res.toString());
                                });
                            }, function (err) {
                                console.log("INSERT error: " + err.toString());
                            });
                        }
                    }, function (tx, err) {
                        console.log("SELECT error: " + err.toString());
                    });
                });
            },
            destroy: function (options) {
//                localStorage.removeItem(this.id);
                window.Application.db.transaction(function (tx) {
                    tx.executeSql("DELETE FROM book WHERE bookid=?;", [this.attributes.bookid], function (tx, res) {
                        console.log("DELETE ok: " + res.toString());
                    }, function (tx, err) {
                        console.log("DELETE error: " + err.toString());
                    });
                });
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

            resetFromDB: function () {
                var i = 0,
                    len = 0;
                window.Application.db.transaction(function (tx) {
                    tx.executeSql("SELECT * from book;", [], function (tx, res) {
                        for (i = 0, len = res.rows.length; i < len; ++i) {
                            // add the chapter
                            var book = new Book();
                            book.off("change");
                            book.set(res.rows.item(i));
                            books.push(book);
                            book.on("change", book.save, book);
                        }
                        console.log("SELECT ok: " + res.rows.length + " book items");
//                        this.set(JSON.parse(res.rows.item(0)));
                    });
                }, function (err) {
                    console.log("SELECT error: " + err.toString());
                });
            },
            
            initialize: function () {
                this.resetFromDB();
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