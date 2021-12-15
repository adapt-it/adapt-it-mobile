/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        projects    = [],
        CURRSCHEMA  = 3,
        
        // ---
        // STATIC METHODS
        // ---
        
        // upgradeSchema
        // Helper method to upgrade the database schema from the specified version
        upgradeSchema = function (fromVersion) {
            console.log("upgradeSchema: fromVersion=" + fromVersion);
            if (fromVersion === 0) {
                // pre-beta (beta = 1) -- version table does not exist; create it
                window.Application.db.transaction(function (tx) {
                    var theSQL = "";
                    // create the version table and insert our current schema
                    tx.executeSql('CREATE TABLE IF NOT EXISTS version (id INTEGER primary key, schemaver INTEGER);');
                    tx.executeSql('INSERT INTO version (schemaver) VALUES (?);', [CURRSCHEMA], function (tx, res) {
                        console.log("version table created -- schema version: " + CURRSCHEMA);
                    }, function (err) {
                        console.log("failed to set the version schema");
                    });
                    // does the sourcephrase table already exist? (probably, but just in case)
                    if (device) {
                        theSQL = "SELECT name FROM sqlite_master WHERE type=\'table\' and name=\'sourcephrase\';";
                    } else {
                        theSQL = "SELECT name FROM sqlite_master WHERE type=\'table\' and name=\'sourcephrase\';";
                    }
                    tx.executeSql(theSQL, [], function (tx, res) {
                        if (res.rows.length > 0) {
                            // sourcephrase table exists and is populated -- update it
                            // the "real" change for beta -- 7 new columns for AI XML round-tripping
                            // SQLite only supports adding the columns one at a time via ALTER TABLE
                            tx.executeSql("ALTER TABLE sourcephrase ADD COLUMN flags TEXT;");
                            tx.executeSql("ALTER TABLE sourcephrase ADD COLUMN texttype INTEGER;");
                            tx.executeSql("ALTER TABLE sourcephrase ADD COLUMN gloss TEXT;");
                            tx.executeSql("ALTER TABLE sourcephrase ADD COLUMN freetrans TEXT;");
                            tx.executeSql("ALTER TABLE sourcephrase ADD COLUMN note TEXT;");
                            tx.executeSql("ALTER TABLE sourcephrase ADD COLUMN srcwordbreak TEXT;");
                            tx.executeSql("ALTER TABLE sourcephrase ADD COLUMN tgtwordbreak TEXT;");
                            tx.executeSql("ALTER TABLE sourcephrase ADD COLUMN vid TEXT;"); // this comes in 1.6, but we'll add it here
                        }
                    }, function (err) {
                        // exception thrown -- assume table doesn't exist
                        console.log("upgradeSchema: error updating sourcephrase table: " + err.message);
                    });
                    // update changes for 1.3 
                    if (device) {
                        theSQL = "SELECT name FROM sqlite_master WHERE type=\'table\' and name=\'targetunit\';";
                    } else {
                        theSQL = "SELECT name FROM sqlite_master WHERE type=\'table\' and name=\'targetunit\';";
                    }
                    tx.executeSql(theSQL, [], function (tx, res) {
                        // If the user has created any KB items (likely), we'll need to add 2 columns;
                        // if there's no KB, it'll create the table with all the needed columns (see targetunit.js)
                        if ((res.rows.length > 0) && (res.rows.item(0).f === null)) {
                            // targetunit table exists -- need to add 2 columns
                            console.log("upgradeSchema: targetunit table exists, and is old: adding columns");
                            window.Application.db.transaction(function (tx) {
                                // Check 3: what's the schema version?
                                tx.executeSql("ALTER TABLE targetunit ADD COLUMN mn INTEGER;");
                                tx.executeSql("ALTER TABLE targetunit ADD COLUMN f TEXT DEFAULT \'0\';");
                            });
                        }
                    }, function (err) {
                        // exception thrown -- assume table doesn't exist
                        console.log("upgradeSchema: error updating targetunit table: " + err.message);
                    });
                }, function (e) {
                    console.log("upgradeSchema error: " + e.message);
                });
            }
            if (fromVersion === 1) {
                // AIM version 1.3 (KB editing) -- two columns in the targetunit table
                window.Application.db.transaction(function (tx) {
                    var theSQL = "";
                    // version table exists (see logic above), but is at version 1; update it here
                    tx.executeSql('UPDATE version SET schemaver=? WHERE id=?;', [CURRSCHEMA, 1], function (tx, res) {
                        console.log("version table updated -- schema version: " + CURRSCHEMA);
                    }, function (err) {
                        console.log("failed to set the version schema: " + err);
                    });
                    // update changes for 1.3 
                    // First, check to see if the targetunit table exists
                    if (device) {
                        theSQL = "SELECT name FROM sqlite_master WHERE type=\'table\' and name=\'targetunit\';";
                    } else {
                        theSQL = "SELECT name FROM sqlite_master WHERE type=\'table\' and name=\'targetunit\';";
                    }
                    tx.executeSql(theSQL, [], function (tx, res) {
                        // If the user has created any KB items AND the new columns aren't there, we'll need to add them;
                        // if there's no KB, it'll create the table with all the needed columns (see targetunit.js)
                        if (res.rows.length > 0) {
                            console.log("upgradeSchema: targetunit table exists. Checking for schema 2 columns...");
                            if (device) {
                                theSQL = "SELECT COUNT(*) AS cntrec FROM pragma_table_info(\'targetunit\') WHERE name=\'f\';";
                            } else {
                                theSQL = "SELECT COUNT(*) AS cntrec FROM pragma_table_info(\'targetunit\') WHERE name=\'f\';";
                            }
                            tx.executeSql(theSQL, [], function (tx, res) {
                                // If the user has created any KB items (likely), we'll need to add 2 columns;
                                // if there's no KB, it'll create the table with all the needed columns (see targetunit.js)
                                if ((res.rows.length > 0) && (res.rows.item(0).cntrec.toString() === "0")) {
                                    // targetunit table exists -- need to add 2 columns
                                    console.log("upgradeSchema: targetunit table exists, and is old: adding columns");
                                    window.Application.db.transaction(function (tx) {
                                        // Check 3: what's the schema version?
                                        tx.executeSql("ALTER TABLE targetunit ADD COLUMN mn INTEGER;");
                                        tx.executeSql("ALTER TABLE targetunit ADD COLUMN f TEXT DEFAULT \'0\';");
                                    }, function (err) {
                                        // exception thrown -- assume table doesn't exist
                                        console.log("upgradeSchema: error updating targetunit table: " + err.message);
                                    });
                                } else {
                                    console.log("upgradeSchema: targetunit table populated, but already has column \'f\' -- no need to alter table");
                                }
                            }, function (err) {
                                console.log("upgradeSchema: error getting pragma_table_info for targetunit: " + err.message);
                            });
                        } else {
                            console.log("upgradeSchema: no targetunit table -- table upgrade not needed");
                        }
                    }, function (err) {
                        // exception thrown -- assume table doesn't exist
                        console.log("upgradeSchema: error: " + err.message);
                    });
                    // update changes for 1.6 
                    // First, check to see if the sourcephrase table exists
                    if (device) {
                        theSQL = "SELECT name FROM sqlite_master WHERE type=\'table\' and name=\'sourcephrase\';";
                    } else {
                        theSQL = "SELECT name FROM sqlite_master WHERE type=\'table\' and name=\'sourcephrase\';";
                    }
                    tx.executeSql(theSQL, [], function (tx, res) {
                        // If the user has created any sourcephrase items (i.e., they've imported a document) AND the new column isn't there, we'll need to add it;
                        // if there's no sourcephrase table, it'll create the table with all the needed columns (see sourcephrase.js)
                        if (res.rows.length > 0) {
                            console.log("upgradeSchema: sourcephrase table exists. Checking for schema 3 columns...");
                            if (device) {
                                theSQL = "SELECT COUNT(*) AS cntrec FROM pragma_table_info(\'sourcephrase\') WHERE name=\'vid\';";
                            } else {
                                theSQL = "SELECT COUNT(*) AS cntrec FROM pragma_table_info(\'sourcephrase\') WHERE name=\'vid\';";
                            }
                            tx.executeSql(theSQL, [], function (tx, res) {
                                // If the user has created any KB items (likely), we'll need to add 2 columns;
                                // if there's no sourcephrase table, it'll create the table with all the needed columns (see sourcephrase.js)
                                if ((res.rows.length > 0) && (res.rows.item(0).cntrec.toString() === "0")) {
                                    // sourcephrase table exists -- need to add 2 columns
                                    console.log("upgradeSchema: sourcephrase table exists, and is old: adding columns");
                                    window.Application.db.transaction(function (tx) {
                                        tx.executeSql("ALTER TABLE sourcephrase ADD COLUMN vid TEXT;");
                                    }, function (err) {
                                        // exception thrown -- assume table doesn't exist
                                        console.log("upgradeSchema: error updating sourcephrase table: " + err.message);
                                    });
                                } else {
                                    console.log("upgradeSchema: sourcephrase table populated, but already has column \'vid\' -- no need to alter table");
                                }
                            }, function (err) {
                                console.log("upgradeSchema: error getting pragma_table_info for sourcephrase: " + err.message);
                            });
                        } else {
                            console.log("upgradeSchema: no sourcephrase table -- table upgrade not needed");
                        }
                    }, function (err) {
                        // exception thrown -- assume table doesn't exist
                        console.log("upgradeSchema: error: " + err.message);
                    });
                }, function (e) {
                    console.log("upgradeSchema error: " + e.message);
                });
            }
            if (fromVersion === 2) {
                // AIM version 1.6 (multiple imports for KIT) -- one column in the sourcephrase table
                window.Application.db.transaction(function (tx) {
                    var theSQL = "";
                    // version table exists (see logic above), but is at version 2; update it here
                    tx.executeSql('UPDATE version SET schemaver=? WHERE id=?;', [CURRSCHEMA, 1], function (tx, res) {
                        console.log("version table updated -- schema version: " + CURRSCHEMA);
                    }, function (err) {
                        console.log("failed to set the version schema: " + err);
                    });
                    // update changes for 1.6 
                    // First, check to see if the sourcephrase table exists
                    if (device) {
                        theSQL = "SELECT name FROM sqlite_master WHERE type=\'table\' and name=\'sourcephrase\';";
                    } else {
                        theSQL = "SELECT name FROM sqlite_master WHERE type=\'table\' and name=\'sourcephrase\';";
                    }
                    tx.executeSql(theSQL, [], function (tx, res) {
                        // If the user has created any sourcephrase items (i.e., they've imported a document) AND the new column isn't there, we'll need to add it;
                        // if there's no sourcephrase table, it'll create the table with all the needed columns (see sourcephrase.js)
                        if (res.rows.length > 0) {
                            console.log("upgradeSchema: sourcephrase table exists. Checking for schema 3 columns...");
                            if (device) {
                                theSQL = "SELECT COUNT(*) AS cntrec FROM pragma_table_info(\'sourcephrase\') WHERE name=\'vid\';";
                            } else {
                                theSQL = "SELECT COUNT(*) AS cntrec FROM pragma_table_info(\'sourcephrase\') WHERE name=\'vid\';";
                            }
                            tx.executeSql(theSQL, [], function (tx, res) {
                                // If the user has created any KB items (likely), we'll need to add 2 columns;
                                // if there's no KB, it'll create the table with all the needed columns (see sourcephrase.js)
                                if ((res.rows.length > 0) && (res.rows.item(0).cntrec.toString() === "0")) {
                                    // sourcephrase table exists -- need to add 2 columns
                                    console.log("upgradeSchema: sourcephrase table exists, and is old: adding columns");
                                    window.Application.db.transaction(function (tx) {
                                        tx.executeSql("ALTER TABLE sourcephrase ADD COLUMN vid TEXT;");
                                    }, function (err) {
                                        // exception thrown -- assume table doesn't exist
                                        console.log("upgradeSchema: error updating sourcephrase table: " + err.message);
                                    });
                                } else {
                                    console.log("upgradeSchema: sourcephrase table populated, but already has column \'vid\' -- no need to alter table");
                                }
                            }, function (err) {
                                console.log("upgradeSchema: error getting pragma_table_info for sourcephrase: " + err.message);
                            });
                        } else {
                            console.log("upgradeSchema: no sourcephrase table -- table upgrade not needed");
                        }
                    }, function (err) {
                        // exception thrown -- assume table doesn't exist
                        console.log("upgradeSchema: error: " + err.message);
                    });
                }, function (e) {
                    console.log("upgradeSchema error: " + e.message);
                });
            }
        },
        // checkSchema
        // Helper method to make sure we're at the latest database schema version. Does the following tests:
        // - check for new DB (missing sourcephrase table) - adds a version table if the DB is new
        // - check for missing version table AND existing sourcephrase table -- indicates pre-beta schema
        // - check for version table with schemaver < CURRSCHEMA
        checkSchema = function () {
            var theSQL = "";
            console.log("checkSchema: entry");
            if (typeof device === "undefined") {
                return;
            }
            window.Application.db.transaction(function (tx) {
                // Check 1: is there a version table? 
                // If not, this is a new DB
                if (device) {
                    theSQL = "SELECT name FROM sqlite_master WHERE type=\'table\' and name=\'version\';";
                } else {
                    theSQL = "SELECT name FROM sqlite_master WHERE type=\'table\' and name=\'version\';";
                }
                tx.executeSql(theSQL, [], function (tx, res) {
                    if (res.rows.length > 0) {
                        console.log("checkSchema: version table exists");
                        window.Application.db.transaction(function (tx) {
                            // Check 3: what's the schema version?
                            tx.executeSql("SELECT * FROM version;", [], function (tx, res) {
                                var schemaVer = res.rows.item(0).schemaver;
                                if (schemaVer < CURRSCHEMA) {
                                    // not the current schema -- upgrade the DB as appropriate
                                    upgradeSchema(schemaVer);
                                } else {
                                    console.log("checkSchema: running on latest DB schema");
                                }
                            });
                        });
                    } else {
                        console.log("checkSchema: new DB -- adding version table");
                        // no sourcephrase table -- meaning new DB
                        // Add a version table with version = CURRSCHEMA (the sourcephrase
                        // table will be added in the resetFromDB call in sourcephrase.js).
                        window.Application.db.transaction(function (tx) {
                            tx.executeSql('CREATE TABLE IF NOT EXISTS version (id INTEGER primary key, schemaver INTEGER);');
                            tx.executeSql('INSERT INTO version (schemaver) VALUES (?);', [CURRSCHEMA], function (tx, res) {
                                console.log("version table created -- schema version: " + CURRSCHEMA);
                            });
                        }, function (err) {
                            console.log("checkSchema: CREATE TABLE error: " + err.message);
                        });
                    }
                }, function (err) {
                    console.log("checkSchema: CREATE TABLE error: " + err.message);
                });
            });
            
        },
        
        findById = function (searchKey) {
            var deferred = $.Deferred();
            var results = projects.filter(function (element) {
                return element.attributes.projectid.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
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
                    },
                    {
                        s: "'",
                        t: "'"
                    },
                    {
                        s: "«",
                        t: "«"
                    },
                    {
                        s: "»",
                        t: "»"
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
                FilterMarkers: "\\lit \\_table_grid \\_header \\_intro_base \\x \\r \\cp \\_horiz_rule \\ie \\rem \\_unknown_para_style \\_normal_table \\note \\_heading_base \\_hidden_note \\_footnote_caller \\_dft_para_font \\va \\_small_para_break \\_footer \\_vernacular_base \\pro \\xt \\_notes_base \\__normal \\xdc \\ide \\mr \\xq \\_annotation_ref \\_annotation_text \\_peripherals_base \\_gls_lang_interlinear \\free \\rq \\_nav_lang_interlinear \\_body_text \\cl \\xot \\efm \\bt \\_unknown_char_style \\_double_boxed_para \\_hdr_ftr_interlinear \\xk \\_list_base \\ib \\xnt \\fig \\restore \\_src_lang_interlinear \\vp \\_tgt_lang_interlinear \\ef \\ca \\xo \\_single_boxed_para \\sts"
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
                var deferred = $.Deferred();
                var attributes = this.attributes;
                console.log("destroy() - removing project: " + attributes.projectid);
                window.Application.db.transaction(function (tx) {
                    // get the books associated with this projectid
                    tx.executeSql("SELECT * FROM project WHERE projectid=?;", [attributes.projectid], function (tx, res) {
                        var projidx = 0,
                            projlen = 0;
                        for (projidx = 0, projlen = res.rows.length; projidx < projlen; ++projidx) {
                            // get the chapters associated with this bookid
                            var bookid = res.rows.item(projidx).bookid;
                            tx.executeSql("SELECT * FROM chapter WHERE bookid=?;", [bookid], function (tx, res) {
                                // for each chapter, delete the sourcephrases associated with the chapterid - then delete the chapter
                                var i = 0,
                                    len = 0;
                                for (i = 0, len = res.rows.length; i < len; ++i) {
                                    window.Application.db.transaction(function (tx) {
                                        var chapterid = res.rows.item(i).chapterid;
                                        tx.executeSql("DELETE FROM sourcephrase WHERE chapterid=?", [chapterid], function (tx, res) {
                                            console.log("DELETE sourcephrases ok: " + res.toString());
                                        });
                                    });                    
                                }
                                // delete the chapters
                                tx.executeSql("DELETE FROM chapter WHERE bookid=?", [bookid], function (tx, res) {
                                    console.log("DELETE chapters ok: " + res.toString());
                                });
                            });
                        }
                        // delete the books
                        tx.executeSql("DELETE FROM book WHERE projectid=?;", [attributes.projectid], function (tx, res) {
                            console.log("DELETE books ok: " + res.toString());
                        }, function (tx, err) {
                            console.log("DELETE error: " + err.message);
                        });
                    });
                    // delete the project
                    tx.executeSql("DELETE FROM project WHERE projectid=?;", [attributes.projectid], function (tx, res) {
                        console.log("DELETE project ok: " + res.toString());
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
        checkSchema: checkSchema,
        Project: Project,
        ProjectCollection: ProjectCollection
    };

});