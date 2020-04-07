/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

// SearchViews.js
// Passage / document lookup functionality. Allows the user to search for a document / book and chapter
// to start adapting.
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Handlebars  = require('handlebars'),
        Marionette  = require('marionette'),
        i18next     = require('i18n'),
        hammer      = require('hammerjs'),
        chapterModels   = require('app/models/chapter'),
        bookModels      = require('app/models/book'),
        spModels        = require('app/models/sourcephrase'),
        tplChapterList  = require('text!tpl/ChapterList.html'),
        tplLookup       = require('text!tpl/Lookup.html'),
        tplTargetUnit   = require('text!tpl/TargetUnit.html'),
        tplRSContext    = require('text!tpl/RefString.html'),
        chapTemplate    = Handlebars.compile(tplChapterList),
        template        = null,
        
        NoChildrenView = Marionette.ItemView.extend({
            template: Handlebars.compile("<div id=\"nochildren\"></div>")
        }),
        
        ChapterItemView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplChapterList)
        }),

        ChapterResultsView = Marionette.CollectionView.extend({
            childView: ChapterItemView,
            emptyView: NoChildrenView,
            initialize: function () {
                this.collection.on("reset", this.render, this);
            }
        }),
        
        RefStringsView = Marionette.ItemView.extend({
            index: 0,
            TU: null,
            refList: null,
            template: Handlebars.compile(tplRSContext),
            events: {
                "click #Prev": "onPrevRef",
                "click #Next": "onNextRef",
                "click #Close": "onClose"
            },
            onPrevRef: function () {
                if (this.index > 0) {
                    this.index--;
                    this.ShowRef();
                }
            },
            onNextRef: function () {
                if (this.index < this.model.n) {
                    this.index++;
                    this.ShowRef();
                }
            },
            onClose: function () {
                
            },
            ShowRef: function () {
                // show the context[index] for this refstring, where [index] < n (total # of references in project)
                if (this.TU === null) {
                    return; // get out -- nothing to look up
                }
                // onShow? create filtered SourcePhraseList refList --> SELECT * from sourcephrase where source=this.TU.source and target=this.model.get("target")
                // this.refList[index]
                // -> Find the reference for this SourcePhrase
                // this.refList[index].chapterid
                // -> Go back until punctuation, then forward until punctuation
            }
        }),
        KBView = Marionette.LayoutView.extend({
            spObj: null,
            isLocked: true, // default value
            template: Handlebars.compile(tplTargetUnit),
            regions: {
                container: "#StepContainer"
            },
            initialize: function () {
                this.render();
            },
            events: {
                "click .big-link": "onClickRefString",
            },
            onClickRefString: function (event) {
                var index = event.currentTarget.id.substr(3);
                // Toggle the visibility of the action menu bar
                if ($("#lia-" + index).hasClass("show")) {
                    // hide it
                    $("#lia-" + index).toggleClass("show");
                } else {
                    // get rid of any other visible action bars
                    $(".liActions").removeClass("show");
                    // now show this one
                    $("#lia-" + index).toggleClass("show");
                }
            },
            onToggleLock: function () {
                // toggle the boolean value
                this.isLocked = !this.isLocked;
                // update the UI accordingly
                if (this.isLocked === true) {
                    $("#imgLockUnlock").attr('class', 'btn-lock');
                } else {
                    $("#imgLockUnlock").attr('class', 'btn-unlock');
                }
            },
            onShow: function () {
                var srcLang = window.Application.currentProject.get('SourceLanguageName');
                var tgtLang = window.Application.currentProject.get('TargetLanguageName');
                if (window.Application.spList.length > 0) {
                    // found a sourcephrase -- fill out the UI
                    var sp = window.Application.spList.at(0);
                    $("#srcPhrase").html(sp.get("source"));
                    $("#tgtPhrase").html(sp.get("target"));
                }
                // fill current translation info
                $("#lblSourceLang").html(srcLang);
                $("#lbltargetLang").html(tgtLang);
                this.$el.hammer({domEvents: true, interval: 500});
                
                //i18next.t('view.dscAdaptContinue', {chapter: chapter.get('name')}),
            }
        }),
        
        LookupView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplLookup),

            initialize: function () {
                this.chapterList = new chapterModels.ChapterCollection();
                this.bookList = new bookModels.BookCollection();
                this.render();
            },

            events: {
                "input #search":    "search",
                "click .ttlbook":   "onSelectBook",
                "click #btnSearch": "onShowSearch",
                "click #btnSelectDocument": "onShowSelectDocument"
            },
            
            onShowSearch: function () {
                // show the chapters list
                $("#rdoSearch").prop("checked", true);
                $("#grpSearch").removeAttr("style");
                $("#grpSelectDocument").attr("style", "display:none");
            },
            
            onShowSelectDocument: function () {
                // show the source words list
                $("#rdoSelectDocument").prop("checked", true);
                $("#grpSearch").attr("style", "display:none");
                $("#grpSelectDocument").removeAttr("style");
            },
            
            onShow: function () {
                var lstBooks = "";
                this.bookList.fetch({reset: true, data: {projectid: this.model.get('projectid')}});
                this.bookList.each(function (model) {
                    lstBooks += "<h3 class=\"topcoat-list__header ttlbook\" id=\"ttl" + model.get("name") + "\">" + model.get("name") + "</h3><ul class=\"topcoat-list__container chapter-list\" id=\"lst" + model.get("name") + "\" style=\"display:none\"></ul>";
                });
                $("#lstBooks").html(lstBooks);
                // if there's only one book, "open" it and show the chapters
                if (this.bookList.length === 1) {
                    $("#lstBooks > h3").first().mouseup();
                }
                this.onShowSearch(); // show the search tab
                $("#search").focus();
            },
            
            search: function (event) {
                var lstChapters = "";
                if (event.keycode === 13) { // enter key pressed
                    event.preventDefault();
                }
                var key = $('#search').val();
                // hide the other chapters
                $("#lstBooks > ul").attr("style", "display:none");
                this.chapterList.fetch({reset: true, data: {name: key}});
                this.chapterList.each(function (model) {
                    lstChapters += chapTemplate(model.attributes);
                });
                if (this.chapterList.length > 0) {
                    $("#lstSearchResults").html(lstChapters);
                    $("#lblSearchResults").removeAttr("style");
                } else {
                    $("#lblSearchResults").attr("style", "display:none");
                }
            },

            onSelectBook: function (event) {
                var key = event.currentTarget.id.substr(3);
                var lstChapters = "";
                console.log("onSelectBook:" + key);
                // hide the other chapters
                $("#lstBooks > ul").attr("style", "display:none");
                $("#lst" + key).removeAttr("style");
                // find each chapter of this book in the chapterlist collection
                this.chapterList.fetch({reset: true, data: {name: key}});
                this.chapterList.each(function (model) {
                    lstChapters += chapTemplate(model.attributes);
                });
                if (this.chapterList.length > 0) {
                    $("#lst" + key).html(lstChapters);
                }
            }
        });
            
    return {
        KBView: KBView,
        RefStringsView: RefStringsView,
        LookupView: LookupView,
        ChapterResultsView: ChapterResultsView
    };
});