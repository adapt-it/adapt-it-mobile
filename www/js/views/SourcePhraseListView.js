/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Underscore  = require('underscore'),
        Handlebars  = require('handlebars'),
        Backbone    = require('backbone'),
        i18n        = require('i18n'),
        SourcePhraseView  = require('app/views/SourcePhraseView'),
        spModels    = require('app/models/sourcephrase'),
        kbModels    = require('app/models/targetunit'),
        tplText     = require('text!tpl/SourcePhraseList.html'),
        template = Handlebars.compile(tplText),
        kblist      = null, // real value passed in constructor (ChapterView.js)
        projectPrefix = "en.en",    // TODO: source.target ISO639 codes
        selectedStart = null,
        selectedEnd = null,
        idxStart = null,
        idxEnd = null,
        clearKBInput = false,
        isDirty = false,
        isSelecting = false,
        isPlaceholder = false,
        isPhrase = false,
        isRetranslation = false;

    return Backbone.View.extend({

        initialize: function () {
            this.collection.bind('reset', this.render, this);
            this.render();
        },
        addOne: function (SourcePhrase) {
            var view = new SourcePhraseView({ model: SourcePhrase});//, el: $('#pile-' + SourcePhrase.get('id')) });
            this.$('#pile-' + SourcePhrase.get('id')).append(view.render().el.childNodes);
        },
        render: function () {
            // add the collection
            this.$el.html(template(this.collection.toJSON()));
            // go back and add the individual piles
            this.collection.each(this.addOne, this);
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
            return curDate.getFullYear + "-" + (curDate.getMonth + 1) + "-" + curDate.getDay + "T" + curDate.getUTCHours + ":" + curDate.getUTCMinutes + ":" + curDate.getUTCSeconds + "z";
        },
        // Helper method to retrieve the targetunit whose source matches the specified key in the KB.
        // This method currently strips out all punctuation to match the words; a null is returned 
        // if there is no entry in the KB
        findInKB: function (key) {
            var result = null,
                strNoPunctuation = key.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, "");
            try {
                result = this.kblist.findWhere({'source': strNoPunctuation});
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
            event.stopPropagation();
            event.preventDefault();
            $(event.currentTarget).blur();
            if (moveForward === false) {
                // move backwards
                next_edit = selectedStart.previousElementSibling;
                if (next_edit.id.substr(0, 4) !== "pile") {
                    // Probably a header -- see if you can go to the previous strip
                    if (selectedStart.parentElement.previousElementSibling !== null) {
                        next_edit = selectedStart.parentElement.previousElementSibling.lastElementChild;
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
                        next_edit = selectedStart.parentElement.nextElementSibling.childNodes[3];
                    } else {
                        // no more piles - get out
                        next_edit = null;
                        console.log("reached last pile.");
                    }
                }
            }
            if (next_edit) {
                console.log("next edit: " + next_edit.id);
                next_edit.childNodes[4].click();
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
            "mousemove .source": "selectingPilesMove",
            "touchmove .source": "selectingPilesMove",
            "mouseup .source": "selectingPilesEnd",
            "touchend .source": "selectingPilesEnd",
            "mouseup .pile": "checkStopSelecting",
            "mouseup .target": "checkStopSelecting",
            "click .target": "selectedAdaptation",
            "keydown .target": "editAdaptation",
            "blur .target": "unselectedAdaptation"
        },

        // user is starting to select one or more piles
        selectingPilesStart: function (event) {
            var model = null,
                strID = "";
            // if there was an old selection, remove it
            if (selectedStart !== null) {
                $("div").removeClass("ui-selecting ui-selected");
                $(selectedStart).find('.target').removeAttr('contenteditable');
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
        // user released the mouse here
        selectingPilesEnd: function (event) {
            // re-add the contenteditable fields
            var tmpItem = null,
                tmpIdx = 0;
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
                // did the user select a placeholder?
                if ((selectedStart.id).indexOf("plc") !== -1) {
                    // placeholder -- can remove it, but not add a new one
                    isPlaceholder = true;
                    $("#Placeholder").prop('title', i18n.t("view.dscDelPlaceholder"));
                    $("#Placeholder .topcoat-icon").removeClass("topcoat-icon--placeholder-new");
                    $("#Placeholder .topcoat-icon").addClass("topcoat-icon--placeholder-delete");
                } else {
                    // not a placeholder -- can add a new one
                    isPlaceholder = false;
                    $("#Placeholder").prop('title', i18n.t("view.dscNewPlaceholder"));
                    $("#Placeholder .topcoat-icon").removeClass("topcoat-icon--placeholder-delete");
                    $("#Placeholder .topcoat-icon").addClass("topcoat-icon--placeholder-new");
                }
                // did the user select a phrase?
                if (((selectedStart.id).indexOf("phr") !== -1) && (selectedStart === selectedEnd)) {
                    // phrase (single selection) -- can remove it, but not add a new one
                    isPhrase = true;
                    $("#Phrase").prop('title', i18n.t("view.dscDelPhrase"));
                    $("#Phrase .topcoat-icon").removeClass("topcoat-icon--phrase-new");
                    $("#Phrase .topcoat-icon").addClass("topcoat-icon--phrase-delete");
                    $("#Phrase").prop('disabled', false); // enable toolbar button (to delete phrase)
                } else {
                    // not a placeholder -- can add a new one
                    isPhrase = false;
                    $("#Phrase").prop('title', i18n.t("view.dscNewPhrase"));
                    $("#Phrase .topcoat-icon").removeClass("topcoat-icon--phrase-delete");
                    $("#Phrase .topcoat-icon").addClass("topcoat-icon--phrase-new");
                }
                // did the user select a retranslation?
                if ((selectedStart.id).indexOf("ret") !== -1) {
                    // retranslation -- can remove it, but not add a new one
                    isRetranslation = true;
                    $("#Retranslation").prop('title', i18n.t("view.dscDelRetranslation"));
                    $("#Retranslation .topcoat-icon").removeClass("topcoat-icon--retranslation-new");
                    $("#Retranslation .topcoat-icon").addClass("topcoat-icon--retranslation-delete");
                    $("#Retranslation").prop('disabled', false); // enable toolbar button (to delete retranslation)
                } else {
                    // not a retranslation -- can add a new one
                    isRetranslation = false;
                    $("#Retranslation").prop('title', i18n.t("view.dscNewRetranslation"));
                    $("#Retranslation .topcoat-icon").removeClass("topcoat-icon--retranslation-delete");
                    $("#Retranslation .topcoat-icon").addClass("topcoat-icon--retranslation-new");
                }
                $("#Placeholder").prop('disabled', false);
            }
        },
        // click event handler for the target field 
        selectedAdaptation: function (event) {
            var tu = null,
                strID = "",
                model = null,
                sourceText = "",
                refstrings = null,
                foundInKB = false;
            // clear out any previous selection
            this.clearSelection();
            // set the current adaptation cursor
            selectedStart = event.currentTarget.parentElement; // pile
            //console.log("selectedStart: " + selectedStart.id);
            // Is the target field empty?
			if ($(event.currentTarget).text().trim().length === 0) {
                // target is empty -- attempt to populate it
                // First, see if there are any available adaptations in the KB
                strID = $(event.currentTarget.parentElement).attr('id').substring(5); // remove "pile-"
                model = this.collection.get(strID);
                sourceText = model.get('source');
                tu = this.findInKB(sourceText);
                if (tu !== null) {
                    // found at least one match -- populate the target with the first match
                    refstrings = tu.get('refstring');
                    $(event.currentTarget).html(refstrings[0].target);
                    // mark it purple
                    $(event.currentTarget).addClass('fromkb');
                    clearKBInput = false;
                    // mark the field as changed (so the KB gets incremented)
                    isDirty = true;
                    // jump to the next field
                    this.moveCursor(event, true);
                    foundInKB = true;
                } else {
                    // nothing in the KB -- populate the target with the source text as the next best guess
                    $(event.currentTarget).html(sourceText);
                    clearKBInput = true;
                    isDirty = true; // we made a change (populating from the source text)
                }
            } else {
                // something already in the edit field -- reset the dirty bit because
                // we haven't made any changes yet
                clearKBInput = true;
                isDirty = false;
            }
            if (foundInKB === false) {
                // allow the user to edit the target div content
                $(event.currentTarget).attr('contenteditable', 'true');
                // show the input field and set focus to it
                $(event.currentTarget).focus();
            }
        },
        // keydown event handler for the target field
        editAdaptation: function (event) {
            var next_edit = null,
                strID = null,
                model = null,
                targetText = "";
            if (event.keyCode === 27) {
                // Escape key pressed -- cancel the edit (reset the content) and blur
                strID = $(event.currentTarget.parentElement).attr('id').substring(5); // remove "pile-"
				model = this.collection.get(strID);
                $(event.currentTarget).html(model.get('target'));
                event.stopPropagation();
                event.preventDefault();
                $(event.currentTarget).blur();
            } else if ((event.keyCode === 9) || (event.keyCode === 13)) {
                // If tab/enter is pressed, blur and move to edit the next pile
                if (event.shiftKey) {
                    this.moveCursor(event, false);  // shift tab/enter -- move backwards
                } else {
                    this.moveCursor(event, true);   // normal tab/enter -- move forwards
                }
            } else {
                // any other key - set the dirty bit
                isDirty = true;
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
                model = null;
            
            // remove contenteditable attribute on the div
            $(event.currentTarget).removeAttr('contenteditable');
            // remove any earlier kb "purple"
            if (clearKBInput === true) {
                $(".target").removeClass("fromkb");
                clearKBInput = false;
            }
            // get the adaptation text
			value = $(event.currentTarget).text();
            trimmedValue = value.trim();
            // find the model object associated with this edit field
            strID = $(event.currentTarget.parentElement).attr('id').substring(5); // remove "pile-"
            model = this.collection.get(strID);
            // check for changes in the edit field
            if (isDirty === true) {
                // something has changed -- update the KB
                // find this source/target pair in the KB
                tu = this.findInKB(model.get('source'));
                if (tu) {
                    var i = 0,
                        found = false,
                        refstrings = tu.get('refstring'),
                        oldValue = model.get('target');
                    // delete or decrement the old value
                    if (oldValue > 0) {
                        // the model has an old value -- try to find and remove the corresponding KB entry
                        for (i = 0; i < refstrings.length; i++) {
                            if (refstrings[i].get('target') === oldValue) {
                                if (refstrings[i].n === '1') {
                                    // more than one refcount -- decrement it
                                    refstrings[i].n--;
                                } else {
                                    // only one refcount -- remove the element from the KB
                                    refstrings.splice(i, 1);
                                }
                                break;
                            }
                        }
                        
                    }
                    // add or increment the new value
                    for (i = 0; i < refstrings.length; i++) {
                        if (refstrings[i].target === trimmedValue) {
                            refstrings[i].n++;
                            found = true;
                            break;
                        }
                    }
                    if (found === false) {
                        // no entry in KB with this source/target -- add one
                        var newRS = [
                            {
                                'target': trimmedValue,
                                'n': '1'
                            }
                        ];
                        refstrings.push(newRS);
                    }
                    // update the KB model
                    tu.set({refstring: refstrings});
                } else {
                    // no entry in KB with this source -- add one
                    var newID = Underscore.uniqueId(),
                        currentdate = new Date(),
                        newTU = new kbModels.TargetUnit({
                            id: (projectPrefix + "." + newID),
                            source: model.get('source'),
                            refstring: [
                                {
                                    target: trimmedValue,
                                    n: "1"
                                }
                            ],
                            timestamp: this.getTimestamp(),
                            user: "user:machine"
                        });
                    this.kblist.add(newTU);
                }
            }
            // Now update the model
            if (trimmedValue) {
//                console.log(model);
                // update the model with the new target text
                model.set({target: trimmedValue});
				if (value !== trimmedValue) {
					// Model values changes consisting of whitespaces only are
					// not causing change to be triggered. Check for this condition
					// and trigger the change event manually if needed
					model.trigger('change');
				}
                // if the target differs from the source, make it display in green
                if (model.get('source') === model.get('target')) {
                    // source === target -- remove "differences" from the class so the text is black
                    $(event.currentTarget).removeClass('differences');
                } else if (!$(event.currentTarget).hasClass('differences')) {
                    // source != target -- add "differences" to the class so the text is green
                    $(event.currentTarget).addClass('differences');
                }
			}
            // check for an old selection and remove it if needed
            if (selectedStart !== null) {
                // there was an old selection -- remove the ui-selected class
                $("div").removeClass("ui-selecting ui-selected");
                $("#Placeholder").prop('disabled', true);
                $("#Retranslation").prop('disabled', true);
                $("#Phrase").prop('disabled', true);
            }
        },
        // User clicked on the Placeholder button
        togglePlaceholder: function (event) {
            // TODO: move placeHolderHtml to templated html
            var next_edit = null,
                selectedObj = null,
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
                phObj = new spModels.SourcePhrase({ id: ("plc-" + newID), source: "..."});
                strID = $(selectedStart).attr('id').substring(5); // remove "pile-"
                selectedObj = this.collection.get(strID);
                this.collection.add(phObj, {at: this.collection.indexOf(selectedObj)});
                //this.Model.
                $(selectedStart).before(placeHolderHtml);
                //this.$el.html(placeTpl(this.model.toJSON()));
                // start adapting at this location
                $("div").removeClass("ui-selecting ui-selected");
                $("#Placeholder").prop('disabled', true);
                $("#Retranslation").prop('disabled', true);
                $("#Phrase").prop('disabled', true);
                next_edit = selectedStart.previousElementSibling;
                next_edit.childNodes[4].click();
            } else {
                // selection is a placeholder -- delete it from the model and the DOM (html)
                strID = $(selectedStart).attr('id').substring(5); // remove "pile-"
                selectedObj = this.collection.get(strID);
                this.collection.remove(selectedObj);
                $(selectedStart).remove();
                // item has been removed, so there is no longer a selection -
                // clean up the UI accordingly
                $("div").removeClass("ui-selecting ui-selected");
                $("#Placeholder").prop('title', i18n.t("view.dscNewPlaceholder"));
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
                phraseSource = "",
                phraseTarget = "",
                phraseObj = null,
                origTarget = "",
                phObj = null,
                strID = null,
                bookID = null,
                newView = null,
                selectedObj = null,
                PhraseHtmlStart = "<div id=\"pile-phr-" + newID + "\" class=\"pile\">" +
                                    "<div class=\"marker\">&nbsp;</div> <div class=\"source\">",
                PhraseHtmlMid = "</div> <div class=\"target\" contenteditable=\"true\">",
                PhraseHtmlEnd = "</div></div>";
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
                        phraseSource += $(value).children(".source").html();
                        phraseTarget += $(value).children(".target").html();
                        // check for phrases
                        if ($(value).attr('id').indexOf("phr") !== -1) {
                            // phrase -- pull out the original target
                            strID = $(value).attr('id').substring(5); // remove "pile-"
                            selectedObj = coll.get(strID);
                            origTarget += selectedObj.get("orig");
                        } else {
                            // not a phrase -- just add the target text
                            origTarget += $(value).children(".target").html();
                        }
                    }
                });
                // now build the new sourcephrase from the string
                phraseHtml = PhraseHtmlStart + phraseSource + PhraseHtmlMid;
                // if there's something already in the target, use it instead
                phraseHtml += (phraseTarget.trim().length > 0) ? phraseTarget : phraseSource;
                phraseHtml += PhraseHtmlEnd;
                console.log("phrase: " + phraseHtml);
                phObj = new spModels.SourcePhrase({ id: ("phr-" + newID), source: phraseSource, target: phraseSource, orig: origTarget});
                strID = $(selectedStart).attr('id').substring(5); // remove "pile-"
                selectedObj = this.collection.get(strID);
                this.collection.add(phObj, {at: this.collection.indexOf(selectedObj)});
                $(selectedStart).before(phraseHtml);
                // finally, remove the selected piles (they were merged into this one)
                $(selectedStart.parentElement).children(".pile").each(function (index, value) {
                    if (index > idxStart && index <= (idxEnd + 1)) {
                        // remove the original sourcephrase
                        strID = $(value).attr('id').substring(5); // remove "pile-"
                        selectedObj = coll.get(strID);
                        coll.remove(selectedObj);
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
                selectedStart = null;
                next_edit[0].childNodes[4].click();
            } else {
                // selection is a phrase -- delete it from the model and the DOM
                // first, re-create the original sourcephrase piles and add them to the collection and UI
                bookID = $('.topcoat-navigation-bar__title').attr('id');
                strID = $(selectedStart).attr('id').substring(5); // remove "pile-"
                selectedObj = this.collection.get(strID);
                origTarget = selectedObj.get("orig").split("|");
                selectedObj.get("source").split(" ").forEach(function (value, index) {
                    // add to model
                    newID = Underscore.uniqueId();
                    phraseTarget = (index >= origTarget.length) ? " " : origTarget[index];
                    phObj = new spModels.SourcePhrase({ id: (bookID + "--" + newID), source: value, target: phraseTarget});
                    coll.add(phObj, {at: coll.indexOf(selectedObj)});
                    // add to UI
                    $(selectedStart).before("<div class=\"pile\" id=\"pile-" + phObj.get('id') + "\"></div>");
                    newView = new SourcePhraseView({ model: phObj});
                    $('#pile-' + phObj.get('id')).append(newView.render().el.childNodes);
                });
                // now delete the phrase itself
                this.collection.remove(selectedObj);
                $(selectedStart).remove();
                // update the toolbar UI
                $("div").removeClass("ui-selecting ui-selected");
                $("#Phrase").prop('title', i18n.t("view.dscNewPhrase"));
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
                origTarget = "",
                phObj = null,
                strID = null,
                bookID = null,
                newView = null,
                selectedObj = null,
                RetHtmlStart = "<div id=\"pile-ret-" + newID + "\" class=\"pile\">" +
                                    "<div class=\"marker\">&nbsp;</div> <div class=\"source retranslation\">",
                RetHtmlMid = "</div> <div class=\"target\" contenteditable=\"true\">",
                RetHtmlEnd = "</div></div>";
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
                RetHtml = RetHtmlStart + RetSource + RetHtmlMid;
                // if there's something already in the target, use it instead
                RetHtml += (RetTarget.trim().length > 0) ? RetTarget : RetSource;
                RetHtml += RetHtmlEnd;
                console.log("Ret: " + RetHtml);
                phObj = new spModels.SourcePhrase({ id: ("ret-" + newID), source: RetSource, target: RetSource, orig: origTarget});
                strID = $(selectedStart).attr('id').substring(5); // remove "pile-"
                selectedObj = this.collection.get(strID);
                this.collection.add(phObj, {at: this.collection.indexOf(selectedObj)});
                $(selectedStart).before(RetHtml);
                // finally, remove the selected piles (they were merged into this one)
                $(selectedStart.parentElement).children(".pile").each(function (index, value) {
                    if (index > idxStart && index <= (idxEnd + 1)) {
                        // remove the original sourceRet
                        strID = $(value).attr('id').substring(5); // remove "pile-"
                        selectedObj = coll.get(strID);
                        coll.remove(selectedObj);
                        $(value).remove();
                    }
                });
                // update the toolbar UI
                $("div").removeClass("ui-selecting ui-selected");
                $("#Placeholder").prop('disabled', true);
                $("#Retranslation").prop('disabled', true);
                $("#Phrase").prop('disabled', true);
                // start adapting the new Phrase
                if (next_edit !== null) {
                    next_edit.childNodes[4].click();
                }
            } else {
                // selection is a retranslation -- delete it from the model and the DOM
                // first, re-create the original sourcephrase piles and add them to the collection and UI
                bookID = $('.topcoat-navigation-bar__title').attr('id');
                strID = $(selectedStart).attr('id').substring(5); // remove "pile-"
                selectedObj = this.collection.get(strID);
                origTarget = selectedObj.get("orig").split("|");
                selectedObj.get("source").split(" ").forEach(function (value, index) {
                    // add to model
                    newID = Underscore.uniqueId();
                    RetTarget = (index >= origTarget.length) ? " " : origTarget[index];
                    phObj = new spModels.SourcePhrase({ id: (bookID + "--" + newID), source: value, target: RetTarget});
                    coll.add(phObj, {at: coll.indexOf(selectedObj)});
                    // add to UI
                    $(selectedStart).before("<div class=\"pile\" id=\"pile-" + phObj.get('id') + "\"></div>");
                    newView = new SourcePhraseView({ model: phObj});
                    $('#pile-' + phObj.get('id')).append(newView.render().el.childNodes);
                });
                // now delete the retranslation itself
                this.collection.remove(selectedObj);
                $(selectedStart).remove();
                // update the toolbar UI
                $("div").removeClass("ui-selecting ui-selected");
                $("#Retranslation").prop('title', i18n.t("view.dscNewRetranslation"));
                $("#Retranslation .topcoat-icon").removeClass("topcoat-icon--retranslation-delete");
                $("#Retranslation .topcoat-icon").addClass("topcoat-icon--retranslation-new");
                $("#Placeholder").prop('disabled', true);
                $("#Retranslation").prop('disabled', true);
                $("#Phrase").prop('disabled', true);
            }
        }
    });
});