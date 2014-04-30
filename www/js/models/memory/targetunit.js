/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        i           = 0,
        /* hard-coded KB from the sample WEB data (see sourcephrase.js)
        */
        targetunits = [
            {
                "id": "en.en.0000001",
                "source": "RUT",
                "target": "RUT",
                "n": "1",
                "timestamp": "2013-09-18T18:50:35z",
                "user": "user:machine"
            },
            {
                "id": "en.en.0000002",
                "source": "08-RUT-web.sfm",
                "target": "08-RUT-web.sfm",
                "n": "1",
                "timestamp": "2014-01-01T18:50:35z",
                "user": "user:machine"
            },
            {
                "id": "en.en.0000003",
                "source": "Ruth",
                "target": "Ruth",
                "n": "2",
                "dt": "2013-09-18T18:50:35z",
                "user": "user:machine"
            },
            {
                "id": "en.en.0000004",
                "source": "It",
                "target": "It",
                "n": "1",
                "timestamp": "2013-09-18T18:50:35z",
                "user": "user:machine"
            },
            {
                "id": "en.en.0000005",
                "source": "happened",
                "target": "came about",
                "n": "1",
                "timestamp": "2013-09-18T18:50:35z",
                "user": "user:machine"
            },
            {
                "id": "en.en.0000006",
                "source": "in",
                "target": "during",
                "n": "1",
                "timestamp": "2013-09-18T18:50:35z",
                "user": "user:machine"
            },
            {
                "id": "en.en.0000007",
                "TU": "the",
                "target": "the",
                "n": "2",
                "timestamp": "2013-09-18T18:50:35z",
                "user": "user:machine"
            },
            {
                "id": "en.en.0000008",
                "source": "days",
                "target": "days",
                "n": "1",
                "timestamp": "2013-09-18T18:50:35z",
                "user": "user:machine"
            },
            {
                "id": "en.en.0000009",
                "TU": "when",
                "target": "when",
                "n": "1",
                "timestamp": "2013-09-18T18:50:35z",
                "user": "user:machine"
            },
            {
                "id": "en.en.0000010",
                "source": "judges",
                "target": "judges",
                "n": "1",
                "timestamp": "2013-09-18T18:50:35z",
                "user": "user:machine"
            },
            {
                "id": "en.en.0000011",
                "source": "judged",
                "target": "judged",
                "n": "1",
                "timestamp": "2013-09-18T18:50:35z",
                "user": "user:machine"
            },
            {
                "id": "en.en.0000012",
                "source": "that",
                "target": "reallyreallyreallyreallyreallyloooooooooonnnnnnngstring",
                "n": "1",
                "timestamp": "2013-09-18T18:50:35z",
                "user": "user:machine"
            }
        ],
        findById = function (id) {
            var deferred = $.Deferred(),
                targetunit = null,
                l = targetunits.length;
            for (i = 0; i < l; i++) {
                if (targetunits[i].id === id) {
                    targetunit = targetunits[i];
                    break;
                }
            }
            deferred.resolve(targetunit);
            return deferred.promise();
        },

        findByName = function (searchKey) {
            var deferred = $.Deferred();
            var results = targetunits.filter(function (element) {
                return element.id.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
            deferred.resolve(results);
            return deferred.promise();
        },

        findBySource = function (searchKey) {
            var deferred = $.Deferred();
            var results = targetunits.filter(function (element) {
                return element.source.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
            deferred.resolve(results);
            return deferred.promise();
        },

        TargetUnit = Backbone.Model.extend({

            sync: function (method, model, options) {
                if (method === "read") {
                    findById(this.id).done(function (data) {
                        options.success(data);
                    });
                }
            }

        }),

        TargetUnitCollection = Backbone.Collection.extend({

            model: TargetUnit,

            sync: function (method, model, options) {
                if (method === "read") {
                    findByName(options.data.name).done(function (data) {
                        options.success(data);
                    });
                }
            }

        });

    return {
        TargetUnit: TargetUnit,
        TargetUnitCollection: TargetUnitCollection
    };

});