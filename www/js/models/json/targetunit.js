/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require) {

    "use strict";

    var Backbone = require('backbone'),

        TargetUnit = Backbone.Model.extend({

            urlRoot: "http://localhost:3000/targetunit"

        }),

        TargetUnitCollection = Backbone.Collection.extend({

            model: TargetUnit,

            url: "http://localhost:3000/targetunits"

        });

    return {
        TargetUnit: TargetUnit,
        TargetUnitCollection: TargetUnitCollection
    };

});