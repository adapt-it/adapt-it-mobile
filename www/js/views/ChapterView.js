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
        kbModels    = require('app/models/targetunit'),
        projModel   = require('app/models/project'),
        tplText     = require('text!tpl/Chapter.html'),
        project     = null,
        template    = Handlebars.compile(tplText);

    return Backbone.View.extend({

        initialize: function () {
            var coll = new projModel.ProjectCollection();
            coll.fetch({reset: true, data: {name: ""}});
			this.$list = $('#chapter');
            this.spList = new spModels.SourcePhraseCollection();
            this.kblist = new kbModels.TargetUnitCollection();
            this.project = coll.at(0);
            this.render();
        },
        render: function () {
            var myid = this.model.get('id');
            // fetch the KB for this project
            this.kblist.fetch({reset: true, data: {name: this.project.id}});
            // fetch the source phrases in this chapter
            this.spList.fetch({reset: true, data: {name: myid}});
            this.$el.html(template(this.model.toJSON()));
            // populate the list view with the source phrase results
            this.listView = new SourcePhraseListView({collection: this.spList, el: $('#chapter', this.el)});
            this.listView.kblist = this.kblist;
            this.listView.project = this.project;
            return this;
        },
        ////
        // Event Handlers
        ////
        events: {
            "click #slide-menu-button": "toggleSlideMenu",
            "click #Placeholder": "togglePlaceholder",
            "click #Phrase": "togglePhrase",
            "click #Retranslation": "toggleRetranslation"
        },
        // For the slide-out menu, toggle its state (open or closed)
        toggleSlideMenu: function (event) {
            var elt = document.getElementById('sidebar');
            var cl = elt.classList;
            if (cl.contains('open')) {
                cl.remove('open');
            } else {
                cl.add('open');
            }
            elt = document.getElementById('content');
            cl = elt.classList;
            if (cl.contains('open')) {
                cl.remove('open');
            } else {
                cl.add('open');
            }
            elt = document.getElementById('plus');
            cl = elt.classList;
            if (cl.contains('blue')) {
                cl.remove('blue');
            } else {
                cl.add('blue');
            }
        },
        // For the placeholders, etc., just pass the event handler down to the list view to handle
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