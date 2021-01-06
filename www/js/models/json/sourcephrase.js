/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require) {

    "use strict";

    var Backbone = require('backbone'),

        SourcePhrase = Backbone.Model.extend({

            urlRoot: "/sp"

        }),

        SourcePhraseCollection = Backbone.Collection.extend({

            model: SourcePhrase,

            url: "/sps"

        });

    return {
        SourcePhrase: SourcePhrase,
        SourcePhraseCollection: SourcePhraseCollection
    };

});