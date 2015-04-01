/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        i           = 0,
        targetunits = [],
        
        findById = function (id) {
            var deferred = $.Deferred(),
                targetunit = null,
                l = targetunits.length;
            for (i = 0; i < l; i++) {
                if (targetunits[i].id === id) {
                    targetunit = targetunits[i];
                    break;
                }
            }
            deferred.resolve(targetunit);
            return deferred.promise();
        },

        findByName = function (searchKey) {
            var deferred = $.Deferred();
            var results = targetunits.filter(function (element) {
                return element.id.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
            deferred.resolve(results);
            return deferred.promise();
        },

        findBySource = function (searchKey) {
            var deferred = $.Deferred();
            var results = targetunits.filter(function (element) {
                return element.source.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
            deferred.resolve(results);
            return deferred.promise();
        },

        TargetUnit = Backbone.Model.extend({
            defaults: {
                id: 0,
                projectid: 0,
                source: "",
                refstring: [],
                timestamp: "",
                user: ""
            },

            initialize: function () {
                this.on('change', this.save, this);
            },

            fetch: function () {
                var attributes = this.attributes;
                window.Application.db.transaction(function (tx) {
                    tx.executeSql("SELECT * from chapter WHERE chapterid=?;", [attributes.chapterid], function (tx, res) {
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
                    tx.executeSql("SELECT COUNT(id) AS cnt FROM chapter WHERE chapterid=?;", [attributes.chapterid], function (tx, res) {
                        console.log("SELECT ok: " + res.toString());
                        if (res.rows.item(0).cnt > 0) {
                            // there's already a record for this id -- update the values
                            window.Application.db.transaction(function (tx) {
                                tx.executeSql("UPDATE chapter SET bookid=?, name=?, lastadapted=?, versecount=? WHERE chapterid=?;", [attributes.bookid, attributes.name, attributes.lastadapted, attributes.versecount, attributes.chapterid], function (tx, res) {
                                    console.log("UPDATE ok: " + res.toString());
                                });
                            }, function (err) {
                                console.log("UPDATE error: " + err.toString());
                            });
                        } else {
                            // new record -- insert
                            window.Application.db.transaction(function (tx) {
                                tx.executeSql("INSERT INTO chapter (chapterid,bookid,name,lastadapted,versecount) VALUES (?,?,?,?,?);", [attributes.chapterid, attributes.bookid, attributes.name, attributes.lastadapted, attributes.versecount], function (tx, res) {
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

        TargetUnitCollection = Backbone.Collection.extend({

            model: TargetUnit,

            resetFromDB: function () {
                var i = 0,
                    len = 0;
                window.Application.db.transaction(function (tx) {
                    tx.executeSql("SELECT * from targetunit;", [], function (tx, res) {
                        for (i = 0, len = res.rows.length; i < len; ++i) {
                            // add the chapter
                            var tu = new TargetUnit();
                            tu.set(res.rows.item(i));
                            targetunits.push(tu);
                        }
                        console.log("SELECT ok: " + res.rows.length + " targetunit items");
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
                    findByName(options.data.name).done(function (data) {
                        options.success(data);
                    });
                }
            }

        });

    return {
        TargetUnit: TargetUnit,
        TargetUnitCollection: TargetUnitCollection
    };

});