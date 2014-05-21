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
                "SourceFont": "16px \"Source Sans\", helvetica, arial, sans-serif;",
                "TargetFont": "16px \"Source Sans\", helvetica, arial, sans-serif;",
                "NavigationFont": "",
                "SourceLanguageName": "English",
                "TargetLanguageName": "English",
                "SourceLanguageCode": "en",
                "TargetLanguageCode": "en",
                "PunctPairsSource": "?.,;:\"!()<>{}\"\"\'\'",
                "PunctPairsTarget": "?.,;:\"!()<>{}\"\"\'\'",
                "SourceDir": "ltr",
                "TargetDir": "ltr",
                "NavDir": "ltr",
                "id": "en.en",
                "name": "English to English adaptations"
            },
        findById = function (id) {
            var deferred = $.Deferred();
            
            deferred.resolve(project);
            return deferred.promise();
        },

        Project = Backbone.Model.extend({

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