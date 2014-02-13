define(function (require) {

    "use strict";

    var $           = require('jquery'),
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
            this.render();
            this.collection.bind('reset', this.render, this);
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
            "mousedown .pile": "selectingPilesStart",
            "touchstart .pile": "selectingPilesStart",
            "mousemove .pile": "selectingPilesMove",
            "touchmove .pile": "selectingPilesMove",
            "mouseup .pile": "selectingPilesEnd",
            "touchend .pile": "selectingPilesEnd",
            "click .pile": "selectedPiles",
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
            if (event.currentTarget.className !== "pile") {
                selectedStart = event.currentTarget.parentElement; // pile
                selectedEnd = selectedStart;
            } else {
                selectedStart = event.currentTarget; // pile
                selectedEnd = selectedStart;
            }
            idxStart = $(selectedStart).index() - 1; // BUGBUG why off by one?
            idxEnd = idxStart;
            //console.log("selectedStart: " + selectedStart.id);
            //console.log("selectedEnd: " + selectedEnd.id);
            isSelecting = true;
            if (event.currentTarget.className !== "pile") {
                event.currentTarget.parentElement.addClass("ui-selecting");
            } else {
                $(event.currentTarget).addClass("ui-selecting");
            }
        },
        // user is starting to select one or more piles
        selectingPilesMove: function (event) {
            var tmpEnd = null;
            if (event.currentTarget.className.indexOf("pile") === -1) {
                tmpEnd = event.currentTarget.parentElement; // pile
            } else {
                tmpEnd = event.currentTarget; // pile
            }
            // only interested if we're selecting in the same strip
            if ((isSelecting === true) &&
                    (tmpEnd.parentElement === selectedStart.parentElement)) {
                // recalculate the new selectedEnd 
                selectedEnd = tmpEnd;
                idxEnd = $(tmpEnd).index() - 1; // EDB try
                //console.log("selectedEnd: " + selectedEnd.id);
                $(event.currentTarget.parentElement.childNodes).removeClass("ui-selecting");
                if (idxStart === idxEnd) {
                    // try to find the pile element (this could be a child of that element)
                    if (event.currentTarget.className.indexOf("pile") === -1) {
                        event.currentTarget.parentElement.addClass("ui-selecting");
                    } else {
                        $(event.currentTarget).addClass("ui-selecting");
                    }
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
                    // try to find the pile element (this could be a child of that element)
                    if (event.currentTarget.className !== "pile") {
                        event.currentTarget.parentElement.addClass("ui-selected");
                    } else {
                        $(event.currentTarget).addClass("ui-selected");
                    }
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
        
        // user has clicked on a pile -- this is a single selection
        // TODO: not sure that this event fires anymore - selecingPilesEnd now
        // handles the mouseUp event
        selectedPiles: function (event) {
            if (event.currentTarget !== selectedStart) {
                if (selectedStart !== null) {
                    // there was an old selection -- remove the ui-selected class
                    $("div").removeClass("ui-selecting ui-selected");
                }
                selectedStart = event.currentTarget; // pile
                // did the user select a placeholder?
                if ((event.currentTarget.id).indexOf("ph") !== -1) {
                    // placeholder -- can remove it, but not add a new one
                    isPlaceholder = true;
                    $("#Placeholder").prop('checked', true);
                } else {
                    // not a placeholder -- can add a new one
                    isPlaceholder = false;
                    $("#Placeholder").prop('checked', false);
                }
                $("#Placeholder").prop('disabled', false);
                // try to find the pile element (this could be a child of that element)
                if (event.currentTarget.className !== "pile") {
                    event.currentTarget.parentElement.addClass("ui-selected");
                } else {
                    $(event.currentTarget).addClass("ui-selected");
                }
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
                targetText = "";
            if ((event.keyCode === 9) || (event.keyCode === 13)) {
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
                    next_edit.childNodes[6].click();
                }
            }
        },
        // user has moved out of the current adaptation input field
        unselectedAdaptation: function (event) {
			var value = $(event.currentTarget).text();
			var trimmedValue = value.trim();

			// We don't want to handle blur events from an item that is no
			// longer being edited. Relying on the CSS class here has the
			// benefit of us not having to maintain state in the DOM and the
			// JavaScript logic.
			if (!$(event.currentTarget.parentElement).hasClass('ui-selected')) {
				return;
			}

			if (trimmedValue) {
                // find and update the model object
                var strID = $(event.currentTarget.parentElement).attr('id').substring(5); // remove "pile-"
				var model = this.collection.get(strID);
                model.save({ target: trimmedValue });

				if (value !== trimmedValue) {
					// Model values changes consisting of whitespaces only are
					// not causing change to be triggered Therefore we've to
					// compare untrimmed version with a trimmed one to check
					// whether anything changed
					// And if yes, we've to trigger change event ourselves
					this.model.trigger('change');
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
        }
    });

});