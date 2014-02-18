define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Underscore  = require('underscore'),
        Handlebars  = require('handlebars'),
        Backbone    = require('backbone'),
        SourcePhraseView  = require('app/views/SourcePhraseView'),
        SourcePhraseListView = require('app/views/SourcePhraseListView'),
        spModels    = require('app/models/sourcephrase'),
        tplText     = require('text!tpl/Chapter.html'),
        template    = Handlebars.compile(tplText),
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
			this.$list = $('#chapter');
            this.spList = new spModels.SourcePhraseCollection();
            this.render();
        },
        
        addOne: function (SourcePhrase) {
            var view = new SourcePhraseView({ model: SourcePhrase });
            this.$('#chapter').append(view.render().el);
        },

        addAll: function () {
            var i = 0;
            this.$list.html("");
            for (i = 0; i < this.spList.length; i++) {
                // if we reach a marker after the first element, close out the previous div
                // so we can start a new one (note: the new div logic is in the SourcePhrase.html template)
                if ((i > 0) && (this.spList.at(i).markers !== null)) {
                    this.$('#chapter').append('<//div>');
                }
                // add the new sourcephrase
                this.addOne(this.spList.at(i));
            }
            // close out the last div
            this.$('#chapter').append('<//div>');
        },

        render: function () {
            var myid = this.model.get('id');
            // fetch the source phrases in this chapter
            this.spList.fetch({reset: true, data: {name: myid}});
            this.$el.html(template());
            // populate the list view with the source phrase results
//            this.addAll();
            this.listView = new SourcePhraseListView({collection: this.spList, el: $('#chapter', this.el)});
            return this;
        },
        ////
        // Event Handlers
        ////
        events: {
            "orientionchange window": "doOnOrientationChange",
            "click #Placeholder": "togglePlaceholder",
            "click #Phrase": "togglePhrase",
            "click #Retranslation": "toggleRetranslation"
        },
        doOnOrientationChange: function (event) {
            switch (window.orientation) {
            case -90:
            case 90:
                alert('landscape');
                break;
            default:
                alert('portrait');
                break;
            }
        },
        // User clicked on the Placeholder button
        togglePlaceholder: function (event) {
            // TODO: move placeHolderHtml to templated html
            var next_edit = null,
                selectedObj = null,
                phObj = null,
                placeHolderHtml = "<div id=\"pile-plc-" + Underscore.uniqueId() + "\" class=\"pile\">" +
                                    " <div class=\"marker\">&nbsp;</div> <div class=\"source\">...</div>" +
                                    " <div class=\"target\">&nbsp;</div>" +
                                    " <input type=\"text\" class=\"topcoat-text-input\" placeholder=\"\" value=\"\"></div>";
            console.log("placeholder: " + placeHolderHtml);
            // if the current selection is a placeholder, remove it; if not,
            // add a placeholder before the current selection
            if (isPlaceholder === false) {
                // no placeholder at the selection -- add one
                phObj = new spModels.SourcePhrase({ id: Underscore.uniqueId(), source: "..."});
                selectedObj = spModels.sourcephrases.get(selectedStart);
                spModels.sourcephrases.insertBefore(phObj, selectedObj);
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
            var next_edit = null,
                phraseHtml = null,
                phraseSource = "",
                // phraseObj = null,
                PhraseHtmlStart = "<div id=\"pile-phr-" + Underscore.uniqueId() + "\" class=\"pile\">" +
                                    " <div class=\"marker\">&nbsp;</div> <div class=\"source\">",
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
        }
    });

});