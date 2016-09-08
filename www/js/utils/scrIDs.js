/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

// scrIDs: Scripture ID data - name, 3-letter ID, number of chapters, etc.
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        i           = 0,
        /* OT/NT books, including apocrypha
        * versification info taken from https://github.com/digitalbiblesociety/browserbible-3/blob/master/app/js/bible/bible.data.json
        * apocrypha versification from the New Jerusalem Bible - http://ww.catholic.org/bible
        */
        scrIDs = [
            {
                id: "GEN",
                name: "Genesis",
                num: 1,
                chapters: [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26]
            },
            {
                id: "EXO",
                name: "Exodus",
                num: 2,
                chapters: [22, 25, 22, 31, 23, 30, 25, 32, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 26, 36, 31, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38]
            },
            {
                id: "LEV",
                name: "Leviticus",
                num: 3,
                chapters: [17, 16, 17, 35, 19, 30, 38, 36, 24, 20, 47, 8, 59, 57, 33, 34, 16, 30, 37, 27, 24, 33, 44, 23, 55, 46, 34]
            },
            {
                id: "NUM",
                name: "Numbers",
                num: 4,
                chapters: [54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 35, 16, 33, 45, 41, 50, 13, 32, 22, 29, 35, 41, 30, 25, 18, 65, 23, 31, 40, 16, 54, 42, 56, 29, 34, 13]
            },
            {
                id: "DEU",
                name: "Deuteronomy",
                num: 5,
                chapters: [46, 37, 29, 49, 33, 25, 26, 20, 29, 22, 32, 32, 18, 29, 23, 22, 20, 22, 21, 20, 23, 30, 25, 22, 19, 19, 26, 68, 29, 20, 30, 52, 29, 12]
            },
            {
                id: "JOS",
                name: "Joshua",
                num: [18, 24, 17, 24, 15, 27, 26, 35, 27, 43, 23, 24, 33, 15, 63, 10, 18, 28, 51, 9, 45, 34, 16, 33],
                chapters: 24
            },
            {
                id: "JDG",
                name: "Judges",
                num: 7,
                chapters: [36, 23, 31, 24, 31, 40, 25, 35, 57, 18, 40, 15, 25, 20, 20, 31, 13, 31, 30, 48, 25]
            },
            {
                id: "RUT",
                name: "Ruth",
                num: 8,
                chapters: [22, 23, 18, 22]
            },
            {
                id: "1SA",
                name: "1 Samuel",
                num: 9,
                chapters: [28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 42, 15, 23, 29, 22, 44, 25, 12, 25, 11, 31, 13]
            },
            {
                id: "2SA",
                name: "2 Samuel",
                num: 10,
                chapters: [27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33, 37, 23, 29, 33, 43, 26, 22, 51, 39, 25]
            },
            {
                id: "1KI",
                name: "1 Kings",
                num: 11,
                chapters: [53, 46, 28, 34, 18, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 53]
            },
            {
                id: "2KI",
                name: "2 Kings",
                num: 12,
                chapters: [18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 21, 21, 25, 29, 38, 20, 41, 37, 37, 21, 26, 20, 37, 20, 30]
            },
            {
                id: "1CH",
                name: "1 Chronicles",
                num: 13,
                chapters: [54, 55, 24, 43, 26, 81, 40, 40, 44, 14, 47, 40, 14, 17, 29, 43, 27, 17, 19, 8, 30, 19, 32, 31, 31, 32, 34, 21, 30]
            },
            {
                id: "2CH",
                name: "2 Chronicles",
                num: 14,
                chapters: [17, 18, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 22, 15, 19, 14, 19, 34, 11, 37, 20, 12, 21, 27, 28, 23, 9, 27, 36, 27, 21, 33, 25, 33, 27, 23]
            },
            {
                id: "EZR",
                name: "Ezra",
                num: 15,
                chapters: [11, 70, 13, 24, 17, 22, 28, 36, 15, 44]
            },
            {
                id: "NEH",
                name: "Nehemiah",
                num: 16,
                chapters: [11, 20, 32, 23, 19, 19, 73, 18, 38, 39, 36, 47, 31]
            },
            {
                id: "EST",
                name: "Esther",
                num: 17,
                chapters: [22, 23, 15, 17, 14, 14, 10, 17, 32, 3]
            },
            {
                id: "JOB",
                name: "Job",
                num: 18,
                chapters: [22, 13, 26, 21, 27, 30, 21, 22, 35, 22, 20, 25, 28, 22, 35, 22, 16, 21, 29, 29, 34, 30, 17, 25, 6, 14, 23, 28, 25, 31, 40, 22, 33, 37, 16, 33, 24, 41, 30, 24, 34, 17]
            },
            {
                id: "PSA",
                name: "Psalms",
                num: 19,
                chapters: [6, 12, 8, 8, 12, 10, 17, 9, 20, 18, 7, 8, 6, 7, 5, 11, 15, 50, 14, 9, 13, 31, 6, 10, 22, 12, 14, 9, 11, 12, 24, 11, 22, 22, 28, 12, 40, 22, 13, 17, 13, 11, 5, 26, 17, 11, 9, 14, 20, 23, 19, 9, 6, 7, 23, 13, 11, 11, 17, 12, 8, 12, 11, 10, 13, 20, 7, 35, 36, 5, 24, 20, 28, 23, 10, 12, 20, 72, 13, 19, 16, 8, 18, 12, 13, 17, 7, 18, 52, 17, 16, 15, 5, 23, 11, 13, 12, 9, 9, 5, 8, 28, 22, 35, 45, 48, 43, 13, 31, 7, 10, 10, 9, 8, 18, 19, 2, 29, 176, 7, 8, 9, 4, 8, 5, 6, 5, 6, 8, 8, 3, 18, 3, 3, 21, 26, 9, 8, 24, 13, 10, 7, 12, 15, 21, 10, 20, 14, 9, 6]
            },
            {
                id: "PRO",
                name: "Proverbs",
                num: 20,
                chapters: [33, 22, 35, 27, 23, 35, 27, 36, 18, 32, 31, 28, 25, 35, 33, 33, 28, 24, 29, 30, 31, 29, 35, 34, 28, 28, 27, 28, 27, 33, 31]
            },
            {
                id: "ECC",
                name: "Ecclesiastes",
                num: 21,
                chapters: [18, 26, 22, 16, 20, 12, 29, 17, 18, 20, 10, 14]
            },
            {
                id: "SNG",
                name: "Song of Solomon",
                num: 22,
                chapters: [17, 17, 11, 16, 16, 13, 13, 14]
            },
            {
                id: "ISA",
                name: "Isaiah",
                num: 23,
                chapters: [31, 22, 26, 6, 30, 13, 25, 22, 21, 34, 16, 6, 22, 32, 9, 14, 14, 7, 25, 6, 17, 25, 18, 23, 12, 21, 13, 29, 24, 33, 9, 20, 24, 17, 10, 22, 38, 22, 8, 31, 29, 25, 28, 28, 25, 13, 15, 22, 26, 11, 23, 15, 12, 17, 13, 12, 21, 14, 21, 22, 11, 12, 19, 12, 25, 24]
            },
            {
                id: "JER",
                name: "Jeremiah",
                num: 24,
                chapters: [19, 37, 25, 31, 31, 30, 34, 22, 26, 25, 23, 17, 27, 22, 21, 21, 27, 23, 15, 18, 14, 30, 40, 10, 38, 24, 22, 17, 32, 24, 40, 44, 26, 22, 19, 32, 21, 28, 18, 16, 18, 22, 13, 30, 5, 28, 7, 47, 39, 46, 64, 34]
            },
            {
                id: "LAM",
                name: "Lamentations",
                num: 25,
                chapters: [22, 22, 66, 22, 22]
            },
            {
                id: "EZK",
                name: "Ezekiel",
                num: 26,
                chapters: [28, 10, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 49, 32, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31, 25, 24, 23, 35]
            },
            {
                id: "DAN",
                name: "Daniel",
                num: 27,
                chapters: [21, 49, 30, 37, 31, 28, 28, 27, 27, 21, 45, 13]
            },
            {
                id: "HOS",
                name: "Hosea",
                num: 28,
                chapters: [11, 23, 5, 19, 15, 11, 16, 14, 17, 15, 12, 14, 16, 9]
            },
            {
                id: "JOL",
                name: "Joel",
                num: 29,
                chapters: [20, 32, 21]
            },
            {
                id: "AMO",
                name: "Amos",
                num: 30,
                chapters: [15, 16, 15, 13, 27, 14, 17, 14, 15]
            },
            {
                id: "OBA",
                name: "Obadiah",
                num: 31,
                chapters: [21]
            },
            {
                id: "JON",
                name: "Jonah",
                num: 32,
                chapters: [17, 10, 10, 11]
            },
            {
                id: "MIC",
                name: "Micah",
                num: 33,
                chapters: [16, 13, 12, 13, 15, 16, 20]
            },
            {
                id: "NAM",
                name: "Nahum",
                num: 34,
                chapters: [15, 13, 19]
            },
            {
                id: "HAB",
                name: "Habakkuk",
                num: 35,
                chapters: [17, 20, 19]
            },
            {
                id: "ZEP",
                name: "Zephaniah",
                num: 36,
                chapters: [18, 15, 20]
            },
            {
                id: "HAG",
                name: "Haggai",
                num: 37,
                chapters: [15, 23]
            },
            {
                id: "ZEC",
                name: "Zechariah",
                num: 38,
                chapters: [21, 13, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14, 9, 21]
            },
            {
                id: "MAL",
                name: "Malachi",
                num: 39,
                chapters: [14, 17, 18, 6]
            },
            
            {
                id: "MAT",
                name: "Matthew",
                num: 40,
                chapters: [25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20]
            },
            {
                id: "MRK",
                name: "Mark",
                num: 41,
                chapters: [45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37, 72, 47, 20]
            },
            {
                id: "LUK",
                name: "Luke",
                num: 42,
                chapters: [80, 52, 38, 44, 39, 49, 50, 56, 62, 42, 54, 59, 35, 35, 32, 31, 37, 43, 48, 47, 38, 71, 56, 53]
            },
            {
                id: "JHN",
                name: "John",
                num: 43,
                chapters: [51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25]
            },
            {
                id: "ACT",
                name: "Acts",
                num: 44,
                chapters: [26, 47, 26, 37, 42, 15, 60, 40, 43, 48, 30, 25, 52, 28, 41, 40, 34, 28, 41, 38, 40, 30, 35, 27, 27, 32, 44, 31]
            },
            {
                id: "ROM",
                name: "Romans",
                num: 45,
                chapters: [32, 29, 31, 25, 21, 23, 25, 39, 33, 21, 36, 21, 14, 23, 33, 27]
            },
            {
                id: "1CO",
                name: "1 Corinthians",
                num: 46,
                chapters: [31, 16, 23, 21, 13, 20, 40, 13, 27, 33, 34, 31, 13, 40, 58, 24]
            },
            {
                id: "2CO",
                name: "2 Corinthians",
                num: 47,
                chapters: [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 14]
            },
            {
                id: "GAL",
                name: "Galatians",
                num: 48,
                chapters: [24, 21, 29, 31, 26, 18]
            },
            {
                id: "EPH",
                name: "Ephesians",
                num: 49,
                chapters: [23, 22, 21, 32, 33, 24]
            },
            {
                id: "PHP",
                name: "Philippians",
                num: 50,
                chapters: [30, 30, 21, 23]
            },
            {
                id: "COL",
                name: "Colossians",
                num: 51,
                chapters: [29, 23, 25, 18]
            },
            {
                id: "1TH",
                name: "1 Thessalonians",
                num: 52,
                chapters: [10, 20, 13, 18, 28]
            },
            {
                id: "2TH",
                name: "2 Thessalonians",
                num: 53,
                chapters: [12, 17, 18]
            },
            {
                id: "1TI",
                name: "1 Timothy",
                num: 54,
                chapters: [20, 15, 16, 16, 25, 21]
            },
            {
                id: "2TI",
                name: "2 Timothy",
                num: 55,
                chapters: [18, 26, 17, 22]
            },
            {
                id: "TIT",
                name: "Titus",
                num: 56,
                chapters: [16, 15, 15]
            },
            {
                id: "PHM",
                name: "Philemon",
                num: 57,
                chapters: [25]
            },
            {
                id: "HEB",
                name: "Hebrews",
                num: 58,
                chapters: [14, 18, 19, 16, 14, 20, 28, 13, 28, 39, 40, 29, 25]
            },
            {
                id: "JAS",
                name: "James",
                num: 59,
                chapters: [27, 26, 18, 17, 20]
            },
            {
                id: "1PE",
                name: "1 Peter",
                num: 60,
                chapters: [25, 25, 22, 19, 14]
            },
            {
                id: "2PE",
                name: "2 Peter",
                num: 61,
                chapters: [21, 22, 18]
            },
            {
                id: "1JN",
                name: "1 John",
                num: 62,
                chapters: [10, 29, 24, 21, 21]
            },
            {
                id: "2JN",
                name: "2 John",
                num: 63,
                chapters: [13]
            },
            {
                id: "3JN",
                name: "3 John",
                num: 64,
                chapters: [14]
            },
            {
                id: "JUD",
                name: "Jude",
                num: 65,
                chapters: [25]
            },
            {
                id: "REV",
                name: "Revelation",
                num: 66,
                chapters: [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 17, 18, 20, 8, 21, 18, 24, 21, 15, 27, 20]
            },

            // *************************************************
            // Apocrypha, etc.
            {
                id: "JDT",
                name: "Judith",
                num: 82,
                chapters: [16, 28, 10, 15, 24, 21, 32, 36, 14, 23, 23, 20, 20, 19, 14, 25]
            },
            {
                id: "SIR",
                name: "Sirach (Ecclesiasticus)",
                num: 84,
                chapters: [30, 18, 31, 31, 15, 37, 36, 19, 18, 31, 34, 18, 26, 27, 20, 30, 32, 33, 30, 31, 28, 27, 27, 34, 26, 29, 30, 26, 28, 25, 31, 24, 33, 26, 24, 27, 31, 34, 35, 30, 27, 25, 33, 23, 26, 20, 25, 25, 16, 29, 30]
            },
            {
                id: "TOB",
                name: "Tobit",
                num: 86,
                chapters: [22, 14, 17, 21, 22, 17, 18]
            },
            {
                id: "WIS",
                name: "Wisdom of Solomon",
                num: 87,
                chapters: [16, 24, 19, 20, 23, 25, 30, 21, 18, 21, 26, 27, 19, 31, 19, 29, 21, 25, 22]
            },
            {
                id: "BAR",
                name: "Baruch",
                num: 101,
                chapters: [22, 35, 38, 37, 9, 72]
            },
            {
                id: "MA1",
                name: "1 Maccabees",
                num: 110,
                chapters: [54, 70, 60, 61, 68, 63, 50, 32, 73, 89, 74, 53, 53, 49, 41, 24]
            },
            {
                id: "MA2",
                name: "2 Maccabees",
                num: 112,
                chapters: [36, 32, 40, 50, 27, 31, 42, 36, 29, 38, 38, 45, 26, 46, 39]
            },
            
            // *************************************************
            // Colophon, etc. - 15 of them, no versification
            {
                id: "XXA",
                name: "Extra Matter A",
                num: 0,
                chapters: []
            },
            {
                id: "XXB",
                name: "Extra Matter B",
                num: 0,
                chapters: []
            },
            {
                id: "XXC",
                name: "Extra Matter C",
                num: 0,
                chapters: []
            },
            {
                id: "XXD",
                name: "Extra Matter D",
                num: 0,
                chapters: []
            },
            {
                id: "XXE",
                name: "Extra Matter E",
                num: 0,
                chapters: []
            },
            {
                id: "XXF",
                name: "Extra Matter F",
                num: 0,
                chapters: []
            },
            {
                id: "XXG",
                name: "Extra Matter G",
                num: 0,
                chapters: []
            },
            {
                id: "FRT",
                name: "Front Matter",
                num: 0,
                chapters: []
            },
            {
                id: "BAK",
                name: "Back Matter",
                num: 0,
                chapters: []
            },
            {
                id: "OTH",
                name: "Other Matter",
                num: 0,
                chapters: []
            },
            {
                id: "INT",
                name: "Introduction",
                num: 0,
                chapters: []
            },
            {
                id: "CNC",
                name: "Concordance",
                num: 0,
                chapters: []
            },
            {
                id: "GLO",
                name: "Glossary",
                num: 0,
                chapters: []
            },
            {
                id: "TDX",
                name: "Topical Index",
                num: 0,
                chapters: []
            },
            {
                id: "NDX",
                name: "Names Index",
                num: 0,
                chapters: []
            }
        ],
        
        // *************************************************
        // Following are apocrypha that I was unable to retrieve versification info for:
        // From USX.rnc v. 2.5 (codes and names):
