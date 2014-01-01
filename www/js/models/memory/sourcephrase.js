/* 
* models / memory / SourcePhrase.js
* in-memory version of the sourcephrase object. Asynchronously returns the
* SourcePhrases for Ruth 1
*/
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),

        findById = function (id) {
            var i = 0,
                deferred = $.Deferred(),
                sourcephrase = null,
                l = sourcephrases.length;
            for (i = 0; i < l; i++) {
                if (sourcephrases[i].id === id) {
                    sourcephrase = sourcephrases[i];
                    break;
                }
            }
            deferred.resolve(sourcephrase);
            return deferred.promise();
        },

        findByName = function (searchKey) {
            var deferred = $.Deferred();
            var results = sourcephrases.filter(function (element) {
                return element.name.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
            deferred.resolve(results);
            return deferred.promise();
        },

        /* WEB Bible text for Ruth chapter 1 from http://ebible.org/web/ from 2008
        */
        sourcephrases = [
            {
                "id": null,
                "markers": "\\id",
                "orig": null,
                "source": "RUT",
                "target": "RUT"
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "08-RUT-web.sfm",
                "target": "08-RUT-web.sfm"
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "World",
                "target": "Amazing"
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "English",
                "target": "American"
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Bible",
                "target": "Bible"
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Tuesday",
                "target": "Friday"
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "19",
                "target": "13"
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "August",
                "target": "December"
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "2008",
                "target": "2013"
            },
// header
            {
                "id": null,
                "markers": "\\hdr",
                "orig": null,
                "source": "Ruth",
                "target": "Ruth"
            },
// title
            {
                "id": null,
                "markers": "\\mt",
                "orig": null,
                "source": "Ruth",
                "target": "Ruth"
            },
// v1
            {
                "id": null,
                "markers": "\\c 1 \\p \\v 1",
                "orig": null,
                "source": "It",
                "target": "It"
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "happened",
                "target": "came about"
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "in",
                "target": "during"
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": "the"
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "days",
                "target": "days"
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "when",
                "target": "when"
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": "the"
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "judges",
                "target": "judges"
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "judged,",
                "target": "judged"
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "that",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "there",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "was",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "a",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "famine",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "in",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "land.",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "A",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "certain",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "man",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Bethlehem",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Judah",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "went",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "live",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "in",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "country",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Moab,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "he,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "his",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "wife,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "his",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "two",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "sons.",
                "target": ""
            },
// v2
            {
                "id": null,
                "markers": "\\v 2",
                "orig": null,
                "source": "The",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "name",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "man",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "was",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Elimelech,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "name",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "his",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "wife",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Naomi,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "name",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "his",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "two",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "sons",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Mahlon",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Chilion,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Ephrathites",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Bethlehem",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Judah.",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "They",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "came",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "into",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "country",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Moab,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "continued",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "there.",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\v 3",
                "orig": null,
                "source": "Elimilech,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Naomi's",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "husband,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "died;",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "she",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "was",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "left,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "her",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "two",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "sons.",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\v 4",
                "orig": null,
                "source": "They",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "took",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "them",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "wives",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "women",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Moab;",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "name",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "one",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "was",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Orpah,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "name",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "other",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Ruth:",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "they",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "lived",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "there",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "about",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "ten",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "years.",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\v 5",
                "orig": null,
                "source": "Mahlon",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Chilion",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "both",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "died,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "woman",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "was",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "bereaved",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "her",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "two",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "children",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "her",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "husband.",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\v 6",
                "orig": null,
                "source": "Then",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "she",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "arose",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "with",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "her",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "daughters-in-law,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "that",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "she",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "might",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "return",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "from",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "country",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Moab;",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "for",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "she",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "had",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "heard",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "in",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "country",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Moab",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "how",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "that",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Yahweh",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\f +",
                "orig": null,
                "source": "\"Yahweh\"",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "is",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "God\'s",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "proper",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Name,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "sometimes",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "rendered",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "\"LORD\"",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "(all",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "caps)",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "in",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "other",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "translations.",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\f*",
                "orig": null,
                "source": "had",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "visited",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "his",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "people",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "in",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "giving",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "them",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "bread.",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\v 7",
                "orig": null,
                "source": "She",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "went",
                "target": ""
            },
            {
                "source": "forth",
                "id": null,
                "markers": null,
                "orig": null,
                "target": ""
            },
            {
                "source": "out",
                "id": null,
                "markers": null,
                "orig": null,
                "target": ""
            },
            {
                "source": "of",
                "id": null,
                "markers": null,
                "orig": null,
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "place",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "where",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "she",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "was,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "her",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "two",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "daughters-in-law",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "with",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "her;",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "they",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "went",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "on",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "way",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "return",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "land",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Judah.",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\v 8",
                "orig": null,
                "source": "Naomi",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "said",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "her",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "two",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "daughters-in-law,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "\"Go,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "return",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "each",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "you",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "her",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "mother\'s",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "house:",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Yahweh",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "deal",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "kindly",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "with",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "you,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "as",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "you",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "have",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "dealt",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "with",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "dead,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "with",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "me.",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\v 9",
                "orig": null,
                "source": "Yahweh",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "grant",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "you",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "that",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "you",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "may",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "find",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "rest,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "each",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "you",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "in",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "house",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "her",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "husband.",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\p",
                "orig": null,
                "source": "Then",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "she",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "kissed",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "them,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "they",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "lifted",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "up",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "their",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "voice,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "wept.",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "house",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "her",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "husband.\"",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\v 10",
                "orig": null,
                "source": "They",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "said",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "her,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "\"No,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "but",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "we",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "will",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "return",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "with",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "you",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "your",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "people.\"",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\p \\v 11",
                "orig": null,
                "source": "Naomi",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "said,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "\"Go",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "back,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "my",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "daughters.",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Why",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "do",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "you",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "want",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "go",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "with",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "me?",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Do",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "I",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "still",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "have",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "sons",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "in",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "my",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "womb,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "that",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "they",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "may",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "be",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "your",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "husbands?",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\v 12",
                "orig": null,
                "source": "Go",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "back,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "go",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "your",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "way;",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "for",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "I",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "am",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "too",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "old",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "have",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "a",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "husband.",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "If",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "I",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "should",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "say,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "\'I",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "have",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "hope,\'",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "if",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "I",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "should",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "even",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "have",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "a",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "husband",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "tonight,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "should",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "also",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "bear",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "sons;",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\v 13",
                "orig": null,
                "source": "would",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "you",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "then",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "wait",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "until",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "they",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "were",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "grown?",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Would",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "you",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "then",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "refrain",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "from",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "having",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "husbands?",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "No,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "my",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "daughters,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "for",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "it",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "grieves",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "me",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "much",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "for",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "your",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "sakes,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "for",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "hand",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Yahweh",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "has",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "gone",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "out",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "against",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "me.\"",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\p \\v 14",
                "orig": null,
                "source": "They",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "lifted",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "up",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "their",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "voice,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "wept",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "again:",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Orpah",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "kissed",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "her",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "mother-in-law,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "but",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Ruth",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "joined",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "with",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "her.",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\v 15",
                "orig": null,
                "source": "She",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "said,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "\"Behold,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "your",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "sister-in-law",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "has",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "gone",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "back",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "her",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "people,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "her",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "god.",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Follow",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "your",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "sister-in-law.\"",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\p \\v 16",
                "orig": null,
                "source": "Ruth",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "said,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "\"Don\'t",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "entreat",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "me",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "leave",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "you,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "return",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "from",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "following",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "after",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "you,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "for",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "where",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "you",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "go,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "I",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "will",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "go;",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "where",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "you",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "lodge,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "I",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "will",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "lodge;",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "your",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "people",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "will",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "be",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "my",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "people,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "your",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "God",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\f +",
                "orig": null,
                "source": "The",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Hebrew",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "word",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "\"God\"",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "is",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "\"Elohim\".",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\f*",
                "orig": null,
                "source": "my",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "God;",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\v 17",
                "orig": null,
                "source": "where",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "you",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "die,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "will",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "I",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "die,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "there",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "will",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "I",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "be",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "buried.",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Yahweh",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "do",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "me,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "more",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "also,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "if",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "anything",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "but",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "death",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "part",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "you",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "me.\"",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\p \\v 18",
                "orig": null,
                "source": "When",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "she",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "saw",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "that",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "she",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "was",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "steadfastly",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "minded",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "go",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "with",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "her,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "she",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "left",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "off",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "speaking",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "her.",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\p \\v 19",
                "orig": null,
                "source": "So",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "they",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "two",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "went",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "until",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "they",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "came",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Bethlehem.",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "It",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Happened,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "when",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "they",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "had",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "come",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Bethlehem,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "that",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "all",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "city",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "was",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "moved",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "about",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "them,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "they",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "asked,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "\"Is",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "this",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Naomi?\"",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\p \\v 20",
                "orig": null,
                "source": "She",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "said",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "them,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "\"Don\'t",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "call",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "me",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Naomi.",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Call",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "me",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Mara;",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "for",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Almighty",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "has",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "dealt",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "very",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "bitterly",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "with",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "me.",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\v 21",
                "orig": null,
                "source": "I",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "went",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "out",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "full,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Yahweh",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "has",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "brought",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "me",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "back",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "empty;",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "why",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "do",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "you",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "call",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "me",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Naomi,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "since",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Yahweh",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "has",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "testified",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "against",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "me,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Almighty",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "has",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "afflicted",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "me?\"",
                "target": ""
            },

            {
                "id": null,
                "markers": "\\v 22",
                "orig": null,
                "source": "So",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Naomi",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "returned,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Ruth",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Moabitess,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "her",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "daughter-in-law,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "with",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "her,",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "who",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "returned",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "out",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "country",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Moab:",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "they",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "came",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "Bethlehem",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "in",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "beginning",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "barley",
                "target": ""
            },
            {
                "id": null,
                "markers": null,
                "orig": null,
                "source": "harvest.",
                "target": ""
            },
// CH 2
            {
                "id": null,
                "markers": "\\c 2 \\p \\v 1",
                "orig": null,
                "source": "Naomi",
                "target": ""
            },
// CH 3
            {
                "id": null,
                "markers": "\\c3 \\p \\v 1",
                "orig": null,
                "source": "Naomi",
                "target": ""
            },
// CH 4
            {
                "id": null,
                "markers": "\\c 4 \\p \\v 1",
                "orig": null,
                "source": "Now",
                "target": ""
            }
        ],

        SourcePhrase = Backbone.Model.extend({

            sync: function (method, model, options) {
                if (method === "read") {
                    findById(this.id).done(function (data) {
                        options.success(data);
                    });
                }
            }

        }),

        SourcePhraseCollection = Backbone.Collection.extend({

            model: SourcePhrase,

            sync: function (method, model, options) {
                if (method === "read") {
                    findByName(options.data.name).done(function (data) {
                        options.success(data);
                    });
                }
            }

        });

    return {
        SourcePhrase: SourcePhrase,
        SourcePhraseCollection: SourcePhraseCollection
    };

});