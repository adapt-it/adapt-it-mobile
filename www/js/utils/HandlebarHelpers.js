/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

// HandlebarHelpers.js
// Helper methods for our handlebars.js templates.
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        Underscore  = require('underscore'),
        Handlebars  = require('handlebars'),
        i18n        = require('i18n');
    
    // Return the localized string corresponding to the specified key.
    Handlebars.registerHelper('t', function (i18n_key) {
        var result = i18n.t(i18n_key);
//        console.log(i18n_key + ":" + result);
        return new Handlebars.SafeString(result);
    });
    
    // Return the localized string corresponding to the specified key,
    // with the passed in options. Use this method if you need to pass in
    // a key with an embedded variable ("You need %s more"), for example.
    Handlebars.registerHelper('tr', function (context, options) {
        var opts = i18n.functions.extend(options.hash, context);
        if (options.fn) {
            opts.defaultValue = options.fn(context);
        }
        var result = i18n.t(opts.key, opts);

        return new Handlebars.SafeString(result);
    });
    
    // Return the concatenated string of marker classes for the CSS class list
    Handlebars.registerHelper('classify', function (markerlist) {
        var ary = this.markers.split("\\"),
            result = "",
            i = 0;
        if (this.markers.length === 0) {
            return new Handlebars.SafeString(this.markers);
        }
        for (i = 0; i < ary.length; i++) {
            if (i > 0) {
                result += " ";
            }
            ary[i].replace("@", "at"); // this marker breaks our css rules... replace it
            if (ary[i].trim().length > 0) {
                result += "usfm-" + ary[i].substring(0, (ary[i].indexOf(" ") === -1) ? ary[i].length : ary[i].indexOf(" "));
            }
        }
//        var result = this.markers.replace(new RegExp('[\]+', 'g'), "usfm-");
        return new Handlebars.SafeString(result);
    });

    
    // Return a chapter number.
    Handlebars.registerHelper('chapter', function () {
        // extract and return the chapter number from the markers
        var result = parseInt(this.markers.substring(this.markers.indexOf('c') + 1), 10);
//        console.log(this.markers.substring(this.markers.indexOf('c')));
        return new Handlebars.SafeString(result);
    });
    
    // Return a verse number
    Handlebars.registerHelper('verse', function () {
        // extract and return the verse number from the markers
        var result = parseInt(this.markers.substring(this.markers.indexOf('v') + 1), 10);
//        console.log(this.markers.substring(this.markers.indexOf('v') + 1));
        return new Handlebars.SafeString(result);
    });

    // Return a unique ID
    Handlebars.registerHelper('id', function () {
        // extract and return the verse number from the markers
        var result = Underscore.uniqueId();
        return new Handlebars.SafeString(result);
    });
    
    // If/then processing helper:
    // Handlebars doesn't directly perform conditional expression evaluation, so we
    // need to roll our own.
    // This block was modified from the following post:
    // http://stackoverflow.com/questions/8853396/logical-operator-in-a-handlebars-js-if-conditional
    Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
        var elts = [],
            i = 0;
        switch (operator) {
        case 'startswith':
            return (v1.indexOf(v2) === 0) ? options.fn(this) : options.inverse(this);
        case 'contains':
            elts = v2.split(',');
            for (i = 0; i < elts.length; i++) {
                if (v1.indexOf(elts[i]) !== -1) {
                    return options.fn(this);
                }
            }
            return options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case 'lt':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case 'lte':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case 'gt':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case 'gte':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
        }
    });
});