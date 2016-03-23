/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        i           = 0,
        projects = [],
        
        findById = function (searchKey) {
            var deferred = $.Deferred();
            var results = projects.filter(function (element) {
                return element.attributes.projectid.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
            deferred.resolve(results);
            return deferred.promise();
        },

        findByName = function (searchKey) {
            var deferred = $.Deferred();
            var results = null;
            if (projects !== null) {
                results = projects.filter(function (element) {
                    return element.attributes.name.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
                });
            }
            deferred.resolve(results);
            return deferred.promise();
        },
        Project = Backbone.Model.extend({
            defaults: {
                projectid: "",
                SourceFont: "Source Sans",
                SourceFontSize: "16",
                SourceColor: "#0000aa",
                TargetFont: "Source Sans",
                TargetFontSize: "16",
                TargetColor: "#000000",
                NavigationFont: "Source Sans",
                NavigationFontSize: "16",
                NavigationColor: "#00cc00",
                SpecialTextColor: "#aa0000",
                RetranslationColor: "#996633",
                TextDifferencesColor: "rgb(40, 100, 40)",
                SourceLanguageName: "",
                TargetLanguageName: "",
                SourceLanguageCode: "",
                TargetLanguageCode: "",
                SourceVariant: "",
                TargetVariant: "",
                CopyPunctuation: "true",
                PunctPairs: [
                    {
                        s: "?",
                        t: "?"
                    },
                    {
                        s: ".",
                        t: "."
                    },
                    {
                        s: ",",
                        t: ","
                    },
                    {
                        s: ";",
                        t: ";"
                    },
                    {
                        s: ":",
                        t: ":"
                    },
                    {
                        s: "\"",
                        t: "\""
                    },
                    {
                        s: "!",
                        t: "!"
                    },
                    {
                        s: "(",
                        t: "("
                    },
                    {
                        s: ")",
                        t: ")"
                    },
                    {
                        s: "<",
                        t: "<"
                    },
                    {
                        s: ">",
                        t: ">"
                    },
                    {
                        s: "{",
                        t: "{"
                    },
                    {
                        s: "}",
                        t: "}"
                    },
                    {
                        s: "“",
                        t: "“"
                    },
                    {
                        s: "”",
                        t: "”"
                    },
                    {
                        s: "‘",
                        t: "‘"
                    },
                    {
                        s: "’",
                        t: "’"
                    }
                ],
                AutoCapitalization: "false",
                SourceHasUpperCase: "false",
                CasePairs: [
                    {
                        s: "aA",
                        t: "aA"
                    },
                    {
                        s: "bB",
                        t: "bB"
                    },
                    {
                        s: "cC",
                        t: "cC"
                    },
                    {
                        s: "dD",
                        t: "dD"
                    },
                    {
                        s: "eE",
                        t: "eE"
                    },
                    {
                        s: "fF",
                        t: "fF"
                    },
                    {
                        s: "gG",
                        t: "gG"
                    },
                    {
                        s: "hH",
                        t: "hH"
                    },
                    {
                        s: "iI",
                        t: "iI"
                    },
                    {
                        s: "jJ",
                        t: "jJ"
                    },
                    {
                        s: "kK",
                        t: "kK"
                    },
                    {
                        s: "lL",
                        t: "lL"
                    },
                    {
                        s: "mM",
                        t: "mM"
                    },
                    {
                        s: "nN",
                        t: "nN"
                    },
                    {
                        s: "oO",
                        t: "oO"
                    },
                    {
                        s: "pP",
                        t: "pP"
                    },
                    {
                        s: "qQ",
                        t: "qQ"
                    },
                    {
                        s: "rR",
                        t: "rR"
                    },
                    {
                        s: "sS",
                        t: "sS"
                    },
                    {
                        s: "tT",
                        t: "tT"
                    },
                    {
                        s: "uU",
                        t: "uU"
                    },
                    {
                        s: "vV",
                        t: "vV"
                    },
                    {
                        s: "wW",
                        t: "wW"
                    },
                    {
                        s: "xX",
                        t: "xX"
                    },
                    {
                        s: "yY",
                        t: "yY"
                    },
                    {
                        s: "zZ",
                        t: "zZ"
                    }
                ],
                SourceDir: "",
                TargetDir: "",
                NavDir: "",
                name: "",
                lastDocument: "",
                lastAdaptedBookID: 0,
                lastAdaptedChapterID: 0,
                lastAdaptedSPID: "",
                lastAdaptedName: "",
                CustomFilters: "false",
                FilterMarkers: "\\lit \\_table_grid \\_header \\_intro_base \\r \\cp \\_horiz_rule \\ie \\rem \\_unknown_para_style \\_normal_table \\note \\_heading_base \\_hidden_note \\_footnote_caller \\_dft_para_font \\va \\_small_para_break \\_footer \\_vernacular_base \\pro \\_notes_base \\__normal \\ide \\mr \\_annotation_ref \\_annotation_text \\_peripherals_base \\_gls_lang_interlinear \\free \\rq \\_nav_lang_interlinear \\_body_text \\cl \\efm \\bt \\_unknown_char_style \\_double_boxed_para \\_hdr_ftr_interlinear \\_list_base \\ib \\fig \\restore \\_src_lang_interlinear \\vp \\_tgt_lang_interlinear \\ef \\ca \\_single_boxed_para \\sts \\hr \\loc \\cat \\des"
            },
            initialize: function () {
                this.on('change', this.save, this);
            },
            fetch: function () {
                var deferred = $.Deferred();
                var obj = this;
                window.Application.db.transaction(function (tx) {
                    tx.executeSql("SELECT * from project WHERE id=?;", [obj.attributes.id], function (tx, res) {
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
                var sql = "INSERT INTO project (projectid, SourceFont, SourceFontSize, SourceColor, TargetFont, TargetFontSize, TargetColor, NavigationFont, NavigationFontSize, NavigationColor, SpecialTextColor, RetranslationColor, TextDifferencesColor, SourceLanguageName, SourceLanguageCode, TargetLanguageName, TargetLanguageCode, SourceVariant, TargetVariant, CopyPunctuation, PunctPairs, AutoCapitalization, SourceHasUpperCase, CasePairs, SourceDir, TargetDir, NavDir, name, lastDocument, lastAdaptedBookID, lastAdaptedChapterID, lastAdaptedSPID, lastAdaptedName, CustomFilters, FilterMarkers) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);";
                window.Application.db.transaction(function (tx) {
                    tx.executeSql(sql, [attributes.projectid, attributes.SourceFont, attributes.SourceFontSize, attributes.SourceColor, attributes.TargetFont, attributes.TargetFontSize, attributes.TargetColor, attributes.NavigationFont, attributes.NavigationFontSize, attributes.NavigationColor, attributes.SpecialTextColor, attributes.RetranslationColor, attributes.TextDifferencesColor, attributes.SourceLanguageName, attributes.SourceLanguageCode, attributes.TargetLanguageName, attributes.TargetLanguageCode, attributes.SourceVariant, attributes.TargetVariant, attributes.CopyPunctuation, JSON.stringify(attributes.PunctPairs), attributes.AutoCapitalization, attributes.SourceHasUpperCase, JSON.stringify(attributes.CasePairs), attributes.SourceDir, attributes.TargetDir, attributes.NavDir, attributes.name, attributes.lastDocument, attributes.lastAdaptedBookID, attributes.lastAdaptedChapterID, attributes.lastAdaptedSPID, attributes.lastAdaptedName, attributes.CustomFilters, attributes.FilterMarkers], function (tx, res) {
                        attributes.id = res.insertId;
//                        console.log("INSERT ok: " + res.toString());
                    }, function (tx, err) {
                        console.log("INSERT (create) error: " + err.message);
                    });
                });
            },
            update: function () {
                var attributes = this.attributes;
                var sql = "UPDATE project SET projectid=?, SourceFont=?, SourceFontSize=?, SourceColor=?, TargetFont=?, TargetFontSize=?, TargetColor=?, NavigationFont=?, NavigationFontSize=?, NavigationColor=?, SpecialTextColor=?, RetranslationColor=?, TextDifferencesColor=?, SourceLanguageName=?, SourceLanguageCode=?, TargetLanguageName=?, TargetLanguageCode=?, SourceVariant=?, TargetVariant=?, CopyPunctuation=?, PunctPairs=?, AutoCapitalization=?, SourceHasUpperCase=?, CasePairs=?, SourceDir=?, TargetDir=?, NavDir=?, name=?, lastDocument=?, lastAdaptedBookID=?, lastAdaptedChapterID=?, lastAdaptedSPID=?, lastAdaptedName=?, CustomFilters=?, FilterMarkers=? WHERE id=?;";
                window.Application.db.transaction(function (tx) {
                    tx.executeSql(sql, [attributes.projectid, attributes.SourceFont, attributes.SourceFontSize, attributes.SourceColor, attributes.TargetFont, attributes.TargetFontSize, attributes.TargetColor, attributes.NavigationFont, attributes.NavigationFontSize, attributes.NavigationColor, attributes.SpecialTextColor, attributes.RetranslationColor, attributes.TextDifferencesColor, attributes.SourceLanguageName, attributes.SourceLanguageCode, attributes.TargetLanguageName, attributes.TargetLanguageCode, attributes.SourceVariant, attributes.TargetVariant, attributes.CopyPunctuation, JSON.stringify(attributes.PunctPairs), attributes.AutoCapitalization, attributes.SourceHasUpperCase, JSON.stringify(attributes.CasePairs), attributes.SourceDir, attributes.TargetDir, attributes.NavDir, attributes.name, attributes.lastDocument, attributes.lastAdaptedBookID, attributes.lastAdaptedChapterID, attributes.lastAdaptedSPID, attributes.lastAdaptedName, attributes.CustomFilters, attributes.FilterMarkers, attributes.id], function (tx, res) {
//                        console.log("UPDATE ok: " + res.toString());
                    }, function (tx, err) {
                        console.log("UPDATE error: " + err.message);
                    });
                });
            },
            destroy: function (options) {
                window.Application.db.transaction(function (tx) {
                    tx.executeSql("DELETE FROM project WHERE projectid=?;", [this.attributes.projectid], function (tx, res) {
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
                    findById(this.projectid).done(function (data) {
                        options.success(data);
                    });
                    break;
                        
                case 'update':
                    if (this.attributes.projectid === "") {
                        model.create();
                    } else {
                        model.update();
                    }
                    break;
                        
                case 'delete':
                    model.destroy(options);
                    break;
                }
            }

        }),

        ProjectCollection = Backbone.Collection.extend({

            model: Project,

            resetFromDB: function () {
                var deferred = $.Deferred(),
                    i = 0,
                    len = 0;
                window.Application.db.transaction(function (tx) {
                    tx.executeSql('CREATE TABLE IF NOT EXISTS project (id integer primary key, projectid text, SourceFont text, SourceFontSize text, SourceColor text, TargetFont text, TargetFontSize text, TargetColor text, NavigationFont text, NavigationFontSize text, NavigationColor text, SpecialTextColor text, RetranslationColor text, TextDifferencesColor text, SourceLanguageName text, SourceLanguageCode text, TargetLanguageName text, TargetLanguageCode text, SourceVariant text, TargetVariant text, CopyPunctuation text, PunctPairs text, AutoCapitalization text, SourceHasUpperCase text, CasePairs text, SourceDir text, TargetDir text, NavDir text, name text, lastDocument text, lastAdaptedBookID integer, lastAdaptedChapterID integer, lastAdaptedSPID text, lastAdaptedName text, CustomFilters text, FilterMarkers text);');
                    
                    tx.executeSql("SELECT * from project;", [], function (tx, res) {
                        var tmpString = "";
                        for (i = 0, len = res.rows.length; i < len; ++i) {
                            // add the project
                            var proj = new Project();
                            proj.off("change");
                            proj.set(res.rows.item(i));
                            // convert PunctPairs and CasePairs back into array objects
                            tmpString = proj.get('PunctPairs');
                            proj.set('PunctPairs', JSON.parse(tmpString));
                            tmpString = proj.get('CasePairs');
                            proj.set('CasePairs', JSON.parse(tmpString));
                            // save the object to our collection
                            projects.push(proj);
                            proj.on("change", proj.save, proj);
                        }
                        console.log("SELECT ok: " + res.rows.length + " project items");
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

            // Removes all projects from the collection (and database)
            clearAll: function () {
                window.Application.db.transaction(function (tx) {
                    tx.executeSql('DELETE from project;');
                    projects.length = 0;
                }, function (err) {
                    console.log("DELETE error: " + err.message);
                });
            },

            sync: function (method, model, options) {
                if (method === "read") {
                    if (options.data.hasOwnProperty('projectid')) {
                        findById(options.data.projectid).done(function (data) {
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
                            projects.length = 0;
                        }
                        var results = projects.filter(function (element) {
                            return element.attributes.name.toLowerCase().indexOf(name.toLowerCase()) > -1;
                        });
                        if (results.length === 0) {
                            // not in collection -- retrieve them from the db
                            window.Application.db.transaction(function (tx) {
                                tx.executeSql("SELECT * FROM project;", [], function (tx, res) {
                                    var tmpString = "";
                                    // populate the chapter collection with the query results
                                    for (i = 0, len = res.rows.length; i < len; ++i) {
                                        // add the project
                                        var proj = new Project();
                                        proj.off("change");
                                        proj.set(res.rows.item(i));
                                        // convert PunctPairs and CasePairs back into array objects
                                        tmpString = proj.get('PunctPairs');
                                        proj.set('PunctPairs', JSON.parse(tmpString));
                                        tmpString = proj.get('CasePairs');
                                        proj.set('CasePairs', JSON.parse(tmpString));
                                        // save the object to our collection
                                        projects.push(proj);
                                        proj.on("change", proj.save, proj);
                                    }
                                    // return the filtered results (now that we have them)
                                    retValue = projects.filter(function (element) {
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
        Project: Project,
        ProjectCollection: ProjectCollection
    };

});