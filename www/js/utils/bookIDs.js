/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        i           = 0,
        /* OT/NT books, including apocrypha
        */
        bookIDs = [
            {
                id: "GEN",
                name: "Genesis",
                chapters: 50
            },
            {
                id: "EXO",
                name: "Exodus",
                chapters: 40
            },
            {
                id: "LEV",
                name: "Leviticus",
                chapters: 27
            },
            {
                id: "NUM",
                name: "Numbers",
                chapters: 36
            },
            {
                id: "DEU",
                name: "Deuteronomy",
                chapters: 34
            },
            {
                id: "JOS",
                name: "Joshua",
                chapters: 24
            },
            {
                id: "JDG",
                name: "Judges",
                chapters: 21
            },
            {
                id: "RUT",
                name: "Ruth",
                chapters: 4
            },
            {
                id: "1SA",
                name: "1 Samuel",
                chapters: 31
            },
            {
                id: "2SA",
                name: "2 Samuel",
                chapters: 24
            },
            {
                id: "1KI",
                name: "1 Kings",
                chapters: 22
            },
            {
                id: "2KI",
                name: "2 Kings",
                chapters: 25
            },
            {
                id: "1CH",
                name: "1 Chronicles",
                chapters: 29
            },
            {
                id: "2CH",
                name: "2 Chronicles",
                chapters: 36
            },
            {
                id: "EZR",
                name: "Ezra",
                chapters: 10
            },
            {
                id: "NEH",
                name: "Nehemiah",
                chapters: 13
            },
            {
                id: "EST",
                name: "Esther",
                chapters: 10
            },
            {
                id: "JOB",
                name: "Job",
                chapters: 42
            },
            {
                id: "PSA",
                name: "Psalms",
                chapters: 150
            },
            {
                id: "PRO",
                name: "Proverbs",
                chapters: 31
            },
            {
                id: "ECC",
                name: "Ecclesiastes",
                chapters: 12
            },
            {
                id: "SNG",
                name: "Song of Solomon",
                chapters: 8
            },
            {
                id: "ISA",
                name: "Isaiah",
                chapters: 66
            },
            {
                id: "JER",
                name: "Jeremiah",
                chapters: 52
            },
            {
                id: "LAM",
                name: "Lamentations",
                chapters: 5
            },
            {
                id: "EZK",
                name: "Ezekiel",
                chapters: 48
            },
            {
                id: "DAN",
                name: "Daniel",
                chapters: 12
            },
            {
                id: "HOS",
                name: "Hosea",
                chapters: 14
            },
            {
                id: "JOL",
                name: "Joel",
                chapters: 3
            },
            {
                id: "AMO",
                name: "Amos",
                chapters: 9
            },
            {
                id: "OBA",
                name: "Obadiah",
                chapters: 1
            },
            {
                id: "JON",
                name: "Jonah",
                chapters: 4
            },
            {
                id: "MIC",
                name: "Micah",
                chapters: 7
            },
            {
                id: "NAM",
                name: "Nahum",
                chapters: 3
            },
            {
                id: "HAB",
                name: "Habakkuk",
                chapters: 3
            },
            {
                id: "ZEP",
                name: "Zephaniah",
                chapters: 3
            },
            {
                id: "HAG",
                name: "Haggai",
                chapters: 2
            },
            {
                id: "ZEC",
                name: "Zechariah",
                chapters: 14
            },
            {
                id: "MAL",
                name: "Malachi",
                chapters: 4
            },
            {
                id: "TOB",
                name: "Tobit",
                chapters: 14
            },
            {
                id: "JDT",
                name: "Judith",
                chapters: 16
            },
            {
                id: "ESG",
                name: "Greek Additions to Esther",
                chapters: 16
            },
            {
                id: "WIS",
                name: "Wisdom of Solomon",
                chapters: 19
            },
            {
                id: "SIR",
                name: "Sirach",
                chapters: 51
            },
            {
                id: "BAR",
                name: "Baruch",
                chapters: 5
            },
            {
                id: "LJE",
                name: "Jeremy\'s Letter",
                chapters: 1
            },
            {
                id: "PAZ",
                name: "3 Holy Children\'s Song",
                chapters: 1
            },
            {
                id: "SUS",
                name: "Susanna",
                chapters: 1
            },
            {
                id: "BEL",
                name: "Bel and the Dragon",
                chapters: 1
            },
            {
                id: "MA1",
                name: "1 Maccabees",
                chapters: 16
            },
            {
                id: "MA2",
                name: "2 Maccabees",
                chapters: 15
            },
            {
                id: "MA3",
                name: "3 Maccabees",
                chapters: 7
            },
            {
                id: "MA4",
                name: "4 Maccabees",
                chapters: 18
            },
            {
                id: "GES",
                name: "1 Esdras",
                chapters: 9
            },
            {
                id: "LES",
                name: "2 Esdras",
                chapters: 16
            },
            {
                id: "MAN",
                name: "Prayer of Manassas",
                chapters: 1
            },
            
            {
                id: "MAT",
                name: "Matthew",
                chapters: 28
            },
            {
                id: "MRK",
                name: "Mark",
                chapters: 16
            },
            {
                id: "LUK",
                name: "Luke",
                chapters: 24
            },
            {
                id: "JHN",
                name: "John",
                chapters: 21
            },
            {
                id: "ACT",
                name: "Acts",
                chapters: 28
            },
            {
                id: "ROM",
                name: "Romans",
                chapters: 16
            },
            {
                id: "1CO",
                name: "1 Corinthians",
                chapters: 16
            },
            {
                id: "2CO",
                name: "2 Corinthians",
                chapters: 13
            },
            {
                id: "GAL",
                name: "Galatians",
                chapters: 6
            },
            {
                id: "EPH",
                name: "Ephesians",
                chapters: 6
            },
            {
                id: "PHP",
                name: "Philippians",
                chapters: 4
            },
            {
                id: "COL",
                name: "Colossians",
                chapters: 4
            },
            {
                id: "1TH",
                name: "1 Thessalonians",
                chapters: 5
            },
            {
                id: "2TH",
                name: "2 Thessalonians",
                chapters: 3
            },
            {
                id: "1TI",
                name: "1 Timothy",
                chapters: 5
            },
            {
                id: "2TI",
                name: "2 Timothy",
                chapters: 3
            },
            {
                id: "TIT",
                name: "Titus",
                chapters: 3
            },
            {
                id: "PHM",
                name: "Philemon",
                chapters: 1
            },
            {
                id: "HEB",
                name: "Hebrews",
                chapters: 13
            },
            {
                id: "JAS",
                name: "James",
                chapters: 5
            },
            {
                id: "1PE",
                name: "1 Peter",
                chapters: 5
            },
            {
                id: "2PE",
                name: "2 Peter",
                chapters: 3
            },
            {
                id: "1JN",
                name: "1 John",
                chapters: 5
            },
            {
                id: "2JN",
                name: "2 John",
                chapters: 1
            },
            {
                id: "3JN",
                name: "3 John",
                chapters: 1
            },
            {
                id: "JUD",
                name: "Jude",
                chapters: 1
            },
            {
                id: "REV",
                name: "Revelation",
                chapters: 22
            }
        ],
        findById = function (id) {
            var deferred = $.Deferred(),
                bookID = null,
                l = bookIDs.length;
            for (i = 0; i < l; i++) {
                if (bookIDs[i].id === id) {
                    bookID = bookIDs[i];
                    break;
                }
            }
            deferred.resolve(bookID);
            return deferred.promise();
        },

        findByName = function (searchKey) {
            var deferred = $.Deferred();
            var results = bookIDs.filter(function (element) {
                return element.id.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
            deferred.resolve(results);
            return deferred.promise();
        },

        BookID = Backbone.Model.extend({
            defaults: {
                id: "",
                name: "",
                chapters: 0
            },
            sync: function (method, model, options) {
                if (method === "read") {
                    findById(this.id).done(function (data) {
                        options.success(data);
                    });
                }
            }

        }),

        BookIDCollection = Backbone.Collection.extend({

            model: BookID,

            sync: function (method, model, options) {
                if (method === "read") {
                    findByName(options.data.id).done(function (data) {
                        options.success(data);
                    });
                }
            }

        });

    return {
        BookID: BookID,
        BookIDCollection: BookIDCollection
    };

});