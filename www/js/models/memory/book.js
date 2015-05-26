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
                    return element.attributes.projectid.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
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
                // db
//                var attributes = this.attributes;
//                window.Application.db.transaction(function (tx) {
//                    tx.executeSql("SELECT * from book WHERE bookid=?;", [attributes.bookid], function (tx, res) {
//                        this.set(res.rows.item(0));
//                    });
//                }, function (tx, err) {
//                    console.log("SELECT error: " + err.message);
//                });

                // localstorage
                // search for our key - p.<id>
                this.set(JSON.parse(localStorage.getItem("b." + this.bookid)));
            },
            save: function () {
                // localstorage
                // only save if the id actually has a value
                var attributes = this.attributes;
                if (attributes.bookid.length > 0) {
                    // save with a key of p.<id>
                    localStorage.setItem(("b." + attributes.bookid), JSON.stringify(this));
                }

                // DB
                // is there a record already?
//                var attributes = this.attributes;
//                window.Application.db.transaction(function (tx) {
//                    tx.executeSql("SELECT COUNT(id) AS cnt FROM book WHERE projectid=? AND scrid=?;", [attributes.projectid, attributes.scrid], function (tx, res) {
////                        console.log("SELECT ok: " + res.rows.item(0).cnt + " books with projectid=" + attributes.projectid + " and scrid=" + attributes.scrid);
//                        if (res.rows.item(0).cnt > 0) {
//                            // there's already a record for this id -- update the values
//                            tx.executeSql("UPDATE book SET bookid=?, name=?, filename=?, chapters=? WHERE projectid=? and scrid=?;", [attributes.bookid, attributes.name, attributes.filename, attributes.chapters, attributes.projectid, attributes.scrid], function (tx, res) {
////                                console.log("UPDATE ok: " + res.toString());
//                            });
//                        } else {
//                            // new record -- insert
//                            tx.executeSql("INSERT INTO book (bookid,projectid,scrid,name,filename,chapters) VALUES (?,?,?,?,?,?);", [attributes.bookid, attributes.projectid, attributes.scrid, attributes.name, attributes.filename, attributes.chapters], function (tx, res) {
////                                console.log("INSERT ok: " + res.toString());
//                            });
//                        }
//                    }, function (tx, err) {
////                        console.log("SELECT error: " + err.message);
//                    });
//                });
            },
            destroy: function (options) {
                // localstorage
                localStorage.removeItem(this.id);

                // db
//                window.Application.db.transaction(function (tx) {
//                    tx.executeSql("DELETE FROM book WHERE bookid=?;", [this.attributes.bookid], function (tx, res) {
//                    }, function (tx, err) {
//                        console.log("DELETE error: " + err.message);
//                    });
//                });
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
                books.length = 0;
                for (i = 0, len = localStorage.length; i < len; ++i) {
                    // if this is a project, add it to our collection
                    if (localStorage.key(i).substr(0, 2) === "b.") {
                        var book = new Book();
                        book.set(JSON.parse(localStorage.getItem(localStorage.key(i))));
                        books.push(book);
                    }
                }
            },

//            resetFromDB: function () {
//                var i = 0,
//                    len = 0;
//                window.Application.db.transaction(function (tx) {
////                    tx.executeSql('CREATE TABLE IF NOT EXISTS project (id integer primary key, data text, data_num integer);');
//                    tx.executeSql('CREATE TABLE IF NOT EXISTS book (id integer primary key, bookid text, scrid text, projectid integer, name text, filename text, chapters integer);');
//                });
//                window.Application.db.transaction(function (tx) {
//                    tx.executeSql("SELECT * from book;", [], function (tx, res) {
//                        for (i = 0, len = res.rows.length; i < len; ++i) {
//                            // add the chapter
//                            var book = new Book();
//                            book.off("change");
//                            book.set(res.rows.item(i));
//                            books.push(book);
//                            book.on("change", book.save, book);
//                        }
//                        console.log("SELECT ok: " + res.rows.length + " book items");
////                        this.set(JSON.parse(res.rows.item(0)));
//                    });
//                }, function (err) {
//                    console.log("SELECT error: " + err.message);
//                });
//            },
            
            initialize: function () {
//                this.resetFromDB();
                this.resetFromLocalStorage();
            },
            
            // Removes all books from the collection (and database)
            clearAll: function () {
                // DB
//                window.Application.db.transaction(function (tx) {
//                    tx.executeSql('DELETE from book;');
//                    books.length = 0;
//                }, function (err) {
//                    console.log("DELETE error: " + err.message);
//                });
                
                // localStorage
                var i = 0,
                    keyName = "",
                    len = localStorage.length;
                for (i = 0; i < len; ++i) {
                    keyName = localStorage.key(i);
                    if (keyName.length > 2 && keyName.substr(0, 2) === "b.") {
                        localStorage.removeItem(keyName);
                    }
                }
                // clear local copy
                books.length = 0;
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
                        if (options.data.name === "") {
                            // reset local copy and rebuild list
                            this.resetFromLocalStorage();
                        }
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