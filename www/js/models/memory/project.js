/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        i           = 0,
        /* English/English translation project scaffolding
            TBD: currently this is just a gleaning of .aic file properties, some of which
            can be found in .ldml / CLDR data. Does it make sense to leverage some of that info?
            Are there javascript libraries that can give us what we need? (text direction, iso639 
            codes/names, etc.)
        */
        projects = null,
//        [
//            {
//                SourceFont: "Source Sans",
//                SourceFontSize: "16px;",
//                SourceColor: "#0000aa;",
//                TargetFont: "Source Sans",
//                TargetFontSize: "16px;",
//                TargetColor: "#000;",
//                NavigationFont: "Source Sans",
//                NavigationFontSize: "16px;",
//                NavigationColor: "#00cc00;",
//                SourceLanguageName: "English",
//                TargetLanguageName: "English",
//                SourceLanguageCode: "en",
//                TargetLanguageCode: "en",
//                CopyPunctuation: "true",
//                PunctPairs: [
//                    {
//                        s: "?",
//                        t: "?"
//                    },
//                    {
//                        s: ".",
//                        t: "."
//                    },
//                    {
//                        s: ",",
//                        t: ","
//                    },
//                    {
//                        s: ";",
//                        t: ";"
//                    },
//                    {
//                        s: ":",
//                        t: ":"
//                    },
//                    {
//                        s: "\"",
//                        t: "\""
//                    },
//                    {
//                        s: "!",
//                        t: "!"
//                    },
//                    {
//                        s: "(",
//                        t: "("
//                    },
//                    {
//                        s: ")",
//                        t: ")"
//                    },
//                    {
//                        s: "<",
//                        t: "<"
//                    },
//                    {
//                        s: ">",
//                        t: ">"
//                    },
//                    {
//                        s: "{",
//                        t: "{"
//                    },
//                    {
//                        s: "}",
//                        t: "}"
//                    },
//                    {
//                        s: "“",
//                        t: "“"
//                    },
//                    {
//                        s: "”",
//                        t: "”"
//                    },
//                    {
//                        s: "‘",
//                        t: "‘"
//                    },
//                    {
//                        s: "’",
//                        t: "’"
//                    }
//                ],
//                AutoCapitalization: "false",
//                SourceHasUpperCase: "false",
//                CasePairs: [
//                    {
//                        s: "aA",
//                        t: "aA"
//                    },
//                    {
//                        s: "bB",
//                        t: "bB"
//                    },
//                    {
//                        s: "cC",
//                        t: "cC"
//                    },
//                    {
//                        s: "dD",
//                        t: "dD"
//                    },
//                    {
//                        s: "eE",
//                        t: "eE"
//                    },
//                    {
//                        s: "fF",
//                        t: "fF"
//                    },
//                    {
//                        s: "gG",
//                        t: "gG"
//                    },
//                    {
//                        s: "hH",
//                        t: "hH"
//                    },
//                    {
//                        s: "iI",
//                        t: "iI"
//                    },
//                    {
//                        s: "jJ",
//                        t: "jJ"
//                    },
//                    {
//                        s: "kK",
//                        t: "kK"
//                    },
//                    {
//                        s: "lL",
//                        t: "lL"
//                    },
//                    {
//                        s: "mM",
//                        t: "mM"
//                    },
//                    {
//                        s: "nN",
//                        t: "nN"
//                    },
//                    {
//                        s: "oO",
//                        t: "oO"
//                    },
//                    {
//                        s: "pP",
//                        t: "pP"
//                    },
//                    {
//                        s: "qQ",
//                        t: "qQ"
//                    },
//                    {
//                        s: "rR",
//                        t: "rR"
//                    },
//                    {
//                        s: "sS",
//                        t: "sS"
//                    },
//                    {
//                        s: "tT",
//                        t: "tT"
//                    },
//                    {
//                        s: "uU",
//                        t: "uU"
//                    },
//                    {
//                        s: "vV",
//                        t: "vV"
//                    },
//                    {
//                        s: "wW",
//                        t: "wW"
//                    },
//                    {
//                        s: "xX",
//                        t: "xX"
//                    },
//                    {
//                        s: "yY",
//                        t: "yY"
//                    },
//                    {
//                        s: "zZ",
//                        t: "zZ"
//                    }
//                ],
//                SourceDir: "ltr",
//                TargetDir: "ltr",
//                NavDir: "ltr",
//                id: "en-us.en-au",
//                name: "US English to Australian English adaptations",
//                lastDocument: "Ruth.xml",
//                lastAdaptedID: "RUT001",
//                lastAdaptedName: "Ruth 1",
//                CustomFilters: "false",
//                FilterMarkers: "\\lit \\_table_grid \\_header \\_intro_base \\x \\r \\cp \\_horiz_rule \\ie \\rem \\_unknown_para_style \\_normal_table \\note \\_heading_base \\_hidden_note \\_footnote_caller \\_dft_para_font \\va \\_small_para_break \\_footer \\_vernacular_base \\pro \\xt \\_notes_base \\__normal \\xdc \\ide \\mr \\xq \\_annotation_ref \\_annotation_text \\_peripherals_base \\_gls_lang_interlinear \\free \\rq \\_nav_lang_interlinear \\_body_text \\cl \\xot \\efm \\bt \\_unknown_char_style \\_double_boxed_para \\_hdr_ftr_interlinear \\xk \\_list_base \\ib \\xnt \\fig \\restore \\_src_lang_interlinear \\vp \\_tgt_lang_interlinear \\ef \\ca \\xo \\_single_boxed_para \\sts"
//            }
//        ],
        
        findById = function (id) {
            var i = 0,
                deferred = $.Deferred(),
                project = null,
                l = projects.length;
            for (i = 0; i < l; i++) {
                if (projects[i].id === id) {
                    project = projects[i];
                    break;
                }
            }
            deferred.resolve(project);
            return deferred.promise();
        },

        findByName = function (searchKey) {
            var deferred = $.Deferred();
            var results = null;
            if (projects != null) {
                results = projects.filter(function (element) {
                    return element.name.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
                });
            }
            deferred.resolve(results);
            return deferred.promise();
        },

        Project = Backbone.Model.extend({
            defaults: {
                SourceFont: "Source Sans",
                SourceFontSize: "16px;",
                SourceColor: "#0000aa;",
                TargetFont: "Source Sans",
                TargetFontSize: "16px;",
                TargetColor: "#000;",
                NavigationFont: "Source Sans",
                NavigationFontSize: "16px;",
                NavigationColor: "#00cc00;",
                SourceLanguageName: "",
                TargetLanguageName: "",
                SourceLanguageCode: "",
                TargetLanguageCode: "",
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
                id: "",
                name: "",
                lastDocument: "",
                lastAdaptedID: "",
                lastAdaptedName: "",
                CustomFilters: "false",
                FilterMarkers: "\\lit \\_table_grid \\_header \\_intro_base \\x \\r \\cp \\_horiz_rule \\ie \\rem \\_unknown_para_style \\_normal_table \\note \\_heading_base \\_hidden_note \\_footnote_caller \\_dft_para_font \\va \\_small_para_break \\_footer \\_vernacular_base \\pro \\xt \\_notes_base \\__normal \\xdc \\ide \\mr \\xq \\_annotation_ref \\_annotation_text \\_peripherals_base \\_gls_lang_interlinear \\free \\rq \\_nav_lang_interlinear \\_body_text \\cl \\xot \\efm \\bt \\_unknown_char_style \\_double_boxed_para \\_hdr_ftr_interlinear \\xk \\_list_base \\ib \\xnt \\fig \\restore \\_src_lang_interlinear \\vp \\_tgt_lang_interlinear \\ef \\ca \\xo \\_single_boxed_para \\sts"
            },

            sync: function (method, model, options) {
                // read is the only method currently implemented for in-memory;
                // the others will simply return a success state.
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
                    options.success(model);
                    break;
                        
                case 'delete':
                    options.success(model);
                    break;
                }
            }

        }),

        ProjectCollection = Backbone.Collection.extend({

            model: Project,

            sync: function (method, model, options) {
                if (method === "read") {
                    findByName(options.data.name).done(function (data) {
                        options.success(data);
                    });
                }
            }

        });
    
    return {
        Project: Project,
        ProjectCollection: ProjectCollection
    };

});