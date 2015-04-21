/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

/* 
* SourcePhrase.js
*/
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        sourcephrases = [],

        findById = function (searchKey) {
            var deferred = $.Deferred();
            var results = sourcephrases.filter(function (element) {
                return element.attributes.spid.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
            deferred.resolve(results);
            return deferred.promise();
        },
        findByChapterId = function (searchKey) {
            var deferred = $.Deferred();
            var results = sourcephrases.filter(function (element) {
                return element.attributes.chapterid.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
            deferred.resolve(results);
            return deferred.promise();
        },

        SourcePhrase = Backbone.Model.extend({
            // default values
            
            defaults: {
                spid: "",
                chapterid: "",
                markers: "",
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "",
                target: ""
            },

            resetFromDB: function (callback) {
                window.Application.db.transaction(
                    function (tx) {
                        var sql =
                            "select * from ";
                        console.log('Creating BOOK table');
                        tx.executeSql(sql);
                    }
                );
            },

            initialize: function () {
                this.on('change', this.save, this);
            },
            fetch: function () {
                var attributes = this.attributes;
                window.Application.db.transaction(function (tx) {
                    tx.executeSql("SELECT * FROM sourcephrase WHERE spid=?;", [attributes.spid], function (tx, res) {
                        this.set(res.rows.item(0));
                    });
                });
                
            },
            save: function () {
                // is there a record already?
                var attributes = this.attributes;
                window.Application.db.transaction(function (tx) {
                    tx.executeSql("SELECT COUNT(id) AS cnt FROM sourcephrase WHERE spid=?;", [attributes.spid], function (tx, res) {
//                        console.log("SELECT ok: " + res.toString());
                        if (res.rows.item(0).cnt > 0) {
                            // there's already a record for this id -- update the values
                            window.Application.db.transaction(function (tx) {
                                tx.executeSql("UPDATE sourcephrase SET chapterid=?, markers=?, orig=?, prepuncts=?, midpuncts=?, follpuncts=?, source=?, target=? WHERE spid=?;", [attributes.chapterid, attributes.markers, attributes.orig, attributes.prepuncts, attributes.midpuncts, attributes.follpuncts, attributes.source, attributes.target, attributes.spid], function (tx, res) {
//                                    console.log("UPDATE ok: " + res.toString());
                                });
                            }, function (err) {
                                console.log("UPDATE error: " + err.message);
                            });
                        } else {
                            // new record -- insert
                            window.Application.db.transaction(function (tx) {
                                tx.executeSql("INSERT INTO sourcephrase (spid,chapterid, markers,orig,prepuncts,midpuncts,follpuncts,source,target) VALUES (?,?,?,?,?,?,?,?,?);", [attributes.spid, attributes.chapterid, attributes.markers, attributes.orig, attributes.prepuncts, attributes.midpuncts, attributes.follpuncts, attributes.source, attributes.target], function (tx, res) {
//                                    console.log("INSERT ok: " + res.toString());
                                });
                            }, function (err) {
                                console.log("INSERT error: " + err.message);
                            });
                        }
                    }, function (tx, err) {
                        console.log("SELECT error: " + err.message);
                    });
                });
            },
            destroy: function (options) {
                window.Application.db.transaction(function (tx) {
                    tx.executeSql("DELETE FROM sourcephrase WHERE id=?;", [this.attributes.id], function (tx, res) {
//                        console.log("DELETE ok: " + res.toString());
                    }, function (tx, err) {
                        console.log("DELETE error: " + err.message);
                    });
                });
            },

            sync: function (method, model, options) {
                var theId = 0;
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

        SourcePhraseCollection = Backbone.Collection.extend({

            model: SourcePhrase,

            resetFromDB: function () {
                var i = 0,
                    len = 0;
                window.Application.db.transaction(function (tx) {
//                    tx.executeSql('CREATE TABLE IF NOT EXISTS project (id integer primary key, data text, data_num integer);');
                    tx.executeSql('CREATE TABLE IF NOT EXISTS sourcephrase (id integer primary key, spid text, chapterid text, markers text, orig text, prepuncts text, midpuncts text, follpuncts text, source text, target text);');
                });
                window.Application.db.transaction(function (tx) {
                    tx.executeSql("SELECT * from sourcephrase;", [], function (tx, res) {
                        for (i = 0, len = res.rows.length; i < len; ++i) {
                            // add the chapter
                            var sp = new SourcePhrase();
                            sp.off("change");
                            sp.set(res.rows.item(i));
                            sourcephrases.push(sp);
                            sp.on("change", sp.save, sp);
                        }
                        console.log("SELECT ok: " + res.rows.length + " sourcephrase items");
//                        this.set(JSON.parse(res.rows.item(0)));
                    });
                }, function (err) {
                    console.log("SELECT error: " + err.message);
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
                    } else if (options.data.hasOwnProperty('chapterid')) {
                        findByChapterId(options.data.chapterid).done(function (data) {
                            options.success(data);
                        });
                    }
                }
            }

        });
    
    return {
        SourcePhrase: SourcePhrase,
        SourcePhraseCollection: SourcePhraseCollection
    };

});