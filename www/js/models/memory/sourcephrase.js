/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

/* 
* SourcePhrase.js
*/
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        Underscore  = require('underscore'),
        sourcephrases = [],
        sps         = [],

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
            create: function () {
                var attributes = this.attributes;
                var sql = "INSERT INTO sourcephrase (spid, chapterid, markers, orig, prepuncts, midpuncts, follpuncts, source, target) VALUES (?,?,?,?,?,?,?,?,?);";
                window.Application.db.transaction(function (tx) {
                    tx.executeSql(sql, [attributes.spid, attributes.chapterid, attributes.markers, attributes.orig, attributes.prepuncts, attributes.midpuncts, attributes.follpuncts, attributes.source, attributes.target], function (tx, res) {
//                        console.log("INSERT ok: " + res.toString());
                    }, function (tx, err) {
                        console.log("SELECT error: " + err.message);
                    });
                });
            },
            update: function () {
                var attributes = this.attributes;
                var sql = 'UPDATE sourcephrase SET chapterid=?, markers=?, orig=?, prepuncts=?, midpuncts=?, follpuncts=?, source=?, target=? WHERE spid=?;';
                window.Application.db.transaction(function (tx) {
                    tx.executeSql(sql, [attributes.chapterid, attributes.markers, attributes.orig, attributes.prepuncts, attributes.midpuncts, attributes.follpuncts, attributes.source, attributes.target, attributes.spid], function (tx, res) {
//                        console.log("INSERT ok: " + res.toString());
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
                if (typeof options === 'function') {
                    options = {
                        success: options,
                        error: error
                    };
                }
                switch (method) {
                case 'create':
                    model.create();
//                    options.success(model);
                    break;
                        
                case 'read':
                    findById(this.id).done(function (data) {
                        options.success(data);
                    });
                    break;
                        
                case 'update':
                    model.update();
//                    options.success(model);
                    break;
                        
                case 'delete':
                    model.destroy(options);
//                    options.success(model);
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

            // Removes all sourcephrases from the collection (and database)
            clearAll: function () {
                window.Application.db.transaction(function (tx) {
                    tx.executeSql('DELETE from sourcephrase;');
                    sourcephrases.length = 0;
                }, function (err) {
                    console.log("DELETE error: " + err.message);
                });
            },
            
            // add an array of SourcePhrase objects
            addBatch: function (models) {
                var deferred = $.Deferred();
                var sql = "INSERT INTO sourcephrase (spid, chapterid, markers, orig, prepuncts, midpuncts, follpuncts, source, target) VALUES (?,?,?,?,?,?,?,?,?);";
                var start = new Date().getTime();
                console.log("addBatch: " + models.length + " objects");
                sps = models;
                window.Application.db.transaction(function (tx) {
                    Underscore.each(models, function (sp) {
                        tx.executeSql(sql, [sp.attributes.spid, sp.attributes.chapterid, sp.attributes.markers, sp.attributes.orig, sp.attributes.prepuncts, sp.attributes.midpuncts, sp.attributes.follpuncts, sp.attributes.source, sp.attributes.target]);
                    });
                    var end = new Date().getTime();
                    console.log("addBatch: " + models.length + " objects, " + (end - start));
                    // clear out models array
                    models.length = 0;
                    sps.length = 0;
                }, function (e) {
                    deferred.reject(e);
                }, function () {
                    deferred.resolve();
                });
                return deferred.promise();
            },

            sync: function (method, model, options) {
                var sql = "INSERT OR REPLACE INTO sourcephrase (spid, chapterid, markers, orig, prepuncts, midpuncts, follpuncts, source, target) VALUES (?,?,?,?,?,?,?,?,?);";
                var coll = null;
                switch (method) {
                case 'create':
//                    coll = model;
//                    window.Application.db.transaction(function (tx) {
//                        console.log("sync transaction");
//                        coll.forEach(function (sp) {
//                            tx.executeSql(sql, [sp.attributes.spid, sp.attributes.chapterid, sp.attributes.markers, sp.attributes.orig, sp.attributes.prepuncts, sp.attributes.midpuncts, sp.attributes.follpuncts, sp.attributes.source, sp.attributes.target], function (tx, res) {
//                                console.log("sync INSERT OR REPLACE ok");
//                            }, function (tx, err) {
//                                console.log("sync error: " + err.message);
//                            });
//                        });
//                    });
                    options.success(model);
                    break;
                        
                case 'read':
                    if (options.data.hasOwnProperty('id')) {
                        findById(options.data.id).done(function (data) {
                            options.success(data);
                        });
                    } else if (options.data.hasOwnProperty('chapterid')) {
                        findByChapterId(options.data.chapterid).done(function (data) {
                            options.success(data);
                        });
                    }
                    break;
                        
                case 'update':
                    options.success(model);
                    break;
                        
                case 'delete':
                    options.success(model);
                    break;
                }
            }

        });
    
    return {
        SourcePhrase: SourcePhrase,
        SourcePhraseCollection: SourcePhraseCollection
    };

});