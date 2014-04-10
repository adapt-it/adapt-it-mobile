/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        i           = 0,
        /* OT/NT books, not counting apocrypha
        */
        targetunits = [
            {
                "id": "001",
                "refstring": ""
            },
            {
                "id": "EXO",
                "name": "Exodus"
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
                return element.name.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
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