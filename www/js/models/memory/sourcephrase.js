/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

/* 
* models / memory / SourcePhrase.js
* in-memory version of the sourcephrase object. Asynchronously returns the
* SourcePhrases for Ruth 1
*/
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),

        /* WEB Bible text for Ruth chapter 1 from http://ebible.org/web/ from 2008
        */
        sourcephrases = [
            {
                id: "RUT001-1",
                markers: "\\id",
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "RUT",
                target: "RUT"
            },
            {
                id: "RUT001-2",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "08-RUT-web.sfm",
                target: "08-RUT-web.sfm"
            },
            {
                id: "RUT001-ret-3",
                markers: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                orig: "World|English|Bible|Tuesday|19|August|2008",
                source: "World English Bible Tuesday 19 August 2008",
                target: "Amazing American Bible Friday 13 December 2013"
            },
            {
                id: "RUT001-10",
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: "\\hdr",
                source: "Ruth",
                target: "Ruth"
            },
            {
                id: "RUT001-11",
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: "\\mt",
                source: "Ruth",
                target: "Ruth"
            },
            {
                id: "RUT001-12",
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: "\\c 1 \\p \\v 1",
                source: "It",
                target: "It"
            },
            {
                id: "RUT001-13",
                markers: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                orig: null,
                source: "happened",
                target: "came about"
            },
            {
                id: "RUT001-14",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "in",
                target: "during"
            },
            {
                id: "RUT001-15",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "the",
                target: "the"
            },
            {
                id: "RUT001-16",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "days",
                target: "days"
            },
            {
                id: "RUT001-17",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "when",
                target: "when"
            },
            {
                id: "RUT001-18",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "the",
                target: "the"
            },
            {
                id: "RUT001-19",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "judges",
                target: "judges"
            },
            {
                id: "RUT001-20",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                source: "judged",
                target: "judged"
            },
            {
                id: "RUT001-21",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "that",
                target: "reallyreallyreallyreallyreallyloooooooooonnnnnnngstring"
            },
            {
                id: "RUT001-22",
                markers: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                orig: null,
                source: "there",
                target: ""
            },
            {
                id: "RUT001-23",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "was",
                target: ""
            },
            {
                id: "RUT001-24",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "a",
                target: ""
            },
            {
                id: "RUT001-25",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "famine",
                target: ""
            },
            {
                id: "RUT001-26",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "in",
                target: ""
            },
            {
                id: "RUT001-27",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "the",
                target: ""
            },
            {
                id: "RUT001-28",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".",
                source: "land",
                target: ""
            },
            {
                id: "RUT001-29",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "A",
                target: ""
            },
            {
                id: "RUT001-30",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "certain",
                target: ""
            },
            {
                id: "RUT001-31",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "man",
                target: ""
            },
            {
                id: "RUT001-32",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "of",
                target: ""
            },
            {
                id: "RUT001-34",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "Bethlehem",
                target: ""
            },
            {
                id: "RUT001-35",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "Judah",
                target: ""
            },
            {
                id: "RUT001-36",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "went",
                target: ""
            },
            {
                id: "RUT001-37",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "to",
                target: ""
            },
            {
                id: "RUT001-38",
                markers: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                orig: null,
                source: "live",
                target: ""
            },
            {
                id: "RUT001-39",
                markers: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                orig: null,
                source: "in",
                target: ""
            },
            {
                id: "RUT001-40",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "the",
                target: ""
            },
            {
                id: "RUT001-41",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "country",
                target: ""
            },
            {
                id: "RUT001-42",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "of",
                target: ""
            },
            {
                id: "RUT001-43",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                source: "Moab",
                target: ""
            },
            {
                id: "RUT001-44",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                source: "he",
                target: ""
            },
            {
                id: "RUT001-45",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "and",
                target: ""
            },
            {
                id: "RUT001-46",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "his",
                target: ""
            },
            {
                id: "RUT001-47",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                source: "wife",
                target: ""
            },
            {
                id: "RUT001-48",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "and",
                target: ""
            },
            {
                id: "RUT001-49",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "his",
                target: ""
            },
            {
                id: "RUT001-50",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "two",
                target: ""
            },
            {
                id: "RUT001-51",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".",
                source: "sons",
                target: ""
            },
            {
                id: "RUT001-52",
                markers: "\\v 2",
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "The",
                target: ""
            },
            {
                id: "RUT001-53",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "name",
                target: ""
            },
            {
                id: "RUT001-54",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "of",
                target: ""
            },
            {
                id: "RUT001-55",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "the",
                target: ""
            },
            {
                id: "RUT001-56",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "man",
                target: ""
            },
            {
                id: "RUT001-57",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "was",
                target: ""
            },
            {
                id: "RUT001-58",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                source: "Elimelech",
                target: ""
            },
            {
                id: "RUT001-59",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "and",
                target: ""
            },
            {
                id: "RUT001-60",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "the",
                target: ""
            },
            {
                id: "RUT001-61",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "name",
                target: ""
            },
            {
                id: "RUT001-62",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "of",
                target: ""
            },
            {
                id: "RUT001-63",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "his",
                target: ""
            },
            {
                id: "RUT001-64",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "wife",
                target: ""
            },
            {
                id: "RUT001-65",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                source: "Naomi",
                target: ""
            },
            {
                id: "RUT001-66",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "and",
                target: ""
            },
            {
                id: "RUT001-67",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "the",
                target: ""
            },
            {
                id: "RUT001-68",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "name",
                target: ""
            },
            {
                id: "RUT001-69",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "of",
                target: ""
            },
            {
                id: "RUT001-70",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "his",
                target: ""
            },
            {
                id: "RUT001-71",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "two",
                target: ""
            },
            {
                id: "RUT001-72",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "sons",
                target: ""
            },
            {
                id: "RUT001-73",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "Mahlon",
                target: ""
            },
            {
                id: "RUT001-74",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "and",
                target: ""
            },
            {
                id: "RUT001-75",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                source: "Chilion",
                target: ""
            },
            {
                id: "RUT001-76",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "Ephrathites",
                target: ""
            },
            {
                id: "RUT001-77",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "of",
                target: ""
            },
            {
                id: "RUT001-78",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "Bethlehem",
                target: ""
            },
            {
                id: "RUT001-79",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".",
                source: "Judah",
                target: ""
            },
            {
                id: "RUT001-80",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "They",
                target: ""
            },
            {
                id: "RUT001-81",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "came",
                target: ""
            },
            {
                id: "RUT001-82",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "into",
                target: ""
            },
            {
                id: "RUT001-83",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "the",
                target: ""
            },
            {
                id: "RUT001-84",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "country",
                target: ""
            },
            {
                id: "RUT001-85",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "of",
                target: ""
            },
            {
                id: "RUT001-86",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                source: "Moab",
                target: ""
            },
            {
                id: "RUT001-87",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "and",
                target: ""
            },
            {
                id: "RUT001-88",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "continued",
                target: ""
            },
            {
                id: "RUT001-89",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".",
                source: "there",
                target: ""
            },
            {
                id: "RUT001-90",
                markers: "\\v 3",
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                source: "Elimilech",
                target: ""
            },
            {
                id: "RUT001-91",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "Naomi's",
                target: ""
            },
            {
                id: "RUT001-92",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                source: "husband",
                target: ""
            },
            {
                id: "RUT001-93",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ";",
                source: "died",
                target: ""
            },
            {
                id: "RUT001-94",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "and",
                target: ""
            },
            {
                id: "RUT001-95",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "she",
                target: ""
            },
            {
                id: "RUT001-96",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "was",
                target: ""
            },
            {
                id: "RUT001-97",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                source: "left",
                target: ""
            },
            {
                id: "RUT001-98",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "and",
                target: ""
            },
            {
                id: "RUT001-99",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "her",
                target: ""
            },
            {
                id: "RUT001-100",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "two",
                target: ""
            },
            {
                id: "RUT001-101",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".",
                source: "sons",
                target: ""
            },
            {
                id: "RUT001-102",
                orig: null,
                markers: "\\v 4",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "They",
                target: ""
            },
            {
                id: "RUT001-103",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "took",
                target: ""
            },
            {
                id: "RUT001-104",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "them",
                target: ""
            },
            {
                id: "RUT001-105",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "wives",
                target: ""
            },
            {
                id: "RUT001-106",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "of",
                target: ""
            },
            {
                id: "RUT001-107",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "the",
                target: ""
            },
            {
                id: "RUT001-108",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "women",
                target: ""
            },
            {
                id: "RUT001-109",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "of",
                target: ""
            },
            {
                id: "RUT001-110",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ";",
                source: "Moab",
                target: ""
            },
            {
                id: "RUT001-111",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "the",
                target: ""
            },
            {
                id: "RUT001-112",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "name",
                target: ""
            },
            {
                id: "RUT001-113",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "of",
                target: ""
            },
            {
                id: "RUT001-114",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "the",
                target: ""
            },
            {
                id: "RUT001-115",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "one",
                target: ""
            },
            {
                id: "RUT001-116",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "was",
                target: ""
            },
            {
                id: "RUT001-117",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                source: "Orpah",
                target: ""
            },
            {
                id: "RUT001-118",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "and",
                target: ""
            },
            {
                id: "RUT001-119",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "the",
                target: ""
            },
            {
                id: "RUT001-120",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "name",
                target: ""
            },
            {
                id: "RUT001-121",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "of",
                target: ""
            },
            {
                id: "RUT001-122",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "the",
                target: ""
            },
            {
                id: "RUT001-123",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "other",
                target: ""
            },
            {
                id: "RUT001-124",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ":",
                source: "Ruth",
                target: ""
            },
            {
                id: "RUT001-125",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "and",
                target: ""
            },
            {
                id: "RUT001-126",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "they",
                target: ""
            },
            {
                id: "RUT001-127",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "lived",
                target: ""
            },
            {
                id: "RUT001-128",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "there",
                target: ""
            },
            {
                id: "RUT001-129",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "about",
                target: ""
            },
            {
                id: "RUT001-130",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "ten",
                target: ""
            },
            {
                id: "RUT001-131",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".",
                source: "years",
                target: ""
            },
            {
                id: "RUT001-132",
                markers: "\\v 5",
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "Mahlon",
                target: ""
            },
            {
                id: "RUT001-133",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "and",
                target: ""
            },
            {
                id: "RUT001-134",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "Chilion",
                target: ""
            },
            {
                id: "RUT001-135",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "both",
                target: ""
            },
            {
                id: "RUT001-136",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                source: "died",
                target: ""
            },
            {
                id: "RUT001-137",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "and",
                target: ""
            },
            {
                id: "RUT001-138",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "the",
                target: ""
            },
            {
                id: "RUT001-139",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "woman",
                target: ""
            },
            {
                id: "RUT001-140",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "was",
                target: ""
            },
            {
                id: "RUT001-141",
                markers: null,
                orig: null,
                source: "bereaved",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                target: ""
            },
            {
                id: "RUT001-142",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "of",
                target: ""
            },
            {
                id: "RUT001-143",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "her",
                target: ""
            },
            {
                id: "RUT001-144",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "two",
                target: ""
            },
            {
                id: "RUT001-145",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "children",
                target: ""
            },
            {
                id: "RUT001-146",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "and",
                target: ""
            },
            {
                id: "RUT001-147",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "of",
                target: ""
            },
            {
                id: "RUT001-148",
                markers: null,
                orig: null,
                source: "her",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                target: ""
            },
            {
                id: "RUT001-149",
                markers: null,
                orig: null,
                source: "husband",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".",
                target: ""
            },
            {
                id: "RUT001-150",
                markers: "\\v 6",
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "Then",
                target: ""
            },
            {
                id: "RUT001-151",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "she",
                target: ""
            },
            {
                id: "RUT001-152",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "arose",
                target: ""
            },
            {
                id: "RUT001-153",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "with",
                target: ""
            },
            {
                id: "RUT001-154",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "her",
                target: ""
            },
            {
                id: "RUT001-155",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                source: "daughters-in-law",
                target: ""
            },
            {
                id: "RUT001-156",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "that",
                target: ""
            },
            {
                id: "RUT001-157",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "she",
                target: ""
            },
            {
                id: "RUT001-158",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "might",
                target: ""
            },
            {
                id: "RUT001-159",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "return",
                target: ""
            },
            {
                id: "RUT001-160",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "from",
                target: ""
            },
            {
                id: "RUT001-161",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "the",
                target: ""
            },
            {
                id: "RUT001-162",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "country",
                target: ""
            },
            {
                id: "RUT001-163",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "of",
                target: ""
            },
            {
                id: "RUT001-164",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ";",
                source: "Moab",
                target: ""
            },
            {
                id: "RUT001-165",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "for",
                target: ""
            },
            {
                id: "RUT001-166",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "she",
                target: ""
            },
            {
                id: "RUT001-167",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "had",
                target: ""
            },
            {
                id: "RUT001-168",
                markers: null,
                orig: null,
                source: "heard",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                target: ""
            },
            {
                id: "RUT001-169",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "in",
                target: ""
            },
            {
                id: "RUT001-170",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "the",
                target: ""
            },
            {
                id: "RUT001-171",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "country",
                target: ""
            },
            {
                id: "RUT001-172",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "of",
                target: ""
            },
            {
                id: "RUT001-173",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "Moab",
                target: ""
            },
            {
                id: "RUT001-174",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "how",
                target: ""
            },
            {
                id: "RUT001-175",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "that",
                target: ""
            },
            {
                id: "RUT001-176",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "Yahweh",
                target: ""
            },
            {
                id: "RUT001-177",
                markers: "\\f +",
                orig: null,
                prepuncts: "\"",
                midpuncts: "",
                follpuncts: "\"",
                source: "Yahweh",
                target: ""
            },
            {
                id: "RUT001-178",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "is",
                target: ""
            },
            {
                id: "RUT001-179",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "God\'s",
                target: ""
            },
            {
                id: "RUT001-180",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "proper",
                target: ""
            },
            {
                id: "RUT001-181",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                source: "Name",
                target: ""
            },
            {
                id: "RUT001-182",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "sometimes",
                target: ""
            },
            {
                id: "RUT001-183",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "rendered",
                target: ""
            },
            {
                id: "RUT001-184",
                markers: null,
                orig: null,
                prepuncts: "\"",
                midpuncts: "",
                follpuncts: "\"",
                source: "LORD",
                target: ""
            },
            {
                id: "RUT001-185",
                markers: null,
                orig: null,
                prepuncts: "(",
                midpuncts: "",
                follpuncts: "",
                source: "all",
                target: ""
            },
            {
                id: "RUT001-186",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ")",
                source: "caps",
                target: ""
            },
            {
                id: "RUT001-187",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "in",
                target: ""
            },
            {
                id: "RUT001-188",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "other",
                target: ""
            },
            {
                id: "RUT001-189",
                markers: null,
                orig: null,
                source: "translations",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".",
                target: ""
            },
            {
                id: "RUT001-190",
                orig: null,
                markers: "\\f*",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "had",
                target: ""
            },
            {
                id: "RUT001-191",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "visited",
                target: ""
            },
            {
                id: "RUT001-192",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "his",
                target: ""
            },
            {
                id: "RUT001-193",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "people",
                target: ""
            },
            {
                id: "RUT001-194",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "in",
                target: ""
            },
            {
                id: "RUT001-195",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "giving",
                target: ""
            },
            {
                id: "RUT001-196",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "them",
                target: ""
            },
            {
                id: "RUT001-197",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".",
                source: "bread",
                target: ""
            },
            {
                id: "RUT001-198",
                markers: "\\v 7",
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "She",
                target: ""
            },
            {
                id: "RUT001-199",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "went",
                target: ""
            },
            {
                id: "RUT001-200",
                markers: null,
                orig: null,
                source: "forth",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                target: ""
            },
            {
                id: "RUT001-201",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "out",
                target: ""
            },
            {
                id: "RUT001-202",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "of",
                target: ""
            },
            {
                id: "RUT001-203",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "the",
                target: ""
            },
            {
                id: "RUT001-204",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "place",
                target: ""
            },
            {
                id: "RUT001-205",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "where",
                target: ""
            },
            {
                id: "RUT001-206",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "she",
                target: ""
            },
            {
                id: "RUT001-207",
                markers: null,
                orig: null,
                source: "was",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                target: ""
            },
            {
                id: "RUT001-208",
                markers: null,
                orig: null,
                source: "and",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                target: ""
            },
            {
                id: "RUT001-209",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "her",
                target: ""
            },
            {
                id: "RUT001-210",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "two",
                target: ""
            },
            {
                id: "RUT001-211",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "daughters-in-law",
                target: ""
            },
            {
                id: "RUT001-212",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "with",
                target: ""
            },
            {
                id: "RUT001-213",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ";",
                source: "her",
                target: ""
            },
            {
                id: "RUT001-214",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "and",
                target: ""
            },
            {
                id: "RUT001-215",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "they",
                target: ""
            },
            {
                id: "RUT001-216",
                markers: null,
                orig: null,
                source: "went",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                target: ""
            },
            {
                id: "RUT001-217",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "on",
                target: ""
            },
            {
                id: "RUT001-218",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "the",
                target: ""
            },
            {
                id: "RUT001-219",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "way",
                target: ""
            },
            {
                id: "RUT001-220",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "to",
                target: ""
            },
            {
                id: "RUT001-221",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "return",
                target: ""
            },
            {
                id: "RUT001-222",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "to",
                target: ""
            },
            {
                id: "RUT001-223",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "the",
                target: ""
            },
            {
                id: "RUT001-224",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "land",
                target: ""
            },
            {
                id: "RUT001-225",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "of",
                target: ""
            },
            {
                id: "RUT001-226",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".",
                source: "Judah",
                target: ""
            },
            {
                id: "RUT001-227",
                markers: "\\v 8",
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "Naomi",
                target: ""
            },
            {
                id: "RUT001-228",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "said",
                target: ""
            },
            {
                id: "RUT001-229",
                markers: null,
                orig: null,
                source: "to",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                target: ""
            },
            {
                id: "RUT001-230",
                markers: null,
                orig: null,
                source: "her",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                target: ""
            },
            {
                id: "RUT001-231",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "two",
                target: ""
            },
            {
                id: "RUT001-232",
                markers: null,
                orig: null,
                source: "daughters-in-law",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                target: ""
            },
            {
                id: "RUT001-233",
                markers: null,
                orig: null,
                prepuncts: "\"",
                midpuncts: "",
                follpuncts: ",",
                source: "Go",
                target: ""
            },
            {
                id: "RUT001-234",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "return",
                target: ""
            },
            {
                id: "RUT001-235",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "each",
                target: ""
            },
            {
                id: "RUT001-236",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "of",
                target: ""
            },
            {
                id: "RUT001-237",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "you",
                target: ""
            },
            {
                id: "RUT001-238",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "to",
                target: ""
            },
            {
                id: "RUT001-239",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "her",
                target: ""
            },
            {
                id: "RUT001-240",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "mother\'s",
                target: ""
            },
            {
                id: "RUT001-241",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ":",
                source: "house",
                target: ""
            },
            {
                id: "RUT001-242",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "Yahweh",
                target: ""
            },
            {
                id: "RUT001-243",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "deal",
                target: ""
            },
            {
                id: "RUT001-244",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "kindly",
                target: ""
            },
            {
                id: "RUT001-245",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "with",
                target: ""
            },
            {
                id: "RUT001-246",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                source: "you",
                target: ""
            },
            {
                id: "RUT001-247",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "as",
                target: ""
            },
            {
                id: "RUT001-248",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "you",
                target: ""
            },
            {
                id: "RUT001-249",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "have",
                target: ""
            },
            {
                id: "RUT001-250",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "dealt",
                target: ""
            },
            {
                id: "RUT001-251",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "with",
                target: ""
            },
            {
                id: "RUT001-252",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "the",
                target: ""
            },
            {
                id: "RUT001-253",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                source: "dead",
                target: ""
            },
            {
                id: "RUT001-254",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "and",
                target: ""
            },
            {
                id: "RUT001-255",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "with",
                target: ""
            },
            {
                id: "RUT001-256",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".",
                source: "me",
                target: ""
            },
            {
                id: "RUT001-257",
                markers: "\\v 9",
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "Yahweh",
                target: ""
            },
            {
                id: "RUT001-258",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "grant",
                target: ""
            },
            {
                id: "RUT001-259",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "you",
                target: ""
            },
            {
                id: "RUT001-260",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "that",
                target: ""
            },
            {
                id: "RUT001-261",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "you",
                target: ""
            },
            {
                id: "RUT001-262",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "may",
                target: ""
            },
            {
                id: "RUT001-263",
                markers: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                orig: null,
                source: "find",
                target: ""
            },
            {
                id: "RUT001-264",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                source: "rest",
                target: ""
            },
            {
                id: "RUT001-265",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "each",
                target: ""
            },
            {
                id: "RUT001-266",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "of",
                target: ""
            },
            {
                id: "RUT001-267",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "you",
                target: ""
            },
            {
                id: "RUT001-268",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "in",
                target: ""
            },
            {
                id: "RUT001-269",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "the",
                target: ""
            },
            {
                id: "RUT001-270",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "house",
                target: ""
            },
            {
                id: "RUT001-271",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "of",
                target: ""
            },
            {
                id: "RUT001-272",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "her",
                target: ""
            },
            {
                id: "RUT001-273",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".\"",
                source: "husband",
                target: ""
            },
            {
                id: "RUT001-274",
                markers: "\\p",
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "Then",
                target: ""
            },
            {
                id: "RUT001-275",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "she",
                target: ""
            },
            {
                id: "RUT001-276",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "kissed",
                target: ""
            },
            {
                id: "RUT001-277",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                source: "them",
                target: ""
            },
            {
                id: "RUT001-278",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "and",
                target: ""
            },
            {
                id: "RUT001-279",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "they",
                target: ""
            },
            {
                id: "RUT001-280",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "lifted",
                target: ""
            },
            {
                id: "RUT001-281",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "up",
                target: ""
            },
            {
                id: "RUT001-282",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "their",
                target: ""
            },
            {
                id: "RUT001-283",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                source: "voice",
                target: ""
            },
            {
                id: "RUT001-284",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "and",
                target: ""
            },
            {
                id: "RUT001-285",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".",
                source: "wept",
                target: ""
            },
            {
                id: "RUT001-286",
                markers: "\\v 10",
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "They",
                target: ""
            },
            {
                id: "RUT001-287",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "said",
                target: ""
            },
            {
                id: "RUT001-288",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "to",
                target: ""
            },
            {
                id: "RUT001-289",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                source: "her",
                target: ""
            },
            {
                id: "RUT001-290",
                markers: null,
                orig: null,
                prepuncts: "\"",
                midpuncts: "",
                follpuncts: ",",
                source: "No",
                target: ""
            },
            {
                id: "RUT001-291",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "but",
                target: ""
            },
            {
                id: "RUT001-292",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "we",
                target: ""
            },
            {
                id: "RUT001-293",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "will",
                target: ""
            },
            {
                id: "RUT001-294",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "return",
                target: ""
            },
            {
                id: "RUT001-295",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "with",
                target: ""
            },
            {
                id: "RUT001-296",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "you",
                target: ""
            },
            {
                id: "RUT001-297",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "to",
                target: ""
            },
            {
                id: "RUT001-298",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "your",
                target: ""
            },
            {
                id: "RUT001-299",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".\"",
                source: "people",
                target: ""
            },
            {
                id: "RUT001-300",
                markers: "\\p \\v 11",
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "Naomi",
                target: ""
            },
            {
                id: "RUT001-301",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                source: "said",
                target: ""
            },
            {
                id: "RUT001-302",
                markers: null,
                orig: null,
                prepuncts: "\"",
                midpuncts: "",
                follpuncts: "",
                source: "Go",
                target: ""
            },
            {
                id: "RUT001-303",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                source: "back",
                target: ""
            },
            {
                id: "RUT001-304",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "my",
                target: ""
            },
            {
                id: "RUT001-305",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".",
                source: "daughters",
                target: ""
            },
            {
                id: "RUT001-306",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "Why",
                target: ""
            },
            {
                id: "RUT001-307",
                markers: null,
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                source: "do",
                target: ""
            },
            {
                id: "RUT001-308",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "you",
                target: ""
            },
            {
                id: "RUT001-309",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "want",
                target: ""
            },
            {
                id: "RUT001-310",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "to",
                target: ""
            },
            {
                id: "RUT001-311",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "go",
                target: ""
            },
            {
                id: "RUT001-312",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "with",
                target: ""
            },
            {
                id: "RUT001-313",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "?",
                markers: null,
                orig: null,
                source: "me",
                target: ""
            },
            {
                id: "RUT001-314",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "Do",
                target: ""
            },
            {
                id: "RUT001-315",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "I",
                target: ""
            },
            {
                id: "RUT001-316",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "still",
                target: ""
            },
            {
                id: "RUT001-317",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "have",
                target: ""
            },
            {
                id: "RUT001-318",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "sons",
                target: ""
            },
            {
                id: "RUT001-319",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "in",
                target: ""
            },
            {
                id: "RUT001-320",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "my",
                target: ""
            },
            {
                id: "RUT001-321",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "womb",
                target: ""
            },
            {
                id: "RUT001-322",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "that",
                target: ""
            },
            {
                id: "RUT001-323",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "they",
                target: ""
            },
            {
                id: "RUT001-324",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "may",
                target: ""
            },
            {
                id: "RUT001-325",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "be",
                target: ""
            },
            {
                id: "RUT001-326",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "your",
                target: ""
            },
            {
                id: "RUT001-327",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "?",
                markers: null,
                orig: null,
                source: "husbands",
                target: ""
            },
            {
                id: "RUT001-328",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                orig: null,
                markers: "\\v 12",
                source: "Go",
                target: ""
            },
            {
                id: "RUT001-329",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "back",
                target: ""
            },
            {
                id: "RUT001-330",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "go",
                target: ""
            },
            {
                id: "RUT001-331",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "your",
                target: ""
            },
            {
                id: "RUT001-332",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ";",
                markers: null,
                orig: null,
                source: "way",
                target: ""
            },
            {
                id: "RUT001-333",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "for",
                target: ""
            },
            {
                id: "RUT001-334",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "I",
                target: ""
            },
            {
                id: "RUT001-335",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "am",
                target: ""
            },
            {
                id: "RUT001-336",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "too",
                target: ""
            },
            {
                id: "RUT001-337",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "old",
                target: ""
            },
            {
                id: "RUT001-338",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "to",
                target: ""
            },
            {
                id: "RUT001-339",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "have",
                target: ""
            },
            {
                id: "RUT001-340",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "a",
                target: ""
            },
            {
                id: "RUT001-341",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".",
                markers: null,
                orig: null,
                source: "husband",
                target: ""
            },
            {
                id: "RUT001-342",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "If",
                target: ""
            },
            {
                id: "RUT001-343",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "I",
                target: ""
            },
            {
                id: "RUT001-344",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "should",
                target: ""
            },
            {
                id: "RUT001-345",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "say",
                target: ""
            },
            {
                id: "RUT001-346",
                prepuncts: "\'",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "I",
                target: ""
            },
            {
                id: "RUT001-347",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "have",
                target: ""
            },
            {
                id: "RUT001-348",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",\'",
                markers: null,
                orig: null,
                source: "hope",
                target: ""
            },
            {
                id: "RUT001-349",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "if",
                target: ""
            },
            {
                id: "RUT001-350",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "I",
                target: ""
            },
            {
                id: "RUT001-351",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "should",
                target: ""
            },
            {
                id: "RUT001-352",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "even",
                target: ""
            },
            {
                id: "RUT001-353",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "have",
                target: ""
            },
            {
                id: "RUT001-354",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "a",
                target: ""
            },
            {
                id: "RUT001-355",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "husband",
                target: ""
            },
            {
                id: "RUT001-356",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "tonight",
                target: ""
            },
            {
                id: "RUT001-357",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-358",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "should",
                target: ""
            },
            {
                id: "RUT001-359",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "also",
                target: ""
            },
            {
                id: "RUT001-360",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "bear",
                target: ""
            },
            {
                id: "RUT001-361",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ";",
                markers: null,
                orig: null,
                source: "sons",
                target: ""
            },
            {
                id: "RUT001-362",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                orig: null,
                markers: "\\v 13",
                source: "would",
                target: ""
            },
            {
                id: "RUT001-363",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "you",
                target: ""
            },
            {
                id: "RUT001-364",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "then",
                target: ""
            },
            {
                id: "RUT001-365",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "wait",
                target: ""
            },
            {
                id: "RUT001-366",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "until",
                target: ""
            },
            {
                id: "RUT001-367",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "they",
                target: ""
            },
            {
                id: "RUT001-368",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "were",
                target: ""
            },
            {
                id: "RUT001-369",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "?",
                markers: null,
                orig: null,
                source: "grown",
                target: ""
            },
            {
                id: "RUT001-370",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "Would",
                target: ""
            },
            {
                id: "RUT001-371",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "you",
                target: ""
            },
            {
                id: "RUT001-372",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "then",
                target: ""
            },
            {
                id: "RUT001-373",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "refrain",
                target: ""
            },
            {
                id: "RUT001-374",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "from",
                target: ""
            },
            {
                id: "RUT001-375",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "having",
                target: ""
            },
            {
                id: "RUT001-376",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "?",
                markers: null,
                orig: null,
                source: "husbands",
                target: ""
            },
            {
                id: "RUT001-377",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "No",
                target: ""
            },
            {
                id: "RUT001-378",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "my",
                target: ""
            },
            {
                id: "RUT001-379",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "daughters",
                target: ""
            },
            {
                id: "RUT001-380",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "for",
                target: ""
            },
            {
                id: "RUT001-381",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "it",
                target: ""
            },
            {
                id: "RUT001-382",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "grieves",
                target: ""
            },
            {
                id: "RUT001-383",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "me",
                target: ""
            },
            {
                id: "RUT001-384",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "much",
                target: ""
            },
            {
                id: "RUT001-385",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "for",
                target: ""
            },
            {
                id: "RUT001-386",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "your",
                target: ""
            },
            {
                id: "RUT001-387",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "sakes",
                target: ""
            },
            {
                id: "RUT001-388",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "for",
                target: ""
            },
            {
                id: "RUT001-389",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-390",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "hand",
                target: ""
            },
            {
                id: "RUT001-391",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT001-392",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "Yahweh",
                target: ""
            },
            {
                id: "RUT001-393",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "has",
                target: ""
            },
            {
                id: "RUT001-394",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "gone",
                target: ""
            },
            {
                id: "RUT001-395",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "out",
                target: ""
            },
            {
                id: "RUT001-396",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "against",
                target: ""
            },
            {
                id: "RUT001-397",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".\"",
                markers: null,
                orig: null,
                source: "me",
                target: ""
            },
            {
                id: "RUT001-398",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: "\\p \\v 14",
                orig: null,
                source: "They",
                target: ""
            },
            {
                id: "RUT001-399",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "lifted",
                target: ""
            },
            {
                id: "RUT001-400",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "up",
                target: ""
            },
            {
                id: "RUT001-401",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "their",
                target: ""
            },
            {
                id: "RUT001-402",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "voice",
                target: ""
            },
            {
                id: "RUT001-403",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-404",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "wept",
                target: ""
            },
            {
                id: "RUT001-405",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ":",
                markers: null,
                orig: null,
                source: "again",
                target: ""
            },
            {
                id: "RUT001-406",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-407",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "Orpah",
                target: ""
            },
            {
                id: "RUT001-408",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "kissed",
                target: ""
            },
            {
                id: "RUT001-409",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "her",
                target: ""
            },
            {
                id: "RUT001-410",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "mother-in-law",
                target: ""
            },
            {
                id: "RUT001-411",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "but",
                target: ""
            },
            {
                id: "RUT001-412",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "Ruth",
                target: ""
            },
            {
                id: "RUT001-413",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "joined",
                target: ""
            },
            {
                id: "RUT001-414",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "with",
                target: ""
            },
            {
                id: "RUT001-415",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".",
                markers: null,
                orig: null,
                source: "her",
                target: ""
            },
            {
                id: "RUT001-416",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: "\\v 15",
                orig: null,
                source: "She",
                target: ""
            },
            {
                id: "RUT001-417",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "said",
                target: ""
            },
            {
                id: "RUT001-418",
                prepuncts: "\"",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "Behold",
                target: ""
            },
            {
                id: "RUT001-419",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "your",
                target: ""
            },
            {
                id: "RUT001-420",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "sister-in-law",
                target: ""
            },
            {
                id: "RUT001-421",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "has",
                target: ""
            },
            {
                id: "RUT001-422",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "gone",
                target: ""
            },
            {
                id: "RUT001-423",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "back",
                target: ""
            },
            {
                id: "RUT001-424",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "to",
                target: ""
            },
            {
                id: "RUT001-425",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "her",
                target: ""
            },
            {
                id: "RUT001-426",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "people",
                target: ""
            },
            {
                id: "RUT001-427",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-428",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "to",
                target: ""
            },
            {
                id: "RUT001-429",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "her",
                target: ""
            },
            {
                id: "RUT001-430",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".",
                markers: null,
                orig: null,
                source: "god",
                target: ""
            },
            {
                id: "RUT001-431",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "Follow",
                target: ""
            },
            {
                id: "RUT001-432",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "your",
                target: ""
            },
            {
                id: "RUT001-433",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".\"",
                markers: null,
                orig: null,
                source: "sister-in-law",
                target: ""
            },
            {
                id: "RUT001-434",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: "\\p \\v 16",
                orig: null,
                source: "Ruth",
                target: ""
            },
            {
                id: "RUT001-435",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "said",
                target: ""
            },
            {
                id: "RUT001-436",
                prepuncts: "\"",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "Don\'t",
                target: ""
            },
            {
                id: "RUT001-437",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "entreat",
                target: ""
            },
            {
                id: "RUT001-438",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "me",
                target: ""
            },
            {
                id: "RUT001-439",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "to",
                target: ""
            },
            {
                id: "RUT001-440",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "leave",
                target: ""
            },
            {
                id: "RUT001-441",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "you",
                target: ""
            },
            {
                id: "RUT001-442",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-443",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "to",
                target: ""
            },
            {
                id: "RUT001-444",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "return",
                target: ""
            },
            {
                id: "RUT001-445",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "from",
                target: ""
            },
            {
                id: "RUT001-446",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "following",
                target: ""
            },
            {
                id: "RUT001-447",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "after",
                target: ""
            },
            {
                id: "RUT001-448",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "you",
                target: ""
            },
            {
                id: "RUT001-449",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "for",
                target: ""
            },
            {
                id: "RUT001-450",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "where",
                target: ""
            },
            {
                id: "RUT001-451",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "you",
                target: ""
            },
            {
                id: "RUT001-452",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "go",
                target: ""
            },
            {
                id: "RUT001-453",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "I",
                target: ""
            },
            {
                id: "RUT001-454",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "will",
                target: ""
            },
            {
                id: "RUT001-455",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ";",
                markers: null,
                orig: null,
                source: "go",
                target: ""
            },
            {
                id: "RUT001-456",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-457",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "where",
                target: ""
            },
            {
                id: "RUT001-458",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "you",
                target: ""
            },
            {
                id: "RUT001-459",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "lodge",
                target: ""
            },
            {
                id: "RUT001-460",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "I",
                target: ""
            },
            {
                id: "RUT001-461",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "will",
                target: ""
            },
            {
                id: "RUT001-462",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ";",
                markers: null,
                orig: null,
                source: "lodge",
                target: ""
            },
            {
                id: "RUT001-463",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "your",
                target: ""
            },
            {
                id: "RUT001-464",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "people",
                target: ""
            },
            {
                id: "RUT001-465",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "will",
                target: ""
            },
            {
                id: "RUT001-466",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "be",
                target: ""
            },
            {
                id: "RUT001-467",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "my",
                target: ""
            },
            {
                id: "RUT001-468",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "people",
                target: ""
            },
            {
                id: "RUT001-470",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-471",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "your",
                target: ""
            },
            {
                id: "RUT001-472",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "God",
                target: ""
            },
            {
                id: "RUT001-473",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: "\\f +",
                orig: null,
                source: "The",
                target: ""
            },
            {
                id: "RUT001-474",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "Hebrew",
                target: ""
            },
            {
                id: "RUT001-475",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "word",
                target: ""
            },
            {
                id: "RUT001-476",
                prepuncts: "\"",
                midpuncts: "",
                follpuncts: "\"",
                markers: null,
                orig: null,
                source: "God",
                target: ""
            },
            {
                id: "RUT001-477",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "is",
                target: ""
            },
            {
                id: "RUT001-478",
                prepuncts: "\"",
                midpuncts: "",
                follpuncts: "\".",
                markers: null,
                orig: null,
                source: "Elohim",
                target: ""
            },
            {
                id: "RUT001-479",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                orig: null,
                markers: "\\f*",
                source: "my",
                target: ""
            },
            {
                id: "RUT001-480",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ";",
                markers: null,
                orig: null,
                source: "God",
                target: ""
            },
            {
                id: "RUT001-481",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                orig: null,
                markers: "\\v 17",
                source: "where",
                target: ""
            },
            {
                id: "RUT001-482",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "you",
                target: ""
            },
            {
                id: "RUT001-483",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "die",
                target: ""
            },
            {
                id: "RUT001-484",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "will",
                target: ""
            },
            {
                id: "RUT001-485",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "I",
                target: ""
            },
            {
                id: "RUT001-486",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "die",
                target: ""
            },
            {
                id: "RUT001-487",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-488",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "there",
                target: ""
            },
            {
                id: "RUT001-489",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "will",
                target: ""
            },
            {
                id: "RUT001-490",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "I",
                target: ""
            },
            {
                id: "RUT001-491",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "be",
                target: ""
            },
            {
                id: "RUT001-492",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".",
                markers: null,
                orig: null,
                source: "buried",
                target: ""
            },
            {
                id: "RUT001-493",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "Yahweh",
                target: ""
            },
            {
                id: "RUT001-494",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "do",
                target: ""
            },
            {
                id: "RUT001-495",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "to",
                target: ""
            },
            {
                id: "RUT001-496",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "me",
                target: ""
            },
            {
                id: "RUT001-497",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-498",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "more",
                target: ""
            },
            {
                id: "RUT001-499",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "also",
                target: ""
            },
            {
                id: "RUT001-500",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "if",
                target: ""
            },
            {
                id: "RUT001-501",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "anything",
                target: ""
            },
            {
                id: "RUT001-502",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "but",
                target: ""
            },
            {
                id: "RUT001-503",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "death",
                target: ""
            },
            {
                id: "RUT001-504",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "part",
                target: ""
            },
            {
                id: "RUT001-505",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "you",
                target: ""
            },
            {
                id: "RUT001-506",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-507",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".\"",
                markers: null,
                orig: null,
                source: "me",
                target: ""
            },
            {
                id: "RUT001-508",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                orig: null,
                markers: "\\p \\v 18",
                source: "When",
                target: ""
            },
            {
                id: "RUT001-509",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "she",
                target: ""
            },
            {
                id: "RUT001-510",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "saw",
                target: ""
            },
            {
                id: "RUT001-511",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "that",
                target: ""
            },
            {
                id: "RUT001-512",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "she",
                target: ""
            },
            {
                id: "RUT001-513",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "was",
                target: ""
            },
            {
                id: "RUT001-514",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "steadfastly",
                target: ""
            },
            {
                id: "RUT001-515",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "minded",
                target: ""
            },
            {
                id: "RUT001-516",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "to",
                target: ""
            },
            {
                id: "RUT001-517",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "go",
                target: ""
            },
            {
                id: "RUT001-518",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "with",
                target: ""
            },
            {
                id: "RUT001-519",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "her",
                target: ""
            },
            {
                id: "RUT001-520",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "she",
                target: ""
            },
            {
                id: "RUT001-521",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "left",
                target: ""
            },
            {
                id: "RUT001-522",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "off",
                target: ""
            },
            {
                id: "RUT001-523",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "speaking",
                target: ""
            },
            {
                id: "RUT001-524",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "to",
                target: ""
            },
            {
                id: "RUT001-525",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".",
                markers: null,
                orig: null,
                source: "her",
                target: ""
            },
            {
                id: "RUT001-526",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: "\\p \\v 19",
                orig: null,
                source: "So",
                target: ""
            },
            {
                id: "RUT001-527",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "they",
                target: ""
            },
            {
                id: "RUT001-528",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "two",
                target: ""
            },
            {
                id: "RUT001-529",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "went",
                target: ""
            },
            {
                id: "RUT001-530",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "until",
                target: ""
            },
            {
                id: "RUT001-531",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "they",
                target: ""
            },
            {
                id: "RUT001-532",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "came",
                target: ""
            },
            {
                id: "RUT001-533",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "to",
                target: ""
            },
            {
                id: "RUT001-534",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".",
                markers: null,
                orig: null,
                source: "Bethlehem",
                target: ""
            },
            {
                id: "RUT001-535",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "It",
                target: ""
            },
            {
                id: "RUT001-536",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "Happened",
                target: ""
            },
            {
                id: "RUT001-537",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "when",
                target: ""
            },
            {
                id: "RUT001-538",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "they",
                target: ""
            },
            {
                id: "RUT001-539",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "had",
                target: ""
            },
            {
                id: "RUT001-540",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "come",
                target: ""
            },
            {
                id: "RUT001-541",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "to",
                target: ""
            },
            {
                id: "RUT001-542",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "Bethlehem",
                target: ""
            },
            {
                id: "RUT001-543",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "that",
                target: ""
            },
            {
                id: "RUT001-544",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "all",
                target: ""
            },
            {
                id: "RUT001-545",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-546",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "city",
                target: ""
            },
            {
                id: "RUT001-547",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "was",
                target: ""
            },
            {
                id: "RUT001-548",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "moved",
                target: ""
            },
            {
                id: "RUT001-549",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "about",
                target: ""
            },
            {
                id: "RUT001-550",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "them",
                target: ""
            },
            {
                id: "RUT001-551",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-552",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "they",
                target: ""
            },
            {
                id: "RUT001-553",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "asked",
                target: ""
            },
            {
                id: "RUT001-554",
                prepuncts: "\"",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "Is",
                target: ""
            },
            {
                id: "RUT001-555",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "this",
                target: ""
            },
            {
                id: "RUT001-556",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "?\"",
                markers: null,
                orig: null,
                source: "Naomi",
                target: ""
            },
            {
                id: "RUT001-557",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: "\\p \\v 20",
                orig: null,
                source: "She",
                target: ""
            },
            {
                id: "RUT001-558",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "said",
                target: ""
            },
            {
                id: "RUT001-559",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "to",
                target: ""
            },
            {
                id: "RUT001-560",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "them",
                target: ""
            },
            {
                id: "RUT001-561",
                prepuncts: "\"",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "Don\'t",
                target: ""
            },
            {
                id: "RUT001-562",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "call",
                target: ""
            },
            {
                id: "RUT001-563",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "me",
                target: ""
            },
            {
                id: "RUT001-564",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".",
                markers: null,
                orig: null,
                source: "Naomi",
                target: ""
            },
            {
                id: "RUT001-565",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "Call",
                target: ""
            },
            {
                id: "RUT001-566",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "me",
                target: ""
            },
            {
                id: "RUT001-567",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ";",
                markers: null,
                orig: null,
                source: "Mara",
                target: ""
            },
            {
                id: "RUT001-568",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "for",
                target: ""
            },
            {
                id: "RUT001-569",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-570",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "Almighty",
                target: ""
            },
            {
                id: "RUT001-571",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "has",
                target: ""
            },
            {
                id: "RUT001-572",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "dealt",
                target: ""
            },
            {
                id: "RUT001-573",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "very",
                target: ""
            },
            {
                id: "RUT001-574",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "bitterly",
                target: ""
            },
            {
                id: "RUT001-575",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "with",
                target: ""
            },
            {
                id: "RUT001-576",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".",
                markers: null,
                orig: null,
                source: "me",
                target: ""
            },
            {
                id: "RUT001-577",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: "\\v 21",
                orig: null,
                source: "I",
                target: ""
            },
            {
                id: "RUT001-578",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "went",
                target: ""
            },
            {
                id: "RUT001-479",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "out",
                target: ""
            },
            {
                id: "RUT001-580",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "full",
                target: ""
            },
            {
                id: "RUT001-581",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-582",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "Yahweh",
                target: ""
            },
            {
                id: "RUT001-583",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "has",
                target: ""
            },
            {
                id: "RUT001-584",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "brought",
                target: ""
            },
            {
                id: "RUT001-585",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "me",
                target: ""
            },
            {
                id: "RUT001-586",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "back",
                target: ""
            },
            {
                id: "RUT001-587",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ";",
                markers: null,
                orig: null,
                source: "empty",
                target: ""
            },
            {
                id: "RUT001-588",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "why",
                target: ""
            },
            {
                id: "RUT001-589",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "do",
                target: ""
            },
            {
                id: "RUT001-590",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "you",
                target: ""
            },
            {
                id: "RUT001-591",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "call",
                target: ""
            },
            {
                id: "RUT001-592",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "me",
                target: ""
            },
            {
                id: "RUT001-593",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "Naomi",
                target: ""
            },
            {
                id: "RUT001-594",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "since",
                target: ""
            },
            {
                id: "RUT001-595",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "Yahweh",
                target: ""
            },
            {
                id: "RUT001-596",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "has",
                target: ""
            },
            {
                id: "RUT001-597",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "testified",
                target: ""
            },
            {
                id: "RUT001-598",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "against",
                target: ""
            },
            {
                id: "RUT001-599",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "me",
                target: ""
            },
            {
                id: "RUT001-600",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-601",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-602",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "Almighty",
                target: ""
            },
            {
                id: "RUT001-603",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "has",
                target: ""
            },
            {
                id: "RUT001-604",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "afflicted",
                target: ""
            },
            {
                id: "RUT001-605",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "?\"",
                markers: null,
                orig: null,
                source: "me",
                target: ""
            },
            {
                id: "RUT001-606",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                orig: null,
                markers: "\\v 22",
                source: "So",
                target: ""
            },
            {
                id: "RUT001-607",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "Naomi",
                target: ""
            },
            {
                id: "RUT001-608",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "returned",
                target: ""
            },
            {
                id: "RUT001-609",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-610",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "Ruth",
                target: ""
            },
            {
                id: "RUT001-611",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-612",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "Moabitess",
                target: ""
            },
            {
                id: "RUT001-613",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "her",
                target: ""
            },
            {
                id: "RUT001-614",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "daughter-in-law",
                target: ""
            },
            {
                id: "RUT001-615",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "with",
                target: ""
            },
            {
                id: "RUT001-616",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "her",
                target: ""
            },
            {
                id: "RUT001-617",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "who",
                target: ""
            },
            {
                id: "RUT001-618",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "returned",
                target: ""
            },
            {
                id: "RUT001-619",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "out",
                target: ""
            },
            {
                id: "RUT001-620",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT001-621",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-622",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "country",
                target: ""
            },
            {
                id: "RUT001-623",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT001-624",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ":",
                markers: null,
                orig: null,
                source: "Moab",
                target: ""
            },
            {
                id: "RUT001-625",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT001-626",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "they",
                target: ""
            },
            {
                id: "RUT001-627",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "came",
                target: ""
            },
            {
                id: "RUT001-628",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "to",
                target: ""
            },
            {
                id: "RUT001-629",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "Bethlehem",
                target: ""
            },
            {
                id: "RUT001-630",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "in",
                target: ""
            },
            {
                id: "RUT001-631",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT001-632",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "beginning",
                target: ""
            },
            {
                id: "RUT001-633",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT001-634",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "barley",
                target: ""
            },
            {
                id: "RUT001-635",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".",
                markers: null,
                orig: null,
                source: "harvest",
                target: ""
            },
// CH 2
            {
                id: "RUT002-1",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: "\\c 2 \\p \\v 1",
                orig: null,
                source: "Naomi",
                target: ""
            },
            {
                id: "RUT002-2",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "had",
                target: ""
            },
            {
                id: "RUT002-3",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "a",
                target: ""
            },
            {
                id: "RUT002-4",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "relative",
                target: ""
            },
            {
                id: "RUT002-5",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT002-6",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "her",
                target: ""
            },
            {
                id: "RUT002-7",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "husband\'s",
                target: ""
            },
            {
                id: "RUT002-8",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "a",
                target: ""
            },
            {
                id: "RUT002-9",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "mighty",
                target: ""
            },
            {
                id: "RUT002-10",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "man",
                target: ""
            },
            {
                id: "RUT002-11",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT002-12",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "wealth",
                target: ""
            },
            {
                id: "RUT002-13",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT002-14",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "the",
                target: ""
            },
            {
                id: "RUT002-15",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "family",
                target: ""
            },
            {
                id: "RUT002-16",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "of",
                target: ""
            },
            {
                id: "RUT002-17",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ",",
                markers: null,
                orig: null,
                source: "Elimelech",
                target: ""
            },
            {
                id: "RUT002-18",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "and",
                target: ""
            },
            {
                id: "RUT002-19",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "his",
                target: ""
            },
            {
                id: "RUT002-20",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "name",
                target: ""
            },
            {
                id: "RUT002-21",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: null,
                orig: null,
                source: "was",
                target: ""
            },
            {
                id: "RUT002-22",
                prepuncts: "",
                midpuncts: "",
                follpuncts: ".",
                markers: null,
                orig: null,
                source: "Boaz",
                target: ""
            },
// CH 3
            {
                id: "RUT003-1",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: "\\c 3 \\p \\v 1",
                orig: null,
                source: "Naomi",
                target: ""
            },
// CH 4
            {
                id: "RUT004-1",
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
                markers: "\\c 4 \\p \\v 1",
                orig: null,
                source: "Now",
                target: ""
            }
        ],

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

        SourcePhrase = Backbone.Model.extend({
            // default values
            
            defaults: {
                id: null,
                markers: "",
                orig: null,
                prepuncts: "",
                midpuncts: "",
                follpuncts: "",
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