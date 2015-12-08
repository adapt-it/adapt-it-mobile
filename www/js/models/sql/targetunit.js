/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Underscore  = require('underscore'),
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
                projectid: "",
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
            create: function () {
                var attributes = this.attributes;
                var user = "";
                if (attributes.user.length > 0) {
                    user = attributes.user;
                } else {
                    if (window.sqlitePlugin) {
                        user = device.uuid;
                    } else {
                        user = "Browser";
                    }
                }
                var sql = "INSERT INTO targetunit (tuid,projectid,source,refstring,timestamp,user) VALUES (?,?,?,?,?,?);";
                window.Application.db.transaction(function (tx) {
                    tx.executeSql(sql, [attributes.tuid, attributes.projectid, attributes.source, JSON.stringify(attributes.refstring), attributes.timestamp, user], function (tx, res) {
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
                    if (window.sqlitePlugin) {
                        user = device.uuid;
                    } else {
                        user = "Browser";
                    }
                }
                var sql = "UPDATE targetunit SET projectid=?, source=?, refstring=?, timestamp=?, user=? WHERE tuid=?;";
                window.Application.db.transaction(function (tx) {
                    tx.executeSql(sql, [attributes.projectid, attributes.source, JSON.stringify(attributes.refstring), attributes.timestamp, user, attributes.tuid], function (tx, res) {
//                        console.log("UPDATE ok: " + res.toString());
                    }, function (tx, err) {
                        console.log("UPDATE error: " + err.message);
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
                    tx.executeSql('CREATE TABLE IF NOT EXISTS targetunit (id integer primary key, tuid text, projectid text, source text, refstring text, timestamp text, user text);');
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
                    });
                }, function (err) {
                    console.log("SELECT error: " + err.message);
                });
            },
            
            initialize: function () {
                this.resetFromDB();
            },
            
            // Helper method to store the specified source and target text in the KB.
            saveInKB: function (sourceValue, targetValue, oldTargetValue, projectid) {
                var elts = targetunits.filter(function (element) {
                    return (element.attributes.projectid === projectid &&
                       element.attributes.source.toLowerCase() === sourceValue.toLowerCase());
                });
                var tu = null,
                    curDate = new Date(),
                    timestamp = (curDate.getFullYear() + "-" + (curDate.getMonth() + 1) + "-" + curDate.getDay() + "T" + curDate.getUTCHours() + ":" + curDate.getUTCMinutes() + ":" + curDate.getUTCSeconds() + "z");
                if (elts.length > 0) {
                    tu = elts[0];
                }
                if (tu) {
                    var i = 0,
                        found = false,
                        refstrings = tu.get('refstring');
                    // delete or decrement the old value
                    if (oldTargetValue.length > 0) {
                        // there was an old value -- try to find and remove the corresponding KB entry
                        for (i = 0; i < refstrings.length; i++) {
                            if (refstrings[i].target === oldTargetValue) {
                                if (refstrings[i].n !== '0') {
                                    // more than one refcount -- decrement it
                                    refstrings[i].n--;
                                }
                                break;
                            }
                        }
                    }
                    // add or increment the new value
                    for (i = 0; i < refstrings.length; i++) {
                        if (refstrings[i].target === targetValue) {
                            refstrings[i].n++;
                            found = true;
                            break;
                        }
                    }
                    if (found === false) {
                        // no entry in KB with this source/target -- add one
                        var newRS = [
                            {
                                'target': targetValue,
                                'n': '1'
                            }
                        ];
                        refstrings.push(newRS);
                    }
                    // update the KB model
                    tu.set('refstring', refstrings, {silent: true});
                    tu.set('timestamp', timestamp, {silent: true});
                    tu.update();
                } else {
                    // no entry in KB with this source -- add one
                    var newID = Underscore.uniqueId(),
                        newTU = new TargetUnit({
                            tuid: newID,
                            projectid: projectid,
                            source: sourceValue,
                            refstring: [
                                {
                                    target: targetValue,
                                    n: "1"
                                }
                            ],
                            timestamp: timestamp,
                            user: ""
                        });
                    targetunits.push(newTU);
                    newTU.save();
                }
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
                var deferred = $.Deferred();
                var len = 0;
                var i = 0;
                var retValue = null;
                var results = null;
                if (method === "read") {
                    if (options.data.hasOwnProperty('id')) {
                        findById(options.data.id).done(function (data) {
                            options.success(data);
                        });
                    } else if (options.data.hasOwnProperty('projectid')) {
                        var projectid = options.data.projectid;
                        results = targetunits.filter(function (element) {
                            return element.attributes.projectid === projectid.toLowerCase();
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
                                        return element.attributes.projectid === projectid.toLowerCase();
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
                    } else if (options.data.hasOwnProperty('source')) {
                        var source = options.data.source;
                        // special case -- empty source query ==> reset local copy so we force a retrieve
                        // from the database
                        if (source === "") {
                            targetunits.length = 0;
                        }
                        results = targetunits.filter(function (element) {
                            return element.source.toLowerCase().indexOf(source.toLowerCase()) > -1;
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
                }
            }

        });

    return {
        TargetUnit: TargetUnit,
        TargetUnitCollection: TargetUnitCollection
    };

});