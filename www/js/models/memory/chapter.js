/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        chapters = [],

        findById = function (id) {
            var i = 0,
                deferred = $.Deferred(),
                chapter = null,
                l = chapters.length;
            for (i = 0; i < l; i++) {
                if (chapters[i].id === id) {
                    chapter = chapters[i];
                    break;
                }
            }
            deferred.resolve(chapter);
            return deferred.promise();
        },

        findByName = function (searchKey) {
            var deferred = $.Deferred();
            var results = chapters.filter(function (element) {
                return element.attributes.name.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
            deferred.resolve(results);
            return deferred.promise();
        },

        Chapter = Backbone.Model.extend({
            defaults: {
                chapterid: "",
                bookid: "",
                name: "",
                lastAdapted: 0,
                verseCount: 0
            },
            initialize: function () {
                this.on('change', this.save, this);
            },
            fetch: function () {
                // search for our key - b.<id>
//                this.set(JSON.parse(localStorage.getItem("c." + this.id)));
                window.Application.db.transaction(function (tx) {
                    tx.executeSql("SELECT * from chapter WHERE chapterid=?;", [this.attributes.chapterid], function (tx, res) {
                        console.log("SELECT ok: " + res.rows);
                        this.set(JSON.parse(res.rows.item(0)));
                    });
                }, function (tx, err) {
                    console.log("SELECT error: " + err.toString());
                });
            },
            save: function () {
                // is there a record already?
                var attributes = this.attributes;
                window.Application.db.transaction(function (tx) {
                    tx.executeSql("SELECT COUNT(id) AS cnt FROM chapter WHERE chapterid=?;", [attributes.chapterid], function (tx, res) {
                        console.log("SELECT ok: " + res.toString());
                        if (res.rows.item(0).cnt > 0) {
                            // there's already a record for this id -- update the values
                            window.Application.db.transaction(function (tx) {
                                tx.executeSql("UPDATE chapter SET bookid=?, name=?, lastadapted=?, versecount=? WHERE chapterid=?;", [attributes.bookid, attributes.name, attributes.lastAdapted, attributes.verseCount, attributes.chapterid], function (tx, res) {
                                    console.log("UPDATE ok: " + res.toString());
                                });
                            }, function (err) {
                                console.log("UPDATE error: " + err.toString());
                            });
                        } else {
                            // new record -- insert
                            window.Application.db.transaction(function (tx) {
                                tx.executeSql("INSERT INTO chapter (chapterid,bookid,name,lastadapted,versecount) VALUES (?,?,?,?,?);", [attributes.chapterid, attributes.bookid, attributes.name, attributes.lastAdapted, attributes.verseCount], function (tx, res) {
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
                window.Application.db.transaction(function (tx) {
                    tx.executeSql("DELETE FROM chapter WHERE chapterid=?;", [this.attributes.chapterid], function (tx, res) {
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

        ChapterCollection = Backbone.Collection.extend({

            model: Chapter,

            resetFromDB: function () {
                var i = 0,
                    len = 0;
                window.Application.db.transaction(function (tx) {
                    tx.executeSql("SELECT * from chapter;", [], function (tx, res) {
                        for (i = 0, len = res.rows.length; i < len; ++i) {
                            // add the chapter
                            var ch = new Chapter();
                            ch.set(res.rows.item(i));
                            chapters.push(ch);
                        }
                        console.log("SELECT ok: " + res.rows);
//                        this.set(JSON.parse(res.rows.item(0)));
                    });
                }, function (err) {
                    console.log("SELECT error: " + err.toString());
                });
//                var i = 0,
//                    len = 0;
//                for (i = 0, len = localStorage.length; i < len; ++i) {
//                    // if this is a chapter, add it to our collection
//                    if (localStorage.key(i).substr(0, 2) === "c.") {
//                        var ch = new Chapter();
//                        ch.set(JSON.parse(localStorage.getItem(localStorage.key(i))));
//                        chapters.push(ch);
//                    }
//                }
            },
            
            initialize: function () {
                this.resetFromDB();
            },

            sync: function (method, model, options) {
                if (method === "read") {
                    findByName(options.data.name).done(function (data) {
                        options.success(data);
                    });
                }
            }

        });

    return {
        Chapter: Chapter,
        ChapterCollection: ChapterCollection
    };

});