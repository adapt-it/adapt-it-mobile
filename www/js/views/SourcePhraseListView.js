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
            "click .source": "selectedPiles",
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
            tmpEnd = event.currentTarget.parentElement; // pile
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
                // we're tracking the selection
                $("div").removeClass("ui-selecting ui-selected");
                if (idxStart === idxEnd) {
                    // only one item selected -- can only create a placeholder
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
                } else {
                    // not a retranslation -- can add a new one
                    isRetranslation = false;
                    $("#Retranslation").prop('title', "New Retranslation");
                    $("#Retranslation .icomatic").html("retranslationnew");
                }
                $("#Placeholder").prop('disabled', false);
            }
        },
        
        // user has clicked on the source line of a pile -- this is a single selection
        // TODO: not sure that this event fires anymore - selecingPilesEnd now
        // handles the mouseUp event
        selectedPiles: function (event) {
            if (event.currentTarget !== selectedStart) {
                if (selectedStart !== null) {
                    // there was an old selection -- remove the ui-selected class
                    $("div").removeClass("ui-selecting ui-selected");
                }
                selectedStart = event.currentTarget.parentElement; // pile
                // did the user select a placeholder?
                /*
                if ((event.currentTarget.parentElement.id).indexOf("plc") !== -1) {
                    // placeholder -- can remove it, but not add a new one
                    isPlaceholder = true;
                    $("#Placeholder").prop('checked', true);
                } else {
                    // not a placeholder -- can add a new one
                    isPlaceholder = false;
                    $("#Placeholder").prop('checked', false);
                }
                $("#Placeholder").prop('disabled', false);
                */
                // set the class to ui-selected
                $(event.currentTarget.parentElement).addClass("ui-selected");
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
            
			value = $(event.currentTarget).text();
			trimmedValue = value.trim();

			// We don't want to handle blur events from an item that is no
			// longer being edited. Relying on the CSS class here has the
			// benefit of us not having to maintain state in the DOM and the
			// JavaScript logic.
//			if (!$(event.currentTarget.parentElement).hasClass('ui-selected')) {
//				return;
//			}

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
					this.model.trigger('change');
				}
                // if the target differs from the source, add "differences" to the class
                if (model.get('source') === model.get('target')) {
                    $(event.currentTarget).removeClass('differences');
                } else if (!$(event.currentTarget).hasClass('differences')) {
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
                phObj = null,
                placeHolderHtml = "<div id=\"pile-plc-" + Underscore.uniqueId() + "\" class=\"pile\">" +
                                    "<div class=\"marker\">&nbsp;</div> <div class=\"source\">...</div>" +
                                    " <div class=\"target differences\" contenteditable=\"true\">&nbsp;</div>";
            console.log("placeholder: " + placeHolderHtml);
            // if the current selection is a placeholder, remove it; if not,
            // add a placeholder before the current selection
            if (isPlaceholder === false) {
                // no placeholder at the selection -- add one
                phObj = new spModels.SourcePhrase({ id: Underscore.uniqueId(), source: "..."});
                strID = $(selectedStart).attr('id').substring(5); // remove "pile-"
                selectedObj = this.collection.get(strID);
                this.collection.add(phObj, {at: idxStart});
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
                phraseSource = "",
                // phraseObj = null,
                PhraseHtmlStart = "<div id=\"pile-phr-" + Underscore.uniqueId() + "\" class=\"pile\">" +
                                    "<div class=\"marker\">&nbsp;</div> <div class=\"source\">",
                PhraseHtmlMid = "</div> <div class=\"target\">&nbsp;</div>" +
                                    " <input type=\"text\" class=\"topcoat-text-input\" placeholder=\"\" value=\"\"></div>";
            if (isPhrase === false) {
                // build the phrase from the selection
                // create a new sourcephrase object in the model
                // var spNew = chapter.
                $(selectedStart.parentElement).children(".pile").each(function (index, value) {
                    if (index >= idxStart && index <= idxEnd) {
                        // concatenate the source into a single phrase
                        if (index > idxStart) {
                            phraseSource += " ";
                        }
                        phraseSource += $(value).children(".source").html();
                        // phraseObj = new SourcePhrase ([ id: Underscore.UniqueId().stringify(), source: "..."]);
                        
                        // orig.add($(value).children(".source").html());
                        // remove the original sourcephrase
                        // TODO: not sure if iteration breaks w/ remove call -- $(selectedStart).remove();
                        // might need to select indices and remove them together after the .each loop
                    }
                });
                phraseHtml = PhraseHtmlStart + phraseSource + PhraseHtmlMid;
                console.log("phrase: " + phraseHtml);
                $(selectedStart).before(phraseHtml);
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
            // if the current selection is a retranslation, remove it; if not,
            // combine the selection into a new retranslation
            var next_edit = null;
            if (isRetranslation === false) {
                // update the toolbar UI
                $("div").removeClass("ui-selecting ui-selected");
                $("#Placeholder").prop('disabled', true);
                $("#Retranslation").prop('disabled', true);
                $("#Phrase").prop('disabled', true);
                // start adapting the new Phrase
                if (next_edit !== null) {
                    next_edit.childNodes[5].click();
                }
            } else {
                // selection is a phrase -- delete it from the model and the DOM
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