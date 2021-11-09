/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        i           = 0,
        fonts = null,

        findById = function (id) {
            var deferred = $.Deferred(),
                font = null,
                l = fonts.length;
            for (i = 0; i < l; i++) {
                if (fonts[i].id === id) {
                    font = fonts[i];
                    break;
                }
            }
            deferred.resolve(font);
            return deferred.promise();
        },

        MergeVerse = Backbone.Model.extend({
            defaults: {
                chapterid: "",
                verse: "", // verse marker (e.g., "\v 5")
                verseID: "", // sourcephrase ID?
                norder: 0,  // display order of sourcephrase (might be different than sourcephrase ID)
                spsImporting: [], // ?? unattached sourcephrase IDs?
                spsDB: [] // array of sourcephrase IDs
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
        });

    return {
        mergeVerse: MergeVerse
    };

});