/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

// AdaptViews.js
// Adaptation page functionality for AIM.
// --
// States: 
// S1 - nothing selected
// S2 - walkthrough help displayed (onHelp handler)
// S3 - selecting source phrases (isSelecting == true)
// S4 - source phrases selected (also the initial state - see SourcePhraseListView:Render())
// S5 - filter dialog displayed
// S6 - target edit field displayed / focused
// S7 - select KB dropdown displayed (typeahead)
// S8 - KB auto-inserting
// S9 - finished adapting chapter dialog displayed
// S10 - More (...) actions dropdown menu displayed
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Underscore  = require('underscore'),
        Handlebars  = require('handlebars'),
        Backbone    = require('backbone'),
        Marionette  = require('marionette'),
        featherlightGallery = require('featherlightGallery'),
        i18next     = require('i18n'),
        hopscotch   = require('hopscotch'),
        ta          = require('typeahead'),
        hammer      = require('hammerjs'),
        usfm        = require('utils/usfm'),
        spModels    = require('app/models/sourcephrase'),
        kbModels    = require('app/models/targetunit'),
        projModel   = require('app/models/project'),
        chapterModel = require('app/models/chapter'),
        bookModel   = require('app/models/book'),
        tplChapter  = require('text!tpl/Chapter.html'),
        tplLoadingPleaseWait = require('text!tpl/LoadingPleaseWait.html'),
        tplSourcePhraseList = require('text!tpl/SourcePhraseList.html'),
        tplSourcePhrase = require('text!tpl/SourcePhrase.html'),
        tplFilters  = require('text!tpl/FilterList.html'),
        theFilters  = Handlebars.compile(tplFilters),
        kblist      = null, // real value passed in constructor
        project     = null, // real value passed in constructor
        chapter     = null, // real value passed in constructor
        USFMMarkers = null,
        selectedStart = null,
        selectedEnd = null,
        idxStart = null,
        idxEnd = null,
        clearKBInput = false,
        isDirty = false,        // does the target text need to be saved?
        isSelecting = false,    // is the user selecting a pile / range of piles?
        isPlaceholder = false,
        isPhrase = false,
        isDrafting = true,
        isSelectingFirstPhrase = false,
        isAutoPhrase = false,
        isSelectingKB = false,  // is the user working with a select target text dropdown?
        MovingDir = 0, // -1 = backwards, 0 = not moving, 1 = forwards
        idx = 1,
        isRetranslation = false,
        template = null,
        punctsSource = [],
        punctsTarget = [],
        caseSource = [],
        caseTarget = [],
        lastTapTime = null,
        origText = "",
        lastPile = null,
        isLongPressSelection = false,
        LongPressSectionStart = null,
        longPressTimeout = null,
        lastOffset = 0,
        
        /////
        // Static methods
        /////

        // Helper method to scroll to the specified element in the view
        // This method also takes into account the software / on-screen keyboard
        scrollToView = function (element) {
            // viewport dimensions
            var docViewTop = $("#content").scrollTop();
            var docViewHeight = document.documentElement.clientHeight - $("#title").outerHeight(); // height of #content element
            var docViewBottom = 0; // viewport area to work with -- calculated below
            // element dimensions
            var eltTop = $(element).position().top + docViewTop; // adding scrolltop of div
            var eltBottom = eltTop + $(element).height();
            var offset = 0;
            
//            console.log("scrollToView() looking at element: " + $(element).attr("id"));
//            console.log("-- Currently chapter position = " + $(".chapter").css("position"));
            // if we're scrolling to show the possible KB entries, add some space for the drop-down
            if (isSelectingKB === true) {
                eltBottom += 36; // guess 2 entries
            }
            // check to see if we're on a mobile device
            if (navigator.notification && device.platform === "iOS" && !Keyboard.isVisible) {
                // on mobile device AND the keyboard hasn't displayed yet:
                // the viewport height is going to shrink when the software keyboard displays
                // HACK: subtract the software keyboard from the visible area end -
                // We can only get the keyboard height programmatically on ios, using the keyboard plugin's
                // keyboardHeightWillChange event. Ugh. Fudge it here until we can come up with something that can
                // work cross-platform
//                console.log("Adjusting docViewBottom - original value: " + docViewBottom);
                if (window.orientation === 90 || window.orientation === -90) {
                    // landscape
                    docViewHeight -= 162; // observed / hard-coded "best effort" value
                } else {
                    // portrait
                    docViewHeight -= 248; // observed / hard-coded "best effort" value
                }
            }
            // now calculate docViewBottom
            docViewBottom = docViewTop + docViewHeight;
//            console.log("- eltBottom: " + eltBottom + ", docViewHeight: " + docViewHeight + ", docViewBottom: " + docViewBottom);
//            console.log("- eltTop: " + eltTop + ", docViewTop: " + docViewTop);
            // now check to see if the content needs scrolling
            if ((eltBottom > docViewBottom) || (eltTop < docViewTop)) {
                 // Not in view -- scroll to the element
                if (($(element).height() * 2) < docViewHeight) {
                    // more than 2 rows available in viewport -- center it
//                    console.log("More than two rows visible -- centering focused area");
                    offset = eltTop - (docViewHeight / 2);
                } else {
                    // viewport height is too small -- scroll to element itself
//                    console.log("Small viewport -- scrolling to the element itself");
                    offset = eltTop;
                }
                offset = Math.round(offset); // round it to the nearest integer
//                console.log("Scrolling to: " + offset);
                $("#content").scrollTop(offset);
                lastOffset = offset;
//                docViewTop = $("#content").scrollTop();
//                console.log("Content scroll top is now: " + docViewTop);
                return false;
            }
//            console.log("No scrolling needed.");
            return true;
        },
    
        // Helper method to store the specified source and target text in the KB.
        saveInKB = function (sourceValue, targetValue, oldTargetValue, projectid) {
            var elts = kblist.filter(function (element) {
                return (element.attributes.projectid === projectid &&
                   element.attributes.source === sourceValue);
            });
            var tu = null,
                curDate = new Date(),
                timestamp = (curDate.getFullYear() + "-" + (curDate.getMonth() + 1) + "-" + curDate.getDay() + "T" + curDate.getUTCHours() + ":" + curDate.getUTCMinutes() + ":" + curDate.getUTCSeconds() + "z");
            if (elts.length > 0) {
                tu = elts[0];
            }
            if (tu) {
                var i = 0,
                    found = false,
                    refstrings = tu.get('refstring');
                // delete or decrement the old value
                if (oldTargetValue.length > 0) {
                    // there was an old value -- try to find and remove the corresponding KB entry
                    while (found === false && i < refstrings.length) {
                        if (refstrings[i].target === oldTargetValue) {
                            found = true;
                            // decrement the refcount until it is -1
                            // (-1 means "this refstring has been removed")
                            if (parseInt(refstrings[i].n, 10) >= 0) {
                                refstrings[i].n--;
                            }
                        }
                        i++;
                    }
                }
                // reset the "found" flag for the next search
                found = false;
                // add or increment the new value
                for (i = 0; i < refstrings.length; i++) {
                    if (refstrings[i].target === targetValue) {
                        if (refstrings[i].n < 0) {
                            // special case -- this value was removed, but now we've got it again:
                            // reset the count to 1 in this case
                            refstrings[i].n = '1';
                        } else {
                            refstrings[i].n++;
                        }
                        found = true;
                        break;
                    }
                }
                if (found === false) {
                    // no entry in KB with this source/target -- add one
                    var newRS = {
                            'target': Underscore.unescape(targetValue),  //klb
                            'n': '1'
                        };
                    refstrings.push(newRS);
                }
                // sort the refstrings collection on "n" (refcount)
                refstrings.sort(function (a, b) {
                    // high to low
                    return parseInt(b.n, 10) - parseInt(a.n, 10);
                });
                // update the KB model
                tu.set('refstring', refstrings, {silent: true});
                tu.set('timestamp', timestamp, {silent: true});
                tu.update();
            } else {
                // no entry in KB with this source -- add one
                var newID = Underscore.uniqueId(),
                    newTU = new kbModels.TargetUnit({
                        tuid: newID,
                        projectid: projectid,
                        source: sourceValue,
                        refstring: [
                            {
                                target: Underscore.unescape(targetValue),  //klb
                                n: "1"
                            }
                        ],
                        timestamp: timestamp,
                        user: ""
                    });
                kblist.add(newTU);
                newTU.save();
            }
        },
        // Helper method to remove a target value from the KB. Called from onUndo().
        removeFromKB = function (sourceValue, targetValue, projectid) {
            console.log("removeFromKB - sourceValue=" + sourceValue + ", targetValue=" + targetValue + ", projectid=" + projectid);
            var elts = kblist.filter(function (element) {
                return (element.attributes.projectid === projectid &&
                   element.attributes.source === sourceValue);
            });
            var tu = null,
                curDate = new Date(),
                timestamp = (curDate.getFullYear() + "-" + (curDate.getMonth() + 1) + "-" + curDate.getDay() + "T" + curDate.getUTCHours() + ":" + curDate.getUTCMinutes() + ":" + curDate.getUTCSeconds() + "z");
            if (elts.length > 0) {
                tu = elts[0];
            }
            if (tu) {
                var i = 0,
                    found = false,
                    refstrings = tu.get('refstring');
                // delete or decrement the target value
                while (found === false && i < refstrings.length) {
                    if (refstrings[i].target === targetValue) {
                        found = true;
                        // decrement the refcount until it is -1
                        // (-1 means "this refstring has been removed")
                        if (parseInt(refstrings[i].n, 10) >= 0) {
                            refstrings[i].n--;
                        }
                    }
                    i++;
                }
                if (found === false) {
                    console.log("unable to find target:" + targetValue);
                }
                // there's still something in the target unit -- update the object in the KB
                console.log("Updating TU for sourceValue: " + sourceValue);
                tu.set('refstring', refstrings, {silent: true});
                tu.set('timestamp', timestamp, {silent: true});
                tu.update();
            } else {
                // ERROR - shouldn't happen (no KB entry at all)
                console.log("ERROR: unable to find KB entry to remove.");
            }
        },
        
        // Helper method to add overrides to the CSS stylesheet
        addStyleRules = function (project) {
            var sheet = window.document.styleSheets[window.document.styleSheets.length - 1]; // current stylesheet
            var theRule = "";
            var totalHeight = 0;
            var scrollTop = 0;
            console.log("addStyleRules");
            // Source font
            theRule = ".source {";
            theRule += "font: " + parseInt(project.get('SourceFontSize'), 10) + "px \"" + project.get('SourceFont') + "\", \"Source Sans\", helvetica, arial, sans-serif; ";
            theRule += "color: " + project.get('SourceColor') + ";";
            theRule += "}";
            sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
            // Target font
            theRule = ".target {";
            theRule += "font: " + parseInt(project.get('TargetFontSize'), 10) + "px " + project.get('TargetFont') + "," + "\"Source Sans\", helvetica, arial, sans-serif; ";
            theRule += "color: " + project.get('TargetColor') + ";";
            theRule += "}";
            sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
            // Navigation font
            theRule = ".marker {";
            theRule += "font: " + parseInt(project.get('NavigationFontSize'), 10) + "px " + project.get('NavigationFont') + "," + "\"Source Sans\", helvetica, arial, sans-serif; ";
            theRule += "color: " + project.get('NavigationColor') + ";";
            theRule += "}";
            sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
            // block-height (standard height for all strip elements - pile, chapter/verse, etc.)
            theRule = ".block-height {";
            theRule += "height: ";
            // total height = source + target + marker + (20px extra space)
            // this formula also accounts for the larger line height of the Scheherazade font
            // (see https://software.sil.org/scheherazade/support/faq/)
            totalHeight =
                Math.floor(parseInt(project.get('NavigationFontSize'), 10) * ((project.get('NavigationFont') === "Scheherazade") ? 1.1 : 1.0)) + Math.floor(parseInt(project.get('SourceFontSize'), 10) * ((project.get('SourceFont') === "Scheherazade") ? 1.1 : 1.0) * 1.2) + Math.floor(parseInt(project.get('TargetFontSize'), 10) * ((project.get('TargetFont') === "Scheherazade") ? 1.1 : 1.0) * 1.2) + 26;
            theRule += totalHeight + "px; ";
            theRule += "line-height: " + totalHeight + "px; ";
            theRule += "}";
            sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
            console.log("Calculated pile height: " + totalHeight);
            // condensed-pile (w/o the marker line)
            theRule = ".condensed-pile {";
            theRule += "height: ";
            // total height = source + target + (20px extra space)
            totalHeight = ((parseInt(project.get('SourceFontSize'), 10) + parseInt(project.get('TargetFontSize'), 10)) * 1.2) + 20;
            theRule += totalHeight + "px; ";
            theRule += "}";
            sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
            // Special Text color
            theRule = "div.strip.specialtext div.source {";
            theRule += "color: " + project.get('SpecialTextColor') + ";";
            theRule += "}";
            sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
            // Retranslation color
            theRule = ".retranslation {";
            theRule += "color: " + project.get('RetranslationColor') + ";";
            theRule += "}";
            sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
            // Text Differences color
            theRule = ".differences {";
            theRule += "color: " + project.get('TextDifferencesColor') + ";";
            theRule += "}";
            sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
            // Text direction
            // Default layout is LTR in our CSS file;
            // if the source language is RTL, switch the layout of the chapter element and flow of text
            if (project.get('SourceDir') === 'rtl') {
                theRule = "#chapter { direction: rtl; }";
                sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
                theRule = ".pile, .strip-header, .filter {";
                theRule += "float: right;";
                theRule += "}";
                sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
                theRule = ".source { direction: rtl; }";
                sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
            }
            // override individual text directions
            if (project.get('TargetDir') === 'rtl') {
                theRule = ".target { direction: rtl; }";
                sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
            }
            // override individual text directions
            if (project.get('NavDir') === 'rtl') {
                theRule = ".marker { direction: rtl; }";
                sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
            }
            // User option to *not* clear USFM markers - should be 121 of them + ".sh" (our chapter and verse # class)
            if (localStorage.getItem("WrapUSFM") && localStorage.getItem("WrapUSFM") === "false") {
                console.log("WrapUSFM -> FALSE");
                theRule = ".usfm-div, .usfm-bn, .usfm-ms, .usfm-ma1, .usfm-ms2, .usfm-ms3, .usfm-p, .usfm-mt, .usfm-mt1, .usfm-mt2, .usfm-mt3, .usfm-mte, .usfm-mte1, .usfm-mte2, .usfm-st, .usfm-s, .usfm-s1, .usfm-s2, .usfm-s3, .usfm-s4, .sh { clear: none; }";
                sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
                theRule = ".usfm-sr, .usfm-sx, .usfm-sz, .usfm-sp, .usfm-d, .usfm-di, .usfm-pi, .usfm-pi1, .usfm-pi2, .usfm-pi3, .usfm-pgi, .usfm-ph, .usfm-ph1, .usfm-ph2, .usfm-ph3, .usfm-phi, .usfm-pmo, .usfm-m, .usfm-mi, .usfm-pc { clear: none; }";
                sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
                theRule = ".usfm-pr, .usfm-pt, .usfm-ps, .usfm-psi, .usfm-pp, .usfm-pq, .usfm-pm, .usfm-pmc, .usfm-pmr, .usfm-nb, .usfm-q, .usfm-q1, .usfm-q2, .usfm-q3, .usfm-q4, .usfm-qc, .usfm-qr, .usfm-qa, .usfm-qm, .usfm-qm1 { clear: none; }";
                sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
                theRule = ".usfm-qm2, .usfm-qm3, .usfm-imt, .usfm-imt1, .usfm-imt2, .usfm-imt3, .usfm-imt4, .usfm-imte, .usfm-imte1, .usfm-imte2, .usfm-is, .usfm-is1, .usfm-is2, .usfm-ip, .usfm-ipi, .usfm-ipq, .usfm-ipr, .usfm-iq, .usfm-iq1, .usfm-iq2 { clear: none; }";
                sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
                theRule = ".usfm-iq3, .usfm-im, .usfm-imi, .usfm-ili, .usfm-ili1, .usfm-ili2, .usfm-imq, .usfm-ib, .usfm-iot, .usfm-io, .usfm-io1, .usfm-io2, .usfm-io3, .usfm-io4, .usfm-iex, .usfm-li, .usfm-li1, .usfm-li2, .usfm-li3, .usfm-li4 { clear: none; }";
                sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
                theRule = ".usfm-qh, .usfm-tr, .usfm-tr1, .usfm-tr2, .usfm-gm, .usfm-gs, .usfm-gd, .usfm-gp, .usfm-tis, .usfm-tpi, .usfm-tir, .usfm-tps, .usfm-p1, .usfm-p2, .usfm-k1, .usfm-k2, .usfm-pb, .usfm-px, .usfm-pz, .usfm-qx, .usfm-qz { clear: none; }";
                sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
            } else {
                console.log("WrapUSFM -> TRUE");
                theRule = ".usfm-div, .usfm-bn, .usfm-ms, .usfm-ma1, .usfm-ms2, .usfm-ms3, .usfm-p, .usfm-mt, .usfm-mt1, .usfm-mt2, .usfm-mt3, .usfm-mte, .usfm-mte1, .usfm-mte2, .usfm-st, .usfm-s, .usfm-s1, .usfm-s2, .usfm-s3, .usfm-s4, .sh { clear: both; }";
                sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
                theRule = ".usfm-sr, .usfm-sx, .usfm-sz, .usfm-sp, .usfm-d, .usfm-di, .usfm-pi, .usfm-pi1, .usfm-pi2, .usfm-pi3, .usfm-pgi, .usfm-ph, .usfm-ph1, .usfm-ph2, .usfm-ph3, .usfm-phi, .usfm-pmo, .usfm-m, .usfm-mi, .usfm-pc { clear: both; }";
                sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
                theRule = ".usfm-pr, .usfm-pt, .usfm-ps, .usfm-psi, .usfm-pp, .usfm-pq, .usfm-pm, .usfm-pmc, .usfm-pmr, .usfm-nb, .usfm-q, .usfm-q1, .usfm-q2, .usfm-q3, .usfm-q4, .usfm-qc, .usfm-qr, .usfm-qa, .usfm-qm, .usfm-qm1 { clear: both; }";
                sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
                theRule = ".usfm-qm2, .usfm-qm3, .usfm-imt, .usfm-imt1, .usfm-imt2, .usfm-imt3, .usfm-imt4, .usfm-imte, .usfm-imte1, .usfm-imte2, .usfm-is, .usfm-is1, .usfm-is2, .usfm-ip, .usfm-ipi, .usfm-ipq, .usfm-ipr, .usfm-iq, .usfm-iq1, .usfm-iq2 { clear: both; }";
                sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
                theRule = ".usfm-iq3, .usfm-im, .usfm-imi, .usfm-ili, .usfm-ili1, .usfm-ili2, .usfm-imq, .usfm-ib, .usfm-iot, .usfm-io, .usfm-io1, .usfm-io2, .usfm-io3, .usfm-io4, .usfm-iex, .usfm-li, .usfm-li1, .usfm-li2, .usfm-li3, .usfm-li4 { clear: both; }";
                sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
                theRule = ".usfm-qh, .usfm-tr, .usfm-tr1, .usfm-tr2, .usfm-gm, .usfm-gs, .usfm-gd, .usfm-gp, .usfm-tis, .usfm-tpi, .usfm-tir, .usfm-tps, .usfm-p1, .usfm-p2, .usfm-k1, .usfm-k2, .usfm-pb, .usfm-px, .usfm-pz, .usfm-qx, .usfm-qz { clear: both; }";
                sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
            }
        },

        // SourcePhraseView
        // Displays a single SourcePhrase. There's nothing important in this code; the logic
        // is in the collection class (SourcePhraseListView) below.
        SourcePhraseView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplSourcePhrase)
        }),

        // SourcePhraseListView
        // Displays the collection of SourcePhrases for the current chapter. Also contains the logic for
        // adapting, KB updates, etc.
        SourcePhraseListView = Marionette.CollectionView.extend({
            chapterid: 0,
            chapterName: "",

            template: Handlebars.compile(tplSourcePhraseList),

            initialize: function () {
                // place two calls to render:
                // - one deferred, when we get all the source phrases for the chapter back from the DB 
                // - one right now to say "please wait..."
                this.collection.fetch({reset: true, data: {chapterid: this.options.chapterid}}).done(this.render);
                this.render();
            },
            addOne: function (SourcePhrase) {
//                console.log("SourcePhraseListView::addOne");
                var view = new SourcePhraseView({ model: SourcePhrase});//, el: $('#pile-' + SourcePhrase.get('id')) });
                this.$('#pile-' + SourcePhrase.get('spid')).append(view.render().el.childNodes);
                this.$('#pile-' + SourcePhrase.get('spid')).find('.target').attr('tabindex', idx++);
            },
            render: function () {
                var top = 0;
                if (this.collection.length === 0) {
                    // nothing to display yet -- show the "please wait" view
                    template = Handlebars.compile(tplLoadingPleaseWait);
                    this.$el.html(template());
                    $("#OK").hide();
                } else {
                    // we have info to display -- do it now
                    // add the collection
    //                console.log("SourcePhraseListView::render");
                    template = Handlebars.compile(tplSourcePhraseList);
                    this.$el.html(template(this.collection.toJSON()));
                    this.$el.hammer({domEvents: true, interval: 500});
                    // go back and add the individual piles
                    this.collection.each(this.addOne, this);
                    // Do we have a placeholder from a previous adaptation session?
                    if (project && project.get('lastAdaptedSPID').length > 0) {
                        // yes -- select it
                        isSelecting = true;
                        if ($('#' + project.get('lastAdaptedSPID')).length !== 0) {
                            // everything's okay -- select the last adapted SPID
                            selectedStart = $('#' + project.get('lastAdaptedSPID')).get(0);
                            selectedEnd = selectedStart;
                            idxStart = $(selectedStart).index() - 1;
                            idxEnd = idxStart;
                            // scroll to it if necessary (which it probably is)
                            top = $(selectedStart)[0].offsetTop - (($(window).height() - $(selectedStart).outerHeight(true)) / 2);
                            console.log("scrollTop: " + top);
                            $("#content").scrollTop(top);
                            lastOffset = top;
                            // now select it
                            $(selectedStart).mouseup();
                        } else {
                            // for some reason the last adapted SPID has gotten out of sync --
                            // select the first block instead
                            selectedStart = $(".pile").first().get(0);
                            selectedEnd = selectedStart;
                            idxStart = $(selectedStart).index() - 1;
                            idxEnd = idxStart;
                            if (selectedStart !== null) {
//                                $(selectedStart).find('.source').mouseup();
                                $(selectedStart).mouseup();
                            }
                        }
                    } else {
                        // no last adapted SPID defined -- select the first block
                        isSelecting = true;
                        selectedStart = $(".pile").first().get(0);
                        selectedEnd = selectedStart;
                        idxStart = $(selectedStart).index() - 1; // BUGBUG why off by one?
                        idxEnd = idxStart;
                        if (selectedStart !== null) {
                            $(selectedStart).mouseup();
                        }
                    }
                }
                return this;
            },

            ////
            // Helper methods
            ////

            // Helper to get a string with the current date/time in the form:
            //     "2013-09-18T18:50:35z"
            // This method is used for KB updates
            getTimestamp: function () {
                var curDate = new Date();
                return curDate.getFullYear() + "-" + (curDate.getMonth() + 1) + "-" + curDate.getDay() + "T" + curDate.getUTCHours() + ":" + curDate.getUTCMinutes() + ":" + curDate.getUTCSeconds() + "z";
            },
            // Helper method to strip any starting / ending punctuation from the target field.
            // This method is called from:
            // - selectedAdaptation before the target text available for editing
            // - unselectedAdaptation before the target text is stored in the KB
            stripPunctuation: function (target) {
                var result = target,
                    startIdx = 0,
                    endIdx = target.length;
                // check for empty string
                if (endIdx === 0) {
                    return result;
                }
                // starting index
                while (startIdx < (target.length - 1) && punctsTarget.indexOf(target.charAt(startIdx)) > -1) {
                    startIdx++;
                }
                // ending index
                while (endIdx > 0 && punctsTarget.indexOf(target.charAt(endIdx - 1)) > -1) {
                    endIdx--;
                }
                // sanity check for all punctuation
                if (endIdx <= startIdx) {
                    return "";
                }
                result = target.substr(startIdx, (endIdx) - startIdx);
                return result;
            },
            // Helper method to copy any punctuation from the source to the target field. This method is
            // called from unselectedAdaptation (when the focus blurs in the target field).
            copyPunctuation: function (model, target) {
                var i = 0,
                    result = "",
                    prepuncts = model.get('prepuncts'),
                    follpuncts = model.get('follpuncts');
                // If we aren't copying punctuation for this project, just return the target (unaltered)
                if (project.get('CopyPunctuation') === 'false') {
                    return target;
                }
                // add any prepuncts
                for (i = 0; i < prepuncts.length; i++) {
                    // if this character is in the mapping, add the corresponding character
                    if (punctsSource.indexOf(prepuncts.substr(i, 1)) > -1) {
                        result += punctsTarget[punctsSource.indexOf(prepuncts.substr(i, 1))];
                    } else {
                        // not there -- just add the character itself
                        result += prepuncts[i];
                    }
                }
                // add the target
                result += target;
                // add any following puncts
                for (i = 0; i < follpuncts.length; i++) {
                    // if this character is in the mapping, add the corresponding character
                    if (punctsSource.indexOf(follpuncts.substr(i, 1)) > -1) {
                        result += punctsTarget[punctsSource.indexOf(follpuncts.substr(i, 1))];
                    } else {
                        // not there -- just add the character itself
                        result += follpuncts[i];
                    }
                }
                if (result === "") {
                    return target;
                } else {
                    return result;
                }
            },
            // Helper method to automatically set the target text to initial uppercase if
            // the source is also uppercase. This method relies on the case mappings defined for the project.
            autoAddCaps: function (model, target) {
                var i = 0,
                    result = "",
                    source = model.get('source');
                // If we aren't capitalizing for this project, just return the target (unaltered)
                if (project.get('AutoCapitalization') === 'false' || project.get('SourceHasUpperCase') === 'false') {
                    return target;
                }
                // is the first letter capitalized?
                for (i = 0; i < caseSource.length; i++) {
                    if (caseSource[i].charAt(1) === source.charAt(0)) {
                        // uppercase -- convert the first target character to uppercase and return the result
                        result = caseTarget[i].charAt(1) + target.substr(1);
                        return result;
                    }
                }
                // If we got here, the source didn't have any uppercase -- just return the target unaltered
                return target;
            },
            // Helper method to convert theString to lower case using either the source or target case equivalencies.
            autoRemoveCaps: function (theString, isSource) {
                var i = 0,
                    result = "";
                // If we aren't capitalizing for this project, just return theString
                if (project.get('AutoCapitalization') === 'false') {
                    return theString;
                }
                // is the first letter capitalized?
                if (isSource === true) {
                    // use source case equivalencies
                    for (i = 0; i < caseSource.length; i++) {
                        if (caseSource[i].charAt(1) === theString.charAt(0)) {
                            // uppercase -- convert the first character to lowercase and return the result
                            result = caseSource[i].charAt(0) + theString.substr(1);
                            return result;
                        }
                    }
                } else {
                    // use target case equivalencies
                    for (i = 0; i < caseTarget.length; i++) {
                        if (caseTarget[i].charAt(1) === theString.charAt(0)) {
                            // uppercase -- convert the first character to lowercase and return the result
                            result = caseTarget[i].charAt(0) + theString.substr(1);
                            return result;
                        }
                    }
                }
                // If we got here, the string wasn't uppercase -- just return the same string
                return theString;
            },
            // Helper method to retrieve the targetunit whose source matches the specified key in the KB.
            // This method currently strips out all punctuation to match the words; a null is returned
            // if there is no entry in the KB
            findInKB: function (key) {
                var result = null,
                    strNoPunctuation = key.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, "");
                try {
                    result = kblist.findWhere({'source': key}); // strNoPunctuation});
                    if (typeof result === 'undefined') {
                        return null;
                    }
                } catch (err) {
                    console.log(err);
                }
                return result;
            },
            // Helper method to move the editing cursor forwards or backwards one pile until we hit another empty
            // slot that requires attention. This is our S8 / auto-insertion procedure. Possible outcomes:
            // - next source phrase has exactly 1 possible translation in the KB -> auto-insert and continue moving
            // - next source phrase is already translataed (i.e., has something in the target field) -> skip and continue
            //   moving
            // - next source phrase has no possible translation -> suggest the source and stop here
            // - next source phrase has more than one possible translation -> show a drop-down menu (that also allows
            //   for a new translation) and stop here
            moveCursor: function (event, moveForward) {
                var next_edit = null;
                var temp_cursor = null;
                var keep_going = true;
                var top = 0;
                var selection = null;
                console.log("moveCursor");
                event.stopPropagation();
                event.preventDefault();
                // unselect the current edit field before moving
                $(event.currentTarget).blur();
                if (moveForward === false) {
                    // move backwards
                    if (selectedStart.previousElementSibling !== null) {
                        next_edit = selectedStart.previousElementSibling;
                    } else {
                        // No previous sibling -- see if you can go to the previous strip
                        if (selectedStart.parentElement.previousElementSibling !== null) {
                            temp_cursor = selectedStart.parentElement.previousElementSibling;
                            // handle filtered strips and strip header elements
                            if (($(temp_cursor).hasClass("filter")) || ($(temp_cursor).attr('id').indexOf("-sh") > -1)) {
                                // continue on to the previous strip that ISN'T a strip header or filtered out of the UI
                                while (temp_cursor && keep_going === true) {
                                    temp_cursor = temp_cursor.previousElementSibling; // backwards one more strip
                                    console.log("movecursor: looking at strip: " + $(temp_cursor).attr('id'));
                                    if (temp_cursor && ($(temp_cursor).hasClass("filter") === false) && ($(temp_cursor).attr('id').indexOf("-sh") === -1)) {
                                        // found a stopping point
                                        console.log("found stopping point: " + $(temp_cursor).attr('id'));
                                        keep_going = false;
                                    }
                                }
                            }
                            if (temp_cursor) {
                                next_edit = $(temp_cursor).children(".pile").last()[0];
                            } else {
                                next_edit = null;
                                console.log("reached first pile.");
                            }
                        } else {
                            next_edit = null;
                            console.log("reached first pile.");
                        }
                    }
                } else {
                    // move forwards
                    if (selectedStart.nextElementSibling !== null) {
                        next_edit = selectedStart.nextElementSibling;
                    } else {
                        // no next sibling in this strip -- see if you can go to the next strip
                        if (selectedStart.parentElement.nextElementSibling !== null) {
                            temp_cursor = selectedStart.parentElement.nextElementSibling;
                            // handle filtered strips and strip header elements
                            if (($(temp_cursor).hasClass("filter")) || ($(temp_cursor).attr('id').indexOf("-sh") > -1)) {
                                // continue on to the next strip that ISN'T a strip header or filtered out of the UI
                                while (temp_cursor && keep_going === true) {
                                    temp_cursor = temp_cursor.nextElementSibling; // forward one more strip
                                    console.log("movecursor: looking at strip: " + $(temp_cursor).attr('id'));
                                    if (temp_cursor && ($(temp_cursor).hasClass("filter") === false) && ($(temp_cursor).attr('id').indexOf("-sh") === -1)) {
                                        // found a stopping point
                                        console.log("found stopping point: " + $(temp_cursor).attr('id'));
                                        keep_going = false;
                                    }
                                }
                            }
                            if (temp_cursor) {
                                next_edit = $(temp_cursor).children(".pile").first()[0];
                            } else {
                                next_edit = null;
                                console.log("reached last pile.");
                            }
                        } else {
                            // no more piles
                            next_edit = null;
                            console.log("reached last pile.");
                        }
                        // if we reached the last pile, check to see if there's another chapter to adapt
                        if (next_edit === null) {
                            // Check for a chapter after the current one in the current book
                            var nextChapter = 0;
                            var book = window.Application.BookList.where({bookid: chapter.get('bookid')});
                            var chaps = book[0].get('chapters');
                            if (chaps.length > 1) {
                                if ((chaps.indexOf(chapter.get('chapterid')) !== -1) &&
                                        (chaps.indexOf(chapter.get('chapterid')) < (chaps.length - 1))) {
                                    // There is a chapter after this one
                                    nextChapter = chaps[chaps.indexOf(chapter.get('chapterid')) + 1];
                                }
                            }

                            // If there is a next chapter, let the user continue or exit;
                            // if there isn't one, just allow them to exit
                            if (navigator.notification) {
                                // on mobile device
                                navigator.notification.beep(1);
                                if (nextChapter > 0) {
                                    navigator.notification.confirm(
                                        i18next.t('view.dscAdaptContinue', {chapter: chapter.get('name')}),
                                        function (buttonIndex) {
                                            if (buttonIndex === 1) {
                                                // Next chapter
                                                // update the URL, but replace the history (so we go back to the welcome screen)
                                                window.Application.router.navigate("adapt/" + nextChapter, {trigger: true, replace: true});
//                                                window.Application.adaptChapter(nextChapter);

                                            } else {
                                                // exit
                                                // save the model
                                                chapter.trigger('change');
                                                // head back to the home page
                                                window.Application.home();
                                            }
                                        },
                                        i18next.t('ttlMain'),
                                        [i18next.t('view.lblNext'), i18next.t('view.lblFinish')]
                                    );
                                } else {
                                    // no option to continue, just one to exit
                                    navigator.notification.alert(
                                        i18next.t('view.dscAdaptComplete', {chapter: chapter.get('name')}),
                                        function () {
                                            // exit
                                            // save the model
                                            chapter.trigger('change');
                                            // head back to the home page
                                            window.Application.home();
                                        }
                                    );
                                }
                            } else {
                                // in browser
                                if (nextChapter > 0) {
                                    if (confirm(i18next.t('view.dscAdaptContinue', {chapter: chapter.get('name')}))) {
                                        // update the URL, but replace the history (so we go back to the welcome screen)
                                        window.Application.router.navigate("adapt/" + nextChapter, {trigger: true, replace: true});
//                                        window.Application.adaptChapter(nextChapter);
                                    } else {
                                        window.Application.home();
                                    }
                                } else {
                                    alert(i18next.t('view.dscAdaptComplete', {chapter: chapter.get('name')}));
                                    window.Application.home();
                                }
                            }

                        }
                    }
                }
                if (next_edit) {
                    // simulate a click on the next edit field
                    console.log("next edit: " + next_edit.id);
                    $(next_edit).find(".target").focus();
                    $(next_edit).find(".target").mouseup();
                } else {
                    // the user is either at the first or last pile. Select it,
                    // but don't set focus on the target edit field.
                    if (MovingDir === -1) {
                        // select the FIRST pile
                        selectedStart = $(".pile").first().get(0);
                        selectedEnd = selectedStart;
                        idxStart = $(selectedStart).index() - 1;
                        idxEnd = idxStart;
                        isSelecting = true;
                        MovingDir = 0; // don't move
                        // scroll to it if necessary (which it probably is)
                        top = $(selectedStart)[0].offsetTop - (($(window).height() - $(selectedStart).outerHeight(true)) / 2);
                        console.log("scrollTop: " + top);
                        $("#content").scrollTop(top);
                        lastOffset = top;
                        // now select it
                        $(selectedStart).mouseup();
                    } else {
                        // select the LAST pile
                        selectedStart = $(".pile").last().get(0);
                        selectedEnd = selectedStart;
                        idxStart = $(selectedStart).index() - 1;
                        idxEnd = idxStart;
                        isSelecting = true;
                        MovingDir = 0; // don't move
                        // scroll to it if necessary (which it probably is)
                        top = $(selectedStart)[0].offsetTop - (($(window).height() - $(selectedStart).outerHeight(true)) / 2);
                        console.log("scrollTop: " + top);
                        $("#content").scrollTop(top);
                        lastOffset = top;
                        // now select it
                        $(selectedStart).mouseup();
                    }
                    // no next edit (reached the first or last pile) --
                }
            },
            // Helper method to clear out the selection and disable the toolbar buttons 
            // (Move to S1 in our state machine)
            clearSelection: function () {
                selectedStart = selectedEnd = null;
                idxStart = idxEnd = null;
                isSelecting = false;
                isPlaceholder = false;
                isPhrase = false;
                isRetranslation = false;

                $("div").removeClass("ui-selecting ui-selected");
                $("#Placeholder").prop('disabled', true);
                $("#Retranslation").prop('disabled', true);
                $("#Phrase").prop('disabled', true);
                $("#mnuPlaceholder").prop('disabled', true);
                $("#mnuRetranslation").prop('disabled', true);
                $("#mnuPhrase").prop('disabled', true);
            },

            ////
            // Event Handlers
            ////
            events: {
                "mousedown .pile": "selectingPilesStart",
                "touchstart .pile": "selectingPilesStart",
                "mousemove .pile": "selectingPilesMove",
                "touchmove .pile": "selectingPilesMove",
                "mouseup .pile": "selectingPilesEnd",
                "touchend .pile": "selectingPilesEnd",
                "doubletap .pile": "onDblTapPile",
                "mouseup .filter": "showFilter",
                "touchend .filter": "showFilter",
                "click .filter": "showFilter",
                "mousedown .target": "selectingAdaptation",
                "touchstart .target": "selectingAdaptation",
                "mouseup .target": "selectedAdaptation",
                "touchend .target": "selectedAdaptation",
                "keydown .target": "editAdaptation",
//                "input .target": "checkForAutoMerge",
                "blur .target": "unselectedAdaptation"
            },
            
            // user is starting to select one or more piles
            selectingPilesStart: function (event) {
                console.log("selectingPilesStart: " + $(event.target).attr('id'));
                // long press function for selection start
                longPressTimeout = window.setTimeout(function () {
                    // alert the user that the long-press has been activated
                    if (navigator.notification) {
                        navigator.notification.beep(1);
                    }
                    $(event.currentTarget).addClass("ui-longSelecting");
                    isLongPressSelection = true;
                    if (LongPressSectionStart === null) {
                        // start event
                        LongPressSectionStart = event.currentTarget;
                    } else if (LongPressSectionStart === event.currentTarget) {
                        // user long-pressed in the same location -- consider this a toggle
                        // (i.e., clear out the long press value)
                        LongPressSectionStart = null;
                        isLongPressSelection = false;
                        $("div").removeClass("ui-longSelecting");
                    }
                }, 1000);
                if (isSelectingKB === true) {
                    var theSelection = "";
                    // pull out the tt-suggestion (the menu item the user selected)
                    if ($(event.target.parentElement).hasClass("tt-suggestion")) {
                        theSelection = $(event.target.parentElement).text();
                    } else {
                        theSelection = $(event.target).text();
                    }
                    console.log("User selected KB value:" + theSelection);
                    isSelectingKB = false; // we've now chosen something - OK to blur
                    isDirty = true;
                    $('.tt-menu').css('display', 'none');
                    $(event.currentTarget).find(".target").typeahead('destroy');
                    $(event.currentTarget).find(".target").html(theSelection);
                    $("#Undo").prop('disabled', false);
                }
                event.stopPropagation();
                event.preventDefault();
                // if there was an old selection, remove it
                if (selectedStart !== null) {
                    console.log("old selection -- need to blur");
                    $("div").removeClass("ui-selecting ui-selected");
                    $(selectedStart).find(".target").blur(); // also triggers a save on the old target field
                }
                // if there was an old target in focus, blur it
                selectedStart = event.currentTarget; // select the pile
                selectedEnd = selectedStart;

                idxStart = $(selectedStart).index();
                idxEnd = idxStart;
                //console.log("selectedStart: " + selectedStart.id);
                //console.log("selectedEnd: " + selectedEnd.id);
                isSelecting = true;
                // retranslations can't mix with other selections --
                // check to see if we've selected one
                if ((selectedStart.id).indexOf("ret") !== -1) {
                    isRetranslation = true;
                } else {
                    isRetranslation = false;
                }
                // change the class of the mousedown area to let the user know
                // we're tracking the selection
                $(event.currentTarget).addClass("ui-selecting");
            },
            // user is starting to select one or more piles
            selectingPilesMove: function (event) {
                if (isRetranslation === true) {
                    return; // cannot select other items
                }
                event.stopPropagation();
                event.preventDefault();
                var tmpEnd = null;
                if (event.type === "touchmove") {
                    // touch
//                    console.log("touches:" + event.touches + ", targetTouches: " + event.targetTouches + ", changedTouches: " + event.changedTouches);
                    // is this multi-touch or a single touch?
//                    if (event.targetTouches && event.targetTouches.length === 2) {
//                        // multi-touch
//
//                        // figure out what's going to be the start and end (selectedStart / selectedEnd)
//                        for (var i = 0; i < 2; i++) {
//                            // sanity check -- only respond to items inside the current pile
//                            if (event.touches[i].parentElement === selectedStart.parentElement) {
//                                // inside the pile -- add
//                            }
//                        }
//                        // don't process the rest -- just return
//                        return;
//                    }
                    // assume single touch if we got here
                    var touch = event.originalEvent.changedTouches[0]; // interested in current position, not original touch target
                    tmpEnd = document.elementFromPoint(touch.pageX, touch.pageY); // pile (parent)
                    event.preventDefault();
                } else {
                    // mouse (web app)
                    tmpEnd = event.currentTarget; // pile
                }
                // only interested if we're selecting in the same strip
                if ((isSelecting === true) &&
                        (tmpEnd.parentElement === selectedStart.parentElement)) {
                    // recalculate the new selectedEnd
                    selectedEnd = tmpEnd;
                    idxEnd = $(tmpEnd).index();
                    //console.log("selectedEnd: " + selectedEnd.id);
                    // remove ui-selecting from all piles in the strip
                    $(event.currentTarget.parentElement.childNodes).removeClass("ui-selecting");
                    // add ui-selecting to the currently selected range
                    if (idxStart === idxEnd) {
                        // one item selected
                        $(event.currentTarget).addClass("ui-selecting");
                    } else if (idxStart < idxEnd) {
                        $(selectedStart.parentElement).children(".pile").each(function (index, value) {
                            if (index >= idxStart && index <= idxEnd) {
                                $(value).addClass("ui-selecting");
                            }
                        });
                    } else {
                        $(selectedStart.parentElement).children(".pile").each(function (index, value) {
                            if (index >= idxEnd && index <= idxStart) {
                                $(value).addClass("ui-selecting");
                            }
                        });
                    }
                }
            },
            // user double-tapped on the Pile element -- select the entire strip
            onDblTapPile: function (event) {
                console.log("onDblTapPile");
                selectedStart = $(event.currentTarget.parentElement).children(".pile")[0]; // first pile
                selectedEnd = $(event.currentTarget.parentElement).children(".pile").last()[0]; // last pile
                idxStart = $(selectedStart).index();
                idxEnd = $(selectedEnd).index();
                isSelecting = true; // change the UI color 
                // trigger an end on the last pile elt
                if (navigator.notification) {
                    // on mobile device
                    $(selectedEnd).trigger("touchend");
                } else {
                    // in browser
                    $(selectedEnd).trigger("mouseup");
                }
            },
            // user released the mouse here (or the focus was set here -- see iOS comment below)
            selectingPilesEnd: function (event) {
                console.log("selectingPilesEnd");
                clearTimeout(longPressTimeout); // don't need to wait for the long press here
                // re-add the contenteditable fields
                console.log("touches:" + event.touches + ", targetTouches: " + event.targetTouches + ", changedTouches: " + event.changedTouches);
                var tmpItem = null,
                    tmpIdx = 0,
                    now = 0,
                    delay = 0,
                    strStartID = "",
                    strEndID = "",
                    spid = "";
                // prevent weird edit menu appearances (long click)
                event.preventDefault();
                event.stopPropagation();
                // sanity check -- make sure there's a selectedStart
                if (selectedStart === null) {
                    selectedStart = event.currentTarget;
                }
                
                // If this was a click on a filter element, make sure that gets a direct event
                if ($(event.currentTarget.parentElement).hasClass('filter')) {
                    if (navigator.notification && device.platform === "iOS") {
                        $(event.currentTarget.parentElement).trigger("touchend");
                    } else {
                        $(event.currentTarget.parentElement).trigger("click");
                    }
                }
                // check for retranslation
                if (isRetranslation === true) {
                    // for retranslations, we only want the first item selected (no multiple selections)
                    idxEnd = idxStart;
                    selectedEnd = selectedStart;
                }
                // check for double-tap (browser only)
                if (!navigator.notification && event.type === "mouseup") {
                    if (lastTapTime === null) {
                        lastTapTime = new Date().getTime();
                        console.log("setting lastTapTime");
                    } else {
                        now = new Date().getTime();
                        delay = now - lastTapTime;
                        console.log("delay: " + delay);
                        if ((delay < 500) && (delay > 0)) {
                            // double-tap -- select the strip
                            console.log("double-tap detected -- selecting strip");
                            selectedStart = $(event.currentTarget.parentElement).children(".pile")[0]; // first pile
                            selectedEnd = $(event.currentTarget.parentElement).children(".pile").last()[0]; // last pile
                            idxStart = $(selectedStart).index();
                            idxEnd = $(selectedEnd).index();
                            isSelecting = true; // change the UI color
                        }
                        lastTapTime = now; // update the last tap time
                    }
                } else if (navigator.notification) {
                    // mobile phone
                    if (lastTapTime === null) {
                        lastTapTime = new Date().getTime();
                        console.log("setting lastTapTime");
                    } 
                }
                // check for long press selection
                if (isLongPressSelection === true && LongPressSectionStart !== selectedStart) {
                    // This is the click _after_ the long press event, which indicates the selection end
                    // Sanity check that this click is in the same strip
                    if (selectedStart.parentElement !== LongPressSectionStart.parentElement) {
                        // not the same parent (i.e., not in the same strip) -- select as much as we can
                        // NOTE: selectedStart actually holds the ENDING click value, hence our logic here
                        strStartID = $(LongPressSectionStart).attr('id');
                        strStartID = strStartID.substr(strStartID.indexOf("-") + 1); // remove "pile-"
                        strEndID = $(selectedStart).attr('id');
                        strEndID = strEndID.substr(strEndID.indexOf("-") + 1); // remove "pile-"
                        if (parseInt(strStartID, 10) < parseInt(strEndID, 10)) {
                            // last click was AFTER the first long press -- select to the end of the strip
                            selectedStart = $(LongPressSectionStart.parentElement).children(".pile").last()[0]; // last pile
                        } else {
                            // last click was BEFORE the first long press -- select to the beginning of the strip
                            selectedStart = $(LongPressSectionStart.parentElement).children(".pile")[0]; // first pile
                        }
                    }
                    // set the selection
                    selectedEnd = selectedStart; // ending click
                    selectedStart = LongPressSectionStart; // starting long press
                    idxStart = $(selectedStart).index();
                    idxEnd = $(selectedEnd).index();
                    isSelecting = true; // change the UI color
                    // done with long press selection -- clear out values and styling
                    LongPressSectionStart = null; // clear out the long press value
                    isLongPressSelection = false;
                    $("div").removeClass("ui-longSelecting");
                }
                
                // case where user started with a long press, then dragged the rest of the way
                if (selectedEnd !== selectedStart && isLongPressSelection === true) {
                    // done with long press selection -- clear out values and styling
                    LongPressSectionStart = null; // clear out the long press value
                    isLongPressSelection = false;
                    $("div").removeClass("ui-longSelecting");
                }
                
                if (isSelecting === true) {
                    console.log("selectingPilesEnd: ending selection / updating UI");
                    isSelecting = false;
                    // change the class of the mousedown area to let the user know
                    // we've finished tracking the selection
                    $("div").removeClass("ui-selecting ui-selected");
                    if (idxStart === idxEnd) {
                        // only one item selected -- can only _create_ a placeholder
                        // (user can also _delete_ a phrase / retranslation; we'll re-enable
                        // the button below if they've selected an existing retranslation or phrase
                        $("#Phrase").prop('disabled', true);
                        $("#Retranslation").prop('disabled', true);
                        $("#mnuRetranslation").prop('disabled', true);
                        $("#mnuPhrase").prop('disabled', true);
                        // set the class to ui-selected
                        $(selectedStart).addClass("ui-selected");
                    } else if (idxStart < idxEnd) {
                        // more than one item selected -- can create a placeholder, phrase, retrans
                        $("#Phrase").prop('disabled', false);
                        $("#Retranslation").prop('disabled', false);
                        $("#mnuRetranslation").prop('disabled', false);
                        $("#mnuPhrase").prop('disabled', false);
                        $(selectedStart.parentElement).children(".pile").each(function (index, value) {
                            if (index >= idxStart && index <= idxEnd) {
                                $(value).addClass("ui-selected");
                            }
                        });
                    } else {
                        // more than one item selected -- can create a placeholder, phrase, retrans
                        $("#Phrase").prop('disabled', false);
                        $("#Retranslation").prop('disabled', false);
                        $("#mnuRetranslation").prop('disabled', false);
                        $("#mnuPhrase").prop('disabled', false);
                        $(selectedStart.parentElement).children(".pile").each(function (index, value) {
                            if (index >= idxEnd && index <= idxStart) {
                                $(value).addClass("ui-selected");
                            }
                        });
                        // swap the start and end so that placeholders, etc. insert
                        // at the correct location
                        tmpItem = selectedEnd;
                        selectedEnd = selectedStart;
                        selectedStart = tmpItem;
                        tmpIdx = idxEnd;
                        idxEnd = idxStart;
                        idxStart = tmpIdx;
                    }
                    // ** Icons and labels for the toolbar **
                    spid = $(selectedStart).attr('id');
                    // did the user select a placeholder?
                    if (spid.indexOf("plc") !== -1) {
                        // placeholder -- can remove it, but not add a new one
                        isPlaceholder = true;
                        $("#Placeholder").prop('title', i18next.t("view.dscDelPlaceholder"));
                        $("#Placeholder .topcoat-icon").removeClass("topcoat-icon--placeholder-new");
                        $("#Placeholder .topcoat-icon").addClass("topcoat-icon--placeholder-delete");
                        $("#mnuPlaceholder .topcoat-icon").removeClass("topcoat-icon--placeholder-new");
                        $("#mnuPlaceholder .topcoat-icon").addClass("topcoat-icon--placeholder-delete");
                    } else {
                        // not a placeholder -- can add a new one
                        isPlaceholder = false;
                        $("#Placeholder").prop('title', i18next.t("view.dscNewPlaceholder"));
                        $("#Placeholder .topcoat-icon").removeClass("topcoat-icon--placeholder-delete");
                        $("#Placeholder .topcoat-icon").addClass("topcoat-icon--placeholder-new");
                        $("#mnuPlaceholder .topcoat-icon").removeClass("topcoat-icon--placeholder-delete");
                        $("#mnuPlaceholder .topcoat-icon").addClass("topcoat-icon--placeholder-new");
                    }
                    // did the user select a phrase?
                    if ((spid.indexOf("phr") !== -1) && (selectedStart === selectedEnd)) {
                        // phrase (single selection) -- can remove it, but not add a new one
                        isPhrase = true;
                        $("#Phrase").prop('title', i18next.t("view.dscDelPhrase"));
                        $("#Phrase .topcoat-icon").removeClass("topcoat-icon--phrase-new");
                        $("#Phrase .topcoat-icon").addClass("topcoat-icon--phrase-delete");
                        $("#mnuPhrase .topcoat-icon").removeClass("topcoat-icon--phrase-new");
                        $("#mnuPhrase .topcoat-icon").addClass("topcoat-icon--phrase-delete");
                        $("#Phrase").prop('disabled', false); // enable toolbar button (to delete phrase)
                        $("#mnuPhrase").prop('disabled', false); // enable toolbar button (to delete phrase)
                    } else {
                        // not a placeholder -- can add a new one
                        isPhrase = false;
                        $("#Phrase").prop('title', i18next.t("view.dscNewPhrase"));
                        $("#Phrase .topcoat-icon").removeClass("topcoat-icon--phrase-delete");
                        $("#Phrase .topcoat-icon").addClass("topcoat-icon--phrase-new");
                        $("#mnuPhrase .topcoat-icon").removeClass("topcoat-icon--phrase-delete");
                        $("#mnuPhrase .topcoat-icon").addClass("topcoat-icon--phrase-new");
                    }
                    // did the user select a retranslation?
                    if (spid.indexOf("ret") !== -1) {
                        // retranslation -- can remove it, but not add a new one
                        isRetranslation = true;
                        $("#Retranslation").prop('title', i18next.t("view.dscDelRetranslation"));
                        $("#Retranslation .topcoat-icon").removeClass("topcoat-icon--retranslation-new");
                        $("#Retranslation .topcoat-icon").addClass("topcoat-icon--retranslation-delete");
                        $("#mnuRetranslation .topcoat-icon").removeClass("topcoat-icon--retranslation-new");
                        $("#mnuRetranslation .topcoat-icon").addClass("topcoat-icon--retranslation-delete");
                        $("#Retranslation").prop('disabled', false); // enable toolbar button (to delete retranslation)
                        $("#mnuRetranslation").prop('disabled', false); // enable toolbar button (to delete retranslation)
                    } else {
                        // not a retranslation -- can add a new one
                        isRetranslation = false;
                        $("#Retranslation").prop('title', i18next.t("view.dscNewRetranslation"));
                        $("#Retranslation .topcoat-icon").removeClass("topcoat-icon--retranslation-delete");
                        $("#Retranslation .topcoat-icon").addClass("topcoat-icon--retranslation-new");
                        $("#mnuRetranslation .topcoat-icon").removeClass("topcoat-icon--retranslation-delete");
                        $("#mnuRetranslation .topcoat-icon").addClass("topcoat-icon--retranslation-new");
                    }
                    $("#Placeholder").prop('disabled', false);
                    $("#mnuPlaceholder").prop('disabled', false);
                }
                // EDB 10/26/15 - issue #109 (punt): automatic selection of the first item in a selected group
                // is effecting the selection / deselection in weird ways. Punt on this until a consistent
                // initial selection algorithm can be determined
                isSelectingFirstPhrase = true;
//                $(selectedStart).find('.target').mouseup();
                // end EDB
            },
            // Event handler for when the user clicks on a Filter icon (the funnel thingy):
            // display a read-only alert to the user containing:
            // - The USFM marker that is being filtered
            // - Any associated text for the marker
            // If the marker is user-settable, a note is also included telling the user that they can
            // change the setting in the project settings under USFM filtering. If it isn't user-settable,
            // we display a note informing them.
            showFilter: function (event) {
                console.log("showFilter - entry");
                // make sure we're on the right event for the right platform
                if (navigator.notification) {
                    // on mobile device
                    if (event.type === "click" && device.platform === "iOS") {
                        console.log("iOS click -- ignoring");
                        return;
                    }
                    if ((event.type === "mouseup" || event.type === "touchend") && device.platform === "Android") {
                        console.log("Android mouse/touch end event -- ignoring");
                        return;
                    }
                } else {
                    // in browser
                    if (event.type === "mouseup" || event.type === "touchend") {
                        console.log("Browser mouse / touch end event -- ignoring");
                        return;
                    }
                }
                var userCanSetFilter = false,
                    filterString = window.Application.filterList,
                    markers = [],
                    aryClasses = [],
                    filteredText = "",
                    idx = 0,
                    filterID = "",
                    aryFilters = [];
                aryClasses = event.currentTarget.className.split(/\s+/);
                // First, get the filter ID for this filter
                for (idx = 0; idx < aryClasses.length; idx++) {
                    if (aryClasses[idx].indexOf("fid-") >= 0) {
                        filterID = "." + aryClasses[idx];
                    }
                }
                $(filterID).each(function (index) {
                    aryClasses = this.className.split(/\s+/);
                    filteredText = "";
                    markers.length = 0;
                    // Get the marker(s) being filtered here
                    for (idx = 0; idx < aryClasses.length; idx++) {
                        if (aryClasses[idx].indexOf("usfm-") >= 0) {
                            // usfm class -- is it a cause of this filter?
                            if (filterString.indexOf(aryClasses[idx].substr(5)) >= 0) {
                                // this marker is filtered -- add it to the markers
                                markers.push(aryClasses[idx].substr(5));
                            }
                        }
                    }
                    // Look them up in the USFM table -- are they settable?
                    USFMMarkers.each(function (item, index2, list) {
                        if (markers.indexOf(item.get('name')) >= 0) {
                            // this is one of the markers -- can the user set it?
                            if (item.get('userCanSetFilter') && item.get('userCanSetFilter') === '1') {
                                userCanSetFilter = true;
                            }
                        }
                    });
                    // get the source text being filtered out
                    $(this).find(".source").each(function (idx, elt) {
                        filteredText += elt.innerHTML.trim() + " ";
                    });
                    // push new object onto Filters array
                    aryFilters.push({
                        marker: markers.toString(),
                        text: filteredText.trim(),
                        canSet: userCanSetFilter
                    });
                }); // each filter ID
                
                // done building the aryFilters array -- now display the filters
                $("#FilterInfo").html(theFilters(aryFilters));
                $.featherlightGallery($(".slides"));
            },
            // mouseDown / touchStart event handler for the target field
            selectingAdaptation: function (event) {
                if (selectedStart !== null) {
                    console.log("selectingAdaptation: old selection -- need to blur");
                    $("div").removeClass("ui-selecting ui-selected");
                    $(selectedStart).find(".target").blur(); // also triggers a save on the old target field
                }
                selectedStart = event.currentTarget.parentElement; // pile
                console.log("selectingAdaptation: " + selectedStart.id);
                // do NOT propogate this up to the Pile - the user is clicking in the edit field
                event.stopPropagation();
                event.preventDefault();
            },
            // mouseUp / touchEnd event handler for the target field
            selectedAdaptation: function (event) {
                var tu = null,
                    i = 0,
                    strID = "",
                    model = null,
                    sourceText = "",
                    targetText = "",
                    refstrings = null,
                    range = null,
                    selection = null,
                    options = [],
                    foundInKB = false;
//                console.log("selectedAdaptation entry / event type:" + event.type);
//                console.log("- scrollTop: " + $("#chapter").scrollTop() + ", offsetTop: " + $("#chapter").offset().top);

                if ($(window).height() < 200) {
                    // smaller window height -- hide the marker line
                    $(".marker").addClass("hide");
                    $(".pile").addClass("condensed-pile");
//                    $(".pile").css({})
                }
                
                // if we got here, the user has clicked on the target (or the focus moved here). Don't propagate the
                // event to the parent (pile) element when we're done
                event.stopPropagation();
                event.preventDefault();

                // clear out any old selection
                $("div").removeClass("ui-selecting ui-selected");
                // set the current adaptation cursor
                if (event.currentTarget.parentElement && event.currentTarget.parentElement.id) {
                    selectedStart = event.currentTarget.parentElement; // pile
                }
                console.log("selectedAdaptation: " + selectedStart.id);
                // Update lastAdaptedSPID
                project.set('lastAdaptedSPID', selectedStart.id);

                // enable prev / next buttons
                $("#PrevSP").prop('disabled', false); // enable toolbar button
                $("#NextSP").prop('disabled', false); // enable toolbar button
                // Is the target field empty?
                if ($(event.currentTarget).text().trim().length === 0) {
                    // target is empty -- attempt to populate it
                    // First, see if there are any available adaptations in the KB
                    origText = ""; // no text
                    lastPile = selectedStart;
                    isDirty = true;
                    strID = $(selectedStart).attr('id');
                    if (typeof strID === 'undefined') {
                        // we've probably run into the typeahead dropdown
                        return;
                    }
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    model = this.collection.findWhere({spid: strID});
                    sourceText = model.get('source');
                    tu = this.findInKB(this.autoRemoveCaps(sourceText, true));
                    console.log("Target is empty; tu for \"" + this.autoRemoveCaps(sourceText, true) + "\" = " + tu);
                    if (tu !== null) {
                        // found at least one match -- populate the target with the first match
                        refstrings = tu.get('refstring');
                        // first, make sure these refstrings are actually being used
                        options.length = 0; // clear out any old cruft
                        for (i = 0; i < refstrings.length; i++) {
                            if (refstrings[i].n > 0) {
                                options.push(Underscore.unescape(refstrings[i].target));
                            }
                        }
                        if (options.length === 1) {
                            // exactly one entry in KB -- populate the field
                            targetText = this.stripPunctuation(this.autoAddCaps(model, refstrings[0].target));
                            $(event.currentTarget).html(targetText);
                            isDirty = true;
                            // Are we moving?
                            if (MovingDir === 0) {
                                // not moving (user clicked on this node) - leave the
                                // cursor here for the user to make adjustments as necessary
                                clearKBInput = true;
                                // select any text in the edit field
                                if (document.body.createTextRange) {
                                    range = document.body.createTextRange();
                                    range.moveToElementText($(event.currentTarget));
                                    range.select();
                                } else if (window.getSelection) {
                                    selection = window.getSelection();
                                    selection.removeAllRanges();
                                    range = document.createRange();
                                    range.selectNodeContents($(event.currentTarget)[0]);
                                    selection.addRange(range);
                                }
                            } else {
                                // moving (user clicked forward/back at some point)
                                // mark the current target purple and move the cursor
                                $(event.currentTarget).addClass('fromkb');
                                clearKBInput = false;
                                this.moveCursor(event, true);
                            }
                            foundInKB = true;
                        } else if (options.length > 1) {
                            // more than one entry in KB -- stop here so the user can choose
                            MovingDir = 0;
                            isDirty = false; // no change yet (user needs to select something first)
                            // create the autocomplete UI
                            console.log("selectedAdaptation: creating typeahead dropdown with " + options.length + " options: " + options.toString());
                            $(event.currentTarget).typeahead(
                                {
                                    hint: true,
                                    highlight: true,
                                    minLength: 0
                                },
                                {
                                    name: 'kboptions',
                                    source: function (request, response) {
                                        response(options);
                                    }
                                }
                            );
                            isSelectingKB = true;
                            // select any text in the edit field
                            console.log("selecting text");
                            if (document.body.createTextRange) {
                                range = document.body.createTextRange();
                                range.moveToElementText($(event.currentTarget));
                                range.select();
                            } else if (window.getSelection) {
                                selection = window.getSelection();
                                selection.removeAllRanges();
                                range = document.createRange();
                                range.selectNodeContents($(event.currentTarget)[0]);
                                selection.addRange(range);
                            }
                            // ios
                            if (navigator.notification && device.platform === "iOS") {
                                $(event.currentTarget).setSelectionRange(0, 99999);
                            }
                            // it's possible that we went offscreen while looking for the next available slot to adapt.
                            // Make sure the edit field is in view by scrolling the UI
                            // scroll the edit field into view
                            console.log("Scrolling to view...");
                            scrollToView(selectedStart);
                        } else {
                            console.log("selectedAdaptation: TU not null (" + options.length + " options.) ");
                            // options.length should = 0
                            // if this isn't a phrase, populate the target with the source text as the next best guess
                            // (if this is a phrase, we just finished an auto-create phrase, and we want a blank field)
                            if (strID.indexOf("phr") === -1) {
                                $(event.currentTarget).html(sourceText);
                            }
                            MovingDir = 0; // stop here
                            clearKBInput = true;
                            // no change yet -- this is just a suggestion
                            isDirty = true;
                            // select any text in the edit field
                            console.log("selecting text");
                            if (document.body.createTextRange) {
                                range = document.body.createTextRange();
                                range.moveToElementText($(event.currentTarget));
                                range.select();
                            } else if (window.getSelection) {
                                selection = window.getSelection();
                                selection.removeAllRanges();
                                range = document.createRange();
                                range.selectNodeContents($(event.currentTarget)[0]);
                                selection.addRange(range);
                            }
                            // it's possible that we went offscreen while looking for the next available slot to adapt.
                            // Make sure the edit field is in view by scrolling the UI
                            // scroll the edit field into view
                            console.log("Scrolling to view...");
                            scrollToView(selectedStart);
                        }
                    } else {
                        // nothing in the KB
                        // if this isn't a phrase, populate the target with the source text as the next best guess
                        // (if this is a phrase, we just finished an auto-create phrase, and we want a blank field)
                        if (strID.indexOf("phr") === -1) {
                            // not a phrase. Do we want to copy the source over?
                            if (localStorage.getItem("CopySource") && localStorage.getItem("CopySource") === "false") {
                                console.log("No KB entry on an empty field, BUT the user does not want to copy source text: " + sourceText);
                                $(event.currentTarget).html("");
                            } else {
                                // copy the source text
                                $(event.currentTarget).html(this.stripPunctuation(sourceText));
                            }
                        }
                        MovingDir = 0; // stop here
                        clearKBInput = true;
                        // no change yet -- this is just a suggestion
                        isDirty = true;
                        // select any text in the edit field
                        console.log("selecting text");
                        if (document.body.createTextRange) {
                            range = document.body.createTextRange();
                            range.moveToElementText($(event.currentTarget));
                            range.select();
                        } else if (window.getSelection) {
                            selection = window.getSelection();
                            selection.removeAllRanges();
                            range = document.createRange();
                            range.selectNodeContents($(event.currentTarget)[0]);
                            selection.addRange(range);
                        }
                        // it's possible that we went offscreen while looking for the next available slot to adapt.
                        // Make sure the edit field is in view by scrolling the UI
                        // scroll the edit field into view
                        console.log("Scrolling to view...");
                        scrollToView(selectedStart);
                    }
                } else {
                    // something already in the edit field -- are we looking for the next
                    // empty field, or did we just select this one?
                    console.log("Target NOT empty (text=" + $(event.currentTarget).text().trim() + "); MovingDir = " + MovingDir + ", isDrafting = " + isDrafting);
                    if (MovingDir !== 0 && isDrafting === true) {
                        // looking for the next empty field --
                        // clear the dirty bit and keep going
                        isDirty = false;
                        this.moveCursor(event, (MovingDir === 1) ? true : false);
                    } else {
                        // We really selected this field -- stay here.
                        // reset the dirty bit because
                        // we haven't made any changes yet
                        origText = this.stripPunctuation($(event.currentTarget).text().trim());
                        lastPile = selectedStart;
                        MovingDir = 0; // stop here
                        clearKBInput = true;
                        isDirty = false;
                        // special case: check to see if there are multiple KB entries for this field; 
                        // add a typeahead dropdown menu if so
                        strID = $(selectedStart).attr('id');
                        strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                        model = this.collection.findWhere({spid: strID});
                        sourceText = model.get('source');
                        // skip the KB check if this is a retranslation or placeholder (there won't be a KB entry)
                        if ((strID.indexOf("ret") === -1) && (strID.indexOf("plc") === -1)) {
                            // not a retranslation or placeholder
                            tu = this.findInKB(this.autoRemoveCaps(sourceText, true));
                            refstrings = tu.get('refstring');
                            // first, make sure these refstrings are actually being used
                            options.length = 0; // clear out any old cruft
                            for (i = 0; i < refstrings.length; i++) {
                                if (refstrings[i].n > 0) {
                                    options.push(Underscore.unescape(refstrings[i].target));
                                }
                            }
                            if (options.length > 1) {
                                // create the autocomplete UI
                                console.log("selectedAdaptation: creating typeahead dropdown with " + options.length + " options: " + options.toString());
                                $(event.currentTarget).typeahead(
                                    {
                                        hint: true,
                                        highlight: true,
                                        minLength: 0
                                    },
                                    {
                                        name: 'kboptions',
                                        source: function (request, response) {
                                            response(options);
                                        }
                                    }
                                );
                                isSelectingKB = true;
                            } else {
                                // only one entry -- just clean up the target we'll be editing
                                $(event.currentTarget).html(origText); // stripped of punctuation
                            }
                        }
                        
                        // select any text in the edit field
                        if (document.body.createTextRange) {
                            range = document.body.createTextRange();
                            range.moveToElementText($(event.currentTarget));
                            range.select();
                        } else if (window.getSelection) {
                            selection = window.getSelection();
                            selection.removeAllRanges();
                            range = document.createRange();
                            range.selectNodeContents($(event.currentTarget)[0]);
                            selection.addRange(range);
                        }
                        // Make sure the edit field is in view by scrolling the UI
                        console.log("Scrolling to view...");
                        scrollToView(selectedStart);
                    }
                }
                if (isDirty === true) {
                    $("#Undo").prop('disabled', false);
                }
//                console.log("selectedAdaptation exit / isDirty = " + isDirty + ", origText = " + origText);
            },
            // keydown event handler for the target field
            editAdaptation: function (event) {
                var strID = null,
                    model = null;
                console.log("editAdaptation");
                if (event.keyCode === 27) {
                    // Escape key pressed -- cancel the edit (reset the content) and blur
                    // Note that this key is not on most on-screen keyboards
                    strID = $(event.currentTarget.parentElement).attr('id');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    model = this.collection.findWhere({spid: strID});
                    $(event.currentTarget).html(model.get('target'));
                    event.stopPropagation();
                    event.preventDefault();
                    $(event.currentTarget).blur();
// #129 - Enter key processing - should it mean "accept and move" or "accept and close the keyboard?"
// Here's the code for "accept and close the keyboard" should we decide to re-implement.
//                } else if (event.keyCode === 13) {
//                    // Return / Enter pressed - accept the edit and do NOT move the cursor
//                    event.preventDefault();
//                    event.stopPropagation();
//                    isDirty = true;
//                    if (window.getSelection) {
//                        if (window.getSelection().empty) {  // Chrome
//                            window.getSelection().empty();
//                        } else if (window.getSelection().removeAllRanges) {  // Firefox
//                            window.getSelection().removeAllRanges();
//                        }
//                    } else if (document.selection) {  // IE?
//                        document.selection.empty();
//                    }
//                    $(event.currentTarget).blur();
                } else if ((event.keyCode === 9) || (event.keyCode === 13)) {
                    // tab or enter key -- accept the edit and move the cursor
                    event.preventDefault();
                    event.stopPropagation();
                    isDirty = true;
                    // make sure there is a selectedStart, so that we can navigate to the next pile
                    if (selectedStart === null) {
                        selectedStart = event.currentTarget.parentElement; // select the pile, not the target (the currentTarget)
                        selectedEnd = selectedStart;
                    }
                    if (event.shiftKey) {
                        MovingDir = -1;
                        this.moveCursor(event, false);  // shift tab/enter -- move backwards
                    } else {
                        MovingDir = 1;
                        this.moveCursor(event, true);   // normal tab/enter -- move forwards
                    }
                } else {
                    // any other key - set the dirty bit
                    isDirty = true;
                    $("#Undo").prop('disabled', false);
                }
            },
            // Input text has changed in the target field -
            // Check to see if this is an automatic merge phrase situation
            // (https://github.com/adapt-it/adapt-it-mobile/issues/109)
//            checkForAutoMerge: function (event) {
//                // is the selection a range of piles?
//                if ((selectedEnd !== null && selectedStart !== null) && (selectedEnd !== selectedStart)) {
//                    // User typed after selecting a group of piles -- automatic phrase merge
//                    console.log("detect autophrase");
//                    isAutoPhrase = true;
//                    // Trigger the phrase creation
//                    $("#Phrase").click();
//                }
//            },
            // User clicked on the Undo button.
            onUndo: function (event) {
                console.log("onUndo: entry");
                // find the model object associated with this edit field
                var strID = $(lastPile).attr('id');
                strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                var model = this.collection.findWhere({spid: strID});
                // remove the KB entry
                removeFromKB(this.autoRemoveCaps(model.get('source'), true),
                             this.stripPunctuation(this.autoRemoveCaps($(lastPile).find(".target").html(), false).trim()),
                             project.get('projectid'));
                // set the edit field back to its previous value
                $(lastPile).find(".target").html(origText);
                // update the model with the new target text
                model.save({target: origText});
                // if the target differs from the source, make it display in green
                if (model.get('source') === model.get('target')) {
                    // source === target --> remove "differences" from the class so the text is black
                    $(event.currentTarget).removeClass('differences');
                } else if (model.get('target') === model.get('prepuncts') + model.get('source') + model.get('follpuncts')) {
                    // source + punctuation == target --> remove "differences"
                    $(event.currentTarget).removeClass('differences');
                } else if (!$(event.currentTarget).hasClass('differences')) {
                    // source != target -- add "differences" to the class so the text is green
                    $(event.currentTarget).addClass('differences');
                }
                // Now disable the Undo button...
                $("#Undo").prop("disabled", true);
                // ...and select the pile
                isSelecting = true;
                selectedStart = lastPile;
                selectedEnd = lastPile;
                $(lastPile).mouseup();
            },
            // User has moved out of the current adaptation input field (blur on target field)
            // this can be called either programatically (tab / shift+tab keydown response) or
            // by a selection of something else on the page.
            // This method updates the KB and model (AI Document) if they have any changes, and
            // removes the content editable field in the UI.
            unselectedAdaptation: function (event) {
                var value = null,
                    trimmedValue = null,
                    strID = null,
                    model = null;
                console.log("unselectedAdaptation: event type=" + event.type + ", isDirty=" + isDirty + ", scrollTop=" + $("#chapter").scrollTop());
                if (isSelectingKB === true) {
                    isSelectingKB = false;
                }
                if ($(window).height() < 200) {
                    // smaller window height -- hide the marker line
                    $(".marker").removeClass("hide");
                    $(".pile").removeClass("condensed-pile");
//                    $(".pile").css({})
                }
                // disable the undo button (no longer editing)
//                $("#Undo").prop('disabled', true);

                // remove any earlier kb "purple"
                if (clearKBInput === true) {
                    $(".target").removeClass("fromkb");
                    clearKBInput = false;
                }
                // get the adaptation text
                //value = $(event.currentTarget).text();
                value = $(event.currentTarget).text();
                // if needed use regex to replace chars we don't want stored in escaped format
                //value = value.replace(new RegExp("&quot;", 'g'), '"');  // klb
                trimmedValue = value.trim();
                // find the model object associated with this edit field
                strID = $(event.currentTarget.parentElement).attr('id');
                if (strID === undefined) {
                    console.log("value: " + value);
                    // make sure the typeahead gets cleaned out and the value saved
                    isDirty = true;
                    isSelectingKB = false;
                    // this might be the tt-input div if we are in a typeahead (multiple KB) input -
                    // if so, go up one more level to find the pile
                    strID = $(event.currentTarget.parentElement.parentElement).attr('id');
                    // destroy the typeahead control in the edit field
                    $(event.currentTarget).typeahead('destroy');
                }
                strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                model = this.collection.findWhere({spid: strID});
                // check for changes in the edit field
                if (isDirty === true) {
                    if (trimmedValue.length === 0) {
                        // empty value entered. Was there text before?
                        if (origText.length > 0) {
                            console.log("User deleted target text: " + origText + " -- removing from KB and DB.");
                            // There was a target text, but the user deleted it. Remove the old text from the KB.
                            removeFromKB(this.autoRemoveCaps(model.get('source'), true),
                                     origText, project.get('projectid'));
                            // update the model with the new target text (nothing)
                            model.save({target: trimmedValue});
                        }
                    } else {
                        if ((strID.indexOf("ret") > -1) || (strID.indexOf("plc") > -1)) {
                            // retranslation or placeholder -- don't save in the KB
                            console.log("Dirty bit set on retranslation / placeholder. Value:" + trimmedValue);
                        } else {
                            // not a retranslation
                            console.log("Dirty bit set. Saving KB value: " + trimmedValue);
                            // something has changed -- update the KB
                            saveInKB(this.autoRemoveCaps(model.get('source'), true),
                                     Underscore.escape(this.stripPunctuation(this.autoRemoveCaps(trimmedValue, false)).trim()),
                                     Underscore.escape(this.stripPunctuation(this.autoRemoveCaps(model.get('target'), false)).trim()),
                                     project.get('projectid'));
                        }
                        // add any punctuation back to the target field
                        $(event.currentTarget).html(this.copyPunctuation(model, trimmedValue));
                        // update the model with the new target text
                        model.save({target: Underscore.escape(trimmedValue)});
                        // if the target differs from the source, make it display in green
                        if (model.get('source') === model.get('target')) {
                            // source === target --> remove "differences" from the class so the text is black
                            $(event.currentTarget).removeClass('differences');
                        } else if (model.get('target') === model.get('prepuncts') + model.get('source') + model.get('follpuncts')) {
                            // source + punctuation == target --> remove "differences"
                            $(event.currentTarget).removeClass('differences');
                        } else if (!$(event.currentTarget).hasClass('differences')) {
                            // source != target -- add "differences" to the class so the text is green
                            $(event.currentTarget).addClass('differences');
                        }
                    }
                }
                // if we just finished work on a new verse, update the last adapted count
                if (model && model.get('markers').length > 0 && model.get('markers').indexOf("\\v ") > -1) {
                    // get the verse #
                    var stridx = model.get('markers').indexOf("\\v ") + 3;
                    var verseNum = "";
                    if (model.get('markers').lastIndexOf(" ") < stridx) {
                        // no space after the verse # (it's the ending of the string)
                        verseNum = model.get('markers').substr(stridx);
                    } else {
                        // space after the verse #
                        verseNum = model.get('markers').substr(stridx, model.get('markers').indexOf(" ", stridx) - stridx);
                    }
                    console.log("Adapting verse: " + verseNum);
                    chapter.set('lastadapted', verseNum);
                }
                // check for an old selection and remove it if needed
                if (selectedStart !== null) {
                    // there was an old selection -- remove the ui-selected class
                    $("div").removeClass("ui-selecting ui-selected");
//                    $("#Placeholder").prop('disabled', true);
//                    $("#Retranslation").prop('disabled', true);
//                    $("#Phrase").prop('disabled', true);
                }
                // remove any old selection ranges
                if (window.getSelection) {
                    if (window.getSelection().empty) {  // Chrome
                        window.getSelection().empty();
                    } else if (window.getSelection().removeAllRanges) {  // Firefox
                        window.getSelection().removeAllRanges();
                    }
                } else if (document.selection) {  // IE?
                    document.selection.empty();
                }
                // re-scroll if necessary
//                $("#content").scrollTop(lastOffset);
            },
            // User clicked on the Placeholder button
            togglePlaceholder: function (event) {
                // TODO: move placeHolderHtml to templated html
                var next_edit = null,
                    selectedObj = null,
                    nOrder = 0.0,
                    strID = null,
                    newID = Underscore.uniqueId(),
                    phObj = null,
                    placeHolderHtml = "<div id=\"pile-plc-" + newID + "\" class=\"pile block-height\">" +
                                        "<div class=\"marker\">&nbsp;</div> <div class=\"source\">...</div>" +
                                        " <div class=\"target differences\" contenteditable=\"true\">&nbsp;</div></div>";
                console.log("placeholder: " + placeHolderHtml);
                // if the current selection is a placeholder, remove it; if not,
                // add a placeholder before the current selection
                if (isPlaceholder === false) {
                    // no placeholder at the selection -- add one
                    phObj = new spModels.SourcePhrase({ spid: ("plc-" + newID), source: "..."});
                    strID = $(selectedStart).attr('id');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    selectedObj = this.collection.findWhere({spid: strID});
                    phObj.set('chapterid', selectedObj.get('chapterid'), {silent: true});
                    // Order # for placeholder is a little more complicated, since it's a real insert into the collection.
                    // Take the average of the order # of the selected start and the item before it. This will be a float.
                    if (this.collection.indexOf(selectedObj) > 0) {
                        nOrder = (selectedObj.get('norder') + (this.collection.at(this.collection.indexOf(selectedObj) - 1).get('norder'))) / 2;
                    } // else nOrder gets the fallback value of 0.0
                    phObj.set('norder', nOrder, {silent: true});
                    phObj.save();
                    this.collection.add(phObj, {at: this.collection.indexOf(selectedObj)});
                    $(selectedStart).before(placeHolderHtml);
                    // start adapting at this location
                    $("div").removeClass("ui-selecting ui-selected");
                    $("#Placeholder").prop('disabled', true);
                    $("#Retranslation").prop('disabled', true);
                    $("#Phrase").prop('disabled', true);
                    $("#mnuPlaceholder").prop('disabled', true);
                    $("#mnuRetranslation").prop('disabled', true);
                    $("#mnuPhrase").prop('disabled', true);
                    next_edit = selectedStart.previousElementSibling;
                    selectedStart = next_edit;
                    $(next_edit).find('.target').mouseup();
                } else {
                    // selection is a placeholder -- delete it from the model and the DOM (html)
                    strID = $(selectedStart).attr('id');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    selectedObj = this.collection.findWhere({spid: strID});
                    this.collection.remove(selectedObj); // remove from collection
                    selectedObj.destroy(); // delete from db
                    $(selectedStart).remove();
                    // item has been removed, so there is no longer a selection -
                    // clean up the UI accordingly
                    $("div").removeClass("ui-selecting ui-selected");
                    $("#Placeholder").prop('title', i18next.t("view.dscNewPlaceholder"));
                    $("#Placeholder .topcoat-icon").removeClass("topcoat-icon--placeholder-delete");
                    $("#Placeholder .topcoat-icon").addClass("topcoat-icon--placeholder-new");
                    $("#Placeholder").prop('disabled', true);
                    $("#Retranslation").prop('disabled', true);
                    $("#Phrase").prop('disabled', true);
                    $("#mnuPlaceholder").prop('disabled', true);
                    $("#mnuRetranslation").prop('disabled', true);
                    $("#mnuPhrase").prop('disabled', true);
                    $("#PrevSP").prop('disabled', true);
                    $("#NextSP").prop('disabled', true);
                }
            },
            // User clicked on the Phrase button
            togglePhrase: function (event) {
                // if the current selection is a phrase, remove it; if not,
                // combine the selection into a new phrase
                var next_edit = null,
                    phraseHtml = null,
                    coll = this.collection, // needed to find collection within "each" block below
                    newID = Underscore.uniqueId(),
                    phraseMarkers = "",
                    phraseSource = "",
                    phraseTarget = "",
                    origTarget = "",
                    nOrder = 0.0,
                    phObj = null,
                    strID = null,
                    bookID = null,
                    newView = null,
                    selectedObj = null,
                    PhraseLine0 = "<div id=\"pile-",
                    PhraseLine1 = "\" class=\"pile block-height\"><div class=\"marker\">",
                    PhraseLine2 = "</div> <div class=\"source\">",
                    PhraseLine3 = "</div> <div class=\"target\" contenteditable=\"true\">",
                    PhraseLine4 = "</div></div>";
                if (isPhrase === false) {
                    // not a phrase -- create one from the selection
                    // first, iterate through the piles in the strip and pull out the source phrases that
                    // are selected
                    // Note: we are bundling up multiple sourcephrases, some of which could contain a
                    // phrase. Check for these while bundling.
                    $(selectedStart.parentElement).children(".pile").each(function (index, value) {
                        if (index >= idxStart && index <= idxEnd) {
                            // concatenate the source and target into single phrases
                            // TODO: spaces? Probably replace with a space marker of some sort (e.g. Thai with no word breaks)
                            if (index > idxStart) {
                                phraseSource += " ";
                                phraseTarget += " ";
                                origTarget += "|";
                            }
                            phraseMarkers += $(value).children(".marker").text();
                            phraseSource += $(value).children(".source").html();
                            phraseTarget += $(value).children(".target").html();
                            // check for phrases
                            if ($(value).attr('id').indexOf("phr") !== -1) {
                                // phrase -- pull out the original target
                                strID = $(value).attr('id');
                                strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                                selectedObj = this.collection.findWhere({spid: strID});
                                origTarget += selectedObj.get("orig");
                            } else {
                                // not a phrase -- just add the target text
                                origTarget += $(value).children(".target").html();
                            }
                        }
                    });
                    // now build the new sourcephrase from the string
                    // model object itself
                    phObj = new spModels.SourcePhrase({ spid: ("phr-" + newID), markers: phraseMarkers.trim(), source: phraseSource, target: phraseSource, orig: origTarget});
                    strID = $(selectedStart).attr('id');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    selectedObj = this.collection.findWhere({spid: strID});
                    phObj.set('chapterid', selectedObj.get('chapterid'), {silent: true});
                    phObj.set('norder', selectedObj.get('norder'), {silent: true}); // phrase just takes same order # as first selected object
                    phObj.save();
                    this.collection.add(phObj);
                    // also save in KB
                    saveInKB(phraseSource, phraseSource, "", project.get('projectid'));
                    // UI representation
                    // marker, source divs
                    phraseHtml = PhraseLine0 + "phr-" + newID + PhraseLine1 + phraseMarkers + PhraseLine2 + phraseSource + PhraseLine3;
                    // target div (only if the user didn't auto-create the phrase by typing after a selection)
                    console.log("isAutoPhrase: " + isAutoPhrase);
                    if (isAutoPhrase === false) {
                        // if there's something already in the target, use it instead
                        phraseHtml += (phraseTarget.trim().length > 0) ? phraseTarget : phraseSource;
                        isDirty = false; // don't save (original sourcephrase is now gone)
                    } else {
                        // autophrase -- add the target for the selected start ONLY
                        phraseHtml += $(selectedStart).find(".target").html();
                        isDirty = true; // save
                    }
                    isAutoPhrase = false; // clear the autophrase flag
                    phraseHtml += PhraseLine4;
                    console.log("phrase: " + phraseHtml);
                    isDirty = false;
                    $(selectedStart).before(phraseHtml);
                    // finally, remove the selected piles (they were merged into this one)
                    $(selectedStart.parentElement).children(".pile").each(function (index, value) {
                        if (index >= idxStart && index <= (idxEnd + 1)) {
                            // remove the original sourcephrase
                            strID = $(value).attr('id');
                            // skip our phrase
                            if (strID.indexOf("phr") === -1) {
                                strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                                selectedObj = coll.findWhere({spid: strID});
                                coll.remove(selectedObj); // remove from collection
                                selectedObj.destroy(); // remove from database
                                $(value).remove();
                            }
                        }
                    });
                    // update the toolbar UI
                    $("div").removeClass("ui-selecting ui-selected");
                    $("#Placeholder").prop('disabled', true);
                    $("#Retranslation").prop('disabled', true);
                    $("#Phrase").prop('disabled', true);
                    $("#mnuPlaceholder").prop('disabled', true);
                    $("#mnuRetranslation").prop('disabled', true);
                    $("#mnuPhrase").prop('disabled', true);
                    // start adapting the new Phrase
                    next_edit = $('#pile-phr-' + newID);
                    selectedStart = next_edit;
                    $(next_edit).find('.target').mouseup();
                } else {
                    // selection is a phrase -- delete it from the model and the DOM
                    // first, re-create the original sourcephrase piles and add them to the collection and UI
                    bookID = $('.topcoat-navigation-bar__title').attr('id');
                    strID = $(selectedStart).attr('id');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    selectedObj = this.collection.findWhere({spid: strID});
                    nOrder = selectedObj.get('norder');
                    origTarget = selectedObj.get("orig").split("|");
                    selectedObj.get("source").split(" ").forEach(function (value, index) {
                        // add to model
                        newID = Underscore.uniqueId();
                        phraseTarget = (index >= origTarget.length) ? " " : origTarget[index];
                        phObj = new spModels.SourcePhrase({ spid: (newID), norder: nOrder, source: value, target: phraseTarget, chapterid: selectedObj.get('chapterid')});
                        if (index === 0) {
                            // transfer any marker back (would be the first in the list)
                            phObj.set('markers', selectedObj.get('markers'), {silent: true});
                        }
                        phObj.save();
                        coll.add(phObj, {at: coll.indexOf(selectedObj)});
                        nOrder = nOrder + 1;
                        // add to KB
                        if (phraseTarget.length > 0) {
                            saveInKB(value, phraseTarget, "", project.get('projectid'));
                        }
                        // add to UI
                        $(selectedStart).before("<div class=\"pile block-height\" id=\"pile-" + phObj.get('spid') + "\"></div>");
                        newView = new SourcePhraseView({ model: phObj});
                        $('#pile-' + phObj.get('spid')).append(newView.render().el.childNodes);
                    });
                    // now delete the phrase itself
                    removeFromKB(selectedObj.get("source"), selectedObj.get("target"), project.get('projectid')); // remove from KB
                    this.collection.remove(selectedObj); // remove from collection
                    selectedObj.destroy(); // delete the object from the database
                    $(selectedStart).remove();
                    // update the toolbar UI
                    $("div").removeClass("ui-selecting ui-selected");
                    $("#Phrase").prop('title', i18next.t("view.dscNewPhrase"));
                    $("#Phrase .topcoat-icon").removeClass("topcoat-icon--phrase-delete");
                    $("#Phrase .topcoat-icon").addClass("topcoat-icon--phrase-new");
                    $("#Placeholder").prop('disabled', true);
                    $("#Retranslation").prop('disabled', true);
                    $("#Phrase").prop('disabled', true);
                    $("#mnuPlaceholder").prop('disabled', true);
                    $("#mnuRetranslation").prop('disabled', true);
                    $("#mnuPhrase").prop('disabled', true);
                    $("#PrevSP").prop('disabled', true);
                    $("#NextSP").prop('disabled', true);
                }
            },
            // User clicked on the Retranslation button
            toggleRetranslation: function (event) {
                var next_edit = null,
                    RetHtml = null,
                    coll = this.collection, // needed to find collection within "each" block below
                    newID = Underscore.uniqueId(),
                    retMarkers = "",
                    RetSource = "",
                    RetTarget = "",
                    nOrder = 0.0,
                    origTarget = "",
                    phObj = null,
                    strID = null,
                    bookID = null,
                    newView = null,
                    selectedObj = null,
                    RetHtmlLine0 = "<div id=\"pile-",
                    RetHtmlline1 = "\" class=\"pile block-height\"><div class=\"marker\">",
                    RetHtmlLine2 = "</div> <div class=\"source retranslation\">",
                    RetHtmlLine3 = "</div> <div class=\"target\" contenteditable=\"true\">",
                    RetHtmlLine4 = "</div></div>";
                // if the current selection is a retranslation, remove it; if not,
                // combine the selection into a new retranslation
                if (isRetranslation === false) {
                    // not a retranslation -- create one from the selection
                    // first, iterate through the piles in the strip and pull out the source Rets that
                    // are selected
                    $(selectedStart.parentElement).children(".pile").each(function (index, value) {
                        if (index >= idxStart && index <= idxEnd) {
                            // concatenate the source and target into single Retranslations
                            // TODO: spaces? Probably replace with a space marker of some sort (e.g. Thai with no word breaks)
                            if (index > idxStart) {
                                RetSource += " ";
                                RetTarget += " ";
                                origTarget += "|";
                            }
                            retMarkers += $(value).children(".marker").text();
                            RetSource += $(value).children(".source").html();
                            RetTarget += $(value).children(".target").html();
                            origTarget += $(value).children(".target").html();
                        }
                    });
                    // now build the new sourcephrase from the string
                    // model object
                    phObj = new spModels.SourcePhrase({ spid: ("ret-" + newID), markers: retMarkers.trim(), source: RetSource, target: RetSource, orig: origTarget});
                    strID = $(selectedStart).attr('id');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    selectedObj = this.collection.findWhere({spid: strID});
                    phObj.set('norder', selectedObj.get('norder'), {silent: true}); // retranslation just takes same order # as first selected object
                    phObj.set('chapterid', selectedObj.get('chapterid'), {silent: true});
                    // the html code depends on getting a valid ID back from the object after save() completes
                    phObj.save();
                    this.collection.add(phObj);
                    // UI representation
                    RetHtml = RetHtmlLine0 + "ret-" + newID + RetHtmlline1 + retMarkers + RetHtmlLine2 + RetSource + RetHtmlLine3;
                    // if there's something already in the target, use it instead
                    RetHtml += (RetTarget.trim().length > 0) ? RetTarget : RetSource;
                    RetHtml += RetHtmlLine4;
                    console.log("Ret: " + RetHtml);
                    $(selectedStart).before(RetHtml);
                    // finally, remove the selected piles (they were merged into this one)
                    $(selectedStart.parentElement).children(".pile").each(function (index, value) {
                        if (index >= idxStart && index <= (idxEnd + 1)) {
                            // remove the original sourceRet
                            strID = $(value).attr('id');
                            // skip our retranslation
                            if (strID.indexOf("ret") === -1) {
                                strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                                selectedObj = coll.findWhere({spid: strID});
                                coll.remove(selectedObj); // remove from collection
                                selectedObj.destroy(); // remove from database
                                $(value).remove();
                            }
                        }
                    });
                    // update the toolbar UI
                    $("div").removeClass("ui-selecting ui-selected");
                    $("#Placeholder").prop('disabled', true);
                    $("#Retranslation").prop('disabled', true);
                    $("#Phrase").prop('disabled', true);
                    $("#mnuPlaceholder").prop('disabled', true);
                    $("#mnuRetranslation").prop('disabled', true);
                    $("#mnuPhrase").prop('disabled', true);
                    // start adapting the new Retranslation
                    next_edit = $('#pile-ret-' + newID);
                    selectedStart = next_edit;
                    $(next_edit).find('.target').mouseup();
                } else {
                    // selection is a retranslation -- delete it from the model and the DOM
                    // first, re-create the original sourcephrase piles and add them to the collection and UI
                    bookID = $('.topcoat-navigation-bar__title').attr('id');
                    strID = $(selectedStart).attr('id');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    selectedObj = this.collection.findWhere({spid: strID});
                    nOrder = selectedObj.get('norder');
                    origTarget = selectedObj.get("orig").split("|");
                    selectedObj.get("source").split(" ").forEach(function (value, index) {
                        // add to model
                        newID = Underscore.uniqueId();
                        RetTarget = (index >= origTarget.length) ? " " : origTarget[index];
                        phObj = new spModels.SourcePhrase({ spid: (newID), norder: nOrder, source: value, target: RetTarget, chapterid: selectedObj.get('chapterid')});
                        if (index === 0) {
                            // transfer any marker back (would be the first in the list)
                            phObj.set('markers', selectedObj.get('markers'), {silent: true});
                        }
                        phObj.save();
                        nOrder = nOrder + 1;
                        coll.add(phObj, {at: coll.indexOf(selectedObj)});
                        // add to UI
                        $(selectedStart).before("<div class=\"pile block-height\" id=\"pile-" + phObj.get('spid') + "\"></div>");
                        newView = new SourcePhraseView({ model: phObj});
                        $('#pile-' + phObj.get('spid')).append(newView.render().el.childNodes);
                    });
                    // now delete the retranslation itself
                    this.collection.remove(selectedObj); // remove from collection
                    selectedObj.destroy(); // remove from db
                    $(selectedStart).remove();
                    // update the toolbar UI
                    $("div").removeClass("ui-selecting ui-selected");
                    $("#Retranslation").prop('title', i18next.t("view.dscNewRetranslation"));
                    $("#Retranslation .topcoat-icon").removeClass("topcoat-icon--retranslation-delete");
                    $("#Retranslation .topcoat-icon").addClass("topcoat-icon--retranslation-new");
                    $("#Placeholder").prop('disabled', true);
                    $("#Retranslation").prop('disabled', true);
                    $("#Phrase").prop('disabled', true);
                    $("#mnuPlaceholder").prop('disabled', true);
                    $("#mnuRetranslation").prop('disabled', true);
                    $("#mnuPhrase").prop('disabled', true);
                    $("#PrevSP").prop('disabled', true);
                    $("#NextSP").prop('disabled', true);
                }
            }
        }),

        // ChapterView
        // Top-level frame for the Adaptation page. Loads the sourcephrases for the current chapter, sends down the events
        // for the phrase / placeholder / retranslation / next and previous buttons, and sets up the help walkthrough code.
        ChapterView = Marionette.LayoutView.extend({
            template: Handlebars.compile(tplChapter),
            initialize: function () {
                kblist = new kbModels.TargetUnitCollection();
                document.addEventListener("pause", this.onPause, false);
                document.addEventListener("resume", this.onResume, false);
                USFMMarkers = new usfm.MarkerCollection();
                USFMMarkers.fetch({reset: true, data: {name: ""}}); // return all results
            },
            regions: {
                container: "#chapter"
            },
            // Pause handler -- user is placing the app in the background.
            // Save the current selection if needed.
            onPause: function () {
                if (selectedStart !== null && isDirty === true) {
                    // unsaved change -- save it now
                    console.log("onPause - saving");
                    $(selectedStart).find(".target").blur();
                    
                }
            },
            // Resume handler -- user placed the app in the background, then resumed.
            // Refresh this view to wake it up.
            onResume: function () {
                // refresh the view
                Backbone.history.loadUrl(Backbone.history.fragment);
            },
            onShow: function () {
                console.log("ChapterView::onShow");
                project = this.project;
                var chapterid = this.model.get('chapterid');
                chapter = this.model;
                this.$list = $('#chapter');
                this.spList = new spModels.SourcePhraseCollection();
                this.spList.clearLocal();
                // fetch the KB for this project
                $.when(kblist.fetch({reset: true, data: {projectid: project.get('projectid')}})).done(function () {
                    console.log("KB fetch complete.");
                });
                // load the source / target punctuation pairs
                this.project.get('PunctPairs').forEach(function (elt, idx, array) {
                    punctsSource.push(elt.s);
                    punctsTarget.push(elt.t);
                });
                // load the source / target case pairs
                this.project.get('CasePairs').forEach(function (elt, idx, array) {
                    caseSource.push(elt.s);
                    caseTarget.push(elt.t);
                });
                template = Handlebars.compile(tplChapter);
                this.$el.html(template(this.model.toJSON()));
                // populate the list view with the source phrase results
                this.listView = new SourcePhraseListView({collection: this.spList, chapterName: this.model.get('name'), chapterid: chapterid, el: $('#chapter', this.el)});
                addStyleRules(this.project);
            },
            ////
            // Event Handlers
            ////
            events: {
                "click .main_title": "unselectPiles",
                "click #chapter": "unselectPiles",
                "click #PrevSP": "goPrevPile",
                "touchend #PrevSP": "goPrevPile",
                "mouseup #PrevSP": "goPrevPile",
                "click #NextSP": "goNextPile",
                "touchend #NextSP": "goNextPile",
                "mouseup #NextSP": "goNextPile",
                "click #Undo": "UndoClick",
                "click #More": "toggleMoreMenu",
                "click #Placeholder": "togglePlaceholder",
                "click #Phrase": "togglePhrase",
                "click #Retranslation": "toggleRetranslation",
                "click #mnuPlaceholder": "togglePlaceholder",
                "click #mnuPhrase": "togglePhrase",
                "click #mnuRetranslation": "toggleRetranslation",
                "click #help": "onHelp"
            },
            UndoClick: function (event) {
                console.log("UndoClick: entry");
                // dismiss the More (...) menu if visible
                // dismiss the More (...) menu if visible
                if ($("#MoreActionsMenu").hasClass("show")) {
                    $("#MoreActionsMenu").toggleClass("show");
                }
                // just pass this along to the list view
                this.listView.onUndo(event);
                // do not bubble this event up to the title bar
                event.stopPropagation();
            },
            // go to the previous target field, marking the current field as dirty so that it gets saved
            goPrevPile: function (event) {
                // do not bubble this event up to the title bar
                event.stopPropagation();
                // make sure we're on the right event for the right platform
                if (navigator.notification) {
                    // on mobile device
                    if (event.type === "click" && device.platform === "iOS") {
                        console.log("iOS click -- ignoring");
                        return;
                    }
                    if ((event.type === "mouseup" || event.type === "touchend") && device.platform === "Android") {
                        console.log("Android mouse/touch end event -- ignoring");
                        return;
                    }
                } else {
                    // in browser
                    if (event.type === "mouseup" || event.type === "touchend") {
                        console.log("Browser mouse / touch end event -- ignoring");
                        return;
                    }
                }
                console.log("goPrevPile: selectedStart = " + selectedStart);
                // dismiss the More (...) menu if visible
                if ($("#MoreActionsMenu").hasClass("show")) {
                    $("#MoreActionsMenu").toggleClass("show");
                }
                if (selectedStart !== null) {
                    isDirty = true;
                    MovingDir = -1; // backwards
                    this.listView.moveCursor(event, false);
                }
                // do not bubble this event up to the title bar
//                event.stopPropagation();
            },
            // go to the next target field, marking the current field as dirty so that it gets saved
            goNextPile: function (event) {
                // do not bubble this event up to the title bar
                event.stopPropagation();
                // make sure we're on the right event for the right platform
                if (navigator.notification) {
                    // on mobile device
                    if (event.type === "click" && device.platform === "iOS") {
                        console.log("iOS click -- ignoring");
                        return;
                    }
                    if ((event.type === "mouseup" || event.type === "touchend") && device.platform === "Android") {
                        console.log("Android mouse/touch end event -- ignoring");
                        return;
                    }
                } else {
                    // in browser
                    if (event.type === "mouseup" || event.type === "touchend") {
                        console.log("Browser mouse / touch end event -- ignoring");
                        return;
                    }
                }
                console.log("goNextPile: selectedStart = " + selectedStart);
                // dismiss the More (...) menu if visible
                if ($("#MoreActionsMenu").hasClass("show")) {
                    $("#MoreActionsMenu").toggleClass("show");
                }
                if (selectedStart !== null) {
                    isDirty = true;
                    MovingDir = 1; // forwards
                    this.listView.moveCursor(event, true);
                }
                // do not bubble this event up to the title bar
//                event.stopPropagation();
            },
            // More (...) menu toggle
            toggleMoreMenu: function (event) {
                $("#MoreActionsMenu").toggleClass("show");
                // do not bubble this event up to the title bar
                event.stopPropagation();
            },
            // For the placeholders, etc., just pass the event handler down to the list view to handle
            togglePlaceholder: function (event) {
                // dismiss the More (...) menu if visible
                if ($("#MoreActionsMenu").hasClass("show")) {
                    $("#MoreActionsMenu").toggleClass("show");
                }
                this.listView.togglePlaceholder(event);
                // do not bubble this event up to the title bar
                event.stopPropagation();
            },
            togglePhrase: function (event) {
                // dismiss the More (...) menu if visible
                if ($("#MoreActionsMenu").hasClass("show")) {
                    $("#MoreActionsMenu").toggleClass("show");
                }
                this.listView.togglePhrase(event);
                // do not bubble this event up to the title bar
                event.stopPropagation();
            },
            toggleRetranslation: function (event) {
                // dismiss the More (...) menu if visible
                if ($("#MoreActionsMenu").hasClass("show")) {
                    $("#MoreActionsMenu").toggleClass("show");
                }
                this.listView.toggleRetranslation(event);
                // do not bubble this event up to the title bar
                event.stopPropagation();
            },
            // User clicked away from
            unselectPiles: function (event) {
                // dismiss the More (...) menu if visible
                if ($("#MoreActionsMenu").hasClass("show")) {
                    $("#MoreActionsMenu").toggleClass("show");
                }
                // only do this if we're in a blank area of the screen
                if (!($(event.toElement).hasClass('strip') || $(event.toElement).hasClass('pile') || $(event.toElement).hasClass('marker') || $(event.toElement).hasClass('source') || $(event.toElement).hasClass('target'))) {
                    console.log("UnselectPiles: clicked in a blank area; removing selection");
                    if (selectedStart !== null) {
                        $("div").removeClass("ui-selecting ui-selected ui-longSelecting");
                        $("#Placeholder").prop('disabled', true);
                        $("#Retranslation").prop('disabled', true);
                        $("#Phrase").prop('disabled', true);
                        $("#mnuPlaceholder").prop('disabled', true);
                        $("#mnuRetranslation").prop('disabled', true);
                        $("#mnuPhrase").prop('disabled', true);
                    }
                    selectedStart = null; // clear selection itself
                    LongPressSectionStart = null;
                    isLongPressSelection = false;
                }
            },
            // Help button handler for the adaptation screen. Starts the hopscotch walkthrough to orient the user
            // to the UI elements on this screen.
            onHelp: function (event) {
                // dismiss the More (...) menu if visible
                if ($("#MoreActionsMenu").hasClass("show")) {
                    $("#MoreActionsMenu").toggleClass("show");
                }
                // scroll to the top of the content, just in case
                var firstPileID = $(".pile").first().attr("id");
                $("#content").scrollTop(0);                // do not bubble this event up to the title bar
                lastOffset = 0;
                event.stopPropagation();
                var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                var step1 = [
                    {
                        title: i18next.t('view.hlpttlAdaptPage'),
                        content: i18next.t('view.hlpdscAdaptPage'),
                        target: "title",
                        placement: "bottom",
                        xOffset: "center",
                        onNext: function () {
                            $("#" + firstPileID).addClass("ui-selected");
                        }
                    },
                    {
                        title: i18next.t('view.hlpttlSelectOne'),
                        content: i18next.t('view.hlpdscSelectOne'),
                        target: firstPileID,
                        placement: "bottom"
                    },
                    {
                        title: i18next.t('view.hlpttlUndo'),
                        content: i18next.t('view.hlpdscUndo'),
                        target: "Undo",
                        placement: "bottom"
                    },
                    {
                        title: i18next.t('view.hlpttlSelectMultiple'),
                        content: i18next.t('view.hlpdscSelectMultiple'),
                        target: firstPileID,
                        placement: "bottom",
                        onNext: function () {
                            $("#" + firstPileID).removeClass("ui-selected");
                        }
                    }
                ];
                var stepMoreBtn = [
                    {
                        title: i18next.t('view.hlpttlMore'),
                        content: i18next.t('view.hlpdscMore'),
                        target: "More",
                        placement: "bottom"
                    }
                ];
                var stepToggleBtns = [
                    {
                        title: i18next.t('view.hlpttlPlaceholder'),
                        content: i18next.t('view.hlpdscPlaceholder'),
                        target: "Placeholder",
                        placement: "bottom"
                    },
                    {
                        title: i18next.t('view.hlpttlPhrase'),
                        content: i18next.t('view.hlpdscPhrase'),
                        target: "Phrase",
                        placement: "bottom"
                    },
                    {
                        title: i18next.t('view.hlpttlRetranslation'),
                        content: i18next.t('view.hlpdscRetranslation'),
                        target: "Retranslation",
                        arrowOffset: "center",
                        placement: "bottom"
                    }
                ];
                var stepLastBtns = [
                    {
                        title: i18next.t('view.hlpttlPrevNext'),
                        content: i18next.t('view.hlpdscPrevNext'),
                        target: "PrevSP",
                        placement: "bottom"
                    },
                    {
                        title: i18next.t('view.hlpttlBack'),
                        content: i18next.t('view.hlpdscBack'),
                        target: "back",
                        placement: "bottom"
                    }
                ];
                var theSteps = [];
                if (width < 480) {
                    // More (...) button instead of toggles
                    theSteps = step1.concat(stepMoreBtn, stepLastBtns);
                } else {
                    // Toggle buttons
                    theSteps = step1.concat(stepToggleBtns, stepLastBtns);
                }
                var tour = {
                    id: "hello-hopscotch",
                    i18n: {
                        nextBtn: i18next.t("view.lblNext"),
                        prevBtn: i18next.t("view.lblPrev"),
                        doneBtn: i18next.t("view.lblFinish"),
                        skipBtn: i18next.t("view.lblNext"),
                        closeTooltip: i18next.t("view.lblNext"),
                        stepNums: ["1", "2", "3", "4", "5", "6", "7"]
                    },
                    steps: theSteps,
                    onClose: function () {
                        // make sure the pile gets unselected
                        $("#" + firstPileID).removeClass("ui-selected");
                    },
                    onError: function () {
                        // make sure the pile gets unselected
                        $("#" + firstPileID).removeClass("ui-selected");
                    }
                };
                console.log("onHelp");
                hopscotch.startTour(tour);
            }
        });

    return {
        ChapterView: ChapterView,
        SourcePhraseListView: SourcePhraseListView,
        SourcePhraseView: SourcePhraseView
    };
});
