define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Handlebars  = require('handlebars'),
        Backbone    = require('backbone'),
        tplText     = require('text!tpl/Chapter.html'),
        template    = Handlebars.compile(tplText),
//        placeText   = require('text!tpl/Placeholder.html'),
//        placeTpl    = Handlebars.compile(placeText),
        selected = null,
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
            "mousedown .target": "selectingPiles",
            "click .pile": "selectedPiles",
            "click .target": "selectedAdaptation",
            "keydown .topcoat-text-input": "editAdaptation",
            "blur .topcoat-text-input": "unselectedAdaptation"
        },
        // User clicked on the Placeholder button
        togglePlaceholder: function (event) {
            // if the current selection is a placeholder, remove it; if not,
            // add a placeholder before the current selection
            if (isPlaceholder === false) {
                // no placeholder at the selection -- add one
                //this.$el.html(placeTpl(this.model.toJSON()));
            } else {
                // selection is a placeholder -- delete it
            }
        },
        // User clicked on the Phrase button
        togglePhrase: function (event) {
            // if the current selection is a phrase, remove it; if not,
            // combine the selection into a new phrase
        },
        // User clicked on the Retranslation button
        toggleRetranslation: function (event) {
            // if the current selection is a retranslation, remove it; if not,
            // combine the selection into a new retranslation
        },
        // user is starting to select one or more piles
        selectingPiles: function (event) {
            // change the class of the mousedown area to let the user know
            // we're tracking the selection
            $(event.currentTarget).addClass("ui-selecting");
        },
        // user has finished selecting one or more piles
        selectedPiles: function (event) {
            if (event.currentTarget !== selected) {
                if (selected !== null) {
                    // there was an old selection -- remove the ui-selected class
                    $("div").removeClass("ui-selecting ui-selected");
                }
                selected = event.currentTarget; // pile
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
            selected = event.currentTarget.parentElement; // pile
            console.log("selected: " + selected.id);
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
                    next_edit = selected.previousElementSibling;
                    if (next_edit.id.substr(0, 4) !== "pile") {
                        // Probably a header -- see if you can go to the previous strip
                        if (selected.parentElement.previousElementSibling !== null) {
                            next_edit = selected.parentElement.previousElementSibling.lastElementChild;
                        } else {
                            next_edit = null;
                            console.log("reached first pile.");
                        }
                    }
                } else {
                    if (selected.nextElementSibling !== null) {
                        next_edit = selected.nextElementSibling;
                    } else {
                        // last pile in the strip -- see if you can go to the next strip
                        if (selected.parentElement.nextElementSibling !== null) {
                            next_edit = selected.parentElement.nextElementSibling.childNodes[3];
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
            $(event.currentTarget.previousElementSibling).show();
            if (selected !== null) {
                // there was an old selection -- remove the ui-selected class
                $("div").removeClass("ui-selecting ui-selected");
            }
        }
    });

});