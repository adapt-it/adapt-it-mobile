/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

// ProjectViews.js
// Project creation / import functionality for AIM.
define(function (require) {

    "use strict";

    var $               = require('jquery'),
        Underscore      = require('underscore'),
        ta              = require('typeahead'),
        Backbone        = require('backbone'),
        Handlebars      = require('handlebars'),
        Marionette      = require('marionette'),
        cp              = require('colorpicker'),
        cpb             = require('circularProgressBar'),
        tplEditProject  = require('text!tpl/EditProject.html'),
        tplNewProject   = require('text!tpl/NewProject.html'),
        tplCopyOrImport = require('text!tpl/CopyOrImport.html'),
        tplCases        = require('text!tpl/ProjectCases.html'),
        tplFonts        = require('text!tpl/ProjectFonts.html'),
        tplFont         = require('text!tpl/ProjectFont.html'),
        tplLoadingPleaseWait = require('text!tpl/LoadingPleaseWait.html'),
        tplPunctuation      = require('text!tpl/ProjectPunctuation.html'),
        tplSourceLanguage   = require('text!tpl/ProjectSourceLanguage.html'),
        tplTargetLanguage   = require('text!tpl/ProjectTargetLanguage.html'),
        tplUSFMFiltering    = require('text!tpl/ProjectUSFMFiltering.html'),
        tplEditorPrefs      = require('text!tpl/EditorPrefs.html'),
        tplManageProjs  = require('text!tpl/ManageProjects.html'),
        tplProjList = require('text!tpl/ProjectList.html'),
        projList    = Handlebars.compile(tplProjList),
        i18n        = require('i18n'),
        usfm        = require('utils/usfm'),
        langs       = require('utils/languages'),
        fontModel   = require('app/models/font'),
        innerHtml   = "",
        step        = 1,
        currentView = null,
        languages   = null,
        USFMMarkers = null,
        theFont     = null,
        template    = null,
        projid      = "",
 
        ////
        // Helper methods
        ////
        
        // Helper method that returns the RFC5646 code based on the ISO639 code and variant
        buildFullLanguageCode = function (langCode, langVariant) {
            var fullCode = "";
            // only build if there's a language code defined
            console.log("buildFullLanguageCode: " + langCode + "," + langVariant);
            if (langCode.length > 0) {
                // is there anything in the language variant?
                if (langVariant.length === 0) {
                    // nothing in the variant -- use just the iso639 code with no -x-
                    if (langCode.indexOf("-x-") > 0) {
                        fullCode = langCode.substr(0, langCode.indexOf("-x-"));
                    } else {
                        fullCode = langCode; // just the iso 639 code
                    }
                } else {
                    // variant is defined --- code is in the form [is0639]-x-[variant], where [variant] has
                    // a max length of 8 chars
                    if (langCode.indexOf("-x-") > 0) {
                        // replace the existing variant
                        fullCode = langCode.substr(0, langCode.indexOf("-x-") + 3) + langVariant.toLowerCase().substr(0, 8);
                    } else {
                        // add a new variant
                        fullCode = langCode + "-x-" + langVariant.toLowerCase().substr(0, 8);
                    }
                }
            }
            return fullCode;
        },
        // Helper method to hide the prev/next buttons and increase the scroller size
        // if the screen is too small
        // (Issue #232)
        HideTinyUI = function () {
            if ((window.innerHeight / 2) < ($("#WizStepTitle").height() + $("#StepInstructions").height() + $("#StepContainer").height() + $("#WizardSteps").height())) {
                if (navigator.notification && device.platform === "iOS") {
                    $(".scroller-bottom-tb").css({bottom: "calc(env(safe-area-inset-bottom))"});
                } else {
                    $(".scroller-bottom-tb").css({bottom: "0"});
                }
                $(".bottom-tb").hide();
                $("#Spacer").show();
            }
        },

        // Helper method to show the prev/next buttons and decrease the scroller size
        ShowTinyUI = function () {
            if (navigator.notification && device.platform === "iOS") {
                $(".scroller-bottom-tb").css({bottom: "calc(env(safe-area-inset-bottom) + 61px)"});
            } else {
                $(".scroller-bottom-tb").css({bottom: "61px"});
            }
            $(".bottom-tb").show();
            $("#Spacer").hide();
        },
        // Helper to import the selected file into the specified
        // project object (overridding any existing values). This gets called
        // from both mobileImportAIC and browserImportAIC.
        importSettingsFile = function (file, project) {
            var reader = new FileReader();
            var result = false;
            var errMsg = "";
            var fileName = file.name;
            // Callback for when the file is imported / saved successfully
            var importSuccess = function () {
                console.log("importSuccess()");
                // hide / show UI elements
                $("#selectControls").hide();
                $("#LoadingStatus").hide();
                $("#verifyNameControls").show();
                $("#OKCancelButtons").show();
                $("#lblVerify").hide();
                $("#rowBookName").hide();
                // tell the user the file was imported successfully
                $("#lblDirections").html(i18n.t("view.dscStatusProjImportSuccess", {document: project.get("name")}));
                projid = project.get("projectid");
            };
            // Callback for when the file failed to import
            var importFail = function (e) {
                console.log("importFail(): " + e.message + " (code: " + e.code + ")");
                // update status with the failure message and code (if available)
                var strReason = e.message;
                if (e.code) {
                    strReason += " (code: " + e.code + ")";
                }
                // hide / show UI elements
                $("#selectControls").hide();
                $("#LoadingStatus").hide();
                $("#verifyNameControls").show();
                $("#OKCancelButtons").show();
                $("#lblVerify").hide();
                $("#rowBookName").hide();
                // tell the user what went wrong
                $("#lblDirections").html(i18n.t("view.dscCopyDocumentFailed", {document: fileName, reason: strReason}));
            };
            reader.onloadend = function (e) {
                // did the FileReader.ReadAsText() call fail?
                if (this.error) {
                    importFail(this.error);
                    return false;
                }
                // convert contents to string
                var contents = new TextDecoder('utf-8').decode((this.result));
                // done
                $("#status").html(i18n.t("view.dscStatusImportSuccess", {document: project.get("name")}));
                project.fromString(contents).done(function() {
                    // success -- save the object
                    project.save();
                    importSuccess();
                }).fail(function (err) {
                    importFail(err);
                });
                return; // projects 
        };
            reader.readAsArrayBuffer(file);
        },

        // CopyProjectView
        // Copy a project file from an .aic file on the device.
        CopyProjectView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplCopyOrImport),
            localURLs: null,

            initialize: function () {
            },
                        
            ////
            // Event Handlers
            ////
            events: {
                "click #btnBrowse": "onBtnBrowse",
                "click #btnClipboard": "onBtnClipboard",
                "click #btnCancel": "onCancel",
                "change #selFile": "browserImportAIC",
                "click #OK": "onOK"
            },
            // Handler for the Cancel button (in the loading / please wait template) --
            // user is cancelling the import (might be hung?)
            onCancel: function () {
                // User is cancelling the import operation -- go home
                if (window.history.length > 1) {
                    // there actually is a history -- go back
                    window.history.back();
                } else {
                    // no history (import link from outside app) -- just go home
                    window.location.replace("");
                }
            },
            // Handler for the OK button click -- 
            // saves any changes and goes back to the home page
            onOK: function () {
                // save the model
                var model = this.model;
                model.save();
                // is there already a current project?
                if (window.Application.currentProject !== null) {
                    // YES -- ask if they want to switch
                    if (navigator.notification) {
                        // on mobile device -- use notification plugin API
                        navigator.notification.confirm(
                            i18n.t('view.msgUseProject'),
                            function (btnIndex) {
                                if (btnIndex === 1) {
                                    if (projid.length > 0) {
                                        localStorage.setItem("CurrentProjectID", projid);
                                        window.Application.currentProject = window.Application.ProjectList.where({projectid: projid});;
                                    }
                                    // Clear out any local chapter/book/sourcephrase/KB stuff so it loads 
                                    // from our new project instead
                                    window.Application.BookList.length = 0;
                                    window.Application.ChapterList.length = 0;
                                    window.Application.spList.length = 0;
                                    window.Application.kbList.length = 0;
                                } else {
                                    // No -- just exit
                                }
                                // head back to the home page
                                window.location.replace("");
                            },
                            i18n.t('view.ttlMain'),
                            [i18n.t('view.lblYes'), i18n.t('view.lblNo')]
                        );
                    } else {
                        // in browser -- use window.confirm / window.alert
                        if (window.confirm(i18n.t('view.msgUseProject'))) {
                            window.Application.currentProject = model;
                            localStorage.setItem("CurrentProjectID", model.get("projectid"));
                            // Clear out any local chapter/book/sourcephrase/KB stuff so it loads 
                            // from our new project instead
                            window.Application.BookList.length = 0;
                            window.Application.ChapterList.length = 0;
                            window.Application.spList.length = 0;
                            window.Application.kbList.length = 0;
                        } else {
                            // No -- just exit
                        }
                        // head back to the home page
                        window.location.replace("");
                    }
                } else {
                    // no current project -- set it now
                    if (projid.length > 0) {
                        localStorage.setItem("CurrentProjectID", projid);
                        window.Application.currentProject = window.Application.ProjectList.where({projectid: projid});;
                    }
                    // head back to the home page
                    window.location.replace("");
                }
            },
            // User clicked on the (mobile) Select file button --
            // call getFile() on the chooser plugin, and if we get a file back, import it
            onBtnBrowse: function () {
                var model = this.model;
                chooser.getFile('*/*', function (file) {
                    console.log(file ? file.name : 'canceled');
                    if (file) {
                        // replace the selection UI with the import UI
                        $("#selectControls").hide();
                        $("#LoadingStatus").html(Handlebars.compile(tplLoadingPleaseWait));
                        // Import can take a while, and potentially hang. Provide a way to cancel the operation
                        $("#btnCancel").show();   
                        var fileName = file.name;
                        window.resolveLocalFileSystemURL(file.uri,
                            function (entry) {
                                entry.file(
                                    function (oFile) {
                                        $("#status").html(i18n.t("view.dscStatusReading", {document: fileName}));
                                        importSettingsFile(oFile, model);
                                    },
                                    function (error) {
                                        console.log("FileEntry.file error: " + error.code);
                                    }
                                );
                            },
                            function (error) {
                                console.log("resolveLocalFileSystemURL error: " + error.code);
                            });
                            // importFile(file, model);                        
                    }
                }, function (error) {
                    // Log the error
                    console.log("CopyProjectView::onBtnBrowse getFile() error: " + error);
                });
            },
            // Handler for when the user clicks the "clipboard text" option;
            // copy the clipboard contents, and if they're not empty, try to import the contents as a file
            onBtnClipboard: function () {
                var model = this.model;
                var errMsg = "";
                // Are we in the browser or on a mobile device?
                if (device && (device.platform !== "browser")) {
                    // mobile device
                    cordova.plugins.clipboard.paste(function (text) {
                        if (text !== null && text.length > 0) {
                            // paste call returned AND there's something on the clipboard
                            console.log("Clipboard contents: " + text);
                            // replace the selection UI with the import UI
                            $("#selectControls").hide();
                            $("#LoadingStatus").html(Handlebars.compile(tplLoadingPleaseWait));
                            // Import can take a while, and potentially hang. Provide a way to cancel the operation
                            $("#btnCancel").show();
                            // EDB 12/19/2023: ? not sure if still true - ios has wkwebview now? need to test
                            // EDB 5/29 HACK: clipboard text -- create a blob instead of a file and read it:
                            // Cordova-ios uses an older web view that has a buggy / outdated JS engine w.r.t the File object;
                            // it places the contents in the name attribute. The FileReader does
                            // accept a Blob (the File object derives from Blob), which is why importFile works.
                            console.log("Clipboard selected. Creating ad hoc file from text.");
                            var clipboardFile = new Blob([text], {type: "text/plain"});
                            $("#status").html(i18n.t("view.dscStatusReading", {document: i18n.t("view.lblCopyClipboardText")}));
                            // populate the model properties from the clipboard data
                            importSettingsFile(clipboardFile, model);
                        } else {
                            console.log("No data to import");
                            // No data to import -- tell the user to copy something to the clipboard
                            if (navigator.notification) { // just in case...
                                // on mobile device -- use notification plugin API
                                navigator.notification.alert(i18n.t('view.ErrNoClipboard'));
                            } else {
                                // fall back on webview alert
                                alert(i18n.t('view.ErrNoClipboard'));
                            }
                        }
                    }, function (error) {
                        // error in clipboard retrieval -- skip entry
                        // (seen this when there's data on the clipboard that isn't text/plain)
                        console.log("Error retrieving clipboard data:" + error);
                    });
                } else {
                    // browser
                    navigator.clipboard.readText().then(
                    (clipText) => {
                        if (clipText.length > 0) {
                            console.log("Non-empty clipboard selected.");
                            // replace the selection UI with the import UI
                            $("#selectControls").hide();
                            $("#LoadingStatus").html(Handlebars.compile(tplLoadingPleaseWait));
                            // Import can take a while, and potentially hang. Provide a way to cancel the operation
                            $("#btnCancel").show();   
                            // EDB 12/19/2023: ? not sure if still true - ios has wkwebview now? need to test
                            // EDB 5/29 HACK: clipboard text -- create a blob instead of a file and read it:
                            // Cordova-ios uses an older web view that has a buggy / outdated JS engine w.r.t the File object;
                            // it places the contents in the name attribute. The FileReader does
                            // accept a Blob (the File object derives from Blob), which is why importFile works.
                            console.log("Clipboard selected. Creating ad hoc file from text.");
                            var clipboardFile = new Blob([clipText], {type: "text/plain"});
                            $("#status").html(i18n.t("view.dscStatusReading", {document: i18n.t("view.lblCopyClipboardText")}));
                            // populate the model properties from the clipboard data
                            importSettingsFile(clipboardFile, model);
                        } else {
                            console.log("No data to import");
                            // No data to import -- tell the user to copy something to the clipboard
                            // in browser -- use window.confirm / window.alert
                            alert(i18n.t('view.ErrNoClipboard'));
                        }
                    });
                }
            },
            // Handler for the click event on the Select html <input type=file> button element -
            // just calls importSettingsFile() to import the selected file
            browserImportAIC: function (event) {
                // click on the html <input type=file> element (browser only) --
                // file selection is in event.currentTarget.files[0] (no multi-select for project files)
                console.log("browserImportAIC");
                $("#status").html(i18n.t("view.dscStatusReading", {document: event.currentTarget.files[0]}));
                importSettingsFile(event.currentTarget.files[0], this.model);
            },
            // Show event handler (from MarionetteJS) 
            onShow: function () {
                $("#title").html(i18n.t('view.lblCopyProject'));
                $("#OKCancelButtons").hide();
                $("#verifyNameControls").hide();
                $("#lblDirections").html(i18n.t('view.dscCopyProjInstructions'));
                // cheater way to tell if running on mobile device
                if (device && (device.platform !== "browser")) {
                    // running on device -- use cordova chooser plugin to select file
                    $("#browserSelect").hide();
                } else {
                    // running in browser -- use html <input> to select file
                    $("#mobileSelect").hide();
                }
            }
        }),
        
        // CasesView
        // View / edit the upper/lowercase equivlencies for the source and target
        // languages, and whether to automatically copy cases.
        CasesView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplCases),
            events: {
                "focus .topcoat-text-input": "onFocusInput",
                "blur .topcoat-text-input": "onBlurInput",
                "click #SourceHasCases": "onClickSourceHasCases",
                "click #AutoCapitalize": "onClickAutoCapitalize"
            },
            onFocusInput: function (event) {
                // EDB - TODO: why was this cancelled out? Some weird side-effect?
                // https://github.com/adapt-it/adapt-it-mobile/commit/fdd21f48cf30683b0ea02c02f726147b57864cc4
//                HideTinyUI();
                window.Application.scrollIntoViewCenter(event.currentTarget);
//                event.currentTarget.scrollIntoView(true);
            },
            onBlurInput: function () {
//                ShowTinyUI();
            },
            onClickDeleteRow: function (event) {
                // find the current row
                var index = event.currentTarget.id.substr(2);
                // remove the item from the UI
                var element = "#r-" + index;
                $(element).remove();
            },
            // Handler for when the user starts typing on the last row input fields; 
            // adds one more row, shows the delete button on the current ond, and removes the new-row class
            // from the current row so this method doesn't get called on this row again.
            addNewRow: function (event) {
                var newID = window.Application.generateUUID();
                var index = event.currentTarget.id.substr(2);
                // remove the class from this row
                $(("#s-" + index)).removeClass("new-row");
                $(("#t-" + index)).removeClass("new-row");
                // show the delete button
                $(("#d-" + index)).removeClass("hide");
                // add a new row (with the .new-row class)
                $("table").append("<tr id='r-" + newID + "'><td><input type='text' class='topcoat-text-input new-row' id='s-" + newID + "' style='width:100%;' maxlength='2' value=''></td><td><input type='text' id='t-" + newID + "' class='topcoat-text-input new-row' style='width:100%;' maxlength='2' value=''></td><td><button class='topcoat-icon-button--quiet delete-row hide' title='" + i18n.t('view.ttlDelete') + "' id='d-" + newID + "'><span class='topcoat-icon topcoat-icon--item-delete'></span></button></td></tr>");
            },
            // returns an array of objects corresponding to the current s/t values in the table
            // (i.e., in the CasePairs format)
            getRows: function () {
                var arr = [],
                    s = null,
                    t = null;
                $("tr").each(function () {
                    s = $(this).find(".s").val();
                    t = $(this).find(".t").val();
                    if (s && s.length > 0) {
//                        s = Handlebars.Utils.escapeExpression(s);
//                        t = Handlebars.Utils.escapeExpression(t);
                        arr[arr.length] = {s: s, t: t};
                    }
                });
                return arr;
            },
            onClickSourceHasCases: function () {
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
            onClickAutoCapitalize: function () {
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
            template: Handlebars.compile(tplFont),
            events: {
                "change #font": "updateSample",
                "change #FontSize": "updateSample",
                "change #color": "updateSample"
            },
            updateSample: function () {
                $('#sample').attr('style', 'font-size:' + $('#FontSize').val() + 'px; font-family:\'' + $('#font').val() + '\'; color:' + $('#color').val() + ';');
            },
            onShow: function () {
                var theColor = 0;
                // populate the font drop-down and color picker if the model is set
                if (this.model) {
                    // font drop-down
                    if ($("#font").length) { // only if UI is shown
                        var typefaces = null,
                            curFont = this.model.get('typeface'),
                            i = 0;
                        // start with fonts installed on device
                        if (navigator.Fonts) {
//                            console.log("Fonts object in navigator");
                            navigator.Fonts.getFontList(
                                function (fontList) {
                                    typefaces = fontList;
                                    console.log(fontList);
                                    if (typefaces) {
                                        for (i = 0; i < typefaces.length; i++) {
                                            $("#font").append($("<option></option>")
                                                              .attr("value", typefaces[i])
                                                              .text(typefaces[i]));
                                        }
                                    }
                                    // (async case) select the current font
                                    $("#font option[value=\'" + curFont + "\']").attr('selected', 'selected');
                                },
                                function (error) {
                                    console.log("FontList error: " + error);
                                    console.log(error);
                                }
                            );
                            console.log("FontList: exit");
                        } else {
                            console.log("Plugin error: Fonts plugin not found (is it installed?)");
                        }
                        // add the fonts we've embedded with AIM
                        $("#font").append($('<option>', {value : 'Andika'}).text('Andika'));
                        $("#font").append($('<option>', {value : 'Annapurna'}).text('Annapurna'));
                        $("#font").append($('<option>', {value : 'Charis'}).text('Charis'));
                        $("#font").append($('<option>', {value : 'Doulos'}).text('Doulos'));
                        $("#font").append($('<option>', {value : 'Gentium Plus'}).text('Gentium Plus'));
                        $("#font").append($('<option>', {value : 'Scheherazade New'}).text('Scheherazade New'));
                        $("#font").append($('<option>', {value : 'Source Sans'}).text('Source Sans'));
                        // select the current font
                        $("#font option[value=\'" + curFont + "\']").attr('selected', 'selected');
                        
                        // color variations
                        if (innerHtml.length > 0) {
                            $('#variations').html(innerHtml);
                        }
                    }
                    
                    // color pickers
                    $("#color").val(this.model.get('color'));
                    $("#color").spectrum({
                        showPaletteOnly: true,
                        showPalette: true,
                        hideAfterPaletteSelect: true,
                        color: this.model.get('color'),
                        palette: [
                            ["#000000", "#444444", "#666666", "#999999", "#cccccc", "#eeeeee", "#f3f3f3", "#ffffff"],
                            ["#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#9900ff", "#ff00ff"],
                            ["#cc0000", "#e69138", "#cccc00", "#00cc00", "#00cccc", "#0000cc", "#674ea7", "#cc00cc"],
                            ["#aa0000", "#aa6600", "#aaaa00", "#00aa00", "#00aaaa", "#0000aa", "#6600aa", "#aa00aa"],
                            ["#990000", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#0b5394", "#351c75", "#741b47"],
                            ["#660000", "#783f04", "#7f6000", "#274e13", "#0c343d", "#073763", "#20124d", "#4c1130"]
                        ]
                    });
                    if ($("#spcolor").length) {
                        theColor = $('#spcolor').val();
                        $("#spcolor").val(theColor);
                        $("#spcolor").spectrum({
                            showPaletteOnly: true,
                            showPalette: true,
                            hideAfterPaletteSelect: true,
                            color: theColor,
                            palette: [
                                ["#000000", "#444444", "#666666", "#999999", "#cccccc", "#eeeeee", "#f3f3f3", "#ffffff"],
                                ["#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#9900ff", "#ff00ff"],
                                ["#cc0000", "#e69138", "#cccc00", "#00cc00", "#00cccc", "#0000cc", "#674ea7", "#cc00cc"],
                                ["#aa0000", "#aa6600", "#aaaa00", "#00aa00", "#00aaaa", "#0000aa", "#6600aa", "#aa00aa"],
                                ["#990000", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#0b5394", "#351c75", "#741b47"],
                                ["#660000", "#783f04", "#7f6000", "#274e13", "#0c343d", "#073763", "#20124d", "#4c1130"]
                            ]
                        });
                        theColor = $('#retranscolor').val();
                        $("#retranscolor").val(theColor);
                        $("#retranscolor").spectrum({
                            showPaletteOnly: true,
                            showPalette: true,
                            hideAfterPaletteSelect: true,
                            color: theColor,
                            palette: [
                                ["#000000", "#444444", "#666666", "#999999", "#cccccc", "#eeeeee", "#f3f3f3", "#ffffff"],
                                ["#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#9900ff", "#ff00ff"],
                                ["#cc0000", "#e69138", "#cccc00", "#00cc00", "#00cccc", "#0000cc", "#674ea7", "#cc00cc"],
                                ["#aa0000", "#aa6600", "#aaaa00", "#00aa00", "#00aaaa", "#0000aa", "#6600aa", "#aa00aa"],
                                ["#990000", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#0b5394", "#351c75", "#741b47"],
                                ["#660000", "#783f04", "#7f6000", "#274e13", "#0c343d", "#073763", "#20124d", "#4c1130"]
                            ]
                        });
                    }
                    if ($('#diffcolor').length) {
                        theColor = $('#diffcolor').val();
                        $("#diffcolor").val(theColor);
                        $("#diffcolor").spectrum({
                            showPaletteOnly: true,
                            showPalette: true,
                            hideAfterPaletteSelect: true,
                            color: theColor,
                            palette: [
                                ["#000000", "#444444", "#666666", "#999999", "#cccccc", "#eeeeee", "#f3f3f3", "#ffffff"],
                                ["#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#9900ff", "#ff00ff"],
                                ["#cc0000", "#e69138", "#cccc00", "#00cc00", "#00cccc", "#0000cc", "#674ea7", "#cc00cc"],
                                ["#aa0000", "#aa6600", "#aaaa00", "#00aa00", "#00aaaa", "#0000aa", "#6600aa", "#aa00aa"],
                                ["#990000", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#0b5394", "#351c75", "#741b47"],
                                ["#660000", "#783f04", "#7f6000", "#274e13", "#0c343d", "#073763", "#20124d", "#4c1130"]
                            ]
                        });
                    }
                }
            }
        }),

        // PunctuationView - view / edit the punctuation pairs, and specify whether to copy the punctuation from
        // source to target
        PunctuationView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplPunctuation),
            events: {
                "focus .topcoat-text-input": "onFocusInput",
                "blur .topcoat-text-input": "onBlurInput",
                "click #CopyPunctuation": "onClickCopyPunctuation"
            },
            onFocusInput: function (event) {
//                HideTinyUI();
                window.Application.scrollIntoViewCenter(event.currentTarget);
//                event.currentTarget.scrollIntoView(true);
            },
            onBlurInput: function () {
//                ShowTinyUI();
            },
            onClickDeleteRow: function (event) {
                // find the current row
                var index = event.currentTarget.id.substr(2);
                // remove the item from the UI
                var element = "#r-" + index;
                $(element).remove();
            },
            onClickCopyPunctuation: function () {
                // enable / disable the autocapitalize checkbox based on the value
                if ($("#CopyPunctuation").is(':checked') === true) {
                    $("#PunctMappings").prop('hidden', false);
                } else {
                    $("#PunctMappings").prop('hidden', true);
                }
            },
            // Handler for when the user starts typing on the last row input fields; 
            // adds one more row, shows the delete button on the current ond, and removes the new-row class
            // from the current row so this method doesn't get called on this row again.
            addNewRow: function (event) {
                var newID = window.Application.generateUUID();
                var index = event.currentTarget.id.substr(2);
                // remove the class from this row
                $(("#s-" + index)).removeClass("new-row");
                $(("#t-" + index)).removeClass("new-row");
                // show the delete button
                $(("#d-" + index)).removeClass("hide");
                // add a new row (with the .new-row class)
                $("table").append("<tr id='r-" + newID + "'><td><input type='text' class='topcoat-text-input new-row s' id='s-" + newID + "' style='width:100%;' maxlength='2' value=''></td><td><input type='text' id='t-" + newID + "' class='topcoat-text-input new-row t' style='width:100%;' maxlength='2' value=''></td><td><button class='topcoat-icon-button--quiet delete-row hide' title='" + i18n.t('view.ttlDelete') + "' id='d-" + newID + "'><span class='topcoat-icon topcoat-icon--item-delete'></span></button></td></tr>");
            },
            // returns an array of objects corresponding to the current s/t values in the table
            // (i.e., in the PunctPairs format)
            getRows: function () {
                var arr = [],
                    s = null,
                    t = null;
                $("tr").each(function () {
                    s = $(this).find(".s").val();
                    t = $(this).find(".t").val();
                    if (s && s.length > 0) {
                        // escape the punctuation chars (avoids injection attacks)
//                        s = Handlebars.Utils.escapeExpression(s);
//                        t = Handlebars.Utils.escapeExpression(t);
                        // update the array
                        arr[arr.length] = {s: s, t: t};
                    }
                });
                return arr;
            }
        }),
            
        // SourceLanguageView - view / edit the source language name and code, as well as
        // any variants. Also specify whether the language is LTR.
        SourceLanguageView = Marionette.ItemView.extend({
            theLangs: null,
            languageMatches: function(coll) {
                return function findMatches(query, callback) {
                    var theQuery = query.toLowerCase();
                    coll.fetch({reset: true, data: {name: theQuery}});
                    var matches = coll.filter(function (item) {
                        return (item.attributes.Ref_Name.toLowerCase().indexOf(theQuery) !== -1);
                    });
                    coll.comparator = function (model) {
                        return [((model.get("Part1").length === 0) ? "zzz" : model.get("Part1")), model.get("Ref_Name")]
                    }
                    coll.sort();
                    callback(matches);
                };
            },
            template: Handlebars.compile(tplSourceLanguage),
            onShow: function () {
                this.theLangs = new langs.LanguageCollection();
                this.theLangs.fetch({reset: true, data: {name: ""}});

                $("#LanguageName").typeahead(
                    {
                        hint: true,
                        highlight: true,
                        minLength: 1
                    },
                    {
                        name: 'languages',
                        display: function (data) {
                            return data.attributes.Ref_Name;
                        },
                        source: this.languageMatches(this.theLangs),
                        limit: 20,
                        templates: {
                            empty: ['<div>No languages found</div>'].join('\n'),
                            pending: ['<div>Searching...</div>'].join('\n'),
                            suggestion: function (data) {
                                if (data.attributes.Part1.length > 0) {
                                    return '<div class=\"autocomplete-suggestion\" id=\"' + data.attributes.Part1 + '\">' + data.attributes.Ref_Name + '&nbsp;(' + data.attributes.Part1 + ')</div>';
                                } else {
                                    return '<div class=\"autocomplete-suggestion\" id=\"' + data.attributes.Id + '\">' + data.attributes.Ref_Name + '&nbsp;(' + data.attributes.Id + ')</div>';
                                }
                            }
                        }
                    });
            }
        }),

        // TargetLanguageView - view / edit the target language name and code, as well as
        // any variants. Also specify whether the language is LTR.
        TargetLanguageView = Marionette.ItemView.extend({
            theLangs: null,
            languageMatches: function(coll) {
                return function findMatches(query, callback) {
                    var theQuery = query.toLowerCase();
                    coll.fetch({reset: true, data: {name: theQuery}});
                    var matches = coll.filter(function (item) {
                        return (item.attributes.Ref_Name.toLowerCase().indexOf(theQuery) !== -1);
                    });
                    coll.comparator = function (model) {
                        return [((model.get("Part1").length === 0) ? "zzz" : model.get("Part1")), model.get("Ref_Name")]
                    }
                    coll.sort();
                    callback(matches);
                };
            },
            template: Handlebars.compile(tplTargetLanguage),
            onShow: function () {
                this.theLangs = new langs.LanguageCollection();
                this.theLangs.fetch({reset: true, data: {name: ""}});

                $("#LanguageName").typeahead(
                    {
                        hint: true,
                        highlight: true,
                        minLength: 1
                    },
                    {
                        name: 'languages',
                        display: function (data) {
                            return data.attributes.Ref_Name;
                        },
                        source: this.languageMatches(this.theLangs),
                        limit: 20,
                        templates: {
                            empty: ['<div>No languages found</div>'].join('\n'),
                            pending: ['<div>Searching...</div>'].join('\n'),
                            suggestion: function (data) {
                                if (data.attributes.Part1.length > 0) {
                                    return '<div class=\"autocomplete-suggestion\" id=\"' + data.attributes.Part1 + '\">' + data.attributes.Ref_Name + '&nbsp;(' + data.attributes.Part1 + ')</div>';
                                } else {
                                    return '<div class=\"autocomplete-suggestion\" id=\"' + data.attributes.Id + '\">' + data.attributes.Ref_Name + '&nbsp;(' + data.attributes.Id + ')</div>';
                                }
                            }
                        }
                    });
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
            // Build the body rows of the usfm filter table, with any items from the filterMarkers checked.
            // This method gets called the first time that the table is about to be displayed.
            BuildFilterTable: function () {
                var htmlstring = "",
                    filter = this.model.get('FilterMarkers'),
                    value = "false";
                USFMMarkers.each(function (item, index) {
                    if (item.get('userCanSetFilter') && item.get('userCanSetFilter') === '1') {
                        value = (filter.indexOf("\\" + item.get('name') + " ") >= 0) ? "true" : "false";
                        htmlstring += "<tr><td><label class='topcoat-checkbox'><input class='c' type='checkbox' id='filter-" + index + " value='" + value;
                        if (value === "true") {
                            htmlstring += " checked";
                        }
                        htmlstring += "><div class='topcoat-checkbox__checkmark'></div></label></td><td><span class='n'>" + item.get('name') + "</span></td><td>" + item.get('description') + "</td></tr>";
                    }
                });
                $("#tb").html(htmlstring);
            },
            // Extracts a filter string (for the filterMarkers property) from the items that are
            // checked in the usfm filter table.
            getFilterString: function () {
                var filterString = "";
                $("tr").each(function () {
                    if ($(this).find(".c").is(':checked') === true) {
                        filterString += "\\" + $(this).find(".n").html() + " ";
                    }
                });
                // add always-on filters
                filterString += "\\lit \\_table_grid \\_header \\_intro_base \\r \\cp \\_horiz_rule \\ie \\rem \\_unknown_para_style \\_normal_table \\note \\_heading_base \\_hidden_note \\_footnote_caller \\_dft_para_font \\va \\_small_para_break \\_footer \\_vernacular_base \\pro \\_notes_base \\__normal \\ide \\mr \\_annotation_ref \\_annotation_text \\_peripherals_base \\_gls_lang_interlinear \\free \\rq \\_nav_lang_interlinear \\_body_text \\cl \\efm \\bt \\_unknown_char_style \\_double_boxed_para \\_hdr_ftr_interlinear \\_list_base \\ib \\fig \\restore \\_src_lang_interlinear \\vp \\_tgt_lang_interlinear \\ef \\ca \\_single_boxed_para \\sts \\hr \\loc \\cat \\des";
                return filterString;
            },
            onClickCustomFilters: function () {
                // enable / disable the autocapitalize checkbox based on the value
                if ($("#UseCustomFilters").is(':checked') === true) {
                    if ($("#tb").html().length === 0) {
                        this.BuildFilterTable();
                    }
                    $("#USFMFilters").prop('hidden', false);
                } else {
                    $("#USFMFilters").prop('hidden', true);
                }
            },
            onShow: function () {
                // enable / disable the autocapitalize checkbox based on the value
                if ($("#UseCustomFilters").is(':checked') === true) {
                    if ($("#tb").html().length === 0) {
                        this.BuildFilterTable();
                    }
                    $("#USFMFilters").prop('hidden', false);
                } else {
                    $("#USFMFilters").prop('hidden', true);
                }
            }
        }),
        
        ManageProjsView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplManageProjs),
            events: {
                "click #btnNewProject": "onAddProject",
                "click .projList": "onClickProject",
                "click #btnProjSelect": "onSelectProject",
                "click #btnProjDelete":   "onDeleteProject"
            },
            // User clicked the "switch to this project" button. Sets the current project to the selected project, clears the
            // local translation stuff (so it reloads the proper project info from the DB), and navigates to the home screen.
            onSelectProject: function (event) {
                event.stopPropagation();
                var index = event.currentTarget.parentElement.parentElement.id.substr(4);
                window.Application.currentProject = window.Application.ProjectList.at(index);
                localStorage.setItem("CurrentProjectID", window.Application.currentProject.get("projectid"));
                // Clear out any local chapter/book/sourcephrase/KB stuff so it loads 
                // from our new project instead
                window.Application.BookList.length = 0;
                window.Application.ChapterList.length = 0;
                window.Application.spList.length = 0;
                window.Application.kbList.length = 0;
                // head back to the home page
                window.location.replace("");
            },
            // User clicked the Delete project. Confirms the delete intent, and then calls reallyDeleteProj() to actually delete it.
            onDeleteProject: function (event) {
                event.stopPropagation();
                var index = event.currentTarget.parentElement.parentElement.id.substr(4);
                var ProjDomID = event.currentTarget.parentElement.parentElement.parentElement.id;
                var proj = window.Application.ProjectList.at(index);
                var bCurrentProject = false;
                if (proj.get('name') === $("#lblCurName").html()) {
                    bCurrentProject = true;
                }
                // confirm with the user -- this nukes the project and everything related to it
                // (translation work and KB)
                if (navigator.notification) {
                    // on mobile device
                    navigator.notification.confirm(i18n.t('view.dscWarnRemoveProject'), function (buttonIndex) {
                        if (buttonIndex === 1) {
                            window.Application.ProjectList.remove(proj); // remove from the collection
                            proj.destroy(); // also deletes everything associated with this project
                            if (bCurrentProject === true) {
                                // just deleted the current project -- if there is a project in the project list
                                // (i.e., if we didn't nuke all the projects), set the current to the first in the list;
                                // then navigate us home
                                if (window.Application.ProjectList.length > 0) {
                                    // we have at least one project defined -- set the current to the first in the list
                                    window.Application.currentProject = window.Application.ProjectList.at(0);
                                    // save the value for later
                                    localStorage.setItem("CurrentProjectID", window.Application.currentProject.get("projectid"));
                                }
                                // navigate to the home screen
                                window.location.replace("");
                            } else {
                                // didn't delete the current project -- just remove the item from the UI
                                // (We're in a callback, so just hide the item rather than redrawing)
                                $("#" + ProjDomID).addClass('hide');
                            }
                        }
                    }, i18n.t('view.lblRemoveProject'));
                } else {
                    // in browser
                    if (confirm(i18n.t('view.dscWarnRemoveProject'))) {
                        window.Application.ProjectList.remove(proj); // remove from the collection
                        proj.destroy(); // also deletes everything associated with this project
                        if (bCurrentProject === true) {
                            // just deleted the current project -- if there is a project in the project list
                            // (i.e., if we didn't nuke all the projects), set the current to the first in the list;
                            // then navigate us home
                            if (window.Application.ProjectList.length > 0) {
                                // we have at least one project defined -- set the current to the first in the list
                                window.Application.currentProject = window.Application.ProjectList.at(0);
                                // save the value for later
                                localStorage.setItem("CurrentProjectID", window.Application.currentProject.get("projectid"));
                            }
                            // navigate to the home screen
                            window.location.replace("");
                        } else {
                            // didn't delete the current project -- just redraw the UI
                            this.showProjects();
                        }
                    }
                }
            },
            // User clicked the Add Project... toggle button. Just shows/hides the clickable area where the user can either
            // create or copy a project
            onAddProject: function () {
                // Toggle "create new from..." action area
                $("#projNewActions").toggleClass("hide");
            },
            // User clicked on a project in the list -- shows / hides the available actions for the selected project.
            onClickProject: function (event) {
                var SELECT_BTN = "<div class=\"control-row\"><button id=\"btnProjSelect\" class=\"btnSelect\" title=\"" + i18n.t("view.lblSelectProject") + "\"><span class=\"btn-check\" role=\"img\"></span>" + i18n.t("view.lblSelectProject") + "</button></div>",
                    DELETE_BTN = "<div class=\"control-row\"><button id=\"btnProjDelete\" title=\"" + i18n.t("view.lblRemoveProject") + "\" class=\"btnDelete danger\"><span class=\"btn-delete\" role=\"img\"></span>" + i18n.t("view.lblRemoveProject") + "</button></div>",
                    index = event.currentTarget.id.substr(3);
                // Toggle the visibility of the action menu bar
                if ($("#lia-" + index).hasClass("show")) {
                    // hide it
                    $("#li-" + index).toggleClass("li-selected");
                    $(".liActions").html(""); // clear out any old html actions for this refstring
                    $("#lia-" + index).toggleClass("show");
                } else {
                    // get rid of any other visible action bars
                    $(".topcoat-list__item").removeClass("li-selected");
                    $(".liActions").html(""); // clear out any old html actions for this refstring
                    $(".liActions").removeClass("show");
                    // now show this one
                    $("#li-" + index).toggleClass("li-selected");
                    $("#lia-" + index).toggleClass("show");
                    if ($("#proj-" + index).html() === $("#lblCurName").html()) {
                        // this is the current project
                        $("#lia-" + index).html(DELETE_BTN); // can only delete
                    } else {
                        $("#lia-" + index).html(SELECT_BTN + DELETE_BTN); // can select and delete
                    }
                }
            },
            // iterates through the project list. If there's only one, hides the list 
            showProjects: function () {
                var projHtml = "";
                if (window.Application.ProjectList.length === 1) {
                    $("#ProjList").html("");
                    $("#hdrAllProjects").hide();
                } else {
                    // more than one project defined -- add them here
                    window.Application.ProjectList.each(function (item, index) {
                        projHtml += "<li class=\"topcoat-list__item projList\" id=\"li-" + index + "\"><div class=\"big-link chap-list__item\" id=\"proj-" + index + "\">" + item.get('name') + "</div><div class=\"liActions\" id=\"lia-" + index + "\"></div></li>";
                    });
                    // update the project list
                    $("#ProjList").html(projHtml);
                }
            },
            onShow: function () {
                this.showProjects();
            }
        }),
        
        EditorAndUIView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplEditorPrefs),
            events: {
                "click #EditBlankPiles": "onEditBlankPiles",
                "click #ShowGlossFT": "onClickShowGlossFT",
                "change #language":   "onSelectCustomLanguage"
            },
            onEditBlankPiles: function () {
                // TODO: warning that turning this on can cause conflicts during subsequent merges 
            },
            onClickShowGlossFT: function () {
                if ($('#ShowGlossFT').is(':checked') === true) {
                    $("#defaultFT").removeClass("hide");
                    if (localStorage.getItem("DefaultFTTarget")) {
                        $("#FTUseTarget").prop("checked", true);
                    } else {
                        $("#FTUseGloss").prop("checked", true); // default (use Gloss)
                    }
                } else {
                    $("#defaultFT").addClass("hide");
                }
            },
            onSelectCustomLanguage: function () {
                // change the radio button selection
                $("#customLanguage").prop("checked", true);
            },
            onShow: function () {
                if (localStorage.getItem("CopySource")) {
                    $("#CopySource").prop("checked", localStorage.getItem("CopySource") === "true");
                } else {
                    $("#CopySource").prop("checked", true); // default is selected
                }
                if (localStorage.getItem("WrapUSFM")) {
                    $("#WrapAtMarker").prop("checked", localStorage.getItem("WrapUSFM") === "true");
                } else {
                    $("#WrapAtMarker").prop("checked", true); // default is selected
                }
                if (localStorage.getItem("StopAtBoundaries")) {
                    $("#StopAtBoundaries").prop("checked", localStorage.getItem("StopAtBoundaries") === "true");
                } else {
                    $("#StopAtBoundaries").prop("checked", true); // default is selected
                }
                if (localStorage.getItem("AllowEditBlankSP")) {
                    $("#EditBlankPiles").prop("checked", localStorage.getItem("AllowEditBlankSP") === "true");
                } else {
                    $("#EditBlankPiles").prop("checked", false); // default is false (disabled)
                }
                if (localStorage.getItem("ShowGlossFT")) {
                    $("#ShowGlossFT").prop("checked", localStorage.getItem("ShowGlossFT") === "true");
                    // Also show the "default FT text" groupbox
                    $("#defaultFT").removeClass("hide");
                } else {
                    $("#ShowGlossFT").prop("checked", false); // default is false (disabled)
                    $("#defaultFT").addClass("hide");
                }
                if (localStorage.getItem("DefaultFTTarget") && (localStorage.getItem("DefaultFTTarget") === "true")) {
                    $("#FTUseTarget").prop("checked", true);
                } else {
                    $("#FTUseGloss").prop("checked", true); // default (use Gloss)
                }
                if (localStorage.getItem("UILang")) {
                    // use custom language -- select the language used
                    $('#language').val(localStorage.getItem("UILang"));
                    $("#customLanguage").prop("checked", true); // onSelectCustomLanguage() should already do this, but just in case...
                } else {
                    // use device language
                    $("#deviceLanguage").prop("checked", true);
                }
            }
        }),
        
        EditProjectView = Marionette.LayoutView.extend({
            template: Handlebars.compile(tplEditProject),
            initialize: function () {
                this.OnEditProject();
            },
            ////
            // Event Handlers
            ////
            modelEvents: {
                'change': 'render'
            },
            events: {
                "click #EditorUIPrefs": "OnEditorUIPrefs",
                "click #CurrentProject": "OnCurrentProject",
                "click #KBEditor": "OnKBEditor",
                "click #SourceLanguage": "OnEditSourceLanguage",
                "click #TargetLanguage": "OnEditTargetLanguage",
                "click #sourceFont": "OnEditSourceFont",
                "click #targetFont": "OnEditTargetFont",
                "click #navFont": "OnEditNavFont",
                "click #Punctuation": "OnEditPunctuation",
                "click #Cases": "OnEditCases",
                "click #Filtering": "OnEditFiltering",
                "focus #LanguageName": "onFocusLanguageName",
                "focus #LanguageVariant": "onFocusLanguageVariant",
                "keyup #LanguageVariant": "onkeyupLanguageVariant",
                "focus #LanguageCode": "onFocusLanguageCode",
                "typeahead:select .typeahead": "selectLanguage",
                "typeahead:cursorchange .typeahead": "selectLanguage",
                "click .delete-row": "onClickDeleteRow",
                "keyup .new-row": "addNewRow",
                "click #CopyPunctuation": "OnClickCopyPunctuation",
                "click #SourceHasCases": "OnClickSourceHasCases",
                "click #AutoCapitalize": "OnClickAutoCapitalize",
                "click #UseCustomFilters": "OnClickCustomFilters",
                "click #Cancel": "OnCancel",
                "click #OK": "OnOK"
            },
            OnEditorUIPrefs: function () {
                step = 9;
                this.ShowView(step);
            },
            OnCurrentProject: function () {
                step = 10;
                this.ShowView(step);
            },
            OnKBEditor: function () {
                // KB editor is on a separate screen; tell the application to display it
                window.Application.editKB(window.Application.currentProject.get("projectid"));
            },
            onFocusLanguageName: function (event) {
                window.Application.scrollIntoViewCenter(event.currentTarget);
            },

            onFocusLanguageVariant: function (event) {
                window.Application.scrollIntoViewCenter(event.currentTarget);
            },

            onFocusLanguageCode: function (event) {
                window.Application.scrollIntoViewCenter(event.currentTarget);
            },

            onkeyupLanguageVariant: function () {
                var newLangCode = "";
                newLangCode = buildFullLanguageCode(currentView.langCode, $('#LanguageVariant').val().trim().replace(/\s+/g, ''));
                currentView.langCode = newLangCode;
                $('#LanguageCode').val(newLangCode);
            },
            addNewRow: function (event) {
                currentView.addNewRow(event);
            },
            searchTarget: function (event) {
                currentView.search(event);
            },
            onkeypressTargetName: function (event) {
                currentView.onkeypress(event);
            },
            selectLanguage: function (event, suggestion) {
                if (suggestion) {
                    var newLangCode = "";
                    currentView.langName = suggestion.attributes.Ref_Name;
                    newLangCode = (suggestion.attributes.Part1.length > 0) ? suggestion.attributes.Part1 : suggestion.attributes.Id;
                    currentView.langCode = buildFullLanguageCode(newLangCode, $('#LanguageVariant').val().trim().replace(/\s+/g, ''));
                    $('#LanguageCode').val(currentView.langCode);
                } else {
                    // no suggestion passed -- clear out the language name and code
                    currentView.langName = "";
                    currentView.langCode = "";
                    $('#LanguageCode').val(currentView.langCode);
                }
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
            OnEditSourceLanguage: function () {
                step = 1;
                this.ShowView(step);
            },
            OnEditTargetLanguage: function () {
                step = 2;
                this.ShowView(step);
            },
            OnEditSourceFont: function () {
                step = 3;
                this.ShowView(step);
            },
            OnEditTargetFont: function () {
                step = 4;
                this.ShowView(step);
            },
            OnEditNavFont: function () {
                step = 5;
                this.ShowView(step);
            },
            OnEditPunctuation: function () {
                step = 6;
                this.ShowView(step);
            },
            OnEditCases: function () {
                step = 7;
                this.ShowView(step);
            },
            OnEditFiltering: function () {
                step = 8;
                this.ShowView(step);
            },
            OnCancel: function () {
                // just display the project settings list (don't save)
                $("#WizStepTitle").hide();
                $("#StepInstructions").addClass("hide");
                $("#tbBottom").addClass("hide");
                $('#ProjectItems').removeClass("hide");
                $("#StepTitle").html(i18n.t('view.lblProjectSettings'));
                $(".container").attr("style", "height: calc(100% - 70px);");
                $("#editor").removeClass("scroller-bottom-tb");
                $("#editor").addClass("scroller-notb");
                this.removeRegion("container");
            },
            OnOK: function () {
                // save the info from the current step
                this.UpdateProject(step);
                // show / hide the appropriate UI elements
                $("#WizStepTitle").hide();
                $("#StepInstructions").addClass("hide");
                $("#tbBottom").addClass("hide");
                $('#ProjectItems').removeClass("hide");
                $("#StepTitle").html(i18n.t('view.lblProjectSettings'));
                $(".container").attr("style", "height: calc(100% - 70px);");
                $("#editor").removeClass("scroller-bottom-tb");
                $("#editor").addClass("scroller-notb");
                this.removeRegion("container");
            },

            UpdateProject: function (step) {
                var tempfont = "",
                    tempSize = "",
                    tempColor = "",
                    loc = "",
                    locale = "";
                
                switch (step) {
                case 1: // source language
                    this.model.set("SourceLanguageName", currentView.langName, {silent: true});
                    this.model.set("SourceLanguageCode", $("#LanguageCode").val().trim(), {silent: true});
                    this.model.set("SourceVariant", Handlebars.Utils.escapeExpression($('#LanguageVariant').val().trim()), {silent: true});
                    this.model.set("SourceDir", ($('#RTL').is(':checked') === true) ? "rtl" : "ltr", {silent: true});
                    break;
                case 2: // target language
                    this.model.set("TargetLanguageName", currentView.langName, {silent: true});
                    this.model.set("TargetLanguageCode", $("#LanguageCode").val().trim(), {silent: true});
                    this.model.set("TargetVariant", Handlebars.Utils.escapeExpression($('#LanguageVariant').val().trim()), {silent: true});
                    this.model.set("TargetDir", ($('#RTL').is(':checked') === true) ? "rtl" : "ltr", {silent: true});
                    this.model.set("name", i18n.t("view.lblSourceToTargetAdaptations", {
                        source: (this.model.get("SourceVariant").length > 0) ? this.model.get("SourceVariant") : this.model.get("SourceLanguageName"),
                        target: (this.model.get("TargetVariant").length > 0) ? this.model.get("TargetVariant") : this.model.get("TargetLanguageName")}), {silent: true});
                    break;
                case 3: // source font
                    tempfont = $('#font').val();
                    tempSize = $('#FontSize').val();
                    tempColor = $('#color').spectrum('get').toHexString();
                    this.model.set('SourceFont', tempfont, {silent: true});
                    this.model.set('SourceFontSize', tempSize, {silent: true});
                    this.model.set('SourceColor', tempColor, {silent: true});
                    tempColor = $('#spcolor').spectrum('get').toHexString();
                    this.model.set('SpecialTextColor', tempColor, {silent: true});
                    tempColor = $('#retranscolor').spectrum('get').toHexString();
                    this.model.set('RetranslationColor', tempColor, {silent: true});
                    break;
                case 4: // target font
                    tempfont = $('#font').val();
                    tempSize = $('#FontSize').val();
                    tempColor = $('#color').spectrum('get').toHexString();
                    this.model.set('TargetFont', tempfont, {silent: true});
                    this.model.set('TargetFontSize', tempSize, {silent: true});
                    this.model.set('TargetColor', tempColor, {silent: true});
                    tempColor = $('#diffcolor').spectrum('get').toHexString();
                    this.model.set('TextDifferencesColor', tempColor, {silent: true});
                    break;
                case 5: // navigation font
                    tempfont = $('#font').val();
                    tempSize = $('#FontSize').val();
                    tempColor = $('#color').spectrum('get').toHexString();
                    this.model.set('NavigationFont', tempfont, {silent: true});
                    this.model.set('NavigationFontSize', tempSize, {silent: true});
                    this.model.set('NavigationColor', tempColor, {silent: true});
                    break;
                case 6: // punctuation
                    this.model.set("CopyPunctuation", ($('#CopyPunctuation').is(':checked') === true) ? "true" : "false", {silent: true});
                    if ($('#CopyPunctuation').is(':checked')) {
                        // don't need to update this if we aren't copying punctuation
                        this.model.set({PunctPairs: currentView.getRows()}, {silent: true});
                    }
                    break;
                case 7: // cases
                    this.model.set("SourceHasUpperCase", ($('#SourceHasCases').is(':checked') === true) ? "true" : "false", {silent: true});
                    this.model.set("AutoCapitalization", ($('#AutoCapitalize').is(':checked') === true) ? "true" : "false", {silent: true});
                    if ($('#AutoCapitalize').is(':checked')) {
                        // don't need to update this if we aren't capitalizing the target
                        this.model.set({CasePairs: currentView.getRows()}, {silent: true});
                    }
                    break;
                case 8: // USFM filtering
                    this.model.set("CustomFilters", ($('#UseCustomFilters').is(':checked') === true) ? "true" : "false", {silent: true});
                    if (($('#UseCustomFilters').is(':checked') === true)) {
                        this.model.set("FilterMarkers", currentView.getFilterString(), {silent: true});
                    }
                    break;
                case 9: // editor and UI language
                    localStorage.setItem(("CopySource"), $("#CopySource").is(":checked") ? true : false);
                    localStorage.setItem(("WrapUSFM"), $("#WrapAtMarker").is(":checked") ? true : false);
                    localStorage.setItem(("StopAtBoundaries"), $("#StopAtBoundaries").is(":checked") ? true : false);
                    localStorage.setItem(("AllowEditBlankSP"), $("#EditBlankPiles").is(":checked") ? true : false);
                    localStorage.setItem(("ShowGlossFT"), $("#ShowGlossFT").is(":checked") ? true : false);
                    localStorage.setItem(("DefaultFTTarget"), $("#FTUseTarget").is(":checked") ? true : false);
                    if ($("#customLanguage").is(":checked")) {
                        // Use a custom language
                        loc = $('#language').val();
                        // set the language in local storage
                        localStorage.setItem(("UILang"), loc);
                        // set the locale, then return
                        i18n.setLng(loc, function (err, t) {
                            // return to the main screen
                            if (window.history.length > 1) {
                                // there actually is a history -- go back
                                window.history.back();
                            } else {
                                // no history (import link from outside app) -- just go home
                                window.location.replace("");
                            }
                        });
                    } else {
                        // use the mobile device's setting
                        // remove the language in local storage (so we get it dynamically the next time the app is launched)
                        localStorage.removeItem("UILang");
                        // get the user's locale - mobile or web
                        if (window.Intl && typeof window.Intl === 'object') {
                            // device supports ECMA Internationalization API
                            locale = navigator.language.split("-")[0];
                            i18n.setLng(locale, function (err, t) {
                                // return to the main screen
                                if (window.history.length > 1) {
                                    // there actually is a history -- go back
                                    window.history.back();
                                } else {
                                    // no history (import link from outside app) -- just go home
                                    window.location.replace("");
                                }
                            });
                        } else {
                            // fallback - use web browser's language metadata
                            var lang = (navigator.languages) ? navigator.languages[0] : (navigator.language || navigator.userLanguage);
                            locale = lang.split("-")[0];
                            // set the locale, then return
                            i18n.setLng(locale, function (err, t) {
                                // return to the main screen
                                if (window.history.length > 1) {
                                    // there actually is a history -- go back
                                    window.history.back();
                                } else {
                                    // no history (import link from outside app) -- just go home
                                    window.location.replace("");
                                }
                            });
                        }
                    }
                    break;
                }
                this.model.save();
                this.model.trigger('change');
            },

            OnEditProject: function () {
                // create a new project model object
                //this.openDB();
                languages = new langs.LanguageCollection();
                USFMMarkers = new usfm.MarkerCollection();
                USFMMarkers.fetch({reset: true, data: {name: ""}}); // return all results
                // title
                this.$("#StepTitle").html(i18n.t('view.lblProjectSettings'));
            },

            ShowView: function (number) {
                innerHtml = "";
                // Display the frame UI
                this.addRegions({
                    container: "#StepContainer"
                });
                // hide the project list items
                $("#WizStepTitle").show();
                $("#StepInstructions").removeClass("hide");
                $("#editor").addClass("scroller-bottom-tb");
                $("#editor").removeClass("scroller-notb");
                $("#tbBottom").removeClass("hide");
                $('#ProjectItems').addClass("hide");
                // clear out the old view (if any)
                currentView = null;
                switch (number) {
                case 1: // source language
                    languages.fetch({reset: true, data: {name: "    "}}); // clear out languages collection filter
                    currentView = new SourceLanguageView({ model: this.model, collection: languages });
                    currentView.langName = this.model.get("SourceLanguageName");
                    currentView.langCode = this.model.get("SourceLanguageCode");
                    // instructions
                    $("#StepTitle").html(i18n.t('view.ttlProjectSourceLanguage'));
                    $("#StepInstructions").html(i18n.t('view.dscEditProjectSourceLanguage'));
                    break;
                case 2: // target language
                    languages.fetch({reset: true, data: {name: "    "}}); // clear out languages collection filter
                    currentView = new TargetLanguageView({ model: this.model, collection: languages });
                    currentView.langName = this.model.get("TargetLanguageName");
                    currentView.langCode = this.model.get("TargetLanguageCode");
                    // instructions
                    $("#StepTitle").html(i18n.t('view.ttlProjectTargetLanguage'));
                    $("#StepInstructions").html(i18n.t('view.dscEditProjectTargetLanguage'));
                    break;
                case 3: // source font
                    theFont = new fontModel.Font();
                    theFont.set("name", i18n.t('view.lblSourceFont'));
                    theFont.set("typeface", this.model.get('SourceFont'));
                    theFont.set("size", parseInt(this.model.get('SourceFontSize'), 10));
                    theFont.set("color", this.model.get('SourceColor'));
                    currentView = new FontView({ model: theFont});
                    Marionette.triggerMethodOn(currentView, 'show');
                    // instructions
                    $("#StepTitle").html(i18n.t('view.ttlProjectFonts'));
                    $("#StepInstructions").html(i18n.t('view.dscProjectFonts'));
                    // color variations for source font -- special text and retranslations
                    innerHtml = "<div class='control-row' id='dscVariations'><h3>" + i18n.t('view.lblSourceFontVariations');
                    innerHtml += "</h3></div><div id='varItems'>";
                    innerHtml += "<div class=\'control-row\'>" + i18n.t('view.lblSpecialTextColor') + " <input type=\"text\" name=\"color\" id=\'spcolor\' value=\"" + this.model.get('SpecialTextColor') + "\" /></div>";
                    innerHtml += "<div class=\'control-row\'>" + i18n.t('view.lblRetranslationColor') + " <input type=\"text\" name=\"color\" id=\'retranscolor\' value=\"" + this.model.get('RetranslationColor') + "\" /></div></div>";
                    break;
                case 4: // target font
                    theFont = new fontModel.Font();
                    theFont.set("name", i18n.t('view.lblTargetFont'));
                    theFont.set("typeface", this.model.get('TargetFont'));
                    theFont.set("size", parseInt(this.model.get('TargetFontSize'), 10));
                    theFont.set("color", this.model.get('TargetColor'));
                    currentView = new FontView({ model: theFont});
                    Marionette.triggerMethodOn(currentView, 'show');
                    // instructions
                    $("#StepTitle").html(i18n.t('view.ttlProjectFonts'));
                    $("#StepInstructions").html(i18n.t('view.dscProjectFonts'));
                    // color variations for target font -- text differences
                    innerHtml = "<div class='control-row' id='dscVariations'><h3>" + i18n.t('view.lblSourceFontVariations');
                    innerHtml += "</h3></div><div id='varItems'>";
                    innerHtml += "<div class=\'control-row\'>" + i18n.t('view.lblDifferenceColor') + " <input type=\"text\" name=\"color\" id=\'diffcolor\' value=\"" + this.model.get('TextDifferencesColor') + "\" /></div></div>";
                    break;
                case 5: // navigation font
                    theFont = new fontModel.Font();
                    theFont.set("name", i18n.t('view.lblNavFont'));
                    theFont.set("typeface", this.model.get('NavigationFont'));
                    theFont.set("size", parseInt(this.model.get('NavigationFontSize'), 10));
                    theFont.set("color", this.model.get('NavigationColor'));
                    currentView = new FontView({ model: theFont});
                    Marionette.triggerMethodOn(currentView, 'show');
                    // instructions
                    $("#StepTitle").html(i18n.t('view.ttlProjectFonts'));
                    $("#StepInstructions").html(i18n.t('view.dscProjectFonts'));
                    break;
                case 6: // punctuation
                    currentView = new PunctuationView({ model: this.model});
                    // instructions
                    $("#StepTitle").html(i18n.t('view.ttlProjectPunctuation'));
                    $("#StepInstructions").html(i18n.t('view.dscProjectPunctuation'));
                    break;
                case 7: // cases
                    currentView = new CasesView({ model: this.model});
                    // instructions
                    $("#StepTitle").html(i18n.t('view.ttlProjectCases'));
                    $("#StepInstructions").html(i18n.t('view.dscProjectCases'));
                    break;
                case 8: // USFM filtering
                    currentView = new USFMFilteringView({ model: this.model});
                    // instructions
                    $("#StepTitle").html(i18n.t('view.ttlProjectFiltering'));
                    $("#StepInstructions").html(i18n.t('view.dscProjectUSFMFiltering'));
                    break;
                case 9: // editor and UI language
                    currentView = new EditorAndUIView({model: this.model});
                    break;
                case 10: // current project
                    // instructions
                    currentView = new ManageProjsView({model: this.model});
                    $("#StepTitle").html(i18n.t('view.ttlProject'));
                    $("#ProjList").html(projList(window.Application.ProjectList));
                    break;
                }
                this.container.show(currentView);
                if (number === 1 || number === 2) {
                    // the source and target language pages normally wouldn't be messed with once they're set up;
                    // it's possible that the user needs to correct something in the dialect? At any rate, tell the user
                    // that new projects can be created in the settings / manage projects page.
                    if (navigator.notification) {
                        navigator.notification.alert(i18n.t('view.dscWarnChangeProject'));
                    } else {
                        alert(i18n.t('view.dscWarnChangeProject'));
                    }
                    
                }
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
                return this;
            },
            onShow: function () {
                this.ShowStep(step);
            },
            ////
            // Event Handlers
            ////
            events: {
                "click #sourceFont": "OnEditSourceFont",
                "click #targetFont": "OnEditTargetFont",
                "click #navFont": "OnEditNavFont",
                "focus #LanguageName": "onFocusLanguageName",
                "blur #LanguageName": "onBlurLanguageName",
                "typeahead:select .typeahead": "selectLanguage",
                "typeahead:cursorchange .typeahead": "selectLanguage",
                "focus #LanguageVariant": "onFocusLanguageVariant",
                "keyup #LanguageVariant": "onkeyupLanguageVariant",
                "focus #LanguageCode": "onFocusLanguageCode",
                "blur #LanguageVariant": "onBlurLanguageVariant",
                "click #btnLangAdvanced": "onClickLanguageAdvanced",
                "click .delete-row": "onClickDeleteRow",
                "keyup .new-row": "addNewRow",
                "click #CopyPunctuation": "OnClickCopyPunctuation",
                "click #SourceHasCases": "OnClickSourceHasCases",
                "click #AutoCapitalize": "OnClickAutoCapitalize",
                "click #UseCustomFilters": "OnClickCustomFilters",
                "click #Cancel": "OnCancel",
                "click #OK": "OnOK",
                "click #Prev": "OnPrevStep",
                "click #Next": "OnNextStep"
            },

            MaybeHideUIStuff: function (bHide) {
                var Hgt = $(window).height();
                // check to see if we're on a mobile device
                if (navigator.notification && !Keyboard.isVisible) {
                    // on mobile device AND the keyboard hasn't displayed yet:
                    // the viewport height is going to shrink when the software keyboard displays
                    // HACK: subtract the software keyboard from the visible area end -
                    // We can only get the keyboard height programmatically on ios, using the keyboard plugin's
                    // keyboardHeightWillChange event. Ugh. Fudge it here until we can come up with something that can
                    // work cross-platform
                    if (window.orientation === 90 || window.orientation === -90) {
                        // landscape
                        Hgt -= 162; // observed / hard-coded "best effort" value
                    } else {
                        // portrait
                        Hgt -= 248; // observed / hard-coded "best effort" value
                    }
                }
                // test overall screen length
                if (bHide === true) {
                    if (Hgt > 375) {
                        // height is big enough -- exit out
                        return;
                    } else {
                        // not enough room -- hide the instructions
                        $("#StepInstructions").hide();
                    }
                } else {
                    // make sure the instructions are visible
                    $("#StepInstructions").show();
                }
            },
            
            onFocusLanguageName: function (event) {
                this.MaybeHideUIStuff(true); // hide the instructions if we're on a small screen
                window.Application.scrollIntoViewCenter(event.currentTarget);
            },
            
            onBlurLanguageName: function () {
                this.MaybeHideUIStuff(false); // show the instructions UI again
            },

            onFocusLanguageVariant: function (event) {
                window.Application.scrollIntoViewCenter(event.currentTarget);
            },

            onFocusLanguageCode: function (event) {
                window.Application.scrollIntoViewCenter(event.currentTarget);
            },
            
            onkeyupLanguageVariant: function () {
                var newLangCode = "";
                newLangCode = buildFullLanguageCode(currentView.langCode, $('#LanguageVariant').val().trim().replace(/\s+/g, ''));
                currentView.langCode = newLangCode;
                $('#LanguageCode').val(newLangCode);
            },
            searchTarget: function (event) {
                currentView.search(event);
            },
            onkeypressTargetName: function (event) {
                currentView.onkeypress(event);
            },
            selectLanguage: function (event, suggestion) {
                if (suggestion) {
                    var newLangCode = "";
                    currentView.langName = suggestion.attributes.Ref_Name;
                    newLangCode = (suggestion.attributes.Part1.length > 0) ? suggestion.attributes.Part1 : suggestion.attributes.Id;
                    currentView.langCode = buildFullLanguageCode(newLangCode, $('#LanguageVariant').val().trim().replace(/\s+/g, ''));
                    $('#LanguageCode').val(currentView.langCode);
                } else {
                    // no suggestion passed -- clear out the language name and code
                    currentView.langName = "";
                    currentView.langCode = "";
                    $('#LanguageCode').val(currentView.langCode);
                }
            },
            onClickDeleteRow: function (event) {
                currentView.onClickDeleteRow(event);
            },
            addNewRow: function (event) {
                currentView.addNewRow(event);
            },
            onClickVariant: function (event) {
                currentView.onClickVariant(event);
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
            OnEditSourceFont: function () {
                var theFont = new fontModel.Font();
                theFont.set("name", i18n.t('view.lblSourceFont'));
                theFont.set("typeface", this.model.get('SourceFont'));
                theFont.set("size", parseInt(this.model.get('SourceFontSize'), 10));
                theFont.set("color", this.model.get('SourceColor'));
                currentView = new FontView({ model: theFont});
                Marionette.triggerMethodOn(currentView, 'show');
                // color variations for source font -- special text and retranslations
                innerHtml = "<div class='control-row' id='dscVariations'><h3>" + i18n.t('view.lblSourceFontVariations');
                innerHtml += "</h3></div><div id='varItems'>";
                innerHtml += "<div class=\'control-row\'>" + i18n.t('view.lblSpecialTextColor') + " <input type=\"text\" name=\"color\" id=\'spcolor\' value=\"" + this.model.get('SpecialTextColor') + "\" /></div>";
                innerHtml += "<div class=\'control-row\'>" + i18n.t('view.lblRetranslationColor') + " <input type=\"text\" name=\"color\" id=\'retranscolor\' value=\"" + this.model.get('RetranslationColor') + "\" /></div></div>";
                this.container.show(currentView);
                $('#WizStepTitle').hide();
                $('#StepInstructions').hide();
                $('#WizardSteps').hide();
                $('#OKCancelButtons').show();
            },

            OnEditTargetFont: function () {
                var theFont = new fontModel.Font();
                theFont.set("name", i18n.t('view.lblTargetFont'));
                theFont.set("typeface", this.model.get('TargetFont'));
                theFont.set("size", parseInt(this.model.get('TargetFontSize'), 10));
                theFont.set("color", this.model.get('TargetColor'));
                currentView = new FontView({ model: theFont});
                Marionette.triggerMethodOn(currentView, 'show');
                // color variations for target font -- text differences
                innerHtml = "<div class='control-row' id='dscVariations'><h3>" + i18n.t('view.lblTargetFontVariations');
                innerHtml += "</h3></div><div id='varItems'>";
                innerHtml += "<div class=\'control-row\'>" + i18n.t('view.lblDifferenceColor') + " <input type=\"text\" name=\"color\" id=\'diffcolor\' value=\"" + this.model.get('TextDifferencesColor') + "\" /></div></div>";
                $('#VarItems').html(innerHtml);
                this.container.show(currentView);
                $('#WizStepTitle').hide();
                $('#StepInstructions').hide();
                $('#WizardSteps').hide();
                $('#OKCancelButtons').show();
            },

            OnEditNavFont: function () {
                var theFont = new fontModel.Font();
                theFont.set("name", i18n.t('view.lblNavFont'));
                theFont.set("typeface", this.model.get('NavigationFont'));
                theFont.set("size", parseInt(this.model.get('NavigationFontSize'), 10));
                theFont.set("color", this.model.get('NavigationColor'));
                currentView = new FontView({ model: theFont});
                Marionette.triggerMethodOn(currentView, 'show');
                innerHtml = "";
                this.container.show(currentView);
                $('#WizStepTitle').hide();
                $('#StepInstructions').hide();
                $('#WizardSteps').hide();
                $('#OKCancelButtons').show();
            },
            OnCancel: function () {
                // just display the project settings list (don't save)
                $('#WizStepTitle').show();
                $('#StepInstructions').show();
                $("#OKCancelButtons").hide();
                $('#WizardSteps').show();
                this.ShowStep(step);
            },
            OnOK: function () {
                // save the info from the current step
                switch ($('#ttlFont').html()) {
                // font steps (okay, not technically steps in the work
                case i18n.t('view.lblSourceFont'): // source font
                    this.model.set('SourceFont', $('#font').val(), {silent: true});
                    this.model.set('SourceFontSize', $('#FontSize').val(), {silent: true});
                    this.model.set('SourceColor', $('#color').spectrum('get').toHexString(), {silent: true});
                    this.model.set('SpecialTextColor', $('#spcolor').spectrum('get').toHexString(), {silent: true});
                    this.model.set('RetranslationColor', $('#retranscolor').spectrum('get').toHexString(), {silent: true});
                    break;
                case i18n.t('view.lblTargetFont'): // target font
                    this.model.set('TargetFont', $('#font').val(), {silent: true});
                    this.model.set('TargetFontSize', $('#FontSize').val(), {silent: true});
                    this.model.set('TargetColor', $('#color').spectrum('get').toHexString(), {silent: true});
                    this.model.set('TextDifferencesColor', $('#diffcolor').spectrum('get').toHexString(), {silent: true});
                    break;
                case i18n.t('view.lblNavFont'): // navigation font
                default:
                    this.model.set('NavigationFont', $('#font').val(), {silent: true});
                    this.model.set('NavigationFontSize', $('#FontSize').val(), {silent: true});
                    this.model.set('NavigationColor', $('#color').spectrum('get').toHexString(), {silent: true});
                    break;
                }
                this.model.save(); // save the changes
                // display the project settings list
                $('#WizStepTitle').show();
                $('#StepInstructions').show();
                $("#OKCancelButtons").hide();
                $('#WizardSteps').show();
                this.ShowStep(step);
            },

            OnPrevStep: function () {
                // special case -- first screen doesn't validate -- it just returns to the welcome screen
                if (step === 1) {
                    // delete the project
                    window.Application.ProjectList.remove(this.model); // remove from the collection
                    if (this.model.get("projectid") !== "") {
                        // it's been saved to the DB -- delete it from the DB as well
                        this.model.destroy(); 
                    } 
                    window.history.go(-1); // return to welcome screen
                } else {
                    // pull the info from the current step (must pass validation)
                    if (this.GetProjectInfo(step) === true) {
                        step--;
                        this.ShowStep(step);
                    }
                }
            },

            OnNextStep: function () {
                // pull the info from the current step (must pass validation)
                if (this.GetProjectInfo(step) === true) {
                    if (step < this.numSteps) {
                        step++;
                        this.ShowStep(step);
                    } else {
                        // last step -- finish up
                        // save the model
                        this.model.save();
                        if (window.Application.currentProject !== null) {
                            // There's already a project defined. Clear out any local 
                            // chapter/book/sourcephrase/KB stuff so it loads from our new project instead
                            window.Application.BookList.length = 0;
                            window.Application.ChapterList.length = 0;
                            window.Application.spList.length = 0;
                            window.Application.kbList.length = 0;
                        }
                        // set the current project to our new one
                        window.Application.currentProject = this.model;
                        localStorage.setItem("CurrentProjectID", window.Application.currentProject.get("projectid"));
                        // head back to the home page
                        window.location.replace("");
                        
                        // head back to the home page
//                        window.history.go(-1);
//                        window.Application.home();
                    }
                }
            },
            // Pull project information from the current step
            // Returns true if validation passes, false if it fails
            // (currently just checks for non-null language names in source/target language)
            GetProjectInfo: function (step) {
                var value = null,
                    langstr = "";
                var getLanguageString = function () {
                    var value = null;
                    if (currentView.langName.trim().length === 0) {
                        // fail - no language set
                        // Is there something in the language edit field?
                        if ($("#LanguageName").val().length > 0) {
                            // something in the language field -- attempt to get the nearest match in the languages list
                            value = languages.at(0);
                            if (languages.length > 0) {
                                // found something that matches the search text -- suggest it
                                if (navigator.notification) {
                                    // on mobile device -- use notification plugin API
                                    navigator.notification.confirm(
                                        i18n.t('view.lblUseLanguage', {language: value.get("Ref_Name")}),
                                        function (btnIndex) {
                                            if (btnIndex === 1) {
                                                // set the language and ID
                                                currentView.langName = value.get("Ref_Name");
                                                currentView.langCode = buildFullLanguageCode(value.get("Id"), $('#LanguageVariant').val().trim());
                                            } else {
                                                // user rejected this suggestion -- tell them to enter
                                                // a language name and finish up
                                                navigator.notification.alert(i18n.t('view.errEnterLanguageName'));
                                            }
                                        },
                                        i18n.t('view.ttlMain'),
                                        [i18n.t('view.lblYes'), i18n.t('view.lblNo')]
                                    );
                                } else {
                                    // in browser -- use window.confirm / window.alert
                                    if (window.confirm(i18n.t('view.lblUseLanguage', {language: value.get("Ref_Name")}))) {
                                        // use the suggested language
                                        currentView.langName = value.get("Ref_Name");
                                        currentView.langCode = buildFullLanguageCode(value.get("Id"), $('#LanguageVariant').val().trim());
                                    } else {
                                        // user rejected this suggestion -- tell them to enter
                                        // a language name and finish up
                                        alert(i18n.t('view.errEnterLanguageName'));
                                    }
                                }
                            } else {
                                // no suggestion found (user fell on his keyboard?)
                                // just tell them to enter something
                                if (navigator.notification) {
                                    // on mobile device -- use notification plugin API
                                    navigator.notification.alert(i18n.t('view.errEnterLanguageName'));
                                } else {
                                    // in browser -- use window.confirm / window.alert
                                    alert(i18n.t('view.errEnterLanguageName'));
                                }
                            }
                        } else {
                            // user didn't type anything in
                            // just tell them to enter something
                            if (navigator.notification) {
                                // on mobile device -- use notification plugin API
                                navigator.notification.alert(i18n.t('view.errEnterLanguageName'));
                            } else {
                                // in browser -- use window.confirm / window.alert
                                alert(i18n.t('view.errEnterLanguageName'));
                            }
                        }
                    }
                    // return whatever we got (could be empty)
                    return currentView.langName;
                };
                switch (step) {
                case 1: // source language
                    // get / validate the language string
                    langstr = getLanguageString();
                    if (langstr.length === 0) {
                        // unable to get the language string (or the user didn't like the suggestion we gave)
                        $("#LanguageName").focus();
                        return false;
                    }
                    this.model.set("SourceLanguageName", currentView.langName, {silent: true});
                    this.model.set("SourceLanguageCode", $("#LanguageCode").val().trim(), {silent: true});
                    this.model.set("SourceDir", ($('#RTL').is(':checked') === true) ? "rtl" : "ltr", {silent: true});
                    this.model.set("SourceVariant", $('#LanguageVariant').val().trim(), {silent: true});
                    break;
                case 2: // target language
                    // get / validate the language string
                    langstr = getLanguageString();
                    if (langstr.length === 0) {
                        // unable to get the language string (or the user didn't like the suggestion we gave)
                        $("#LanguageName").focus();
                        return false;
                    }
                    this.model.set("TargetLanguageName", currentView.langName, {silent: true});
                    this.model.set("TargetLanguageCode", $("#LanguageCode").val().trim(), {silent: true});
                    this.model.set("TargetVariant", $('#LanguageVariant').val().trim(), {silent: true});
                    this.model.set("TargetDir", ($('#RTL').is(':checked') === true) ? "rtl" : "ltr", {silent: true});
                    // also set the ID and name of the project, now that we (should) have both source and target defined
                    // Do this only if we don't already have an ID
                    if (this.model.get("projectid") === "") {
                        value = window.Application.generateUUID();
                        this.model.set("projectid", value, {silent: true});
                    }
                    this.model.set("name", i18n.t("view.lblSourceToTargetAdaptations", {
                        source: (this.model.get("SourceVariant").length > 0) ? this.model.get("SourceVariant") : this.model.get("SourceLanguageName"),
                        target: (this.model.get("TargetVariant").length > 0) ? this.model.get("TargetVariant") : this.model.get("TargetLanguageName")}), {silent: true});
                    console.log("id: " + value);
                    break;
                case 3: // fonts
                    break;
                case 4: // punctuation
                    this.model.set("CopyPunctuation", ($('#CopyPunctuation').is(':checked') === true) ? "true" : "false", {silent: true});
                    this.model.set({PunctPairs: currentView.getRows()}, {silent: true});
                    break;
                case 5: // cases
                    this.model.set("SourceHasUpperCase", ($('#SourceHasCases').is(':checked') === true) ? "true" : "false", {silent: true});
                    this.model.set("AutoCapitalization", ($('#AutoCapitalize').is(':checked') === true) ? "true" : "false", {silent: true});
                    this.model.set({CasePairs: currentView.getRows()}, {silent: true});
                    break;
                case 6: // USFM filtering
                    this.model.set("CustomFilters", ($('#UseCustomFilters').is(':checked') === true) ? "true" : "false", {silent: true});
                    if (($('#UseCustomFilters').is(':checked') === true)) {
                        this.model.set("FilterMarkers", currentView.getFilterString(), {silent: true});
                    }
                    break;
                }
                if (this.model.get("projectid") !== "") {
                    this.model.save();
                }
                return true;
            },

            OnNewProject: function () {
                // create a new project model object
                //this.openDB();
                this.numSteps = 6;
                step = 1;
                languages = new langs.LanguageCollection();
                USFMMarkers = new usfm.MarkerCollection();
                USFMMarkers.fetch({reset: true, data: {name: ""}}); // return all results
            },

            ShowStep: function (number) {
                var totalSteps = 6;
                var progressPct = ((number * 1.0 / totalSteps) * 100).toFixed(1);
                // clear out the old view (if any)
                currentView = null;
                innerHtml = "";
                // set the progress bar
                $("#progress").html(""); // clear out the old pie
                var dp = JSON.parse($("#progress").attr("data-pie"));
                dp.percent = progressPct; // update progress value
                $("#progress").attr("data-pie", JSON.stringify(dp));
                $("#progress").attr("style", "");
                var progress = new CircularProgressBar('pie'); // create the progress bar
                
                switch (number) {
                case 1: // source language
                    languages.fetch({reset: true, data: {name: "    "}}); // clear out languages collection filter
                    currentView = new SourceLanguageView({ model: this.model, collection: languages });
                    currentView.langName = this.model.get("SourceLanguageName");
                    currentView.langCode = this.model.get("SourceLanguageCode");
                    // title
                    this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                    // instructions
                    this.$("#WizStepTitle").html(i18n.t('view.ttlProjectSourceLanguage'));
                    this.$("#StepInstructions").html(i18n.t('view.dscProjectSourceLanguage'));
                    this.$("#lblPrev").html(i18n.t('view.lblPrev'));
                    this.$("#lblNext").html(i18n.t('view.lblNext'));
                    // controls
                    if (this.model.get("SourceDir") === "rtl") {
                        this.$("#RTL").checked = true;
                    }
                    this.$("#LanguageVariant").html(this.model.get("SourceVariant"));
                    break;
                case 2: // target language
                    languages.fetch({reset: true, data: {name: "    "}}); // clear out languages collection filter
                    currentView = new TargetLanguageView({ model: this.model, collection: languages });
                    currentView.langName = this.model.get("TargetLanguageName");
                    currentView.langCode = this.model.get("TargetLanguageCode");
                    // title
                    this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                    // instructions
                    this.$("#WizStepTitle").html(i18n.t('view.ttlProjectTargetLanguage'));
                    this.$("#StepInstructions").html(i18n.t('view.dscProjectTargetLanguage'));
                    // controls
                    if (this.model.get("TargetDir") === "rtl") {
                        this.$("#RTL").checked = true;
                    }
                    this.$("#LanguageVariant").html(this.model.get("TargetVariant"));
                    this.$("#Prev").removeAttr('disabled');
                    break;
                case 3: // fonts
                    currentView = new FontsView({ model: this.model});
                    // title
                    $("#StepTitle").html(i18n.t('view.lblCreateProject'));
                    // instructions
                    $("#WizStepTitle").html(i18n.t('view.ttlProjectFonts'));
                    $("#StepInstructions").html(i18n.t('view.dscProjectFonts'));
                    break;
                case 4: // punctuation
                    currentView = new PunctuationView({ model: this.model});
                    // title
                    this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                    // instructions
                    this.$("#WizStepTitle").html(i18n.t('view.ttlProjectPunctuation'));
                    this.$("#StepInstructions").html(i18n.t('view.dscProjectPunctuation'));
                    break;
                case 5: // cases
                    currentView = new CasesView({ model: this.model});
                    // title
                    this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                    // instructions
                    this.$("#WizStepTitle").html(i18n.t('view.ttlProjectCases'));
                    this.$("#StepInstructions").html(i18n.t('view.dscProjectCases'));
                    // controls
                    // Penultimate step -- enable the next button (only needed
                    // if the user happens to back up from the last one)
                    this.$("#lblNext").html(i18n.t('view.lblNext'));
                    this.$("#imgNext").removeAttr("style");
                    break;
                case 6: // USFM filtering
                    currentView = new USFMFilteringView({ model: this.model});
                    // title
                    this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                    // instructions
                    this.$("#WizStepTitle").html(i18n.t('view.ttlProjectFiltering'));
                    this.$("#StepInstructions").html(i18n.t('view.dscProjectUSFMFiltering'));
                    // controls
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
        CopyProjectView: CopyProjectView,
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
