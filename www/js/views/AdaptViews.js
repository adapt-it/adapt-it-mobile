/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Underscore  = require('underscore'),
        Handlebars  = require('handlebars'),
        Backbone    = require('backbone'),
        Marionette  = require('marionette'),
        i18next     = require('i18n'),
        hopscotch   = require('hopscotch'),
        ta          = require('typeahead'),
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
        kblist      = null, // real value passed in constructor
        project     = null, // real value passed in constructor
        chapter     = null, // real value passed in constructor
        USFMMarkers = null,
        selectedStart = null,
        selectedEnd = null,
        idxStart = null,
        idxEnd = null,
        clearKBInput = false,
        isDirty = false,
        isSelecting = false,
        isPlaceholder = false,
        isPhrase = false,
        isDrafting = true,
        isSelectingFirstPhrase = false,
        isAutoPhrase = false,
        curIdx = 0,
        prevIdx = 0,
        MovingDir = 0, // -1 = backwards, 0 = not moving, 1 = forwards
        idx = 1,
        isRetranslation = false,
        template = null,
        punctsSource = [],
        punctsTarget = [],
        caseSource = [],
        caseTarget = [],
        tmpTargetValue = "",

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
                    for (i = 0; i < refstrings.length; i++) {
                        if (refstrings[i].target === oldTargetValue) {
                            if (refstrings[i].n !== '0') {
                                // more than one refcount -- decrement it
                                refstrings[i].n--;
                            }
                            break;
                        }
                    }
                }
                // add or increment the new value
                for (i = 0; i < refstrings.length; i++) {
                    if (refstrings[i].target === targetValue) {
                        refstrings[i].n++;
                        found = true;
                        break;
                    }
                }
                if (found === false) {
                    // no entry in KB with this source/target -- add one
                    var newRS = {
                            'target': _.unescape(targetValue),  //klb
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
                                target: _.unescape(targetValue),  //klb
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


        addStyleRules = function (project) {
            var sheet = window.document.styleSheets[window.document.styleSheets.length - 1]; // current stylesheet
            var theRule = "";
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
            // if both languages are RTL, switch the layout of the chapter element and flow of text
            if (project.get('SourceDir') === 'rtl' && project.get('TargetDir') === 'rtl') {
                theRule = "#chapter { direction: rtl; }";
                sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
                theRule = ".pile, .strip-header {";
                theRule += "float: right;";
                theRule += "}";
                sheet.insertRule(theRule, sheet.cssRules.length); // add to the end (last rule wins)
            }
            // override individual text directions
            if (project.get('SourceDir') === 'rtl') {
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
//                console.log("SourcePhraseListView::initialize");
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
                if (this.collection.length === 0) {
                    template = Handlebars.compile(tplLoadingPleaseWait);
                    this.$el.html(template());
                    $("#OK").hide();
                } else {
                    // add the collection
    //                console.log("SourcePhraseListView::render");
                    template = Handlebars.compile(tplSourcePhraseList);
                    this.$el.html(template(this.collection.toJSON()));
                    // go back and add the individual piles
                    this.collection.each(this.addOne, this);
                    // Do we have a placeholder from a previous adaptation session?
                    if (project && project.get('lastAdaptedSPID').length > 0) {
                        // yes -- select it
                        isSelecting = true;
                        if ($('#' + project.get('lastAdaptedSPID')).length !== 0) {
                            // everything's okay -- select the last adapted SPID
//                            $(selectedStart).find('.source').mouseup();
                            selectedStart = $('#' + project.get('lastAdaptedSPID')).get(0);
                            selectedEnd = selectedStart;
                            idxStart = $(selectedStart).index() - 1;
                            idxEnd = idxStart;
                            $(selectedStart.childNodes[4]).mouseup();
                        } else {
                            // for some reason the last adapted SPID has gotten out of sync --
                            // select the first block instead
                            selectedStart = $(".pile").first().get(0);
                            selectedEnd = selectedStart;
                            idxStart = $(selectedStart).index() - 1;
                            idxEnd = idxStart;
                            if (selectedStart !== null) {
//                                $(selectedStart).find('.source').mouseup();
                                $(selectedStart.childNodes[4]).mouseup();
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
//                            $(selectedStart).find('.source').mouseup();
                            $(selectedStart.childNodes[4]).mouseup();
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
            // This method is called from unselectedAdaptation before the target text is stored in the KB,
            // so we don't store items w
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
            // Helper method to move the editing cursor forwards or backwards one pile.
            // this also calls blur(), which saves any changes.
            moveCursor: function (event, moveForward) {
                var next_edit = null;
                var temp_cursor = null;
                console.log("moveCursor");
                event.stopPropagation();
                event.preventDefault();
                $(event.currentTarget).blur();
                if (moveForward === false) {
                    // move backwards
                    next_edit = selectedStart.previousElementSibling;
                    if (next_edit.id.substr(0, 4) !== "pile") {
                        // Probably a header -- see if you can go to the previous strip
                        if (selectedStart.parentElement.previousElementSibling !== null) {
                            temp_cursor = selectedStart.parentElement.previousElementSibling;
                            if ($(temp_cursor).hasClass("filter")) {
                                // this is a filter strip -- keep going
                                while (temp_cursor && $(temp_cursor).hasClass("filter")) {
                                    temp_cursor = temp_cursor.previousElementSibling; // back one more strip
                                }
                            }
                            if (temp_cursor) {
                                next_edit = temp_cursor.lastElementChild;
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
                        // last pile in the strip -- see if you can go to the next strip
                        if (selectedStart.parentElement.nextElementSibling !== null) {
                            temp_cursor = selectedStart.parentElement.nextElementSibling;
                            if ($(temp_cursor).hasClass("filter")) {
                                // this is a filter strip -- keep going
                                while (temp_cursor && $(temp_cursor).hasClass("filter")) {
                                    temp_cursor = temp_cursor.nextElementSibling; // forward one more strip
                                }
                            }
                            if (temp_cursor) {
                                next_edit = temp_cursor.childNodes[3];
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
                                                window.Application.adaptChapter(nextChapter);

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
                                        window.Application.adaptChapter(nextChapter);
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
                    $(next_edit.childNodes[4]).mouseup();
                } else {
                    // no next edit (reached the first or last pile) --
                    // clear out the moving direction so we don't keep going
                    MovingDir = 0;
                }
            },
            // Helper method to clear out the selection and disable the toolbar buttons
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
            },

            ////
            // Event Handlers
            ////
            events: {
                "mousedown .source": "selectingPilesStart",
                "touchstart .source": "selectingPilesStart",
                "touchstart .marker": "selectingPilesStart",
                "mousemove .source": "selectingPilesMove",
                "touchmove .source": "selectingPilesMove",
                "touchmove .marker": "selectingPilesMove",
                "mouseup .source": "selectingPilesEnd",
                "touchend .source": "selectingPilesEnd",
                "touchend .marker": "selectingPilesEnd",
                "mouseup .filter": "showFilter",
                "touchend .filter": "showFilter",
                "mouseup .pile": "checkStopSelecting",
                "mousedown .target": "selectingAdaptation",
                "touchstart .target": "selectingAdaptation",
                "mouseup .target": "selectedAdaptation",
                "touchend .target": "selectedAdaptation",
                "focus .target": "selectedAdaptation",
                "keydown .target": "editAdaptation",
                "typeahead:select .typeahead": "selectKB",
                "input .target": "checkForAutoMerge",
                "blur .target": "unselectedAdaptation"
            },

            // user is starting to select one or more piles
            selectingPilesStart: function (event) {
                var model = null,
                    strID = "";
                // if there was an old selection, remove it
                if (selectedStart !== null) {
                    $("div").removeClass("ui-selecting ui-selected");
                }
                selectedStart = event.currentTarget.parentElement; // select the pile, not the source (the currentTarget)
                selectedEnd = selectedStart;

                idxStart = $(selectedStart).index() - 1; // BUGBUG why off by one?
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
                $(event.currentTarget.parentElement).addClass("ui-selecting");
            },
            // user is starting to select one or more piles
            selectingPilesMove: function (event) {
                if (isRetranslation === true) {
                    return; // cannot select other items
                }
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
                    tmpEnd = document.elementFromPoint(touch.pageX, touch.pageY).parentElement; // pile (parent)
                    event.preventDefault();
                } else {
                    // mouse (web app)
                    tmpEnd = event.currentTarget.parentElement; // pile
                }
                // only interested if we're selecting in the same strip
                if ((isSelecting === true) &&
                        (tmpEnd.parentElement === selectedStart.parentElement)) {
                    // recalculate the new selectedEnd
                    selectedEnd = tmpEnd;
                    idxEnd = $(tmpEnd).index() - 1;
                    //console.log("selectedEnd: " + selectedEnd.id);
                    // remove ui-selecting from all piles in the strip
                    $(event.currentTarget.parentElement.parentElement.childNodes).removeClass("ui-selecting");
                    // add ui-selecting to the currently selected range
                    if (idxStart === idxEnd) {
                        // one item selected
                        $(event.currentTarget.parentElement).addClass("ui-selecting");
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
            // User released the mouse on a pile or target. Here we'll check to see if the user
            // started selecting a phrase and had a "fat finger" moment, missing the source line when
            // they finished their selection. If so, we'll manually fire a Mouse Up event on the
            // source line instead.
            checkStopSelecting: function (event) {
                if (isSelecting === true) {
                    // pretend the user wanted the last selected item to be the end of the selection
                    $(selectedEnd).find('.source').mouseup();
                }
            },
            // user released the mouse here (or the focus was set here -- see iOS comment below)
            selectingPilesEnd: function (event) {
                // re-add the contenteditable fields
                console.log("touches:" + event.touches + ", targetTouches: " + event.targetTouches + ", changedTouches: " + event.changedTouches);
                var tmpItem = null,
                    tmpIdx = 0,
                    strID = "",
                    selectedObj = null,
                    spid = "";
                console.log("selectingPilesEnd");
                // sanity check -- make sure there's a selectedStart
                if (selectedStart === null) {
                    selectedStart = event.currentTarget.parentElement;
                }
                if (isRetranslation === true) {
                    // for retranslations, we only want the first item selected (no multiple selections)
                    idxEnd = idxStart;
                    selectedEnd = selectedStart;
                }
                if (isSelecting === true) {
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
                        // set the class to ui-selected
                        $(selectedStart).addClass("ui-selected");
                    } else if (idxStart < idxEnd) {
                        // more than one item selected -- can create a placeholder, phrase, retrans
                        $("#Phrase").prop('disabled', false);
                        $("#Retranslation").prop('disabled', false);
                        $(selectedStart.parentElement).children(".pile").each(function (index, value) {
                            if (index >= idxStart && index <= idxEnd) {
                                $(value).addClass("ui-selected");
                            }
                        });
                    } else {
                        // more than one item selected -- can create a placeholder, phrase, retrans
                        $("#Phrase").prop('disabled', false);
                        $("#Retranslation").prop('disabled', false);
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
                    } else {
                        // not a placeholder -- can add a new one
                        isPlaceholder = false;
                        $("#Placeholder").prop('title', i18next.t("view.dscNewPlaceholder"));
                        $("#Placeholder .topcoat-icon").removeClass("topcoat-icon--placeholder-delete");
                        $("#Placeholder .topcoat-icon").addClass("topcoat-icon--placeholder-new");
                    }
                    // did the user select a phrase?
                    if ((spid.indexOf("phr") !== -1) && (selectedStart === selectedEnd)) {
                        // phrase (single selection) -- can remove it, but not add a new one
                        isPhrase = true;
                        $("#Phrase").prop('title', i18next.t("view.dscDelPhrase"));
                        $("#Phrase .topcoat-icon").removeClass("topcoat-icon--phrase-new");
                        $("#Phrase .topcoat-icon").addClass("topcoat-icon--phrase-delete");
                        $("#Phrase").prop('disabled', false); // enable toolbar button (to delete phrase)
                    } else {
                        // not a placeholder -- can add a new one
                        isPhrase = false;
                        $("#Phrase").prop('title', i18next.t("view.dscNewPhrase"));
                        $("#Phrase .topcoat-icon").removeClass("topcoat-icon--phrase-delete");
                        $("#Phrase .topcoat-icon").addClass("topcoat-icon--phrase-new");
                    }
                    // did the user select a retranslation?
                    if (spid.indexOf("ret") !== -1) {
                        // retranslation -- can remove it, but not add a new one
                        isRetranslation = true;
                        $("#Retranslation").prop('title', i18next.t("view.dscDelRetranslation"));
                        $("#Retranslation .topcoat-icon").removeClass("topcoat-icon--retranslation-new");
                        $("#Retranslation .topcoat-icon").addClass("topcoat-icon--retranslation-delete");
                        $("#Retranslation").prop('disabled', false); // enable toolbar button (to delete retranslation)
                    } else {
                        // not a retranslation -- can add a new one
                        isRetranslation = false;
                        $("#Retranslation").prop('title', i18next.t("view.dscNewRetranslation"));
                        $("#Retranslation .topcoat-icon").removeClass("topcoat-icon--retranslation-delete");
                        $("#Retranslation .topcoat-icon").addClass("topcoat-icon--retranslation-new");
                    }
                    $("#Placeholder").prop('disabled', false);
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
                var userCanSetFilter = false,
                    filterString = window.Application.filterList,
                    markers = [],
                    aryClasses = [],
                    filteredText = "",
                    idx = 0,
                    elt = null,
                    title = i18next.t('view.ttlFilteredText'),
                    message = i18next.t('view.dscFilterMarker');
                // Get the marker(s) being filtered here
                aryClasses = event.currentTarget.className.split(/\s+/);
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
                USFMMarkers.each(function (item, index, list) {
                    if (markers.indexOf(item.get('name')) >= 0) {
                        // this is one of the markers -- can the user set it?
                        if (item.get('userCanSetFilter') && item.get('userCanSetFilter') === '1') {
                            userCanSetFilter = true;
                        }
                    }
                });
                // get the source text being filtered out
                $(event.currentTarget).find(".source").each(function (idx, elt) {
                    filteredText += elt.innerHTML.trim() + " ";
                });
                message += markers.toString() + "\n" + i18next.t("view.dscFilteredText") + filteredText.trim();

                if (userCanSetFilter) {
                    // User can set this filter text
                    message += "\n\n" + i18next.t('view.dscUserCanSetFilter');
                    if (navigator.notification) {
                        // on mobile device
                        navigator.notification.alert(message, function () {},
                                                     i18next.t('view.ttlFilteredText'));
                    } else {
                        // in browser
                        alert(message);
                    }
                } else {
                    // read only -- just tell the user what was filtered
                    message += "\n\n" + i18next.t('view.dscUserCannotSetFilter', {marker: markers.toString()});
                    if (navigator.notification) {
                        // on mobile device
                        navigator.notification.alert(message, function () {},
                                                     i18next.t('view.ttlFilteredText'));
                    } else {
                        // in browser
                        alert(message);
                    }

                }
            },
            // mouseDown / touchStart event handler for the target field
            selectingAdaptation: function (event) {
                selectedStart = event.currentTarget.parentElement; // pile
                console.log("selectingAdaptation: " + selectedStart.id);
            },
            // mouseUp / touchEnd event handler for the target field
            selectedAdaptation: function (event) {
                var tu = null,
                    prevID = "",
                    top = 0,
                    i = 0,
                    strID = "",
                    model = null,
                    sourceText = "",
                    targetText = "",
                    refstrings = null,
                    range = null,
                    selection = null,
                    selectedObj = null,
                    prevObj = null,
                    nextOrPrevObj = false,
                    options = [],
                    foundInKB = false;
                console.log("selectedAdaptation entry / event type:" + event.type + ", isDirty: " + isDirty);
                // ** focus handler block **
                // If the user clicks on the Prev / Next buttons in the toolbar -- or clicks the TAB button or the
                // Prev/Next buttons on the soft keyboard for iOS -- the TAB event does not get fired and we don't know
                // to save the target value to the model and KB in the unselectedAdaptation() handler.
                // To handle these Prev/Next cases, we need to do some extra processing for the focus event.
                if (isDirty === true || (event.type === "focus") || (event.type === "focusin")) {
                    // focus event
                    // Check to see if the previous selction is off by 1 element in the tab order. If it is,
                    // it's likely that the user pressed TAB or the Prev/Next buttons -- meaning we should save
                    //the previous field's edits (if any)
                    prevIdx = selectedStart;
                    // set the current adaptation cursor
                    if (event.currentTarget.parentElement && event.currentTarget.parentElement.id) {
                        selectedStart = event.currentTarget.parentElement; // pile
                        if (prevIdx === null) {
                            prevIdx = selectedStart;
                        }
                    }
                    prevID = $(prevIdx).attr('id');
                    prevID = prevID.substr(prevID.indexOf("-") + 1); // remove "pile-"
                    prevObj = this.collection.findWhere({spid: prevID});
                    strID = $(selectedStart).attr('id');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    selectedObj = this.collection.findWhere({spid: strID});
                    if ((this.collection.at(this.collection.indexOf(selectedObj) + 1) === prevObj) ||
                            (this.collection.at(this.collection.indexOf(selectedObj) - 1) === prevObj)) {
                        nextOrPrevObj = true; // previous or next in our collection (ordered by norder)
                    }
                    console.log("prevIdx: " + prevID + ", selectedStart: " + strID);
                    if (isDirty === true || nextOrPrevObj === true) {
                        model = prevObj;
                        console.log("selectedAdaptation: Prev/Next likely hit. Saving value \"" + tmpTargetValue + "\" for model: " + model.get('source'));
                        // either TAB or Shift+TAB -- save the previous field if it needs it
                        // (note: model still refers to the previous selection sourcephrase)
                        if (tmpTargetValue && tmpTargetValue.length > 0) {
                            // save the new value to the KB
                            saveInKB(this.autoRemoveCaps(model.get('source'), true),
                                            this.stripPunctuation(this.autoRemoveCaps(tmpTargetValue, false)),
                                            this.stripPunctuation(this.autoRemoveCaps(model.get('target'), false)),
                                            project.get('projectid'));
                            // update the model with the new target text
                            model.save({target: tmpTargetValue});
                            $(prevIdx.childNodes[4]).html(this.copyPunctuation(model, tmpTargetValue));
                            // if the target differs from the source, make it display in green
                            if (model.get('source') === model.get('target')) {
                                // source === target --> remove "differences" from the class so the text is black
                                $(prevIdx.childNodes[4]).removeClass('differences');
                            } else if (model.get('target') === model.get('prepuncts') + model.get('source') + model.get('follpuncts')) {
                                // source + punctuation == target --> remove "differences"
                                $(prevIdx.childNodes[4]).removeClass('differences');
                            } else if (!$(event.currentTarget).hasClass('differences')) {
                                // source != target -- add "differences" to the class so the text is green
                                $(prevIdx.childNodes[4]).addClass('differences');
                            }
                        }
                        // done saving -- clear out the temp value
                        tmpTargetValue = "";
                        isDirty = false;
                    } else {
                        // we've already handled this in the touchend event -- just return
                        console.log("selectedAdaptation: previous focus too far away to be prev/next. Ignoring...");
                        event.stopPropagation();
                        event.preventDefault();
                        return;
                    }
                }

                if (isSelecting === true) {
                    // pretend the user wanted the last selected item to be the end of the selection
                    $(selectedEnd).find('.source').mouseup();
                    return;
                }

                // Are we setting the focus on the first phrase after a selection?
                if (isSelectingFirstPhrase === true) {
                    // yes -- keep the selection, but clear out the flag
                    console.log("Selecting the first phrase -- gets a pass");
                    isSelectingFirstPhrase = false;
                } else {
                    // no -- clear out any previous selection
                    console.log("clearing selection");
                    this.clearSelection();
                }

                // set the current adaptation cursor
                if (event.currentTarget.parentElement && event.currentTarget.parentElement.id) {
                    selectedStart = event.currentTarget.parentElement; // pile
                }
                console.log("selectedAdaptation: " + selectedStart.id);
                // Update lastAdaptedSPID
                project.set('lastAdaptedSPID', selectedStart.id);

                // enable prev / next buttons
                $("#Prev").prop('disabled', false); // enable toolbar button
                $("#Next").prop('disabled', false); // enable toolbar button
                // Is the target field empty?
                if ($(event.currentTarget).text().trim().length === 0) {
                    // target is empty -- attempt to populate it
                    // First, see if there are any available adaptations in the KB
                    strID = $(selectedStart).attr('id');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    model = this.collection.findWhere({spid: strID});
                    sourceText = model.get('source');
                    tu = this.findInKB(this.autoRemoveCaps(sourceText, true));
                    console.log("Target is empty; tu for \"" + this.autoRemoveCaps(sourceText, true) + "\" = " + tu);
                    if (tu !== null) {
                        // found at least one match -- populate the target with the first match
                        refstrings = tu.get('refstring');
                        if (refstrings.length === 1) {
                            // exactly one entry in KB -- populate and move forward
                            targetText = this.autoAddCaps(model, refstrings[0].target);
                            $(event.currentTarget).html(targetText);
                            // mark it purple
                            $(event.currentTarget).addClass('fromkb');
                            clearKBInput = false;
                            // mark the field as changed (so the KB gets incremented)
                            isDirty = true;
                            // jump to the next field
                            this.moveCursor(event, true);
                            foundInKB = true;
                        } else {
                            // more than one entry in KB -- stop here so the user can choose
                            MovingDir = 0;
                            isDirty = false; // no change yet
                            options.length = 0; // clear out any old cruft
//                            // select the first result (most frequently used)
//                            targetText = this.autoAddCaps(model, refstrings[0].target);
//                            $(event.currentTarget).html(targetText);
                            // build our list of options from the refstrings
                            for (i = 0; i < refstrings.length; i++) {
                                options.push(refstrings[i].target);
                            }
                            // create the autocomplete UI
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
//                                    },
//                                    focus: function () {
//                                        return false;
//                                    },
//                                    select: function (event, ui) {
//                                        return false;
//                                    }
                                }
                            );
                            // select any text in the edit field
                            if (document.body.createTextRange) {
                                range = document.body.createTextRange();
                                range.moveToElementText($(event.currentTarget));
                                range.select();
                            } else if (window.getSelection) {
                                selection = window.getSelection();
                                range = document.createRange();
                                range.selectNodeContents($(event.currentTarget)[0]);
                                selection.removeAllRanges();
                                selection.addRange(range);
                            }
                            // if the user didn't click the next/prev field, it's possible that we went offscreen
                            // while looking for the next available slot to adapt. Make sure the edit field is in
                            // view by scrolling the UI
                            if (nextOrPrevObj === true) {
                                // scroll the edit field into view
                                top = $(selectedStart)[0].offsetTop - (($(window).height() - $(selectedStart).outerHeight(true)) / 2);
    //                            console.log("scrolling to (" + $(selectedStart).attr('id') + "): " + top);
                                $("#content").scrollTop(top);
                            }
//                            $(event.currentTarget).typeahead('open');
                        }
                    } else {
                        // nothing in the KB
                        // if this isn't a phrase, populate the target with the source text as the next best guess
                        // (if this is a phrase, we just finished an auto-create phrase, and we want a blank field)
                        if (strID.indexOf("phr") === -1) {
                            $(event.currentTarget).html(sourceText);
                        }
                        MovingDir = 0; // stop here
                        clearKBInput = true;
                        // no change yet -- this is just a suggestion
                        isDirty = false;
                        // select any text in the edit field
                        if (document.body.createTextRange) {
                            range = document.body.createTextRange();
                            range.moveToElementText($(event.currentTarget));
                            range.select();
                        } else if (window.getSelection) {
                            selection = window.getSelection();
                            range = document.createRange();
                            range.selectNodeContents($(event.currentTarget)[0]);
                            selection.removeAllRanges();
                            selection.addRange(range);
                        }
                        // if the user didn't click the next/prev field, it's possible that we went offscreen
                        // while looking for the next available slot to adapt. Make sure the edit field is in
                        // view by scrolling the UI
                        if (nextOrPrevObj === true) {
                            // scroll the edit field into view
                            top = $(selectedStart)[0].offsetTop - (($(window).height() - $(selectedStart).outerHeight(true)) / 2);
//                            console.log("scrolling to (" + $(selectedStart).attr('id') + "): " + top);
                            $("#content").scrollTop(top);
                        }
//                        $(event.currentTarget)[0].focus();
                    }
                } else {
                    // something already in the edit field -- are we looking for the next
                    // empty field, or did we just select this one?
                    console.log("Target NOT empty; MovingDir = " + MovingDir + ", isDrafting = " + isDrafting);
                    if (MovingDir !== 0 && isDrafting === true) {
                        // looking for the next empty field --
                        // clear the dirty bit and keep going
                        isDirty = false;
                        this.moveCursor(event, (MovingDir === 1) ? true : false);
                    } else {
                        // We really selected this field -- stay here.
                        // reset the dirty bit because
                        // we haven't made any changes yet
                        MovingDir = 0; // stop here
                        clearKBInput = true;
                        isDirty = false;
                        // select any text in the edit field
                        if (document.body.createTextRange) {
                            range = document.body.createTextRange();
                            range.moveToElementText($(event.currentTarget));
                            range.select();
                        } else if (window.getSelection) {
                            selection = window.getSelection();
                            range = document.createRange();
                            range.selectNodeContents($(event.currentTarget)[0]);
                            selection.removeAllRanges();
                            selection.addRange(range);
                        }
                        // if the user didn't click the next/prev field, it's possible that we went offscreen
                        // while looking for the next available slot to adapt. Make sure the edit field is in
                        // view by scrolling the UI
                        if (nextOrPrevObj === true) {
                            // scroll the edit field into view
                            top = $(selectedStart)[0].offsetTop - (($(window).height() - $(selectedStart).outerHeight(true)) / 2);
//                            console.log("scrolling to (" + $(selectedStart).attr('id') + "): " + top);
                            window.scrollTo(0, top);
                        }
//                        $(event.currentTarget)[0].focus();
                    }
                }
            },
            // keydown event handler for the target field
            editAdaptation: function (event) {
                var next_edit = null,
                    strID = null,
                    model = null,
                    targetText = "";
                console.log("editAdaptation");
                if (event.keyCode === 27) {
                    // Escape key pressed -- cancel the edit (reset the content) and blur
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
                    // If tab/enter is pressed, blur and move to edit the next pile
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
                }
            },
            // User has picked an option from the typeahead widget (a KB value)
            selectKB: function (event, suggestion) {
                // fill the edit field with the selection
                $(event.currentTarget.parentElement.parentElement).find(".target").html(suggestion);
            },
            // Input text has changed in the target field -
            // Check to see if this is an automatic merge phrase situation
            // (https://github.com/adapt-it/adapt-it-mobile/issues/109)
            checkForAutoMerge: function (event) {
                // is the selection a range of piles?
                if ((selectedEnd !== null && selectedStart !== null) && (selectedEnd !== selectedStart)) {
                    // User typed after selecting a group of piles -- automatic phrase merge
                    console.log("detect autophrase");
                    isAutoPhrase = true;
                    // Trigger the phrase creation
                    $("#Phrase").click();
                }
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
                    tu = null,
                    idx = 0,
                    model = null;
                console.log("unselectedAdaptation");
                // remove any earlier kb "purple"
                if (clearKBInput === true) {
                    $(".target").removeClass("fromkb");
                    clearKBInput = false;
                }
                // get the adaptation text
                //value = $(event.currentTarget).text();
                value = _.escape($(event.currentTarget).text());
                // if needed use regex to replace chars we don't want stored in escaped format
                //value = value.replace(new RegExp("&quot;", 'g'), '"');  // klb
                trimmedValue = value.trim();
                // find the model object associated with this edit field
                strID = $(event.currentTarget.parentElement).attr('id');
                if (strID === undefined) {
                    console.log("value: " + value);
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
                    console.log("Dirty bit set. Saving KB value: " + trimmedValue);
                    // something has changed -- update the KB
                    saveInKB(this.autoRemoveCaps(model.get('source'), true),
                             this.stripPunctuation(this.autoRemoveCaps(trimmedValue, false)),
                             this.stripPunctuation(this.autoRemoveCaps(model.get('target'), false)),
                             project.get('projectid'));
                    // add any punctuation back to the target field
                    $(event.currentTarget).html(this.copyPunctuation(model, trimmedValue));
                    // clear out the temp IOS value, since we've already saved this value
                    tmpTargetValue = "";
                } else {
                    console.log("Dirty bit NOT set. Skipping save, but saving value \"" + trimmedValue + "\" as a temp, just in case.");
                    tmpTargetValue = trimmedValue;
                    // dirty bit is false -- check to see if the target matches what's in the edit field
                    if (trimmedValue) {
                        // User clicked away without changing anything -- this is a cancel operation
                        // Is there anything in the old target field?
                        if (model && model.get('target').length === 0) {
                            // nothing in the old target field -- clear out the edit field
                            $(event.currentTarget).html("");
                            trimmedValue = "";
                        } else {
                            // something in the old target field -- just clear the local copy so the
                            // model doesn't update
                            trimmedValue = "";
                            // add any punctuation back to the target field
                            if (model) {
                                $(event.currentTarget).html(this.copyPunctuation(model, model.get('target')));
                            }
                        }
                    }
                }
                // Update the model if needed
                if (trimmedValue && trimmedValue.length > 0) {
    //                console.log(model);
                    // update the model with the new target text
                    model.save({target: trimmedValue});
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
                    placeHolderHtml = "<div id=\"pile-plc-" + newID + "\" class=\"pile\">" +
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
                    next_edit = selectedStart.previousElementSibling;
                    selectedStart = next_edit;
                    $(next_edit).find('.source').mouseup();
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
                    phraseObj = null,
                    origTarget = "",
                    nOrder = 0.0,
                    phObj = null,
                    strID = null,
                    bookID = null,
                    newView = null,
                    selectedObj = null,
                    PhraseLine0 = "<div id=\"pile-",
                    PhraseLine1 = "\" class=\"pile\"><div class=\"marker\">",
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
                            phraseMarkers += $(value).children(".marker").html();
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
                    phObj = new spModels.SourcePhrase({ spid: ("phr-" + newID), source: phraseSource, target: phraseSource, orig: origTarget});
                    strID = $(selectedStart).attr('id');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    selectedObj = this.collection.findWhere({spid: strID});
                    phObj.set('chapterid', selectedObj.get('chapterid'), {silent: true});
                    phObj.set('norder', selectedObj.get('norder'), {silent: true}); // phrase just takes same order # as first selected object
                    phObj.save();
                    this.collection.add(phObj);
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
                        if (index > idxStart && index <= (idxEnd + 1)) {
                            // remove the original sourcephrase
                            strID = $(value).attr('id');
                            strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                            selectedObj = coll.findWhere({spid: strID});
                            coll.remove(selectedObj); // remove from collection
                            selectedObj.destroy(); // remove from database
                            $(value).remove();
                        }
                    });
                    // update the toolbar UI
                    $("div").removeClass("ui-selecting ui-selected");
                    $("#Placeholder").prop('disabled', true);
                    $("#Retranslation").prop('disabled', true);
                    $("#Phrase").prop('disabled', true);
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
                        phObj.save();
                        coll.add(phObj, {at: coll.indexOf(selectedObj)});
                        nOrder = nOrder + 1;
                        // add to UI
                        $(selectedStart).before("<div class=\"pile\" id=\"pile-" + phObj.get('spid') + "\"></div>");
                        newView = new SourcePhraseView({ model: phObj});
                        $('#pile-' + phObj.get('spid')).append(newView.render().el.childNodes);
                    });
                    // now delete the phrase itself
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
                }
            },
            // User clicked on the Retranslation button
            toggleRetranslation: function (event) {
                var next_edit = null,
                    RetHtml = null,
                    coll = this.collection, // needed to find collection within "each" block below
                    newID = Underscore.uniqueId(),
                    RetSource = "",
                    RetTarget = "",
                    RetObj = null,
                    nOrder = 0.0,
                    origTarget = "",
                    phObj = null,
                    strID = null,
                    bookID = null,
                    newView = null,
                    selectedObj = null,
                    RetHtmlLine0 = "<div id=\"pile-",
                    RetHtmlline1 = "\" class=\"pile\"><div class=\"marker\">&nbsp;</div> <div class=\"source retranslation\">",
                    RetHtmlLine2 = "</div> <div class=\"target\" contenteditable=\"true\">",
                    RetHtmlLine3 = "</div></div>";
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
                            RetSource += $(value).children(".source").html();
                            RetTarget += $(value).children(".target").html();
                            origTarget += $(value).children(".target").html();
                        }
                    });
                    // now build the new sourcephrase from the string
                    // model object
                    phObj = new spModels.SourcePhrase({ spid: ("ret-" + newID), source: RetSource, target: RetSource, orig: origTarget});
                    strID = $(selectedStart).attr('id');
                    strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                    selectedObj = this.collection.findWhere({spid: strID});
                    phObj.set('norder', selectedObj.get('norder'), {silent: true}); // retranslation just takes same order # as first selected object
                    phObj.set('chapterid', selectedObj.get('chapterid'), {silent: true});
                    // the html code depends on getting a valid ID back from the object after save() completes
                    phObj.save();
                    this.collection.add(phObj);
                    // UI representation
                    RetHtml = RetHtmlLine0 + "ret-" + newID + RetHtmlline1 + RetSource + RetHtmlLine2;
                    // if there's something already in the target, use it instead
                    RetHtml += (RetTarget.trim().length > 0) ? RetTarget : RetSource;
                    RetHtml += RetHtmlLine3;
                    console.log("Ret: " + RetHtml);
                    $(selectedStart).before(RetHtml);
                    // finally, remove the selected piles (they were merged into this one)
                    $(selectedStart.parentElement).children(".pile").each(function (index, value) {
                        if (index > idxStart && index <= (idxEnd + 1)) {
                            // remove the original sourceRet
                            strID = $(value).attr('id');
                            strID = strID.substr(strID.indexOf("-") + 1); // remove "pile-"
                            selectedObj = coll.findWhere({spid: strID});
                            coll.remove(selectedObj); // remove from collection
                            selectedObj.destroy(); // remove from database
                            $(value).remove();
                        }
                    });
                    // update the toolbar UI
                    $("div").removeClass("ui-selecting ui-selected");
                    $("#Placeholder").prop('disabled', true);
                    $("#Retranslation").prop('disabled', true);
                    $("#Phrase").prop('disabled', true);
                    // start adapting the new Phrase
                    next_edit = $("#pile-ret-" + newID);
                    if (next_edit !== null) {
                        next_edit.find('.target').mouseup();
                    }
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
                        phObj.save();
                        nOrder = nOrder + 1;
                        coll.add(phObj, {at: coll.indexOf(selectedObj)});
                        // add to UI
                        $(selectedStart).before("<div class=\"pile\" id=\"pile-" + phObj.get('spid') + "\"></div>");
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
                document.addEventListener("resume", this.onResume, false);
            },
            regions: {
                container: "#chapter"
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
                USFMMarkers = new usfm.MarkerCollection();
                USFMMarkers.fetch({reset: true, data: {name: ""}}); // return all results
            },
            ////
            // Event Handlers
            ////
            events: {
                "click #chapter": "unselectPiles",
                "click #Prev": "goPrevPile",
                "click #Next": "goNextPile",
                "click #Placeholder": "togglePlaceholder",
                "click #Phrase": "togglePhrase",
                "click #Retranslation": "toggleRetranslation",
                "click #help": "onHelp"
            },
            // go to the previous target field, marking the current field as dirty so that it gets saved
            goPrevPile: function (event) {
                console.log("goPrevPile: selectedStart = " + selectedStart);
                if (selectedStart !== null) {
                    isDirty = true;
                    MovingDir = -1; // backwards
                    this.listView.moveCursor(event, false);
                }
            },
            // go to the next target field, marking the current field as dirty so that it gets saved
            goNextPile: function (event) {
                console.log("goNextPile: selectedStart = " + selectedStart);
                if (selectedStart !== null) {
                    isDirty = true;
                    MovingDir = 1; // forwards
                    this.listView.moveCursor(event, true);
                }
            },
            // For the placeholders, etc., just pass the event handler down to the list view to handle
            togglePlaceholder: function (event) {
                this.listView.togglePlaceholder(event);
            },
            togglePhrase: function (event) {
                this.listView.togglePhrase(event);
            },
            toggleRetranslation: function (event) {
                this.listView.toggleRetranslation(event);
            },
            // User clicked away from
            unselectPiles: function (event) {
                // only do this if we're in a blank area of the screen
                if (!($(event.toElement).hasClass('strip') || $(event.toElement).hasClass('pile') || $(event.toElement).hasClass('marker') || $(event.toElement).hasClass('source') || $(event.toElement).hasClass('target'))) {
                    console.log("UnselectPiles: clicked in a blank area; removing selection");
                    if (selectedStart !== null) {
                        $("div").removeClass("ui-selecting ui-selected");
                        $("#Placeholder").prop('disabled', true);
                        $("#Retranslation").prop('disabled', true);
                        $("#Phrase").prop('disabled', true);
                    }
                }
            },
            // Help button handler for the adaptation screen. Starts the hopscotch walkthrough to orient the user
            // to the UI elements on this screen.
            onHelp: function (event) {
                var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                var firstPileID = $(".pile").first().attr("id");
                var tour = {
                    id: "hello-hopscotch",
                    i18n: {
                        nextBtn: i18next.t("view.lblNext"),
                        prevBtn: i18next.t("view.lblPrev"),
                        doneBtn: i18next.t("view.lblFinish"),
                        skipBtn: i18next.t("view.lblNext"),
                        closeTooltip: i18next.t("view.lblNext"),
                        stepNums: ["1", "2", "3", "4", "5", "6"]
                    },
                    steps: [
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
                            title: i18next.t('view.hlpttlSelectMultiple'),
                            content: i18next.t('view.hlpdscSelectMultiple'),
                            target: firstPileID,
                            placement: "bottom",
                            onNext: function () {
                                $("#" + firstPileID).removeClass("ui-selected");
                            }
                        },
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
                            xOffset: "center",
                            arrowOffset: "center",
                            placement: "bottom"
                        },
                        {
                            title: i18next.t('view.hlpttlPrevNext'),
                            content: i18next.t('view.hlpdscPrevNext'),
                            target: "Prev",
                            placement: "left"
                        },
                        {
                            title: i18next.t('view.hlpttlBack'),
                            content: i18next.t('view.hlpdscBack'),
                            target: "back",
                            placement: "bottom"
                        }
                    ],
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
