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
        tplRSList       = require('text!tpl/RefStringList.html'),
        theRefStrings   = Handlebars.compile(tplRSList),
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
            strOldSP: "",
            bDirty: false,
            template: Handlebars.compile(tplTargetUnit),
            regions: {
                container: "#StepContainer"
            },
            initialize: function () {
                this.render();
            },
            // set the current translation to the provided text
            selectTranslation: function (newValue) {
                console.log("selectTranslation - new value: " + newValue);
                if (window.Application.spList.length > 0) {
                    // update the KB
                    // update the SourcePhrase
                    var sp = window.Application.spList.at(0);
                    // Need: prevpunct + target (with copy capitalization) + follpunct
                    
//                    sp.set("target", newValue));
                }
                
            },
            // Edit the spelling of a RefString instance. This does a couple things:
            // - Creates a copy of the original RefString (with a N count of -(n) / not used)
            // - Change the spelling of the RefString (with N = the old N), so it shows up with the same frequency
            editTranslation: function (index, newRS) {
                var refstrings = this.model.get("refstring");
                console.log("editTranslation - old target: " + refstrings[index].target + ", n: " + refstrings[index].n + ", new value: " + newRS);
                // create a copy with the old value
                var copyRS = {
                        'target': refstrings[index].target,
                        'n': -(refstrings[index].n)
                    };
                refstrings.push(copyRS);
                // set the new value
                refstrings[index].target = newRS;
                // save the changes
                this.model.set('refstring', refstrings, {silent: true});
                this.model.update();
                this.showRefStrings(newRS);
            },
            showRefStrings: function (strTarget) {
                var refstrings = this.model.get("refstring");
                var i = 0;
                var selectedIndex = 0;
                $("#RefStrings").html(theRefStrings(refstrings));
                // set the frequency meters for each refstring
                for (i = 0; i < refstrings.length; i++) {
                    if (strTarget.length > 0) {
                        // looking to select a refstring after redrawing
                        if (refstrings[i].target === strTarget) {
                            selectedIndex = i; // found it
                        }
                    }
                    if (refstrings[i].n > 0) {
                        // normal refstring instance
                        $("#pct-" + i).width((Math.round(refstrings[i].n / refstrings[0].n * 90) + 10) + "%");
                    } else {
                        // deleted refstring
                        $("#pct-" + i).width("0%");
                        $("#rs-" + i).addClass("deleted");
                    }
                }
                if (strTarget.length > 0) {
                    // now select the index we found
                    $("#rs-" + selectedIndex).click();
                }
            },
            events: {
                "focus #tgtPhrase": "onFocusTarget",
                "blur #tgtPhrase": "onBlurTarget",
                "keydown #tgtphrase": "onEditTarget",
                "click #btnUndo": "onUndoTarget",
                "click .topcoat-list__item": "onClickRefString",
                "keydown .refstring-list__item": "onEditRefString",
                "blur .refstring-list__item": "onBlurRefString",
                "click .btnRestore": "onClickRestore",
                "click .btnDelete": "onClickDelete",
                "click .btnEdit": "onClickEdit",
                "click .btnSelect": "onClickSelect",
                "click .btnSearch": "onClickSearch"
            },
            onFocusTarget: function () {
                // show the undo button, in case the user wants to revert  
            },
            onEditTarget: function () {
                // show the undo button, in case the user wants to revert  
            },
            onBlurTarget: function () {
                // hide the undo button
            },
            onUndoTarget: function () {
                
            },
            onClickRefString: function (event) {
                var RS_ACTIONS = "<div class=\"control-row\"><button id=\"btnRSSelect\" class=\"btnSelect\" title=\"" + i18next.t("view.lblUseTranslation") + "\"><span class=\"btn-check\" role=\"img\"></span>" + i18next.t("view.lblUseTranslation") + "</button></div><div class=\"control-row\"><button id=\"btnRSEdit\" title=\"" + i18next.t("view.lblEditTranslation") + "\" class=\"btnEdit\"><span class=\"btn-pencil\" role=\"img\"></span>" + i18next.t("view.lblEditTranslation") + "</button></div><div class=\"control-row\"><button id=\"btnRSSearch\" title=\"" + i18next.t("view.lblFindInDocuments") + "\" class=\"btnSearch\"><span class=\"btn-search\" role=\"img\"></span>" + i18next.t("view.lblFindInDocuments") + "</button></div><div class=\"control-row\"><button id=\"btnRSDelete\" title=\"" + i18next.t("view.lblDeleteTranslation") + "\" class=\"btnDelete\"><span class=\"btn-delete\" role=\"img\"></span>" + i18next.t("view.lblDeleteTranslation") + "</button></div>",
                    RS_HIDDEN = "<div class=\"control-row\">" + i18next.t("view.dscHiddenTranslation") + "</div><div class=\"control-row\"><button id=\"btnRSRestore\" class=\"btnRestore\" title=\"" + i18next.t("view.lblRestoreTranslation") + "\"><span class=\"btn-check\" role=\"img\"></span>" + i18next.t("view.lblRestoreTranslation") + "</button></div>",
                    refstrings = this.model.get("refstring"),
                    index = event.currentTarget.id.substr(3);
                // Toggle the visibility of the action menu bar
                if ($("#lia-" + index).hasClass("show")) {
                    // hide it
                    $("#li-" + index).toggleClass("li-selected");
                    $("#lia-" + index).html(); // clear out any old html actions for this refstring
                    $("#lia-" + index).toggleClass("show");
                } else {
                    // get rid of any other visible action bars
                    $(".topcoat-list__item").removeClass("li-selected");
                    $(".liActions").removeClass("show");
                    // now show this one
                    $("#li-" + index).toggleClass("li-selected");
                    $("#lia-" + index).toggleClass("show");
                    if (refstrings[index].n > 0) {
                        $("#lia-" + index).html(RS_ACTIONS); // normal refstring actions
                    } else {
                        $("#lia-" + index).html(RS_HIDDEN); // this refstring is hidden / deleted
                    }
                }
            },
            // Delete / hide this refstring (i.e., set the n to 0 so it does NOT show in the dropdown)
            onClickDelete: function (event) {
                event.stopPropagation();
                var index = event.currentTarget.parentElement.parentElement.id.substr(4);
                var refstrings = this.model.get("refstring");
                var strSelect = refstrings[index].target;
                // set the N count to -(n) so it no longer displays, BUT we can undelete later if needed
                console.log("onClickDelete - deleting target: " + refstrings[index].target + ", n: " + refstrings[index].n);
                refstrings[index].n = -(refstrings[index].n);
                // re-sort the refstrings
                refstrings.sort(function (a, b) {
                    // high to low
                    return parseInt(b.n, 10) - parseInt(a.n, 10);
                });
                this.model.set('refstring', refstrings, {silent: true});
                this.model.update();
                // redraw / select deleted refstring
                this.showRefStrings(strSelect);
            },
            // Undelete / unhide this refstring (i.e., set the n to 1 so it show up in the dropdown)
            onClickRestore: function (event) {
                event.stopPropagation();
                var index = event.currentTarget.parentElement.parentElement.id.substr(4);
                var refstrings = this.model.get("refstring");
                var strSelect = refstrings[index].target;
                console.log("onClickRestore - restoring target: " + refstrings[index].target + ", n: " + refstrings[index].n);
                // set the N count
                if (refstrings[index].n < 0) {
                    refstrings[index].n = -(refstrings[index].n); // invert the N value, so we retain the frequency
                } else {
                    // no idea what this was before -- set it to 1 now
                    refstrings[index].n = 1;
                }
                // re-sort the refstrings according to frequency
                refstrings.sort(function (a, b) {
                    // high to low
                    return parseInt(b.n, 10) - parseInt(a.n, 10);
                });
                this.model.set('refstring', refstrings, {silent: true});
                this.model.update();
                // redraw / select restored refstring
                this.showRefStrings(strSelect);
            },
            // use this refstring as the current adaptation
            onClickSelect: function (event) {
                event.stopPropagation();
                var index = event.currentTarget.parentElement.parentElement.id.substr(4);
                var newSP = $("#rs-" + index).html().trim();
                this.strOldSP = $("#tgtPhrase").html();
                // confirm the change
                var strConfirmText = i18next.t('view.lblOldTranslation') + " " + this.strOldSP + "\n\n" + i18next.t('view.lblNewTranslation') + " " + newSP;
                if (navigator.notification) {
                    // on mobile device
                    navigator.notification.confirm(strConfirmText, function (buttonIndex) {
                        if (buttonIndex === 1) {
                            // update the UI
                            $("#tgtPhrase").html(newSP);
                            // update the KB
                            this.selectTranslation(newSP);
                            // reset the dirty bit
                            this.bDirty = false;
                            this.strOldSP = "";
                        } else {
                            // User cancelled -- reset the dirty bit
                            this.bDirty = false;
                            this.strOldSP = "";
                        }
                    }, i18next.t('view.ttlUseTranslation'));
                } else {
                    // in browser
                    // need to prepend a title to the confirmation dialog 
                    strConfirmText = i18next.t('view.ttlUseTranslation') + "\n\n" + strConfirmText;
                    if (confirm(strConfirmText)) {
                        // update the UI
                        $("#tgtPhrase").html(newSP);
                        // update the KB
                        this.selectTranslation(newSP);
                        // reset the dirty bit
                        this.bDirty = false;
                        this.strOldSP = "";
                    } else {
                        // User cancelled -- reset the dirty bit
                        this.bDirty = false;
                        this.strOldSP = "";
                    }
                }

                this.bDirty = true;
            },
            // edit this refstring
            onClickEdit: function (event) {
                event.stopPropagation();
                var index = event.currentTarget.parentElement.parentElement.id.substr(4);
                $("#rs-" + index).attr("contenteditable", true); // allow the refstring to be edited
                $("#rs-" + index).focus();
                this.strOldSP = $("#rs-" + index).html().trim();
                this.bDirty = false;
            },
            // keyboard edit of refstring -- set dirty bit
            onEditRefString: function (event) {
                event.stopPropagation();
                if (event.keyCode === 27) {
                    // Escape key pressed -- cancel the edit (reset the content) and blur
                    // Note that this key is not on most on-screen keyboards
                    $(event.currentTarget).html(this.strOldSP);
                    this.bDirty = false;
                    this.strOldSP = "";
                    $(event.currentTarget).blur();
                } else if ((event.keyCode === 9) || (event.keyCode === 13)) {
                    // Enter or Return key pressed -- blur the target
                    this.onBlurRefString(event);
                } else {
                    // everything else -- set the dirty bit
                    this.bDirty = true;
                }
            },
            // focus leaves refstring edit field -- clear the contenteditable prop on the field
            onBlurRefString: function (event) {
                var refstrings = this.model.get("refstring");
                var index = event.currentTarget.id.substr(3);
                var newSP = $("#rs-" + index).html().trim();
                var i = 0;
                var bDuplicate = false;
                var strConfirmText = "";
                $("#rs-" + index).removeAttr("contenteditable");
                // did the user change anything?
                if (this.bDirty === true) {
                    // field changed -- is this a duplicate translation?
                    for (i = 0; i < refstrings.length; i++) {
                        if (refstrings[i].target === newSP) {
                            bDuplicate = true;
                        }
                    }
                    if (bDuplicate === true) {
                        // Duplicate / error
                        strConfirmText = i18next.t("view.errDuplicateTranslation");
                        if (navigator.notification) {
                            // on mobile device
                            navigator.notification.confirm(strConfirmText, function (buttonIndex) {
                                if (buttonIndex === 1) {
                                    // set focus to the edit field
                                    $("#rs-" + index).attr("contenteditable", true); // allow the refstring to be edited
                                    $("#rs-" + index).focus();
                                } else {
                                    // Cancel -- revert this RS to its old value
                                    $("#rs-" + index).html(this.strOldSP);
                                    this.bDirty = false;
                                    this.strOldSP = "";
                                }
                            }, i18next.t('view.ttlDuplicateTranslation'));
                        } else {
                            // in browser
                            // need to prepend a title to the confirmation dialog 
                            strConfirmText = i18next.t('view.ttlDuplicateTranslation') + "\n\n" + strConfirmText;
                            if (confirm(strConfirmText)) {
                                // OK - set focus to the edit field
                                $("#rs-" + index).attr("contenteditable", true); // allow the refstring to be edited
                                $("#rs-" + index).focus();
                            } else {
                                // Cancel -- revert this RS to its old value
                                $("#rs-" + index).html(this.strOldSP);
                                this.bDirty = false;
                                this.strOldSP = "";
                            }
                        }
                        // exit out (duplicate translation)
                        return;
                    }
                    // Now ask if they want to accept the change
                    strConfirmText = i18next.t('view.lblOldTranslation') + " " + this.strOldSP + "\n\n" + i18next.t('view.lblNewTranslation') + " " + newSP;
                    if (navigator.notification) {
                        // on mobile device
                        navigator.notification.confirm(strConfirmText, function (buttonIndex) {
                            if (buttonIndex === 1) {
                                // update the KB
                                this.editTranslation(index, newSP);
                                // reset the dirty bit
                                this.bDirty = false;
                                this.strOldSP = "";
                            } else {
                                // User cancelled -- reset the text and dirty bit
                                $("#rs-" + index).html(this.strOldSP);
                                this.bDirty = false;
                                this.strOldSP = "";
                            }
                        }, i18next.t('view.lblEditTranslation'));
                    } else {
                        // in browser
                        // need to prepend a title to the confirmation dialog 
                        strConfirmText = i18next.t('view.lblEditTranslation') + "\n\n" + strConfirmText;
                        if (confirm(strConfirmText)) {
                            // update the KB
                            this.editTranslation(index, newSP);
                            // reset the dirty bit
                            this.bDirty = false;
                            this.strOldSP = "";
                        } else {
                            // User cancelled -- reset the text and dirty bit
                            $("#rs-" + index).html(this.strOldSP);
                            this.bDirty = false;
                            this.strOldSP = "";
                        }
                    }
                }
            },
            // search for instances of this refstring in the project
            onClickSearch: function (event) {
                var index = event.currentTarget.parentElement.parentElement.id.substr(4);
                var refstrings = this.model.get("refstring");
                var src = this.model.get("source");
                var tgt = refstrings[index].target;
                // search the db for instances of our source/target pair
                // (note that the # of hits might not match refstrings[index].n if the KB was imported)
                
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
                // display the refstrings (and their relative frequency)
                this.showRefStrings(""); // empty param --> don't select anything
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