//            {
//                id: "ESG",
//                name: "Esther", // Esther (Greek)
//                num: 80,
//                chapters: []
//            },
//            {
//                id: "S3Y",
//                name: "Song of Three Young Men",
//                num: 80,
//                chapters: []
//            },
//            {
//                id: "1MA",
//                name: "1 Maccabees",
//                num: 80,
//                chapters: []
//            },
//            {
//                id: "2MA",
//                name: "2 Maccabees",
//                num: 80,
//                chapters: []
//            },
//            {
//                id: "3MA",
//                name: "3 Maccabees",
//                num: 80,
//                chapters: []
//            },
//            {
//                id: "4MA",
//                name: "4 Maccabees",
//                num: 80,
//                chapters: []
//            },
//            {
//                id: "1ES",
//                name: "1 Esdras",
//                num: 80,
//                chapters: []
//            },
//            {
//                id: "2ES",
//                name: "2 Esdras",
//                num: 80,
//                chapters: []
//            },
//            {
//                id: "PS2",
//                name: "Psalm 151",
//                num: 80,
//                chapters: []
//            },
//            {
//                id: "EZA",
//                name: "Apocalypse of Ezra",
//                num: 80,
//                chapters: []
//            },
//            {
//                id: "5EZ",
//                name: "5 Ezra",
//                num: 80,
//                chapters: []
//            },
//            {
//                id: "6EZ",
//                name: "6 Ezra",
//                num: 80,
//                chapters: []
//            },
//            {
//                id: "DAG",
//                name: "Daniel (Greek)",
//                num: 80,
//                chapters: []
//            },
//            {
//                id: "PS3",
//                name: "Psalms 152-155",
//                num: 80,
//                chapters: []
//            },
//            {
//                id: "2BA",
//                name: "2 Baruch",
//                num: 80,
//                chapters: []
//            },
//            {
//                id: "LBA",
//                name: "Letter of Baruch",
//                num: 80,
//                chapters: []
//            },
//            {
//                id: "4BA",
//                name: "4 Baruch",
//                num: 80,
//                chapters: []
//            },
//            {
//                id: "ENO",
//                name: "Enoch",
//                num: 80,
//                chapters: []
//            },
//            {
//                id: "1MQ",
//                name: "1 Meqabyan",
//                num: 80,
//                chapters: []
//            },
//            {
//                id: "2MQ",
//                name: "2 Meqabyan",
//                num: 80,
//                chapters: []
//            },
//            {
//                id: "3MQ",
//                name: "3 Meqabyan",
//                num: 80,
//                chapters: []
//            },
//            {
//                id: "REP",
//                name: "Reproof",
//                num: 80,
//                chapters: []
//            },
//            {
//                id: "BEL",
//                name: "Bel and the Dragon",
//                num: 80,
//                chapters: []
//            },
//            {
//                id: "SUS",
//                name: "Susanna",
//                num: 81,
//                chapters: []
//            },
//            {
//                id: "MAN",
//                name: "Prayer of Manassah",
//                num: 83,
//                chapters: []
//            },
//            {
//                id: "LJE",
//                name: "Letter of Jeremiah",
//                num: 100,
//                chapters: []
//            },
//            {
//                id: "ODA",
//                name: "Odes",
//                num: 131,
//                chapters: []
//            },
//            {
//                id: "PSS",
//                name: "Psalms of Solomon",
//                num: 132,
//                chapters: []
//            },
//            {
//                id: "JUB",
//                name: "Jubilees",
//                num: 140,
//                chapters: []
//            }

        // Not in USX.RNC either...
//            {
//                id: "S3Y",
//                name: "Prayer of Azariah",
//                num: 88,
//                chapters: []
//            },
//            {
//                id: "PJE",
//                name: "Prayer of Jeremiah",
//                num: 133,
//                chapters: []
//            },
        
        findById = function (id) {
            var deferred = $.Deferred(),
                scrID = null,
                l = scrIDs.length;
            for (i = 0; i < l; i++) {
                if (scrIDs[i].id === id) {
                    scrID = scrIDs[i];
                    break;
                }
            }
            deferred.resolve(scrID);
            return deferred.promise();
        },

        findByName = function (searchKey) {
            var deferred = $.Deferred();
            var results = scrIDs.filter(function (element) {
                return element.id.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
            deferred.resolve(results);
            return deferred.promise();
        },

        ScrID = Backbone.Model.extend({
            defaults: {
                id: "",
                name: "",
                num: 0,
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

        ScrIDCollection = Backbone.Collection.extend({

            model: ScrID,

            sync: function (method, model, options) {
                if (method === "read") {
                    findByName(options.data.id).done(function (data) {
                        options.success(data);
                    });
                }
            }

        });

    return {
        ScrID: ScrID,
        ScrIDCollection: ScrIDCollection
    };

});