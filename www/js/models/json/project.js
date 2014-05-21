/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require) {

    "use strict";

    var Backbone = require('backbone'),

        Project = Backbone.Model.extend({

            urlRoot: "http://localhost:3000/project"

        });

    return {
        Project: Project
    };

});