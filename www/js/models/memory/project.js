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
        project =
            {
                "SourceFont": "Source Sans",
                "SourceFontSize": "16px;",
                "SourceColor": "#0000aa;",
                "TargetFont": "Source Sans",
                "TargetFontSize": "16px;",
                "TargetColor": "#000;",
                "NavigationFont": "Source Sans",
                "NavigationFontSize": "16px;",
                "NavigationColor": "#00cc00;",
                "SourceLanguageName": "English",
                "TargetLanguageName": "English",
                "SourceLanguageCode": "en",
                "TargetLanguageCode": "en",
                "PunctPairs": [
                    {
                        "s": "?",
                        "t": "?"
                    },
                    {
                        "s": ".",
                        "t": "."
                    },
                    {
                        "s": ",",
                        "t": ","
                    },
                    {
                        "s": ";",
                        "t": ";"
                    },
                    {
                        "s": ":",
                        "t": ":"
                    },
                    {
                        "s": "\"",
                        "t": "\""
                    },
                    {
                        "s": "!",
                        "t": "!"
                    },
                    {
                        "s": "(",
                        "t": "("
                    },
                    {
                        "s": ")",
                        "t": ")"
                    },
                    {
                        "s": "<",
                        "t": "<"
                    },
                    {
                        "s": ">",
                        "t": ">"
                    },
                    {
                        "s": "{",
                        "t": "{"
                    },
                    {
                        "s": "}",
                        "t": "}"
                    },
                    {
                        "s": "“",
                        "t": "“"
                    },
                    {
                        "s": "”",
                        "t": "”"
                    },
                    {
                        "s": "‘",
                        "t": "‘"
                    },
                    {
                        "s": "’",
                        "t": "’"
                    }
                ],
                "SourceDir": "ltr",
                "TargetDir": "ltr",
                "NavDir": "ltr",
                "id": "en-us.en-au",
                "name": "US English to English adaptations"
            },
        findById = function (id) {
            var deferred = $.Deferred();
            
            deferred.resolve(project);
            return deferred.promise();
        },

        Project = Backbone.Model.extend({
            defaults: {
                "SourceFont": "Source Sans",
                "SourceFontSize": "16px;",
                "SourceColor": "#0000aa;",
                "TargetFont": "Source Sans",
                "TargetFontSize": "16px;",
                "TargetColor": "#000;",
                "NavigationFont": "Source Sans",
                "NavigationFontSize": "16px;",
                "NavigationColor": "#00cc00;",
                "SourceLanguageName": "English",
                "TargetLanguageName": "English",
                "SourceLanguageCode": "en",
                "TargetLanguageCode": "en",
                "PunctPairs": [
                    {
                        "s": "?",
                        "t": "?"
                    },
                    {
                        "s": ".",
                        "t": "."
                    },
                    {
                        "s": ",",
                        "t": ","
                    },
                    {
                        "s": ";",
                        "t": ";"
                    },
                    {
                        "s": ":",
                        "t": ":"
                    },
                    {
                        "s": "\"",
                        "t": "\""
                    },
                    {
                        "s": "!",
                        "t": "!"
                    },
                    {
                        "s": "(",
                        "t": "("
                    },
                    {
                        "s": ")",
                        "t": ")"
                    },
                    {
                        "s": "<",
                        "t": "<"
                    },
                    {
                        "s": ">",
                        "t": ">"
                    },
                    {
                        "s": "{",
                        "t": "{"
                    },
                    {
                        "s": "}",
                        "t": "}"
                    },
                    {
                        "s": "“",
                        "t": "“"
                    },
                    {
                        "s": "”",
                        "t": "”"
                    },
                    {
                        "s": "‘",
                        "t": "‘"
                    },
                    {
                        "s": "’",
                        "t": "’"
                    }
                ],
                "SourceDir": "ltr",
                "TargetDir": "ltr",
                "NavDir": "ltr",
                "id": "en-us.en-au",
                "name": "US English to English adaptations"
            },
            sync: function (method, model, options) {
                if (method === "read") {
                    findById(this.id).done(function (data) {
                        options.success(data);
                    });
                }
            }

        });

    return {
        Project: project
    };

});