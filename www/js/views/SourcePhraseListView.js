/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Underscore  = require('underscore'),
        Handlebars  = require('handlebars'),
        Backbone    = require('backbone'),
        SourcePhraseView  = require('app/views/SourcePhraseView'),
        spModels   = require('app/models/sourcephrase'),
        tplText     = require('text!tpl/SourcePhraseList.html'),
        template = Handlebars.compile(tplText),
        selectedStart = null,
        selectedEnd = null,
        idxStart = null,
        idxEnd = null,
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
        // Event Handlers
        ////
        events: {
            "mousedown .source": "selectingPilesStart",
            "touchstart .source": "selectingPilesStart",
            "mousemove .source": "selectingPilesMove",
            "touchmove .source": "selectingPilesMove",
            "mouseup .source": "selectingPilesEnd",
            "touchend .source": "selectingPilesEnd",
            "click .target": "selectedAdaptation",
            "keydown .target": "editAdaptation",
            "blur .target": "unselectedAdaptation"
        },

        // user is starting to select one or more piles
        selectingPilesStart: function (event) {
            // change the class of the mousedown area to let the user know
            // we're tracking the selection
            if (selectedStart !== null) {
                // there was an old selection -- remove the ui-selected class
                $("div").removeClass("ui-selecting ui-selected");
            }
            selectedStart = event.currentTarget.parentElement; // select the pile, not the source (the currentTarget)
            selectedEnd = selectedStart;

            idxStart = $(selectedStart).index() - 1; // BUGBUG why off by one?
            idxEnd = idxStart;
            //console.log("selectedStart: " + selectedStart.id);
            //console.log("selectedEnd: " + selectedEnd.id);
            isSelecting = true;
            $(event.currentTarget.parentElement).addClass("ui-selecting");
        },
        // user is starting to select one or more piles
        selectingPilesMove: function (event) {
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
                idxEnd = $(tmpEnd).index() - 1; // EDB try
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
        // user released the mouse here
        selectingPilesEnd: function (event) {
            var tmpItem = null,
                tmpIdx = 0;
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
                    $(event.currentTarget.parentElement).addClass("ui-selected");
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
                    $("#Placeholder").prop('title', "Remove Placeholder");
                    $("#Placeholder .icomatic").html("placeholderdelete");
                } else {
                    // not a placeholder -- can add a new one
                    isPlaceholder = false;
                    $("#Placeholder").prop('title', "New Placeholder");
                    $("#Placeholder .icomatic").html("placeholdernew");
                }
                // did the user select a phrase?
                if ((selectedStart.id).indexOf("phr") !== -1) {
                    // phrase -- can remove it, but not add a new one
                    isPhrase = true;
                    $("#Phrase").prop('title', "Remove Phrase");
                    $("#Phrase .icomatic").html("phrasedelete");
                    $("#Phrase").prop('disabled', false); // enable toolbar button (to delete phrase)
                } else {
                    // not a placeholder -- can add a new one
                    isPhrase = false;
                    $("#Phrase").prop('title', "New Phrase");
                    $("#Phrase .icomatic").html("phrasenew");
                }
                // did the user select a retranslation?
                if ((selectedStart.id).indexOf("ret") !== -1) {
                    // retranslation -- can remove it, but not add a new one
                    isRetranslation = true;
                    $("#Retranslation").prop('title', "Remove Retranslation");
                    $("#Retranslation .icomatic").html("retranslationdelete");
                    $("#Retranslation").prop('disabled', false); // enable toolbar button (to delete retranslation)
                } else {
                    // not a retranslation -- can add a new one
                    isRetranslation = false;
                    $("#Retranslation").prop('title', "New Retranslation");
                    $("#Retranslation .icomatic").html("retranslationnew");
                }
                $("#Placeholder").prop('disabled', false);
            }
        },
        
        // user has clicked on the target field -- swap out the static text
        // with the input control, dynamically resized if needed
        selectedAdaptation: function (event) {
            var targetText = "";
            // set the current adaptation cursor
            selectedStart = event.currentTarget.parentElement; // pile
            //console.log("selectedStart: " + selectedStart.id);
            // TODO: pull out the possible adaptation from the KB
            // show the input field and set focus to it
            $(event.currentTarget).focus();
        },
        
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
                event.stopPropagation();
                event.preventDefault();
                $(event.currentTarget).blur();
    
                if (event.shiftKey) {
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
            }
        },
        // user has moved out of the current adaptation input field
        unselectedAdaptation: function (event) {
            var value = null,
                trimmedValue = null,
                strID = null,
                model = null;
            
            // get the adaptation text
			value = $(event.currentTarget).text();
			trimmedValue = value.trim();
			if (trimmedValue) {
                // find and update the model object
                strID = $(event.currentTarget.parentElement).attr('id').substring(5); // remove "pile-"
				model = this.collection.get(strID);
                console.log(model);
                model.set({target: trimmedValue});

				if (value !== trimmedValue) {
					// Model values changes consisting of whitespaces only are
					// not causing change to be triggered Therefore we've to
					// compare untrimmed version with a trimmed one to check
					// whether anything changed
					// And if yes, we've to trigger change event ourselves
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
			} else {
				//this.clear();
			}

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
                $("#Placeholder").prop('title', "New Placeholder");
                $("#Placeholder .icomatic").html("placeholdernew");
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
                        origTarget += $(value).children(".target").html();
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
                $("#Phrase").prop('title', "New Phrase");
                $("#Phrase .icomatic").html("phrasenew");
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
                                    "<div class=\"marker\">&nbsp;</div> <div class=\"source-retranslation\">",
                RetHtmlMid = "</div> <div class=\"target\" contenteditable=\"true\">",
                RetHtmlEnd = "</div></div>";
            // if the current selection is a retranslation, remove it; if not,
            // combine the selection into a new retranslation
            var next_edit = null;
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
                phObj = new spModels.SourcePhrase({ id: ("phr-" + newID), source: RetSource, target: RetSource, orig: origTarget});
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
                $("#Retranslation").prop('title', "New Retranslation");
                $("#Retranslation .icomatic").html("retranslationnew");
                $("#Placeholder").prop('disabled', true);
                $("#Retranslation").prop('disabled', true);
                $("#Phrase").prop('disabled', true);
            }
        }
    });

});