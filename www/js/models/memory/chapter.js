/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        // WEB Bible text from http://ebible.org/web/ 
        // (moved to sourcephrase.js)
        chapters = [
            {
                "id": "RUT001",
                "name": "Ruth 1",
                "lastAdapted": 2,
                "verseCount": 22
            },
            {
                "id": "RUT2",
                "name": "Ruth 2",
                "lastAdapted": 0,
                "verseCount": 23
            },
            {
                "id": "RUT3",
                "name": "Ruth 3",
                "lastAdapted": 0,
                "verseCount": 18
            },
            {
                "id": "RUT4",
                "name": "Ruth 4",
                "lastAdapted": 0,
                "verseCount": 22
            }
        ],

        findById = function (id) {
            var i = 0,
                deferred = $.Deferred(),
                chapter = null,
                l = chapters.length;
            for (i = 0; i < l; i++) {
                if (chapters[i].id === id) {
                    chapter = chapters[i];
                    break;
                }
            }
            deferred.resolve(chapter);
            return deferred.promise();
        },

        findByName = function (searchKey) {
            var deferred = $.Deferred();
            var results = chapters.filter(function (element) {
                return element.name.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
            deferred.resolve(results);
            return deferred.promise();
        },

        Chapter = Backbone.Model.extend({

            sync: function (method, model, options) {
                if (method === "read") {
                    findById(this.id).done(function (data) {
                        options.success(data);
                    });
                }
            }

        }),

        ChapterCollection = Backbone.Collection.extend({

            model: Chapter,

            sync: function (method, model, options) {
                if (method === "read") {
                    findByName(options.data.name).done(function (data) {
                        options.success(data);
                    });
                }
            }

        });

    return {
        Chapter: Chapter,
        ChapterCollection: ChapterCollection
    };

});