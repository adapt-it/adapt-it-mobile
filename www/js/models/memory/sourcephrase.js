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
                return element.id.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
            deferred.resolve(results);
            return deferred.promise();
        },

        /* WEB Bible text for Ruth chapter 1 from http://ebible.org/web/ from 2008
        */
        sourcephrases = [
            {
                id: "RUT001-1",
                markers: "\\id",
                orig: null,
                source: "RUT",
                target: "RUT"
            },
            {
                id: "RUT001-2",
                markers: null,
                orig: null,
                source: "08-RUT-web.sfm",
                target: "08-RUT-web.sfm"
            },
            {
                id: "RUT001-3",
                markers: null,
                orig: null,
                source: "World",
                target: "Amazing"
            },
            {
                id: "RUT001-4",
                markers: null,
                orig: null,
                source: "English",
                target: "American"
            },
            {
                id: "RUT001-5",
                markers: null,
                orig: null,
                source: "Bible",
                target: "Bible"
            },
            {
                id: "RUT001-6",
                markers: null,
                orig: null,
                source: "Tuesday",
                target: "Friday"
            },
            {
                id: "RUT001-7",
                markers: null,
                orig: null,
                source: "19",
                target: "13"
            },
            {
                id: "RUT001-8",
                markers: null,
                orig: null,
                source: "August",
                target: "December"
            },
            {
                id: "RUT001-9",
                markers: null,
                orig: null,
                source: "2008",
                target: "2013"
            },
            {
                id: "RUT001-10",
                orig: null,
                markers: "\\hdr",
                source: "Ruth",
                target: "Ruth"
            },
            {
                id: "RUT001-11",
                orig: null,
                markers: "\\mt",
                source: "Ruth",
                target: "Ruth"
            },
            {
                id: "RUT001-12",
                orig: null,
                markers: "\\c 1 \\p \\v 1",
                source: "It",
                target: "It"
            },
            {
                id: "RUT001-13",
                markers: null,
                orig: null,
                source: "happened",
                target: "came about"
            },
            {
                id: "RUT001-14",
                markers: null,
                orig: null,
                source: "in",
                target: "during"
            },
            {
                id: "RUT001-15",
                markers: null,
                orig: null,
                source: "the",
                target: "the"
            },
            {
                id: "RUT001-16",
                markers: null,
                orig: null,
                source: "days",
                target: "days"
            },
            {
                id: "RUT001-17",
                markers: null,
                orig: null,
                source: "when",
                target: "when"
            },
            {
                id: "RUT001-18",
                markers: null,
                orig: null,
                source: "the",
                target: "the"
            },
            {
                id: "RUT001-19",
                markers: null,
                orig: null,
                source: "judges",
                target: "judges"
            },
            {
                id: "RUT001-20",
                markers: null,
                orig: null,
                source: "judged,",
                target: "judged"
            },
            {
                id: "RUT001-21",
                markers: null,
                orig: null,
                source: "that",
                target: "reallyreallyreallyreallyreallyloooooooooonnnnnnngstring"
            },
            {
                id: "RUT001-22",
                markers: null,
                orig: null,
                source: "there",
                target: ""
            },
            {
                id: "RUT001-23",
                markers: null,
                orig: null,
                source: "was",
                target: ""
            },
            {
                id: "RUT001-24",
                markers: null,
                orig: null,
                source: "a",
                target: ""
            },
            {
                id: "RUT001-25",
                markers: null,
                orig: null,
                source: "famine",
                target: ""
            },
            {
                id: "RUT001-26",
                markers: null,
                orig: null,
                source: "in",
                target: ""
            },
            {
                id: "RUT001-27",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-28",
                markers: null,
                orig: null,
                source: "land.",
                target: ""
            },
            {
                id: "RUT001-29",
                markers: null,
                orig: null,
                source: "A",
                target: ""
            },
            {
                id: "RUT001-30",
                markers: null,
                orig: null,
                source: "certain",
                target: ""
            },
            {
                id: "RUT001-31",
                markers: null,
                orig: null,
                source: "man",
                target: ""
            },
            {
                id: "RUT001-32",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT001-34",
                markers: null,
                orig: null,
                source: "Bethlehem",
                target: ""
            },
            {
                id: "RUT001-35",
                markers: null,
                orig: null,
                source: "Judah",
                target: ""
            },
            {
                id: "RUT001-36",
                markers: null,
                orig: null,
                source: "went",
                target: ""
            },
            {
                id: "RUT001-37",
                markers: null,
                orig: null,
                source: "to",
                target: ""
            },
            {
                id: "RUT001-38",
                markers: null,
                orig: null,
                source: "live",
                target: ""
            },
            {
                id: "RUT001-39",
                markers: null,
                orig: null,
                source: "in",
                target: ""
            },
            {
                id: "RUT001-40",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-41",
                markers: null,
                orig: null,
                source: "country",
                target: ""
            },
            {
                id: "RUT001-42",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT001-43",
                markers: null,
                orig: null,
                source: "Moab,",
                target: ""
            },
            {
                id: "RUT001-44",
                markers: null,
                orig: null,
                source: "he,",
                target: ""
            },
            {
                id: "RUT001-45",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-46",
                markers: null,
                orig: null,
                source: "his",
                target: ""
            },
            {
                id: "RUT001-47",
                markers: null,
                orig: null,
                source: "wife,",
                target: ""
            },
            {
                id: "RUT001-48",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-49",
                markers: null,
                orig: null,
                source: "his",
                target: ""
            },
            {
                id: "RUT001-50",
                markers: null,
                orig: null,
                source: "two",
                target: ""
            },
            {
                id: "RUT001-51",
                markers: null,
                orig: null,
                source: "sons.",
                target: ""
            },
            {
                id: "RUT001-52",
                markers: "\\v 2",
                orig: null,
                source: "The",
                target: ""
            },
            {
                id: "RUT001-53",
                markers: null,
                orig: null,
                source: "name",
                target: ""
            },
            {
                id: "RUT001-54",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT001-55",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-56",
                markers: null,
                orig: null,
                source: "man",
                target: ""
            },
            {
                id: "RUT001-57",
                markers: null,
                orig: null,
                source: "was",
                target: ""
            },
            {
                id: "RUT001-58",
                markers: null,
                orig: null,
                source: "Elimelech,",
                target: ""
            },
            {
                id: "RUT001-59",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-60",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-61",
                markers: null,
                orig: null,
                source: "name",
                target: ""
            },
            {
                id: "RUT001-62",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT001-63",
                markers: null,
                orig: null,
                source: "his",
                target: ""
            },
            {
                id: "RUT001-64",
                markers: null,
                orig: null,
                source: "wife",
                target: ""
            },
            {
                id: "RUT001-65",
                markers: null,
                orig: null,
                source: "Naomi,",
                target: ""
            },
            {
                id: "RUT001-66",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-67",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-68",
                markers: null,
                orig: null,
                source: "name",
                target: ""
            },
            {
                id: "RUT001-69",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT001-70",
                markers: null,
                orig: null,
                source: "his",
                target: ""
            },
            {
                id: "RUT001-71",
                markers: null,
                orig: null,
                source: "two",
                target: ""
            },
            {
                id: "RUT001-72",
                markers: null,
                orig: null,
                source: "sons",
                target: ""
            },
            {
                id: "RUT001-73",
                markers: null,
                orig: null,
                source: "Mahlon",
                target: ""
            },
            {
                id: "RUT001-74",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-75",
                markers: null,
                orig: null,
                source: "Chilion,",
                target: ""
            },
            {
                id: "RUT001-76",
                markers: null,
                orig: null,
                source: "Ephrathites",
                target: ""
            },
            {
                id: "RUT001-77",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT001-78",
                markers: null,
                orig: null,
                source: "Bethlehem",
                target: ""
            },
            {
                id: "RUT001-79",
                markers: null,
                orig: null,
                source: "Judah.",
                target: ""
            },
            {
                id: "RUT001-80",
                markers: null,
                orig: null,
                source: "They",
                target: ""
            },
            {
                id: "RUT001-81",
                markers: null,
                orig: null,
                source: "came",
                target: ""
            },
            {
                id: "RUT001-82",
                markers: null,
                orig: null,
                source: "into",
                target: ""
            },
            {
                id: "RUT001-83",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-84",
                markers: null,
                orig: null,
                source: "country",
                target: ""
            },
            {
                id: "RUT001-85",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT001-86",
                markers: null,
                orig: null,
                source: "Moab,",
                target: ""
            },
            {
                id: "RUT001-87",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-88",
                markers: null,
                orig: null,
                source: "continued",
                target: ""
            },
            {
                id: "RUT001-89",
                markers: null,
                orig: null,
                source: "there.",
                target: ""
            },
            {
                id: "RUT001-90",
                markers: "\\v 3",
                orig: null,
                source: "Elimilech,",
                target: ""
            },
            {
                id: "RUT001-91",
                markers: null,
                orig: null,
                source: "Naomi's",
                target: ""
            },
            {
                id: "RUT001-92",
                markers: null,
                orig: null,
                source: "husband,",
                target: ""
            },
            {
                id: "RUT001-93",
                markers: null,
                orig: null,
                source: "died;",
                target: ""
            },
            {
                id: "RUT001-94",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-95",
                markers: null,
                orig: null,
                source: "she",
                target: ""
            },
            {
                id: "RUT001-96",
                markers: null,
                orig: null,
                source: "was",
                target: ""
            },
            {
                id: "RUT001-97",
                markers: null,
                orig: null,
                source: "left,",
                target: ""
            },
            {
                id: "RUT001-98",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-99",
                markers: null,
                orig: null,
                source: "her",
                target: ""
            },
            {
                id: "RUT001-100",
                markers: null,
                orig: null,
                source: "two",
                target: ""
            },
            {
                id: "RUT001-101",
                markers: null,
                orig: null,
                source: "sons.",
                target: ""
            },
            {
                id: "RUT001-102",
                orig: null,
                markers: "\\v 4",
                source: "They",
                target: ""
            },
            {
                id: "RUT001-103",
                markers: null,
                orig: null,
                source: "took",
                target: ""
            },
            {
                id: "RUT001-104",
                markers: null,
                orig: null,
                source: "them",
                target: ""
            },
            {
                id: "RUT001-105",
                markers: null,
                orig: null,
                source: "wives",
                target: ""
            },
            {
                id: "RUT001-106",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT001-107",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-108",
                markers: null,
                orig: null,
                source: "women",
                target: ""
            },
            {
                id: "RUT001-109",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT001-110",
                markers: null,
                orig: null,
                source: "Moab;",
                target: ""
            },
            {
                id: "RUT001-111",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-112",
                markers: null,
                orig: null,
                source: "name",
                target: ""
            },
            {
                id: "RUT001-113",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT001-114",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-115",
                markers: null,
                orig: null,
                source: "one",
                target: ""
            },
            {
                id: "RUT001-116",
                markers: null,
                orig: null,
                source: "was",
                target: ""
            },
            {
                id: "RUT001-117",
                markers: null,
                orig: null,
                source: "Orpah,",
                target: ""
            },
            {
                id: "RUT001-118",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-119",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-120",
                markers: null,
                orig: null,
                source: "name",
                target: ""
            },
            {
                id: "RUT001-121",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT001-122",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-123",
                markers: null,
                orig: null,
                source: "other",
                target: ""
            },
            {
                id: "RUT001-124",
                markers: null,
                orig: null,
                source: "Ruth:",
                target: ""
            },
            {
                id: "RUT001-125",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-126",
                markers: null,
                orig: null,
                source: "they",
                target: ""
            },
            {
                id: "RUT001-127",
                markers: null,
                orig: null,
                source: "lived",
                target: ""
            },
            {
                id: "RUT001-128",
                markers: null,
                orig: null,
                source: "there",
                target: ""
            },
            {
                id: "RUT001-129",
                markers: null,
                orig: null,
                source: "about",
                target: ""
            },
            {
                id: "RUT001-130",
                markers: null,
                orig: null,
                source: "ten",
                target: ""
            },
            {
                id: "RUT001-131",
                markers: null,
                orig: null,
                source: "years.",
                target: ""
            },
            {
                id: "RUT001-132",
                markers: "\\v 5",
                orig: null,
                source: "Mahlon",
                target: ""
            },
            {
                id: "RUT001-133",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-134",
                markers: null,
                orig: null,
                source: "Chilion",
                target: ""
            },
            {
                id: "RUT001-135",
                markers: null,
                orig: null,
                source: "both",
                target: ""
            },
            {
                id: "RUT001-136",
                markers: null,
                orig: null,
                source: "died,",
                target: ""
            },
            {
                id: "RUT001-137",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-138",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-139",
                markers: null,
                orig: null,
                source: "woman",
                target: ""
            },
            {
                id: "RUT001-140",
                markers: null,
                orig: null,
                source: "was",
                target: ""
            },
            {
                id: "RUT001-141",
                markers: null,
                orig: null,
                source: "bereaved",
                target: ""
            },
            {
                id: "RUT001-142",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT001-143",
                markers: null,
                orig: null,
                source: "her",
                target: ""
            },
            {
                id: "RUT001-144",
                markers: null,
                orig: null,
                source: "two",
                target: ""
            },
            {
                id: "RUT001-145",
                markers: null,
                orig: null,
                source: "children",
                target: ""
            },
            {
                id: "RUT001-146",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-147",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT001-148",
                markers: null,
                orig: null,
                source: "her",
                target: ""
            },
            {
                id: "RUT001-149",
                markers: null,
                orig: null,
                source: "husband.",
                target: ""
            },
            {
                id: "RUT001-150",
                markers: "\\v 6",
                orig: null,
                source: "Then",
                target: ""
            },
            {
                id: "RUT001-151",
                markers: null,
                orig: null,
                source: "she",
                target: ""
            },
            {
                id: "RUT001-152",
                markers: null,
                orig: null,
                source: "arose",
                target: ""
            },
            {
                id: "RUT001-153",
                markers: null,
                orig: null,
                source: "with",
                target: ""
            },
            {
                id: "RUT001-154",
                markers: null,
                orig: null,
                source: "her",
                target: ""
            },
            {
                id: "RUT001-155",
                markers: null,
                orig: null,
                source: "daughters-in-law,",
                target: ""
            },
            {
                id: "RUT001-156",
                markers: null,
                orig: null,
                source: "that",
                target: ""
            },
            {
                id: "RUT001-157",
                markers: null,
                orig: null,
                source: "she",
                target: ""
            },
            {
                id: "RUT001-158",
                markers: null,
                orig: null,
                source: "might",
                target: ""
            },
            {
                id: "RUT001-159",
                markers: null,
                orig: null,
                source: "return",
                target: ""
            },
            {
                id: "RUT001-160",
                markers: null,
                orig: null,
                source: "from",
                target: ""
            },
            {
                id: "RUT001-161",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-162",
                markers: null,
                orig: null,
                source: "country",
                target: ""
            },
            {
                id: "RUT001-163",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT001-164",
                markers: null,
                orig: null,
                source: "Moab;",
                target: ""
            },
            {
                id: "RUT001-165",
                markers: null,
                orig: null,
                source: "for",
                target: ""
            },
            {
                id: "RUT001-166",
                markers: null,
                orig: null,
                source: "she",
                target: ""
            },
            {
                id: "RUT001-167",
                markers: null,
                orig: null,
                source: "had",
                target: ""
            },
            {
                id: "RUT001-168",
                markers: null,
                orig: null,
                source: "heard",
                target: ""
            },
            {
                id: "RUT001-169",
                markers: null,
                orig: null,
                source: "in",
                target: ""
            },
            {
                id: "RUT001-170",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-171",
                markers: null,
                orig: null,
                source: "country",
                target: ""
            },
            {
                id: "RUT001-172",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT001-173",
                markers: null,
                orig: null,
                source: "Moab",
                target: ""
            },
            {
                id: "RUT001-174",
                markers: null,
                orig: null,
                source: "how",
                target: ""
            },
            {
                id: "RUT001-175",
                markers: null,
                orig: null,
                source: "that",
                target: ""
            },
            {
                id: "RUT001-176",
                markers: null,
                orig: null,
                source: "Yahweh",
                target: ""
            },
            {
                id: "RUT001-177",
                markers: "\\f +",
                orig: null,
                source: "\"Yahweh\"",
                target: ""
            },
            {
                id: "RUT001-178",
                markers: null,
                orig: null,
                source: "is",
                target: ""
            },
            {
                id: "RUT001-179",
                markers: null,
                orig: null,
                source: "God\'s",
                target: ""
            },
            {
                id: "RUT001-180",
                markers: null,
                orig: null,
                source: "proper",
                target: ""
            },
            {
                id: "RUT001-181",
                markers: null,
                orig: null,
                source: "Name,",
                target: ""
            },
            {
                id: "RUT001-182",
                markers: null,
                orig: null,
                source: "sometimes",
                target: ""
            },
            {
                id: "RUT001-183",
                markers: null,
                orig: null,
                source: "rendered",
                target: ""
            },
            {
                id: "RUT001-184",
                markers: null,
                orig: null,
                source: "\"LORD\"",
                target: ""
            },
            {
                id: "RUT001-185",
                markers: null,
                orig: null,
                source: "(all",
                target: ""
            },
            {
                id: "RUT001-186",
                markers: null,
                orig: null,
                source: "caps)",
                target: ""
            },
            {
                id: "RUT001-187",
                markers: null,
                orig: null,
                source: "in",
                target: ""
            },
            {
                id: "RUT001-188",
                markers: null,
                orig: null,
                source: "other",
                target: ""
            },
            {
                id: "RUT001-189",
                markers: null,
                orig: null,
                source: "translations.",
                target: ""
            },
            {
                id: "RUT001-190",
                orig: null,
                markers: "\\f*",
                source: "had",
                target: ""
            },
            {
                id: "RUT001-191",
                markers: null,
                orig: null,
                source: "visited",
                target: ""
            },
            {
                id: "RUT001-192",
                markers: null,
                orig: null,
                source: "his",
                target: ""
            },
            {
                id: "RUT001-193",
                markers: null,
                orig: null,
                source: "people",
                target: ""
            },
            {
                id: "RUT001-194",
                markers: null,
                orig: null,
                source: "in",
                target: ""
            },
            {
                id: "RUT001-195",
                markers: null,
                orig: null,
                source: "giving",
                target: ""
            },
            {
                id: "RUT001-196",
                markers: null,
                orig: null,
                source: "them",
                target: ""
            },
            {
                id: "RUT001-197",
                markers: null,
                orig: null,
                source: "bread.",
                target: ""
            },
            {
                id: "RUT001-198",
                markers: "\\v 7",
                orig: null,
                source: "She",
                target: ""
            },
            {
                id: "RUT001-199",
                markers: null,
                orig: null,
                source: "went",
                target: ""
            },
            {
                id: "RUT001-200",
                markers: null,
                orig: null,
                source: "forth",
                target: ""
            },
            {
                id: "RUT001-201",
                markers: null,
                orig: null,
                source: "out",
                target: ""
            },
            {
                id: "RUT001-202",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT001-203",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-204",
                markers: null,
                orig: null,
                source: "place",
                target: ""
            },
            {
                id: "RUT001-205",
                markers: null,
                orig: null,
                source: "where",
                target: ""
            },
            {
                id: "RUT001-206",
                markers: null,
                orig: null,
                source: "she",
                target: ""
            },
            {
                id: "RUT001-207",
                markers: null,
                orig: null,
                source: "was,",
                target: ""
            },
            {
                id: "RUT001-208",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-209",
                markers: null,
                orig: null,
                source: "her",
                target: ""
            },
            {
                id: "RUT001-210",
                markers: null,
                orig: null,
                source: "two",
                target: ""
            },
            {
                id: "RUT001-211",
                markers: null,
                orig: null,
                source: "daughters-in-law",
                target: ""
            },
            {
                id: "RUT001-212",
                markers: null,
                orig: null,
                source: "with",
                target: ""
            },
            {
                id: "RUT001-213",
                markers: null,
                orig: null,
                source: "her;",
                target: ""
            },
            {
                id: "RUT001-214",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-215",
                markers: null,
                orig: null,
                source: "they",
                target: ""
            },
            {
                id: "RUT001-216",
                markers: null,
                orig: null,
                source: "went",
                target: ""
            },
            {
                id: "RUT001-217",
                markers: null,
                orig: null,
                source: "on",
                target: ""
            },
            {
                id: "RUT001-218",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-219",
                markers: null,
                orig: null,
                source: "way",
                target: ""
            },
            {
                id: "RUT001-220",
                markers: null,
                orig: null,
                source: "to",
                target: ""
            },
            {
                id: "RUT001-221",
                markers: null,
                orig: null,
                source: "return",
                target: ""
            },
            {
                id: "RUT001-222",
                markers: null,
                orig: null,
                source: "to",
                target: ""
            },
            {
                id: "RUT001-223",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-224",
                markers: null,
                orig: null,
                source: "land",
                target: ""
            },
            {
                id: "RUT001-225",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT001-226",
                markers: null,
                orig: null,
                source: "Judah.",
                target: ""
            },
            {
                id: "RUT001-227",
                markers: "\\v 8",
                orig: null,
                source: "Naomi",
                target: ""
            },
            {
                id: "RUT001-228",
                markers: null,
                orig: null,
                source: "said",
                target: ""
            },
            {
                id: "RUT001-229",
                markers: null,
                orig: null,
                source: "to",
                target: ""
            },
            {
                id: "RUT001-230",
                markers: null,
                orig: null,
                source: "her",
                target: ""
            },
            {
                id: "RUT001-231",
                markers: null,
                orig: null,
                source: "two",
                target: ""
            },
            {
                id: "RUT001-232",
                markers: null,
                orig: null,
                source: "daughters-in-law,",
                target: ""
            },
            {
                id: "RUT001-233",
                markers: null,
                orig: null,
                source: "\"Go,",
                target: ""
            },
            {
                id: "RUT001-234",
                markers: null,
                orig: null,
                source: "return",
                target: ""
            },
            {
                id: "RUT001-235",
                markers: null,
                orig: null,
                source: "each",
                target: ""
            },
            {
                id: "RUT001-236",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT001-237",
                markers: null,
                orig: null,
                source: "you",
                target: ""
            },
            {
                id: "RUT001-238",
                markers: null,
                orig: null,
                source: "to",
                target: ""
            },
            {
                id: "RUT001-239",
                markers: null,
                orig: null,
                source: "her",
                target: ""
            },
            {
                id: "RUT001-240",
                markers: null,
                orig: null,
                source: "mother\'s",
                target: ""
            },
            {
                id: "RUT001-241",
                markers: null,
                orig: null,
                source: "house:",
                target: ""
            },
            {
                id: "RUT001-242",
                markers: null,
                orig: null,
                source: "Yahweh",
                target: ""
            },
            {
                id: "RUT001-243",
                markers: null,
                orig: null,
                source: "deal",
                target: ""
            },
            {
                id: "RUT001-244",
                markers: null,
                orig: null,
                source: "kindly",
                target: ""
            },
            {
                id: "RUT001-245",
                markers: null,
                orig: null,
                source: "with",
                target: ""
            },
            {
                id: "RUT001-246",
                markers: null,
                orig: null,
                source: "you,",
                target: ""
            },
            {
                id: "RUT001-247",
                markers: null,
                orig: null,
                source: "as",
                target: ""
            },
            {
                id: "RUT001-248",
                markers: null,
                orig: null,
                source: "you",
                target: ""
            },
            {
                id: "RUT001-249",
                markers: null,
                orig: null,
                source: "have",
                target: ""
            },
            {
                id: "RUT001-250",
                markers: null,
                orig: null,
                source: "dealt",
                target: ""
            },
            {
                id: "RUT001-251",
                markers: null,
                orig: null,
                source: "with",
                target: ""
            },
            {
                id: "RUT001-252",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-253",
                markers: null,
                orig: null,
                source: "dead,",
                target: ""
            },
            {
                id: "RUT001-254",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-255",
                markers: null,
                orig: null,
                source: "with",
                target: ""
            },
            {
                id: "RUT001-256",
                markers: null,
                orig: null,
                source: "me.",
                target: ""
            },
            {
                id: "RUT001-257",
                markers: "\\v 9",
                orig: null,
                source: "Yahweh",
                target: ""
            },
            {
                id: "RUT001-258",
                markers: null,
                orig: null,
                source: "grant",
                target: ""
            },
            {
                id: "RUT001-259",
                markers: null,
                orig: null,
                source: "you",
                target: ""
            },
            {
                id: "RUT001-260",
                markers: null,
                orig: null,
                source: "that",
                target: ""
            },
            {
                id: "RUT001-261",
                markers: null,
                orig: null,
                source: "you",
                target: ""
            },
            {
                id: "RUT001-262",
                markers: null,
                orig: null,
                source: "may",
                target: ""
            },
            {
                id: "RUT001-263",
                markers: null,
                orig: null,
                source: "find",
                target: ""
            },
            {
                id: "RUT001-264",
                markers: null,
                orig: null,
                source: "rest,",
                target: ""
            },
            {
                id: "RUT001-265",
                markers: null,
                orig: null,
                source: "each",
                target: ""
            },
            {
                id: "RUT001-266",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT001-267",
                markers: null,
                orig: null,
                source: "you",
                target: ""
            },
            {
                id: "RUT001-268",
                markers: null,
                orig: null,
                source: "in",
                target: ""
            },
            {
                id: "RUT001-269",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-270",
                markers: null,
                orig: null,
                source: "house",
                target: ""
            },
            {
                id: "RUT001-271",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT001-272",
                markers: null,
                orig: null,
                source: "her",
                target: ""
            },
            {
                id: "RUT001-273",
                markers: null,
                orig: null,
                source: "husband.",
                target: ""
            },
            {
                id: "RUT001-274",
                markers: "\\p",
                orig: null,
                source: "Then",
                target: ""
            },
            {
                id: "RUT001-275",
                markers: null,
                orig: null,
                source: "she",
                target: ""
            },
            {
                id: "RUT001-276",
                markers: null,
                orig: null,
                source: "kissed",
                target: ""
            },
            {
                id: "RUT001-277",
                markers: null,
                orig: null,
                source: "them,",
                target: ""
            },
            {
                id: "RUT001-278",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-279",
                markers: null,
                orig: null,
                source: "they",
                target: ""
            },
            {
                id: "RUT001-280",
                markers: null,
                orig: null,
                source: "lifted",
                target: ""
            },
            {
                id: "RUT001-281",
                markers: null,
                orig: null,
                source: "up",
                target: ""
            },
            {
                id: "RUT001-282",
                markers: null,
                orig: null,
                source: "their",
                target: ""
            },
            {
                id: "RUT001-283",
                markers: null,
                orig: null,
                source: "voice,",
                target: ""
            },
            {
                id: "RUT001-284",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-285",
                markers: null,
                orig: null,
                source: "wept.",
                target: ""
            },
            {
                id: "RUT001-286",
                markers: "\\v 10",
                orig: null,
                source: "They",
                target: ""
            },
            {
                id: "RUT001-287",
                markers: null,
                orig: null,
                source: "said",
                target: ""
            },
            {
                id: "RUT001-288",
                markers: null,
                orig: null,
                source: "to",
                target: ""
            },
            {
                id: "RUT001-289",
                markers: null,
                orig: null,
                source: "her,",
                target: ""
            },
            {
                id: "RUT001-290",
                markers: null,
                orig: null,
                source: "\"No,",
                target: ""
            },
            {
                id: "RUT001-291",
                markers: null,
                orig: null,
                source: "but",
                target: ""
            },
            {
                id: "RUT001-292",
                markers: null,
                orig: null,
                source: "we",
                target: ""
            },
            {
                id: "RUT001-293",
                markers: null,
                orig: null,
                source: "will",
                target: ""
            },
            {
                id: "RUT001-294",
                markers: null,
                orig: null,
                source: "return",
                target: ""
            },
            {
                id: "RUT001-295",
                markers: null,
                orig: null,
                source: "with",
                target: ""
            },
            {
                id: "RUT001-296",
                markers: null,
                orig: null,
                source: "you",
                target: ""
            },
            {
                id: "RUT001-297",
                markers: null,
                orig: null,
                source: "to",
                target: ""
            },
            {
                id: "RUT001-298",
                markers: null,
                orig: null,
                source: "your",
                target: ""
            },
            {
                id: "RUT001-299",
                markers: null,
                orig: null,
                source: "people.\"",
                target: ""
            },
            {
                id: "RUT001-300",
                markers: "\\p \\v 11",
                orig: null,
                source: "Naomi",
                target: ""
            },
            {
                id: "RUT001-301",
                markers: null,
                orig: null,
                source: "said,",
                target: ""
            },
            {
                id: "RUT001-302",
                "markers": null,
                "orig": null,
                "source": "\"Go",
                "target": ""
            },
            {
                id: "RUT001-303",
                "markers": null,
                "orig": null,
                "source": "back,",
                "target": ""
            },
            {
                id: "RUT001-304",
                "markers": null,
                "orig": null,
                "source": "my",
                "target": ""
            },
            {
                id: "RUT001-305",
                "markers": null,
                "orig": null,
                "source": "daughters.",
                "target": ""
            },
            {
                id: "RUT001-306",
                "markers": null,
                "orig": null,
                "source": "Why",
                "target": ""
            },
            {
                id: "RUT001-307",
                "markers": null,
                "orig": null,
                "source": "do",
                "target": ""
            },
            {
                id: "RUT001-308",
                "markers": null,
                "orig": null,
                "source": "you",
                "target": ""
            },
            {
                id: "RUT001-309",
                "markers": null,
                "orig": null,
                "source": "want",
                "target": ""
            },
            {
                id: "RUT001-310",
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                id: "RUT001-311",
                "markers": null,
                "orig": null,
                "source": "go",
                "target": ""
            },
            {
                id: "RUT001-312",
                "markers": null,
                "orig": null,
                "source": "with",
                "target": ""
            },
            {
                id: "RUT001-313",
                "markers": null,
                "orig": null,
                "source": "me?",
                "target": ""
            },
            {
                id: "RUT001-314",
                "markers": null,
                "orig": null,
                "source": "Do",
                "target": ""
            },
            {
                id: "RUT001-315",
                "markers": null,
                "orig": null,
                "source": "I",
                "target": ""
            },
            {
                id: "RUT001-316",
                "markers": null,
                "orig": null,
                "source": "still",
                "target": ""
            },
            {
                id: "RUT001-317",
                "markers": null,
                "orig": null,
                "source": "have",
                "target": ""
            },
            {
                id: "RUT001-318",
                "markers": null,
                "orig": null,
                "source": "sons",
                "target": ""
            },
            {
                id: "RUT001-319",
                "markers": null,
                "orig": null,
                "source": "in",
                "target": ""
            },
            {
                id: "RUT001-320",
                "markers": null,
                "orig": null,
                "source": "my",
                "target": ""
            },
            {
                id: "RUT001-321",
                "markers": null,
                "orig": null,
                "source": "womb,",
                "target": ""
            },
            {
                id: "RUT001-322",
                "markers": null,
                "orig": null,
                "source": "that",
                "target": ""
            },
            {
                id: "RUT001-323",
                "markers": null,
                "orig": null,
                "source": "they",
                "target": ""
            },
            {
                id: "RUT001-324",
                "markers": null,
                "orig": null,
                "source": "may",
                "target": ""
            },
            {
                id: "RUT001-325",
                "markers": null,
                "orig": null,
                "source": "be",
                "target": ""
            },
            {
                id: "RUT001-326",
                "markers": null,
                "orig": null,
                "source": "your",
                "target": ""
            },
            {
                id: "RUT001-327",
                "markers": null,
                "orig": null,
                "source": "husbands?",
                "target": ""
            },
            {
                id: "RUT001-328",
                "orig": null,
                "markers": "\\v 12",
                "source": "Go",
                "target": ""
            },
            {
                id: "RUT001-329",
                "markers": null,
                "orig": null,
                "source": "back,",
                "target": ""
            },
            {
                id: "RUT001-330",
                "markers": null,
                "orig": null,
                "source": "go",
                "target": ""
            },
            {
                id: "RUT001-331",
                "markers": null,
                "orig": null,
                "source": "your",
                "target": ""
            },
            {
                id: "RUT001-332",
                "markers": null,
                "orig": null,
                "source": "way;",
                "target": ""
            },
            {
                id: "RUT001-333",
                "markers": null,
                "orig": null,
                "source": "for",
                "target": ""
            },
            {
                id: "RUT001-334",
                "markers": null,
                "orig": null,
                "source": "I",
                "target": ""
            },
            {
                id: "RUT001-335",
                "markers": null,
                "orig": null,
                "source": "am",
                "target": ""
            },
            {
                id: "RUT001-336",
                "markers": null,
                "orig": null,
                "source": "too",
                "target": ""
            },
            {
                id: "RUT001-337",
                "markers": null,
                "orig": null,
                "source": "old",
                "target": ""
            },
            {
                id: "RUT001-338",
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                id: "RUT001-339",
                "markers": null,
                "orig": null,
                "source": "have",
                "target": ""
            },
            {
                id: "RUT001-340",
                "markers": null,
                "orig": null,
                "source": "a",
                "target": ""
            },
            {
                id: "RUT001-341",
                "markers": null,
                "orig": null,
                "source": "husband.",
                "target": ""
            },
            {
                id: "RUT001-342",
                "markers": null,
                "orig": null,
                "source": "If",
                "target": ""
            },
            {
                id: "RUT001-343",
                "markers": null,
                "orig": null,
                "source": "I",
                "target": ""
            },
            {
                id: "RUT001-344",
                "markers": null,
                "orig": null,
                "source": "should",
                "target": ""
            },
            {
                id: "RUT001-345",
                "markers": null,
                "orig": null,
                "source": "say,",
                "target": ""
            },
            {
                id: "RUT001-346",
                "markers": null,
                "orig": null,
                "source": "\'I",
                "target": ""
            },
            {
                id: "RUT001-347",
                "markers": null,
                "orig": null,
                "source": "have",
                "target": ""
            },
            {
                id: "RUT001-348",
                "markers": null,
                "orig": null,
                "source": "hope,\'",
                "target": ""
            },
            {
                id: "RUT001-349",
                "markers": null,
                "orig": null,
                "source": "if",
                "target": ""
            },
            {
                id: "RUT001-350",
                "markers": null,
                "orig": null,
                "source": "I",
                "target": ""
            },
            {
                id: "RUT001-351",
                "markers": null,
                "orig": null,
                "source": "should",
                "target": ""
            },
            {
                id: "RUT001-352",
                "markers": null,
                "orig": null,
                "source": "even",
                "target": ""
            },
            {
                id: "RUT001-353",
                "markers": null,
                "orig": null,
                "source": "have",
                "target": ""
            },
            {
                id: "RUT001-354",
                "markers": null,
                "orig": null,
                "source": "a",
                "target": ""
            },
            {
                id: "RUT001-355",
                "markers": null,
                "orig": null,
                "source": "husband",
                "target": ""
            },
            {
                id: "RUT001-356",
                "markers": null,
                "orig": null,
                "source": "tonight,",
                "target": ""
            },
            {
                id: "RUT001-357",
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                id: "RUT001-358",
                "markers": null,
                "orig": null,
                "source": "should",
                "target": ""
            },
            {
                id: "RUT001-359",
                "markers": null,
                "orig": null,
                "source": "also",
                "target": ""
            },
            {
                id: "RUT001-360",
                "markers": null,
                "orig": null,
                "source": "bear",
                "target": ""
            },
            {
                id: "RUT001-361",
                "markers": null,
                "orig": null,
                "source": "sons;",
                "target": ""
            },
            {
                id: "RUT001-362",
                "orig": null,
                "markers": "\\v 13",
                "source": "would",
                "target": ""
            },
            {
                id: "RUT001-363",
                "markers": null,
                "orig": null,
                "source": "you",
                "target": ""
            },
            {
                id: "RUT001-364",
                "markers": null,
                "orig": null,
                "source": "then",
                "target": ""
            },
            {
                id: "RUT001-365",
                "markers": null,
                "orig": null,
                "source": "wait",
                "target": ""
            },
            {
                id: "RUT001-366",
                "markers": null,
                "orig": null,
                "source": "until",
                "target": ""
            },
            {
                id: "RUT001-367",
                "markers": null,
                "orig": null,
                "source": "they",
                "target": ""
            },
            {
                id: "RUT001-368",
                "markers": null,
                "orig": null,
                "source": "were",
                "target": ""
            },
            {
                id: "RUT001-369",
                "markers": null,
                "orig": null,
                "source": "grown?",
                "target": ""
            },
            {
                id: "RUT001-370",
                "markers": null,
                "orig": null,
                "source": "Would",
                "target": ""
            },
            {
                id: "RUT001-371",
                "markers": null,
                "orig": null,
                "source": "you",
                "target": ""
            },
            {
                id: "RUT001-372",
                "markers": null,
                "orig": null,
                "source": "then",
                "target": ""
            },
            {
                id: "RUT001-373",
                "markers": null,
                "orig": null,
                "source": "refrain",
                "target": ""
            },
            {
                id: "RUT001-374",
                "markers": null,
                "orig": null,
                "source": "from",
                "target": ""
            },
            {
                id: "RUT001-375",
                "markers": null,
                "orig": null,
                "source": "having",
                "target": ""
            },
            {
                id: "RUT001-376",
                "markers": null,
                "orig": null,
                "source": "husbands?",
                "target": ""
            },
            {
                id: "RUT001-377",
                "markers": null,
                "orig": null,
                "source": "No,",
                "target": ""
            },
            {
                id: "RUT001-378",
                "markers": null,
                "orig": null,
                "source": "my",
                "target": ""
            },
            {
                id: "RUT001-379",
                "markers": null,
                "orig": null,
                "source": "daughters,",
                "target": ""
            },
            {
                id: "RUT001-380",
                "markers": null,
                "orig": null,
                "source": "for",
                "target": ""
            },
            {
                id: "RUT001-381",
                "markers": null,
                "orig": null,
                "source": "it",
                "target": ""
            },
            {
                id: "RUT001-382",
                "markers": null,
                "orig": null,
                "source": "grieves",
                "target": ""
            },
            {
                id: "RUT001-383",
                "markers": null,
                "orig": null,
                "source": "me",
                "target": ""
            },
            {
                id: "RUT001-384",
                "markers": null,
                "orig": null,
                "source": "much",
                "target": ""
            },
            {
                id: "RUT001-385",
                "markers": null,
                "orig": null,
                "source": "for",
                "target": ""
            },
            {
                id: "RUT001-386",
                "markers": null,
                "orig": null,
                "source": "your",
                "target": ""
            },
            {
                id: "RUT001-387",
                "markers": null,
                "orig": null,
                "source": "sakes,",
                "target": ""
            },
            {
                id: "RUT001-388",
                "markers": null,
                "orig": null,
                "source": "for",
                "target": ""
            },
            {
                id: "RUT001-389",
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                id: "RUT001-390",
                "markers": null,
                "orig": null,
                "source": "hand",
                "target": ""
            },
            {
                id: "RUT001-391",
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                id: "RUT001-392",
                "markers": null,
                "orig": null,
                "source": "Yahweh",
                "target": ""
            },
            {
                id: "RUT001-393",
                "markers": null,
                "orig": null,
                "source": "has",
                "target": ""
            },
            {
                id: "RUT001-394",
                "markers": null,
                "orig": null,
                "source": "gone",
                "target": ""
            },
            {
                id: "RUT001-395",
                "markers": null,
                "orig": null,
                "source": "out",
                "target": ""
            },
            {
                id: "RUT001-396",
                "markers": null,
                "orig": null,
                "source": "against",
                "target": ""
            },
            {
                id: "RUT001-397",
                "markers": null,
                "orig": null,
                "source": "me.\"",
                "target": ""
            },
            {
                id: "RUT001-398",
                "markers": "\\p \\v 14",
                "orig": null,
                "source": "They",
                "target": ""
            },
            {
                id: "RUT001-399",
                "markers": null,
                "orig": null,
                "source": "lifted",
                "target": ""
            },
            {
                id: "RUT001-400",
                "markers": null,
                "orig": null,
                "source": "up",
                "target": ""
            },
            {
                id: "RUT001-401",
                "markers": null,
                "orig": null,
                "source": "their",
                "target": ""
            },
            {
                id: "RUT001-402",
                "markers": null,
                "orig": null,
                "source": "voice,",
                "target": ""
            },
            {
                id: "RUT001-403",
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                id: "RUT001-404",
                "markers": null,
                "orig": null,
                "source": "wept",
                "target": ""
            },
            {
                id: "RUT001-405",
                "markers": null,
                "orig": null,
                "source": "again:",
                "target": ""
            },
            {
                id: "RUT001-406",
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                id: "RUT001-407",
                "markers": null,
                "orig": null,
                "source": "Orpah",
                "target": ""
            },
            {
                id: "RUT001-408",
                "markers": null,
                "orig": null,
                "source": "kissed",
                "target": ""
            },
            {
                id: "RUT001-409",
                "markers": null,
                "orig": null,
                "source": "her",
                "target": ""
            },
            {
                id: "RUT001-410",
                "markers": null,
                "orig": null,
                "source": "mother-in-law,",
                "target": ""
            },
            {
                id: "RUT001-411",
                "markers": null,
                "orig": null,
                "source": "but",
                "target": ""
            },
            {
                id: "RUT001-412",
                "markers": null,
                "orig": null,
                "source": "Ruth",
                "target": ""
            },
            {
                id: "RUT001-413",
                "markers": null,
                "orig": null,
                "source": "joined",
                "target": ""
            },
            {
                id: "RUT001-414",
                "markers": null,
                "orig": null,
                "source": "with",
                "target": ""
            },
            {
                id: "RUT001-415",
                "markers": null,
                "orig": null,
                "source": "her.",
                "target": ""
            },
            {
                id: "RUT001-416",
                "markers": "\\v 15",
                "orig": null,
                "source": "She",
                "target": ""
            },
            {
                id: "RUT001-417",
                "markers": null,
                "orig": null,
                "source": "said,",
                "target": ""
            },
            {
                id: "RUT001-418",
                "markers": null,
                "orig": null,
                "source": "\"Behold,",
                "target": ""
            },
            {
                id: "RUT001-419",
                "markers": null,
                "orig": null,
                "source": "your",
                "target": ""
            },
            {
                id: "RUT001-420",
                "markers": null,
                "orig": null,
                "source": "sister-in-law",
                "target": ""
            },
            {
                id: "RUT001-421",
                "markers": null,
                "orig": null,
                "source": "has",
                "target": ""
            },
            {
                id: "RUT001-422",
                "markers": null,
                "orig": null,
                "source": "gone",
                "target": ""
            },
            {
                id: "RUT001-423",
                "markers": null,
                "orig": null,
                "source": "back",
                "target": ""
            },
            {
                id: "RUT001-424",
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                id: "RUT001-425",
                "markers": null,
                "orig": null,
                "source": "her",
                "target": ""
            },
            {
                id: "RUT001-426",
                "markers": null,
                "orig": null,
                "source": "people,",
                "target": ""
            },
            {
                id: "RUT001-427",
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                id: "RUT001-428",
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                id: "RUT001-429",
                "markers": null,
                "orig": null,
                "source": "her",
                "target": ""
            },
            {
                id: "RUT001-430",
                "markers": null,
                "orig": null,
                "source": "god.",
                "target": ""
            },
            {
                id: "RUT001-431",
                "markers": null,
                "orig": null,
                "source": "Follow",
                "target": ""
            },
            {
                id: "RUT001-432",
                "markers": null,
                "orig": null,
                "source": "your",
                "target": ""
            },
            {
                id: "RUT001-433",
                "markers": null,
                "orig": null,
                "source": "sister-in-law.\"",
                "target": ""
            },
            {
                id: "RUT001-434",
                "markers": "\\p \\v 16",
                "orig": null,
                "source": "Ruth",
                "target": ""
            },
            {
                id: "RUT001-435",
                "markers": null,
                "orig": null,
                "source": "said,",
                "target": ""
            },
            {
                id: "RUT001-436",
                "markers": null,
                "orig": null,
                "source": "\"Don\'t",
                "target": ""
            },
            {
                id: "RUT001-437",
                "markers": null,
                "orig": null,
                "source": "entreat",
                "target": ""
            },
            {
                id: "RUT001-438",
                "markers": null,
                "orig": null,
                "source": "me",
                "target": ""
            },
            {
                id: "RUT001-439",
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                id: "RUT001-440",
                "markers": null,
                "orig": null,
                "source": "leave",
                "target": ""
            },
            {
                id: "RUT001-441",
                "markers": null,
                "orig": null,
                "source": "you,",
                "target": ""
            },
            {
                id: "RUT001-442",
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                id: "RUT001-443",
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                id: "RUT001-444",
                "markers": null,
                "orig": null,
                "source": "return",
                "target": ""
            },
            {
                id: "RUT001-445",
                "markers": null,
                "orig": null,
                "source": "from",
                "target": ""
            },
            {
                id: "RUT001-446",
                "markers": null,
                "orig": null,
                "source": "following",
                "target": ""
            },
            {
                id: "RUT001-447",
                "markers": null,
                "orig": null,
                "source": "after",
                "target": ""
            },
            {
                id: "RUT001-448",
                "markers": null,
                "orig": null,
                "source": "you,",
                "target": ""
            },
            {
                id: "RUT001-449",
                "markers": null,
                "orig": null,
                "source": "for",
                "target": ""
            },
            {
                id: "RUT001-450",
                "markers": null,
                "orig": null,
                "source": "where",
                "target": ""
            },
            {
                id: "RUT001-451",
                "markers": null,
                "orig": null,
                "source": "you",
                "target": ""
            },
            {
                id: "RUT001-452",
                "markers": null,
                "orig": null,
                "source": "go,",
                "target": ""
            },
            {
                id: "RUT001-453",
                "markers": null,
                "orig": null,
                "source": "I",
                "target": ""
            },
            {
                id: "RUT001-454",
                "markers": null,
                "orig": null,
                "source": "will",
                "target": ""
            },
            {
                id: "RUT001-455",
                "markers": null,
                "orig": null,
                "source": "go;",
                "target": ""
            },
            {
                id: "RUT001-456",
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                id: "RUT001-457",
                "markers": null,
                "orig": null,
                "source": "where",
                "target": ""
            },
            {
                id: "RUT001-458",
                "markers": null,
                "orig": null,
                "source": "you",
                "target": ""
            },
            {
                id: "RUT001-459",
                "markers": null,
                "orig": null,
                "source": "lodge,",
                "target": ""
            },
            {
                id: "RUT001-460",
                "markers": null,
                "orig": null,
                "source": "I",
                "target": ""
            },
            {
                id: "RUT001-461",
                "markers": null,
                "orig": null,
                "source": "will",
                "target": ""
            },
            {
                id: "RUT001-462",
                "markers": null,
                "orig": null,
                "source": "lodge;",
                "target": ""
            },
            {
                id: "RUT001-463",
                "markers": null,
                "orig": null,
                "source": "your",
                "target": ""
            },
            {
                id: "RUT001-464",
                "markers": null,
                "orig": null,
                "source": "people",
                "target": ""
            },
            {
                id: "RUT001-465",
                "markers": null,
                "orig": null,
                "source": "will",
                "target": ""
            },
            {
                id: "RUT001-466",
                "markers": null,
                "orig": null,
                "source": "be",
                "target": ""
            },
            {
                id: "RUT001-467",
                "markers": null,
                "orig": null,
                "source": "my",
                "target": ""
            },
            {
                id: "RUT001-468",
                "markers": null,
                "orig": null,
                "source": "people,",
                "target": ""
            },
            {
                id: "RUT001-470",
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                id: "RUT001-471",
                "markers": null,
                "orig": null,
                "source": "your",
                "target": ""
            },
            {
                id: "RUT001-472",
                "markers": null,
                "orig": null,
                "source": "God",
                "target": ""
            },
            {
                id: "RUT001-473",
                "markers": "\\f +",
                "orig": null,
                "source": "The",
                "target": ""
            },
            {
                id: "RUT001-474",
                "markers": null,
                "orig": null,
                "source": "Hebrew",
                "target": ""
            },
            {
                id: "RUT001-475",
                "markers": null,
                "orig": null,
                "source": "word",
                "target": ""
            },
            {
                id: "RUT001-476",
                "markers": null,
                "orig": null,
                "source": "\"God\"",
                "target": ""
            },
            {
                id: "RUT001-477",
                "markers": null,
                "orig": null,
                "source": "is",
                "target": ""
            },
            {
                id: "RUT001-478",
                "markers": null,
                "orig": null,
                "source": "\"Elohim\".",
                "target": ""
            },
            {
                id: "RUT001-479",
                "orig": null,
                "markers": "\\f*",
                "source": "my",
                "target": ""
            },
            {
                id: "RUT001-480",
                "markers": null,
                "orig": null,
                "source": "God;",
                "target": ""
            },
            {
                id: "RUT001-481",
                "orig": null,
                "markers": "\\v 17",
                "source": "where",
                "target": ""
            },
            {
                id: "RUT001-482",
                "markers": null,
                "orig": null,
                "source": "you",
                "target": ""
            },
            {
                id: "RUT001-483",
                "markers": null,
                "orig": null,
                "source": "die,",
                "target": ""
            },
            {
                id: "RUT001-484",
                "markers": null,
                "orig": null,
                "source": "will",
                "target": ""
            },
            {
                id: "RUT001-485",
                "markers": null,
                "orig": null,
                "source": "I",
                "target": ""
            },
            {
                id: "RUT001-486",
                "markers": null,
                "orig": null,
                "source": "die,",
                "target": ""
            },
            {
                id: "RUT001-487",
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                id: "RUT001-488",
                "markers": null,
                "orig": null,
                "source": "there",
                "target": ""
            },
            {
                id: "RUT001-489",
                "markers": null,
                "orig": null,
                "source": "will",
                "target": ""
            },
            {
                id: "RUT001-490",
                "markers": null,
                "orig": null,
                "source": "I",
                "target": ""
            },
            {
                id: "RUT001-491",
                "markers": null,
                "orig": null,
                "source": "be",
                "target": ""
            },
            {
                id: "RUT001-492",
                "markers": null,
                "orig": null,
                "source": "buried.",
                "target": ""
            },
            {
                id: "RUT001-493",
                "markers": null,
                "orig": null,
                "source": "Yahweh",
                "target": ""
            },
            {
                id: "RUT001-494",
                "markers": null,
                "orig": null,
                "source": "do",
                "target": ""
            },
            {
                id: "RUT001-495",
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                id: "RUT001-496",
                "markers": null,
                "orig": null,
                "source": "me,",
                "target": ""
            },
            {
                id: "RUT001-497",
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                id: "RUT001-498",
                "markers": null,
                "orig": null,
                "source": "more",
                "target": ""
            },
            {
                id: "RUT001-499",
                "markers": null,
                "orig": null,
                "source": "also,",
                "target": ""
            },
            {
                id: "RUT001-500",
                "markers": null,
                "orig": null,
                "source": "if",
                "target": ""
            },
            {
                id: "RUT001-501",
                "markers": null,
                "orig": null,
                "source": "anything",
                "target": ""
            },
            {
                id: "RUT001-502",
                "markers": null,
                "orig": null,
                "source": "but",
                "target": ""
            },
            {
                id: "RUT001-503",
                "markers": null,
                "orig": null,
                "source": "death",
                "target": ""
            },
            {
                id: "RUT001-504",
                "markers": null,
                "orig": null,
                "source": "part",
                "target": ""
            },
            {
                id: "RUT001-505",
                "markers": null,
                "orig": null,
                "source": "you",
                "target": ""
            },
            {
                id: "RUT001-506",
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                id: "RUT001-507",
                "markers": null,
                "orig": null,
                "source": "me.\"",
                "target": ""
            },
            {
                id: "RUT001-508",
                "orig": null,
                "markers": "\\p \\v 18",
                "source": "When",
                "target": ""
            },
            {
                id: "RUT001-509",
                "markers": null,
                "orig": null,
                "source": "she",
                "target": ""
            },
            {
                id: "RUT001-510",
                "markers": null,
                "orig": null,
                "source": "saw",
                "target": ""
            },
            {
                id: "RUT001-511",
                "markers": null,
                "orig": null,
                "source": "that",
                "target": ""
            },
            {
                id: "RUT001-512",
                "markers": null,
                "orig": null,
                "source": "she",
                "target": ""
            },
            {
                id: "RUT001-513",
                "markers": null,
                "orig": null,
                "source": "was",
                "target": ""
            },
            {
                id: "RUT001-514",
                "markers": null,
                "orig": null,
                "source": "steadfastly",
                "target": ""
            },
            {
                id: "RUT001-515",
                "markers": null,
                "orig": null,
                "source": "minded",
                "target": ""
            },
            {
                id: "RUT001-516",
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                id: "RUT001-517",
                "markers": null,
                "orig": null,
                "source": "go",
                "target": ""
            },
            {
                id: "RUT001-518",
                "markers": null,
                "orig": null,
                "source": "with",
                "target": ""
            },
            {
                id: "RUT001-519",
                "markers": null,
                "orig": null,
                "source": "her,",
                "target": ""
            },
            {
                id: "RUT001-520",
                "markers": null,
                "orig": null,
                "source": "she",
                "target": ""
            },
            {
                id: "RUT001-521",
                "markers": null,
                "orig": null,
                "source": "left",
                "target": ""
            },
            {
                id: "RUT001-522",
                "markers": null,
                "orig": null,
                "source": "off",
                "target": ""
            },
            {
                id: "RUT001-523",
                "markers": null,
                "orig": null,
                "source": "speaking",
                "target": ""
            },
            {
                id: "RUT001-524",
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                id: "RUT001-525",
                "markers": null,
                "orig": null,
                "source": "her.",
                "target": ""
            },
            {
                id: "RUT001-526",
                "markers": "\\p \\v 19",
                "orig": null,
                "source": "So",
                "target": ""
            },
            {
                id: "RUT001-527",
                "markers": null,
                "orig": null,
                "source": "they",
                "target": ""
            },
            {
                id: "RUT001-528",
                "markers": null,
                "orig": null,
                "source": "two",
                "target": ""
            },
            {
                id: "RUT001-529",
                "markers": null,
                "orig": null,
                "source": "went",
                "target": ""
            },
            {
                id: "RUT001-530",
                "markers": null,
                "orig": null,
                "source": "until",
                "target": ""
            },
            {
                id: "RUT001-531",
                "markers": null,
                "orig": null,
                "source": "they",
                "target": ""
            },
            {
                id: "RUT001-532",
                "markers": null,
                "orig": null,
                "source": "came",
                "target": ""
            },
            {
                id: "RUT001-533",
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                id: "RUT001-534",
                "markers": null,
                "orig": null,
                "source": "Bethlehem.",
                "target": ""
            },
            {
                id: "RUT001-535",
                "markers": null,
                "orig": null,
                "source": "It",
                "target": ""
            },
            {
                id: "RUT001-536",
                "markers": null,
                "orig": null,
                "source": "Happened,",
                "target": ""
            },
            {
                id: "RUT001-537",
                "markers": null,
                "orig": null,
                "source": "when",
                "target": ""
            },
            {
                id: "RUT001-538",
                "markers": null,
                "orig": null,
                "source": "they",
                "target": ""
            },
            {
                id: "RUT001-539",
                "markers": null,
                "orig": null,
                "source": "had",
                "target": ""
            },
            {
                id: "RUT001-540",
                "markers": null,
                "orig": null,
                "source": "come",
                "target": ""
            },
            {
                id: "RUT001-541",
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                id: "RUT001-542",
                "markers": null,
                "orig": null,
                "source": "Bethlehem,",
                "target": ""
            },
            {
                id: "RUT001-543",
                "markers": null,
                "orig": null,
                "source": "that",
                "target": ""
            },
            {
                id: "RUT001-544",
                "markers": null,
                "orig": null,
                "source": "all",
                "target": ""
            },
            {
                id: "RUT001-545",
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                id: "RUT001-546",
                "markers": null,
                "orig": null,
                "source": "city",
                "target": ""
            },
            {
                id: "RUT001-547",
                "markers": null,
                "orig": null,
                "source": "was",
                "target": ""
            },
            {
                id: "RUT001-548",
                "markers": null,
                "orig": null,
                "source": "moved",
                "target": ""
            },
            {
                id: "RUT001-549",
                "markers": null,
                "orig": null,
                "source": "about",
                "target": ""
            },
            {
                id: "RUT001-550",
                "markers": null,
                "orig": null,
                "source": "them,",
                "target": ""
            },
            {
                id: "RUT001-551",
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                id: "RUT001-552",
                "markers": null,
                "orig": null,
                "source": "they",
                "target": ""
            },
            {
                id: "RUT001-553",
                "markers": null,
                "orig": null,
                "source": "asked,",
                "target": ""
            },
            {
                id: "RUT001-554",
                "markers": null,
                "orig": null,
                "source": "\"Is",
                "target": ""
            },
            {
                id: "RUT001-555",
                "markers": null,
                "orig": null,
                "source": "this",
                "target": ""
            },
            {
                id: "RUT001-556",
                "markers": null,
                "orig": null,
                "source": "Naomi?\"",
                "target": ""
            },
            {
                id: "RUT001-557",
                "markers": "\\p \\v 20",
                "orig": null,
                "source": "She",
                "target": ""
            },
            {
                id: "RUT001-558",
                "markers": null,
                "orig": null,
                "source": "said",
                "target": ""
            },
            {
                id: "RUT001-559",
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                id: "RUT001-560",
                "markers": null,
                "orig": null,
                "source": "them,",
                "target": ""
            },
            {
                id: "RUT001-561",
                "markers": null,
                "orig": null,
                "source": "\"Don\'t",
                "target": ""
            },
            {
                id: "RUT001-562",
                "markers": null,
                "orig": null,
                "source": "call",
                "target": ""
            },
            {
                id: "RUT001-563",
                "markers": null,
                "orig": null,
                "source": "me",
                "target": ""
            },
            {
                id: "RUT001-564",
                "markers": null,
                "orig": null,
                "source": "Naomi.",
                "target": ""
            },
            {
                id: "RUT001-565",
                "markers": null,
                "orig": null,
                "source": "Call",
                "target": ""
            },
            {
                id: "RUT001-566",
                "markers": null,
                "orig": null,
                "source": "me",
                "target": ""
            },
            {
                id: "RUT001-567",
                "markers": null,
                "orig": null,
                "source": "Mara;",
                "target": ""
            },
            {
                id: "RUT001-568",
                "markers": null,
                "orig": null,
                "source": "for",
                "target": ""
            },
            {
                id: "RUT001-569",
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                id: "RUT001-570",
                "markers": null,
                "orig": null,
                "source": "Almighty",
                "target": ""
            },
            {
                id: "RUT001-571",
                "markers": null,
                "orig": null,
                "source": "has",
                "target": ""
            },
            {
                id: "RUT001-572",
                "markers": null,
                "orig": null,
                "source": "dealt",
                "target": ""
            },
            {
                id: "RUT001-573",
                "markers": null,
                "orig": null,
                "source": "very",
                "target": ""
            },
            {
                id: "RUT001-574",
                "markers": null,
                "orig": null,
                "source": "bitterly",
                "target": ""
            },
            {
                id: "RUT001-575",
                "markers": null,
                "orig": null,
                "source": "with",
                "target": ""
            },
            {
                id: "RUT001-576",
                "markers": null,
                "orig": null,
                "source": "me.",
                "target": ""
            },
            {
                id: "RUT001-577",
                "markers": "\\v 21",
                "orig": null,
                "source": "I",
                "target": ""
            },
            {
                id: "RUT001-578",
                "markers": null,
                "orig": null,
                "source": "went",
                "target": ""
            },
            {
                id: "RUT001-479",
                "markers": null,
                "orig": null,
                "source": "out",
                "target": ""
            },
            {
                id: "RUT001-580",
                "markers": null,
                "orig": null,
                "source": "full,",
                "target": ""
            },
            {
                id: "RUT001-581",
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                id: "RUT001-582",
                "markers": null,
                "orig": null,
                "source": "Yahweh",
                "target": ""
            },
            {
                id: "RUT001-583",
                "markers": null,
                "orig": null,
                "source": "has",
                "target": ""
            },
            {
                id: "RUT001-584",
                "markers": null,
                "orig": null,
                "source": "brought",
                "target": ""
            },
            {
                id: "RUT001-585",
                "markers": null,
                "orig": null,
                "source": "me",
                "target": ""
            },
            {
                id: "RUT001-586",
                "markers": null,
                "orig": null,
                "source": "back",
                "target": ""
            },
            {
                id: "RUT001-587",
                "markers": null,
                "orig": null,
                "source": "empty;",
                "target": ""
            },
            {
                id: "RUT001-588",
                "markers": null,
                "orig": null,
                "source": "why",
                "target": ""
            },
            {
                id: "RUT001-589",
                "markers": null,
                "orig": null,
                "source": "do",
                "target": ""
            },
            {
                id: "RUT001-590",
                "markers": null,
                "orig": null,
                "source": "you",
                "target": ""
            },
            {
                id: "RUT001-591",
                "markers": null,
                "orig": null,
                "source": "call",
                "target": ""
            },
            {
                id: "RUT001-592",
                "markers": null,
                "orig": null,
                "source": "me",
                "target": ""
            },
            {
                id: "RUT001-593",
                "markers": null,
                "orig": null,
                "source": "Naomi,",
                "target": ""
            },
            {
                id: "RUT001-594",
                "markers": null,
                "orig": null,
                "source": "since",
                "target": ""
            },
            {
                id: "RUT001-595",
                "markers": null,
                "orig": null,
                "source": "Yahweh",
                "target": ""
            },
            {
                id: "RUT001-596",
                "markers": null,
                "orig": null,
                "source": "has",
                "target": ""
            },
            {
                id: "RUT001-597",
                "markers": null,
                "orig": null,
                "source": "testified",
                "target": ""
            },
            {
                id: "RUT001-598",
                "markers": null,
                "orig": null,
                "source": "against",
                "target": ""
            },
            {
                id: "RUT001-599",
                "markers": null,
                "orig": null,
                "source": "me,",
                "target": ""
            },
            {
                id: "RUT001-600",
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                id: "RUT001-601",
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                id: "RUT001-602",
                "markers": null,
                "orig": null,
                "source": "Almighty",
                "target": ""
            },
            {
                id: "RUT001-603",
                "markers": null,
                "orig": null,
                "source": "has",
                "target": ""
            },
            {
                id: "RUT001-604",
                "markers": null,
                "orig": null,
                "source": "afflicted",
                "target": ""
            },
            {
                id: "RUT001-605",
                "markers": null,
                "orig": null,
                "source": "me?\"",
                "target": ""
            },
            {
                id: "RUT001-606",
                "orig": null,
                "markers": "\\v 22",
                "source": "So",
                "target": ""
            },
            {
                id: "RUT001-607",
                "markers": null,
                "orig": null,
                "source": "Naomi",
                "target": ""
            },
            {
                id: "RUT001-608",
                "markers": null,
                "orig": null,
                "source": "returned,",
                "target": ""
            },
            {
                id: "RUT001-609",
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                id: "RUT001-610",
                "markers": null,
                "orig": null,
                "source": "Ruth",
                "target": ""
            },
            {
                id: "RUT001-611",
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                id: "RUT001-612",
                "markers": null,
                "orig": null,
                "source": "Moabitess,",
                "target": ""
            },
            {
                id: "RUT001-613",
                "markers": null,
                "orig": null,
                "source": "her",
                "target": ""
            },
            {
                id: "RUT001-614",
                "markers": null,
                "orig": null,
                "source": "daughter-in-law,",
                "target": ""
            },
            {
                id: "RUT001-615",
                "markers": null,
                "orig": null,
                "source": "with",
                "target": ""
            },
            {
                id: "RUT001-616",
                "markers": null,
                "orig": null,
                "source": "her,",
                "target": ""
            },
            {
                id: "RUT001-617",
                "markers": null,
                "orig": null,
                "source": "who",
                "target": ""
            },
            {
                id: "RUT001-618",
                "markers": null,
                "orig": null,
                "source": "returned",
                "target": ""
            },
            {
                id: "RUT001-619",
                "markers": null,
                "orig": null,
                "source": "out",
                "target": ""
            },
            {
                id: "RUT001-620",
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                id: "RUT001-621",
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                id: "RUT001-622",
                "markers": null,
                "orig": null,
                "source": "country",
                "target": ""
            },
            {
                id: "RUT001-623",
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                id: "RUT001-624",
                "markers": null,
                "orig": null,
                "source": "Moab:",
                "target": ""
            },
            {
                id: "RUT001-625",
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                id: "RUT001-626",
                "markers": null,
                "orig": null,
                "source": "they",
                "target": ""
            },
            {
                id: "RUT001-627",
                "markers": null,
                "orig": null,
                "source": "came",
                "target": ""
            },
            {
                id: "RUT001-628",
                "markers": null,
                "orig": null,
                "source": "to",
                "target": ""
            },
            {
                id: "RUT001-629",
                "markers": null,
                "orig": null,
                "source": "Bethlehem",
                "target": ""
            },
            {
                id: "RUT001-630",
                "markers": null,
                "orig": null,
                "source": "in",
                "target": ""
            },
            {
                id: "RUT001-631",
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                id: "RUT001-632",
                "markers": null,
                "orig": null,
                "source": "beginning",
                "target": ""
            },
            {
                id: "RUT001-633",
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                id: "RUT001-634",
                "markers": null,
                "orig": null,
                "source": "barley",
                "target": ""
            },
            {
                id: "RUT001-635",
                "markers": null,
                "orig": null,
                "source": "harvest.",
                "target": ""
            },
// CH 2
            {
                id: "RUT002-1",
                "markers": "\\c 2 \\p \\v 1",
                "source": "Naomi",
                "target": ""
            },
            {
                id: "RUT002-2",
                "markers": null,
                "orig": null,
                "source": "had",
                "target": ""
            },
            {
                id: "RUT002-3",
                "markers": null,
                "orig": null,
                "source": "a",
                "target": ""
            },
            {
                id: "RUT002-4",
                "markers": null,
                "orig": null,
                "source": "relative",
                "target": ""
            },
            {
                id: "RUT002-5",
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                id: "RUT002-6",
                "markers": null,
                "orig": null,
                "source": "her",
                "target": ""
            },
            {
                id: "RUT002-7",
                "markers": null,
                "orig": null,
                "source": "husband\'s,",
                "target": ""
            },
            {
                id: "RUT002-8",
                "markers": null,
                "orig": null,
                "source": "a",
                "target": ""
            },
            {
                id: "RUT002-9",
                "markers": null,
                "orig": null,
                "source": "mighty",
                "target": ""
            },
            {
                id: "RUT002-10",
                "markers": null,
                "orig": null,
                "source": "man",
                "target": ""
            },
            {
                id: "RUT002-11",
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                id: "RUT002-12",
                "markers": null,
                "orig": null,
                "source": "wealth,",
                "target": ""
            },
            {
                id: "RUT002-13",
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                id: "RUT002-14",
                "markers": null,
                "orig": null,
                "source": "the",
                "target": ""
            },
            {
                id: "RUT002-15",
                "markers": null,
                "orig": null,
                "source": "family",
                "target": ""
            },
            {
                id: "RUT002-16",
                "markers": null,
                "orig": null,
                "source": "of",
                "target": ""
            },
            {
                id: "RUT002-17",
                "markers": null,
                "orig": null,
                "source": "Elimelech,",
                "target": ""
            },
            {
                id: "RUT002-18",
                "markers": null,
                "orig": null,
                "source": "and",
                "target": ""
            },
            {
                id: "RUT002-19",
                "markers": null,
                "orig": null,
                "source": "his",
                "target": ""
            },
            {
                id: "RUT002-20",
                "markers": null,
                "orig": null,
                "source": "name",
                "target": ""
            },
            {
                id: "RUT002-21",
                "markers": null,
                "orig": null,
                "source": "was",
                "target": ""
            },
            {
                id: "RUT002-22",
                "markers": null,
                "orig": null,
                "source": "Boaz.",
                "target": ""
            },
// CH 3
            {
                id: "RUT003-1",
                "markers": "\\c 3 \\p \\v 1",
                "orig": null,
                "source": "Naomi",
                "target": ""
            },
// CH 4
            {
                id: "RUT004-1",
                "markers": "\\c 4 \\p \\v 1",
                "orig": null,
                "source": "Now",
                "target": ""
            }
        ],

        SourcePhrase = Backbone.Model.extend({
            // default values
            
            defaults: {
                id: null,
                markers: "",
                orig: null,
                source: "",
                target: ""
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