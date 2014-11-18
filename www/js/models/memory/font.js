/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        i           = 0,
        fonts = null,
        /*[
            {
                id: "Source",
                typeface: "Source Sans",
                size: "16px;",
                color: "#0000aa;"
            },
            {
                id: "Target",
                typeface: "Source Sans",
                size: "16px;",
                color: "#000;"
            },
            {
                id: "Navigation",
                typeface: "Source Sans",
                size: "16px;",
                color: "#00cc00;"
            }
        ],*/
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

        findByName = function (searchKey) {
            var deferred = $.Deferred();
            var results = fonts.filter(function (element) {
                return element.id.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
            deferred.resolve(results);
            return deferred.promise();
        },

        Font = Backbone.Model.extend({
            defaults: {
                name: "",
                typeface: "Source Sans",
                size: "16",
                color: "#0000aa"
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
//        }),
//
//        FontCollection = Backbone.Collection.extend({
//
//            model: Font,
//
//            sync: function (method, model, options) {
//                if (method === "read") {
//                    findByName(options.data.name).done(function (data) {
//                        options.success(data);
//                    });
//                }
//            }
        });

    return {
        Font: Font
//        FontCollection: FontCollection
    };

});