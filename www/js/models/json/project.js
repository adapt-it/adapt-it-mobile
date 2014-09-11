/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require) {

    "use strict";

     var Backbone = require('backbone'),

        Project = Backbone.Model.extend({

            urlRoot: "http://localhost:3000/project"

        }),

        ProjectCollection = Backbone.Collection.extend({

            model: Project,

            url: "http://localhost:3000/projects"

        });

    return {
        Project: Project,
        ProjectCollection: ProjectCollection
    };

});