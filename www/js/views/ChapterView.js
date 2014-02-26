/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
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