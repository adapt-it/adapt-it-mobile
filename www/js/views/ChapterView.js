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
        template    = Handlebars.compile(tplText);

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
            this.$el.html(template(this.model.toJSON()));
            // populate the list view with the source phrase results
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
        // just pass the event handler down to the list view to handle
        togglePlaceholder: function (event) {
            this.listView.togglePlaceholder(event);
        },
        togglePhrase: function (event) {
            this.listView.togglePhrase(event);
        },
        toggleRetranslation: function (event) {
            this.listView.toggleRetranslation(event);
        }
    });

});