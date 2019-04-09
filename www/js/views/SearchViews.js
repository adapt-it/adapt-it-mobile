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

        ChapterListView = Marionette.CollectionView.extend({
            
            childView: ChapterItemView,
            emptyView: NoChildrenView,

            initialize: function () {
                this.collection.on("reset", this.render, this);
            }

        }),

        TUListView = Marionette.CollectionView.extend({
            
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
                lstSourceWords: "#SourceWords"
            },

            initialize: function () {
                this.chapterList = new chapterModels.ChapterCollection();
                this.TUList = new tuModels.TargetUnitCollection();
                this.CLV = new ChapterListView({collection: this.chapterList});
                this.TULV = new TUListView({collection: this.TUList});
                this.render();
            },
            
            onBeforeShow: function () {
                this.showChildView('lstChapters', new ChapterListView({collection: this.chapterList}));
                this.showChildView('lstSourceWords', new TUListView({collection: this.TUList}));
                
            },

            render: function () {
                template = Handlebars.compile(tplLookup);
                this.$el.html(template());
                return this;
            },

            events: {
                "input #search":    "search",
                "click #btnChapters": "onShowChapters",
                "click #btnSourceWords": "onShowSourceWords"
            },
            
            onShowChapters: function () {
                // show the chapters list
                $("#rdoChapters").prop("checked", true); // initially select chapters
                $("#Chapters").removeAttr("style");
                $("#SourceWords").attr("style", "display:none");
            },
            
            onShowSourceWords: function () {
                // show the source words list
                $("#rdoSourceWords").prop("checked", true); // initially select chapters
                $("#Chapters").attr("style", "display:none");
                $("#SourceWords").removeAttr("style");
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
        ChapterListView: ChapterListView,
        TUListView: TUListView
    };
});