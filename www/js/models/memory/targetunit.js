/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        i           = 0,
        targetunits = [],
        
        findById = function (searchKey) {
            var deferred = $.Deferred();
            var results = targetunits.filter(function (element) {
                return element.attributes.tuid.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
            deferred.resolve(results);
            return deferred.promise();
        },

        findByProjectId = function (searchKey) {
            var deferred = $.Deferred();
            var results = targetunits.filter(function (element) {
                return element.attributes.projectid.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
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
                tuid: "",
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
                    tx.executeSql("SELECT * from targetunit WHERE tuid=?;", [attributes.tuid], function (tx, res) {
                        console.log("SELECT ok: " + res.rows);
                        this.set(res.rows.item(0));
                    });
                }, function (tx, err) {
                    console.log("SELECT error: " + err.message);
                });
            },

            save: function () {
                // is there a record already?
                var attributes = this.attributes;
                window.Application.db.transaction(function (tx) {
                    tx.executeSql("SELECT COUNT(id) AS cnt FROM targetunit WHERE tuid=?;", [attributes.tuid], function (tx, res) {
//                        console.log("SELECT ok: " + res.toString());
                        if (res.rows.item(0).cnt > 0) {
                            // there's already a record for this id -- update the values
                            tx.executeSql("UPDATE chapter SET projectid=?, source=?, refstring=?, timestamp=?, user=? WHERE tuid=?;", [attributes.projectid, attributes.source, attributes.refstring, attributes.timestamp, attributes.user, attributes.tuid], function (tx, res) {
//                                    console.log("UPDATE ok: " + res.toString());
                            });
                        } else {
                            // new record -- insert
                            tx.executeSql("INSERT INTO targetunit (tuid,projectid,source,refstring,timestamp,user) VALUES (?,?,?,?,?,?);", [attributes.tuid, attributes.projectid, attributes.source, attributes.refstring, attributes.timestamp, attributes.user], function (tx, res) {
//                                    console.log("INSERT ok: " + res.toString());
                            });
                        }
                    }, function (tx, err) {
                        console.log("SELECT error: " + err.message);
                    });
                });
            },

            destroy: function (options) {
                window.Application.db.transaction(function (tx) {
                    tx.executeSql("DELETE FROM targetunit WHERE tuid=?;", [this.attributes.tuid], function (tx, res) {
//                        console.log("DELETE ok: " + res.toString());
                    }, function (tx, err) {
                        console.log("DELETE error: " + err.message);
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
//                    tx.executeSql('CREATE TABLE IF NOT EXISTS project (id integer primary key, data text, data_num integer);');
                    tx.executeSql('CREATE TABLE IF NOT EXISTS targetunit (id integer primary key, tuid text, projectid integer, source text, timestamp text, user text);');
                });
                window.Application.db.transaction(function (tx) {
                    tx.executeSql("SELECT * from targetunit;", [], function (tx, res) {
                        for (i = 0, len = res.rows.length; i < len; ++i) {
                            // add the chapter
                            var tu = new TargetUnit();
                            tu.off("change");
                            tu.set(res.rows.item(i));
                            targetunits.push(tu);
                            tu.on("change", tu.save, tu);
                        }
                        console.log("SELECT ok: " + res.rows.length + " targetunit items");
                    });
                }, function (err) {
                    console.log("SELECT error: " + err.message);
                });
            },
            
            initialize: function () {
                this.resetFromDB();
            },

            // Removes all targetunits from the collection (and database)
            clearAll: function () {
                window.Application.db.transaction(function (tx) {
                    tx.executeSql('DELETE from targetunit;');
                    targetunits.length = 0;
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
                        findByProjectId(options.data.projectid).done(function (data) {
                            options.success(data);
                        });
                    } else if (options.data.hasOwnProperty('source')) {
                        findBySource(options.data.source).done(function (data) {
                            options.success(data);
                        });
                    }
                }
            }

        });

    return {
        TargetUnit: TargetUnit,
        TargetUnitCollection: TargetUnitCollection
    };

});