define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),

        findById = function (id) {
            var deferred = $.Deferred(),
                chapter = null,
                l = chapters.length;
            for (var i = 0; i < l; i++) {
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

        /* WEB Bible text from http://ebible.org/web/ 
        */
        chapters = [
            {   "id": 1,
                "name": "Ruth 1",
                "lastAdapted": 2,
                "verseCount": 22,
                "strips": [
                    {
                        "id": 0.0,
                        "markers": "\\id",
                        "piles": [
                            {
                                "source": "RUT",
                                "target": "RUT"
                            },
                            {
                                "source": "08-RUT-web.sfm",
                                "target": "08-RUT-web.sfm"
                            },
                            {
                                "source": "World",
                                "target": "Amazing"
                            },
                            {
                                "source": "English",
                                "target": "American"
                            },
                            {
                                "source": "Bible",
                                "target": "Bible"
                            },
                            {
                                "source": "Tuesday",
                                "target": "Friday"
                            },
                            {
                                "source": "19",
                                "target": "13"
                            },
                            {
                                "source": "August",
                                "target": "December"
                            },
                            {
                                "source": "2008",
                                "target": "2013"
                            }
                        ]
                    },
                    {
                        "id": 0.1,
                        "markers": "\\hdr",
                        "piles": [
                            {
                                "source": "Ruth",
                                "target": "Ruth"
                            }
                        ]
                    },
                    {
                        "id": 0.2,
                        "markers": "\\mt",
                        "piles": [
                            {
                                "source": "Ruth",
                                "target": "Ruth"
                            }
                        ]
                    },
                    {
                        "id": 1,
                        "markers": "\\c 1 \\p \\v 1",
                        "piles": [
                            {
                                "source": "It",
                                "target": "It"
                            },
                            {
                                "source": "happened",
                                "target": "came about"
                            },
                            {
                                "source": "in",
                                "target": "during"
                            },
                            {
                                "source": "the",
                                "target": "the"
                            },
                            {
                                "source": "days",
                                "target": "days"
                            },
                            {
                                "source": "when",
                                "target": "when"
                            },
                            {
                                "source": "the",
                                "target": "the"
                            },
                            {
                                "source": "judges",
                                "target": "judges"
                            },
                            {
                                "source": "judged,",
                                "target": "judged"
                            },
                            {
                                "source": "that",
                                "target": ""
                            },
                            {
                                "source": "there",
                                "target": ""
                            },
                            {
                                "source": "was",
                                "target": ""
                            },
                            {
                                "source": "a",
                                "target": ""
                            },
                            {
                                "source": "famine",
                                "target": ""
                            },
                            {
                                "source": "in",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "land.",
                                "target": ""
                            },
                            {
                                "source": "A",
                                "target": ""
                            },
                            {
                                "source": "certain",
                                "target": ""
                            },
                            {
                                "source": "man",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "Bethlehem",
                                "target": ""
                            },
                            {
                                "source": "Judah",
                                "target": ""
                            },
                            {
                                "source": "went",
                                "target": ""
                            },
                            {
                                "source": "to",
                                "target": ""
                            },
                            {
                                "source": "live",
                                "target": ""
                            },
                            {
                                "source": "in",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "country",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "Moab,",
                                "target": ""
                            },
                            {
                                "source": "he,",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "his",
                                "target": ""
                            },
                            {
                                "source": "wife,",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "his",
                                "target": ""
                            },
                            {
                                "source": "two",
                                "target": ""
                            },
                            {
                                "source": "sons.",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 2,
                        "markers": "\\v 2",
                        "piles": [
                            {
                                "source": "The",
                                "target": ""
                            },
                            {
                                "source": "name",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "man",
                                "target": ""
                            },
                            {
                                "source": "was",
                                "target": ""
                            },
                            {
                                "source": "Elimelech,",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "name",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "his",
                                "target": ""
                            },
                            {
                                "source": "wife",
                                "target": ""
                            },
                            {
                                "source": "Naomi,",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "name",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "his",
                                "target": ""
                            },
                            {
                                "source": "two",
                                "target": ""
                            },
                            {
                                "source": "sons",
                                "target": ""
                            },
                            {
                                "source": "Mahlon",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "Chilion,",
                                "target": ""
                            },
                            {
                                "source": "Ephrathites",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "Bethlehem",
                                "target": ""
                            },
                            {
                                "source": "Judah.",
                                "target": ""
                            },
                            {
                                "source": "They",
                                "target": ""
                            },
                            {
                                "source": "came",
                                "target": ""
                            },
                            {
                                "source": "into",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "country",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "Moab,",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "continued",
                                "target": ""
                            },
                            {
                                "source": "there.",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 3,
                        "markers": "\\v 3",
                        "piles": [
                            {
                                "source": "Elimilech,",
                                "target": ""
                            },
                            {
                                "source": "Naomi's",
                                "target": ""
                            },
                            {
                                "source": "husband,",
                                "target": ""
                            },
                            {
                                "source": "died;",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "she",
                                "target": ""
                            },
                            {
                                "source": "was",
                                "target": ""
                            },
                            {
                                "source": "left,",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "her",
                                "target": ""
                            },
                            {
                                "source": "two",
                                "target": ""
                            },
                            {
                                "source": "sons.",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 4,
                        "markers": "\\v 4",
                        "piles": [
                            {
                                "source": "They",
                                "target": ""
                            },
                            {
                                "source": "took",
                                "target": ""
                            },
                            {
                                "source": "them",
                                "target": ""
                            },
                            {
                                "source": "wives",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "women",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "Moab;",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "name",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "one",
                                "target": ""
                            },
                            {
                                "source": "was",
                                "target": ""
                            },
                            {
                                "source": "Orpah,",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "name",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "other",
                                "target": ""
                            },
                            {
                                "source": "Ruth:",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "they",
                                "target": ""
                            },
                            {
                                "source": "lived",
                                "target": ""
                            },
                            {
                                "source": "there",
                                "target": ""
                            },
                            {
                                "source": "about",
                                "target": ""
                            },
                            {
                                "source": "ten",
                                "target": ""
                            },
                            {
                                "source": "years.",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 5,
                        "markers": "\\v 5",
                        "piles": [
                            {
                                "source": "Mahlon",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "Chilion",
                                "target": ""
                            },
                            {
                                "source": "both",
                                "target": ""
                            },
                            {
                                "source": "died,",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "woman",
                                "target": ""
                            },
                            {
                                "source": "was",
                                "target": ""
                            },
                            {
                                "source": "bereaved",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "her",
                                "target": ""
                            },
                            {
                                "source": "two",
                                "target": ""
                            },
                            {
                                "source": "children",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "her",
                                "target": ""
                            },
                            {
                                "source": "husband.",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 6,
                        "markers": "\\v 6",
                        "piles": [
                            {
                                "source": "Then",
                                "target": ""
                            },
                            {
                                "source": "she",
                                "target": ""
                            },
                            {
                                "source": "arose",
                                "target": ""
                            },
                            {
                                "source": "with",
                                "target": ""
                            },
                            {
                                "source": "her",
                                "target": ""
                            },
                            {
                                "source": "daughters-in-law,",
                                "target": ""
                            },
                            {
                                "source": "that",
                                "target": ""
                            },
                            {
                                "source": "she",
                                "target": ""
                            },
                            {
                                "source": "might",
                                "target": ""
                            },
                            {
                                "source": "return",
                                "target": ""
                            },
                            {
                                "source": "from",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "country",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "Moab;",
                                "target": ""
                            },
                            {
                                "source": "for",
                                "target": ""
                            },
                            {
                                "source": "she",
                                "target": ""
                            },
                            {
                                "source": "had",
                                "target": ""
                            },
                            {
                                "source": "heard",
                                "target": ""
                            },
                            {
                                "source": "in",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "country",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "Moab",
                                "target": ""
                            },
                            {
                                "source": "how",
                                "target": ""
                            },
                            {
                                "source": "that",
                                "target": ""
                            },
                            {
                                "source": "Yahweh",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 6.0,
                        "markers": "\\f +",
                        "piles": [
                            {
                                "source": "\"Yahweh\"",
                                "target": ""
                            },
                            {
                                "source": "is",
                                "target": ""
                            },
                            {
                                "source": "God\'s",
                                "target": ""
                            },
                            {
                                "source": "proper",
                                "target": ""
                            },
                            {
                                "source": "Name,",
                                "target": ""
                            },
                            {
                                "source": "sometimes",
                                "target": ""
                            },
                            {
                                "source": "rendered",
                                "target": ""
                            },
                            {
                                "source": "\"LORD\"",
                                "target": ""
                            },
                            {
                                "source": "(all",
                                "target": ""
                            },
                            {
                                "source": "caps)",
                                "target": ""
                            },
                            {
                                "source": "in",
                                "target": ""
                            },
                            {
                                "source": "other",
                                "target": ""
                            },
                            {
                                "source": "translations.",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 6.1,
                        "markers": "\\f*",
                        "piles": [
                            {
                                "source": "had",
                                "target": ""
                            },
                            {
                                "source": "visited",
                                "target": ""
                            },
                            {
                                "source": "his",
                                "target": ""
                            },
                            {
                                "source": "people",
                                "target": ""
                            },
                            {
                                "source": "in",
                                "target": ""
                            },
                            {
                                "source": "giving",
                                "target": ""
                            },
                            {
                                "source": "them",
                                "target": ""
                            },
                            {
                                "source": "bread.",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 7,
                        "markers": "\\v 7",
                        "piles": [
                            {
                                "source": "She",
                                "target": ""
                            },
                            {
                                "source": "went",
                                "target": ""
                            },
                            {
                                "source": "forth",
                                "target": ""
                            },
                            {
                                "source": "out",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "place",
                                "target": ""
                            },
                            {
                                "source": "where",
                                "target": ""
                            },
                            {
                                "source": "she",
                                "target": ""
                            },
                            {
                                "source": "was,",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "her",
                                "target": ""
                            },
                            {
                                "source": "two",
                                "target": ""
                            },
                            {
                                "source": "daughters-in-law",
                                "target": ""
                            },
                            {
                                "source": "with",
                                "target": ""
                            },
                            {
                                "source": "her;",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "they",
                                "target": ""
                            },
                            {
                                "source": "went",
                                "target": ""
                            },
                            {
                                "source": "on",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "way",
                                "target": ""
                            },
                            {
                                "source": "to",
                                "target": ""
                            },
                            {
                                "source": "return",
                                "target": ""
                            },
                            {
                                "source": "to",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "land",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "Judah.",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 8,
                        "markers": "\\v 8",
                        "piles": [
                            {
                                "source": "Naomi",
                                "target": ""
                            },
                            {
                                "source": "said",
                                "target": ""
                            },
                            {
                                "source": "to",
                                "target": ""
                            },
                            {
                                "source": "her",
                                "target": ""
                            },
                            {
                                "source": "two",
                                "target": ""
                            },
                            {
                                "source": "daughters-in-law,",
                                "target": ""
                            },
                            {
                                "source": "\"Go,",
                                "target": ""
                            },
                            {
                                "source": "return",
                                "target": ""
                            },
                            {
                                "source": "each",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "you",
                                "target": ""
                            },
                            {
                                "source": "to",
                                "target": ""
                            },
                            {
                                "source": "her",
                                "target": ""
                            },
                            {
                                "source": "mother\'s",
                                "target": ""
                            },
                            {
                                "source": "house:",
                                "target": ""
                            },
                            {
                                "source": "Yahweh",
                                "target": ""
                            },
                            {
                                "source": "deal",
                                "target": ""
                            },
                            {
                                "source": "kindly",
                                "target": ""
                            },
                            {
                                "source": "with",
                                "target": ""
                            },
                            {
                                "source": "you,",
                                "target": ""
                            },
                            {
                                "source": "as",
                                "target": ""
                            },
                            {
                                "source": "you",
                                "target": ""
                            },
                            {
                                "source": "have",
                                "target": ""
                            },
                            {
                                "source": "dealt",
                                "target": ""
                            },
                            {
                                "source": "with",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "dead,",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "with",
                                "target": ""
                            },
                            {
                                "source": "me.",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 9,
                        "markers": "\\v 9",
                        "piles": [
                            {
                                "source": "Yahweh",
                                "target": ""
                            },
                            {
                                "source": "grant",
                                "target": ""
                            },
                            {
                                "source": "you",
                                "target": ""
                            },
                            {
                                "source": "that",
                                "target": ""
                            },
                            {
                                "source": "you",
                                "target": ""
                            },
                            {
                                "source": "may",
                                "target": ""
                            },
                            {
                                "source": "find",
                                "target": ""
                            },
                            {
                                "source": "rest,",
                                "target": ""
                            },
                            {
                                "source": "each",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "you",
                                "target": ""
                            },
                            {
                                "source": "in",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "house",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "her",
                                "target": ""
                            },
                            {
                                "source": "husband.",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 9.0,
                        "markers": "\\p",
                        "piles": [
                            {
                                "source": "Then",
                                "target": ""
                            },
                            {
                                "source": "she",
                                "target": ""
                            },
                            {
                                "source": "kissed",
                                "target": ""
                            },
                            {
                                "source": "them,",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "they",
                                "target": ""
                            },
                            {
                                "source": "lifted",
                                "target": ""
                            },
                            {
                                "source": "up",
                                "target": ""
                            },
                            {
                                "source": "their",
                                "target": ""
                            },
                            {
                                "source": "voice,",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "wept.",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "house",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "her",
                                "target": ""
                            },
                            {
                                "source": "husband.\"",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 10,
                        "markers": "\\v 10",
                        "piles": [
                            {
                                "source": "They",
                                "target": ""
                            },
                            {
                                "source": "said",
                                "target": ""
                            },
                            {
                                "source": "to",
                                "target": ""
                            },
                            {
                                "source": "her,",
                                "target": ""
                            },
                            {
                                "source": "\"No,",
                                "target": ""
                            },
                            {
                                "source": "but",
                                "target": ""
                            },
                            {
                                "source": "we",
                                "target": ""
                            },
                            {
                                "source": "will",
                                "target": ""
                            },
                            {
                                "source": "return",
                                "target": ""
                            },
                            {
                                "source": "with",
                                "target": ""
                            },
                            {
                                "source": "you",
                                "target": ""
                            },
                            {
                                "source": "to",
                                "target": ""
                            },
                            {
                                "source": "your",
                                "target": ""
                            },
                            {
                                "source": "people.\"",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 11,
                        "markers": "\\p \\v 11",
                        "piles": [
                            {
                                "source": "Naomi",
                                "target": ""
                            },
                            {
                                "source": "said,",
                                "target": ""
                            },
                            {
                                "source": "\"Go",
                                "target": ""
                            },
                            {
                                "source": "back,",
                                "target": ""
                            },
                            {
                                "source": "my",
                                "target": ""
                            },
                            {
                                "source": "daughters.",
                                "target": ""
                            },
                            {
                                "source": "Why",
                                "target": ""
                            },
                            {
                                "source": "do",
                                "target": ""
                            },
                            {
                                "source": "you",
                                "target": ""
                            },
                            {
                                "source": "want",
                                "target": ""
                            },
                            {
                                "source": "to",
                                "target": ""
                            },
                            {
                                "source": "go",
                                "target": ""
                            },
                            {
                                "source": "with",
                                "target": ""
                            },
                            {
                                "source": "me?",
                                "target": ""
                            },
                            {
                                "source": "Do",
                                "target": ""
                            },
                            {
                                "source": "I",
                                "target": ""
                            },
                            {
                                "source": "still",
                                "target": ""
                            },
                            {
                                "source": "have",
                                "target": ""
                            },
                            {
                                "source": "sons",
                                "target": ""
                            },
                            {
                                "source": "in",
                                "target": ""
                            },
                            {
                                "source": "my",
                                "target": ""
                            },
                            {
                                "source": "womb,",
                                "target": ""
                            },
                            {
                                "source": "that",
                                "target": ""
                            },
                            {
                                "source": "they",
                                "target": ""
                            },
                            {
                                "source": "may",
                                "target": ""
                            },
                            {
                                "source": "be",
                                "target": ""
                            },
                            {
                                "source": "your",
                                "target": ""
                            },
                            {
                                "source": "husbands?",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 12,
                        "markers": "\\v 12",
                        "piles": [
                            {
                                "source": "Go",
                                "target": ""
                            },
                            {
                                "source": "back,",
                                "target": ""
                            },
                            {
                                "source": "go",
                                "target": ""
                            },
                            {
                                "source": "your",
                                "target": ""
                            },
                            {
                                "source": "way;",
                                "target": ""
                            },
                            {
                                "source": "for",
                                "target": ""
                            },
                            {
                                "source": "I",
                                "target": ""
                            },
                            {
                                "source": "am",
                                "target": ""
                            },
                            {
                                "source": "too",
                                "target": ""
                            },
                            {
                                "source": "old",
                                "target": ""
                            },
                            {
                                "source": "to",
                                "target": ""
                            },
                            {
                                "source": "have",
                                "target": ""
                            },
                            {
                                "source": "a",
                                "target": ""
                            },
                            {
                                "source": "husband.",
                                "target": ""
                            },
                            {
                                "source": "If",
                                "target": ""
                            },
                            {
                                "source": "I",
                                "target": ""
                            },
                            {
                                "source": "should",
                                "target": ""
                            },
                            {
                                "source": "say,",
                                "target": ""
                            },
                            {
                                "source": "\'I",
                                "target": ""
                            },
                            {
                                "source": "have",
                                "target": ""
                            },
                            {
                                "source": "hope,\'",
                                "target": ""
                            },
                            {
                                "source": "if",
                                "target": ""
                            },
                            {
                                "source": "I",
                                "target": ""
                            },
                            {
                                "source": "should",
                                "target": ""
                            },
                            {
                                "source": "even",
                                "target": ""
                            },
                            {
                                "source": "have",
                                "target": ""
                            },
                            {
                                "source": "a",
                                "target": ""
                            },
                            {
                                "source": "husband",
                                "target": ""
                            },
                            {
                                "source": "tonight,",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "should",
                                "target": ""
                            },
                            {
                                "source": "also",
                                "target": ""
                            },
                            {
                                "source": "bear",
                                "target": ""
                            },
                            {
                                "source": "sons;",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 13,
                        "markers": "\\v 13",
                        "piles": [
                            {
                                "source": "would",
                                "target": ""
                            },
                            {
                                "source": "you",
                                "target": ""
                            },
                            {
                                "source": "then",
                                "target": ""
                            },
                            {
                                "source": "wait",
                                "target": ""
                            },
                            {
                                "source": "until",
                                "target": ""
                            },
                            {
                                "source": "they",
                                "target": ""
                            },
                            {
                                "source": "were",
                                "target": ""
                            },
                            {
                                "source": "grown?",
                                "target": ""
                            },
                            {
                                "source": "Would",
                                "target": ""
                            },
                            {
                                "source": "you",
                                "target": ""
                            },
                            {
                                "source": "then",
                                "target": ""
                            },
                            {
                                "source": "refrain",
                                "target": ""
                            },
                            {
                                "source": "from",
                                "target": ""
                            },
                            {
                                "source": "having",
                                "target": ""
                            },
                            {
                                "source": "husbands?",
                                "target": ""
                            },
                            {
                                "source": "No,",
                                "target": ""
                            },
                            {
                                "source": "my",
                                "target": ""
                            },
                            {
                                "source": "daughters,",
                                "target": ""
                            },
                            {
                                "source": "for",
                                "target": ""
                            },
                            {
                                "source": "it",
                                "target": ""
                            },
                            {
                                "source": "grieves",
                                "target": ""
                            },
                            {
                                "source": "me",
                                "target": ""
                            },
                            {
                                "source": "much",
                                "target": ""
                            },
                            {
                                "source": "for",
                                "target": ""
                            },
                            {
                                "source": "your",
                                "target": ""
                            },
                            {
                                "source": "sakes,",
                                "target": ""
                            },
                            {
                                "source": "for",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "hand",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "Yahweh",
                                "target": ""
                            },
                            {
                                "source": "has",
                                "target": ""
                            },
                            {
                                "source": "gone",
                                "target": ""
                            },
                            {
                                "source": "out",
                                "target": ""
                            },
                            {
                                "source": "against",
                                "target": ""
                            },
                            {
                                "source": "me.\"",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 14,
                        "markers": "\\p \\v 14",
                        "piles": [
                            {
                                "source": "They",
                                "target": ""
                            },
                            {
                                "source": "lifted",
                                "target": ""
                            },
                            {
                                "source": "up",
                                "target": ""
                            },
                            {
                                "source": "their",
                                "target": ""
                            },
                            {
                                "source": "voice,",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "wept",
                                "target": ""
                            },
                            {
                                "source": "again:",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "Orpah",
                                "target": ""
                            },
                            {
                                "source": "kissed",
                                "target": ""
                            },
                            {
                                "source": "her",
                                "target": ""
                            },
                            {
                                "source": "mother-in-law,",
                                "target": ""
                            },
                            {
                                "source": "but",
                                "target": ""
                            },
                            {
                                "source": "Ruth",
                                "target": ""
                            },
                            {
                                "source": "joined",
                                "target": ""
                            },
                            {
                                "source": "with",
                                "target": ""
                            },
                            {
                                "source": "her.",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 15,
                        "markers": "\\v 15",
                        "piles": [
                            {
                                "source": "She",
                                "target": ""
                            },
                            {
                                "source": "said,",
                                "target": ""
                            },
                            {
                                "source": "\"Behold,",
                                "target": ""
                            },
                            {
                                "source": "your",
                                "target": ""
                            },
                            {
                                "source": "sister-in-law",
                                "target": ""
                            },
                            {
                                "source": "has",
                                "target": ""
                            },
                            {
                                "source": "gone",
                                "target": ""
                            },
                            {
                                "source": "back",
                                "target": ""
                            },
                            {
                                "source": "to",
                                "target": ""
                            },
                            {
                                "source": "her",
                                "target": ""
                            },
                            {
                                "source": "people,",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "to",
                                "target": ""
                            },
                            {
                                "source": "her",
                                "target": ""
                            },
                            {
                                "source": "god.",
                                "target": ""
                            },
                            {
                                "source": "Follow",
                                "target": ""
                            },
                            {
                                "source": "your",
                                "target": ""
                            },
                            {
                                "source": "sister-in-law.\"",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 16,
                        "markers": "\\p \\v 16",
                        "piles": [
                            {
                                "source": "Ruth",
                                "target": ""
                            },
                            {
                                "source": "said,",
                                "target": ""
                            },
                            {
                                "source": "\"Don\'t",
                                "target": ""
                            },
                            {
                                "source": "entreat",
                                "target": ""
                            },
                            {
                                "source": "me",
                                "target": ""
                            },
                            {
                                "source": "to",
                                "target": ""
                            },
                            {
                                "source": "leave",
                                "target": ""
                            },
                            {
                                "source": "you,",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "to",
                                "target": ""
                            },
                            {
                                "source": "return",
                                "target": ""
                            },
                            {
                                "source": "from",
                                "target": ""
                            },
                            {
                                "source": "following",
                                "target": ""
                            },
                            {
                                "source": "after",
                                "target": ""
                            },
                            {
                                "source": "you,",
                                "target": ""
                            },
                            {
                                "source": "for",
                                "target": ""
                            },
                            {
                                "source": "where",
                                "target": ""
                            },
                            {
                                "source": "you",
                                "target": ""
                            },
                            {
                                "source": "go,",
                                "target": ""
                            },
                            {
                                "source": "I",
                                "target": ""
                            },
                            {
                                "source": "will",
                                "target": ""
                            },
                            {
                                "source": "go;",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "where",
                                "target": ""
                            },
                            {
                                "source": "you",
                                "target": ""
                            },
                            {
                                "source": "lodge,",
                                "target": ""
                            },
                            {
                                "source": "I",
                                "target": ""
                            },
                            {
                                "source": "will",
                                "target": ""
                            },
                            {
                                "source": "lodge;",
                                "target": ""
                            },
                            {
                                "source": "your",
                                "target": ""
                            },
                            {
                                "source": "people",
                                "target": ""
                            },
                            {
                                "source": "will",
                                "target": ""
                            },
                            {
                                "source": "be",
                                "target": ""
                            },
                            {
                                "source": "my",
                                "target": ""
                            },
                            {
                                "source": "people,",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "your",
                                "target": ""
                            },
                            {
                                "source": "God",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 16.0,
                        "markers": "\\f +",
                        "piles": [
                            {
                                "source": "The",
                                "target": ""
                            },
                            {
                                "source": "Hebrew",
                                "target": ""
                            },
                            {
                                "source": "word",
                                "target": ""
                            },
                            {
                                "source": "\"God\"",
                                "target": ""
                            },
                            {
                                "source": "is",
                                "target": ""
                            },
                            {
                                "source": "\"Elohim\".",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 16.1,
                        "markers": "\\f*",
                        "piles": [
                            {
                                "source": "my",
                                "target": ""
                            },
                            {
                                "source": "God;",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 17,
                        "markers": "\\v 17",
                        "piles": [
                            {
                                "source": "where",
                                "target": ""
                            },
                            {
                                "source": "you",
                                "target": ""
                            },
                            {
                                "source": "die,",
                                "target": ""
                            },
                            {
                                "source": "will",
                                "target": ""
                            },
                            {
                                "source": "I",
                                "target": ""
                            },
                            {
                                "source": "die,",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "there",
                                "target": ""
                            },
                            {
                                "source": "will",
                                "target": ""
                            },
                            {
                                "source": "I",
                                "target": ""
                            },
                            {
                                "source": "be",
                                "target": ""
                            },
                            {
                                "source": "buried.",
                                "target": ""
                            },
                            {
                                "source": "Yahweh",
                                "target": ""
                            },
                            {
                                "source": "do",
                                "target": ""
                            },
                            {
                                "source": "to",
                                "target": ""
                            },
                            {
                                "source": "me,",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "more",
                                "target": ""
                            },
                            {
                                "source": "also,",
                                "target": ""
                            },
                            {
                                "source": "if",
                                "target": ""
                            },
                            {
                                "source": "anything",
                                "target": ""
                            },
                            {
                                "source": "but",
                                "target": ""
                            },
                            {
                                "source": "death",
                                "target": ""
                            },
                            {
                                "source": "part",
                                "target": ""
                            },
                            {
                                "source": "you",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "me.\"",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 18,
                        "markers": "\\p \\v 18",
                        "piles": [
                            {
                                "source": "When",
                                "target": ""
                            },
                            {
                                "source": "she",
                                "target": ""
                            },
                            {
                                "source": "saw",
                                "target": ""
                            },
                            {
                                "source": "that",
                                "target": ""
                            },
                            {
                                "source": "she",
                                "target": ""
                            },
                            {
                                "source": "was",
                                "target": ""
                            },
                            {
                                "source": "steadfastly",
                                "target": ""
                            },
                            {
                                "source": "minded",
                                "target": ""
                            },
                            {
                                "source": "to",
                                "target": ""
                            },
                            {
                                "source": "go",
                                "target": ""
                            },
                            {
                                "source": "with",
                                "target": ""
                            },
                            {
                                "source": "her,",
                                "target": ""
                            },
                            {
                                "source": "she",
                                "target": ""
                            },
                            {
                                "source": "left",
                                "target": ""
                            },
                            {
                                "source": "off",
                                "target": ""
                            },
                            {
                                "source": "speaking",
                                "target": ""
                            },
                            {
                                "source": "to",
                                "target": ""
                            },
                            {
                                "source": "her.",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 19,
                        "markers": "\\p \\v 19",
                        "piles": [
                            {
                                "source": "So",
                                "target": ""
                            },
                            {
                                "source": "they",
                                "target": ""
                            },
                            {
                                "source": "two",
                                "target": ""
                            },
                            {
                                "source": "went",
                                "target": ""
                            },
                            {
                                "source": "until",
                                "target": ""
                            },
                            {
                                "source": "they",
                                "target": ""
                            },
                            {
                                "source": "came",
                                "target": ""
                            },
                            {
                                "source": "to",
                                "target": ""
                            },
                            {
                                "source": "Bethlehem.",
                                "target": ""
                            },
                            {
                                "source": "It",
                                "target": ""
                            },
                            {
                                "source": "Happened,",
                                "target": ""
                            },
                            {
                                "source": "when",
                                "target": ""
                            },
                            {
                                "source": "they",
                                "target": ""
                            },
                            {
                                "source": "had",
                                "target": ""
                            },
                            {
                                "source": "come",
                                "target": ""
                            },
                            {
                                "source": "to",
                                "target": ""
                            },
                            {
                                "source": "Bethlehem,",
                                "target": ""
                            },
                            {
                                "source": "that",
                                "target": ""
                            },
                            {
                                "source": "all",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "city",
                                "target": ""
                            },
                            {
                                "source": "was",
                                "target": ""
                            },
                            {
                                "source": "moved",
                                "target": ""
                            },
                            {
                                "source": "about",
                                "target": ""
                            },
                            {
                                "source": "them,",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "they",
                                "target": ""
                            },
                            {
                                "source": "asked,",
                                "target": ""
                            },
                            {
                                "source": "\"Is",
                                "target": ""
                            },
                            {
                                "source": "this",
                                "target": ""
                            },
                            {
                                "source": "Naomi?\"",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 20,
                        "markers": "\\p \\v 20",
                        "piles": [
                            {
                                "source": "She",
                                "target": ""
                            },
                            {
                                "source": "said",
                                "target": ""
                            },
                            {
                                "source": "to",
                                "target": ""
                            },
                            {
                                "source": "them,",
                                "target": ""
                            },
                            {
                                "source": "\"Don\'t",
                                "target": ""
                            },
                            {
                                "source": "call",
                                "target": ""
                            },
                            {
                                "source": "me",
                                "target": ""
                            },
                            {
                                "source": "Naomi.",
                                "target": ""
                            },
                            {
                                "source": "Call",
                                "target": ""
                            },
                            {
                                "source": "me",
                                "target": ""
                            },
                            {
                                "source": "Mara;",
                                "target": ""
                            },
                            {
                                "source": "for",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "Almighty",
                                "target": ""
                            },
                            {
                                "source": "has",
                                "target": ""
                            },
                            {
                                "source": "dealt",
                                "target": ""
                            },
                            {
                                "source": "very",
                                "target": ""
                            },
                            {
                                "source": "bitterly",
                                "target": ""
                            },
                            {
                                "source": "with",
                                "target": ""
                            },
                            {
                                "source": "me.",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 21,
                        "markers": "\\v 21",
                        "piles": [
                            {
                                "source": "I",
                                "target": ""
                            },
                            {
                                "source": "went",
                                "target": ""
                            },
                            {
                                "source": "out",
                                "target": ""
                            },
                            {
                                "source": "full,",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "Yahweh",
                                "target": ""
                            },
                            {
                                "source": "has",
                                "target": ""
                            },
                            {
                                "source": "brought",
                                "target": ""
                            },
                            {
                                "source": "me",
                                "target": ""
                            },
                            {
                                "source": "back",
                                "target": ""
                            },
                            {
                                "source": "empty;",
                                "target": ""
                            },
                            {
                                "source": "why",
                                "target": ""
                            },
                            {
                                "source": "do",
                                "target": ""
                            },
                            {
                                "source": "you",
                                "target": ""
                            },
                            {
                                "source": "call",
                                "target": ""
                            },
                            {
                                "source": "me",
                                "target": ""
                            },
                            {
                                "source": "Naomi,",
                                "target": ""
                            },
                            {
                                "source": "since",
                                "target": ""
                            },
                            {
                                "source": "Yahweh",
                                "target": ""
                            },
                            {
                                "source": "has",
                                "target": ""
                            },
                            {
                                "source": "testified",
                                "target": ""
                            },
                            {
                                "source": "against",
                                "target": ""
                            },
                            {
                                "source": "me,",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "Almighty",
                                "target": ""
                            },
                            {
                                "source": "has",
                                "target": ""
                            },
                            {
                                "source": "afflicted",
                                "target": ""
                            },
                            {
                                "source": "me?\"",
                                "target": ""
                            }
                        ]
                    },
                    {
                        "id": 22,
                        "markers": "\\v 22",
                        "piles": [
                            {
                                "source": "So",
                                "target": ""
                            },
                            {
                                "source": "Naomi",
                                "target": ""
                            },
                            {
                                "source": "returned,",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "Ruth",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "Moabitess,",
                                "target": ""
                            },
                            {
                                "source": "her",
                                "target": ""
                            },
                            {
                                "source": "daughter-in-law,",
                                "target": ""
                            },
                            {
                                "source": "with",
                                "target": ""
                            },
                            {
                                "source": "her,",
                                "target": ""
                            },
                            {
                                "source": "who",
                                "target": ""
                            },
                            {
                                "source": "returned",
                                "target": ""
                            },
                            {
                                "source": "out",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "country",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "Moab:",
                                "target": ""
                            },
                            {
                                "source": "and",
                                "target": ""
                            },
                            {
                                "source": "they",
                                "target": ""
                            },
                            {
                                "source": "came",
                                "target": ""
                            },
                            {
                                "source": "to",
                                "target": ""
                            },
                            {
                                "source": "Bethlehem",
                                "target": ""
                            },
                            {
                                "source": "in",
                                "target": ""
                            },
                            {
                                "source": "the",
                                "target": ""
                            },
                            {
                                "source": "beginning",
                                "target": ""
                            },
                            {
                                "source": "of",
                                "target": ""
                            },
                            {
                                "source": "barley",
                                "target": ""
                            },
                            {
                                "source": "harvest.",
                                "target": ""
                            }
                        ]
                    }
                ]
            },
            {   "id": 2,
                "name": "Ruth 2",
                "lastAdapted": 0,
                "verseCount": 23,
                "strips": [
                    {
                        "id": 1,
                        "markers": "\\v 1",
                        "piles": [
                            {
                                "source": "Naomi",
                                "target": ""
                            }
                        ]
                    }
                ]
            },
            {   "id": 3,
                "name": "Ruth 3",
                "lastAdapted": 0,
                "verseCount": 18,
                "strips": [
                    {
                        "id": 1,
                        "markers": "\\v 1",
                        "piles": [
                            {
                                "source": "Naomi",
                                "target": ""
                            }
                        ]
                    }
                ]
            },
            {   "id": 4,
                "name": "Ruth 4",
                "lastAdapted": 0,
                "verseCount": 22,
                "strips": [
                    {
                        "id": 1,
                        "markers": "\\v 1",
                        "piles": [
                            {
                                "source": "Now",
                                "target": ""
                            }
                        ]
                    }
                ]
            }
        ],

        Chapter = Backbone.Model.extend({

            sync: function (method, model, options) {
                if (method === "read") {
                    findById(parseInt(this.id)).done(function (data) {
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