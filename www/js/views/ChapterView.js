define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Underscore  = require('underscore'),
        Handlebars  = require('handlebars'),
        Backbone    = require('backbone'),
        tplText     = require('text!tpl/Chapter.html'),
        template    = Handlebars.compile(tplText),
//        placeText   = require('text!tpl/Placeholder.html'),
//        placeTpl    = Handlebars.compile(placeText),
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
        },

        render: function () {
            this.$el.html(template(this.model.toJSON()));
            return this;
        },
        
        ////
        // Event Handlers
        ////
        events: {
            "click #Placeholder": "togglePlaceholder",
            "click #Phrase": "togglePhrase",
            "click #Retranslation": "toggleRetranslation",
            "mousedown .pile": "selectingPilesStart",
            "touchstart .pile": "selectingPilesStart",
            "mousemove .pile": "selectingPilesMove",
            "touchmove .pile": "selectingPilesMove",
            "mouseup .pile": "selectingPilesEnd",
            "touchend .pile": "selectingPilesEnd",
            "click .pile": "selectedPiles",
            "click .target": "selectedAdaptation",
            "keydown .topcoat-text-input": "editAdaptation",
            "blur .topcoat-text-input": "unselectedAdaptation"
        },
        // User clicked on the Placeholder button
        togglePlaceholder: function (event) {
            // TODO: move placeHolderHtml to templated html
            var next_edit = null,
                placeHolderHtml = "<div id=\"pile-ph-" + Underscore.uniqueId() + "\" class=\"pile\">" +
                                    " <div class=\"marker\">&nbsp;</div> <div class=\"source\">...</div>" +
                                    " <div class=\"target\">&nbsp;</div>" +
                                    " <input type=\"text\" class=\"topcoat-text-input\" placeholder=\"\" value=\"\"></div>";
            console.log("placeholder: " + placeHolderHtml);
            // if the current selection is a placeholder, remove it; if not,
            // add a placeholder before the current selection
            if (isPlaceholder === false) {
                // no placeholder at the selection -- add one
                //this.Model.
                $(selectedStart).before(placeHolderHtml);
                //this.$el.html(placeTpl(this.model.toJSON()));
                // start adapting at this location
                $("div").removeClass("ui-selecting ui-selected");
                $("#Placeholder").prop('disabled', true);
                $("#Retranslation").prop('disabled', true);
                $("#Phrase").prop('disabled', true);
                next_edit = selectedStart.previousElementSibling;
                next_edit.childNodes[5].click();
            } else {
                // selection is a placeholder -- delete it from the model and the DOM (html)
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
            var next_edit = null;
            if (isPhrase === false) {
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
            var tmpItem = null;
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
                }
                // did the user select a placeholder?
                if ((selectedStart.id).indexOf("ph") !== -1) {
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
        // user has moved the adaptation input field
        selectedAdaptation: function (event) {
            // set the current adaptation cursor
            selectedStart = event.currentTarget.parentElement; // pile
            //console.log("selectedStart: " + selectedStart.id);
            // hide the current static target text
            $(event.currentTarget).hide();
            // TODO: pull out the possible adaptation from the KB
            // show the input field and set focus to it
            $(event.currentTarget.nextElementSibling).show();
            $(event.currentTarget.nextElementSibling).focus();
        },
        editAdaptation: function (event) {
            if ((event.keyCode === 9) || (event.keyCode === 13)) {
                var next_edit = null;
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
                    next_edit.childNodes[5].click();
                }
            }
        },
        // user has moved out of the current adaptation input field
        unselectedAdaptation: function (event) {
            $(event.currentTarget).hide();
            //var newValue = $(event.currentTarget).val();
            if ($(event.currentTarget.previousElementSibling).html() !==
                    $(event.currentTarget).val()) {
                // value has changed -- update
                
            }
            // update the text with the new input value
            $(event.currentTarget.previousElementSibling).html($(event.currentTarget).val());
            $(event.currentTarget.previousElementSibling).show();
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