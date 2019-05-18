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
        i18n        = require('i18n'),
        chapterModels   = require('app/models/chapter'),
        tuModels        = require('app/models/targetunit'),
        tplChapterList  = require('text!tpl/ChapterList.html'),
        tplTUList = require('text!tpl/SearchSourceList.html'),
        tplSTList = require('text!tpl/SearchTargetList.html'),
        tplLookup     = require('text!tpl/Lookup.html'),
        template = null,
        
        NoChildrenView = Marionette.ItemView.extend({
            template: Handlebars.compile("<div></div>")
        }),
        
        ChapterItemView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplChapterList)
        }),
        
        TUItemView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplTUList)
        }),

        ChapterResultsView = Marionette.CollectionView.extend({
            
            childView: ChapterItemView,
            emptyView: NoChildrenView,

            initialize: function () {
                this.collection.on("reset", this.render, this);
            }

        }),

        SourceResultsView = Marionette.CollectionView.extend({
            
            childView: TUItemView,
            emptyView: NoChildrenView,

            initialize: function () {
                this.collection.on("reset", this.render, this);
            }

        }),

        TargetResultsView = Marionette.CollectionView.extend({
            
            childView: TUItemView,
            emptyView: NoChildrenView,

            initialize: function () {
                this.collection.on("reset", this.render, this);
            }

        }),
        
        LookupView = Marionette.LayoutView.extend({
            template: Handlebars.compile(tplLookup),
            
            regions: {
                lstChapters: "#Chapters",
                lstSourceWords: "#SourceWords",
                lstTargetWords: "#TargetWords"
            },

            initialize: function () {
                this.chapterList = new chapterModels.ChapterCollection();
                this.TUList = new tuModels.TargetUnitCollection();
                this.TargetList = new tuModels.TargetUnitCollection();
                this.CLV = new ChapterResultsView({collection: this.chapterList});
                this.SRLV = new SourceResultsView({collection: this.TUList});
                this.TRLV = new TargetResultsView({collection: this.TargetList});
                this.render();
            },
            
            onBeforeShow: function () {
                this.showChildView('lstChapters', new ChapterResultsView({collection: this.chapterList}));
                this.showChildView('lstSourceWords', new SourceResultsView({collection: this.TUList}));
                this.showChildView('lstTargetWords', new TargetResultsView({collection: this.TUList}));
            },

            render: function () {
                template = Handlebars.compile(tplLookup);
                this.$el.html(template());
                return this;
            },

            events: {
                "input #search":    "search",
                "click #btnChapters": "onShowChapters",
                "click #btnSourceWords": "onShowSourceWords",
                "click #btnTargetWords": "onShowTargetWords"
            },
            
            onShowChapters: function () {
                // show the chapters list
                $("#rdoChapters").prop("checked", true);
                $("#Chapters").removeAttr("style");
                $("#SourceWords").attr("style", "display:none");
                $("#TargetWords").attr("style", "display:none");
            },
            
            onShowSourceWords: function () {
                // show the source words list
                $("#rdoSourceWords").prop("checked", true);
                $("#Chapters").attr("style", "display:none");
                $("#SourceWords").removeAttr("style");
                $("#TargetWords").attr("style", "display:none");
            },

            onShowTargetWords: function () {
                // show the source words list
                $("#rdoTargetWords").prop("checked", true);
                $("#Chapters").attr("style", "display:none");
                $("#SourceWords").attr("style", "display:none");
                $("#TargetWords").removeAttr("style");
            },
            
            onShow: function () {
                var options = "";
                this.onShowChapters(); // set the focus on the chapter tab
                $("#search").focus();
            },
            
            search: function (event) {
                if (event.keycode === 13) { // enter key pressed
                    event.preventDefault();
                }
                var key = $('#search').val();
                if (key.length > 0) {
                    // create new query
                    this.chapterList.fetch({reset: true, data: {name: key}});
                    this.TUList.fetch({reset: true, data: {source: key}});
//                    this.TargetList.filter(return refstring.target.: key}});
//
// for (i = 0; i < refstrings.length; i++) {
//                            if (refstrings[i].n > 0) {
//                                options.push(Underscore.unescape(refstrings[i].target));
//                            }
//                        }
                    
                    $("#btnChapters").html(i18n.t("view.lblDocuments", {number: this.chapterList.length}));
                    $("#btnSourceWords").html(i18n.t("view.lblSourceWords", {number: this.TUList.length}));
                    $("#results").removeAttr("style");
                } else {
                    // clear out query
                    $("#btnChapters").html(i18n.t("view.lblDocuments", {number: 0}));
                    $("#btnSourceWords").html(i18n.t("view.lblSourceWords", {number: 0}));
                    $("#results").attr("style", "display:none");
                }
            }

        });
            
    return {
        LookupView: LookupView,
        ChapterResultsView: ChapterResultsView,
        SourceResultsView: SourceResultsView,
        TargetResultsView: TargetResultsView
    };
});