define(function (require) {

    "use strict";

    var Backbone = require('backbone'),

        SourcePhrase = Backbone.Model.extend({

            urlRoot: "http://localhost:3000/sp"

        }),

        SourcePhraseCollection = Backbone.Collection.extend({

            model: SourcePhrase,

            url: "http://localhost:3000/sps"

        });

    return {
        SourcePhrase: SourcePhrase,
        SourcePhraseCollection: SourcePhraseCollection
    };

});