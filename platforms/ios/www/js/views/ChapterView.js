define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Handlebars  = require('handlebars'),
        Backbone    = require('backbone'),
        tplText     = require('text!tpl/Chapter.html'),
        template = Handlebars.compile(tplText),
        selected;

    return Backbone.View.extend({

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(template(this.model.toJSON()));
            return this;
        },
        events: {
            "click .pile": "selectingPiles",
            "keydown .pile": "selectingPiles",
            "keyup .pile": "selectedPile",
            "click .target": "selectedAdaptation",
            "keydown .topcoat-text-input": "editAdaptation",
            "blur .topcoat-text-input": "unselectedAdaptation"
        },
        // user is starting to select one or more piles
        selectingPiles: function (event) {
            $(event.currentTarget).addClass("ui-selecting");
        },
        // user has finished selecting one or more piles
        selectedPiles: function (event) {
            // Button clicked, you can access the element that was clicked with event.currentTarget
            $(event.currentTarget).addClass("ui-selected");
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
///
            if ((event.keyCode === 9) ||
                (event.keyCode === 13)) {
                var next_edit = null;
                // If tab/enter is pressed, blur and move to edit the next pile
                event.stopPropagation();
                event.preventDefault();
                $(event.currentTarget).blur();
    
                if (event.shiftKey) {
                    next_edit = selected.previousElementSibling;
                    if (next_edit.id.substr(0,4) !== "pile") {
                        // Probably a header -- see if you can go to the previous strip
                        if (selected.parentElement.previousElementSibling != null) {
                            next_edit = selected.parentElement.previousElementSibling.lastElementChild;
                        }
                        else {
                            next_edit = null;
                            console.log("reached first pile.");
                        }
                    }
                } else {
                    if (selected.nextElementSibling != null) {
                        next_edit = selected.nextElementSibling;
                    }
                    else {
                        // last pile in the strip -- see if you can go to the next strip
                        if (selected.parentElement.nextElementSibling != null) {
                            next_edit = selected.parentElement.nextElementSibling.childNodes[3];
                        }
                        else {
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
///
        },
        // user has moved out of the current adaptation input field
        unselectedAdaptation: function (event) {
            $(event.currentTarget).hide();
            $(event.currentTarget.previousElementSibling).show();
        }
    });

});