/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $               = require('jquery'),
        Underscore  = require('underscore'),
        Backbone        = require('backbone'),
        Handlebars      = require('handlebars'),
        Helpers         = require('app/utils/HandlebarHelpers'),
        Marionette      = require('marionette'),
        tplEditProject  = require('text!tpl/EditProject.html'),
        tplNewProject   = require('text!tpl/NewProject.html'),
        tplCases    = require('text!tpl/ProjectCases.html'),
        tplFonts    = require('text!tpl/ProjectFonts.html'),
        tplFont     = require('text!tpl/ProjectFont.html'),
        tplPunctuation      = require('text!tpl/ProjectPunctuation.html'),
        tplSourceLanguage   = require('text!tpl/ProjectSourceLanguage.html'),
        tplTargetLanguage   = require('text!tpl/ProjectTargetLanguage.html'),
        tplUSFMFiltering    = require('text!tpl/ProjectUSFMFiltering.html'),
        i18n        = require('i18n'),
        LanguagesListView = require('app/views/LanguagesListView'),
        usfm       = require('utils/usfm'),
        langs       = require('languages'),
        projModel   = require('app/models/project'),
        langName    = "",
        langCode    = "",
        step        = 1,
        currentView = null,
        languages   = null,
        USFMMarkers = null,
        projCasesView = null,
        projFontsView = null,
        projSourceLanguageView = null,
        projTargetLanguageView =  null,
        projPunctuationView = null,
        projUSFMFiltingView = null,
        template    = null,

        // CasesView
        // View / edit the upper/lowercase equivlencies for the source and target
        // languages, and whether to automatically copy cases.
        CasesView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplCases),
            events: {
                "click #SourceHasCases": "onClickSourceHasCases",
                "click #AutoCapitalize": "onClickAutoCapitalize"
            },
            onClickDeleteRow: function (event) {
                // find the current row
                var array = this.model.get('CasePairs');
                var index = event.currentTarget.id.substr(2); // accurate as an index only until the first item is removed
                var realIndex = index;
                var src = $(("#s-" + index)).val();
                var tgt = $(("#t-" + index)).val();
                var i = 0;
                for (i = 0; i < array.length; i++) { // find the "real" index of this case pair
                    if (array[i].s === src.trim() && array[i].t === tgt.trim()) {
                        realIndex = i; // found where the real item is in the index
                        break;
                    }
                }
                // remove the item from the model
                array.splice(realIndex, 1);
                this.model.set({CasePairs: array});
                // remove the item from the UI
                var element = "#r-" + index;
                $(element).remove();
            },
            onClickSourceHasCases: function (event) {
                // enable / disable the autocapitalize checkbox based on the value
                if ($("#SourceHasCases").is(':checked') === true) {
                    $("#AutoCapitalize").prop('disabled', false);
                    if ($("#AutoCapitalize").is(':checked') === true) {
                        $("#CaseEquivs").prop('hidden', false);
                    } else {
                        $("#CaseEquivs").prop('hidden', true);
                    }
                } else {
                    $("#AutoCapitalize").prop('disabled', true);
                    $("#CaseEquivs").prop('hidden', true);
                }
            },
            onClickAutoCapitalize: function (event) {
                // show / hide the cases list based on the value
                if ($("#AutoCapitalize").is(':checked') === true) {
                    $("#CaseEquivs").prop('hidden', false);
                } else {
                    $("#CaseEquivs").prop('hidden', true);
                }
            }
        }),

        // FontsView - display the fonts for source, target and navigation. Clicking on a link
        // opens the FontView
        FontsView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplFonts)
        }),

        // FontView - view / edit a single font
        FontView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplFont)
        }),

        // PunctuationView - view / edit the punctuation pairs, and specify whether to copy the punctuation from
        // source to target
        PunctuationView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplPunctuation),
            events: {
                "click #CopyPunctuation": "onClickCopyPunctuation"
            },
            onClickDeleteRow: function (event) {
                // find the current row
                var array = this.model.get('PunctPairs');
                var index = event.currentTarget.id.substr(2); // accurate as an index only until the first item is removed
                var realIndex = index;
                var src = $(("#s-" + index)).val();
                var tgt = $(("#t-" + index)).val();
                var i = 0;
                for (i = 0; i < array.length; i++) { // find the "real" index of this punctuation pair
                    if (array[i].s === src.trim() && array[i].t === tgt.trim()) {
                        realIndex = i; // found where the real item is in the index
                        break;
                    }
                }
                // remove the item from the model
                array.splice(realIndex, 1);
                this.model.set({PunctPairs: array});
                // remove the item from the UI
                var element = "#r-" + index;
                $(element).remove();
            },
            onClickCopyPunctuation: function (event) {
                // enable / disable the autocapitalize checkbox based on the value
                if ($("#CopyPunctuation").is(':checked') === true) {
                    $("#PunctMappings").prop('hidden', false);
                } else {
                    $("#PunctMappings").prop('hidden', true);
                }
            }
        }),

        // SourceLanguageView - view / edit the source language name and code, as well as
        // any variants. Also specify whether the language is LTR.
        SourceLanguageView = Marionette.CompositeView.extend({
            template: Handlebars.compile(tplSourceLanguage),
            childView: LanguagesListView,
            itemViewContainer: null,
            attachBuffer: function (compositeView, buffer) {
                var container = this.itemViewContainer;
                container.append(buffer);
            },
            onRender: function () {
                this.itemViewContainer = this.$('div#name-suggestions');
            },
            events: {
                "keyup #SourceLanguageName":    "search",
                "keypress #SourceLanguageName": "onkeypress"
            },
            onSelectLanguage: function (event) {
                // pull out the language
                this.langName = $(event.currentTarget).html().substring($(event.currentTarget).html().indexOf('&nbsp;') + 6).trim();
                $("#langName").html(i18n.t('view.lblSourceLanguageName') + ": " + this.langName);
                this.langCode = $(event.currentTarget).attr('id').trim();
                $("#langCode").html(i18n.t('view.lblCode') + ": " + this.langCode);
            }
        }),

        // TargetLanguageView - view / edit the target language name and code, as well as
        // any variants. Also specify whether the language is LTR.
        TargetLanguageView = Marionette.CompositeView.extend({
            template: Handlebars.compile(tplTargetLanguage),
            childView: LanguagesListView,
            itemViewContainer: null,
            attachBuffer: function (compositeView, buffer) {
                var container = this.itemViewContainer;
                container.append(buffer);
            },
            onRender: function () {
                this.itemViewContainer = this.$('div#name-suggestions');
            },
            events: {
                "keyup #TargetLanguageName":    "search",
                "keypress #TargetLanguageName": "onkeypress"
            },
            onSelectLanguage: function (event) {
                // pull out the language
                this.langName = $(event.currentTarget).html().substring($(event.currentTarget).html().indexOf('&nbsp;') + 6).trim();
                $("#langName").html(i18n.t('view.lblTargetLanguageName') + ": " + this.langName);
                this.langCode = $(event.currentTarget).attr('id').trim();
                $("#langCode").html(i18n.t('view.lblCode') + ": " + this.langCode);
            }
        }),

        // USFMFilteringView
        // View / edit the USFM markers that are filtered from the UI when
        // adapting.
        USFMFilteringView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplUSFMFiltering),
            events: {
                "click #UseCustomFilters": "onClickCustomFilters"
            },
            onClickCustomFilters: function (event) {
                // enable / disable the autocapitalize checkbox based on the value
                if ($("#UseCustomFilters").is(':checked') === true) {
                    $("#USFMFilters").prop('hidden', false);
                } else {
                    $("#USFMFilters").prop('hidden', true);
                }
            }
        }),
        EditProjectView = Marionette.LayoutView.extend({
            template: Handlebars.compile(tplEditProject),
            regions: {
                container: "#StepContainer"
            },
            initialize: function () {
                this.OnNewProject();
            },
            render: function () {
                template = Handlebars.compile(tplEditProject);
                this.$el.html(template());
                this.ShowStep(step);
                return this;
            },
            ////
            // Event Handlers
            ////
            events: {
                "click #sourceFont": "OnEditSourceFont",
                "click #targetFont": "OnEditTargetFont",
                "click #navFont": "OnEditNavFont",
                "keyup #LanguageName":    "searchLanguageName",
                "keypress #LanguageName": "onkeypressLanguageName",
                "click .autocomplete-suggestion": "selectLanguage",
                "click .delete-row": "onClickDeleteRow",
                "click #CopyPunctuation": "OnClickCopyPunctuation",
                "click #SourceHasCases": "OnClickSourceHasCases",
                "click #AutoCapitalize": "OnClickAutoCapitalize",
                "click #UseCustomFilters": "OnClickCustomFilters",
                "click #Prev": "OnPrevStep",
                "click #Next": "OnNextStep"
            },

            searchLanguageName: function (event) {
                // pull out the value from the input field
                var key = $('#LanguageName').val();
                if (key.trim() === "") {
                    // Fix problem where an empty value returns all results.
                    // Here if there's no _real_ value, fetch nothing.
                    languages.fetch({reset: true, data: {name: "    "}});
                } else {
                    // find all matches in the language collection
                    languages.fetch({reset: true, data: {name: key}});
                }
                $(".topcoat-list__header").html(i18n.t("view.lblPossibleLanguages"));
//                console.log(key + ": " + languages.length + " results.");
            },

            onkeypressLanguageName: function (event) {
                $(".topcoat-list__header").html(i18n.t("view.lblSearching"));
                if (event.keycode === 13) { // enter key pressed
                    event.preventDefault();
                }
            },

            searchTarget: function (event) {
                currentView.search(event);
            },
            onkeypressTargetName: function (event) {
                currentView.onkeypress(event);
            },
            selectLanguage: function (event) {
                currentView.onSelectLanguage(event);
            },
            onClickDeleteRow: function (event) {
                currentView.onClickDeleteRow(event);
            },
            OnClickCopyPunctuation: function (event) {
                currentView.onClickCopyPunctuation(event);
            },
            OnClickSourceHasCases: function (event) {
                currentView.onClickSourceHasCases(event);
            },
            OnClickAutoCapitalize: function (event) {
                currentView.onClickAutoCapitalize(event);
            },
            OnClickCustomFilters: function (event) {
                currentView.onClickCustomFilters(event);
            },
            OnEditSourceFont: function (event) {
                console.log("OnEditSourceFont");
    //            currentView = new ProjectFontView({ model: this.model});
    //            // title
    //            this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
    //            // instructions
    //            this.$("#StepInstructions").html(i18n.t('view.dscProjectSourceLanguage'));
    //            // controls
    //            this.$('#StepContainer').html(currentView.render().el.childNodes);
    //            // first step -- disable the prev button
    //            this.$("#Prev").attr('disabled', 'true');
    //            this.$("#lblPrev").html(i18n.t('view.lblPrev'));
    //            this.$("#lblNext").html(i18n.t('view.lblNext'));
            },

            OnEditTargetFont: function (event) {
                console.log("OnEditTargetFont");
            },

            OnEditNavFont: function (event) {
                console.log("OnEditNavFont");
            },

            OnPrevStep: function (event) {
                // pull the info from the current step
                this.GetProjectInfo(step);
                if (step > 1) {
                    step--;
                }
                this.ShowStep(step);
            },

            OnNextStep: function (event) {
                var coll = null;
                // pull the info from the current step
                this.GetProjectInfo(step);
                if (step < 6) {
                    step++;
                    this.ShowStep(step);
                } else {
                    // last step -- finish up
                    // head back to the home page
                    window.Application.home();
                }
            },

            GetProjectInfo: function (step) {
                var value = null,
                    index = 0,
                    punctPairs = null,
                    trimmedValue = null;
                switch (step) {
                case 1: // source language
                    this.model.set("SourceLanguageName", currentView.langName);
                    this.model.set("SourceLanguageCode", currentView.langCode);
                    this.model.set("SourceDir", ($('#SourceRTL').is(':checked') === true) ? "rtl" : "ltr");
                    break;
                case 2: // target language
                    this.model.set("TargetLanguageName", currentView.langName);
                    this.model.set("TargetLanguageCode", currentView.langCode);
                    this.model.set("TargetDir", ($('#TargetRTL').is(':checked') === true) ? "rtl" : "ltr");
                    this.model.set("name", i18n.t("view.lblSourceToTargetAdaptations", {source: this.model.get("SourceLanguageName"), target: currentView.langName}));
                    break;
                case 3: // fonts
                    break;
                case 4: // punctuation
                    this.model.set("CopyPunctuation", ($('#CopyPunctuation').is(':checked') === true) ? "true" : "false");
                    punctPairs = this.model.get("PunctPairs");
                    // TODO: punctuation
                    break;
                case 5: // cases
                    this.model.set("SourceHasUpperCase", ($('#SourceHasCases').is(':checked') === true) ? "true" : "false");
                    this.model.set("AutoCapitalization", ($('#AutoCapitalize').is(':checked') === true) ? "true" : "false");
                    // TODO: cases
                    break;
                case 6: // USFM filtering
                    this.model.set("CustomFilters", ($('#UseCustomFilters').is(':checked') === true) ? "true" : "false");
                    //TODO: markers
                    break;
                }
            },

            OnNewProject: function () {
                // create a new project model object
                //this.openDB();
                languages = new langs.LanguageCollection();
                USFMMarkers = new usfm.MarkerCollection();
                USFMMarkers.fetch({reset: true, data: {name: ""}}); // return all results
            },

            ShowStep: function (number) {
                // clear out the old view (if any)
                currentView = null;
                switch (number) {
                case 1: // source language
                    languages.fetch({reset: true, data: {name: "    "}}); // clear out languages collection filter
                    currentView = new SourceLanguageView({ model: this.model, collection: languages });
                    // title
                    this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                    // instructions
                    this.$("#StepInstructions").html(i18n.t('view.dscProjectSourceLanguage'));
                    // controls
//                    this.$('#StepContainer').html(currentView.render().el.childNodes);
                    // first step -- disable the prev button
                    this.$("#Prev").attr('disabled', 'true');
                    this.$("#lblPrev").html(i18n.t('view.lblPrev'));
                    this.$("#lblNext").html(i18n.t('view.lblNext'));
                    break;
                case 2: // target language
                    languages.fetch({reset: true, data: {name: "    "}}); // clear out languages collection filter
                    currentView = new TargetLanguageView({ model: this.model, collection: languages });
                    // title
                    this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                    // instructions
                    this.$("#StepInstructions").html(i18n.t('view.dscProjectTargetLanguage'));
                    // controls
//                    this.$('#StepContainer').html(currentView.render().el.childNodes);
                    this.$("#Prev").removeAttr('disabled');
                    break;
                case 3: // fonts
                    currentView = new FontsView({ model: this.model});
                    // title
                    $("#StepTitle").html(i18n.t('view.lblCreateProject'));
                    // instructions
                    $("#StepInstructions").html(i18n.t('view.dscProjectFonts'));
                    // controls
//                    $('#StepContainer').html(currentView.render().el.childNodes);
                    // Second step -- enable the prev button
                    break;
                case 4: // punctuation
                    currentView = new PunctuationView({ model: this.model});
                    // title
                    this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                    // instructions
                    this.$("#StepInstructions").html(i18n.t('view.dscProjectPunctuation'));
                    // controls
//                    this.$('#StepContainer').html(currentView.render().el.childNodes);
                    break;
                case 5: // cases
                    currentView = new CasesView({ model: this.model});
                    // title
                    this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                    // instructions
                    this.$("#StepInstructions").html(i18n.t('view.dscProjectCases'));
                    // controls
//                    this.$('#StepContainer').html(currentView.render().el.childNodes);
                    // Penultimate step -- enable the next button (only needed
                    // if the user happens to back up from the last one)
                    this.$("#lblNext").html(i18n.t('view.lblNext'));
                    this.$("#imgNext").removeAttr("style");
                    break;
                case 6: // USFM filtering
                    currentView = new USFMFilteringView({ collection: USFMMarkers});
                    // title
                    this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                    // instructions
                    this.$("#StepInstructions").html(i18n.t('view.dscProjectUSFMFiltering'));
                    // controls
//                    this.$('#StepContainer').html(currentView.render().el.childNodes);
                    // Last step -- change the text of the Next button to "finish"
                    this.$("#lblNext").html(i18n.t('view.lblFinish'));
                    this.$("#imgNext").attr("style", "display:none");
                    break;
                }
                this.container.show(currentView);
            }
        }),
        NewProjectView = Marionette.LayoutView.extend({
            template: Handlebars.compile(tplNewProject),
            regions: {
                container: "#StepContainer"
            },
            initialize: function () {
                this.OnNewProject();
            },
            render: function () {
                template = Handlebars.compile(tplNewProject);
                this.$el.html(template());
                this.ShowStep(step);
                return this;
            },
            ////
            // Event Handlers
            ////
            events: {
                "click #sourceFont": "OnEditSourceFont",
                "click #targetFont": "OnEditTargetFont",
                "click #navFont": "OnEditNavFont",
                "keyup #LanguageName":    "searchLanguageName",
                "keypress #LanguageName": "onkeypressLanguageName",
                "click .autocomplete-suggestion": "selectLanguage",
                "click .delete-row": "onClickDeleteRow",
                "click #CopyPunctuation": "OnClickCopyPunctuation",
                "click #SourceHasCases": "OnClickSourceHasCases",
                "click #AutoCapitalize": "OnClickAutoCapitalize",
                "click #UseCustomFilters": "OnClickCustomFilters",
                "click #Prev": "OnPrevStep",
                "click #Next": "OnNextStep"
            },

            searchLanguageName: function (event) {
                // pull out the value from the input field
                var key = $('#LanguageName').val();
                if (key.trim() === "") {
                    // Fix problem where an empty value returns all results.
                    // Here if there's no _real_ value, fetch nothing.
                    languages.fetch({reset: true, data: {name: "    "}});
                } else {
                    // find all matches in the language collection
                    languages.fetch({reset: true, data: {name: key}});
                }
                $(".topcoat-list__header").html(i18n.t("view.lblPossibleLanguages"));
//                console.log(key + ": " + languages.length + " results.");
            },

            onkeypressLanguageName: function (event) {
                $(".topcoat-list__header").html(i18n.t("view.lblSearching"));
                if (event.keycode === 13) { // enter key pressed
                    event.preventDefault();
                }
            },

            searchTarget: function (event) {
                currentView.search(event);
            },
            onkeypressTargetName: function (event) {
                currentView.onkeypress(event);
            },
            selectLanguage: function (event) {
                currentView.onSelectLanguage(event);
            },
            onClickDeleteRow: function (event) {
                currentView.onClickDeleteRow(event);
            },
            OnClickCopyPunctuation: function (event) {
                currentView.onClickCopyPunctuation(event);
            },
            OnClickSourceHasCases: function (event) {
                currentView.onClickSourceHasCases(event);
            },
            OnClickAutoCapitalize: function (event) {
                currentView.onClickAutoCapitalize(event);
            },
            OnClickCustomFilters: function (event) {
                currentView.onClickCustomFilters(event);
            },
            OnEditSourceFont: function (event) {
                console.log("OnEditSourceFont");
    //            currentView = new ProjectFontView({ model: this.model});
    //            // title
    //            this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
    //            // instructions
    //            this.$("#StepInstructions").html(i18n.t('view.dscProjectSourceLanguage'));
    //            // controls
    //            this.$('#StepContainer').html(currentView.render().el.childNodes);
    //            // first step -- disable the prev button
    //            this.$("#Prev").attr('disabled', 'true');
    //            this.$("#lblPrev").html(i18n.t('view.lblPrev'));
    //            this.$("#lblNext").html(i18n.t('view.lblNext'));
            },

            OnEditTargetFont: function (event) {
                console.log("OnEditTargetFont");
            },

            OnEditNavFont: function (event) {
                console.log("OnEditNavFont");
            },

            OnPrevStep: function (event) {
                // pull the info from the current step
                this.GetProjectInfo(step);
                if (step > 1) {
                    step--;
                }
                this.ShowStep(step);
            },

            OnNextStep: function (event) {
                var coll = null;
                // pull the info from the current step
                this.GetProjectInfo(step);
                if (step < 6) {
                    step++;
                    this.ShowStep(step);
                } else {
                    // last step -- finish up
                    // head back to the home page
                    window.Application.home();
                }
            },

            GetProjectInfo: function (step) {
                var value = null,
                    index = 0,
                    punctPairs = null,
                    trimmedValue = null;
                switch (step) {
                case 1: // source language
                    this.model.set("SourceLanguageName", currentView.langName);
                    this.model.set("SourceLanguageCode", currentView.langCode);
                    this.model.set("SourceDir", ($('#SourceRTL').is(':checked') === true) ? "rtl" : "ltr");
                    break;
                case 2: // target language
                    this.model.set("TargetLanguageName", currentView.langName);
                    this.model.set("TargetLanguageCode", currentView.langCode);
                    this.model.set("TargetDir", ($('#TargetRTL').is(':checked') === true) ? "rtl" : "ltr");
                    this.model.set("id", (this.model.get("SourceLanguageCode" + "." + currentView.langCode)));
                    this.model.set("name", i18n.t("view.lblSourceToTargetAdaptations", {source: this.model.get("SourceLanguageName"), target: currentView.langName}));
                    break;
                case 3: // fonts
                    break;
                case 4: // punctuation
                    this.model.set("CopyPunctuation", ($('#CopyPunctuation').is(':checked') === true) ? "true" : "false");
                    punctPairs = this.model.get("PunctPairs");
                    // TODO: punctuation
                    break;
                case 5: // cases
                    this.model.set("SourceHasUpperCase", ($('#SourceHasCases').is(':checked') === true) ? "true" : "false");
                    this.model.set("AutoCapitalization", ($('#AutoCapitalize').is(':checked') === true) ? "true" : "false");
                    // TODO: cases
                    break;
                case 6: // USFM filtering
                    this.model.set("CustomFilters", ($('#UseCustomFilters').is(':checked') === true) ? "true" : "false");
                    //TODO: markers
                    break;
                }
            },

            OnNewProject: function () {
                // create a new project model object
                //this.openDB();
                languages = new langs.LanguageCollection();
                USFMMarkers = new usfm.MarkerCollection();
                USFMMarkers.fetch({reset: true, data: {name: ""}}); // return all results
            },

            ShowStep: function (number) {
                // clear out the old view (if any)
                currentView = null;
                switch (number) {
                case 1: // source language
                    languages.fetch({reset: true, data: {name: "    "}}); // clear out languages collection filter
                    currentView = new SourceLanguageView({ model: this.model, collection: languages });
                    // title
                    this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                    // instructions
                    this.$("#StepInstructions").html(i18n.t('view.dscProjectSourceLanguage'));
                    // controls
//                    this.$('#StepContainer').html(currentView.render().el.childNodes);
                    // first step -- disable the prev button
                    this.$("#Prev").attr('disabled', 'true');
                    this.$("#lblPrev").html(i18n.t('view.lblPrev'));
                    this.$("#lblNext").html(i18n.t('view.lblNext'));
                    break;
                case 2: // target language
                    languages.fetch({reset: true, data: {name: "    "}}); // clear out languages collection filter
                    currentView = new TargetLanguageView({ model: this.model, collection: languages });
                    // title
                    this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                    // instructions
                    this.$("#StepInstructions").html(i18n.t('view.dscProjectTargetLanguage'));
                    // controls
//                    this.$('#StepContainer').html(currentView.render().el.childNodes);
                    this.$("#Prev").removeAttr('disabled');
                    break;
                case 3: // fonts
                    currentView = new FontsView({ model: this.model});
                    // title
                    $("#StepTitle").html(i18n.t('view.lblCreateProject'));
                    // instructions
                    $("#StepInstructions").html(i18n.t('view.dscProjectFonts'));
                    // controls
//                    $('#StepContainer').html(currentView.render().el.childNodes);
                    // Second step -- enable the prev button
                    break;
                case 4: // punctuation
                    currentView = new PunctuationView({ model: this.model});
                    // title
                    this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                    // instructions
                    this.$("#StepInstructions").html(i18n.t('view.dscProjectPunctuation'));
                    // controls
//                    this.$('#StepContainer').html(currentView.render().el.childNodes);
                    break;
                case 5: // cases
                    currentView = new CasesView({ model: this.model});
                    // title
                    this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                    // instructions
                    this.$("#StepInstructions").html(i18n.t('view.dscProjectCases'));
                    // controls
//                    this.$('#StepContainer').html(currentView.render().el.childNodes);
                    // Penultimate step -- enable the next button (only needed
                    // if the user happens to back up from the last one)
                    this.$("#lblNext").html(i18n.t('view.lblNext'));
                    this.$("#imgNext").removeAttr("style");
                    break;
                case 6: // USFM filtering
                    currentView = new USFMFilteringView({ collection: USFMMarkers});
                    // title
                    this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                    // instructions
                    this.$("#StepInstructions").html(i18n.t('view.dscProjectUSFMFiltering'));
                    // controls
//                    this.$('#StepContainer').html(currentView.render().el.childNodes);
                    // Last step -- change the text of the Next button to "finish"
                    this.$("#lblNext").html(i18n.t('view.lblFinish'));
                    this.$("#imgNext").attr("style", "display:none");
                    break;
                }
                this.container.show(currentView);
            }
        });
    
    return {
        EditProjectView: EditProjectView,
        NewProjectView: NewProjectView,
        CasesView: CasesView,
        FontsView: FontsView,
        FontView: FontView,
        PunctuationView: PunctuationView,
        SourceLanguageView: SourceLanguageView,
        TargetLanguageView: TargetLanguageView,
        USFMFilteringView: USFMFilteringView
    };
});
