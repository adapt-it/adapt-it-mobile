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
            {   "id": "RUT1",
                "name": "Ruth 1",
                "lastAdapted": 2,
                "verseCount": 22,
                "sourcephrases": [
                    {
                        "id": "RUT1-1",
                        "markers": "\\id",
                        "orig": null,
                        "source": "RUT",
                        "target": "RUT"
                    },
                    {
                        "id": "RUT1-2",
                        "markers": null,
                        "orig": null,
                        "source": "08-RUT-web.sfm",
                        "target": "08-RUT-web.sfm"
                    },
                    {
                        "id": "RUT1-3",
                        "markers": null,
                        "orig": null,
                        "source": "World",
                        "target": "Amazing"
                    },
                    {
                        "id": "RUT1-4",
                        "markers": null,
                        "orig": null,
                        "source": "English",
                        "target": "American"
                    },
                    {
                        "id": "RUT1-5",
                        "markers": null,
                        "orig": null,
                        "source": "Bible",
                        "target": "Bible"
                    },
                    {
                        "id": "RUT1-6",
                        "markers": null,
                        "orig": null,
                        "source": "Tuesday",
                        "target": "Friday"
                    },
                    {
                        "id": "RUT1-7",
                        "markers": null,
                        "orig": null,
                        "source": "19",
                        "target": "13"
                    },
                    {
                        "id": "RUT1-8",
                        "markers": null,
                        "orig": null,
                        "source": "August",
                        "target": "December"
                    },
                    {
                        "id": "RUT1-9",
                        "markers": null,
                        "orig": null,
                        "source": "2008",
                        "target": "2013"
                    },
                    {
                        "id": "RUT1-10",
                        "orig": null,
                        "markers": "\\hdr",
                        "source": "Ruth",
                        "target": "Ruth"
                    },
                    {
                        "id": "RUT1-11",
                        "orig": null,
                        "markers": "\\mt",
                        "source": "Ruth",
                        "target": "Ruth"
                    },
                    {
                        "id": "RUT1-12",
                        "orig": null,
                        "markers": "\\c 1 \\p \\v 1",
                        "source": "It",
                        "target": "It"
                    },
                    {
                        "id": "RUT1-13",
                        "markers": null,
                        "orig": null,
                        "source": "happened",
                        "target": "came about"
                    },
                    {
                        "id": "RUT1-14",
                        "markers": null,
                        "orig": null,
                        "source": "in",
                        "target": "during"
                    },
                    {
                        "id": "RUT1-15",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": "the"
                    },
                    {
                        "id": "RUT1-16",
                        "markers": null,
                        "orig": null,
                        "source": "days",
                        "target": "days"
                    },
                    {
                        "id": "RUT1-17",
                        "markers": null,
                        "orig": null,
                        "source": "when",
                        "target": "when"
                    },
                    {
                        "id": "RUT1-18",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": "the"
                    },
                    {
                        "id": "RUT1-19",
                        "markers": null,
                        "orig": null,
                        "source": "judges",
                        "target": "judges"
                    },
                    {
                        "id": "RUT1-20",
                        "markers": null,
                        "orig": null,
                        "source": "judged,",
                        "target": "judged"
                    },
                    {
                        "id": "RUT1-21",
                        "markers": null,
                        "orig": null,
                        "source": "that",
                        "target": ""
                    },
                    {
                        "id": "RUT1-22",
                        "markers": null,
                        "orig": null,
                        "source": "there",
                        "target": ""
                    },
                    {
                        "id": "RUT1-23",
                        "markers": null,
                        "orig": null,
                        "source": "was",
                        "target": ""
                    },
                    {
                        "id": "RUT1-24",
                        "markers": null,
                        "orig": null,
                        "source": "a",
                        "target": ""
                    },
                    {
                        "id": "RUT1-25",
                        "markers": null,
                        "orig": null,
                        "source": "famine",
                        "target": ""
                    },
                    {
                        "id": "RUT1-26",
                        "markers": null,
                        "orig": null,
                        "source": "in",
                        "target": ""
                    },
                    {
                        "id": "RUT1-27",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-28",
                        "markers": null,
                        "orig": null,
                        "source": "land.",
                        "target": ""
                    },
                    {
                        "id": "RUT1-29",
                        "markers": null,
                        "orig": null,
                        "source": "A",
                        "target": ""
                    },
                    {
                        "id": "RUT1-30",
                        "markers": null,
                        "orig": null,
                        "source": "certain",
                        "target": ""
                    },
                    {
                        "id": "RUT1-31",
                        "markers": null,
                        "orig": null,
                        "source": "man",
                        "target": ""
                    },
                    {
                        "id": "RUT1-32",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT1-34",
                        "markers": null,
                        "orig": null,
                        "source": "Bethlehem",
                        "target": ""
                    },
                    {
                        "id": "RUT1-35",
                        "markers": null,
                        "orig": null,
                        "source": "Judah",
                        "target": ""
                    },
                    {
                        "id": "RUT1-36",
                        "markers": null,
                        "orig": null,
                        "source": "went",
                        "target": ""
                    },
                    {
                        "id": "RUT1-37",
                        "markers": null,
                        "orig": null,
                        "source": "to",
                        "target": ""
                    },
                    {
                        "id": "RUT1-38",
                        "markers": null,
                        "orig": null,
                        "source": "live",
                        "target": ""
                    },
                    {
                        "id": "RUT1-39",
                        "markers": null,
                        "orig": null,
                        "source": "in",
                        "target": ""
                    },
                    {
                        "id": "RUT1-40",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-41",
                        "markers": null,
                        "orig": null,
                        "source": "country",
                        "target": ""
                    },
                    {
                        "id": "RUT1-42",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT1-43",
                        "markers": null,
                        "orig": null,
                        "source": "Moab,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-44",
                        "markers": null,
                        "orig": null,
                        "source": "he,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-45",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-46",
                        "markers": null,
                        "orig": null,
                        "source": "his",
                        "target": ""
                    },
                    {
                        "id": "RUT1-47",
                        "markers": null,
                        "orig": null,
                        "source": "wife,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-48",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-49",
                        "markers": null,
                        "orig": null,
                        "source": "his",
                        "target": ""
                    },
                    {
                        "id": "RUT1-50",
                        "markers": null,
                        "orig": null,
                        "source": "two",
                        "target": ""
                    },
                    {
                        "id": "RUT1-51",
                        "markers": null,
                        "orig": null,
                        "source": "sons.",
                        "target": ""
                    },
                    {
                        "id": "RUT1-52",
                        "markers": "\\v 2",
                        "orig": null,
                        "source": "The",
                        "target": ""
                    },
                    {
                        "id": "RUT1-53",
                        "markers": null,
                        "orig": null,
                        "source": "name",
                        "target": ""
                    },
                    {
                        "id": "RUT1-54",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT1-55",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-56",
                        "markers": null,
                        "orig": null,
                        "source": "man",
                        "target": ""
                    },
                    {
                        "id": "RUT1-57",
                        "markers": null,
                        "orig": null,
                        "source": "was",
                        "target": ""
                    },
                    {
                        "id": "RUT1-58",
                        "markers": null,
                        "orig": null,
                        "source": "Elimelech,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-59",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-60",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-61",
                        "markers": null,
                        "orig": null,
                        "source": "name",
                        "target": ""
                    },
                    {
                        "id": "RUT1-62",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT1-63",
                        "markers": null,
                        "orig": null,
                        "source": "his",
                        "target": ""
                    },
                    {
                        "id": "RUT1-64",
                        "markers": null,
                        "orig": null,
                        "source": "wife",
                        "target": ""
                    },
                    {
                        "id": "RUT1-65",
                        "markers": null,
                        "orig": null,
                        "source": "Naomi,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-66",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-67",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-68",
                        "markers": null,
                        "orig": null,
                        "source": "name",
                        "target": ""
                    },
                    {
                        "id": "RUT1-69",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT1-70",
                        "markers": null,
                        "orig": null,
                        "source": "his",
                        "target": ""
                    },
                    {
                        "id": "RUT1-71",
                        "markers": null,
                        "orig": null,
                        "source": "two",
                        "target": ""
                    },
                    {
                        "id": "RUT1-72",
                        "markers": null,
                        "orig": null,
                        "source": "sons",
                        "target": ""
                    },
                    {
                        "id": "RUT1-73",
                        "markers": null,
                        "orig": null,
                        "source": "Mahlon",
                        "target": ""
                    },
                    {
                        "id": "RUT1-74",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-75",
                        "markers": null,
                        "orig": null,
                        "source": "Chilion,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-76",
                        "markers": null,
                        "orig": null,
                        "source": "Ephrathites",
                        "target": ""
                    },
                    {
                        "id": "RUT1-77",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT1-78",
                        "markers": null,
                        "orig": null,
                        "source": "Bethlehem",
                        "target": ""
                    },
                    {
                        "id": "RUT1-79",
                        "markers": null,
                        "orig": null,
                        "source": "Judah.",
                        "target": ""
                    },
                    {
                        "id": "RUT1-80",
                        "markers": null,
                        "orig": null,
                        "source": "They",
                        "target": ""
                    },
                    {
                        "id": "RUT1-81",
                        "markers": null,
                        "orig": null,
                        "source": "came",
                        "target": ""
                    },
                    {
                        "id": "RUT1-82",
                        "markers": null,
                        "orig": null,
                        "source": "into",
                        "target": ""
                    },
                    {
                        "id": "RUT1-83",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-84",
                        "markers": null,
                        "orig": null,
                        "source": "country",
                        "target": ""
                    },
                    {
                        "id": "RUT1-85",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT1-86",
                        "markers": null,
                        "orig": null,
                        "source": "Moab,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-87",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-88",
                        "markers": null,
                        "orig": null,
                        "source": "continued",
                        "target": ""
                    },
                    {
                        "id": "RUT1-89",
                        "markers": null,
                        "orig": null,
                        "source": "there.",
                        "target": ""
                    },
                    {
                        "id": "RUT1-90",
                        "markers": "\\v 3",
                        "orig": null,
                        "source": "Elimilech,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-91",
                        "markers": null,
                        "orig": null,
                        "source": "Naomi's",
                        "target": ""
                    },
                    {
                        "id": "RUT1-92",
                        "markers": null,
                        "orig": null,
                        "source": "husband,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-93",
                        "markers": null,
                        "orig": null,
                        "source": "died;",
                        "target": ""
                    },
                    {
                        "id": "RUT1-94",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-95",
                        "markers": null,
                        "orig": null,
                        "source": "she",
                        "target": ""
                    },
                    {
                        "id": "RUT1-96",
                        "markers": null,
                        "orig": null,
                        "source": "was",
                        "target": ""
                    },
                    {
                        "id": "RUT1-97",
                        "markers": null,
                        "orig": null,
                        "source": "left,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-98",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-99",
                        "markers": null,
                        "orig": null,
                        "source": "her",
                        "target": ""
                    },
                    {
                        "id": "RUT1-100",
                        "markers": null,
                        "orig": null,
                        "source": "two",
                        "target": ""
                    },
                    {
                        "id": "RUT1-101",
                        "markers": null,
                        "orig": null,
                        "source": "sons.",
                        "target": ""
                    },
                    {
                        "id": "RUT1-102",
                        "orig": null,
                        "markers": "\\v 4",
                        "source": "They",
                        "target": ""
                    },
                    {
                        "id": "RUT1-103",
                        "markers": null,
                        "orig": null,
                        "source": "took",
                        "target": ""
                    },
                    {
                        "id": "RUT1-104",
                        "markers": null,
                        "orig": null,
                        "source": "them",
                        "target": ""
                    },
                    {
                        "id": "RUT1-105",
                        "markers": null,
                        "orig": null,
                        "source": "wives",
                        "target": ""
                    },
                    {
                        "id": "RUT1-106",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT1-107",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-108",
                        "markers": null,
                        "orig": null,
                        "source": "women",
                        "target": ""
                    },
                    {
                        "id": "RUT1-109",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT1-110",
                        "markers": null,
                        "orig": null,
                        "source": "Moab;",
                        "target": ""
                    },
                    {
                        "id": "RUT1-111",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-112",
                        "markers": null,
                        "orig": null,
                        "source": "name",
                        "target": ""
                    },
                    {
                        "id": "RUT1-113",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT1-114",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-115",
                        "markers": null,
                        "orig": null,
                        "source": "one",
                        "target": ""
                    },
                    {
                        "id": "RUT1-116",
                        "markers": null,
                        "orig": null,
                        "source": "was",
                        "target": ""
                    },
                    {
                        "id": "RUT1-117",
                        "markers": null,
                        "orig": null,
                        "source": "Orpah,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-118",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-119",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-120",
                        "markers": null,
                        "orig": null,
                        "source": "name",
                        "target": ""
                    },
                    {
                        "id": "RUT1-121",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT1-122",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-123",
                        "markers": null,
                        "orig": null,
                        "source": "other",
                        "target": ""
                    },
                    {
                        "id": "RUT1-124",
                        "markers": null,
                        "orig": null,
                        "source": "Ruth:",
                        "target": ""
                    },
                    {
                        "id": "RUT1-125",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-126",
                        "markers": null,
                        "orig": null,
                        "source": "they",
                        "target": ""
                    },
                    {
                        "id": "RUT1-127",
                        "markers": null,
                        "orig": null,
                        "source": "lived",
                        "target": ""
                    },
                    {
                        "id": "RUT1-128",
                        "markers": null,
                        "orig": null,
                        "source": "there",
                        "target": ""
                    },
                    {
                        "id": "RUT1-129",
                        "markers": null,
                        "orig": null,
                        "source": "about",
                        "target": ""
                    },
                    {
                        "id": "RUT1-130",
                        "markers": null,
                        "orig": null,
                        "source": "ten",
                        "target": ""
                    },
                    {
                        "id": "RUT1-131",
                        "markers": null,
                        "orig": null,
                        "source": "years.",
                        "target": ""
                    },
                    {
                        "id": "RUT1-132",
                        "markers": "\\v 5",
                        "orig": null,
                        "source": "Mahlon",
                        "target": ""
                    },
                    {
                        "id": "RUT1-133",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-134",
                        "markers": null,
                        "orig": null,
                        "source": "Chilion",
                        "target": ""
                    },
                    {
                        "id": "RUT1-135",
                        "markers": null,
                        "orig": null,
                        "source": "both",
                        "target": ""
                    },
                    {
                        "id": "RUT1-136",
                        "markers": null,
                        "orig": null,
                        "source": "died,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-137",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-138",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-139",
                        "markers": null,
                        "orig": null,
                        "source": "woman",
                        "target": ""
                    },
                    {
                        "id": "RUT1-140",
                        "markers": null,
                        "orig": null,
                        "source": "was",
                        "target": ""
                    },
                    {
                        "id": "RUT1-141",
                        "markers": null,
                        "orig": null,
                        "source": "bereaved",
                        "target": ""
                    },
                    {
                        "id": "RUT1-142",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT1-143",
                        "markers": null,
                        "orig": null,
                        "source": "her",
                        "target": ""
                    },
                    {
                        "id": "RUT1-144",
                        "markers": null,
                        "orig": null,
                        "source": "two",
                        "target": ""
                    },
                    {
                        "id": "RUT1-145",
                        "markers": null,
                        "orig": null,
                        "source": "children",
                        "target": ""
                    },
                    {
                        "id": "RUT1-146",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-147",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT1-148",
                        "markers": null,
                        "orig": null,
                        "source": "her",
                        "target": ""
                    },
                    {
                        "id": "RUT1-149",
                        "markers": null,
                        "orig": null,
                        "source": "husband.",
                        "target": ""
                    },
                    {
                        "id": "RUT1-150",
                        "markers": "\\v 6",
                        "orig": null,
                        "source": "Then",
                        "target": ""
                    },
                    {
                        "id": "RUT1-151",
                        "markers": null,
                        "orig": null,
                        "source": "she",
                        "target": ""
                    },
                    {
                        "id": "RUT1-152",
                        "markers": null,
                        "orig": null,
                        "source": "arose",
                        "target": ""
                    },
                    {
                        "id": "RUT1-153",
                        "markers": null,
                        "orig": null,
                        "source": "with",
                        "target": ""
                    },
                    {
                        "id": "RUT1-154",
                        "markers": null,
                        "orig": null,
                        "source": "her",
                        "target": ""
                    },
                    {
                        "id": "RUT1-155",
                        "markers": null,
                        "orig": null,
                        "source": "daughters-in-law,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-156",
                        "markers": null,
                        "orig": null,
                        "source": "that",
                        "target": ""
                    },
                    {
                        "id": "RUT1-157",
                        "markers": null,
                        "orig": null,
                        "source": "she",
                        "target": ""
                    },
                    {
                        "id": "RUT1-158",
                        "markers": null,
                        "orig": null,
                        "source": "might",
                        "target": ""
                    },
                    {
                        "id": "RUT1-159",
                        "markers": null,
                        "orig": null,
                        "source": "return",
                        "target": ""
                    },
                    {
                        "id": "RUT1-160",
                        "markers": null,
                        "orig": null,
                        "source": "from",
                        "target": ""
                    },
                    {
                        "id": "RUT1-161",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-162",
                        "markers": null,
                        "orig": null,
                        "source": "country",
                        "target": ""
                    },
                    {
                        "id": "RUT1-163",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT1-164",
                        "markers": null,
                        "orig": null,
                        "source": "Moab;",
                        "target": ""
                    },
                    {
                        "id": "RUT1-165",
                        "markers": null,
                        "orig": null,
                        "source": "for",
                        "target": ""
                    },
                    {
                        "id": "RUT1-166",
                        "markers": null,
                        "orig": null,
                        "source": "she",
                        "target": ""
                    },
                    {
                        "id": "RUT1-167",
                        "markers": null,
                        "orig": null,
                        "source": "had",
                        "target": ""
                    },
                    {
                        "id": "RUT1-168",
                        "markers": null,
                        "orig": null,
                        "source": "heard",
                        "target": ""
                    },
                    {
                        "id": "RUT1-169",
                        "markers": null,
                        "orig": null,
                        "source": "in",
                        "target": ""
                    },
                    {
                        "id": "RUT1-170",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-171",
                        "markers": null,
                        "orig": null,
                        "source": "country",
                        "target": ""
                    },
                    {
                        "id": "RUT1-172",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT1-173",
                        "markers": null,
                        "orig": null,
                        "source": "Moab",
                        "target": ""
                    },
                    {
                        "id": "RUT1-174",
                        "markers": null,
                        "orig": null,
                        "source": "how",
                        "target": ""
                    },
                    {
                        "id": "RUT1-175",
                        "markers": null,
                        "orig": null,
                        "source": "that",
                        "target": ""
                    },
                    {
                        "id": "RUT1-176",
                        "markers": null,
                        "orig": null,
                        "source": "Yahweh",
                        "target": ""
                    },
                    {
                        "id": "RUT1-177",
                        "markers": "\\f +",
                        "orig": null,
                        "source": "\"Yahweh\"",
                        "target": ""
                    },
                    {
                        "id": "RUT1-178",
                        "markers": null,
                        "orig": null,
                        "source": "is",
                        "target": ""
                    },
                    {
                        "id": "RUT1-179",
                        "markers": null,
                        "orig": null,
                        "source": "God\'s",
                        "target": ""
                    },
                    {
                        "id": "RUT1-180",
                        "markers": null,
                        "orig": null,
                        "source": "proper",
                        "target": ""
                    },
                    {
                        "id": "RUT1-181",
                        "markers": null,
                        "orig": null,
                        "source": "Name,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-182",
                        "markers": null,
                        "orig": null,
                        "source": "sometimes",
                        "target": ""
                    },
                    {
                        "id": "RUT1-183",
                        "markers": null,
                        "orig": null,
                        "source": "rendered",
                        "target": ""
                    },
                    {
                        "id": "RUT1-184",
                        "markers": null,
                        "orig": null,
                        "source": "\"LORD\"",
                        "target": ""
                    },
                    {
                        "id": "RUT1-185",
                        "markers": null,
                        "orig": null,
                        "source": "(all",
                        "target": ""
                    },
                    {
                        "id": "RUT1-186",
                        "markers": null,
                        "orig": null,
                        "source": "caps)",
                        "target": ""
                    },
                    {
                        "id": "RUT1-187",
                        "markers": null,
                        "orig": null,
                        "source": "in",
                        "target": ""
                    },
                    {
                        "id": "RUT1-188",
                        "markers": null,
                        "orig": null,
                        "source": "other",
                        "target": ""
                    },
                    {
                        "id": "RUT1-189",
                        "markers": null,
                        "orig": null,
                        "source": "translations.",
                        "target": ""
                    },
                    {
                        "id": "RUT1-190",
                        "orig": null,
                        "markers": "\\f*",
                        "source": "had",
                        "target": ""
                    },
                    {
                        "id": "RUT1-191",
                        "markers": null,
                        "orig": null,
                        "source": "visited",
                        "target": ""
                    },
                    {
                        "id": "RUT1-192",
                        "markers": null,
                        "orig": null,
                        "source": "his",
                        "target": ""
                    },
                    {
                        "id": "RUT1-193",
                        "markers": null,
                        "orig": null,
                        "source": "people",
                        "target": ""
                    },
                    {
                        "id": "RUT1-194",
                        "markers": null,
                        "orig": null,
                        "source": "in",
                        "target": ""
                    },
                    {
                        "id": "RUT1-195",
                        "markers": null,
                        "orig": null,
                        "source": "giving",
                        "target": ""
                    },
                    {
                        "id": "RUT1-196",
                        "markers": null,
                        "orig": null,
                        "source": "them",
                        "target": ""
                    },
                    {
                        "id": "RUT1-197",
                        "markers": null,
                        "orig": null,
                        "source": "bread.",
                        "target": ""
                    },
                    {
                        "id": "RUT1-198",
                        "markers": "\\v 7",
                        "orig": null,
                        "source": "She",
                        "target": ""
                    },
                    {
                        "id": "RUT1-199",
                        "markers": null,
                        "orig": null,
                        "source": "went",
                        "target": ""
                    },
                    {
                        "id": "RUT1-200",
                        "markers": null,
                        "orig": null,
                        "source": "forth",
                        "target": ""
                    },
                    {
                        "id": "RUT1-201",
                        "markers": null,
                        "orig": null,
                        "source": "out",
                        "target": ""
                    },
                    {
                        "id": "RUT1-202",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT1-203",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-204",
                        "markers": null,
                        "orig": null,
                        "source": "place",
                        "target": ""
                    },
                    {
                        "id": "RUT1-205",
                        "markers": null,
                        "orig": null,
                        "source": "where",
                        "target": ""
                    },
                    {
                        "id": "RUT1-206",
                        "markers": null,
                        "orig": null,
                        "source": "she",
                        "target": ""
                    },
                    {
                        "id": "RUT1-207",
                        "markers": null,
                        "orig": null,
                        "source": "was,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-208",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-209",
                        "markers": null,
                        "orig": null,
                        "source": "her",
                        "target": ""
                    },
                    {
                        "id": "RUT1-210",
                        "markers": null,
                        "orig": null,
                        "source": "two",
                        "target": ""
                    },
                    {
                        "id": "RUT1-211",
                        "markers": null,
                        "orig": null,
                        "source": "daughters-in-law",
                        "target": ""
                    },
                    {
                        "id": "RUT1-212",
                        "markers": null,
                        "orig": null,
                        "source": "with",
                        "target": ""
                    },
                    {
                        "id": "RUT1-213",
                        "markers": null,
                        "orig": null,
                        "source": "her;",
                        "target": ""
                    },
                    {
                        "id": "RUT1-214",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-215",
                        "markers": null,
                        "orig": null,
                        "source": "they",
                        "target": ""
                    },
                    {
                        "id": "RUT1-216",
                        "markers": null,
                        "orig": null,
                        "source": "went",
                        "target": ""
                    },
                    {
                        "id": "RUT1-217",
                        "markers": null,
                        "orig": null,
                        "source": "on",
                        "target": ""
                    },
                    {
                        "id": "RUT1-218",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-219",
                        "markers": null,
                        "orig": null,
                        "source": "way",
                        "target": ""
                    },
                    {
                        "id": "RUT1-220",
                        "markers": null,
                        "orig": null,
                        "source": "to",
                        "target": ""
                    },
                    {
                        "id": "RUT1-221",
                        "markers": null,
                        "orig": null,
                        "source": "return",
                        "target": ""
                    },
                    {
                        "id": "RUT1-222",
                        "markers": null,
                        "orig": null,
                        "source": "to",
                        "target": ""
                    },
                    {
                        "id": "RUT1-223",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-224",
                        "markers": null,
                        "orig": null,
                        "source": "land",
                        "target": ""
                    },
                    {
                        "id": "RUT1-225",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT1-226",
                        "markers": null,
                        "orig": null,
                        "source": "Judah.",
                        "target": ""
                    },
                    {
                        "id": "RUT1-227",
                        "markers": "\\v 8",
                        "orig": null,
                        "source": "Naomi",
                        "target": ""
                    },
                    {
                        "id": "RUT1-228",
                        "markers": null,
                        "orig": null,
                        "source": "said",
                        "target": ""
                    },
                    {
                        "id": "RUT1-229",
                        "markers": null,
                        "orig": null,
                        "source": "to",
                        "target": ""
                    },
                    {
                        "id": "RUT1-230",
                        "markers": null,
                        "orig": null,
                        "source": "her",
                        "target": ""
                    },
                    {
                        "id": "RUT1-231",
                        "markers": null,
                        "orig": null,
                        "source": "two",
                        "target": ""
                    },
                    {
                        "id": "RUT1-232",
                        "markers": null,
                        "orig": null,
                        "source": "daughters-in-law,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-233",
                        "markers": null,
                        "orig": null,
                        "source": "\"Go,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-234",
                        "markers": null,
                        "orig": null,
                        "source": "return",
                        "target": ""
                    },
                    {
                        "id": "RUT1-235",
                        "markers": null,
                        "orig": null,
                        "source": "each",
                        "target": ""
                    },
                    {
                        "id": "RUT1-236",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT1-237",
                        "markers": null,
                        "orig": null,
                        "source": "you",
                        "target": ""
                    },
                    {
                        "id": "RUT1-238",
                        "markers": null,
                        "orig": null,
                        "source": "to",
                        "target": ""
                    },
                    {
                        "id": "RUT1-239",
                        "markers": null,
                        "orig": null,
                        "source": "her",
                        "target": ""
                    },
                    {
                        "id": "RUT1-240",
                        "markers": null,
                        "orig": null,
                        "source": "mother\'s",
                        "target": ""
                    },
                    {
                        "id": "RUT1-241",
                        "markers": null,
                        "orig": null,
                        "source": "house:",
                        "target": ""
                    },
                    {
                        "id": "RUT1-242",
                        "markers": null,
                        "orig": null,
                        "source": "Yahweh",
                        "target": ""
                    },
                    {
                        "id": "RUT1-243",
                        "markers": null,
                        "orig": null,
                        "source": "deal",
                        "target": ""
                    },
                    {
                        "id": "RUT1-244",
                        "markers": null,
                        "orig": null,
                        "source": "kindly",
                        "target": ""
                    },
                    {
                        "id": "RUT1-245",
                        "markers": null,
                        "orig": null,
                        "source": "with",
                        "target": ""
                    },
                    {
                        "id": "RUT1-246",
                        "markers": null,
                        "orig": null,
                        "source": "you,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-247",
                        "markers": null,
                        "orig": null,
                        "source": "as",
                        "target": ""
                    },
                    {
                        "id": "RUT1-248",
                        "markers": null,
                        "orig": null,
                        "source": "you",
                        "target": ""
                    },
                    {
                        "id": "RUT1-249",
                        "markers": null,
                        "orig": null,
                        "source": "have",
                        "target": ""
                    },
                    {
                        "id": "RUT1-250",
                        "markers": null,
                        "orig": null,
                        "source": "dealt",
                        "target": ""
                    },
                    {
                        "id": "RUT1-251",
                        "markers": null,
                        "orig": null,
                        "source": "with",
                        "target": ""
                    },
                    {
                        "id": "RUT1-252",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-253",
                        "markers": null,
                        "orig": null,
                        "source": "dead,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-254",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-255",
                        "markers": null,
                        "orig": null,
                        "source": "with",
                        "target": ""
                    },
                    {
                        "id": "RUT1-256",
                        "markers": null,
                        "orig": null,
                        "source": "me.",
                        "target": ""
                    },
                    {
                        "id": "RUT1-257",
                        "markers": "\\v 9",
                        "orig": null,
                        "source": "Yahweh",
                        "target": ""
                    },
                    {
                        "id": "RUT1-258",
                        "markers": null,
                        "orig": null,
                        "source": "grant",
                        "target": ""
                    },
                    {
                        "id": "RUT1-259",
                        "markers": null,
                        "orig": null,
                        "source": "you",
                        "target": ""
                    },
                    {
                        "id": "RUT1-260",
                        "markers": null,
                        "orig": null,
                        "source": "that",
                        "target": ""
                    },
                    {
                        "id": "RUT1-261",
                        "markers": null,
                        "orig": null,
                        "source": "you",
                        "target": ""
                    },
                    {
                        "id": "RUT1-262",
                        "markers": null,
                        "orig": null,
                        "source": "may",
                        "target": ""
                    },
                    {
                        "id": "RUT1-263",
                        "markers": null,
                        "orig": null,
                        "source": "find",
                        "target": ""
                    },
                    {
                        "id": "RUT1-264",
                        "markers": null,
                        "orig": null,
                        "source": "rest,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-265",
                        "markers": null,
                        "orig": null,
                        "source": "each",
                        "target": ""
                    },
                    {
                        "id": "RUT1-266",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT1-267",
                        "markers": null,
                        "orig": null,
                        "source": "you",
                        "target": ""
                    },
                    {
                        "id": "RUT1-268",
                        "markers": null,
                        "orig": null,
                        "source": "in",
                        "target": ""
                    },
                    {
                        "id": "RUT1-269",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-270",
                        "markers": null,
                        "orig": null,
                        "source": "house",
                        "target": ""
                    },
                    {
                        "id": "RUT1-271",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT1-272",
                        "markers": null,
                        "orig": null,
                        "source": "her",
                        "target": ""
                    },
                    {
                        "id": "RUT1-273",
                        "markers": null,
                        "orig": null,
                        "source": "husband.",
                        "target": ""
                    },
                    {
                        "id": "RUT1-274",
                        "markers": "\\p",
                        "orig": null,
                        "source": "Then",
                        "target": ""
                    },
                    {
                        "id": "RUT1-275",
                        "markers": null,
                        "orig": null,
                        "source": "she",
                        "target": ""
                    },
                    {
                        "id": "RUT1-276",
                        "markers": null,
                        "orig": null,
                        "source": "kissed",
                        "target": ""
                    },
                    {
                        "id": "RUT1-277",
                        "markers": null,
                        "orig": null,
                        "source": "them,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-278",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-279",
                        "markers": null,
                        "orig": null,
                        "source": "they",
                        "target": ""
                    },
                    {
                        "id": "RUT1-280",
                        "markers": null,
                        "orig": null,
                        "source": "lifted",
                        "target": ""
                    },
                    {
                        "id": "RUT1-281",
                        "markers": null,
                        "orig": null,
                        "source": "up",
                        "target": ""
                    },
                    {
                        "id": "RUT1-282",
                        "markers": null,
                        "orig": null,
                        "source": "their",
                        "target": ""
                    },
                    {
                        "id": "RUT1-283",
                        "markers": null,
                        "orig": null,
                        "source": "voice,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-284",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-285",
                        "markers": null,
                        "orig": null,
                        "source": "wept.",
                        "target": ""
                    },
                    {
                        "id": "RUT1-286",
                        "markers": "\\v 10",
                        "orig": null,
                        "source": "They",
                        "target": ""
                    },
                    {
                        "id": "RUT1-287",
                        "markers": null,
                        "orig": null,
                        "source": "said",
                        "target": ""
                    },
                    {
                        "id": "RUT1-288",
                        "markers": null,
                        "orig": null,
                        "source": "to",
                        "target": ""
                    },
                    {
                        "id": "RUT1-289",
                        "markers": null,
                        "orig": null,
                        "source": "her,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-290",
                        "markers": null,
                        "orig": null,
                        "source": "\"No,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-291",
                        "markers": null,
                        "orig": null,
                        "source": "but",
                        "target": ""
                    },
                    {
                        "id": "RUT1-292",
                        "markers": null,
                        "orig": null,
                        "source": "we",
                        "target": ""
                    },
                    {
                        "id": "RUT1-293",
                        "markers": null,
                        "orig": null,
                        "source": "will",
                        "target": ""
                    },
                    {
                        "id": "RUT1-294",
                        "markers": null,
                        "orig": null,
                        "source": "return",
                        "target": ""
                    },
                    {
                        "id": "RUT1-295",
                        "markers": null,
                        "orig": null,
                        "source": "with",
                        "target": ""
                    },
                    {
                        "id": "RUT1-296",
                        "markers": null,
                        "orig": null,
                        "source": "you",
                        "target": ""
                    },
                    {
                        "id": "RUT1-297",
                        "markers": null,
                        "orig": null,
                        "source": "to",
                        "target": ""
                    },
                    {
                        "id": "RUT1-298",
                        "markers": null,
                        "orig": null,
                        "source": "your",
                        "target": ""
                    },
                    {
                        "id": "RUT1-299",
                        "markers": null,
                        "orig": null,
                        "source": "people.\"",
                        "target": ""
                    },
                    {
                        "id": "RUT1-300",
                        "markers": "\\p \\v 11",
                        "orig": null,
                        "source": "Naomi",
                        "target": ""
                    },
                    {
                        "id": "RUT1-301",
                        "markers": null,
                        "orig": null,
                        "source": "said,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-302",
                        "markers": null,
                        "orig": null,
                        "source": "\"Go",
                        "target": ""
                    },
                    {
                        "id": "RUT1-303",
                        "markers": null,
                        "orig": null,
                        "source": "back,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-304",
                        "markers": null,
                        "orig": null,
                        "source": "my",
                        "target": ""
                    },
                    {
                        "id": "RUT1-305",
                        "markers": null,
                        "orig": null,
                        "source": "daughters.",
                        "target": ""
                    },
                    {
                        "id": "RUT1-306",
                        "markers": null,
                        "orig": null,
                        "source": "Why",
                        "target": ""
                    },
                    {
                        "id": "RUT1-307",
                        "markers": null,
                        "orig": null,
                        "source": "do",
                        "target": ""
                    },
                    {
                        "id": "RUT1-308",
                        "markers": null,
                        "orig": null,
                        "source": "you",
                        "target": ""
                    },
                    {
                        "id": "RUT1-309",
                        "markers": null,
                        "orig": null,
                        "source": "want",
                        "target": ""
                    },
                    {
                        "id": "RUT1-310",
                        "markers": null,
                        "orig": null,
                        "source": "to",
                        "target": ""
                    },
                    {
                        "id": "RUT1-311",
                        "markers": null,
                        "orig": null,
                        "source": "go",
                        "target": ""
                    },
                    {
                        "id": "RUT1-312",
                        "markers": null,
                        "orig": null,
                        "source": "with",
                        "target": ""
                    },
                    {
                        "id": "RUT1-313",
                        "markers": null,
                        "orig": null,
                        "source": "me?",
                        "target": ""
                    },
                    {
                        "id": "RUT1-314",
                        "markers": null,
                        "orig": null,
                        "source": "Do",
                        "target": ""
                    },
                    {
                        "id": "RUT1-315",
                        "markers": null,
                        "orig": null,
                        "source": "I",
                        "target": ""
                    },
                    {
                        "id": "RUT1-316",
                        "markers": null,
                        "orig": null,
                        "source": "still",
                        "target": ""
                    },
                    {
                        "id": "RUT1-317",
                        "markers": null,
                        "orig": null,
                        "source": "have",
                        "target": ""
                    },
                    {
                        "id": "RUT1-318",
                        "markers": null,
                        "orig": null,
                        "source": "sons",
                        "target": ""
                    },
                    {
                        "id": "RUT1-319",
                        "markers": null,
                        "orig": null,
                        "source": "in",
                        "target": ""
                    },
                    {
                        "id": "RUT1-320",
                        "markers": null,
                        "orig": null,
                        "source": "my",
                        "target": ""
                    },
                    {
                        "id": "RUT1-321",
                        "markers": null,
                        "orig": null,
                        "source": "womb,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-322",
                        "markers": null,
                        "orig": null,
                        "source": "that",
                        "target": ""
                    },
                    {
                        "id": "RUT1-323",
                        "markers": null,
                        "orig": null,
                        "source": "they",
                        "target": ""
                    },
                    {
                        "id": "RUT1-324",
                        "markers": null,
                        "orig": null,
                        "source": "may",
                        "target": ""
                    },
                    {
                        "id": "RUT1-325",
                        "markers": null,
                        "orig": null,
                        "source": "be",
                        "target": ""
                    },
                    {
                        "id": "RUT1-326",
                        "markers": null,
                        "orig": null,
                        "source": "your",
                        "target": ""
                    },
                    {
                        "id": "RUT1-327",
                        "markers": null,
                        "orig": null,
                        "source": "husbands?",
                        "target": ""
                    },
                    {
                        "id": "RUT1-328",
                        "orig": null,
                        "markers": "\\v 12",
                        "source": "Go",
                        "target": ""
                    },
                    {
                        "id": "RUT1-329",
                        "markers": null,
                        "orig": null,
                        "source": "back,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-330",
                        "markers": null,
                        "orig": null,
                        "source": "go",
                        "target": ""
                    },
                    {
                        "id": "RUT1-331",
                        "markers": null,
                        "orig": null,
                        "source": "your",
                        "target": ""
                    },
                    {
                        "id": "RUT1-332",
                        "markers": null,
                        "orig": null,
                        "source": "way;",
                        "target": ""
                    },
                    {
                        "id": "RUT1-333",
                        "markers": null,
                        "orig": null,
                        "source": "for",
                        "target": ""
                    },
                    {
                        "id": "RUT1-334",
                        "markers": null,
                        "orig": null,
                        "source": "I",
                        "target": ""
                    },
                    {
                        "id": "RUT1-335",
                        "markers": null,
                        "orig": null,
                        "source": "am",
                        "target": ""
                    },
                    {
                        "id": "RUT1-336",
                        "markers": null,
                        "orig": null,
                        "source": "too",
                        "target": ""
                    },
                    {
                        "id": "RUT1-337",
                        "markers": null,
                        "orig": null,
                        "source": "old",
                        "target": ""
                    },
                    {
                        "id": "RUT1-338",
                        "markers": null,
                        "orig": null,
                        "source": "to",
                        "target": ""
                    },
                    {
                        "id": "RUT1-339",
                        "markers": null,
                        "orig": null,
                        "source": "have",
                        "target": ""
                    },
                    {
                        "id": "RUT1-340",
                        "markers": null,
                        "orig": null,
                        "source": "a",
                        "target": ""
                    },
                    {
                        "id": "RUT1-341",
                        "markers": null,
                        "orig": null,
                        "source": "husband.",
                        "target": ""
                    },
                    {
                        "id": "RUT1-342",
                        "markers": null,
                        "orig": null,
                        "source": "If",
                        "target": ""
                    },
                    {
                        "id": "RUT1-343",
                        "markers": null,
                        "orig": null,
                        "source": "I",
                        "target": ""
                    },
                    {
                        "id": "RUT1-344",
                        "markers": null,
                        "orig": null,
                        "source": "should",
                        "target": ""
                    },
                    {
                        "id": "RUT1-345",
                        "markers": null,
                        "orig": null,
                        "source": "say,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-346",
                        "markers": null,
                        "orig": null,
                        "source": "\'I",
                        "target": ""
                    },
                    {
                        "id": "RUT1-347",
                        "markers": null,
                        "orig": null,
                        "source": "have",
                        "target": ""
                    },
                    {
                        "id": "RUT1-348",
                        "markers": null,
                        "orig": null,
                        "source": "hope,\'",
                        "target": ""
                    },
                    {
                        "id": "RUT1-349",
                        "markers": null,
                        "orig": null,
                        "source": "if",
                        "target": ""
                    },
                    {
                        "id": "RUT1-350",
                        "markers": null,
                        "orig": null,
                        "source": "I",
                        "target": ""
                    },
                    {
                        "id": "RUT1-351",
                        "markers": null,
                        "orig": null,
                        "source": "should",
                        "target": ""
                    },
                    {
                        "id": "RUT1-352",
                        "markers": null,
                        "orig": null,
                        "source": "even",
                        "target": ""
                    },
                    {
                        "id": "RUT1-353",
                        "markers": null,
                        "orig": null,
                        "source": "have",
                        "target": ""
                    },
                    {
                        "id": "RUT1-354",
                        "markers": null,
                        "orig": null,
                        "source": "a",
                        "target": ""
                    },
                    {
                        "id": "RUT1-355",
                        "markers": null,
                        "orig": null,
                        "source": "husband",
                        "target": ""
                    },
                    {
                        "id": "RUT1-356",
                        "markers": null,
                        "orig": null,
                        "source": "tonight,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-357",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-358",
                        "markers": null,
                        "orig": null,
                        "source": "should",
                        "target": ""
                    },
                    {
                        "id": "RUT1-359",
                        "markers": null,
                        "orig": null,
                        "source": "also",
                        "target": ""
                    },
                    {
                        "id": "RUT1-360",
                        "markers": null,
                        "orig": null,
                        "source": "bear",
                        "target": ""
                    },
                    {
                        "id": "RUT1-361",
                        "markers": null,
                        "orig": null,
                        "source": "sons;",
                        "target": ""
                    },
                    {
                        "id": "RUT1-362",
                        "orig": null,
                        "markers": "\\v 13",
                        "source": "would",
                        "target": ""
                    },
                    {
                        "id": "RUT1-363",
                        "markers": null,
                        "orig": null,
                        "source": "you",
                        "target": ""
                    },
                    {
                        "id": "RUT1-364",
                        "markers": null,
                        "orig": null,
                        "source": "then",
                        "target": ""
                    },
                    {
                        "id": "RUT1-365",
                        "markers": null,
                        "orig": null,
                        "source": "wait",
                        "target": ""
                    },
                    {
                        "id": "RUT1-366",
                        "markers": null,
                        "orig": null,
                        "source": "until",
                        "target": ""
                    },
                    {
                        "id": "RUT1-367",
                        "markers": null,
                        "orig": null,
                        "source": "they",
                        "target": ""
                    },
                    {
                        "id": "RUT1-368",
                        "markers": null,
                        "orig": null,
                        "source": "were",
                        "target": ""
                    },
                    {
                        "id": "RUT1-369",
                        "markers": null,
                        "orig": null,
                        "source": "grown?",
                        "target": ""
                    },
                    {
                        "id": "RUT1-370",
                        "markers": null,
                        "orig": null,
                        "source": "Would",
                        "target": ""
                    },
                    {
                        "id": "RUT1-371",
                        "markers": null,
                        "orig": null,
                        "source": "you",
                        "target": ""
                    },
                    {
                        "id": "RUT1-372",
                        "markers": null,
                        "orig": null,
                        "source": "then",
                        "target": ""
                    },
                    {
                        "id": "RUT1-373",
                        "markers": null,
                        "orig": null,
                        "source": "refrain",
                        "target": ""
                    },
                    {
                        "id": "RUT1-374",
                        "markers": null,
                        "orig": null,
                        "source": "from",
                        "target": ""
                    },
                    {
                        "id": "RUT1-375",
                        "markers": null,
                        "orig": null,
                        "source": "having",
                        "target": ""
                    },
                    {
                        "id": "RUT1-376",
                        "markers": null,
                        "orig": null,
                        "source": "husbands?",
                        "target": ""
                    },
                    {
                        "id": "RUT1-377",
                        "markers": null,
                        "orig": null,
                        "source": "No,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-378",
                        "markers": null,
                        "orig": null,
                        "source": "my",
                        "target": ""
                    },
                    {
                        "id": "RUT1-379",
                        "markers": null,
                        "orig": null,
                        "source": "daughters,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-380",
                        "markers": null,
                        "orig": null,
                        "source": "for",
                        "target": ""
                    },
                    {
                        "id": "RUT1-381",
                        "markers": null,
                        "orig": null,
                        "source": "it",
                        "target": ""
                    },
                    {
                        "id": "RUT1-382",
                        "markers": null,
                        "orig": null,
                        "source": "grieves",
                        "target": ""
                    },
                    {
                        "id": "RUT1-383",
                        "markers": null,
                        "orig": null,
                        "source": "me",
                        "target": ""
                    },
                    {
                        "id": "RUT1-384",
                        "markers": null,
                        "orig": null,
                        "source": "much",
                        "target": ""
                    },
                    {
                        "id": "RUT1-385",
                        "markers": null,
                        "orig": null,
                        "source": "for",
                        "target": ""
                    },
                    {
                        "id": "RUT1-386",
                        "markers": null,
                        "orig": null,
                        "source": "your",
                        "target": ""
                    },
                    {
                        "id": "RUT1-387",
                        "markers": null,
                        "orig": null,
                        "source": "sakes,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-388",
                        "markers": null,
                        "orig": null,
                        "source": "for",
                        "target": ""
                    },
                    {
                        "id": "RUT1-389",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-390",
                        "markers": null,
                        "orig": null,
                        "source": "hand",
                        "target": ""
                    },
                    {
                        "id": "RUT1-391",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT1-392",
                        "markers": null,
                        "orig": null,
                        "source": "Yahweh",
                        "target": ""
                    },
                    {
                        "id": "RUT1-393",
                        "markers": null,
                        "orig": null,
                        "source": "has",
                        "target": ""
                    },
                    {
                        "id": "RUT1-394",
                        "markers": null,
                        "orig": null,
                        "source": "gone",
                        "target": ""
                    },
                    {
                        "id": "RUT1-395",
                        "markers": null,
                        "orig": null,
                        "source": "out",
                        "target": ""
                    },
                    {
                        "id": "RUT1-396",
                        "markers": null,
                        "orig": null,
                        "source": "against",
                        "target": ""
                    },
                    {
                        "id": "RUT1-397",
                        "markers": null,
                        "orig": null,
                        "source": "me.\"",
                        "target": ""
                    },
                    {
                        "id": "RUT1-398",
                        "markers": "\\p \\v 14",
                        "orig": null,
                        "source": "They",
                        "target": ""
                    },
                    {
                        "id": "RUT1-399",
                        "markers": null,
                        "orig": null,
                        "source": "lifted",
                        "target": ""
                    },
                    {
                        "id": "RUT1-400",
                        "markers": null,
                        "orig": null,
                        "source": "up",
                        "target": ""
                    },
                    {
                        "id": "RUT1-401",
                        "markers": null,
                        "orig": null,
                        "source": "their",
                        "target": ""
                    },
                    {
                        "id": "RUT1-402",
                        "markers": null,
                        "orig": null,
                        "source": "voice,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-403",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-404",
                        "markers": null,
                        "orig": null,
                        "source": "wept",
                        "target": ""
                    },
                    {
                        "id": "RUT1-405",
                        "markers": null,
                        "orig": null,
                        "source": "again:",
                        "target": ""
                    },
                    {
                        "id": "RUT1-406",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-407",
                        "markers": null,
                        "orig": null,
                        "source": "Orpah",
                        "target": ""
                    },
                    {
                        "id": "RUT1-408",
                        "markers": null,
                        "orig": null,
                        "source": "kissed",
                        "target": ""
                    },
                    {
                        "id": "RUT1-409",
                        "markers": null,
                        "orig": null,
                        "source": "her",
                        "target": ""
                    },
                    {
                        "id": "RUT1-410",
                        "markers": null,
                        "orig": null,
                        "source": "mother-in-law,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-411",
                        "markers": null,
                        "orig": null,
                        "source": "but",
                        "target": ""
                    },
                    {
                        "id": "RUT1-412",
                        "markers": null,
                        "orig": null,
                        "source": "Ruth",
                        "target": ""
                    },
                    {
                        "id": "RUT1-413",
                        "markers": null,
                        "orig": null,
                        "source": "joined",
                        "target": ""
                    },
                    {
                        "id": "RUT1-414",
                        "markers": null,
                        "orig": null,
                        "source": "with",
                        "target": ""
                    },
                    {
                        "id": "RUT1-415",
                        "markers": null,
                        "orig": null,
                        "source": "her.",
                        "target": ""
                    },
                    {
                        "id": "RUT1-416",
                        "markers": "\\v 15",
                        "orig": null,
                        "source": "She",
                        "target": ""
                    },
                    {
                        "id": "RUT1-417",
                        "markers": null,
                        "orig": null,
                        "source": "said,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-418",
                        "markers": null,
                        "orig": null,
                        "source": "\"Behold,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-419",
                        "markers": null,
                        "orig": null,
                        "source": "your",
                        "target": ""
                    },
                    {
                        "id": "RUT1-420",
                        "markers": null,
                        "orig": null,
                        "source": "sister-in-law",
                        "target": ""
                    },
                    {
                        "id": "RUT1-421",
                        "markers": null,
                        "orig": null,
                        "source": "has",
                        "target": ""
                    },
                    {
                        "id": "RUT1-422",
                        "markers": null,
                        "orig": null,
                        "source": "gone",
                        "target": ""
                    },
                    {
                        "id": "RUT1-423",
                        "markers": null,
                        "orig": null,
                        "source": "back",
                        "target": ""
                    },
                    {
                        "id": "RUT1-424",
                        "markers": null,
                        "orig": null,
                        "source": "to",
                        "target": ""
                    },
                    {
                        "id": "RUT1-425",
                        "markers": null,
                        "orig": null,
                        "source": "her",
                        "target": ""
                    },
                    {
                        "id": "RUT1-426",
                        "markers": null,
                        "orig": null,
                        "source": "people,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-427",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-428",
                        "markers": null,
                        "orig": null,
                        "source": "to",
                        "target": ""
                    },
                    {
                        "id": "RUT1-429",
                        "markers": null,
                        "orig": null,
                        "source": "her",
                        "target": ""
                    },
                    {
                        "id": "RUT1-430",
                        "markers": null,
                        "orig": null,
                        "source": "god.",
                        "target": ""
                    },
                    {
                        "id": "RUT1-431",
                        "markers": null,
                        "orig": null,
                        "source": "Follow",
                        "target": ""
                    },
                    {
                        "id": "RUT1-432",
                        "markers": null,
                        "orig": null,
                        "source": "your",
                        "target": ""
                    },
                    {
                        "id": "RUT1-433",
                        "markers": null,
                        "orig": null,
                        "source": "sister-in-law.\"",
                        "target": ""
                    },
                    {
                        "id": "RUT1-434",
                        "markers": "\\p \\v 16",
                        "orig": null,
                        "source": "Ruth",
                        "target": ""
                    },
                    {
                        "id": "RUT1-435",
                        "markers": null,
                        "orig": null,
                        "source": "said,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-436",
                        "markers": null,
                        "orig": null,
                        "source": "\"Don\'t",
                        "target": ""
                    },
                    {
                        "id": "RUT1-437",
                        "markers": null,
                        "orig": null,
                        "source": "entreat",
                        "target": ""
                    },
                    {
                        "id": "RUT1-438",
                        "markers": null,
                        "orig": null,
                        "source": "me",
                        "target": ""
                    },
                    {
                        "id": "RUT1-439",
                        "markers": null,
                        "orig": null,
                        "source": "to",
                        "target": ""
                    },
                    {
                        "id": "RUT1-440",
                        "markers": null,
                        "orig": null,
                        "source": "leave",
                        "target": ""
                    },
                    {
                        "id": "RUT1-441",
                        "markers": null,
                        "orig": null,
                        "source": "you,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-442",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-443",
                        "markers": null,
                        "orig": null,
                        "source": "to",
                        "target": ""
                    },
                    {
                        "id": "RUT1-444",
                        "markers": null,
                        "orig": null,
                        "source": "return",
                        "target": ""
                    },
                    {
                        "id": "RUT1-445",
                        "markers": null,
                        "orig": null,
                        "source": "from",
                        "target": ""
                    },
                    {
                        "id": "RUT1-446",
                        "markers": null,
                        "orig": null,
                        "source": "following",
                        "target": ""
                    },
                    {
                        "id": "RUT1-447",
                        "markers": null,
                        "orig": null,
                        "source": "after",
                        "target": ""
                    },
                    {
                        "id": "RUT1-448",
                        "markers": null,
                        "orig": null,
                        "source": "you,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-449",
                        "markers": null,
                        "orig": null,
                        "source": "for",
                        "target": ""
                    },
                    {
                        "id": "RUT1-450",
                        "markers": null,
                        "orig": null,
                        "source": "where",
                        "target": ""
                    },
                    {
                        "id": "RUT1-451",
                        "markers": null,
                        "orig": null,
                        "source": "you",
                        "target": ""
                    },
                    {
                        "id": "RUT1-452",
                        "markers": null,
                        "orig": null,
                        "source": "go,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-453",
                        "markers": null,
                        "orig": null,
                        "source": "I",
                        "target": ""
                    },
                    {
                        "id": "RUT1-454",
                        "markers": null,
                        "orig": null,
                        "source": "will",
                        "target": ""
                    },
                    {
                        "id": "RUT1-455",
                        "markers": null,
                        "orig": null,
                        "source": "go;",
                        "target": ""
                    },
                    {
                        "id": "RUT1-456",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-457",
                        "markers": null,
                        "orig": null,
                        "source": "where",
                        "target": ""
                    },
                    {
                        "id": "RUT1-458",
                        "markers": null,
                        "orig": null,
                        "source": "you",
                        "target": ""
                    },
                    {
                        "id": "RUT1-459",
                        "markers": null,
                        "orig": null,
                        "source": "lodge,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-460",
                        "markers": null,
                        "orig": null,
                        "source": "I",
                        "target": ""
                    },
                    {
                        "id": "RUT1-461",
                        "markers": null,
                        "orig": null,
                        "source": "will",
                        "target": ""
                    },
                    {
                        "id": "RUT1-462",
                        "markers": null,
                        "orig": null,
                        "source": "lodge;",
                        "target": ""
                    },
                    {
                        "id": "RUT1-463",
                        "markers": null,
                        "orig": null,
                        "source": "your",
                        "target": ""
                    },
                    {
                        "id": "RUT1-464",
                        "markers": null,
                        "orig": null,
                        "source": "people",
                        "target": ""
                    },
                    {
                        "id": "RUT1-465",
                        "markers": null,
                        "orig": null,
                        "source": "will",
                        "target": ""
                    },
                    {
                        "id": "RUT1-466",
                        "markers": null,
                        "orig": null,
                        "source": "be",
                        "target": ""
                    },
                    {
                        "id": "RUT1-467",
                        "markers": null,
                        "orig": null,
                        "source": "my",
                        "target": ""
                    },
                    {
                        "id": "RUT1-468",
                        "markers": null,
                        "orig": null,
                        "source": "people,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-470",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-471",
                        "markers": null,
                        "orig": null,
                        "source": "your",
                        "target": ""
                    },
                    {
                        "id": "RUT1-472",
                        "markers": null,
                        "orig": null,
                        "source": "God",
                        "target": ""
                    },
                    {
                        "id": "RUT1-473",
                        "markers": "\\f +",
                        "orig": null,
                        "source": "The",
                        "target": ""
                    },
                    {
                        "id": "RUT1-474",
                        "markers": null,
                        "orig": null,
                        "source": "Hebrew",
                        "target": ""
                    },
                    {
                        "id": "RUT1-475",
                        "markers": null,
                        "orig": null,
                        "source": "word",
                        "target": ""
                    },
                    {
                        "id": "RUT1-476",
                        "markers": null,
                        "orig": null,
                        "source": "\"God\"",
                        "target": ""
                    },
                    {
                        "id": "RUT1-477",
                        "markers": null,
                        "orig": null,
                        "source": "is",
                        "target": ""
                    },
                    {
                        "id": "RUT1-478",
                        "markers": null,
                        "orig": null,
                        "source": "\"Elohim\".",
                        "target": ""
                    },
                    {
                        "id": "RUT1-479",
                        "orig": null,
                        "markers": "\\f*",
                        "source": "my",
                        "target": ""
                    },
                    {
                        "id": "RUT1-480",
                        "markers": null,
                        "orig": null,
                        "source": "God;",
                        "target": ""
                    },
                    {
                        "id": "RUT1-481",
                        "orig": null,
                        "markers": "\\v 17",
                        "source": "where",
                        "target": ""
                    },
                    {
                        "id": "RUT1-482",
                        "markers": null,
                        "orig": null,
                        "source": "you",
                        "target": ""
                    },
                    {
                        "id": "RUT1-483",
                        "markers": null,
                        "orig": null,
                        "source": "die,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-484",
                        "markers": null,
                        "orig": null,
                        "source": "will",
                        "target": ""
                    },
                    {
                        "id": "RUT1-485",
                        "markers": null,
                        "orig": null,
                        "source": "I",
                        "target": ""
                    },
                    {
                        "id": "RUT1-486",
                        "markers": null,
                        "orig": null,
                        "source": "die,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-487",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-488",
                        "markers": null,
                        "orig": null,
                        "source": "there",
                        "target": ""
                    },
                    {
                        "id": "RUT1-489",
                        "markers": null,
                        "orig": null,
                        "source": "will",
                        "target": ""
                    },
                    {
                        "id": "RUT1-490",
                        "markers": null,
                        "orig": null,
                        "source": "I",
                        "target": ""
                    },
                    {
                        "id": "RUT1-491",
                        "markers": null,
                        "orig": null,
                        "source": "be",
                        "target": ""
                    },
                    {
                        "id": "RUT1-492",
                        "markers": null,
                        "orig": null,
                        "source": "buried.",
                        "target": ""
                    },
                    {
                        "id": "RUT1-493",
                        "markers": null,
                        "orig": null,
                        "source": "Yahweh",
                        "target": ""
                    },
                    {
                        "id": "RUT1-494",
                        "markers": null,
                        "orig": null,
                        "source": "do",
                        "target": ""
                    },
                    {
                        "id": "RUT1-495",
                        "markers": null,
                        "orig": null,
                        "source": "to",
                        "target": ""
                    },
                    {
                        "id": "RUT1-496",
                        "markers": null,
                        "orig": null,
                        "source": "me,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-497",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-498",
                        "markers": null,
                        "orig": null,
                        "source": "more",
                        "target": ""
                    },
                    {
                        "id": "RUT1-499",
                        "markers": null,
                        "orig": null,
                        "source": "also,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-500",
                        "markers": null,
                        "orig": null,
                        "source": "if",
                        "target": ""
                    },
                    {
                        "id": "RUT1-501",
                        "markers": null,
                        "orig": null,
                        "source": "anything",
                        "target": ""
                    },
                    {
                        "id": "RUT1-502",
                        "markers": null,
                        "orig": null,
                        "source": "but",
                        "target": ""
                    },
                    {
                        "id": "RUT1-503",
                        "markers": null,
                        "orig": null,
                        "source": "death",
                        "target": ""
                    },
                    {
                        "id": "RUT1-504",
                        "markers": null,
                        "orig": null,
                        "source": "part",
                        "target": ""
                    },
                    {
                        "id": "RUT1-505",
                        "markers": null,
                        "orig": null,
                        "source": "you",
                        "target": ""
                    },
                    {
                        "id": "RUT1-506",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-507",
                        "markers": null,
                        "orig": null,
                        "source": "me.\"",
                        "target": ""
                    },
                    {
                        "id": "RUT1-508",
                        "orig": null,
                        "markers": "\\p \\v 18",
                        "source": "When",
                        "target": ""
                    },
                    {
                        "id": "RUT1-509",
                        "markers": null,
                        "orig": null,
                        "source": "she",
                        "target": ""
                    },
                    {
                        "id": "RUT1-510",
                        "markers": null,
                        "orig": null,
                        "source": "saw",
                        "target": ""
                    },
                    {
                        "id": "RUT1-511",
                        "markers": null,
                        "orig": null,
                        "source": "that",
                        "target": ""
                    },
                    {
                        "id": "RUT1-512",
                        "markers": null,
                        "orig": null,
                        "source": "she",
                        "target": ""
                    },
                    {
                        "id": "RUT1-513",
                        "markers": null,
                        "orig": null,
                        "source": "was",
                        "target": ""
                    },
                    {
                        "id": "RUT1-514",
                        "markers": null,
                        "orig": null,
                        "source": "steadfastly",
                        "target": ""
                    },
                    {
                        "id": "RUT1-515",
                        "markers": null,
                        "orig": null,
                        "source": "minded",
                        "target": ""
                    },
                    {
                        "id": "RUT1-516",
                        "markers": null,
                        "orig": null,
                        "source": "to",
                        "target": ""
                    },
                    {
                        "id": "RUT1-517",
                        "markers": null,
                        "orig": null,
                        "source": "go",
                        "target": ""
                    },
                    {
                        "id": "RUT1-518",
                        "markers": null,
                        "orig": null,
                        "source": "with",
                        "target": ""
                    },
                    {
                        "id": "RUT1-519",
                        "markers": null,
                        "orig": null,
                        "source": "her,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-520",
                        "markers": null,
                        "orig": null,
                        "source": "she",
                        "target": ""
                    },
                    {
                        "id": "RUT1-521",
                        "markers": null,
                        "orig": null,
                        "source": "left",
                        "target": ""
                    },
                    {
                        "id": "RUT1-522",
                        "markers": null,
                        "orig": null,
                        "source": "off",
                        "target": ""
                    },
                    {
                        "id": "RUT1-523",
                        "markers": null,
                        "orig": null,
                        "source": "speaking",
                        "target": ""
                    },
                    {
                        "id": "RUT1-524",
                        "markers": null,
                        "orig": null,
                        "source": "to",
                        "target": ""
                    },
                    {
                        "id": "RUT1-525",
                        "markers": null,
                        "orig": null,
                        "source": "her.",
                        "target": ""
                    },
                    {
                        "id": "RUT1-526",
                        "markers": "\\p \\v 19",
                        "orig": null,
                        "source": "So",
                        "target": ""
                    },
                    {
                        "id": "RUT1-527",
                        "markers": null,
                        "orig": null,
                        "source": "they",
                        "target": ""
                    },
                    {
                        "id": "RUT1-528",
                        "markers": null,
                        "orig": null,
                        "source": "two",
                        "target": ""
                    },
                    {
                        "id": "RUT1-529",
                        "markers": null,
                        "orig": null,
                        "source": "went",
                        "target": ""
                    },
                    {
                        "id": "RUT1-530",
                        "markers": null,
                        "orig": null,
                        "source": "until",
                        "target": ""
                    },
                    {
                        "id": "RUT1-531",
                        "markers": null,
                        "orig": null,
                        "source": "they",
                        "target": ""
                    },
                    {
                        "id": "RUT1-532",
                        "markers": null,
                        "orig": null,
                        "source": "came",
                        "target": ""
                    },
                    {
                        "id": "RUT1-533",
                        "markers": null,
                        "orig": null,
                        "source": "to",
                        "target": ""
                    },
                    {
                        "id": "RUT1-534",
                        "markers": null,
                        "orig": null,
                        "source": "Bethlehem.",
                        "target": ""
                    },
                    {
                        "id": "RUT1-535",
                        "markers": null,
                        "orig": null,
                        "source": "It",
                        "target": ""
                    },
                    {
                        "id": "RUT1-536",
                        "markers": null,
                        "orig": null,
                        "source": "Happened,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-537",
                        "markers": null,
                        "orig": null,
                        "source": "when",
                        "target": ""
                    },
                    {
                        "id": "RUT1-538",
                        "markers": null,
                        "orig": null,
                        "source": "they",
                        "target": ""
                    },
                    {
                        "id": "RUT1-539",
                        "markers": null,
                        "orig": null,
                        "source": "had",
                        "target": ""
                    },
                    {
                        "id": "RUT1-540",
                        "markers": null,
                        "orig": null,
                        "source": "come",
                        "target": ""
                    },
                    {
                        "id": "RUT1-541",
                        "markers": null,
                        "orig": null,
                        "source": "to",
                        "target": ""
                    },
                    {
                        "id": "RUT1-542",
                        "markers": null,
                        "orig": null,
                        "source": "Bethlehem,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-543",
                        "markers": null,
                        "orig": null,
                        "source": "that",
                        "target": ""
                    },
                    {
                        "id": "RUT1-544",
                        "markers": null,
                        "orig": null,
                        "source": "all",
                        "target": ""
                    },
                    {
                        "id": "RUT1-545",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-546",
                        "markers": null,
                        "orig": null,
                        "source": "city",
                        "target": ""
                    },
                    {
                        "id": "RUT1-547",
                        "markers": null,
                        "orig": null,
                        "source": "was",
                        "target": ""
                    },
                    {
                        "id": "RUT1-548",
                        "markers": null,
                        "orig": null,
                        "source": "moved",
                        "target": ""
                    },
                    {
                        "id": "RUT1-549",
                        "markers": null,
                        "orig": null,
                        "source": "about",
                        "target": ""
                    },
                    {
                        "id": "RUT1-550",
                        "markers": null,
                        "orig": null,
                        "source": "them,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-551",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-552",
                        "markers": null,
                        "orig": null,
                        "source": "they",
                        "target": ""
                    },
                    {
                        "id": "RUT1-553",
                        "markers": null,
                        "orig": null,
                        "source": "asked,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-554",
                        "markers": null,
                        "orig": null,
                        "source": "\"Is",
                        "target": ""
                    },
                    {
                        "id": "RUT1-555",
                        "markers": null,
                        "orig": null,
                        "source": "this",
                        "target": ""
                    },
                    {
                        "id": "RUT1-556",
                        "markers": null,
                        "orig": null,
                        "source": "Naomi?\"",
                        "target": ""
                    },
                    {
                        "id": "RUT1-557",
                        "markers": "\\p \\v 20",
                        "orig": null,
                        "source": "She",
                        "target": ""
                    },
                    {
                        "id": "RUT1-558",
                        "markers": null,
                        "orig": null,
                        "source": "said",
                        "target": ""
                    },
                    {
                        "id": "RUT1-559",
                        "markers": null,
                        "orig": null,
                        "source": "to",
                        "target": ""
                    },
                    {
                        "id": "RUT1-560",
                        "markers": null,
                        "orig": null,
                        "source": "them,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-561",
                        "markers": null,
                        "orig": null,
                        "source": "\"Don\'t",
                        "target": ""
                    },
                    {
                        "id": "RUT1-562",
                        "markers": null,
                        "orig": null,
                        "source": "call",
                        "target": ""
                    },
                    {
                        "id": "RUT1-563",
                        "markers": null,
                        "orig": null,
                        "source": "me",
                        "target": ""
                    },
                    {
                        "id": "RUT1-564",
                        "markers": null,
                        "orig": null,
                        "source": "Naomi.",
                        "target": ""
                    },
                    {
                        "id": "RUT1-565",
                        "markers": null,
                        "orig": null,
                        "source": "Call",
                        "target": ""
                    },
                    {
                        "id": "RUT1-566",
                        "markers": null,
                        "orig": null,
                        "source": "me",
                        "target": ""
                    },
                    {
                        "id": "RUT1-567",
                        "markers": null,
                        "orig": null,
                        "source": "Mara;",
                        "target": ""
                    },
                    {
                        "id": "RUT1-568",
                        "markers": null,
                        "orig": null,
                        "source": "for",
                        "target": ""
                    },
                    {
                        "id": "RUT1-569",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-570",
                        "markers": null,
                        "orig": null,
                        "source": "Almighty",
                        "target": ""
                    },
                    {
                        "id": "RUT1-571",
                        "markers": null,
                        "orig": null,
                        "source": "has",
                        "target": ""
                    },
                    {
                        "id": "RUT1-572",
                        "markers": null,
                        "orig": null,
                        "source": "dealt",
                        "target": ""
                    },
                    {
                        "id": "RUT1-573",
                        "markers": null,
                        "orig": null,
                        "source": "very",
                        "target": ""
                    },
                    {
                        "id": "RUT1-574",
                        "markers": null,
                        "orig": null,
                        "source": "bitterly",
                        "target": ""
                    },
                    {
                        "id": "RUT1-575",
                        "markers": null,
                        "orig": null,
                        "source": "with",
                        "target": ""
                    },
                    {
                        "id": "RUT1-576",
                        "markers": null,
                        "orig": null,
                        "source": "me.",
                        "target": ""
                    },
                    {
                        "id": "RUT1-577",
                        "markers": "\\v 21",
                        "orig": null,
                        "source": "I",
                        "target": ""
                    },
                    {
                        "id": "RUT1-578",
                        "markers": null,
                        "orig": null,
                        "source": "went",
                        "target": ""
                    },
                    {
                        "id": "RUT1-479",
                        "markers": null,
                        "orig": null,
                        "source": "out",
                        "target": ""
                    },
                    {
                        "id": "RUT1-580",
                        "markers": null,
                        "orig": null,
                        "source": "full,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-581",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-582",
                        "markers": null,
                        "orig": null,
                        "source": "Yahweh",
                        "target": ""
                    },
                    {
                        "id": "RUT1-583",
                        "markers": null,
                        "orig": null,
                        "source": "has",
                        "target": ""
                    },
                    {
                        "id": "RUT1-584",
                        "markers": null,
                        "orig": null,
                        "source": "brought",
                        "target": ""
                    },
                    {
                        "id": "RUT1-585",
                        "markers": null,
                        "orig": null,
                        "source": "me",
                        "target": ""
                    },
                    {
                        "id": "RUT1-586",
                        "markers": null,
                        "orig": null,
                        "source": "back",
                        "target": ""
                    },
                    {
                        "id": "RUT1-587",
                        "markers": null,
                        "orig": null,
                        "source": "empty;",
                        "target": ""
                    },
                    {
                        "id": "RUT1-588",
                        "markers": null,
                        "orig": null,
                        "source": "why",
                        "target": ""
                    },
                    {
                        "id": "RUT1-589",
                        "markers": null,
                        "orig": null,
                        "source": "do",
                        "target": ""
                    },
                    {
                        "id": "RUT1-590",
                        "markers": null,
                        "orig": null,
                        "source": "you",
                        "target": ""
                    },
                    {
                        "id": "RUT1-591",
                        "markers": null,
                        "orig": null,
                        "source": "call",
                        "target": ""
                    },
                    {
                        "id": "RUT1-592",
                        "markers": null,
                        "orig": null,
                        "source": "me",
                        "target": ""
                    },
                    {
                        "id": "RUT1-593",
                        "markers": null,
                        "orig": null,
                        "source": "Naomi,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-594",
                        "markers": null,
                        "orig": null,
                        "source": "since",
                        "target": ""
                    },
                    {
                        "id": "RUT1-595",
                        "markers": null,
                        "orig": null,
                        "source": "Yahweh",
                        "target": ""
                    },
                    {
                        "id": "RUT1-596",
                        "markers": null,
                        "orig": null,
                        "source": "has",
                        "target": ""
                    },
                    {
                        "id": "RUT1-597",
                        "markers": null,
                        "orig": null,
                        "source": "testified",
                        "target": ""
                    },
                    {
                        "id": "RUT1-598",
                        "markers": null,
                        "orig": null,
                        "source": "against",
                        "target": ""
                    },
                    {
                        "id": "RUT1-599",
                        "markers": null,
                        "orig": null,
                        "source": "me,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-600",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-601",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-602",
                        "markers": null,
                        "orig": null,
                        "source": "Almighty",
                        "target": ""
                    },
                    {
                        "id": "RUT1-603",
                        "markers": null,
                        "orig": null,
                        "source": "has",
                        "target": ""
                    },
                    {
                        "id": "RUT1-604",
                        "markers": null,
                        "orig": null,
                        "source": "afflicted",
                        "target": ""
                    },
                    {
                        "id": "RUT1-605",
                        "markers": null,
                        "orig": null,
                        "source": "me?\"",
                        "target": ""
                    },
                    {
                        "id": "RUT1-606",
                        "orig": null,
                        "markers": "\\v 22",
                        "source": "So",
                        "target": ""
                    },
                    {
                        "id": "RUT1-607",
                        "markers": null,
                        "orig": null,
                        "source": "Naomi",
                        "target": ""
                    },
                    {
                        "id": "RUT1-608",
                        "markers": null,
                        "orig": null,
                        "source": "returned,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-609",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-610",
                        "markers": null,
                        "orig": null,
                        "source": "Ruth",
                        "target": ""
                    },
                    {
                        "id": "RUT1-611",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-612",
                        "markers": null,
                        "orig": null,
                        "source": "Moabitess,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-613",
                        "markers": null,
                        "orig": null,
                        "source": "her",
                        "target": ""
                    },
                    {
                        "id": "RUT1-614",
                        "markers": null,
                        "orig": null,
                        "source": "daughter-in-law,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-615",
                        "markers": null,
                        "orig": null,
                        "source": "with",
                        "target": ""
                    },
                    {
                        "id": "RUT1-616",
                        "markers": null,
                        "orig": null,
                        "source": "her,",
                        "target": ""
                    },
                    {
                        "id": "RUT1-617",
                        "markers": null,
                        "orig": null,
                        "source": "who",
                        "target": ""
                    },
                    {
                        "id": "RUT1-618",
                        "markers": null,
                        "orig": null,
                        "source": "returned",
                        "target": ""
                    },
                    {
                        "id": "RUT1-619",
                        "markers": null,
                        "orig": null,
                        "source": "out",
                        "target": ""
                    },
                    {
                        "id": "RUT1-620",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT1-621",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-622",
                        "markers": null,
                        "orig": null,
                        "source": "country",
                        "target": ""
                    },
                    {
                        "id": "RUT1-623",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT1-624",
                        "markers": null,
                        "orig": null,
                        "source": "Moab:",
                        "target": ""
                    },
                    {
                        "id": "RUT1-625",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT1-626",
                        "markers": null,
                        "orig": null,
                        "source": "they",
                        "target": ""
                    },
                    {
                        "id": "RUT1-627",
                        "markers": null,
                        "orig": null,
                        "source": "came",
                        "target": ""
                    },
                    {
                        "id": "RUT1-628",
                        "markers": null,
                        "orig": null,
                        "source": "to",
                        "target": ""
                    },
                    {
                        "id": "RUT1-629",
                        "markers": null,
                        "orig": null,
                        "source": "Bethlehem",
                        "target": ""
                    },
                    {
                        "id": "RUT1-630",
                        "markers": null,
                        "orig": null,
                        "source": "in",
                        "target": ""
                    },
                    {
                        "id": "RUT1-631",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT1-632",
                        "markers": null,
                        "orig": null,
                        "source": "beginning",
                        "target": ""
                    },
                    {
                        "id": "RUT1-633",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT1-634",
                        "markers": null,
                        "orig": null,
                        "source": "barley",
                        "target": ""
                    },
                    {
                        "id": "RUT1-635",
                        "markers": null,
                        "orig": null,
                        "source": "harvest.",
                        "target": ""
                    }
                ]
            },
            {   "id": "RUT2",
                "name": "Ruth 2",
                "lastAdapted": 0,
                "verseCount": 23,
                "sourcephrases": [
                    {
                        "id": "RUT2-1",
                        "markers": "\\c 2 \\p \\v 1",
                        "source": "Naomi",
                        "target": ""
                    },
                    {
                        "id": "RUT2-2",
                        "markers": null,
                        "orig": null,
                        "source": "had",
                        "target": ""
                    },
                    {
                        "id": "RUT2-3",
                        "markers": null,
                        "orig": null,
                        "source": "a",
                        "target": ""
                    },
                    {
                        "id": "RUT2-4",
                        "markers": null,
                        "orig": null,
                        "source": "relative",
                        "target": ""
                    },
                    {
                        "id": "RUT2-5",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT2-6",
                        "markers": null,
                        "orig": null,
                        "source": "her",
                        "target": ""
                    },
                    {
                        "id": "RUT2-7",
                        "markers": null,
                        "orig": null,
                        "source": "husband\'s,",
                        "target": ""
                    },
                    {
                        "id": "RUT2-8",
                        "markers": null,
                        "orig": null,
                        "source": "a",
                        "target": ""
                    },
                    {
                        "id": "RUT2-9",
                        "markers": null,
                        "orig": null,
                        "source": "mighty",
                        "target": ""
                    },
                    {
                        "id": "RUT2-10",
                        "markers": null,
                        "orig": null,
                        "source": "man",
                        "target": ""
                    },
                    {
                        "id": "RUT2-11",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT2-12",
                        "markers": null,
                        "orig": null,
                        "source": "wealth,",
                        "target": ""
                    },
                    {
                        "id": "RUT2-13",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT2-14",
                        "markers": null,
                        "orig": null,
                        "source": "the",
                        "target": ""
                    },
                    {
                        "id": "RUT2-15",
                        "markers": null,
                        "orig": null,
                        "source": "family",
                        "target": ""
                    },
                    {
                        "id": "RUT2-16",
                        "markers": null,
                        "orig": null,
                        "source": "of",
                        "target": ""
                    },
                    {
                        "id": "RUT2-17",
                        "markers": null,
                        "orig": null,
                        "source": "Elimelech,",
                        "target": ""
                    },
                    {
                        "id": "RUT2-18",
                        "markers": null,
                        "orig": null,
                        "source": "and",
                        "target": ""
                    },
                    {
                        "id": "RUT2-19",
                        "markers": null,
                        "orig": null,
                        "source": "his",
                        "target": ""
                    },
                    {
                        "id": "RUT2-20",
                        "markers": null,
                        "orig": null,
                        "source": "name",
                        "target": ""
                    },
                    {
                        "id": "RUT2-21",
                        "markers": null,
                        "orig": null,
                        "source": "was",
                        "target": ""
                    },
                    {
                        "id": "RUT2-22",
                        "markers": null,
                        "orig": null,
                        "source": "Boaz.",
                        "target": ""
                    }
                ]
            },
            {   "id": "RUT3",
                "name": "Ruth 3",
                "lastAdapted": 0,
                "verseCount": 18,
                "sourcephrases": [
                    {
                        "id": "RUT3-1",
                        "markers": "\\c 3 \\p \\v 1",
                        "orig": null,
                        "source": "Naomi",
                        "target": ""
                    }
                ]
            },
            {   "id": "RUT4",
                "name": "Ruth 4",
                "lastAdapted": 0,
                "verseCount": 22,
                "sourcephrases": [
                    {
                        "id": "RUT4-1",
                        "markers": "\\c 4 \\p \\v 1",
                        "orig": null,
                        "source": "Now",
                        "target": ""
                    }
                ]
            }
        ],

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