/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        Underscore  = require('underscore'),
        targetunits = [],
        
        findById = function (searchKey) {
            var deferred = $.Deferred();
            var results = targetunits.filter(function (element) {
                return element.attributes.tuid.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
            deferred.resolve(results);
            return deferred.promise();
        },
        
        TargetUnit = Backbone.Model.extend({
            defaults: {
                tuid: "",
                projectid: "",
                source: "",
                mn: 1,
                f: "0",
                refstring: [],
                timestamp: "",
                user: "",
                isGloss: 1
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
            create: function () {
                var attributes = this.attributes;
                var user = "";
                if (attributes.user.length > 0) {
                    user = attributes.user;
                } else {
                    if (device && (device.platform !== "browser")) {
                        user = device.uuid;
                    } else {
                        user = "Browser";
                    }
                }
                var sql = "INSERT INTO targetunit (tuid,projectid,source,mn,f,refstring,timestamp,user,isGloss) VALUES (?,?,?,?,?,?,?,?,?);";
                window.Application.db.transaction(function (tx) {
                    tx.executeSql(sql, [attributes.tuid, attributes.projectid, attributes.source, attributes.mn, attributes.f, JSON.stringify(attributes.refstring), attributes.timestamp, user, attributes.isGloss], function (tx, res) {
                        attributes.id = res.insertId;
//                        console.log("INSERT ok: " + res.toString());
                    }, function (tx, err) {
                        console.log("INSERT (create) error: " + err.message);
                    });
                });
            },
            update: function () {
                var attributes = this.attributes;
                var user = "";
                if (attributes.user.length > 0) {
                    user = attributes.user;
                } else {
                    if (device && (device.platform !== "browser")) {
                        user = device.uuid;
                    } else {
                        user = "Browser";
                    }
                }
                var sql = "UPDATE targetunit SET projectid=?, source=?, mn=?, f=?, refstring=?, timestamp=?, user=?, isGloss=? WHERE tuid=?;";
                window.Application.db.transaction(function (tx) {
                    tx.executeSql(sql, [attributes.projectid, attributes.source, attributes.mn, attributes.f, JSON.stringify(attributes.refstring), attributes.timestamp, user, attributes.isGloss, attributes.tuid], function (tx, res) {
                        console.log("UPDATE ok: " + res.toString());
                    }, function (tx, err) {
                        console.log("UPDATE error: " + err.message);
                    });
                });
            },
            destroy: function () {
                window.Application.db.transaction(function (tx) {
                    tx.executeSql("DELETE FROM targetunit WHERE tuid=?;", [this.attributes.tuid], function (tx, res) {
                        console.log("DELETE ok: " + res.toString());
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
                    tx.executeSql('CREATE TABLE IF NOT EXISTS targetunit (id integer primary key, tuid text, projectid text, source text, mn integer, f text, refstring text, timestamp text, user text, isGloss integer);');
                    tx.executeSql("SELECT * from targetunit;", [], function (tx, res) {
                        var tmpString = "";
                        targetunits.length = 0; // clear out old data
                        for (i = 0, len = res.rows.length; i < len; ++i) {
                            // add the chapter
                            var tu = new TargetUnit();
                            tu.off("change");
                            tu.set(res.rows.item(i));
                            // convert refstring back into an array object
                            tmpString = tu.get('refstring');
                            tu.set('refstring', JSON.parse(tmpString));
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

            // Remove just the local targetunits from the collection --
            // this keeps the in-memory objects to a minimum
            clearLocal: function () {
                console.log("targetunitCollection clearLocal() - entry");
                targetunits.length = 0;
            },

            // removes all targetunits for the specified projectid
            // This is done when the user is restoring from a KB file to clean out what's currently in the DB
            clearKBForProject: function (projectid, isGloss) {
                var deferred = $.Deferred();
                // delete the KB entries for a project
                window.Application.db.transaction(function (tx) {
                    tx.executeSql("DELETE FROM targetunit WHERE (projectid=? AND isGloss=?);", [projectid, isGloss], function (tx, res) {
                        console.log("Clear KB for project ok: " + res.rowsAffected + " rows affected.");
                    }, function (tx, err) {
                        console.log("DELETE error: " + err.message);
                    });
                }, function (e) {
                    deferred.reject(e);
                }, function () {
                    deferred.resolve();
                });
                return deferred.promise();
            },


            // CREATE an array of TargetUnit objects
            addBatch: function (models) {
                var deferred = $.Deferred();
                var sql = "INSERT INTO targetunit (tuid,projectid,source,mn,f,refstring,timestamp,user,isGloss) VALUES (?,?,?,?,?,?,?,?,?);";
                var start = new Date().getTime();
                var user = "";
                if (models[0].attributes.user.length > 0) {
                    user = models[0].attributes.user;
                } else {
                    if (device && (device.platform !== "browser")) {
                        user = device.uuid;
                    } else {
                        user = "Browser";
                    }
                }
                console.log("addBatch: " + models.length + " objects");
                console.log("> first word: " + models[0].attributes.source + ", last word: " + models[models.length - 1].attributes.source);
                window.Application.db.transaction(function (tx) {
                    Underscore.each(models, function (tu) {
                        tx.executeSql(sql, [tu.attributes.tuid, tu.attributes.projectid, tu.attributes.source, tu.attributes.mn, tu.attributes.f, JSON.stringify(tu.attributes.refstring), tu.attributes.timestamp, user, tu.attributes.isGloss]);
                    });
                    var end = new Date().getTime();
                    console.log("addBatch: " + models.length + " objects, " + (end - start));
                }, function (e) {
                    deferred.reject(e);
                }, function () {
                    deferred.resolve();
                });
                return deferred.promise();
            },

            // UPDATE an array of TargetUnit objects
            updateBatch: function (models) {
                var deferred = $.Deferred();
                var sql = "UPDATE targetunit SET projectid=?, source=?, mn=?, f=?, refstring=?, timestamp=?, user=?, isGloss=? WHERE tuid=?;";
                var start = new Date().getTime();
                var user = "";
                if (models[0].attributes.user.length > 0) {
                    user = models[0].attributes.user;
                } else {
                    if (device && (device.platform !== "browser")) {
                        user = device.uuid;
                    } else {
                        user = "Browser";
                    }
                }
                console.log("updateBatch: " + models.length + " objects");
                console.log("> first word: " + models[0].attributes.source + ", last word: " + models[models.length - 1].attributes.source);
                window.Application.db.transaction(function (tx) {
                    Underscore.each(models, function (tu) {
                        tx.executeSql(sql, [tu.attributes.projectid, tu.attributes.source, tu.attributes.mn, tu.attributes.f, JSON.stringify(tu.attributes.refstring), tu.attributes.timestamp, user, tu.attributes.isGloss, tu.attributes.tuid]);
                    });
                    var end = new Date().getTime();
                    console.log("addBatch: " + models.length + " objects, " + (end - start));
                }, function (e) {
                    deferred.reject(e);
                }, function () {
                    deferred.resolve();
                });
                return deferred.promise();
            },
            
            sync: function (method, model, options) {
                var deferred = $.Deferred();
                var len = 0;
                var i = 0;
                var projectid = null;
                var retValue = null;
                var results = null;
                if (method === "read") {
                    if (options.data.hasOwnProperty('id')) {
                        findById(options.data.id).done(function (data) {
                            options.success(data);
                        });
                    } else if (options.data.hasOwnProperty('projectid')) {
                         projectid = options.data.projectid;
                        results = targetunits.filter(function (element) {
                            return element.attributes.projectid === projectid.toLowerCase();
                        });
                        if (results.length === 0) {
                            // not in collection -- retrieve them from the db (alphabetized)
                            window.Application.db.transaction(function (tx) {
                                tx.executeSql("SELECT * from targetunit WHERE projectid=? ORDER BY source;", [projectid], function (tx, res) {
                                    var tmpString = "";
                                    for (i = 0, len = res.rows.length; i < len; ++i) {
                                        // add the chapter
                                        var tu = new TargetUnit();
                                        tu.off("change");
                                        tu.set(res.rows.item(i));
                                        // convert refstring back into an array object
                                        tmpString = tu.get('refstring');
                                        tu.set('refstring', JSON.parse(tmpString));
                                        targetunits.push(tu);
                                        tu.on("change", tu.save, tu);
                                    }
                                    console.log("SELECT ok: " + res.rows.length + " targetunit items");
                                    retValue = targetunits;
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
                    } else if (options.data.hasOwnProperty('source')) {
                        var source = options.data.source;
                        // special case -- empty source query ==> reset local copy so we force a retrieve
                        // from the database
                        if (source === "") {
                            targetunits.length = 0;
                        }
                        results = targetunits.filter(function (element) {
                            return element.attributes.source.toLowerCase().indexOf(source.toLowerCase()) > -1;
                        });
                        if (results.length === 0) {
                            // not in collection -- retrieve them from the db
                            window.Application.db.transaction(function (tx) {
                                tx.executeSql("SELECT * from targetunit;", [], function (tx, res) {
                                    var tmpString = "";
                                    for (i = 0, len = res.rows.length; i < len; ++i) {
                                        // add the chapter
                                        var tu = new TargetUnit();
                                        tu.off("change");
                                        tu.set(res.rows.item(i));
                                        // convert refstring back into an array object
                                        tmpString = tu.get('refstring');
                                        tu.set('refstring', JSON.parse(tmpString));
                                        targetunits.push(tu);
                                        tu.on("change", tu.save, tu);
                                    }
                                    console.log("SELECT ok: " + res.rows.length + " targetunit items");
                                    // return the filtered results (now that we have them)
                                    retValue = targetunits.filter(function (element) {
                                        return element.attributes.source.toLowerCase().indexOf(source.toLowerCase()) > -1;
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
                } else if (method === "delete") {
                    if (options.data.hasOwnProperty('projectid')) {
                        projectid = options.data.projectid;
                        // delete the KB entries for a project
                        window.Application.db.transaction(function (tx) {
                            tx.executeSql("DELETE FROM targetunit WHERE projectid=?;", [projectid], function (tx, res) {
                                console.log("DELETE KB ok: " + res.toString());
                            }, function (tx, err) {
                                console.log("DELETE error: " + err.message);
                            });
                        }, function (e) {
                            deferred.reject(e);
                        }, function () {
                            deferred.resolve();
                        });
                    }
                    return deferred.promise();
                }
            }

        });

    return {
        TargetUnit: TargetUnit,
        TargetUnitCollection: TargetUnitCollection
    };

});
