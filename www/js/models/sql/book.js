/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        i           = 0,
        books = [],
        
        findById = function (searchKey) {
            var deferred = $.Deferred();
            var results = books.filter(function (element) {
                return element.attributes.bookid.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
            deferred.resolve(results);
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
        findByProject = function (searchKey) {
            var deferred = $.Deferred();
            var results = null;
            if (books !== null) {
                results = books.filter(function (element) {
                    return (element.attributes.projectid === parseInt(searchKey, 10));
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
                chapters: []
            },
            initialize: function () {
                this.on('change', this.save, this);
            },
            fetch: function () {
                var deferred = $.Deferred();
                var obj = this;
                window.Application.db.transaction(function (tx) {
                    tx.executeSql("SELECT * from book WHERE bookid=?;", [obj.attributes.bookid], function (tx, res) {
                        console.log("SELECT ok: " + res.rows);
                        obj.set(res.rows.item(0));
                        deferred.resolve(obj);
                    });
                }, function (err) {
                    console.log("SELECT error: " + err.message);
                    deferred.reject(err);
                });
                return deferred.promise();
            },
            create: function () {
                var attributes = this.attributes;
                var sql = "INSERT INTO book (bookid,projectid,scrid,name,filename,chapters) VALUES (?,?,?,?,?,?);";
                window.Application.db.transaction(function (tx) {
                    tx.executeSql(sql, [attributes.bookid, attributes.projectid, attributes.scrid, attributes.name, attributes.filename, JSON.stringify(attributes.chapters)], function (tx, res) {
                        console.log("INSERT ok: " + res.toString());
                    }, function (tx, err) {
                        console.log("INSERT (create) error: " + err.message);
                    });
                });
            },
            update: function () {
                var attributes = this.attributes;
                var sql = "UPDATE book SET projectid=? scrid=?, name=?, filename=?, chapters=? WHERE bookid=?;";
                window.Application.db.transaction(function (tx) {
                    tx.executeSql(sql, [attributes.projectid, attributes.scrid, attributes.name, attributes.filename, JSON.stringify(attributes.chapters), attributes.bookid], function (tx, res) {
                        console.log("INSERT ok: " + res.toString());
                    }, function (tx, err) {
                        console.log("UPDATE error: " + err.message);
                    });
                });
            },
            destroy: function (options) {
                window.Application.db.transaction(function (tx) {
                    tx.executeSql("DELETE FROM book WHERE bookid=?;", [this.attributes.bookid], function (tx, res) {
//                        console.log("DELETE ok: " + res.toString());
                    }, function (tx, err) {
                        console.log("DELETE error: " + err.message);
                    });
                });
            },
            sync: function (method, model, options) {
                switch (method) {
                case 'create':
                    model.create();
                    break;
                        
                case 'read':
                    findById(this.id).done(function (data) {
                        options.success(data);
                    });
                    break;
                        
                case 'update':
                    model.update();
                    break;
                        
                case 'delete':
                    model.destroy(options);
                    break;
                }
            }
        }),

        BookCollection = Backbone.Collection.extend({

            model: Book,

            resetFromDB: function () {
                var deferred = $.Deferred(),
                    i = 0,
                    len = 0;
                window.Application.db.transaction(function (tx) {
                    tx.executeSql('CREATE TABLE IF NOT EXISTS book (id integer primary key, bookid text, scrid text, projectid integer, name text, filename text, chapters text);');
                    tx.executeSql("SELECT * from book;", [], function (tx, res) {
                        for (i = 0, len = res.rows.length; i < len; ++i) {
                            // add the book
                            var book = new Book();
                            book.off("change");
                            book.set(res.rows.item(i));
                            books.push(book);
                            book.on("change", book.save, book);
                        }
                        console.log("SELECT ok: " + res.rows.length + " book items");
                    });
                }, function (e) {
                    deferred.reject(e);
                }, function () {
                    deferred.resolve();
                });
                return deferred.promise();
            },
            
            initialize: function () {
                return this.resetFromDB();
            },

            // Removes all chapters from the collection (and database)
            clearAll: function () {
                window.Application.db.transaction(function (tx) {
                    tx.executeSql('DELETE from book;'); // clear out the table
                    books.length = 0; // delete local copy
                }, function (err) {
                    console.log("DELETE error: " + err.message);
                });
            },

            sync: function (method, model, options) {
                if (method === "read") {
                    if (options.data.hasOwnProperty('id')) {
                        findById(options.data.id).done(function (data) {
                            options.success(data);
                        });
                    } else if (options.data.hasOwnProperty('projectid')) {
                        findByProject(options.data.projectid).done(function (data) {
                            options.success(data);
                        });
                    } else if (options.data.hasOwnProperty('name')) {
                        var deferred = $.Deferred();
                        var name = options.data.name;
                        var len = 0;
                        var i = 0;
                        var retValue = null;
                        // special case -- empty name query ==> reset local copy so we force a retrieve
                        // from the database
                        if (name === "") {
                            books.length = 0;
                        }
                        var results = books.filter(function (element) {
                            return element.attributes.name.toLowerCase().indexOf(name.toLowerCase()) > -1;
                        });
                        if (results.length === 0) {
                            // not in collection -- retrieve them from the db
                            window.Application.db.transaction(function (tx) {
                                tx.executeSql("SELECT * FROM book;", [], function (tx, res) {
                                    // populate the chapter collection with the query results
                                    for (i = 0, len = res.rows.length; i < len; ++i) {
                                        // add the book
                                        var book = new Book();
                                        book.off("change");
                                        book.set(res.rows.item(i));
                                        books.push(book);
                                        book.on("change", book.save, book);
                                    }
                                    // return the filtered results (now that we have them)
                                    retValue = books.filter(function (element) {
                                        return element.attributes.name.toLowerCase().indexOf(name.toLowerCase()) > -1;
                                    });
                                    options.success(retValue);
                                    deferred.resolve(retValue);
                                });
                            }, function (e) {
                                options.error();
                                deferred.reject(e);
                            });
                        } else {
                            // results already in collection -- return them
                            options.success(results);
                            deferred.resolve(results);
                        }
                        // return the promise
                        return deferred.promise();
                    }
                }
            }

        });

    return {
        Book: Book,
        BookCollection: BookCollection
    };

});