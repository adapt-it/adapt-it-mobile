/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Underscore  = require('underscore'),
        Handlebars  = require('handlebars'),
        Backbone    = require('backbone'),
        i18n        = require('i18n'),
        LanguagesListView = require('app/views/LanguagesListView'),
        langs       = require('utils/languages'),
        projModel   = require('app/models/project'),
        tplText     = require('text!tpl/ProjectTargetLanguage.html'),
        template    = Handlebars.compile(tplText),
        langName    = "",
        langCode    = "",
        languages   = null;
    
    return Backbone.View.extend({
        
        initialize: function () {
            // autocomplete takes either an array of strings or suggestion objects. Use the
            // underscore "pluck" method to create an array of strings out of the Ref_Name attribute.
            this.languageList = new langs.LanguageCollection();
        },

        render: function () {
            var contents = template(this.model.toJSON());
            this.$el.html(contents);
            this.listView = new LanguagesListView({collection: this.languageList, el: $("#name-suggestions", this.el)});
            return this;
        },
        
        events: {
            "keyup #TargetLanguageName":    "search",
            "keypress #TargetLanguageName": "onkeypress"
        },

        search: function (event) {
            // pull out the value from the input field
            var key = $('#TargetLanguageName').val();
            if (key.trim() === "") {
                // Fix problem where an empty value returns all results.
                // Here if there's no _real_ value, fetch nothing.
                this.languageList.fetch({reset: true, data: {name: "    "}});
            } else {
                // find all matches in the language collection
                this.languageList.fetch({reset: true, data: {name: key}});
            }
        },
        
        onkeypress: function (event) {
            if (event.keycode === 13) { // enter key pressed
                event.preventDefault();
            }
        },
        
        onSelectLanguage: function (event) {
            // pull out the language
            this.langName = $(event.currentTarget).html().substring($(event.currentTarget).html().indexOf('&nbsp;') + 6).trim();
            $("#langName").html(i18n.t('view.lblTargetLanguageName') + ": " + this.langName);
            this.langCode = $(event.currentTarget).attr('id').trim();
            $("#langCode").html(i18n.t('view.lblCode') + ": " + this.langCode);
        }


    });

});