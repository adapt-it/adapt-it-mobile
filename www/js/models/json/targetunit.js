/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require) {

    "use strict";

    var Backbone = require('backbone'),

        TargetUnit = Backbone.Model.extend({

            urlRoot: "/targetunit"

        }),

        TargetUnitCollection = Backbone.Collection.extend({

            model: TargetUnit,

            url: "/targetunits"

        });

    return {
        TargetUnit: TargetUnit,
        TargetUnitCollection: TargetUnitCollection
    };

});