/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

// HandlebarHelpers.js
// Helper methods for our handlebars.js templates.
define(function (require) {

    "use strict";

    var Underscore  = require('underscore'),
        Handlebars  = require('handlebars'),
        filterID    = "",
        isSpecialText = false,
        i18n        = require('i18n');
    
    // Return the localized string corresponding to the specified key.
    Handlebars.registerHelper('t', function (i18n_key) {
        var result = i18n.t(i18n_key);
//        console.log(i18n_key + ":" + result);
        return new Handlebars.SafeString(result);
    });

    // add one to the given number -- used to print out the index+offset for
    // the filtered text items
    Handlebars.registerHelper("inc", function (value, options) {
        var result = parseInt(value, 10) + 1;
        return new Handlebars.SafeString(result);
    });
    
    // Return the localized string corresponding to the specified key,
    // with the passed in options. Use this method if you need to pass in
    // a key with an embedded variable ("You need %s more"), for example.
    Handlebars.registerHelper('tr', function (context, options) {
        var opts = i18n.functions.extend(options.hash, context),
            key = null;
        if (options.fn) {
            opts.defaultValue = options.fn(context);
        }
        for (key in opts) {
            opts[key] = Handlebars.Utils.escapeExpression(opts[key]);
        }
        var result = i18n.t(opts.key, opts);

        return new Handlebars.SafeString(result);
    });

    // Return the concatenated string of marker classes for the CSS class list. Also emits the following:
    // - "filter" and "moreFilter" classes if filtering is enabled and we encounter filtered markers
    // - "specialtext" class if we come across a marker that should be displayed in the "special text" color.
    Handlebars.registerHelper('classes', function () {
        var ary = this.markers.replace("@", "at").split("\\"),
            result = "",
            filtered = false,
            tmpString = "",
            marker = "",
            filterString = window.Application.filterList,
            newID = Underscore.uniqueId(),
            hasSpecialText = false,
            SpecialTextMarkers = " _heading_base _intro_base _list_base _notes_base _peripherals_base at add bn br bt cap efm ef d di div dvrf f fe fr fk fq fqa fl fp ft fdc fv fm free gm gs gd gp h h1 h2 h3 hr id imt imt1 imt2 imt3 imt4 imte imte1 imte2 is is1 is2 ip ipi ipq ipr iq iq1 iq2 iq3 im imi ili ili1 ili2 imq ib iot io io1 io2 io3 io4 ior iex iqt ie k1 k2 lit mr ms ms1 ms2 ms3 mt mt1 mt2 mt3 mt4 mte mte1 mte2 nc nt note p1 p2 pm pmc pmr pt ps pp pq r rem rr rq s s1 s2 s3 s4 sp sr sx sts",
            i = 0;
        // if no markers are present, add any special text info and exit
        if (this.markers.length === 0) {
            if (isSpecialText === true) {
                // continuing through some special text
                result += " specialtext";
            }
            return new Handlebars.SafeString(result);
        }
        // loop through the marker array
        for (i = 0; i < ary.length; i++) {
            if (i > 0) {
                result += " ";
            }
            marker = ary[i].trim();
            if (marker.length > 0) {
                result += "usfm-" + ary[i].substring(0, (ary[i].indexOf(" ") === -1) ? ary[i].length : ary[i].indexOf(" "));
                if (filterString.indexOf("\\" + marker + " ") >= 0) {
                    filtered = true;
                }
                // check for special text
                if (SpecialTextMarkers.indexOf(" " + marker + " ") > -1) {
                    hasSpecialText = true;
                }
                // Chapter and verse numbers come in a strip just before the actual marker (here) --
                // we need to remove any paragraph breaks here so that the chapter / verse # appear on the same line
                if ((this.markers.indexOf("\\c") > -1) || (this.markers.indexOf("\\v") > -1)) {
                    tmpString = result.replace("usfm-p", " "); // remove para mark (css class only)
                    result = tmpString;
                }
            }
        }
        if (hasSpecialText === true) {
            result += " specialtext ";
            isSpecialText = true; // toggle the flag for subsequent piles
        } else {
            isSpecialText = false; // didn't see special text -- turn the flag off
        }
        if (filtered === true) {
            result += " filter ";
            if (filterID.length > 0) {
                result += "moreFilter ";
            } else {
                // new filter -- create an ID
                filterID = "fid-" + newID.toString();
            }
            result += filterID;
        } else {
            filterID = ""; // no longer filtering
        }
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
    
    Handlebars.registerHelper('AppVersion', function () {
        var result = window.Application.version;
        return new Handlebars.SafeString(result);
    });
    
    // If/then processing helper:
    // Handlebars doesn't directly perform conditional expression evaluation, so we
    // need to roll our own.
    // This block was modified from the following post:
    // http://stackoverflow.com/questions/8853396/logical-operator-in-a-handlebars-js-if-conditional
    Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
        var ary = v1.replace("@", "at").split("\\"),
            filterString = window.Application.filterList,
            i = 0,
            marker = "",
            bFiltered = false,
            elts = [];
        switch (operator) {
        case 'notFiltered':
            // loop through the marker array -- return true if we encounter a marker that is currently being
            // filtered from the UI
            for (i = 0; i < ary.length; i++) {
                marker = ary[i].trim();
                if (marker.length > 0) {
                    if (filterString.indexOf("\\" + marker + " ") >= 0) {
                        return options.inverse(this);
                    }
                }
            }
            return options.fn(this);
        case 'instring':
            return (v1.indexOf(v2) !== -1) ? options.fn(this) : options.inverse(this);
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