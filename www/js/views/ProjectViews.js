/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

// ProjectViews.js
// Project creation / import functionality for AIM.
define(function (require) {

    "use strict";

    var $               = require('jquery'),
        Underscore      = require('underscore'),
        Backbone        = require('backbone'),
        Handlebars      = require('handlebars'),
        Helpers         = require('app/utils/HandlebarHelpers'),
        Marionette      = require('marionette'),
        cp              = require('colorpicker'),
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
        tplLanguages        = require('text!tpl/LanguagesList.html'),
        tplEditorPrefs      = require('text!tpl/EditorPrefs.html'),
        i18n        = require('i18n'),
        usfm        = require('utils/usfm'),
        langs       = require('utils/languages'),
        projModel   = require('app/models/project'),
        fontModel   = require('app/models/font'),
        langName    = "",
        langCode    = "",
        innerHtml   = "",
        step        = 1,
        currentView = null,
        languages   = null,
        USFMMarkers = null,
        theFont     = null,
        template    = null,
        projectURL  = "",
        localURL    = "",//cordova.file.documentsDirectory
        lines       = [],
        ft          = null,
        fileList    = [],
 
        ////
        // Helper methods
        ////

        // Helper method to hide the prev/next buttons and increase the scroller size
        // if the screen is too small
        // (Issue #232)
        HideTinyUI = function () {
            if ((window.innerHeight / 2) < ($("#StepInstructions").height() + $("#StepContainer").height() + $("#WizardSteps").height())) {
                $(".scroller-bottom-tb").css({bottom: "0"});
                $(".bottom-tb").hide();
                $("#Spacer").show();
            }
        },

        // Helper method to show the prev/next buttons and decrease the scroller size
        ShowTinyUI = function () {
            $(".scroller-bottom-tb").css({bottom: "61px"});
            $(".bottom-tb").show();
            $("#Spacer").hide();
        },
        
        // Helper to import the selected file into the specified
        // project object (overridding any existing values). This gets called
        // from both mobileImportAIC and browserImportAIC.
        importSettingsFile = function (file, project) {
            var reader = new FileReader();
            reader.onloadend = function (evt) {
                var value = "",
                    value2 = "",
                    value3 = "",
                    value4 = "",
                    intVal = 0,
                    i = 0,
                    s = null,
                    t = null,
                    arrPunct = [],
                    arrCases = [];
                // helper method to convert .aic color values to an html hex color string:
                // .aic  --> bbggrr (in base 10)
                // .html --> #rrggbb  (in hex)
                var getColorValue = function (strValue) {
                    var intValue = parseInt(strValue, 10);
                    var rValue = ("00" + (intValue & 0xff).toString(16)).slice(-2);
                    var gValue = ("00" + ((intValue >> 8) & 0xff).toString(16)).slice(-2);
                    var bValue = ("00" + ((intValue >> 16) & 0xff).toString(16)).slice(-2);
                    // format in html hex, padded with leading zeroes
                    var theValue = "#" + rValue + gValue + bValue;
                    return theValue;
                };
                // Helper method to pull out the value corresponding to the named setting from the .aic file contents
                // (the array "lines"). If the named setting isn't found at that line, it searches FORWARD to the end --
                // returning an empty string if not found.
                var getSettingValue = function (expectedIndex, aicSetting) {
                    var i = 0,
                        value = "";
                    if (lines[expectedIndex].indexOf(aicSetting) !== -1) {
                        // the value is the rest of the line AFTER the aicsetting + space
                        value = lines[expectedIndex].substr(aicSetting.length + 1);
                    } else {
                        // This setting is NOT at the line we expected. It could be on a different
                        // line, or not in the .aic file at all
                        for (i = 0; i < lines.length; i++) {
                            if (lines[i].indexOf(aicSetting) === 0) {
                                // Found! The value is the rest of the line AFTER the aicsetting + space
                                value = lines[i].substr(aicSetting.length + 1);
                                // finish searching
                                break;
                            }
                        }
                    }
                    return value;
                };
                // split out the .aic file into an array (one entry per line of the file)
                lines = evt.target.result.split("\n");
                // We've successfully opened an Adapt It project file (.aic) -
                // populate our AIM model object with values
                // from the .aic file
                project.set("SourceLanguageName", getSettingValue(55, "SourceLanguageName"), {silent: true});
                project.set("TargetLanguageName", getSettingValue(56, "TargetLanguageName"), {silent: true});
                project.set("SourceLanguageCode", getSettingValue(59, "SourceLanguageCode"), {silent: true});
                project.set("TargetLanguageCode", getSettingValue(60, "TargetLanguageCode"), {silent: true});
                project.set("SourceDir", (getSettingValue(115, "SourceIsRTL") === "1") ? "rtl" : "ltr", {silent: true});
                project.set("TargetDir", (getSettingValue(116, "TargetIsRTL") === "1") ? "rtl" : "ltr", {silent: true});
                value = getSettingValue(124, "ProjectName");
                if (value.length > 0) {
                    project.set("name", value, {silent: true});
                } else {
                    // project name not found -- build it from the source & target languages
                    project.set("name", i18n.t("view.lblSourceToTargetAdaptations", {
                        source: (project.get("SourceVariant").length > 0) ? project.get("SourceVariant") : project.get("SourceLanguageName"),
                        target: (project.get("TargetVariant").length > 0) ? project.get("TargetVariant") : project.get("TargetLanguageName")}), {silent: true});
                }
                // filters (USFM only -- other settings are ignored)
                value = getSettingValue(124, "UseSFMarkerSet");
                if (value === "UsfmOnly") {
                    value = getSettingValue(123, "UseFilterMarkers");
                    if (value !== project.get("FilterMarkers")) {
                        project.set("UseCustomFilters", "true", {silent: true});
                        project.set("FilterMarkers", value, {silent: true});
                    }
                }
//                    value = model.get("SourceLanguageCode") + "." + model.get("TargetLanguageCode");
                value = Underscore.uniqueId();
                project.set("projectid", value, {silent: true});
                // The following settings require some extra work
                // Punctuation pairs
                value = getSettingValue(79, "PunctuationPairsSourceSet(stores space for an empty cell)");
                value2 = getSettingValue(80, "PunctuationPairsTargetSet(stores space for an empty cell)");
                for (i = 0; i < value.length; i++) {
                    s = value.charAt(i);
                    t = value2.charAt(i);
                    if (s && s.length > 0) {
                        arrPunct[arrPunct.length] = {s: s, t: t};
                    }
                }
                // add double punctuation pairs as well
                value = getSettingValue(81, "PunctuationTwoCharacterPairsSourceSet(ditto)");
                value2 = getSettingValue(82, "PunctuationTwoCharacterPairsTargetSet(ditto)");
                i = 0;
                while (i < value.length) {
                    s = value.substr(i, 2);
                    t = value2.substr(i, 2);
                    if (s && s.length > 0) {
                        arrPunct[arrPunct.length] = {s: s, t: t};
                    }
                    i = i + 2; // advance to the next item (each set is 2 chars in length)
                }
                project.set({PunctPairs: arrPunct}, {silent: true});
                // Auto capitalization
                value = getSettingValue(115, "LowerCaseSourceLanguageChars");
                value2 = getSettingValue(116, "UpperCaseSourceLanguageChars");
                value3 = getSettingValue(117, "LowerCaseTargetLanguageChars");
                value4 = getSettingValue(118, "UpperCaseTargetLanguageChars");
                for (i = 0; i < value.length; i++) {
                    s = value.charAt(i) + value2.charAt(i);
                    t = value3.charAt(i) + value4.charAt(i);
                    if (s && s.length > 0) {
                        arrCases[arrCases.length] = {s: s, t: t};
                    }
                }
                project.set({CasePairs: arrCases}, {silent: true});
                value = getSettingValue(121, "AutoCapitalizationFlag");
                project.set("AutoCapitalization", (value === "1") ? "true" : "false", {silent: true});
                value = getSettingValue(122, "SourceHasUpperCaseAndLowerCase");
                project.set("SourceHasUpperCase", (value === "1") ? "true" : "false", {silent: true});

                // Fonts, if they're installed on this device (getFontList is async)
                if (navigator.Fonts) {
                    navigator.Fonts.getFontList(
                        function (fontList) {
                            if (fontList) {
                                // Source Font
                                value = getSettingValue(16, "FaceName");
                                if ($.inArray(value, fontList) > -1) {
                                    project.set("SourceFont", value, {silent: true});
                                }
                                // Target Font
                                value = getSettingValue(34, "FaceName");
                                if ($.inArray(value, fontList) > -1) {
                                    project.set("TargetFont", value, {silent: true});
                                }
                            }
                        },
                        function (error) {
                            console.log("FontList error: " + error);
                        }
                    );
                }
                // font colors
                project.set("SourceColor", getColorValue(getSettingValue(17, "Color")), {silent: true});
                project.set("TargetColor", getColorValue(getSettingValue(34, "Color")), {silent: true});
                project.set("NavColor", getColorValue(getSettingValue(53, "Color")), {silent: true});
                project.set("SpecialTextColor", getColorValue(getSettingValue(87, "SpecialTextColor")), {silent: true});
                project.set("RetranslationColor", getColorValue(getSettingValue(88, "RetranslationTextColor")), {silent: true});
                project.set("TextDifferencesColor", getColorValue(getSettingValue(89, "TargetDifferencesTextColor")), {silent: true});
                
                // done -- display the OK button
                project.set("projectid", Underscore.uniqueId(), {silent: true});
                $("#status").html(i18n.t("view.dscStatusImportSuccess", {document: project.get("name")}));
                if ($("#loading").length) {
                    $("#loading").hide();
                    $("#waiting").hide();
                    $("#OK").show();
                }
                $("#OK").removeAttr("disabled");
            };
            reader.readAsText(file, "UTF-8");
        },

        // CopyProjectView
        // Copy a project file from an .aic file on the device.
        CopyProjectView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplCopyOrImport),
            localURLs: null,

            initialize: function () {
                document.addEventListener("resume", this.onResume, false);
            },
                        
            ////
            // Event Handlers
            ////
            events: {
                "change #selFile": "browserImportAIC",
                "click .topcoat-list__item": "mobileImportAIC",
                "click #OK": "onOK"
            },
            // Resume handler -- user placed the app in the background, then resumed.
            // Assume the file list could have changed, and reload this page
            onResume: function () {
                // refresh the view
                Backbone.history.loadUrl(Backbone.history.fragment);
            },
            // Handler for the OK button click -- 
            // saves any changes and goes back to the home page
            onOK: function (event) {
                // save the model
                this.model.save();
                window.Application.currentProject = this.model;
                // head back to the home page
                window.history.go(-1);
            },
            // Handler for the click event on the project file list (mobile only) -
            // reconstitutes the file object from the path and calls importSettingsFile()
            mobileImportAIC: function (event) {
                console.log("mobileImportAIC");
                // replace the selection UI with the import UI
                $("#mobileSelect").html(Handlebars.compile(tplLoadingPleaseWait));
                // open selected .aic file
                var index = $(event.currentTarget).attr('id').trim();
                var model = this.model;
                console.log("index: " + index + ", FileList[index]: " + fileList[index]);
                // request the persistent file system
                window.resolveLocalFileSystemURL(fileList[index],
                    function (entry) {
                        entry.file(
                            function (file) {
                                $("#status").html(i18n.t("view.dscStatusReading", {document: file.name}));
                                importSettingsFile(file, model);
                            },
                            function (error) {
                                console.log("FileEntry.file error: " + error.code);
                            }
                        );
                    },
                    function (error) {
                        console.log("resolveLocalFileSystemURL error: " + error.code);
                    });
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
            // Show event handler (from MarionetteJS) -
            // - For mobile devices, uses the cordova-plugin-file API to iterate through
            //   known directories on the mobile device in search of project settings files.
            //   Any found files are listed as <div> elements
            // - For browsers, uses the html <input type=file> element to allow the user
            //   to select an .aic file from the local PC.
            onShow: function () {
                $("#selFile").attr("accept", ".aic");
                $("#selFile").removeAttr("multiple");
                $("#title").html(i18n.t('view.lblCopyProject'));
                $(".topcoat-progress-bar").hide();
                $("#lblDirections").html(i18n.t('view.dscCopyProjInstructions'));
                // cheater way to tell if running on mobile device
                if (window.sqlitePlugin) {
                    // running on device -- use cordova file plugin to select file
                    $("#browserGroup").hide();
                    $("#mobileSelect").html(Handlebars.compile(tplLoadingPleaseWait));
                    var DirsRemaining = window.Application.localURLs.length;
                    var index = 0;
                    var i;
                    var statusStr = "";
                    var addFileEntry = function (entry) {
                        var dirReader = entry.createReader();
                        dirReader.readEntries(
                            function (entries) {
                                var fileStr = "";
                                var i;
                                for (i = 0; i < entries.length; i++) {
                                    if (entries[i].isDirectory === true) {
                                        // Recursive -- call back into this subdirectory
                                        DirsRemaining++;
                                        addFileEntry(entries[i]);
                                    } else {
                                        if (entries[i].name.toLowerCase().indexOf(".aic") > 0) {
                                            fileList[index] = entries[i].toURL();
                                            fileStr += "<li class='topcoat-list__item' id=" + index + ">" + entries[i].fullPath + "<span class='chevron'></span></li>";
                                            index++;
                                        }
                                    }
                                }
                                statusStr += fileStr;
                                DirsRemaining--;
                                if (DirsRemaining <= 0) {
                                    if (statusStr.length > 0) {
                                        $("#mobileSelect").html("<div class='wizard-instructions'>" + i18n.t('view.dscCopyProjInstructions') + "</div><div class='topcoat-list__container chapter-list'><ul class='topcoat-list__container chapter-list'>" + statusStr + "</ul></div>");
                                        $("#OK").attr("disabled", true);
                                    } else {
                                        // nothing to select -- inform the user
                                        $("#status").html(i18n.t("view.dscNoDocumentsFound"));
                                        if ($("#loading").length) {
                                            $("#loading").hide();
                                            $("#waiting").hide();
                                            $("#OK").show();
                                        }
                                        $("#OK").removeAttr("disabled");
                                    }
                                }
                            },
                            function (error) {
                                console.log("readEntries error: " + error.code);
                                statusStr += "<p>readEntries error: " + error.code + "</p>";
                            }
                        );
                    };
                    var addError = function (error) {
                        // log the error and continue processing
                        console.log("getDirectory error: " + error.code);
                        DirsRemaining--;
                    };
                    for (i = 0; i < window.Application.localURLs.length; i++) {
                        if (window.Application.localURLs[i] === null || window.Application.localURLs[i].length === 0) {
                            DirsRemaining--;
                            continue; // skip blank / non-existent paths for this platform
                        }
                        window.resolveLocalFileSystemURL(window.Application.localURLs[i], addFileEntry, addError);
                    }
                } else {
                    // running in browser -- use html <input> to select file
                    $("#mobileSelect").hide();
                }
                $("#OK").attr("disabled", true);
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
                HideTinyUI();
                event.currentTarget.scrollIntoView(true);
            },
            onBlurInput: function (event) {
                ShowTinyUI();
            },
            onClickDeleteRow: function (event) {
                // find the current row
                var array = this.model.get('CasePairs');
                var index = event.currentTarget.id.substr(2);
                // remove the item from the UI
                var element = "#r-" + index;
                $(element).remove();
            },
            // Handler for when the user starts typing on the last row input fields; 
            // adds one more row, shows the delete button on the current ond, and removes the new-row class
            // from the current row so this method doesn't get called on this row again.
            addNewRow: function (event) {
                var newID = Underscore.uniqueId();
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
            template: Handlebars.compile(tplFont),
            events: {
                "change #font": "updateSample",
                "change #FontSize": "updateSample",
                "change #color": "updateSample"
            },
            updateSample: function (event) {
                $('#sample').attr('style', 'font-size:' + $('#FontSize').val() + 'px; font-family:\'' + $('#font').val() + '\'; color:' + $('#color').val() + ';');
            },
            onShow: function () {
                var theColor = 0;
                // populate the font drop-down and color picker if the model is set
                if (this.model) {
                    // font drop-down
                    if ($("#font").length) { // only if UI is shown
                        var typefaces = null,
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
                        $("#font").append($('<option>', {value : 'Gentium'}).text('Gentium'));
                        $("#font").append($('<option>', {value : 'Source Sans'}).text('Source Sans'));
                        // select the current font
                        $("#font").val(this.model.get('typeface'));
                        
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
                HideTinyUI();
                event.currentTarget.scrollIntoView(true);
            },
            onBlurInput: function (event) {
                ShowTinyUI();
            },
            onClickDeleteRow: function (event) {
                // find the current row
                var array = this.model.get('PunctPairs');
                var index = event.currentTarget.id.substr(2);
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
            },
            // Handler for when the user starts typing on the last row input fields; 
            // adds one more row, shows the delete button on the current ond, and removes the new-row class
            // from the current row so this method doesn't get called on this row again.
            addNewRow: function (event) {
                var newID = Underscore.uniqueId();
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

        // LanguagesListView - displays a list of language codes / names matching
        // a search criteria. Used as a child view of the SourceLanguageView and TargetLanguageView
        // classes, defined below.
        LanguagesListView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplLanguages)
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
                this.itemViewContainer = this.$('#name-suggestions');
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
                $("#LanguageName").val(this.langName);
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
                $("#LanguageName").val(this.langName);
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
                USFMMarkers.each(function (item, index, list) {
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
            onClickCustomFilters: function (event) {
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
            onShow: function (event) {
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
        
        EditorAndUIView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplEditorPrefs),
            events: {
                "change #language":   "onSelectCustomLanguage",
            },
            onSelectCustomLanguage: function (event) {
                // change the radio button selection
                $("#customLanguage").prop("checked", true);
            },
            onShow: function (event) {
                if (localStorage.getItem("CopySource")) {
                    $("#CopySource").prop("checked", localStorage.getItem("CopySource") === "true");
                } else {
                    $("#CopySource").prop("checked", true); // default is selected
                };
                if (localStorage.getItem("WrapUSFM")) {
                    $("#WrapAtMarker").prop("checked", localStorage.getItem("WrapUSFM") === "true");
                } else {
                    $("#WrapAtMarker").prop("checked", true); // default is selected
                };
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
            regions: {
                container: "#StepContainer"
            },
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
                "click #SourceLanguage": "OnEditSourceLanguage",
                "click #TargetLanguage": "OnEditTargetLanguage",
                "click #sourceFont": "OnEditSourceFont",
                "click #targetFont": "OnEditTargetFont",
                "click #navFont": "OnEditNavFont",
                "click #Punctuation": "OnEditPunctuation",
                "click #Cases": "OnEditCases",
                "click #Filtering": "OnEditFiltering",
                "keyup #LanguageName":    "searchLanguageName",
                "keypress #LanguageName": "onkeypressLanguageName",
                "keyup #LanguageVariant": "buildFullLanguageCode",
                "click .autocomplete-suggestion": "selectLanguage",
                "click .delete-row": "onClickDeleteRow",
                "keyup .new-row": "addNewRow",
                "click #CopyPunctuation": "OnClickCopyPunctuation",
                "click #SourceHasCases": "OnClickSourceHasCases",
                "click #AutoCapitalize": "OnClickAutoCapitalize",
                "click #UseCustomFilters": "OnClickCustomFilters",
                "click #Cancel": "OnCancel",
                "click #OK": "OnOK"
            },
            
            OnEditorUIPrefs: function (event) {
                step = 9;
                this.ShowView(step);
            },                                         
            searchLanguageName: function (event) {
                // pull out the value from the input field
                var key = $('#LanguageName').val().trim();
                if (key.trim() === "") {
                    // Fix problem where an empty value returns all results.
                    // Here if there's no _real_ value, fetch nothing.
                    languages.fetch({reset: true, data: {name: "    "}});
                    this.$("#name-suggestions").hide();
                } else {
                    // find all matches in the language collection
                    languages.fetch({reset: true, data: {name: key}});
                    this.$("#name-suggestions").show();
                }
                // scroll the language search field to the top of the screen if necessary
                $("#LanguageName")[0].scrollIntoView(true);
//                $(".topcoat-list__header").html(i18n.t("view.lblPossibleLanguages"));
//                console.log(key + ": " + languages.length + " results.");
            },
            buildFullLanguageCode: function (event) {
                var value = currentView.langCode,
                    newValue = value;
                // only build if there's a language code defined
                if (value.length > 0) {
                    // is there anything in the language variant?
                    if ($('#LanguageVariant').val().trim().length === 0) {
                        // nothing in the variant -- use just the iso639 code with no -x-
                        if (value.indexOf("-x-") > 0) {
                            newValue = value.substr(0, value.indexOf("-x-"));
                        }
                    } else {
                        // variant is defined --- code is in the form [is0639]-x-[variant], where [variant] has
                        // a max length of 8 chars
                        if (value.indexOf("-x-") > 0) {
                            // replace the existing variant
                            newValue = value.substr(0, value.indexOf("-x-") + 3) + $('#LanguageVariant').val().trim().substr(0,8);
                        } else {
                            // add a new variant
                            newValue = value + "-x-" + $('#LanguageVariant').val().trim().substr(0,8);
                        }
                    }
                    $('#langCode').html(i18n.t('view.lblCode') + ": " + newValue);
                    currentView.langCode = newValue;
                }
            },
            addNewRow: function (event) {
                currentView.addNewRow(event);
            },
            onkeypressLanguageName: function (event) {
                this.$("#name-suggestions").show();
//                $(".topcoat-list__header").html(i18n.t("view.lblSearching"));
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
                // if there's a language variant defined, rework the language code to include it
                if ($('#LanguageVariant').val().length > 0) {
                    this.buildFullLanguageCode(event);
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
            OnEditSourceLanguage: function (event) {
                step = 1;
                this.ShowView(step);
            },
            OnEditTargetLanguage: function (event) {
                step = 2;
                this.ShowView(step);
            },
            OnEditSourceFont: function (event) {
                step = 3;
                this.ShowView(step);
            },
            OnEditTargetFont: function (event) {
                step = 4;
                this.ShowView(step);
            },
            OnEditNavFont: function (event) {
                step = 5;
                this.ShowView(step);
            },
            OnEditPunctuation: function (event) {
                step = 6;
                this.ShowView(step);
            },
            OnEditCases: function (event) {
                step = 7;
                this.ShowView(step);
            },
            OnEditFiltering: function (event) {
                step = 8;
                this.ShowView(step);
            },
            OnCancel: function (event) {
                // just display the project settings list (don't save)
                $("#StepContainer").hide();
                $("#OKCancelButtons").hide();
                $('#ProjectItems').show();
                $(".container").attr("style", "height: calc(100% - 70px);");
            },
            OnOK: function (event) {
                // save the info from the current step
                this.UpdateProject(step);
                // display the project settings list
                $("#StepContainer").hide();
                $("#OKCancelButtons").hide();
                $('#ProjectItems').show();
                $(".container").attr("style", "height: calc(100% - 70px);");
            },

            UpdateProject: function (step) {
                var value = null,
                    index = 0,
                    punctPairs = null,
                    tempfont = "",
                    tempSize = "",
                    tempColor = "",
                    trimmedValue = null,
                    loc = "",
                    locale = "";
                
                switch (step) {
                case 1: // source language
                    this.model.set("SourceLanguageName", currentView.langName, {silent: true});
                    this.model.set("SourceLanguageCode", currentView.langCode, {silent: true});
                    this.model.set("SourceVariant", Handlebars.Utils.escapeExpression($('#LanguageVariant').val().trim()), {silent: true});
                    this.model.set("SourceDir", ($('#RTL').is(':checked') === true) ? "rtl" : "ltr", {silent: true});
                    break;
                case 2: // target language
                    this.model.set("TargetLanguageName", currentView.langName, {silent: true});
                    this.model.set("TargetLanguageCode", currentView.langCode, {silent: true});
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
                    if ($("#customLanguage").is(":checked")) {
                        // Use a custom language
                        loc = $('#language').val();
                        // set the language in local storage
                        localStorage.setItem(("UILang"), loc);
                        // set the locale, then return
                        i18n.setLng(loc, function (err, t) {
                            // do nothing?
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
                                // do nothing?
                            });
                        } else {
                            // fallback - use web browser's language metadata
                            var lang = (navigator.languages) ? navigator.languages[0] : (navigator.language || navigator.userLanguage);
                            locale = lang.split("-")[0];
                            // set the locale, then return
                            i18n.setLng(locale, function (err, t) {
                                // do nothing?
                            });
                        }
                    }
                    
                    break;
                }
//                this.model.trigger('change');
                this.model.save();
            },

            OnEditProject: function () {
                // create a new project model object
                //this.openDB();
                languages = new langs.LanguageCollection();
                USFMMarkers = new usfm.MarkerCollection();
                USFMMarkers.fetch({reset: true, data: {name: ""}}); // return all results
                // title
                this.$("#StepTitle").html(i18n.t('view.lblEditProject'));
            },

            ShowView: function (number) {
                innerHtml = "";
                // Display the frame UI
                $("#OKCancelButtons").prop('hidden', false);
                $("#Instructions").prop('hidden', false);
                $("#StepContainer").prop('hidden', false);
                $("#OKCancelButtons").prop('hidden', false);
                // hide the project list items
                $("#StepContainer").show();
                $("#OKCancelButtons").show();
                $('#ProjectItems').hide();
                $(".container").removeAttr("style");
                // clear out the old view (if any)
                currentView = null;
                switch (number) {
                case 1: // source language
                    languages.fetch({reset: true, data: {name: "    "}}); // clear out languages collection filter
                    currentView = new SourceLanguageView({ model: this.model, collection: languages });
                    currentView.langName = this.model.get("SourceLanguageName");
                    currentView.langCode = this.model.get("SourceLanguageCode");
                    // instructions
                    this.$("#Instructions").html(i18n.t('view.dscProjectSourceLanguage'));
                    break;
                case 2: // target language
                    languages.fetch({reset: true, data: {name: "    "}}); // clear out languages collection filter
                    currentView = new TargetLanguageView({ model: this.model, collection: languages });
                    currentView.langName = this.model.get("TargetLanguageName");
                    currentView.langCode = this.model.get("TargetLanguageCode");
                    // instructions
                    this.$("#Instructions").html(i18n.t('view.dscProjectTargetLanguage'));
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
                    $("#Instructions").html(i18n.t('view.dscProjectFonts'));
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
                    $("#Instructions").html(i18n.t('view.dscProjectFonts'));
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
                    $("#Instructions").html(i18n.t('view.dscProjectFonts'));
                    break;
                case 6: // punctuation
                    currentView = new PunctuationView({ model: this.model});
                    // instructions
                    this.$("#Instructions").html(i18n.t('view.dscProjectPunctuation'));
                    break;
                case 7: // cases
                    currentView = new CasesView({ model: this.model});
                    // instructions
                    this.$("#Instructions").html(i18n.t('view.dscProjectCases'));
                    break;
                case 8: // USFM filtering
                    currentView = new USFMFilteringView({ model: this.model});
                    // instructions
                    this.$("#Instructions").html(i18n.t('view.dscProjectUSFMFiltering'));
                    break;
                case 9: // editor and UI language
                    currentView = new EditorAndUIView({model: this.model});
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
                "focus #LanguageName": "onFocusLanguageName",
                "keyup #LanguageName": "searchLanguageName",
                "keypress #LanguageName": "onkeypressLanguageName",
                "blur #LanguageName": "onBlurLanguageName",
                "click .autocomplete-suggestion": "selectLanguage",
                "focus #LanguageVariant": "onFocusLanguageVariant",
                "click #LanguageVariant": "onClickLanguageVariant",
                "keyup #LanguageVariant": "buildFullLanguageCode",
                "blur #LanguageVariant": "onBlurLanguageVariant",
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
            
            onFocusLanguageName: function (event) {
                HideTinyUI();
                $("#LanguageName")[0].scrollIntoView(true);
            },

            onBlurLanguageName: function (event) {
                ShowTinyUI();
            },
            
            onFocusLanguageVariant: function (event) {
                HideTinyUI();
                $("#LanguageVariant")[0].scrollIntoView(true);
            },

            onBlurLanguageVariant: function (event) {
                ShowTinyUI();
            },
            
            searchLanguageName: function (event) {
                // pull out the value from the input field
                var key = $('#LanguageName').val();
                if (key.trim() === "") {
                    // Fix problem where an empty value returns all results.
                    // Here if there's no _real_ value, fetch nothing.
                    languages.fetch({reset: true, data: {name: "    "}});
                    this.$("#name-suggestions").hide();
                } else {
                    // find all matches in the language collection
                    Underscore.first(languages.fetch({reset: true, data: {name: key}}), 100);
                    this.$("#name-suggestions").show();
                }
                // scroll the language search field to the top of the screen if necessary
                $("#LanguageName")[0].scrollIntoView(true);
//                $(".topcoat-list__header").html(i18n.t("view.lblPossibleLanguages"));
            },

            onkeypressLanguageName: function (event) {
                this.$("#name-suggestions").show();
//                $(".topcoat-list__header").html(i18n.t("view.lblSearching"));
                if (event.keycode === 13) { // enter key pressed
                    event.preventDefault();
                }
            },
            onClickLanguageVariant: function (event) {
                // scroll up if there's not enough room for the keyboard
                if (($(window).height() - $(".StepContainer").height()) < 300) {
                    var top = event.currentTarget.offsetTop - $("#LanguageVariant").outerHeight();
                    $("#LanguageVariant").scrollTop(top);
                }
            },
            buildFullLanguageCode: function (event) {
                var value = currentView.langCode,
                    newValue = value;
                // only build if there's a language code defined
                if (value.length > 0) {
                    // is there anything in the language variant?
                    if ($('#LanguageVariant').val().trim().length === 0) {
                        // nothing in the variant -- use just the iso639 code with no -x-
                        if (value.indexOf("-x-") > 0) {
                            newValue = value.substr(0, value.indexOf("-x-"));
                        }
                    } else {
                        // variant is defined --- code is in the form [is0639]-x-[variant]
                        if (value.indexOf("-x-") > 0) {
                            // replace the existing variant
                            newValue = value.substr(0, value.indexOf("-x-") + 3) + $('#LanguageVariant').val().trim().substr(0,8);
                        } else {
                            // add a new variant
                            newValue = value + "-x-" + $('#LanguageVariant').val().trim().substr(0,8);
                        }
                    }
                    $('#langCode').html(i18n.t('view.lblCode') + ": " + newValue);
                    currentView.langCode = newValue;
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
                this.$("#name-suggestions").hide();
                // if there's a language variant defined, rework the language code to include it
                if ($('#LanguageVariant').val().length > 0) {
                    this.buildFullLanguageCode(event);
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
            OnEditSourceFont: function (event) {
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
                $('#StepInstructions').hide();
                $('#WizardSteps').hide();
                $('#OKCancelButtons').show();
            },

            OnEditTargetFont: function (event) {
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
                $('#StepInstructions').hide();
                $('#WizardSteps').hide();
                $('#OKCancelButtons').show();
            },

            OnEditNavFont: function (event) {
                var theFont = new fontModel.Font();
                theFont.set("name", i18n.t('view.lblNavFont'));
                theFont.set("typeface", this.model.get('NavigationFont'));
                theFont.set("size", parseInt(this.model.get('NavigationFontSize'), 10));
                theFont.set("color", this.model.get('NavigationColor'));
                currentView = new FontView({ model: theFont});
                Marionette.triggerMethodOn(currentView, 'show');
                innerHtml = "";
                this.container.show(currentView);
                $('#StepInstructions').hide();
                $('#WizardSteps').hide();
                $('#OKCancelButtons').show();
            },
            OnCancel: function (event) {
                // just display the project settings list (don't save)
                $('#StepInstructions').show();
                $("#OKCancelButtons").hide();
                $('#WizardSteps').show();
                this.ShowStep(step);
            },
            OnOK: function (event) {
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
                $('#StepInstructions').show();
                $("#OKCancelButtons").hide();
                $('#WizardSteps').show();
                this.ShowStep(step);
            },

            OnPrevStep: function (event) {
                // pull the info from the current step (must pass validation)
                if (this.GetProjectInfo(step) === true) {
                    if (step > 1) {
                        step--;
                    }
                    ShowTinyUI();
                    this.ShowStep(step);
                }
            },

            OnNextStep: function (event) {
                var coll = null;
                // pull the info from the current step (must pass validation)
                if (this.GetProjectInfo(step) === true) {
                    if (step < this.numSteps) {
                        step++;
                        ShowTinyUI();
                        this.ShowStep(step);
                    } else {
                        // last step -- finish up
                        // save the model
                        this.model.save();
                        // head back to the home page
                        window.Application.currentProject = this.model;
                        window.history.go(-1);
//                        window.Application.home();
                    }
                }
            },
            // Pull project information from the current step
            // Returns true if validation passes, false if it fails
            // (currently just checks for non-null language names in source/target language)
            GetProjectInfo: function (step) {
                var value = null,
                    index = 0,
                    langstr = "",
                    punctPairs = null,
                    trimmedValue = null;
                var getLanguageString = function () {
                    var fail = false,
                        btnIndex = 0,
                        language = "",
                        value = null;
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
                                                currentView.langCode = value.get("Id");
                                                if ($('#LanguageVariant').val().trim().length > 0) {
                                                    currentView.langCode += "-x-" + $('#LanguageVariant').val().trim().substr(0,8);
                                                }
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
                                        currentView.langCode = value.get("Id");
                                        if ($('#LanguageVariant').val().trim().length > 0) {
                                            currentView.langCode += "-x-" + $('#LanguageVariant').val().trim().substr(0,8);
                                        }
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
                    this.model.set("SourceLanguageCode", currentView.langCode, {silent: true});
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
                    this.model.set("TargetLanguageCode", currentView.langCode, {silent: true});
                    this.model.set("TargetVariant", $('#LanguageVariant').val().trim(), {silent: true});
                    this.model.set("TargetDir", ($('#RTL').is(':checked') === true) ? "rtl" : "ltr", {silent: true});
                    // also set the ID and name of the project, now that we (should) have both source and target defined
                    // Do this only if we don't already have an ID
                    if (this.model.get("projectid") === "") {
                        value = Underscore.uniqueId();
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
                $("#progress").attr("style", "width: " + progressPct + "%;");
                
                switch (number) {
                case 1: // source language
                    languages.fetch({reset: true, data: {name: "    "}}); // clear out languages collection filter
                    currentView = new SourceLanguageView({ model: this.model, collection: languages });
                    currentView.langName = this.model.get("SourceLanguageName");
                    currentView.langCode = this.model.get("SourceLanguageCode");
                    // title
                    this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                    // instructions
                    this.$("#StepInstructions").html(i18n.t('view.dscProjectSourceLanguage'));
                    // controls
                    this.$("#name-suggestions").hide();
                    // first step -- disable the prev button
                    this.$("#Prev").attr('disabled', 'true');
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
                    this.$("#StepInstructions").html(i18n.t('view.dscProjectTargetLanguage'));
                    // controls
                    if (this.model.get("TargetDir") === "rtl") {
                        this.$("#RTL").checked = true;
                    }
                    this.$("#LanguageVariant").html(this.model.get("TargetVariant"));
                    this.$("#name-suggestions").hide();
                    this.$("#Prev").removeAttr('disabled');
                    break;
                case 3: // fonts
                    currentView = new FontsView({ model: this.model});
                    // title
                    $("#StepTitle").html(i18n.t('view.lblCreateProject'));
                    // instructions
                    $("#StepInstructions").html(i18n.t('view.dscProjectFonts'));
                    break;
                case 4: // punctuation
                    currentView = new PunctuationView({ model: this.model});
                    // title
                    this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                    // instructions
                    this.$("#StepInstructions").html(i18n.t('view.dscProjectPunctuation'));
                    break;
                case 5: // cases
                    currentView = new CasesView({ model: this.model});
                    // title
                    this.$("#StepTitle").html(i18n.t('view.lblCreateProject'));
                    // instructions
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
        LanguagesListView: LanguagesListView,
        USFMFilteringView: USFMFilteringView
    };
});
