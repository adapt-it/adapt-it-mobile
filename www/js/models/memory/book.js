define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),

        findById = function (id) {
            var deferred = $.Deferred(),
                book = null,
                l = books.length;
            for (var i = 0; i < l; i++) {
                if (books[i].id === id) {
                    book = books[i];
                    break;
                }
            }
            deferred.resolve(book);
            return deferred.promise();
        },

        findByName = function (searchKey) {
            var deferred = $.Deferred();
            var results = books.filter(function (element) {
                return element.name.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
            deferred.resolve(results);
            return deferred.promise();
        },

        /* OT/NT books, not counting apocrypha
        */
        books = [
            {   "id": "GEN",
                "name": "Genesis"
            },
            {   "id": "EXO",
                "name": "Exodus"
            },
            {   "id": "LEV",
                "name": "Leviticus"
            },
            {   "id": "NUM",
                "name": "Numbers"
            },
            {   "id": "DEU",
                "name": "Deuteronomy"
            },
            {   "id": "JOS",
                "name": "Joshua"
            },
            {   "id": "JDG",
                "name": "Judges"
            },
            {   "id": "RUT",
                "name": "Ruth"
            },
            {   "id": "1SA",
                "name": "1 Samuel"
            },
            {   "id": "2SA",
                "name": "2 Samuel"
            },
            {   "id": "1KI",
                "name": "1 Kings"
            },
            {   "id": "2KI",
                "name": "2 Kings"
            },
            {   "id": "1CH",
                "name": "1 Chronicles"
            },
            {   "id": "2CH",
                "name": "2 Chronicles"
            },
            {   "id": "EZR",
                "name": "Ezra"
            },
            {   "id": "NEH",
                "name": "Nehemiah"
            },
            {   "id": "EST",
                "name": "Esther"
            },
            {   "id": "JOB",
                "name": "Job"
            },
            {   "id": "PSA",
                "name": "Psalms"
            },
            {   "id": "PRO",
                "name": "Proverbs"
            },
            {   "id": "ECC",
                "name": "Ecclesiastes"
            },
            {   "id": "SNG",
                "name": "Song of Solomon"
            },
            {   "id": "ISA",
                "name": "Isaiah"
            },
            {   "id": "JER",
                "name": "Jeremiah"
            },
            {   "id": "LAM",
                "name": "Lamentations"
            },
            {   "id": "EZK",
                "name": "Ezekiel"
            },
            {   "id": "DAN",
                "name": "Daniel"
            },
            {   "id": "HOS",
                "name": "Hosea"
            },
            {   "id": "JOL",
                "name": "Joel"
            },
            {   "id": "AMO",
                "name": "Amos"
            },
            {   "id": "OBA",
                "name": "Obadiah"
            },
            {   "id": "JON",
                "name": "Jonah"
            },
            {   "id": "MIC",
                "name": "Micah"
            },
            {   "id": "NAM",
                "name": "Nahum"
            },
            {   "id": "HAB",
                "name": "Habakkuk"
            },
            {   "id": "ZEP",
                "name": "Zephaniah"
            },
            {   "id": "HAG",
                "name": "Haggai"
            },
            {   "id": "ZEC",
                "name": "Zechariah"
            },
            {   "id": "MAL",
                "name": "Malachi"
            },
            {   "id": "MAT",
                "name": "Matthew"
            },
            {   "id": "MRK",
                "name": "Mark"
            },
            {   "id": "LUK",
                "name": "Luke"
            },
            {   "id": "JHN",
                "name": "John"
            },
            {   "id": "ACT",
                "name": "Acts"
            },
            {   "id": "ROM",
                "name": "Romans"
            },
            {   "id": "1CO",
                "name": "1 Corinthians"
            },
            {   "id": "2CO",
                "name": "2 Corinthians"
            },
            {   "id": "GAL",
                "name": "Galatians"
            },
            {   "id": "EPH",
                "name": "Ephesians"
            },
            {   "id": "PHP",
                "name": "Philippians"
            },
            {   "id": "COL",
                "name": "Colossians"
            },
            {   "id": "1TH",
                "name": "1 Thessalonians"
            },
            {   "id": "2TH",
                "name": "2 Thessalonians"
            },
            {   "id": "1TI",
                "name": "1 Timothy"
            },
            {   "id": "2TI",
                "name": "2 Timothy"
            },
            {   "id": "TIT",
                "name": "Titus"
            },
            {   "id": "PHM",
                "name": "Philemon"
            },
            {   "id": "HEB",
                "name": "Hebrews"
            },
            {   "id": "JAS",
                "name": "James"
            },
            {   "id": "1PE",
                "name": "1 Peter"
            },
            {   "id": "2PE",
                "name": "2 Peter"
            },
            {   "id": "1JN",
                "name": "1 John"
            },
            {   "id": "2JN",
                "name": "2 John"
            },
            {   "id": "3JN",
                "name": "3 John"
            },
            {   "id": "JUD",
                "name": "Jude"
            },
            {   "id": "REV",
                "name": "Revelation"
            }
        ],

        Book = Backbone.Model.extend({

            sync: function (method, model, options) {
                if (method === "read") {
                    findById(this.id).done(function (data) {
                        options.success(data);
                    });
                }
            }

        }),

        BookCollection = Backbone.Collection.extend({

            model: Book,

            sync: function (method, model, options) {
                if (method === "read") {
                    findByName(options.data.name).done(function (data) {
                        options.success(data);
                    });
                }
            }

        });

    return {
        Book: Book,
        BookCollection: BookCollection
    };

});