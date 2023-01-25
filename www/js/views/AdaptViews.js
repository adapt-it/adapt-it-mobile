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
// S10 - Plus actions dropdown menu displayed
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
        tplChapter  = require('text!tpl/Chapter.html'),
        tplLoadingPleaseWait = require('text!tpl/LoadingPleaseWait.html'),
        tplSourcePhraseList = require('text!tpl/SourcePhraseList.html'),
        tplSourcePhrase = require('text!tpl/SourcePhrase.html'),
        theSP       = Handlebars.compile(tplSourcePhrase),
        tplFilters  = require('text!tpl/FilterList.html'),
        theFilters  = Handlebars.compile(tplFilters),
        kblist      = null, // real value passed in constructor
        project     = null, // real value passed in constructor
        chapter     = null, // real value passed in constructor
        USFMMarkers = null,
        selectedStart = null,
        selectedEnd = null,
        lastSelectedFT = null,
        idxStart = null,
        idxEnd = null,
        clearKBInput = false,
        isDirty = false,        // does the target text need to be saved?
        isSelecting = false,    // is the user selecting a pile / range of piles?
        isEditing = false,
        isPHBefore = false,
        isPHAfter = false,
        isPhrase = false,
        isDrafting = true,
        isMergingFromKB = false,
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
        inPreview = false,
        LongPressSectionStart = null,
        longPressTimeout = null,
        lastOffset = 0,
        ONE_SPACE = " ",
        editorModeEnum   = {
            ADAPTING: 1,
            GLOSSING: 2,
            FREE_TRANSLATING: 3

        },
        editorMode = editorModeEnum.ADAPTING, // initial value (adapting)
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
            
            console.log("scrollToView() looking at element: " + $(element).attr("id"));
            console.log("-- Currently chapter position = " + $(".chapter").css("position"));
            // if we're scrolling to show the possible KB entries, add some space for the drop-down
            if (isSelectingKB === true) {
                eltBottom += 36; // guess 2 entries
            }
            // EDB BUGBUG: keyboard plugin doesn't return correct isVisible() value on WKWebView
            
            // // check to see if we're on a mobile device
            // if (device.platform === "iOS" && !Keyboard.isVisible) {
            //     // on mobile device AND the keyboard hasn't displayed yet:
            //     // the viewport height is going to shrink when the software keyboard displays
            //     // HACK: subtract the software keyboard from the visible area end -
            //     // We can only get the keyboard height programmatically on ios, using the keyboard plugin's
            //     // keyboardHeightWillChange event. Ugh. Fudge it here until we can come up with something that can
            //     // work cross-platform
            //     console.log("Adjusting docViewBottom - original value: " + docViewBottom);
            //     if (window.orientation === 90 || window.orientation === -90) {
            //         // landscape
            //         docViewHeight -= 162; // observed / hard-coded "best effort" value
            //     } else {
            //         // portrait
            //         docViewHeight -= 248; // observed / hard-coded "best effort" value
            //     }
            // }
            // now calculate docViewBottom
            docViewBottom = docViewTop + docViewHeight;
            console.log("- eltBottom: " + eltBottom + ", docViewHeight: " + docViewHeight + ", docViewBottom: " + docViewBottom);
            console.log("- eltTop: " + eltTop + ", docViewTop: " + docViewTop);
            // now check to see if the content needs scrolling
            if ((eltBottom > docViewBottom) || (eltTop < docViewTop)) {
                 // Not in view -- scroll to the element
                if (($(element).height() * 2) < docViewHeight) {
                    // more than 2 rows available in viewport -- center it
                    console.log("More than two rows visible -- centering focused area");
                    offset = eltTop - (docViewHeight / 2);
                } else {
                    // viewport height is too small -- scroll to element itself
                    console.log("Small viewport -- scrolling to the element itself");
                    offset = eltTop;
                }
                offset = Math.round(offset); // round it to the nearest integer
                console.log("Scrolling to: " + offset);
                $("#content").scrollTop(offset);
                lastOffset = offset;
                docViewTop = $("#content").scrollTop();
                console.log("Content scroll top is now: " + docViewTop);
                return false;
            }
            console.log("No scrolling needed.");
            return true;
        },
    
        // Helper method to store the specified source and target text in the KB.
        saveInKB = function (sourceValue, targetValue, oldTargetValue, projectid, isGloss) {
            var elts = kblist.filter(function (element) {
                return (element.attributes.projectid === projectid &&
                   element.attributes.source === sourceValue && element.attributes.isGloss === isGloss);
            });
            console.log("saveinKB: sourceValue=" + sourceValue + ", targetValue=" + targetValue + ", oldTargetValue=" + oldTargetValue);
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
                            // (negative value means "this refstring has been removed")
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
                            'n': '1',
                            'cDT': timestamp,
                            'df': '0',
                            'wC': ""
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
                var newID = window.Application.generateUUID(),
                    newTU = new kbModels.TargetUnit({
                        tuid: newID,
                        projectid: projectid,
                        source: sourceValue,
                        refstring: [
                            {
                                target: Underscore.unescape(targetValue),  //klb
                                'n': '1',
                                'cDT': timestamp,
                                'df': '0',
                                'wC': ""
                            }
                        ],
                        timestamp: timestamp,
                        user: "",
                        isGloss: isGloss
                    });
                kblist.add(newTU);
                newTU.save();
            }
        },
        // Helper method to remove a target value from the KB. Called from onUndo().
        removeFromKB = function (sourceValue, targetValue, projectid, isGloss) {
            console.log("removeFromKB - sourceValue=" + sourceValue + ", targetValue=" + targetValue + ", projectid=" + projectid);
            var elts = kblist.filter(function (element) {
                return (element.attributes.projectid === projectid &&
                   element.attributes.source === sourceValue && element.attributes.isGloss === isGloss);
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
                        // (negative value means "this refstring has been removed")
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
            // Gloss font (use the same font as target)
            theRule = ".gloss {";
            theRule += "font: " + parseInt(project.get('TargetFontSize'), 10) + "px " + project.get('TargetFont') + "," + "\"Source Sans\", helvetica, arial, sans-serif; ";
            theRule += "}";
            sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
            // Navigation font
            theRule = ".marker {";
            theRule += "font: " + parseInt(project.get('NavigationFontSize'), 10) + "px " + project.get('NavigationFont') + "," + "\"Source Sans\", helvetica, arial, sans-serif; ";
            theRule += "color: " + project.get('NavigationColor') + ";";
            theRule += "}";
            sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)

            // Special Text color
            theRule = "div.specialtext div.source {";
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
                // just need to nuke the newline char
                theRule = ".strip:not(:first-child):before { content: \" \"; }";
                sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
            } else {
                console.log("WrapUSFM -> TRUE");
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
            spSearchList: null,
            allowEditBlankSP: false,
            ShowGlossFT: false,

            template: Handlebars.compile(tplSourcePhraseList),

            initialize: function () {
                // place two calls to render:
                // - one deferred, when we get all the source phrases for the chapter back from the DB 
                // - one right now to say "please wait..."
                this.collection.fetch({reset: true, data: {chapterid: this.options.chapterid}}).done(this.render);
                this.render();
                // AIM 1.6.0 - user setting to allow editing blank/empty verses
                if (localStorage.getItem("AllowEditBlankSP")) {
                    this.allowEditBlankSP = (localStorage.getItem("AllowEditBlankSP") === "true");
                } 
                // AIM 1.8.0 - glosses and free translations
                if (localStorage.getItem("ShowGlossFT")) {
                    this.ShowGlossFT = (localStorage.getItem("ShowGlossFT") === "true");
                } 
                // clean up -- if we have a searchList on the application, but this chapter isn't in that searchList,
                // clear out the list
                if (window.Application.searchList !== null) {
                    var cid = this.options.chapterid;
                    var obj = window.Application.searchList.filter(function (elt) {
                        return elt.attributes.chapterid === cid;
                    });
                    if (obj.length === 0) {
                        // search list doesn't contain this chapter -- nuke it
                        window.Application.searchList = null;
                        // also hide the search bar if visible
                        if ($("#SearchBar").hasClass("show")) {
                            $("#SearchBar").removeClass("show");
                        }
                    }
                }
            },
            addOne: function (SourcePhrase) {
//                console.log("SourcePhraseListView::addOne");
                var view = new SourcePhraseView({ model: SourcePhrase});//, el: $('#pile-' + SourcePhrase.get('id')) });
                this.$('#pile-' + SourcePhrase.get('spid')).append(view.render().el.childNodes);
                this.$('#pile-' + SourcePhrase.get('spid')).find('.target').attr('tabindex', idx++);
            },
            render: function () {
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
                    if (project) {
                        if ((window.Application.searchList !== null) && (window.Application.searchList.length > 0)) {
                            // we're searching for a translation -- set the selected SPID to the first hit in this chapter
                            var searchRS = "";
                            project.set('lastAdaptedSPID', window.Application.searchList[window.Application.searchIndex].attributes.spid);
                            // show the search bar
                            if (!($("#SearchBar").hasClass("show-flex"))) {
                                $("#SearchBar").addClass("show-flex");
                                $("#content").addClass("with-search");
                            }
                            if (window.Application.searchIndex === 0) {
                                // can't go back -- disable the back button
                                $("#SearchPrev").prop('disabled', true);
                            }
                            if (window.Application.searchIndex === (window.Application.searchList.length - 1)) {
                                // can't go forward -- disable the next button
                                $("#SearchNext").prop('disabled', true);
                            }
                            searchRS = this.stripPunctuation(this.autoRemoveCaps(window.Application.searchList[window.Application.searchIndex].get("source"), true), true);
                            searchRS += " -> ";
                            searchRS += this.stripPunctuation(this.autoRemoveCaps(window.Application.searchList[window.Application.searchIndex].get("target"), false), false);
                            $("#SearchRS").html(searchRS);
                            $("#SearchIndex").html("(" + (window.Application.searchIndex + 1) + "/" + window.Application.searchList.length + ")");
                        }
                        if (project.get('lastAdaptedSPID').length > 0) {
                            // not searching, but there is a sourcephrase ID from our last session -- select it now
                            isSelecting = true;
                            if ($('#pile-' + project.get('lastAdaptedSPID')).length !== 0) {
                                console.log("render: selecting lastAdaptedSPID:" + project.get('lastAdaptedSPID'));
                                // everything's okay -- select the last adapted SPID
                                selectedStart = $('#pile-' + project.get('lastAdaptedSPID')).get(0);
                                selectedEnd = selectedStart;
                                idxStart = $(selectedStart).index() - 1;
                                idxEnd = idxStart;
                                scrollToView(selectedStart);
                                // select it
                                $(selectedStart).mouseup();
                            } else {
                                // for some reason the last adapted SPID has gotten out of sync --
                                // select the first block instead
                                selectedStart = $(".pile").first().get(0);
                                selectedEnd = selectedStart;
                                idxStart = $(selectedStart).index() - 1;
                                idxEnd = idxStart;
                                if (selectedStart !== null) {
                                    scrollToView(selectedStart);
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
                                scrollToView(selectedStart);
                                $(selectedStart).mouseup();
                            }
                        }
                    }
                    // if there's something selected, enable the show translations menu
                    if (selectedStart !== null) {
                        $("#mnuTranslations").removeClass("menu-disabled");
                        $("#mnuFindRS").removeClass("menu-disabled");
                    }
                    // disable editing blank verses if needed
                    if (this.allowEditBlankSP === false) {
                        $(".nosource").prop('contenteditable', false); // no source -- set target to read-only
                    }
                    // initial state -- hide (don't display) gloss and FT lines in the chapter 
                    $(".gloss").addClass("hide"); // gloss line
                    $(".freetrans").addClass("hide"); // free translation line
                    // hide gloss / free translation lines if needed
                    if (this.ShowGlossFT === false) {
                        // hide edit mode dropdown menu items
                        $("#MoreActionsMenu hr").addClass("hide");
                        $("#mnuAdapting").addClass("hide");
                        $("#mnuGlossing").addClass("hide");
                        $("#mnuFreeTrans").addClass("hide");
                    }
                    // even if the show gloss / FT menu items are on, is the height enough to display the menu?
                    var vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
                    if (vh < 540) {
                        // Device is kinda small;
                        // get rid of the hr elements to add some room
                        if (!$("#MoreActionsMenu hr").hasClass("hide")) {
                            $("#MoreActionsMenu hr").addClass("hide");
                        };
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
            // Helper method to strip any starting / ending punctuation from the source or target field.
            // This method is called from:
            // - selectedAdaptation before the target text available for editing
            // - unselectedAdaptation before the target text is stored in the KB
            // - togglePhrase before the new phrase is stored in the KB
            stripPunctuation: function (content, isSource) {
                var result = content,
                    startIdx = 0,
                    endIdx = content.length;
                // check for empty string
                if (endIdx === 0) {
                    return result;
                }
                if (isSource === false) {
                    // starting index
                    while (startIdx < (content.length - 1) && punctsTarget.indexOf(content.charAt(startIdx)) > -1) {
                        startIdx++;
                    }
                    // ending index
                    while (endIdx > 0 && punctsTarget.indexOf(content.charAt(endIdx - 1)) > -1) {
                        endIdx--;
                    }
                } else {
                    // starting index
                    while (startIdx < (content.length - 1) && punctsSource.indexOf(content.charAt(startIdx)) > -1) {
                        startIdx++;
                    }
                    // ending index
                    while (endIdx > 0 && punctsSource.indexOf(content.charAt(endIdx - 1)) > -1) {
                        endIdx--;
                    }
                }
                // sanity check for all punctuation
                if (endIdx <= startIdx) {
                    return "";
                }
                result = content.substr(startIdx, (endIdx) - startIdx);
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
                    targetIdx = 0,
                    optionsIdx = 0,
                    result = null,
                    source = model.get('source');
                // If we aren't capitalizing for this project, just return the target (unaltered)
                if (project.get('AutoCapitalization') === 'false' || project.get('SourceHasUpperCase') === 'false') {
                    return target;
                }
                // is the first letter capitalized?
                for (i = 0; i < caseSource.length; i++) {
                    if (caseSource[i].charAt(1) === source.charAt(0)) {
                        // uppercase -- convert to uppercase and return the result
                        if (typeof target === 'string') {
                            // single string value -- convert to uppercase
                            for (targetIdx = 0; targetIdx < caseTarget.length; targetIdx++) {
                                if (caseTarget[targetIdx].charAt(0) === target.charAt(0)) {
                                    // found the target char -- build and return the auto-capped string
                                    result = caseTarget[targetIdx].charAt(1) + target.substr(1);
                                    return result;
                                }
                            }
                        } else {
                            // array -- convert each string to uppercase
                            result = new Array(0);
                            for (optionsIdx = 0; optionsIdx < target.length; optionsIdx++) {
                                for (targetIdx = 0; targetIdx < caseTarget.length; targetIdx++) {
                                    if (caseTarget[targetIdx].charAt(0) === target[optionsIdx].charAt(0)) {
                                        // found the target char -- build the auto-capped string and place in the
                                        // result array
                                        result.push(caseTarget[targetIdx].charAt(1) + target[optionsIdx].substr(1));
                                    }
                                }
                            }
                            return result;
                        }
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
            // Params: key -- lookup key for the KB
            findInKB: function (key, isGloss) {
                var result = null;
                try {
                    // we're looking for an exact match ONLY
                    result = kblist.findWhere([{'source': key}, {'isGloss': isGloss}]); 
                    if (typeof result === 'undefined') {
                        return null;
                    }
                } catch (err) {
                    console.log(err);
                }
                return result;
            },
            // helper method to check for a possible partial phrase match in the KB
            // Params: key -- single pile to check for a possible partial match (e.g., the first word in a phrase that's in the KB)
            possibleKBPhrase: function (key, isGloss) {
                var aryFilter = null;
                aryFilter = kblist.filter(function (element) {
                    return ((element.attributes.isGloss === isGloss) && (element.attributes.source.indexOf(key + ONE_SPACE) !== -1)) ? true : false;
                });
                return (aryFilter.length !== 0);
            },
            // Helper method to start with the specified source phrase ID and build the biggest "phrase" with an entry in the KB
            // Params: model -- first phrase to start the search (corresponds to selectedStart when merging)
            // Returns: last source phrase (corresponds to selectedEnd when merging)
            findLargestPhrase: function (pile, isGloss) {
                var sourceText = "",
                    tu = "",
                    exactMatch = pile,
                    thisObj = pile,
                    tmpStr = "",
                    nextObj = pile;
                // find the source
                console.log("findLargestPhrase: entry");
                sourceText = $(pile).children('.source').html();
                // initial values
                idxStart = $(pile).index();
                idxEnd = idxStart;
                // run until we hit the end of the strip OR we don't match anything
                while (tu !== null && nextObj !== null) {
                    // move to the next pile and append the source
                    nextObj = thisObj.nextElementSibling;
                    if (nextObj !== null) {
                        tmpStr = sourceText + ONE_SPACE + $(nextObj).children(".source").html();
                        sourceText = this.stripPunctuation(this.autoRemoveCaps(tmpStr, true), true);
                        // is there a match for this phrase?
                        tu = kblist.filter(function (element) {
                            return ((element.attributes.source.indexOf(sourceText) !== -1) && (element.attributes.isGloss === isGloss)) ? true : false;
                        });
                        if (tu.length > 0) {
                            // we did a "fuzzy" match (i.e., indexOf) and got some results. Is this an exact match of a KB entry?
                            if ((kblist.findWhere([{'source': sourceText}, {'isGloss': isGloss}]) !== 'undefined')) {
                                // this is an exact match -- move the indices and see if we can get a bigger phrase
                                exactMatch = nextObj;
                                idxEnd = $(nextObj).index();
                            }
                            // even if our exact match test failed, we got a partial match earlier -- so it's possible that
                            // there'a bigger phrase that matches. Keep appending piles...
                            thisObj = nextObj;
                        } else {
                            break;
                        }
                    }
                }
                // return our last known "good" ID (possibly our first ID if we didn't find anything)
                return exactMatch;
            },
            // Helper method to move the editing cursor forwards or backwards one pile until we hit another empty
            // slot that requires attention. This is our S8 / auto-insertion procedure. 
            // ADAPTING OUTCOMES:
            // - next source phrase has exactly 1 possible translation in the KB -> auto-insert and continue moving
            // - next source phrase is already translataed (i.e., has something in the target field) -> skip and continue
            //   moving
            // - next source phrase has no possible translation -> suggest the source and stop here
            // - next source phrase has more than one possible translation -> show a drop-down menu (that also allows
            //   for a new translation) and stop here
            // GLOSSING OUTCOMES:
            // - similar to adapting (above), except looking at the sourcephrase.gloss and storing / retrieving from the gloss KB
            // FREE TRANSLATION OUTCOMES:
            // - next source phrase is empty -> selection goes from the end of the current selection _to the end of the strip_ OR
            //   (to the next source phrase with a FT set - 1). Select this set of source phrases.
            //   No auto-insert is done, and no suggestion is placed in the text area.
            // - next source phrase has a free translation already -> show it in the text area. Do the same selection as above
            //   (select to end of strip or (next SP with a FT set - 1))
            moveCursor: function (event, moveForward) {
                var next_edit = null;
                var temp_cursor = null;
                var keep_going = true;
                var FTEmpty = true;
                var top = 0;
                console.log("moveCursor");
                event.stopPropagation();
                event.preventDefault();
                // unselect the current edit field before moving
                $(event.currentTarget).blur();
                if (moveForward === false) {
                    // *** move backwards
                    if ((selectedStart.previousElementSibling !== null) && ($(selectedStart.previousElementSibling).hasClass('pile')) && (!$(selectedStart.previousElementSibling).hasClass('filter'))) {
                        // there is a previous sibling, and it is a non-filtered pile
                        next_edit = selectedStart.previousElementSibling;
                    } else {
                        // No previous sibling OR we've reached something we need to skip:
                        // - a filter
                        // - a header (chapter or verse)
                        // - a strip marker
                        // try skipping this item to see if we can find a "real" pile to move to
                        if (selectedStart.previousElementSibling !== null) {
                            temp_cursor = selectedStart.previousElementSibling;
                            // handle filtered strips and strip header elements
                            if (($(temp_cursor).hasClass("filter")) || ($(temp_cursor).hasClass("strip-header")) || ($(temp_cursor).hasClass("strip"))) {
                                // continue on to the previous item that ISN'T a strip header or filtered out of the UI
                                while (temp_cursor && keep_going === true) {
                                    temp_cursor = temp_cursor.previousElementSibling; // backwards one more strip
                                    console.log("movecursor: looking at item: " + $(temp_cursor).attr('id'));
                                    if (temp_cursor && ($(temp_cursor).hasClass("filter") === false) && ($(temp_cursor).hasClass("pile"))) {
                                        // found a stopping point
                                        console.log("found stopping point: " + $(temp_cursor).attr('id'));
                                        keep_going = false;
                                    }
                                }
                            }
                            if (temp_cursor) {
                                next_edit = temp_cursor;
                            } else {
                                next_edit = null;
                                console.log("reached first pile.");
                            }
                        } else {
                            next_edit = null;
                            console.log("reached first pile.");
                        }
                    }
                    if ((editorMode === editorModeEnum.FREE_TRANSLATING) && (next_edit !== null)) {
                        selectedEnd = lastSelectedFT = next_edit; // free translation -- lastSelectedFT is the END of the selection
                        temp_cursor = next_edit;
                        // keep going backwards until we hit punctuation, the first pile, or a free translation
                        keep_going = true;
                        // first, check for a FT at the selectedStart
                        var ft = $(next_edit).find(".ft").html();
                        if (ft.length > 0) {
                            // no need to continue backwards; there's a FT here
                            FTEmpty = false;
                            console.log("moveCursor (backwards) - not empty / stopping; FT at selection: " + ft);
                            keep_going = false;
                        }
                        while (keep_going === true) {
                            // move backwards
                            if (temp_cursor !== null) {
                                next_edit = temp_cursor;
                                if ((next_edit.previousElementSibling !== null) && ($(next_edit.previousElementSibling).hasClass('pile')) && (!$(next_edit.previousElementSibling).hasClass('filter'))) {
                                    // there is a previous sibling, and it is a non-filtered pile
                                    temp_cursor = next_edit.previousElementSibling;
                                    // does it have a free translation?
                                    var ft = $(temp_cursor).find(".ft").html();
                                    if (ft.length > 0) {
                                        // this is our beginning -- stop moving back
                                        FTEmpty = false; // this has a free translation defined
                                        next_edit = temp_cursor; // the FT is the beginning of the selection
                                        console.log("moveCursor (backwards) - stop on FT: " + ft);
                                        keep_going = false;
                                    }
                                } else {
                                    // reached a stopping point
                                    keep_going = false;
                                }
                            } else {
                                // no temp_cursor -- stop backing up
                                keep_going = false;
                            }
                        }
                        // set selectedStart to next_edit
                        selectedStart = next_edit;
                    }
                } else {
                    // *** move forwards
                    if (editorMode === editorModeEnum.FREE_TRANSLATING) {
                        selectedStart = lastSelectedFT; // move from the end (not the start) of the selection
                    }
                    if ((selectedStart.nextElementSibling !== null) && ($(selectedStart.nextElementSibling).hasClass('pile')) && (!$(selectedStart.nextElementSibling).hasClass('filter'))) {
                        // there is a next element (not a strip header is assumed -- strip headers will always be the first child)
                        next_edit = selectedStart.nextElementSibling;
                    } else {
                        // no next sibling in this strip -- see if you can go to the next strip
                        if (selectedStart.nextElementSibling !== null) {
                            temp_cursor = selectedStart.nextElementSibling;
                            // handle filtered strips and strip header elements
                            if (($(temp_cursor).hasClass("filter")) || ($(temp_cursor).hasClass("strip-header")) || ($(temp_cursor).hasClass("strip"))) {
                                // continue on to the next strip that ISN'T filtered out of the UI
                                while (temp_cursor && keep_going === true) {
                                    temp_cursor = temp_cursor.nextElementSibling; // forward one more strip
                                    console.log("movecursor: looking at item: " + $(temp_cursor).attr('id'));
                                    if (temp_cursor && ($(temp_cursor).hasClass("filter") === false) && ($(temp_cursor).hasClass("pile"))) {
                                        // found a stopping point
                                        console.log("found stopping point: " + $(temp_cursor).attr('id'));
                                        keep_going = false;
                                    }
                                }
                            }
                            if (temp_cursor) {
                                // found a strip that doesn't have a filter -- select the first pile
                                // (note that this will also skip the strip header div, which is what we want)
                                next_edit = temp_cursor;
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
                            var nextChapter = "";
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
                                if (nextChapter.length > 0) {
                                    navigator.notification.confirm(
                                        i18next.t('view.dscAdaptContinue', {chapter: chapter.get('name')}),
                                        function (buttonIndex) {
                                            if (buttonIndex === 1) {
                                                // Next chapter
                                                // update the URL, but replace the history (so we go back to the welcome screen)
                                                window.Application.router.navigate("adapt/" + nextChapter, {trigger: true, replace: true});

                                            } else {
                                                // exit
                                                // save the model
                                                chapter.trigger('change');
                                                // head back to the home page
                                                window.Application.home();
                                            }
                                        },
                                        i18next.t('view.ttlMain'),
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
                    if ((editorMode === editorModeEnum.FREE_TRANSLATING) && (next_edit !== null)) {
                        // in FT mode, we need to also find the end of the selection
                        selectedStart = selectedEnd = lastSelectedFT = temp_cursor = next_edit; // initial value
                        // first, find out whether the start of our selection has a free translation defined
                        var ft = $(next_edit).find(".ft").html();
                        if (ft.length > 0) {
                            FTEmpty = false;
                            console.log("moveCursor (forwards) - not empty; FT at selection: " + ft);
                        }
                        // now find the end of the selection
                        keep_going = true;
                        while (keep_going === true) {
                            // move forwards
                            if (temp_cursor !== null) {
                                next_edit = temp_cursor;
                                if ((next_edit.nextElementSibling !== null) && ($(next_edit.nextElementSibling).hasClass('pile')) && (!$(next_edit.nextElementSibling).hasClass('filter'))) {
                                    // there is a next sibling, and it is a non-filtered pile
                                    temp_cursor = next_edit.nextElementSibling;
                                    // does it have a free translation?
                                    var ft = $(temp_cursor).find(".ft").html();
                                    if (ft.length > 0) {
                                        // found the next free translation -- stop moving forward
                                        console.log("moveCursor (forwards) - stopping BEFORE next FT: " + ft);
                                        keep_going = false;
                                    }
                                } else {
                                    // reached a stopping point
                                    keep_going = false;
                                }
                            } else {
                                // no temp_cursor -- stop backing up
                                keep_going = false;
                            }
                        }
                        // Set selectedEnd and lastSelectedFT to the end of the selection
                        selectedEnd = lastSelectedFT = next_edit;
                    }
                }
                if (next_edit) {
                    // simulate a click on the next edit field
                    console.log("next edit: " + next_edit.id);
                    if (editorMode === editorModeEnum.ADAPTING) {
                        // adapting
                        selectedEnd = selectedStart = next_edit;
                        $(next_edit).find(".target").focus();
                        $(next_edit).find(".target").mouseup();    
                    } else if (editorMode === editorModeEnum.GLOSSING) {
                        // glossing
                        selectedEnd = selectedStart = next_edit;
                        $(next_edit).find(".gloss").focus();
                        $(next_edit).find(".gloss").mouseup();    
                    } else {
                        // free translation
                        // set focus on the FT text area
                        $("#fteditor").focus();
                        $("#fteditor").mouseup();
                    }
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
                if (selectedStart !== null) {
                    $("#mnuTranslations").removeClass("menu-disabled");
                    $("#mnuFindRS").removeClass("menu-disabled");
                }
            },
            // Helper method to clear out the selection and disable the toolbar buttons 
            // (Move to S1 in our state machine)
            clearSelection: function () {
                selectedStart = selectedEnd = null;
                idxStart = idxEnd = null;
                isSelecting = false;
                isPHBefore = false,
                isPHAfter = false,
                isPhrase = false;
                isRetranslation = false;
                LongPressSectionStart = null;
                isLongPressSelection = false;

                $("div").removeClass("ui-selecting ui-selected ui-longSelecting");
                $("#phBefore").prop('disabled', true);
                $("#phAfter").prop('disabled', true);
                $("#Retranslation").prop('disabled', true);
                $("#Phrase").prop('disabled', true);
                $("#mnuPHBefore").prop('disabled', true);
                $("#mnuPHAfter").prop('disabled', true);
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
                "blur .target": "unselectedAdaptation",
                "mousedown .gloss": "selectingGloss",
                "touchstart .gloss": "selectingGloss",
                "mouseup .gloss": "selectedGloss",
                "touchend .gloss": "selectedGloss",
                "keydown .gloss": "editGloss",
                "blur .gloss": "unselectedGloss"
            },
            
            // user is starting to select one or more piles
            selectingPilesStart: function (event) {
                // ignore event if we're in preview mode
                if (inPreview === true) {
                    return;
                }
                console.log("selectingPilesStart: " + $(event.currentTarget).attr('id'));
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
                // don't bubble this event
                event.stopPropagation();
                event.preventDefault();
                // typeahead menu selection -- we'll address it in the mouse / touch end event;
                // make sure the long press timeout gets cleared, and then get out
                if (isSelectingKB === true) {
                    // clear the long press timeout -- we're selecting a menu item
                    clearTimeout(longPressTimeout);
                    return; // get out
                }
                // if there was an old selection, remove it
                if ((selectedStart !== null) && (isEditing === true)) {
                    console.log("old selection -- need to blur");
                    $("div").removeClass("ui-selecting ui-selected");
                    if (editorMode === editorModeEnum.ADAPTING) {
                        $(selectedStart).find(".target").blur(); // also triggers a save on the old target field
                    } else if (editorMode === editorModeEnum.GLOSSING) {
                        $(selectedStart).find(".gloss").blur(); // also triggers a save on the old gloss field
                    } else {
                        $(selectedStart).find("#fteditor").blur(); // also triggers a save on the old free translation field
                    }
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
                if ($("#mnuTranslations").hasClass("menu-disabled")) {
                    $("#mnuTranslations").removeClass("menu-disabled");
                }
                if ($("#mnuFindRS").hasClass("menu-disabled")) {
                    $("#mnuFindRS").removeClass("menu-disabled");
                }
            },
            // user is starting to select one or more piles
            selectingPilesMove: function (event) {
                var stopAtBoundaries = false,
                    tmpNode = null,
                    done = false;
                // ignore event if we're in preview mode
                if (inPreview === true) {
                    return;
                }
                if (isRetranslation === true) {
                    return; // cannot select other items
                }
                event.stopPropagation();
                event.preventDefault();
                var tmpEnd = null;
                if (event.type === "touchmove") {
                    var touch = event.originalEvent.changedTouches[0]; // interested in current position, not original touch target
                    tmpEnd = document.elementFromPoint(touch.pageX, touch.pageY); // pile (parent)
                    if (!$(tmpEnd).hasClass("pile")) {
                        // select the parent node
                        tmpNode = tmpEnd.parentElement;
                        tmpEnd = tmpNode;
                    }
                    event.preventDefault();
                } else {
                    // mouse (web app)
                    tmpEnd = event.currentTarget; // pile
                }
                // Adjust selectedStart and selectedEnd as appropriate (accounting for boundaries, etc.)
                if (isSelecting === true) {
                    if (selectedStart === null) {
                        console.log("selectingPilesMove: isSslecting=true, but there's no selectedStart -- resetting isSelecting to FALSE");
                        isSelecting = false;
                        return;
                    }
                    if (tmpEnd === selectedEnd) {
                        // haven't moved selection since the last time -- exit out
                        return;
                    }
                    console.log("selectingPilesMove -- finding new selectedEnd");
                    idxEnd = $(tmpEnd).index();
                    if ((!localStorage.getItem("StopAtBoundaries")) || (localStorage.getItem("StopAtBoundaries") === "true")) {
                        stopAtBoundaries = true;
                    }
                    // remove the old selection
                    $(event.currentTarget.parentElement.childNodes).removeClass("ui-selecting");
                    if (idxStart === $(tmpEnd).index()) {
                        // one item selected -- easy peasy
                        selectedEnd = tmpEnd;
                        $(tmpEnd).addClass("ui-selecting");
                    } else if (idxStart < $(tmpEnd).index()) {
                        // go forward 
                        console.log("selectingPilesMove: go forward");
                        tmpNode = selectedEnd = selectedStart; // start at selectedStart
                        $(selectedEnd).addClass("ui-selecting");
                        if ((stopAtBoundaries === true) && ($(selectedEnd).children(".source").first().hasClass("fp"))) {
                            done = true; // edge case -- current node is a boundary
                        }
                        while (!done) {
                            tmpNode = selectedEnd.nextElementSibling;
                            if ($(tmpNode).index() === $(tmpEnd).index()) {
                                done = true; // reached the end -- fall through and possibly update selectedEnd, then exit the loop
                            }
                            if (tmpNode && ($(tmpNode).hasClass("pile")) && ($(tmpNode).hasClass("filter") === false) &&
                                    ($(tmpNode).hasClass("moreFilter") === false)) {
                                // if we're stopping at boundaries, we have one more check... punctuation
                                if (stopAtBoundaries === true) {
                                    // check punctuation (go from the inside out)
                                    if ($(tmpNode).children(".source").first().hasClass("pp")) {
                                        // comes before -- don't include
                                        done = true;
                                    } else if ($(tmpNode).children(".source").first().hasClass("fp")) {
                                        // comes after -- include
                                        selectedEnd = tmpNode;
                                        $(selectedEnd).addClass("ui-selecting");
                                        done = true;
                                    } else {
                                        // no punctuation
                                        selectedEnd = tmpNode;
                                        $(selectedEnd).addClass("ui-selecting");
                                    }
                                } else {
                                    // don't care about boundaries -- update selectedEnd
                                    selectedEnd = tmpNode;
                                    $(selectedEnd).addClass("ui-selecting");
                                }
                            } else {
                                done = true; // exit    
                            }
                        }
                        // update idxEnd
                        idxEnd = $(selectedEnd).index();
                    } else {
                        // go backwards 
                        console.log("selectingPilesMove: go backward");
                        tmpNode = selectedEnd = selectedStart; // start at selectedStart
                        $(selectedEnd).addClass("ui-selecting");
                        while (!done) {
                            tmpNode = selectedEnd.previousElementSibling;
                            if ($(tmpNode).index() === $(tmpEnd).index()) {
                                done = true; // reached the end -- fall through and possibly update selectedEnd, then exit the loop
                            }
                            if (tmpNode && ($(tmpNode).hasClass("pile")) && ($(tmpNode).hasClass("filter") === false) &&
                                    ($(tmpNode).hasClass("moreFilter") === false)) {
                                // if we're stopping at boundaries, we have one more check... punctuation
                                if (stopAtBoundaries === true) {
                                    // check punctuation (go from the inside out)
                                    if ($(tmpNode).children(".source").first().hasClass("fp")) {
                                        // comes after -- don't include
                                        done = true;
                                    } else if ($(tmpNode).children(".source").first().hasClass("pp")) {
                                        // comes after -- include
                                        selectedEnd = tmpNode;
                                        $(selectedEnd).addClass("ui-selecting");
                                        done = true;
                                    } else {
                                        // no punctuation
                                        selectedEnd = tmpNode;
                                        $(selectedEnd).addClass("ui-selecting");
                                    }
                                } else {
                                    // don't care about boundaries -- update selectedStart
                                    selectedEnd = tmpNode;
                                    $(selectedEnd).addClass("ui-selecting");
                                }
                            } else {
                                done = true; // exit    
                            }
                        }
                        // update idxEnd
                        idxEnd = $(selectedEnd).index();
                    }
                    //console.log("selectedEnd: " + selectedEnd.id);
                }
            },
            // user double-tapped on the Pile element -- select the entire strip
            onDblTapPile: function (event) {
                // ignore event if we're in preview mode
                var done = false,
                    stopAtBoundaries = false,
                    tmpNode = null;
                if (inPreview === true) {
                    return;
                }
                console.log("onDblTapPile");
                if ((!localStorage.getItem("StopAtBoundaries")) || (localStorage.getItem("StopAtBoundaries") === "true")) {
                    stopAtBoundaries = true;
                }
                // start out at the current location
                tmpNode = selectedStart = selectedEnd = event.currentTarget;
                // move back / forward until we hit a non-pile class OR filter data OR punctuation (if stopping at boundaries)
                while (!done) {
                    tmpNode = selectedStart.previousElementSibling;
                    if (tmpNode && ($(tmpNode).hasClass("pile")) && ($(tmpNode).hasClass("filter") === false) &&
                            ($(tmpNode).hasClass("moreFilter") === false)) {
                        // if we're stopping at boundaries, we have one more check... punctuation
                        if (stopAtBoundaries === true) {
                            // check punctuation (go from the inside out)
                            if ($(tmpNode).children(".source").first().hasClass("fp")) {
                                // comes after -- don't include
                                done = true;
                            } else if ($(tmpNode).children(".source").first().hasClass("pp")) {
                                // comes after -- include
                                selectedStart = tmpNode;
                                done = true;
                            } else {
                                // no punctuation
                                selectedStart = tmpNode;
                            }
                        } else {
                            // don't care about boundaries -- update selectedStart
                            selectedStart = tmpNode;
                        }
                    } else {
                        done = true; // exit    
                    }
                }
                // now go forward
                done = false;
                if ((stopAtBoundaries === true) && ($(selectedEnd).children(".source").first().hasClass("fp"))) {
                    done = true; // edge case -- current node is a boundary
                }
                while (!done) {
                    tmpNode = selectedEnd.nextElementSibling;
                    if (tmpNode && ($(tmpNode).hasClass("pile")) && ($(tmpNode).hasClass("filter") === false) &&
                            ($(tmpNode).hasClass("moreFilter") === false)) {
                        // if we're stopping at boundaries, we have one more check... punctuation
                        if (stopAtBoundaries === true) {
                            // check punctuation (go from the inside out)
                            if ($(tmpNode).children(".source").first().hasClass("pp")) {
                                // comes before -- don't include
                                done = true;
                            } else if ($(tmpNode).children(".source").first().hasClass("fp")) {
                                // comes after -- include
                                selectedEnd = tmpNode;
                                done = true;
                            } else {
                                // no punctuation
                                selectedEnd = tmpNode;
                            }
                        } else {
                            // don't care about boundaries -- update selectedEnd
                            selectedEnd = tmpNode;
                        }
                    } else {
                        done = true; // exit    
                    }
                }
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
                // ignore event if we're in preview mode
                if (inPreview === true) {
                    return;
                }
                console.log("selectingPilesEnd: " + $(event.currentTarget).attr('id'));
                clearTimeout(longPressTimeout); // don't need to wait for the long press here
                // re-add the contenteditable fields
                console.log("touches:" + event.touches + ", targetTouches: " + event.targetTouches + ", changedTouches: " + event.changedTouches);
                var tmpItem = null,
                    tmpNode = null,
                    done = false,
                    stopAtBoundaries = false,
                    tmpIdx = 0,
                    now = 0,
                    delay = 0,
                    strStartID = "",
                    strEndID = "",
                    spid = "";
                // prevent weird edit menu appearances (long click)
                event.preventDefault();
                event.stopPropagation();
                // typeahead menu selection -- handle it here, and then get out
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
                    if (editorMode === editorModeEnum.ADAPTING) {
                        // adapting
                        $(event.currentTarget).find(".target").typeahead('destroy');
                        $(event.currentTarget).find(".target").html(theSelection);
                    } else if (editorMode === editorModeEnum.GLOSSING) {
                        // glossing
                        $(event.currentTarget).find(".gloss").typeahead('destroy');
                        $(event.currentTarget).find(".gloss").html(theSelection);    
                    } else {
                        // free translating
                        console.log("selectingPilesEnd: weird state / KB selection in FT mode");
                    }
                    $("#Undo").prop('disabled', false);
                    // clear the long press timeout -- we're selecting a menu item
                    return; // get out
                }
                
                // are we stopping at boundaries?
                if ((!localStorage.getItem("StopAtBoundaries")) || (localStorage.getItem("StopAtBoundaries") === "true")) {
                    stopAtBoundaries = true;
                }
                
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
                    // we're not selecting anything -- just clicking on the filter
                    $("div").removeClass("ui-selecting ui-selected ui-longSelecting");
                    isSelecting = false;
                    return;
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
                            // start out at the current location
                            tmpNode = selectedStart = selectedEnd = event.currentTarget;
                            // move back / forward until we hit a non-pile class OR filter data OR punctuation (if stopping at boundaries)
                            while (!done) {
                                tmpNode = selectedStart.previousElementSibling;
                                if (tmpNode && ($(tmpNode).hasClass("pile")) && ($(tmpNode).hasClass("filter") === false) &&
                                        ($(tmpNode).hasClass("moreFilter") === false)) {
                                    // if we're stopping at boundaries, we have one more check... punctuation
                                    if (stopAtBoundaries === true) {
                                        // check punctuation (go from the inside out)
                                        if ($(tmpNode).children(".source").first().hasClass("fp")) {
                                            // comes after -- don't include
                                            done = true;
                                        } else if ($(tmpNode).children(".source").first().hasClass("pp")) {
                                            // comes after -- include
                                            selectedStart = tmpNode;
                                            done = true;
                                        } else {
                                            // no punctuation
                                            selectedStart = tmpNode;
                                        }
                                    } else {
                                        // don't care about boundaries -- update selectedStart
                                        selectedStart = tmpNode;
                                    }
                                } else {
                                    done = true; // exit    
                                }
                            }
                            // now go forward
                            done = false;
                            if ((stopAtBoundaries === true) && ($(selectedEnd).children(".source").first().hasClass("fp"))) {
                                done = true; // edge case -- current node is a boundary
                            }
                            while (!done) {
                                tmpNode = selectedEnd.nextElementSibling;
                                if (tmpNode && ($(tmpNode).hasClass("pile")) && ($(tmpNode).hasClass("filter") === false) &&
                                        ($(tmpNode).hasClass("moreFilter") === false)) {
                                    // if we're stopping at boundaries, we have one more check... punctuation
                                    if (stopAtBoundaries === true) {
                                        // check punctuation (go from the inside out)
                                        if ($(tmpNode).children(".source").first().hasClass("pp")) {
                                            // comes before -- don't include
                                            done = true;
                                        } else if ($(tmpNode).children(".source").first().hasClass("fp")) {
                                            // comes after -- include
                                            selectedEnd = tmpNode;
                                            done = true;
                                        } else {
                                            // no punctuation
                                            selectedEnd = tmpNode;
                                        }
                                    } else {
                                        // don't care about boundaries -- update selectedEnd
                                        selectedEnd = tmpNode;
                                    }
                                } else {
                                    done = true; // exit    
                                }
                            }
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
                    // modify the ending tap as appropriate
                    if ($(LongPressSectionStart).index() < $(selectedStart).index()) {
                        // go forward
                        tmpNode = selectedEnd = LongPressSectionStart; // start at LongPressSectionStart
                        if ((stopAtBoundaries === true) && ($(selectedEnd).children(".source").first().hasClass("fp"))) {
                            done = true; // edge case -- current node is a boundary
                        }
                        while (!done) {
                            tmpNode = selectedEnd.nextElementSibling;
                            if ($(tmpNode).index() === $(selectedStart).index()) {
                                done = true; // reached the end -- fall through and possibly update selectedEnd, then exit the loop
                            }
                            if (tmpNode && ($(tmpNode).hasClass("pile")) && ($(tmpNode).hasClass("filter") === false) &&
                                    ($(tmpNode).hasClass("moreFilter") === false)) {
                                // if we're stopping at boundaries, we have one more check... punctuation
                                if (stopAtBoundaries === true) {
                                    // check punctuation (go from the inside out)
                                    if ($(tmpNode).children(".source").first().hasClass("pp")) {
                                        // comes before -- don't include
                                        done = true;
                                    } else if ($(tmpNode).children(".source").first().hasClass("fp")) {
                                        // comes after -- include
                                        selectedEnd = tmpNode;
                                        done = true;
                                    } else {
                                        // no punctuation
                                        selectedEnd = tmpNode;
                                    }
                                } else {
                                    // don't care about boundaries -- update selectedEnd
                                    selectedEnd = tmpNode;
                                }
                            } else {
                                done = true; // exit    
                            }
                        }
                        // set selectedStart (selectedEnd is already set)
                        selectedStart = LongPressSectionStart;
                    } else {
                        // go backwards
                        tmpNode = selectedEnd = LongPressSectionStart; // start at LongPressSectionStart
                        while (!done) {
                            tmpNode = selectedEnd.previousElementSibling;
                            if ($(tmpNode).index() === $(selectedStart).index()) {
                                done = true; // reached the end -- fall through and possibly update selectedEnd, then exit the loop
                            }
                            if (tmpNode && ($(tmpNode).hasClass("pile")) && ($(tmpNode).hasClass("filter") === false) &&
                                    ($(tmpNode).hasClass("moreFilter") === false)) {
                                // if we're stopping at boundaries, we have one more check... punctuation
                                if (stopAtBoundaries === true) {
                                    // check punctuation (go from the inside out)
                                    if ($(tmpNode).children(".source").first().hasClass("fp")) {
                                        // comes after -- don't include
                                        done = true;
                                    } else if ($(tmpNode).children(".source").first().hasClass("pp")) {
                                        // comes after -- include
                                        selectedEnd = tmpNode;
                                        done = true;
                                    } else {
                                        // no punctuation
                                        selectedEnd = tmpNode;
                                    }
                                } else {
                                    // don't care about boundaries -- update selectedStart
                                    selectedEnd = tmpNode;
                                }
                            } else {
                                done = true; // exit    
                            }
                        }
                        // now set selectedStart / selectedEnd
                        selectedStart = selectedEnd; // swap vars
                        selectedEnd = LongPressSectionStart;
                    }
                    // done adjusting selectedStart / selectedEnd --
                    // set the index values, etc.
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
                        // update the placeholder/phrase/retranslation buttons IF we're in adapting mode
                        if (editorMode === editorModeEnum.ADAPTING) {
                            // only one item selected -- can only _create_ a placeholder
                            // (user can also _delete_ a phrase / retranslation; we'll re-enable
                            // the button below if they've selected an existing retranslation or phrase
                            $("#Phrase").prop('disabled', true);
                            $("#Retranslation").prop('disabled', true);
                            $("#mnuRetranslation").prop('disabled', true);
                            $("#mnuPhrase").prop('disabled', true);
                        }
                        // set the selection's class to ui-selected
                        $(selectedStart).addClass("ui-selected");
                    } else if (idxStart < idxEnd) {
                        // update the placeholder/phrase/retranslation buttons IF we're in adapting mode
                        if (editorMode === editorModeEnum.ADAPTING) {
                            // more than one item selected -- can create a placeholder, phrase, retrans
                            $("#Phrase").prop('disabled', false);
                            $("#Retranslation").prop('disabled', false);
                            $("#mnuRetranslation").prop('disabled', false);
                            $("#mnuPhrase").prop('disabled', false);
                        }
                        // set the selection's class to ui-selected
                        $(selectedStart.parentElement).children().each(function (index, value) {
                            if (index >= idxStart && index <= idxEnd) {
                                $(value).addClass("ui-selected");
                            }
                        });
                    } else {
                        // update the placeholder/phrase/retranslation buttons IF we're in adapting mode
                        if (editorMode === editorModeEnum.ADAPTING) {
                            // more than one item selected -- can create a placeholder, phrase, retrans
                            $("#Phrase").prop('disabled', false);
                            $("#Retranslation").prop('disabled', false);
                            $("#mnuRetranslation").prop('disabled', false);
                            $("#mnuPhrase").prop('disabled', false);
                        }
                        // set the selection's class to ui-selected
                        $(selectedStart.parentElement).children().each(function (index, value) {
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
                    // update the icons and labels for the placeholder/phrase/retranslation buttons IF we're in adapting mode
                    if (editorMode === editorModeEnum.ADAPTING) {
                        spid = $(selectedStart).attr('id');
                        // did the user select a placeholder (before)?
                        if (spid.indexOf("plc") !== -1) {
                            // placeholder -- can remove it, but not add a new one
                            isPHBefore = true,
                            $("#phBefore").prop('title', i18next.t("view.dscDelPlaceholder"));
                            $("#phBefore .topcoat-icon").removeClass("topcoat-icon--ph-before-new");
                            $("#phBefore .topcoat-icon").addClass("topcoat-icon--ph-before-delete");
                            $("#mnuPHBefore .topcoat-icon").removeClass("topcoat-icon--ph-before-new");
                            $("#mnuPHBefore .topcoat-icon").addClass("topcoat-icon--ph-before-delete");
                        } else {
                            // not a placeholder -- can add a new one
                            isPHBefore = false;
                            $("#phBefore").prop('title', i18next.t("view.dscNewPlaceholder"));
                            $("#phBefore .topcoat-icon").removeClass("topcoat-icon--ph-before-delete");
                            $("#phBefore .topcoat-icon").addClass("topcoat-icon--ph-before-new");
                            $("#mnuPHBefore .topcoat-icon").removeClass("topcoat-icon--ph-before-delete");
                            $("#mnuPHBefore .topcoat-icon").addClass("topcoat-icon--ph-before-new");
                        }
                        // did the user select a placeholder (after)?
                        if (spid.indexOf("pla") !== -1) {
                            // placeholder -- can remove it, but not add a new one
                            isPHAfter = true;
                            $("#phAfter").prop('title', i18next.t("view.dscDelPlaceholder"));
                            $("#phAfter .topcoat-icon").removeClass("topcoat-icon--ph-after-new");
                            $("#phAfter .topcoat-icon").addClass("topcoat-icon--ph-after-delete");
                            $("#mnuPHAfter .topcoat-icon").removeClass("topcoat-icon--ph-after-new");
                            $("#mnuPHAfter .topcoat-icon").addClass("topcoat-icon--ph-after-delete");
                        } else {
                            // not a placeholder -- can add a new one
                            isPHAfter = false;
                            $("#phAfter").prop('title', i18next.t("view.dscNewPlaceholder"));
                            $("#phAfter .topcoat-icon").removeClass("topcoat-icon--ph-after-delete");
                            $("#phAfter .topcoat-icon").addClass("topcoat-icon--ph-after-new");
                            $("#mnuPHAfter .topcoat-icon").removeClass("topcoat-icon--ph-after-delete");
                            $("#mnuPHAfter .topcoat-icon").addClass("topcoat-icon--ph-after-new");
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
                        $("#phBefore").prop('disabled', false);
                        $("#mnuPHBefore").prop('disabled', false);
                        $("#phAfter").prop('disabled', false);
                        $("#mnuPHAfter").prop('disabled', false);
                        event.stopPropagation();
                    } else if (editorMode === editorModeEnum.FREE_TRANSLATING) {
                        // in FT mode, update the 
                    }
                }
                if ($("#mnuTranslations").hasClass("menu-disabled")) {
                    $("#mnuTranslations").removeClass("menu-disabled");
                }
                if ($("#mnuFindRS").hasClass("menu-disabled")) {
                    $("#mnuFindRS").removeClass("menu-disabled");
                }
                
                // EDB 10/26/15 - issue #109 (punt): automatic selection of the first item in a selected group
                // is effecting the selection / deselection in weird ways. Punt on this until a consistent
                // initial selection algorithm can be determined
//                isSelectingFirstPhrase = true;
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
                        filteredText += elt.innerHTML.trim() + ONE_SPACE;
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
                // ignore event if we're in preview mode
                if (inPreview === true) {
                    return;
                }
                // also ignore the event if we're not adapting
                if (editorMode !== editorModeEnum.ADAPTING) {
                    // console.log("oops... pile selection / user mouseup on target, not pile... correcting.");
                    // // trigger a click on the parent (pile) instead
                    // event.stopPropagation();
                    // $(event.parentElement).touchstart();
                    return;
                }
                if (selectedStart !== null) {
                    console.log("selectingAdaptation: old selection -- need to blur");
                    $("div").removeClass("ui-selecting ui-selected");
                    if (editorMode === editorModeEnum.ADAPTING) {
                        $(selectedStart).find(".target").blur(); // also triggers a save on the old target field
                    } else if (editorMode === editorModeEnum.GLOSSING) {
                        $(selectedStart).find(".gloss").blur(); // also triggers a save on the old gloss field
                    } else {
                        $(selectedStart).find("#fteditor").blur(); // also triggers a save on the old free translation field
                    }
                }
                selectedStart = event.currentTarget.parentElement; // pile
                console.log("selectingAdaptation: " + selectedStart.id);
                // do NOT propogate this up to the Pile - the user is clicking in the edit field
                event.stopPropagation();
                event.preventDefault();
            },
            // mouseDown / touchStart event handler for the target field
            selectingGloss: function (event) {
                // ignore event if we're in preview mode
                if (inPreview === true) {
                    return;
                }
                // also ignore the event if we're not glossing
                if (editorMode !== editorModeEnum.GLOSSING) {
                    return;
                }
                if (selectedStart !== null) {
                    console.log("selectingGloss: old selection -- need to blur");
                    $("div").removeClass("ui-selecting ui-selected");
                    $(selectedStart).find(".gloss").blur(); // also triggers a save on the old target field
                }
                selectedStart = event.currentTarget.parentElement; // pile
                console.log("selectingGloss: " + selectedStart.id);
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
                    KBtarget = [],
                    options = [],
                    foundInKB = false;
//                console.log("selectedAdaptation entry / event type:" + event.type);
//                console.log("- scrollTop: " + $("#chapter").scrollTop() + ", offsetTop: " + $("#chapter").offset().top);
                // ignore event if we're in preview mode
                if (inPreview === true) {
                    return;
                }
                // also ignore the event if we're not adapting
                if (editorMode !== editorModeEnum.ADAPTING) {
                    return;
                }
                
                // case where user lifted finger on the target instead of the pile
                if (isSelecting === true || isLongPressSelection === true) {
                    console.log("oops... pile selection / user mouseup on target, not pile... correcting.");
                    // trigger a click on the parent (pile) instead
                    event.stopPropagation();
                    $(event.parentElement).mouseup();
                    return;
                }

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
                project.set('lastAdaptedSPID', selectedStart.id.substr(5));

                // enable prev / next buttons
                $("#PrevSP").prop('disabled', false); // enable toolbar button
                $("#NextSP").prop('disabled', false); // enable toolbar button
                isEditing = true;
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
                    // Auto-merge handling
                    if (isMergingFromKB === true) {
                        // just finished merging -- reset the flag and continue
                        isMergingFromKB = false;
                    } else {
                        // check for a possible KB phrase that needs merging
                        if ((this.possibleKBPhrase(this.autoRemoveCaps(sourceText, true), 0) === true) && (selectedEnd === selectedStart)) {
                            // we have a possible phrase -- see if it's a real one
                            selectedEnd = this.findLargestPhrase(selectedStart, 0);
                            if (selectedEnd !== selectedStart) {
                                isMergingFromKB = true;
                                // found a merge candidate -- merge it
                                this.togglePhrase(event);
                                //$("#Phrase").trigger("click");
                                return; // get out -- we'll come back in once the phrase merge happens
                            }
                        }
                    }
                    tu = this.findInKB(this.autoRemoveCaps(sourceText, true), 0);
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
                            targetText = this.stripPunctuation(this.autoAddCaps(model, refstrings[0].target), false);
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
                            // auto-caps the options
                            KBtarget = this.autoAddCaps(model, options);
                            // create the autocomplete UI
                            console.log("selectedAdaptation: creating typeahead dropdown with " + KBtarget.length + " options: " + KBtarget.toString());
                            $(event.currentTarget).typeahead(
                                {
                                    hint: true,
                                    highlight: true,
                                    minLength: 0
                                },
                                {
                                    name: 'kboptions',
                                    source: function (request, response) {
                                        response(KBtarget);
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
                            if (navigator.notification && Keyboard) {
                                Keyboard.show();
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
                                $(event.currentTarget).html(this.stripPunctuation(sourceText), true);
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
                        origText = this.stripPunctuation($(event.currentTarget).text().trim(), false);
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
                            tu = this.findInKB(this.autoRemoveCaps(sourceText, true), 0);
                            if (tu !== null) {
                                refstrings = tu.get('refstring');
                                // first, make sure these refstrings are actually being used
                                options.length = 0; // clear out any old cruft
                                for (i = 0; i < refstrings.length; i++) {
                                    if (refstrings[i].n > 0) {
                                        options.push(Underscore.unescape(refstrings[i].target));
                                    }
                                }
                                if (options.length > 1) {
                                    KBtarget = this.autoAddCaps(model, options);
                                    // create the autocomplete UI
                                    console.log("selectedAdaptation: creating typeahead dropdown with " + KBtarget.length + " options: " + KBtarget.toString());
                                    $(event.currentTarget).typeahead(
                                        {
                                            hint: true,
                                            highlight: true,
                                            minLength: 0
                                        },
                                        {
                                            name: 'kboptions',
                                            source: function (request, response) {
                                                response(KBtarget);
                                            }
                                        }
                                    );
                                    isSelectingKB = true;
                                } else {
                                    // only one entry -- just clean up the target we'll be editing
                                    $(event.currentTarget).html(origText); // stripped of punctuation
                                }
                            } else {
                                console.log("KB data consistency error: should have a KB entry for source text:" + sourceText);
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
            // mouseUp / touchEnd event handler for the gloss field
            selectedGloss: function (event) {
                var tu = null,
                    i = 0,
                    strID = "",
                    model = null,
                    sourceText = "",
                    targetText = "",
                    refstrings = null,
                    range = null,
                    selection = null,
                    KBtarget = [],
                    options = [],
                    foundInKB = false;
                console.log("selectedGloss entry / event type:" + event.type);
//                console.log("- scrollTop: " + $("#chapter").scrollTop() + ", offsetTop: " + $("#chapter").offset().top);
                // ignore event if we're in preview mode
                if (inPreview === true) {
                    return;
                }
                // also ignore the event if we're not glossing
                if (editorMode !== editorModeEnum.GLOSSING) {
                    return;
                }
                
                // case where user lifted finger on the target instead of the pile
                if (isSelecting === true || isLongPressSelection === true) {
                    console.log("oops... pile selection / user mouseup on target, not pile... correcting.");
                    // trigger a click on the parent (pile) instead
                    event.stopPropagation();
                    $(event.parentElement).mouseup();
                    return;
                }

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
                console.log("selectedStart: " + selectedStart.id);
                // Update lastAdaptedSPID
                project.set('lastAdaptedSPID', selectedStart.id.substr(5));

                // enable prev / next buttons
                $("#PrevSP").prop('disabled', false); // enable toolbar button
                $("#NextSP").prop('disabled', false); // enable toolbar button
                isEditing = true;
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
                    tu = this.findInKB(this.autoRemoveCaps(sourceText, true), 1);
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
                            targetText = this.stripPunctuation(this.autoAddCaps(model, refstrings[0].target), false);
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
                            // auto-caps the options
                            KBtarget = this.autoAddCaps(model, options);
                            // create the autocomplete UI
                            console.log("selectedAdaptation: creating typeahead dropdown with " + KBtarget.length + " options: " + KBtarget.toString());
                            $(event.currentTarget).typeahead(
                                {
                                    hint: true,
                                    highlight: true,
                                    minLength: 0
                                },
                                {
                                    name: 'kboptions',
                                    source: function (request, response) {
                                        response(KBtarget);
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
                            if (navigator.notification && Keyboard) {
                                Keyboard.show();
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
                            console.log("selectedGloss: GLOSS TU not null (" + options.length + " options.) ");
                            // options.length should = 0
                            // if this isn't a phrase, populate the target with the source text as the next best guess
                            // // (if this is a phrase, we just finished an auto-create phrase, and we want a blank field)
                            // if (strID.indexOf("phr") === -1) {
                            //     $(event.currentTarget).html(sourceText);
                            // }
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
                        // Do we want to copy the source over?
                        if (localStorage.getItem("CopySource") && localStorage.getItem("CopySource") === "false") {
                            console.log("No KB entry on an empty field, BUT the user does not want to copy source text: " + sourceText);
                            $(event.currentTarget).html("");
                        } else {
                            // copy the source text
                            $(event.currentTarget).html(this.stripPunctuation(sourceText), true);
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
                        origText = this.stripPunctuation($(event.currentTarget).text().trim(), false);
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
                            tu = this.findInKB(this.autoRemoveCaps(sourceText, true), 1);
                            if (tu !== null) {
                                refstrings = tu.get('refstring');
                                // first, make sure these refstrings are actually being used
                                options.length = 0; // clear out any old cruft
                                for (i = 0; i < refstrings.length; i++) {
                                    if (refstrings[i].n > 0) {
                                        options.push(Underscore.unescape(refstrings[i].target));
                                    }
                                }
                                if (options.length > 1) {
                                    KBtarget = this.autoAddCaps(model, options);
                                    // create the autocomplete UI
                                    console.log("selectedGloss: creating typeahead dropdown with " + KBtarget.length + " options: " + KBtarget.toString());
                                    $(event.currentTarget).typeahead(
                                        {
                                            hint: true,
                                            highlight: true,
                                            minLength: 0
                                        },
                                        {
                                            name: 'kboptions',
                                            source: function (request, response) {
                                                response(KBtarget);
                                            }
                                        }
                                    );
                                    isSelectingKB = true;
                                } else {
                                    // only one entry -- just clean up the target we'll be editing
                                    $(event.currentTarget).html(origText); // stripped of punctuation
                                }
                            } else {
                                console.log("KB data consistency error: should have a KB entry for source text:" + sourceText);
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
//                console.log("selectedGloss exit / isDirty = " + isDirty + ", origText = " + origText);
            },

            // keydown event handler for the target field
            editAdaptation: function (event) {
                var strID = null,
                    model = null;
                // ignore event if we're in preview mode
                if (inPreview === true) {
                    return;
                }
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
            // keydown event handler for the gloss field
            editGloss: function (event) {
                var strID = null,
                    model = null;
                // ignore event if we're in preview mode
                if (inPreview === true) {
                    return;
                }
                console.log("editGloss");
                if (event.keyCode === 27) {
                    // Escape key pressed -- cancel the edit (reset the content) and blur
                    // Note that this key is not on most on-screen keyboards
                    strID = $(event.currentTarget.parentElement).attr('id');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    model = this.collection.findWhere({spid: strID});
                    $(event.currentTarget).html(model.get('gloss'));
                    event.stopPropagation();
                    event.preventDefault();
                    $(event.currentTarget).blur();
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
            // User clicked on the Undo button.
            onUndo: function (event) {
                // ignore event if we're in preview mode
                if (inPreview === true) {
                    return;
                }
                console.log("onUndo: entry");
                // find the model object associated with this edit field
                var strID = $(lastPile).attr('id');
                strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                var model = this.collection.findWhere({spid: strID});
                if (editorMode === editorModeEnum.ADAPTING) {
                    // adaptation mode
                    // remove the KB entry
                    removeFromKB(this.stripPunctuation(this.autoRemoveCaps(model.get('source'), true), true),
                                this.stripPunctuation(this.autoRemoveCaps($(lastPile).find(".target").html(), false).trim(), false),
                                project.get('projectid'), 0);
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
                } else if (editorMode === editorModeEnum.GLOSSING) {
                    // glossing mode
                    // remove the KB entry
                    removeFromKB(this.stripPunctuation(this.autoRemoveCaps(model.get('source'), true), true),
                                this.stripPunctuation(this.autoRemoveCaps($(lastPile).find(".gloss").html(), false).trim(), false),
                                project.get('projectid'), 1);
                    // set the edit field back to its previous value
                    $(lastPile).find(".gloss").html(origText);
                    // update the model with the new target text
                    model.save({gloss: origText});
                    // Note: no "green" differences check
                } else { 
                    // free translation mode 
                    // find the model object associated with this edit field
                    UI_ID = strID = $("#fteditor").attr('data-spid');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    model = this.spList.findWhere({spid: strID});
                    origText = model.get("freetrans");
                    // set the edit field (and freetrans text) back to their previous values
                    $("#fteditor").html(origText);
                    $(UI_ID).find(".ft").html(origText);
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
            // This method updates the KB and model (AI Document) if they have any changes.
            unselectedAdaptation: function (event) {
                var value = null,
                    trimmedValue = null,
                    strID = null,
                    model = null;
                // ignore event if we're in preview mode
                if (inPreview === true) {
                    return;
                }
                console.log("unselectedAdaptation: event type=" + event.type + ", isDirty=" + isDirty + ", scrollTop=" + $("#chapter").scrollTop());
                if (isSelectingKB === true) {
                    isSelectingKB = false;
                }
                if ($(window).height() < 200) {
                    // smaller window height -- hide the marker line
                    $(".marker").removeClass("hide");
                    $(".pile").removeClass("condensed-pile");
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
                // re-add autocaps if necessary
                if (trimmedValue.length > 0) {
                    trimmedValue = this.autoAddCaps(model, trimmedValue);
                }
                // check for changes in the edit field
                isEditing = false;
                if (isDirty === true) {
                    if (trimmedValue.length === 0) {
                        // empty value entered. Was there text before?
                        if (origText.length > 0) {
                            console.log("User deleted target text: " + origText + " -- removing from KB and DB.");
                            // There was a target text, but the user deleted it. Remove the old text from the KB.
                            removeFromKB(this.autoRemoveCaps(model.get('source'), true),
                                     origText, project.get('projectid'), 0);
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
                            saveInKB(this.stripPunctuation(this.autoRemoveCaps(model.get('source'), true), true),
                                     Underscore.escape(this.stripPunctuation(this.autoRemoveCaps(trimmedValue, false)).trim(), false),
                                     Underscore.escape(this.stripPunctuation(this.autoRemoveCaps(model.get('target'), false)).trim(), false),
                                     project.get('projectid'), 0);
                        }
                        // add any punctuation back to the target field
                        $(event.currentTarget).html(this.copyPunctuation(model, trimmedValue));
                        // update the model with the new target text
                        model.save({target: this.copyPunctuation(model, trimmedValue)});
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
                } else {
                    // dirty bit not set -- go back to what was saved earlier
//                    $(event.currentTarget).html(this.copyPunctuation(model, trimmedValue));
                    $(event.currentTarget).html(model.get('target'));
                }
                // if we just finished work on a new verse, update the last adapted count
                if (model && model.get('markers').length > 0 && model.get('markers').indexOf("\\v ") > -1) {
                    // get the verse #
                    var stridx = model.get('markers').indexOf("\\v ") + 3;
                    var verseNum = "";
                    if (model.get('markers').lastIndexOf(ONE_SPACE) < stridx) {
                        // no space after the verse # (it's the ending of the string)
                        verseNum = model.get('markers').substr(stridx);
                    } else {
                        // space after the verse #
                        verseNum = model.get('markers').substr(stridx, model.get('markers').indexOf(ONE_SPACE, stridx) - stridx);
                    }
                    console.log("Adapting verse: " + verseNum);
                    chapter.set('lastadapted', verseNum);
                }
                // if this is a text document (i.e., no verses), set the last adapted count to non-zero
                if (chapter.get('versecount') < 0) {
                    chapter.set('lastadapted', -1);
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
            // User has moved out of the current gloss input field (blur on gloss field)
            // this can be called either programatically (tab / shift+tab keydown response) or
            // by a selection of something else on the page.
            // This method updates the gloss KB and model (AI Document) if they have any changes.
            unselectedGloss: function (event) {
                var value = null,
                    trimmedValue = null,
                    strID = null,
                    model = null;
                // ignore event if we're in preview mode
                if (inPreview === true) {
                    return;
                }
                console.log("unselectedGloss: event type=" + event.type + ", isDirty=" + isDirty + ", scrollTop=" + $("#chapter").scrollTop());
                if (isSelectingKB === true) {
                    isSelectingKB = false;
                }
                if ($(window).height() < 200) {
                    // smaller window height -- hide the marker line
                    $(".marker").removeClass("hide");
                    $(".pile").removeClass("condensed-pile");
                }
                // disable the undo button (no longer editing)
//                $("#Undo").prop('disabled', true);

                // get the gloss text
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
                // re-add autocaps if necessary
                if (trimmedValue.length > 0) {
                    trimmedValue = this.autoAddCaps(model, trimmedValue);
                }
                // check for changes in the edit field
                isEditing = false;
                if (isDirty === true) {
                    if (trimmedValue.length === 0) {
                        // empty value entered. Was there text before?
                        if (origText.length > 0) {
                            console.log("User deleted target text: " + origText + " -- removing from KB and DB.");
                            // There was a target text, but the user deleted it. Remove the old text from the KB.
                            removeFromKB(this.autoRemoveCaps(model.get('source'), true),
                                     origText, project.get('projectid'), 1);
                            // update the model with the new gloss text (nothing)
                            model.save({gloss: trimmedValue});
                        }
                    } else {
                        if ((strID.indexOf("ret") > -1) || (strID.indexOf("plc") > -1)) {
                            // retranslation or placeholder -- don't save in the KB
                            console.log("Dirty bit set on retranslation / placeholder. Value:" + trimmedValue);
                        } else {
                            // not a retranslation
                            console.log("Dirty bit set. Saving KB value: " + trimmedValue);
                            // something has changed -- update the KB
                            saveInKB(this.stripPunctuation(this.autoRemoveCaps(model.get('source'), true), true),
                                     Underscore.escape(this.stripPunctuation(this.autoRemoveCaps(trimmedValue, false)).trim(), false),
                                     Underscore.escape(this.stripPunctuation(this.autoRemoveCaps(model.get('gloss'), false)).trim(), false),
                                     project.get('projectid'), 1);
                        }
                        // add any punctuation back to the target field
                        $(event.currentTarget).html(this.copyPunctuation(model, trimmedValue));
                        // update the model with the new target text
                        model.save({gloss: this.copyPunctuation(model, trimmedValue)});
                    }
                } else {
                    // dirty bit not set -- go back to what was saved earlier
                    $(event.currentTarget).html(model.get('gloss'));
                }
                // check for an old selection and remove it if needed
                if (selectedStart !== null) {
                    // there was an old selection -- remove the ui-selected class
                    $("div").removeClass("ui-selecting ui-selected");
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
            },

            // User clicked the Show Translations button -- find the selection in the KB and
            // navigate to that page
            showTranslations: function () {
                var tu = null;
                var tuid = "";
                var sourceValue = this.stripPunctuation(this.autoRemoveCaps($(selectedStart).children('.source').html(), true), true);
                var projectid = project.get('projectid');
                // find the selection and TUID
                var elts = kblist.filter(function (element) {
                    return (element.attributes.projectid === projectid && element.attributes.source === sourceValue);
                });
                if (elts.length > 0) {
                    tu = elts[0];
                }
                if (tu) {
                    // found something for this element -- navigate to the KB editor
                    tuid = tu.get('tuid');
                    window.Application.router.navigate("kb/" + tuid, {trigger: true, replace: true});
                }
            },
            // User clicked on the Preview (toggle) button -- enable or disable
            // preview / target only mode
            togglePreview: function () {
                if (inPreview === true) {
                    // turn off preview mode
                    $("#chapter").removeClass("preview");
                    if (editorMode === editorModeEnum.ADAPTING) {
                        $(".target").prop('contenteditable', true); // set target to read-write
                    } else if (editorMode === editorModeEnum.GLOSSING) {
                        $(".gloss").prop('contenteditable', true); // set target to read-write
                    } else {
                        $(".freetrans").prop('contenteditable', true); // set target to read-write
                    }
                    $("#lblPreview").html(i18next.t("view.lblShowPreview"));
                    inPreview = false;
                    $(".target").removeClass("hide");
                    $(".gloss").removeClass("hide");
                    $(".freetrans").removeClass("hide");
                    // disable editing blank verses if needed
                    if (this.allowEditBlankSP === false) {
                        $(".nosource").prop('contenteditable', false); // no source -- set target to read-only
                    }
                } else {
                    // clear out any selections
                    this.clearSelection();
                    // turn on preview mode
                    $("#chapter").addClass("preview");
                    $("#lblPreview").html(i18next.t("view.lblHidePreview"));
                    inPreview = true;
                    // preview only the item we're working on (target, gloss, or free translation)
                    switch(editorMode) {
                        case editorModeEnum.ADAPTING:
                            $(".target").prop('contenteditable', false); // set target to read-only
                            $(".gloss").addClass("hide");
                            $(".freetrans").addClass("hide");
                            break;
                        case editorModeEnum.GLOSSING:
                            $(".gloss").prop('contenteditable', false); // set target to read-only
                            $(".target").addClass("hide");
                            $(".freetrans").addClass("hide");
                            break;
                        case editorModeEnum.FREE_TRANSLATING:
                            $(".freetrans").prop('contenteditable', false); // set target to read-only
                            $(".target").addClass("hide");
                            $(".gloss").addClass("hide");
                            break;
                    }
                }
            },
            // User clicked on the Adapting menu item -- set the current mode to Adapting
            onModeAdapting: function () {
                editorMode = editorModeEnum.ADAPTING;
                // disable contenteditable on gloss, freetrans lines
                $(".target").attr('contenteditable', true);
                $(".gloss").attr('contenteditable', false);
                if (($("#freetrans").hasClass("show-flex"))) {
                    $("#freetrans").removeClass("show-flex");
                    $("#content").removeClass("with-ft");
                }
                // hide the gloss and FT lines
                if (!$(".gloss").hasClass("hide")) {
                    $(".gloss").addClass("hide");
                }
                if (!$(".ft").hasClass("hide")) {
                    $(".ft").addClass("hide");
                }
                if (selectedStart !== null) {
                    $(selectedStart).find(".target").focus();
                }
            },
            // User clicked on the Glossing menu item -- set the current mode to Glossing
            onModeGlossing: function () {
                editorMode = editorModeEnum.GLOSSING;
                // disable contenteditable on target, freetrans lines
                $(".target").attr('contenteditable', false);
                $(".gloss").attr('contenteditable', true);
                if (($("#freetrans").hasClass("show-flex"))) {
                    $("#freetrans").removeClass("show-flex");
                    $("#content").removeClass("with-ft");
                }
                // Flip the translation / gloss lines?
                // ********************
                // show the gloss line only
                if ($(".gloss").hasClass("hide")) {
                    $(".gloss").removeClass("hide");
                }
                if (!$(".ft").hasClass("hide")) {
                    $(".ft").addClass("hide");
                }
                // clear any old UI "selecting" blue
                $("div").removeClass("ui-selecting ui-selected");

                // if there actually _is_ a selection, set the focus and enable the back/fw buttons
                if (selectedStart !== null) {
                    $(selectedStart).find(".gloss").focus();
                    // enable prev / next buttons
                    $("#PrevSP").prop('disabled', false); // enable toolbar button
                    $("#NextSP").prop('disabled', false); // enable toolbar button
                }
            },
            // User clicked on the Free Translation menu item -- set the current mode to Free Translation
            onModeFreeTrans: function () {
                editorMode = editorModeEnum.FREE_TRANSLATING;
                // disable contenteditable on gloss, target lines
                $(".gloss").attr('contenteditable', false);
                $(".target").attr('contenteditable', false);
                // show the FT line only
                if (!$(".gloss").hasClass("hide")) {
                    $(".gloss").addClass("hide");
                }
                if ($(".ft").hasClass("hide")) {
                    $(".ft").removeClass("hide");
                }
                // show the free translation editor area
                if (!($("#freetrans").hasClass("show-flex"))) {
                    $("#freetrans").addClass("show-flex");
                    $("#content").addClass("with-ft");
                }
                $("div").removeClass("ui-selecting ui-selected");
                // is there a current selection?
                if (selectedStart === null) {
                    // no current selection -- see if there's a lastAdaptedPile
                    if ($('#pile-' + project.get('lastAdaptedSPID')).length !== 0) {
                        selectedStart = $('#pile-' + project.get('lastAdaptedSPID')).get(0);
                    }
                    if (selectedStart === null) {
                        // no luck -- just grab the first pile
                        selectedStart = $(".pile").first().get(0);
                    }
                }
                selectedEnd = null; // clear out the end selection so it can be reset
                // enable prev / next buttons
                $("#PrevSP").prop('disabled', false); // enable toolbar button
                $("#NextSP").prop('disabled', false); // enable toolbar button
                // fire a focus event for the FT editor
                $("#fteditor").focus();
                $("#fteditor").mouseup();
            },
            // User clicked on the Placeholder _before_ button
            togglePHBefore: function () {
                // TODO: move placeHolderHtml to templated html
                var next_edit = null,
                    selectedObj = null,
                    nOrder = 0.0,
                    strID = null,
                    prePuncts = "",
                    tgtText = "",
                    src = "...",
                    mkrs = "",
                    newID = Math.floor(Date.now()).toString(), // convert to string
                    phObj = null,
                    phHtml1 = "<div id=\"pile-plc-" + newID + "\" class=\"pile block-height\">",
                    phHtml2 = "</div>",
                    placeHolderHtml = "";
                // if the current selection is a placeholder, remove it; if not,
                // add a placeholder before the current selection
                if (isPHBefore === false) {
                    // no placeholder at the selection -- add one
                    strID = $(selectedStart).attr('id');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    selectedObj = this.collection.findWhere({spid: strID});
                    if (this.collection.indexOf(selectedObj) > 0) {
                        nOrder = (selectedObj.get('norder') + (this.collection.at(this.collection.indexOf(selectedObj) - 1).get('norder'))) / 2;
                    } // else nOrder gets the fallback value of 0.0
                    // Are there any leading puncts?
                    if (selectedObj.get('prepuncts').length > 0) {
                        // add follpuncts to placeholder
                        prePuncts = selectedObj.get('prepuncts');
                        src = prePuncts + src;
                        // remove from the selectedobj and UI
                        if (selectedObj.get('source').startsWith(prePuncts)) {
                            selectedObj.set('source', selectedObj.get('source').substr(prepuncts.length), {silent: true});
                        }
                        selectedObj.set('prepuncts', "", {silent: true});
                        selectedObj.save();
                        $(selectedStart).find(".source").html(selectedObj.get('source'));
                    }
                    if (selectedObj.get('markers').length > 0) {
                        mkrs = selectedObj.get('markers');
                        selectedObj.set('markers', "", {silent:true});
                        selectedObj.save();
                        $(selectedStart).find(".marker").html("&nbsp;"); // clear out marker line
                    }
                    tgtText = this.autoRemoveCaps(selectedObj.get('target'), false);
                    if (tgtText !== selectedObj.get('target')) {
                        selectedObj.set('target', tgtText, {silent:true});
                        selectedObj.save();
                        $(selectedStart).find(".target").html(selectedObj.get('target'));
                    }
                    phObj = new spModels.SourcePhrase({ spid: ("plc-" + newID), source: src, chapterid: selectedObj.get('chapterid'), vid: selectedObj.get('vid'), norder: nOrder, markers: mkrs, prepuncts: prePuncts});
                    phObj.save();
                    this.collection.add(phObj, {at: this.collection.indexOf(selectedObj)});
                    placeHolderHtml = phHtml1 + theSP(phObj.attributes) + phHtml2;
                    $(selectedStart).before(placeHolderHtml);
                    // start adapting at this location
                    $("div").removeClass("ui-selecting ui-selected");
                    $("#phBefore").prop('disabled', true);
                    $("#Retranslation").prop('disabled', true);
                    $("#Phrase").prop('disabled', true);
                    $("#mnuPHBefore").prop('disabled', true);
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
                    if (selectedObj.get('markers').length > 0 || selectedObj.get('prepuncts')) {
                        // need to transfer some markers and/or prepuncts to the next pile before deleting this object
                        // find the next pile
                        next_edit = selectedStart.nextElementSibling;
                        strID = $(next_edit).attr('id');
                        strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                        var theObj = this.collection.findWhere({spid: strID});
                        // copy over any info from the placeholder to the next pile
                        theObj.set('markers', selectedObj.get('markers') + " " + theObj.get('markers'));
                        theObj.set('prepuncts', selectedObj.get('prepuncts') + " " + theObj.get('prepuncts'));
                        theObj.set('source', selectedObj.get('prepuncts') + theObj.get('source'));
                        theObj.set('target', this.autoAddCaps(theObj.get('target'), true)); // capitalize if needed
                        theObj.save();
                        $(next_edit).find('.source').html(theObj.get('source'));
                        $(next_edit).find(".marker").html(theObj.get('markers')); // rebuild marker line if needed
                        $(next_edit).find(".target").html(theObj.get('target')); // rebuild target line if needed
                    }
                    this.collection.remove(selectedObj); // remove from collection
                    selectedObj.destroy(); // delete from db
                    $(selectedStart).remove();
                    // item has been removed, so there is no longer a selection -
                    // clean up the UI accordingly
                    $("div").removeClass("ui-selecting ui-selected");
                    $("#phBefore").prop('title', i18next.t("view.dscNewPlaceholder"));
                    $("#phBefore .topcoat-icon").removeClass("topcoat-icon--ph-before-delete");
                    $("#phBefore .topcoat-icon").addClass("topcoat-icon--ph-before-new");
                    $("#phBefore").prop('disabled', true);
                    $("#phAfter").prop('disabled', true);
                    $("#Retranslation").prop('disabled', true);
                    $("#Phrase").prop('disabled', true);
                    $("#mnuPHBefore").prop('disabled', true);
                    $("#mnuPHAfter").prop('disabled', true);
                    $("#mnuRetranslation").prop('disabled', true);
                    $("#mnuPhrase").prop('disabled', true);
                    $("#PrevSP").prop('disabled', true);
                    $("#NextSP").prop('disabled', true);
                }
            },
            // User clicked on the Placeholder _after_ button (v. 1.5.0)
            togglePHAfter: function () {
                // TODO: move placeHolderHtml to templated html
                var next_edit = null,
                    selectedObj = null,
                    nOrder = 0.0,
                    strID = null,
                    follPuncts = "",
                    src = "...",
                    newID = Math.floor(Date.now()).toString(), // convert to string
                    phObj = null,
                    phHtml1 = "<div id=\"pile-pla-" + newID + "\" class=\"pile block-height\">",
                    phHtml2 = "</div>",
                    placeHolderHtml = "";
                // if the current selection is a placeholder, remove it; if not,
                // add a placeholder before the current selection
                if (isPHAfter === false) {
                    // no placeholder at the selection -- add one
                    strID = $(selectedStart).attr('id');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    selectedObj = this.collection.findWhere({spid: strID});
                    nOrder = (selectedObj.get('norder') + (this.collection.at(this.collection.indexOf(selectedObj) + 1).get('norder'))) / 2;
                    // Are there any trailing puncts?
                    if (selectedObj.get('follpuncts').length > 0) {
                        // add follpuncts to placeholder
                        follPuncts = selectedObj.get('follpuncts');
                        src += follPuncts;
                        if (selectedObj.get('source').endsWith(follPuncts)) {
                            selectedObj.set('source', selectedObj.get('source').slice(0, -(follPuncts.length)), {silent: true});
                        }
                        // remove from the selectedobj and UI
                        selectedObj.set('follpuncts', "", {silent:true});
                        selectedObj.save();
                        $(selectedStart).find('.source').html(selectedObj.get('source'));
                    }
                    phObj = new spModels.SourcePhrase({ spid: ("pla-" + newID), source: src, chapterid: selectedObj.get('chapterid'), vid: selectedObj.get('vid'), norder: nOrder, follpuncts: follPuncts});
                    phObj.save();
                    // add to the model and UI _after_ the selected position
                    this.collection.add(phObj, {at: this.collection.indexOf(selectedObj) + 1});
                    placeHolderHtml = phHtml1 + theSP(phObj.attributes) + phHtml2;
                    $(selectedStart).after(placeHolderHtml);
                    // start adapting at this location
                    $("div").removeClass("ui-selecting ui-selected");
                    $("#phAfter").prop('disabled', true);
                    $("#Retranslation").prop('disabled', true);
                    $("#Phrase").prop('disabled', true);
                    $("#mnuPHAfter").prop('disabled', true);
                    $("#mnuRetranslation").prop('disabled', true);
                    $("#mnuPhrase").prop('disabled', true);
                    next_edit = selectedStart.nextElementSibling;
                    selectedStart = next_edit;
                    $(next_edit).find('.target').mouseup();
                } else {
                    // selection is a placeholder -- delete it from the model and the DOM (html)
                    strID = $(selectedStart).attr('id');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    selectedObj = this.collection.findWhere({spid: strID});
                    if (selectedObj.get('follpuncts')) {
                        // need to transfer follpuncts to the previous pile before deleting this object
                        // find the previous pile
                        next_edit = selectedStart.previousElementSibling;
                        strID = $(next_edit).attr('id');
                        strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                        var theObj = this.collection.findWhere({spid: strID});
                        // copy over any info from the placeholder to the previous pile
                        follPuncts = selectedObj.get('follpuncts');
                        theObj.set('follpuncts', follPuncts + theObj.get('follpuncts'));
                        theObj.set('source', theObj.get('source') + follPuncts);
                        $(next_edit).find('.source').html(theObj.get('source'));
                        theObj.save();
                    }
                    this.collection.remove(selectedObj); // remove from collection
                    selectedObj.destroy(); // delete from db
                    $(selectedStart).remove();
                    // item has been removed, so there is no longer a selection -
                    // clean up the UI accordingly
                    $("div").removeClass("ui-selecting ui-selected");
                    $("#phBefore").prop('title', i18next.t("view.dscNewPlaceholder"));
                    $("#phAfter .topcoat-icon").removeClass("topcoat-icon--ph-after-delete");
                    $("#phAfter .topcoat-icon").addClass("topcoat-icon--ph-after-new");
                    $("#phBefore").prop('disabled', true);
                    $("#phAfter").prop('disabled', true);
                    $("#Retranslation").prop('disabled', true);
                    $("#Phrase").prop('disabled', true);
                    $("#mnuPHBefore").prop('disabled', true);
                    $("#mnuPHAfter").prop('disabled', true);
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
                    tu = null,
                    refstrings = null,
                    options = [],
                    i = 0,
                    phraseHtml = null,
                    done = false,
                    tmpNode = null,
                    tmpNextNode = null,
                    coll = this.collection, // needed to find collection within "each" block below
                    newID = Math.floor(Date.now()).toString(), // convert to string
                    phraseMarkers = "",
                    phraseSource = "",
                    phraseTarget = "",
                    prepuncts = "",
                    follpuncts = "",
                    origTarget = "",
                    nOrder = 0.0,
                    phObj = null,
                    strID = null,
                    newView = null,
                    selectedObj = null,
                    PhraseLine0 = "<div id=\"pile-",
                    PhraseLine1 = "\" class=\"pile block-height\"><div class=\"marker\">",
                    PhraseLine2 = "</div> <div class=\"source\">",
                    PhraseLine3 = "</div> <div class=\"target\" contenteditable=\"true\">",
                    thisObj = this,
                    PhraseLine4 = "</div></div>";
                if (isPhrase === false) {
                    // not a phrase -- create one from the selection
                    // initial values
                    tmpNode = selectedStart;
                    phraseMarkers = $(selectedStart).children(".marker").text();
                    phraseSource = $(selectedStart).children(".source").html();
                    phraseTarget = $(selectedStart).children(".target").html();
                    // check for embedded phrases
                    if ($(selectedStart).attr('id').indexOf("phr") !== -1) {
                        // phrase -- pull out the original target
                        strID = $(selectedStart).attr('id');
                        strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                        selectedObj = this.collection.findWhere({spid: strID});
                        origTarget += selectedObj.get("orig");
                    } else {
                        // not a phrase -- just add the target text
                        origTarget += $(selectedStart).children(".target").html();
                    }
                    // now iterate through subsequent piles until we reach selectedEnd
                    while (!done) {
                        // next item
                        tmpNode = tmpNode.nextElementSibling;
                        if (tmpNode === selectedEnd) {
                            done = true;
                        }
                        // concatenate the source and target into single phrases
                        // TODO: spaces? Probably replace with a space marker of some sort (e.g. Thai with no word breaks)
                        phraseSource += ONE_SPACE;
                        phraseTarget += ONE_SPACE;
                        origTarget += "|";
                        phraseMarkers += $(tmpNode).children(".marker").text();
                        phraseSource += $(tmpNode).children(".source").html();
                        phraseTarget += $(tmpNode).children(".target").html();
                        // check for phrases
                        if ($(tmpNode).attr('id').indexOf("phr") !== -1) {
                            // phrase -- pull out the original target
                            strID = $(tmpNode).attr('id');
                            strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                            selectedObj = this.collection.findWhere({spid: strID});
                            origTarget += selectedObj.get("orig");
                        } else {
                            // not a phrase -- just add the target text
                            origTarget += $(tmpNode).children(".target").html();
                        }
                    }
                    // transfer any leading / trailing punctuation from the source to the prepuncts/follpuncts
                    // get prepuncts from the selected start
                    strID = $(selectedStart).attr('id');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    selectedObj = this.collection.findWhere({spid: strID});
                    prepuncts = selectedObj.get('prepuncts');
                    // get follpuncts from the selected end
                    strID = $(selectedEnd).attr('id');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    selectedObj = this.collection.findWhere({spid: strID});
                    follpuncts = selectedObj.get('follpuncts');
                    // now build the new sourcephrase from the string
                    // model object itself
                    phObj = new spModels.SourcePhrase({ spid: ("phr-" + newID), markers: phraseMarkers.trim(), source: phraseSource, target: phraseSource, orig: origTarget, prepuncts: prepuncts, follpuncts: follpuncts});
                    strID = $(selectedStart).attr('id');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    selectedObj = this.collection.findWhere({spid: strID});
                    phObj.set('chapterid', selectedObj.get('chapterid'), {silent: true});
                    phObj.set('vid', selectedObj.get('vid'), {silent: true});
                    phObj.set('norder', selectedObj.get('norder'), {silent: true}); // phrase just takes same order # as first selected object
                    phObj.save();
                    this.collection.add(phObj);
                    // also save in KB
                    saveInKB(this.stripPunctuation(this.autoRemoveCaps(phraseSource), true), phraseSource, "", project.get('projectid'), 0);
                    // UI representation
                    // marker, source divs
                    phraseHtml = PhraseLine0 + "phr-" + newID + PhraseLine1 + phraseMarkers + PhraseLine2 + phraseSource + PhraseLine3;
                    // if we're merging because of our lookahead KB parse, skip adding the target -- we want to 
                    // populate the target from the KB instead
                    if (isMergingFromKB === false) {
                        // NOT merging from the KB (i.e., an automatic merge); so the user has merged this phrase --
                        // is there something in the KB that matches this phrase?
                        tu = this.findInKB(this.stripPunctuation(this.autoRemoveCaps(phraseSource, true)), 0);
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
                                phraseHtml += this.stripPunctuation(this.autoAddCaps(phObj, refstrings[0].target), false);
                                isDirty = true;
                            }
                        } else {
                            // nothing in the KB -- 
                            // next check is to see if the user selected a phrase and
                            // started typing (isAutoPhrase). If so, only add the target from the selected start
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
                        }
                    }
                    phraseHtml += PhraseLine4;
                    console.log("phrase: " + phraseHtml);
                    isDirty = false;
                    $(selectedStart).before(phraseHtml);
                    // finally, remove the selected piles (they were merged into this one)
                    done = false;
                    tmpNode = selectedStart;
                    while (!done) {
                        tmpNextNode = tmpNode.nextElementSibling;
                        // delete the current item
                        strID = $(tmpNode).attr('id');
                        // skip our phrase
                        if (strID.indexOf("phr") === -1) {
                            strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                            selectedObj = coll.findWhere({spid: strID});
                            coll.remove(selectedObj); // remove from collection
                            selectedObj.destroy(); // remove from database
                            $(tmpNode).remove(); // remove from the UI
                        }
                        // are we done yet?
                        if (tmpNode === selectedEnd) {
                            done = true;
                        }
                        // move to the next item
                        tmpNode = tmpNextNode;
                    }
                    // update the toolbar UI
                    $("div").removeClass("ui-selecting ui-selected");
                    $("#phBefore").prop('disabled', true);
                    $("#phAfter").prop('disabled', true);
                    $("#Retranslation").prop('disabled', true);
                    $("#Phrase").prop('disabled', true);
                    $("#mnuPHBefore").prop('disabled', true);
                    $("#mnuPHAfter").prop('disabled', true);
                    $("#mnuRetranslation").prop('disabled', true);
                    $("#mnuPhrase").prop('disabled', true);
                    // start adapting the new Phrase
                    next_edit = $('#pile-phr-' + newID);
                    selectedStart = next_edit;
                    $(next_edit).find('.target').mouseup();
                } else {
                    // selection is a phrase -- delete it from the model and the DOM
                    // first, re-create the original sourcephrase piles and add them to the collection and UI
                    var startIdx = 0,
                        endIdx = 0,
                        startID = Math.floor(Date.now()),
                        theSource = "";
                    strID = $(selectedStart).attr('id');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    selectedObj = this.collection.findWhere({spid: strID});
                    nOrder = selectedObj.get('norder');
                    origTarget = selectedObj.get("orig").split("|");
                    selectedObj.get("source").split(ONE_SPACE).forEach(function (value, index) {
                        // add to model
                        newID = (startID + index).toString(); // create new IDs that won't collide
                        phraseTarget = (index >= origTarget.length) ? ONE_SPACE : origTarget[index];
                        // pull out any prepuncts / follpuncts from the value
                        // reset counters and temp vars
                        startIdx = 0;
                        endIdx = value.length;
                        prepuncts = "";
                        follpuncts = "";
                        // prepuncts
                        while (startIdx < (value.length - 1) && punctsSource.indexOf(value.charAt(startIdx)) > -1) {
                            prepuncts += value.charAt(startIdx);
                            startIdx++;
                        }
                        // follpuncts
                        while (endIdx > 0 && punctsSource.indexOf(value.charAt(endIdx - 1)) > -1) {
                            follpuncts += value.charAt(endIdx - 1); // TODO: is this reversed?
                            endIdx--;
                        }
                        theSource = value; // don't strip punctuation
                        // theSource = value.substr(startIdx, (endIdx) - startIdx);
                        // recreate the sourcephrase
                        phObj = new spModels.SourcePhrase({ spid: (newID), norder: nOrder, source: theSource, target: phraseTarget, chapterid: selectedObj.get('chapterid'), prepuncts: prepuncts, follpuncts: follpuncts});
                        if (index === 0) {
                            // transfer any marker back (would be the first in the list)
                            phObj.set('markers', selectedObj.get('markers'), {silent: true});
                        }
                        phObj.save();
                        coll.add(phObj, {at: coll.indexOf(selectedObj)});
                        nOrder = nOrder + 1;
                        // add to KB
                        if (phraseTarget.length > 0) {
                            saveInKB(thisObj.stripPunctuation(thisObj.autoRemoveCaps(value), true), phraseTarget, "", project.get('projectid'), 0);
                        }
                        // add to UI
                        $(selectedStart).before("<div class=\"pile block-height\" id=\"pile-" + phObj.get('spid') + "\"></div>");
                        newView = new SourcePhraseView({ model: phObj});
                        $('#pile-' + phObj.get('spid')).append(newView.render().el.childNodes);
                    });
                    // now delete the phrase itself
                    removeFromKB(this.autoRemoveCaps(selectedObj.get("source")), selectedObj.get("target"), project.get('projectid'), 0); // remove from KB
                    this.collection.remove(selectedObj); // remove from collection
                    selectedObj.destroy(); // delete the object from the database
                    $(selectedStart).remove();
                    // update the toolbar UI
                    $("div").removeClass("ui-selecting ui-selected");
                    $("#Phrase").prop('title', i18next.t("view.dscNewPhrase"));
                    $("#Phrase .topcoat-icon").removeClass("topcoat-icon--phrase-delete");
                    $("#Phrase .topcoat-icon").addClass("topcoat-icon--phrase-new");
                    $("#phBefore").prop('disabled', true);
                    $("#phAfter").prop('disabled', true);
                    $("#Retranslation").prop('disabled', true);
                    $("#Phrase").prop('disabled', true);
                    $("#mnuPHBefore").prop('disabled', true);
                    $("#mnuPHAfter").prop('disabled', true);
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
                    tmpNode = null,
                    tmpNextNode = null,
                    done = false,
                    coll = this.collection, // needed to find collection within "each" block below
                    newID = Math.floor(Date.now()).toString(),
                    retMarkers = "",
                    RetSource = "",
                    RetTarget = "",
                    nOrder = 0.0,
                    origTarget = "",
                    prepuncts = "",
                    follpuncts = "",
                    phObj = null,
                    strID = null,
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
                    // initial values
                    tmpNode = selectedStart;
                    retMarkers = $(selectedStart).children(".marker").text();
                    RetSource = $(selectedStart).children(".source").html();
                    RetTarget = $(selectedStart).children(".target").html();
                    // check for embedded phrases
                    if ($(selectedStart).attr('id').indexOf("ret") !== -1) {
                        // phrase -- pull out the original target
                        strID = $(selectedStart).attr('id');
                        strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                        selectedObj = this.collection.findWhere({spid: strID});
                        origTarget += selectedObj.get("orig");
                    } else {
                        // not a phrase -- just add the target text
                        origTarget += $(selectedStart).children(".target").html();
                    }
                    // now iterate through subsequent piles until we reach selectedEnd
                    while (!done) {
                        // next item
                        tmpNode = tmpNode.nextElementSibling;
                        if (tmpNode === selectedEnd) {
                            done = true;
                        }
                        // concatenate the source and target into single retranslations
                        // TODO: spaces? Probably replace with a space marker of some sort (e.g. Thai with no word breaks)
                        RetSource += ONE_SPACE;
                        RetTarget += ONE_SPACE;
                        origTarget += "|";
                        retMarkers += $(tmpNode).children(".marker").text();
                        RetSource += $(tmpNode).children(".source").html();
                        RetTarget += $(tmpNode).children(".target").html();
                        // check for phrases
                        if ($(tmpNode).attr('id').indexOf("ret") !== -1) {
                            // phrase -- pull out the original target
                            strID = $(tmpNode).attr('id');
                            strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                            selectedObj = this.collection.findWhere({spid: strID});
                            origTarget += selectedObj.get("orig");
                        } else {
                            // not a phrase -- just add the target text
                            origTarget += $(tmpNode).children(".target").html();
                        }
                    }
                    // transfer any leading / trailing punctuation from the source to the prepuncts/follpuncts
                    // get prepuncts from the selected start
                    strID = $(selectedStart).attr('id');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    selectedObj = this.collection.findWhere({spid: strID});
                    prepuncts = selectedObj.get('prepuncts');
                    // get follpuncts from the selected end
                    strID = $(selectedEnd).attr('id');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    selectedObj = this.collection.findWhere({spid: strID});
                    follpuncts = selectedObj.get('follpuncts');
                    // now build the new sourcephrase from the string
                    // model object
                    phObj = new spModels.SourcePhrase({ spid: ("ret-" + newID), markers: retMarkers.trim(), source: this.stripPunctuation(RetSource, true), target: RetSource, orig: origTarget, prepuncts: prepuncts, follpuncts: follpuncts});
                    strID = $(selectedStart).attr('id');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    selectedObj = this.collection.findWhere({spid: strID});
                    phObj.set('norder', selectedObj.get('norder'), {silent: true}); // retranslation just takes same order # as first selected object
                    phObj.set('chapterid', selectedObj.get('chapterid'), {silent: true});
                    phObj.set('vid', selectedObj.get('vid'), {silent: true});
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
                    done = false;
                    tmpNode = selectedStart;
                    while (!done) {
                        tmpNextNode = tmpNode.nextElementSibling;
                        // delete the current item
                        strID = $(tmpNode).attr('id');
                        // skip our retranslation
                        if (strID.indexOf("ret") === -1) {
                            strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                            selectedObj = coll.findWhere({spid: strID});
                            coll.remove(selectedObj); // remove from collection
                            selectedObj.destroy(); // remove from database
                            $(tmpNode).remove(); // remove from the UI
                        }
                        // are we done yet?
                        if (tmpNode === selectedEnd) {
                            done = true;
                        }
                        // move to the next item
                        tmpNode = tmpNextNode;
                    }
                    // update the toolbar UI
                    $("div").removeClass("ui-selecting ui-selected");
                    $("#phBefore").prop('disabled', true);
                    $("#phAfter").prop('disabled', true);
                    $("#Retranslation").prop('disabled', true);
                    $("#Phrase").prop('disabled', true);
                    $("#mnuPHBefore").prop('disabled', true);
                    $("#mnuPHAfter").prop('disabled', true);
                    $("#mnuRetranslation").prop('disabled', true);
                    $("#mnuPhrase").prop('disabled', true);
                    // start adapting the new Retranslation
                    next_edit = $('#pile-ret-' + newID);
                    selectedStart = next_edit;
                    $(next_edit).find('.target').mouseup();
                } else {
                    // selection is a retranslation -- delete it from the model and the DOM
                    // first, re-create the original sourcephrase piles and add them to the collection and UI
                    var startIdx = 0,
                        endIdx = 0,
                        startID = Math.floor(Date.now()),
                        theSource = "";
                    strID = $(selectedStart).attr('id');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    selectedObj = this.collection.findWhere({spid: strID});
                    nOrder = selectedObj.get('norder');
                    origTarget = selectedObj.get("orig").split("|");
                    selectedObj.get("source").split(ONE_SPACE).forEach(function (value, index) {
                        // add to model
                        newID = (startID + index).toString(); // convert to string
                        RetTarget = (index >= origTarget.length) ? ONE_SPACE : origTarget[index];
                        // pull out any prepuncts / follpuncts from the value
                        // reset counters and temp vars
                        startIdx = 0;
                        endIdx = value.length;
                        prepuncts = "";
                        follpuncts = "";
                        // prepuncts
                        while (startIdx < (value.length - 1) && punctsSource.indexOf(value.charAt(startIdx)) > -1) {
                            prepuncts += value.charAt(startIdx);
                            startIdx++;
                        }
                        // follpuncts
                        while (endIdx > 0 && punctsSource.indexOf(value.charAt(endIdx - 1)) > -1) {
                            follpuncts += value.charAt(endIdx - 1); // TODO: is this reversed?
                            endIdx--;
                        }
                        theSource = value.substr(startIdx, (endIdx) - startIdx);
                        // recreate the sourcephrase
                        phObj = new spModels.SourcePhrase({ spid: (newID), norder: nOrder, source: theSource, target: RetTarget, chapterid: selectedObj.get('chapterid'), prepuncts: prepuncts, follpuncts: follpuncts});
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
                    $("#phBefore").prop('disabled', true);
                    $("#phAfter").prop('disabled', true);
                    $("#Retranslation").prop('disabled', true);
                    $("#Phrase").prop('disabled', true);
                    $("#mnuPHBefore").prop('disabled', true);
                    $("#mnuPHAfter").prop('disabled', true);
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
                    if (editorMode === editorModeEnum.ADAPTING) {
                        $(selectedStart).find(".target").blur();
                    } else if (editorMode === editorModeEnum.GLOSSING) {
                        $(selectedStart).find(".gloss").blur();
                    } else {
                        $(selectedStart).find("#fteditor").blur();
                    }
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
                // initial state: adapting -- show adapting-related UI
                editorMode = editorModeEnum.ADAPTING;
                $("#adapt-toolbar").addClass("show");
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
                "click #Plus-menu": "togglePlusMenu",
                "click #More-menu": "toggleMoreMenu",
                "click #phBefore": "togglePHBefore",
                "click #phAfter": "togglePHAfter",
                "click #Phrase": "togglePhrase",
                "click #Retranslation": "toggleRetranslation",
                "click #SearchPrev": "onSearchPrev",
                "click #SearchNext": "onSearchNext",
                "click #SearchClose": "onSearchClose",
                "click #mnuPHBefore": "togglePHBefore",
                "click #mnuPHAfter": "togglePHAfter",
                "click #mnuPhrase": "togglePhrase",
                "click #mnuRetranslation": "toggleRetranslation",
                "click #mnuTranslations": "onKBTranslations",
                "click #mnuFindRS": "onSearchRS",
                "click #mnuPreview": "togglePreview",
                "click #mnuAdapting": "onModeAdapting",
                "click #mnuGlossing": "onModeGlossing",
                "click #mnuFreeTrans": "onModeFreeTrans",
                "mouseup #fteditor": "selectedFT",
                "touchend #fteditor": "selectedFT",
                "click #fteditor": "selectedFT",
                "keydown #fteditor": "editFT",
                "blur #fteditor": "unselectedFT",
                "click #mnuHelp": "onHelp"
            },
            UndoClick: function (event) {
                console.log("UndoClick: entry");
                // dismiss the Plus and More menu if visible
                if ($("#adapt-actions-menu").hasClass("show")) {
                    $("#adapt-actions-menu").toggleClass("show");
                }
                if ($("#ft-actions-menu").hasClass("show")) {
                    $("#ft-actions-menu").toggleClass("show");
                }
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
                // dismiss the Plus and More menu if visible
                if ($("#adapt-actions-menu").hasClass("show")) {
                    $("#adapt-actions-menu").toggleClass("show");
                }
                if ($("#ft-actions-menu").hasClass("show")) {
                    $("#ft-actions-menu").toggleClass("show");
                }
                if ($("#MoreActionsMenu").hasClass("show")) {
                    $("#MoreActionsMenu").toggleClass("show");
                }
                if (selectedStart !== null) {
                    // clear out any pile selection / long selection
                    $("div").removeClass("ui-selecting ui-selected ui-longSelecting");
                    LongPressSectionStart = null;
                    isLongPressSelection = false;
                    // move
                    isDirty = true;
                    MovingDir = -1; // backwards
                    this.listView.moveCursor(event, false);
                }
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
                // dismiss the Plus and More menu if visible
                if ($("#adapt-actions-menu").hasClass("show")) {
                    $("#adapt-actions-menu").toggleClass("show");
                }
                if ($("#ft-actions-menu").hasClass("show")) {
                    $("#ft-actions-menu").toggleClass("show");
                }
                if ($("#MoreActionsMenu").hasClass("show")) {
                    $("#MoreActionsMenu").toggleClass("show");
                }
                if (selectedStart !== null) {
                    // clear out any pile selection / long selection
                    $("div").removeClass("ui-selecting ui-selected ui-longSelecting");
                    LongPressSectionStart = null;
                    isLongPressSelection = false;
                    // move
                    isDirty = true;
                    MovingDir = 1; // forwards
                    this.listView.moveCursor(event, true);
                }
            },
            // Plus menu toggle
            togglePlusMenu: function (event) {
                // hide the more actions menu if visible
                if ($("#MoreActionsMenu").hasClass("show")) {
                    $("#MoreActionsMenu").toggleClass("show");
                }
                // stop any help tour
                hopscotch.endTour();
                // toggle the plus menu popup (depends on the editor mode)
                if (editorMode === editorModeEnum.ADAPTING) {
                    $("#adapt-actions-menu").toggleClass("show");
                } else if (editorMode === editorModeEnum.FREE_TRANSLATING) {
                    $("#ft-actions-menu").toggleClass("show");
                }
                // do not bubble this event up to the title bar
                event.stopPropagation();
            },
            toggleMoreMenu: function (event) {
                // hide the plus menu if visible
                if ($("#adapt-actions-menu").hasClass("show")) {
                    $("#adapt-actions-menu").toggleClass("show");
                }
                if ($("#ft-actions-menu").hasClass("show")) {
                    $("#ft-actions-menu").toggleClass("show");
                }
                // stop any help tour
                hopscotch.endTour();
                $("#MoreActionsMenu").toggleClass("show");
                // do not bubble this event up to the title bar
                event.stopPropagation();
            },
            togglePreview: function (event) {
                // dismiss the Plus and More menu if visible
                if ($("#adapt-actions-menu").hasClass("show")) {
                    $("#adapt-actions-menu").toggleClass("show");
                }
                if ($("#ft-actions-menu").hasClass("show")) {
                    $("#ft-actions-menu").toggleClass("show");
                }
                if ($("#MoreActionsMenu").hasClass("show")) {
                    $("#MoreActionsMenu").toggleClass("show");
                }
                this.listView.togglePreview(event);
                // do not bubble this event up to the title bar
                event.stopPropagation();
            },
            onModeAdapting: function (event) {
                // check / uncheck menu items as appropriate
                if ($("#optAdapting").hasClass("invisible")) {
                    $("#optAdapting").removeClass("invisible");
                }
                if (!$("#optGlossing").hasClass("invisible")) {
                    $("#optGlossing").addClass("invisible");
                }
                if (!$("#optFreeTrans").hasClass("invisible")) {
                    $("#optFreeTrans").addClass("invisible");
                }
                if (!$("#adapt-toolbar").hasClass("show")) {
                    $("#adapt-toolbar").addClass("show");
                }
                if ($("#ft-toolbar").hasClass("show")) {
                    $("#ft-toolbar").removeClass("show");
                }
                // dismiss the Plus and More menu if visible
                if ($("#Plus-menu").hasClass("invisible")) {
                    $("#Plus-menu").removeClass("invisible");
                }
                if ($("#adapt-actions-menu").hasClass("show")) {
                    $("#adapt-actions-menu").toggleClass("show");
                }
                if ($("#ft-actions-menu").hasClass("show")) {
                    $("#ft-actions-menu").toggleClass("show");
                }
                if ($("#MoreActionsMenu").hasClass("show")) {
                    $("#MoreActionsMenu").toggleClass("show");
                }
                if ($("#plus-menu-btn").hasClass("topcoat-icon--plus-menu-ft")) {
                    $("#plus-menu-btn").removeClass("topcoat-icon--plus-menu-ft");
                    $("#plus-menu-btn").addClass("topcoat-icon--plus-menu");
                }
                this.listView.onModeAdapting(event);
                // do not bubble this event up to the title bar
                event.stopPropagation();
            },
            onModeGlossing: function (event) {
                // check / uncheck menu items as appropriate
                if (!$("#optAdapting").hasClass("invisible")) {
                    $("#optAdapting").addClass("invisible");
                }
                if ($("#optGlossing").hasClass("invisible")) {
                    $("#optGlossing").removeClass("invisible");
                }
                if (!$("#optFreeTrans").hasClass("invisible")) {
                    $("#optFreeTrans").addClass("invisible");
                }
                if ($("#adapt-toolbar").hasClass("show")) {
                    $("#adapt-toolbar").removeClass("show");
                }
                if ($("#ft-toolbar").hasClass("show")) {
                    $("#ft-toolbar").removeClass("show");
                }
                // dismiss the Plus and More menu if visible
                if (!$("#Plus-menu").hasClass("invisible")) {
                    $("#Plus-menu").addClass("invisible");
                }
                if ($("#adapt-actions-menu").hasClass("show")) {
                    $("#adapt-actions-menu").toggleClass("show");
                }
                if ($("#ft-actions-menu").hasClass("show")) {
                    $("#ft-actions-menu").toggleClass("show");
                }
                if ($("#MoreActionsMenu").hasClass("show")) {
                    $("#MoreActionsMenu").toggleClass("show");
                }
                this.listView.onModeGlossing(event);
                // do not bubble this event up to the title bar
                event.stopPropagation();
            },
            onModeFreeTrans: function (event) {
                // check / uncheck menu items as appropriate
                if (!$("#optAdapting").hasClass("invisible")) {
                    $("#optAdapting").addClass("invisible");
                }
                if (!$("#optGlossing").hasClass("invisible")) {
                    $("#optGlossing").addClass("invisible");
                }
                if ($("#optFreeTrans").hasClass("invisible")) {
                    $("#optFreeTrans").removeClass("invisible");
                }
                if ($("#adapt-toolbar").hasClass("show")) {
                    $("#adapt-toolbar").removeClass("show");
                }
                if (!$("#ft-toolbar").hasClass("show")) {
                    $("#ft-toolbar").addClass("show");
                }
                // dismiss the Plus and More menu if visible
                if ($("#Plus-menu").hasClass("invisible")) {
                    $("#Plus-menu").removeClass("invisible");
                }
                if ($("#adapt-actions-menu").hasClass("show")) {
                    $("#adapt-actions-menu").toggleClass("show");
                }
                if ($("#ft-actions-menu").hasClass("show")) {
                    $("#ft-actions-menu").toggleClass("show");
                }
                if ($("#MoreActionsMenu").hasClass("show")) {
                    $("#MoreActionsMenu").toggleClass("show");
                }
                if ($("#plus-menu-btn").hasClass("topcoat-icon--plus-menu")) {
                    $("#plus-menu-btn").removeClass("topcoat-icon--plus-menu");
                    $("#plus-menu-btn").addClass("topcoat-icon--plus-menu-ft");
                }
                this.listView.onModeFreeTrans(event);
                // do not bubble this event up to the title bar
                event.stopPropagation();
            },

            // For the placeholders, etc., just pass the event handler down to the list view to handle
            togglePHBefore: function (event) {
                // dismiss the Plus and More menu if visible
                if ($("#adapt-actions-menu").hasClass("show")) {
                    $("#adapt-actions-menu").toggleClass("show");
                }
                if ($("#ft-actions-menu").hasClass("show")) {
                    $("#ft-actions-menu").toggleClass("show");
                }
                if ($("#MoreActionsMenu").hasClass("show")) {
                    $("#MoreActionsMenu").toggleClass("show");
                }
                this.listView.togglePHBefore(event);
                // do not bubble this event up to the title bar
                event.stopPropagation();
            },
            togglePHAfter: function (event) {
                // dismiss the Plus and More menu if visible
                if ($("#adapt-actions-menu").hasClass("show")) {
                    $("#adapt-actions-menu").toggleClass("show");
                }
                if ($("#ft-actions-menu").hasClass("show")) {
                    $("#ft-actions-menu").toggleClass("show");
                }
                if ($("#MoreActionsMenu").hasClass("show")) {
                    $("#MoreActionsMenu").toggleClass("show");
                }
                this.listView.togglePHAfter(event);
                // do not bubble this event up to the title bar
                event.stopPropagation();
            },
            togglePhrase: function (event) {
                // dismiss the Plus and More menu if visible
                if ($("#adapt-actions-menu").hasClass("show")) {
                    $("#adapt-actions-menu").toggleClass("show");
                }
                if ($("#ft-actions-menu").hasClass("show")) {
                    $("#ft-actions-menu").toggleClass("show");
                }
                if ($("#MoreActionsMenu").hasClass("show")) {
                    $("#MoreActionsMenu").toggleClass("show");
                }
                this.listView.togglePhrase(event);
                // do not bubble this event up to the title bar
                event.stopPropagation();
            },
            toggleRetranslation: function (event) {
                // dismiss the Plus and More menu if visible
                if ($("#adapt-actions-menu").hasClass("show")) {
                    $("#adapt-actions-menu").toggleClass("show");
                }
                if ($("#ft-actions-menu").hasClass("show")) {
                    $("#ft-actions-menu").toggleClass("show");
                }
                if ($("#MoreActionsMenu").hasClass("show")) {
                    $("#MoreActionsMenu").toggleClass("show");
                }
                this.listView.toggleRetranslation(event);
                // do not bubble this event up to the title bar
                event.stopPropagation();
            },
            // User clicked on a blank area of the screen
            unselectPiles: function (event) {
                var isBlankArea = false;
                // dismiss the Plus and More menu if visible
                if ($("#adapt-actions-menu").hasClass("show")) {
                    $("#adapt-actions-menu").toggleClass("show");
                }
                if ($("#ft-actions-menu").hasClass("show")) {
                    $("#ft-actions-menu").toggleClass("show");
                }
                if ($("#MoreActionsMenu").hasClass("show")) {
                    $("#MoreActionsMenu").toggleClass("show");
                }
                // stop any help tour
                hopscotch.endTour();
                if (event.toElement === null) {
                    // toElement doesn't work on this device -- use target to obtain where the event hit
                    isBlankArea = (!($(event.target).hasClass('strip') || $(event.target).hasClass('pile') || $(event.target).hasClass('marker') || $(event.target).hasClass('source') || $(event.target).hasClass('target')));
                } else {
                    // toElement works -- use it
                    isBlankArea = (!($(event.toElement).hasClass('strip') || $(event.toElement).hasClass('pile') || $(event.toElement).hasClass('marker') || $(event.toElement).hasClass('source') || $(event.toElement).hasClass('target')));
                }
                // only do this if we're in a blank area of the screen
                if (isBlankArea === true) {
                    console.log("UnselectPiles: clicked in a blank area; removing selection");
                    if (selectedStart !== null) {
                        $("div").removeClass("ui-selecting ui-selected ui-longSelecting");
                        $("#phBefore").prop('disabled', true);
                        $("#Retranslation").prop('disabled', true);
                        $("#Phrase").prop('disabled', true);
                        $("#mnuPHBefore").prop('disabled', true);
                        $("#mnuRetranslation").prop('disabled', true);
                        $("#mnuPhrase").prop('disabled', true);
                    }
                    // disable the "more translations" menu
                    if (!$("#mnuTranslations").hasClass("menu-disabled")) {
                        $("#mnuTranslations").addClass("menu-disabled");
                    }
                    if (!$("#mnuFindRS").hasClass("menu-disabled")) {
                        $("#mnuFindRS").addClass("menu-disabled");
                    }
                    selectedStart = null; // clear selection itself
                    LongPressSectionStart = null;
                    isLongPressSelection = false;
                    MovingDir = 0;
                }
            },
            // User clicked the Free Translation edit field
            selectedFT: function () {
                console.log("selectedFT: enter");
                var idxStart = 0, 
                    idxEnd = 0,
                    strFT = "",
                    FTEmpty = true,
                    keep_going = false,
                    temp_cursor = null,
                    next_edit = null;

                // is there a current selection?
                if (selectedStart === null) {
                    // no current selection, but we need one -- 
                    // first see if there's a lastAdaptedPile
                    if ($('#pile-' + project.get('lastAdaptedSPID')).length !== 0) {
                        selectedStart = $('#pile-' + project.get('lastAdaptedSPID')).get(0);
                    }
                    if (selectedStart === null) {
                        // no lastAdaptedSPID -- just grab the first pile
                        selectedStart = $(".pile").first().get(0);
                    }
                } 
                // keep a copy of the SPID we're working on
                $("#fteditor").attr("data-spid", $(selectedStart).attr('id'));
                // is there already a free translation?
                strFT = $(selectedStart).find(".ft").html();
                if (strFT) {
                    FTEmpty = false;
                } else {
                    strFT = "";
                }
                if (selectedEnd === null) {
                    // need to find the end of this FT selection
                    temp_cursor = selectedEnd = selectedStart; // initial value
                    // move forwards from the start to either the next SP with a free translation defined OR
                    // the end of the strip
                    keep_going = true;
                    while (keep_going === true) {
                        // move forwards
                        if (temp_cursor !== null) {
                            next_edit = temp_cursor;
                            if ((next_edit.nextElementSibling !== null) && ($(next_edit.nextElementSibling).hasClass('pile')) && (!$(next_edit.nextElementSibling).hasClass('filter'))) {
                                // there is a next sibling, and it is a non-filtered pile
                                temp_cursor = next_edit.nextElementSibling;
                                // does it have a free translation?
                                var ft = $(temp_cursor).find(".ft").html();
                                if (ft) {
                                    // found the next free translation -- stop moving forward
                                    console.log("selectedFT - stop end of selection before FT: " + ft);
                                    keep_going = false;
                                } 
                            } else {
                                // reached a stopping point
                                keep_going = false;
                            }
                        } else {
                            // no temp_cursor
                            keep_going = false;
                        }
                    }
                    // found the selection end -- set the value
                    selectedEnd = next_edit;
                }
                // set the last selected FT slot to then END of our selection
                lastSelectedFT = selectedEnd;
                // we're also working on a specific source phrase (the FT gets saved there) -
                // set the last selected SPID
                project.set('lastAdaptedSPID', selectedStart.id.substr(5));
                // now select the piles in the UI, and build the default FT text if we need to
                idxStart = $(selectedStart).index(); 
                idxEnd = $(selectedEnd).index();
                $("div").removeClass("ui-selecting ui-selected");
                $(selectedStart.parentElement).children().each(function (index, value) {
                    if (index >= idxStart && index <= idxEnd) {
                        $(value).addClass("ui-selected");
                        // if there's no FT defined, build it from the selected target texts
                        if (FTEmpty === true) {
                            strFT += $(value).find(".target").html() + " ";
                        }
                    }
                });
                // Scroll to the selection
                var top = $(selectedStart)[0].offsetTop - (($(window).height() - $(selectedStart).outerHeight(true)) / 2);
                console.log("scrollTop: " + top);
                $("#content").scrollTop(top);
                lastOffset = top;
                // add the FT text
                $("#fteditor").html(strFT.trim());
            },

            // user pressed a key in the Free Translation edit field
            editFT: function (event) {
                console.log("editFT: enter");
                var strID = null,
                    model = null;
                // ignore event if we're in preview mode
                if (inPreview === true) {
                    return;
                }
                if (event.keyCode === 27) {
                    // Escape key pressed -- cancel the edit (reset the content) and blur
                    // Note that this key is not on most on-screen keyboards;
                    // also note that we're looking at the FT edit area's "data-spid" attribute that
                    // we copied over from the selectedStart pile
                    strID = $(event.currentTarget).attr('data-spid');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    model = this.spList.findWhere({spid: strID});
                    $(event.currentTarget).html(model.get('freetrans')); // original FT value for the selected pile
                    event.stopPropagation();
                    event.preventDefault();
                    $(event.currentTarget).blur();
                } else if ((event.keyCode === 9) || (event.keyCode === 13)) {
                    // tab or enter key -- accept the edit and move the cursor
                    event.preventDefault();
                    event.stopPropagation();
                    isDirty = true;
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

            // focus moved from the Free Translation edit field
            // this can be called either programatically (tab / shift+tab keydown response) or
            // by a selection of something else on the page.
            // This method updates the model (AI Document) if they have any changes.
            unselectedFT: function (event) {
                var value = null,
                    trimmedValue = null,
                    strID = null,
                    UI_ID = null,
                    model = null;
                // ignore event if we're in preview mode
                if (inPreview === true) {
                    return;
                }
                console.log("unselectedFT: event type=" + event.type + ", isDirty=" + isDirty + ", scrollTop=" + $("#chapter").scrollTop());
                if (isSelectingKB === true) {
                    isSelectingKB = false; // TODO: not sure if this is needed in FT mode
                }
                if ($(window).height() < 200) {
                    // smaller window height -- hide the marker line
                    $(".marker").removeClass("hide");
                    $(".pile").removeClass("condensed-pile");
                }

                // get the FT text
                value = $(event.currentTarget).text();
                // if needed use regex to replace chars we don't want stored in escaped format
                //value = value.replace(new RegExp("&quot;", 'g'), '"');  // klb
                trimmedValue = value.trim();
                // find the model object associated with this edit field
                UI_ID = strID = $(event.currentTarget).attr('data-spid');
                strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                model = this.spList.findWhere({spid: strID});
                origText = model.get("freetrans");
                // check for changes in the edit field 
                isEditing = false;
                if (isDirty === true) {
                    if (trimmedValue.length === 0) {
                        // empty value entered. Was there text before?
                        if (origText.length > 0) {
                            console.log("User deleted target text: " + origText + " -- removing from DB.");
                            // update the model with the new FT text (nothing)
                            model.save({freetrans: trimmedValue});
                        }
                    } else {
                        // update the model with the new target text
                        model.save({freetrans: trimmedValue});
                    }
                    // update the FT line in the selectedStart pile
                    $(UI_ID).find(".ft").html(trimmedValue);
                } 
                // check for an old selection and remove it if needed
                if (selectedStart !== null) {
                    // there was an old selection -- remove the ui-selected class
                    $("div").removeClass("ui-selecting ui-selected");
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
            },
            
            // User clicked the search previous button -- move to the previous item in the search results list;
            // wrap around to the end if needed
            onSearchPrev: function (event) {
                event.stopPropagation();
                var spOld = window.Application.searchList[window.Application.searchIndex];
                // decrement the index and load the sourcephrase
                window.Application.searchIndex--;
                if (window.Application.searchIndex === 0) {
                    // reached the beginning -- disable the back button
                    $("#SearchPrev").prop('disabled', true);
                } else if (window.Application.searchIndex === (window.Application.searchList.length - 2)) {
                    // now able to go forward -- enable the next button
                    $("#SearchNext").prop('disabled', false);
                }
                var spNew = window.Application.searchList[window.Application.searchIndex];
                // do we need to load a chapter?
                if (spNew.get("chapterid") !== spOld.get("chapterid")) {
                    // yes -- load it now
                    window.Application.router.navigate("adapt/" + spNew.get("chapterid"), {trigger: true});
                }
                // if we haven't re-routed, our spid is in this chapter. Go to it now.
                $("#SearchIndex").html("(" + (window.Application.searchIndex + 1) + "/" + window.Application.searchList.length + ")");
                project.set('lastAdaptedSPID', spNew.get("spid"));
                isSelecting = true;
                lastTapTime = null; // clear out the last tap -- we just want to select this item
                if ($('#pile-' + project.get('lastAdaptedSPID')).length !== 0) {
                    console.log("render: selecting lastAdaptedSPID:" + project.get('lastAdaptedSPID'));
                    // everything's okay -- select the last adapted SPID
                    selectedStart = $('#pile-' + project.get('lastAdaptedSPID')).get(0);
                    selectedEnd = selectedStart;
                    idxStart = $(selectedStart).index() - 1;
                    idxEnd = idxStart;
                    // select it
                    scrollToView(selectedStart);
                    $(selectedStart).mouseup();
                }
            },
                                                   
            // User clicked the search next button -- move to the next item in the search results list;
            // disable the button if we're at the last hit in this chapter
            onSearchNext: function (event) {
                event.stopPropagation();
                var spOld = window.Application.searchList[window.Application.searchIndex];
                // decrement the index and load the sourcephrase
                window.Application.searchIndex++;
                if (window.Application.searchIndex === (window.Application.searchList.length - 1)) {
                    // reached the end -- disable the forward button
                    $("#SearchNext").prop('disabled', true);
                } else if (window.Application.searchIndex === 1) {
                    // now able to go back -- enable the back button
                    $("#SearchPrev").prop('disabled', false);
                }
                var spNew = window.Application.searchList[window.Application.searchIndex];
                // do we need to load a chapter?
                if (spNew.get("chapterid") !== spOld.get("chapterid")) {
                    // yes -- load it now
                    window.Application.router.navigate("adapt/" + spNew.get("chapterid"), {trigger: true});
                }
                // if we haven't re-routed, our spid is in this chapter. Go to it now.
                $("#SearchIndex").html("(" + (window.Application.searchIndex + 1) + "/" + window.Application.searchList.length + ")");
                project.set('lastAdaptedSPID', spNew.get("spid"));
                isSelecting = true;
                lastTapTime = null; // clear out the last tap -- we just want to select this item
                if ($('#pile-' + project.get('lastAdaptedSPID')).length !== 0) {
                    console.log("render: selecting lastAdaptedSPID:" + project.get('lastAdaptedSPID'));
                    // everything's okay -- select the last adapted SPID
                    selectedStart = $('#pile-' + project.get('lastAdaptedSPID')).get(0);
                    selectedEnd = selectedStart;
                    idxStart = $(selectedStart).index() - 1;
                    idxEnd = idxStart;
                    // select it
                    scrollToView(selectedStart);
                    $(selectedStart).mouseup();
                }
            },
                
            // User clicked the close button -- close the search bar and clear out the search results list, 
            // indicating that we're no longer searching
            onSearchClose: function () {
                // hide the search bar
                $("#SearchBar").removeClass("show-flex");
                $("#content").removeClass("with-search");
                // clear out the list
                window.Application.searchIndex = 0;
                if (window.Application.searchList) {
                    window.Application.searchList.length = 0;
                }
            },
            
            // Show Translation menu handler. Displays the possible translations for the selected sourcephrase.
            onKBTranslations: function (event) {
                if ($("#mnuTranslations").hasClass("menu-disabled")) {
                    return; // menu not enabled -- get out
                }
                if (selectedStart === null) {
                    return; // no selection to look at
                }
                event.stopPropagation();
                // dismiss the Plus and More menu if visible
                if ($("#adapt-actions-menu").hasClass("show")) {
                    $("#adapt-actions-menu").toggleClass("show");
                }
                if ($("#ft-actions-menu").hasClass("show")) {
                    $("#ft-actions-menu").toggleClass("show");
                }
                if ($("#MoreActionsMenu").hasClass("show")) {
                    $("#MoreActionsMenu").toggleClass("show");
                }
                // update the lastAdaptedSPID -- this tells us our current translation
                project.set('lastAdaptedSPID', selectedStart.id.substr(5));
                this.listView.showTranslations();
            },
            
            // search for the selectedStart's RefString, IF there is something in the source and target
            onSearchRS: function (event) {
                var searchRS = "";
                event.stopPropagation();
                // sanity checks: is this menu disabled? Is there a selection to search for?
                if ($("#mnuFindRS").hasClass("menu-disabled")) {
                    return;
                }
                if (selectedStart === null) {
                    return; // no selection to look at
                }
                var src = this.listView.stripPunctuation($(selectedStart).find('.source').html().trim(), true);
                var tgt = this.listView.stripPunctuation($(selectedStart).find('.target').html().trim(), false);
                if ((src.length === 0) || (tgt.length === 0)) {
                    // no source->target pair to look for -- exit
                    return;
                }
                // close out any old results
                this.onSearchClose();
                // dismiss the Plus and More menu if visible
                if ($("#adapt-actions-menu").hasClass("show")) {
                    $("#adapt-actions-menu").toggleClass("show");
                }
                if ($("#ft-actions-menu").hasClass("show")) {
                    $("#ft-actions-menu").toggleClass("show");
                }
                if ($("#MoreActionsMenu").hasClass("show")) {
                    $("#MoreActionsMenu").toggleClass("show");
                }
                // Search for matching source phrases
                var spList = new spModels.SourcePhraseCollection();
//                var ary = null;
                spList.fetch({
                    reset: true,
                    data: {source: src},
                    success: function (ary) {
                        console.log("onSearchRS:success");
                        window.Application.searchList = ary.filter(function (element) {
                            // source - needs to match text + punct (the SELECT db statement is wider than we want)
                            if (src.length !== element.attributes.source.length - (element.attributes.prepuncts.length + element.attributes.follpuncts.length)) {
                                return false;
                            }
                            // target -
                            // are the strings the same? (ignore case)
                            if (element.attributes.target.toUpperCase() === tgt.toUpperCase()) {
                                // strings are equivalent -- return true
                                return true;
                            }
                            // do the strings differ in just punctuation?
                            var tmpVal = element.attributes.target.toUpperCase().substring(0, element.attributes.target.length - element.attributes.follpuncts.length);
                            tmpVal = tmpVal.substring(element.attributes.prepuncts.length);
                            if (tmpVal === tgt.toUpperCase()) {
                                return true; // string is the same, it just has punctuation tacked on
                            }
                            return false; // at least one condition failed -- these strings are not equivalent
                        });
                        if (window.Application.searchList.length > 0) {
                            // if we made it this far, we have at least one search result (yay!)
                            // figure out where selectedStart is in the list
                            var i = 0;
                            window.Application.searchIndex = 0; // initial value
                            for (i = 0; i < window.Application.searchList.length; i++) {
                                if (window.Application.searchList[i].get("spid") === selectedStart.id.substr(5)) {
                                    // found it -- set the searchIndex value
                                    window.Application.searchIndex = i;
                                    break;
                                }
                            }
                            // show the search bar UI
                            if (!($("#SearchBar").hasClass("show-flex"))) {
                                $("#SearchBar").addClass("show-flex");
                                $("#content").addClass("with-search");
                            }
                            if (window.Application.searchIndex === 0) {
                                // can't go back -- disable the back button
                                $("#SearchPrev").prop('disabled', true);
                            } else {
                                $("#SearchPrev").prop('disabled', false);
                            }
                            if (window.Application.searchIndex === (window.Application.searchList.length - 1)) {
                                // can't go forward -- disable the next button
                                $("#SearchNext").prop('disabled', true);
                            } else {
                                $("#SearchNext").prop('disabled', false);
                            }
                            searchRS = src + " -> " + tgt;
                            $("#SearchRS").html(searchRS);
                            $("#SearchIndex").html("(" + (window.Application.searchIndex + 1) + "/" + window.Application.searchList.length + ")");
                        }
                    },
                    error: function () {
                        console.log("onSearchRS");
                    }
                });
            },
            
            // Help menu handler for the adaptation screen. Starts the hopscotch walkthrough to orient the user
            // to the UI elements on this screen.
            onHelp: function (event) {
                // dismiss the Plus and More menu if visible
                if ($("#adapt-actions-menu").hasClass("show")) {
                    $("#adapt-actions-menu").toggleClass("show");
                }
                if ($("#ft-actions-menu").hasClass("show")) {
                    $("#ft-actions-menu").toggleClass("show");
                }
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
                        target: "Plus-menu",
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
                        title: i18next.t('view.hlpMoreActions'),
                        content: i18next.t('view.hlpdscMoreActions'),
                        target: "More-menu",
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
                var theStepNums = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
                if (width < 480) {
                    // Plus button instead of toggles
                    theSteps = step1.concat(stepMoreBtn, stepLastBtns);
                } else {
                    // Toggle buttons
                    theSteps = step1.concat(stepToggleBtns, stepLastBtns);
                }
                theStepNums.splice(theSteps.length, (theStepNums.length - theSteps.length)); // trim the step numbers array
                var tour = {
                    id: "hello-hopscotch",
                    i18n: {
                        nextBtn: i18next.t("view.lblNext"),
                        prevBtn: i18next.t("view.lblPrev"),
                        doneBtn: i18next.t("view.lblFinish"),
                        skipBtn: i18next.t("view.lblNext"),
                        closeTooltip: i18next.t("view.lblNext"),
                        stepNums: theStepNums
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
