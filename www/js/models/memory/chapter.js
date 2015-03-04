/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        // WEB Bible text from http://ebible.org/web/ 
        // (moved to sourcephrase.js)
        chapters = [],
//        [
//            {
//                "id": "RUT001",
//                "name": "Ruth 1",
//                "lastAdapted": 2,
//                "verseCount": 22
//            },
//            {
//                "id": "RUT002",
//                "name": "Ruth 2",
//                "lastAdapted": 0,
//                "verseCount": 23
//            },
//            {
//                "id": "RUT003",
//                "name": "Ruth 3",
//                "lastAdapted": 0,
//                "verseCount": 18
//            },
//            {
//                "id": "RUT004",
//                "name": "Ruth 4",
//                "lastAdapted": 0,
//                "verseCount": 22
//            }
//        ],

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
            defaults: {
                id: "",
                name: "",
                lastAdapted: 0,
                verseCount: 0
            },
            initialize: function () {
                this.on('change', this.save, this);
            },
            fetch: function () {
                // search for our key - b.<id>
                this.set(JSON.parse(localStorage.getItem("c." + this.id)));
            },
            save: function (attributes) {
                // only save if the id actually has a value
                if (this.id.length > 1) {
                    // save with a key of c.<id>
                    localStorage.setItem(("c." + this.id), JSON.stringify(this));
                }
            },
            destroy: function (options) {
                localStorage.removeItem(this.id);
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

        ChapterCollection = Backbone.Collection.extend({

            model: Chapter,

            resetFromLocalStorage: function () {
                var i = 0,
                    len = 0;
                for (i = 0, len = localStorage.length; i < len; ++i) {
                    // if this is a chapter, add it to our collection
                    if (localStorage.key(i).substr(0, 2) === "c.") {
                        var ch = new Chapter();
                        ch.set(JSON.parse(localStorage.getItem(localStorage.key(i))));
                        chapters.push(ch);
                    }
                }
            },
            
            initialize: function () {
                this.resetFromLocalStorage();
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
        Chapter: Chapter,
        ChapterCollection: ChapterCollection
    };

});