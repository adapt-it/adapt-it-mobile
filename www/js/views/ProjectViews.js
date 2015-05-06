/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
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
        tplPunctuation      = require('text!tpl/ProjectPunctuation.html'),
        tplSourceLanguage   = require('text!tpl/ProjectSourceLanguage.html'),
        tplTargetLanguage   = require('text!tpl/ProjectTargetLanguage.html'),
        tplUSFMFiltering    = require('text!tpl/ProjectUSFMFiltering.html'),
        tplLanguages        = require('text!tpl/LanguagesList.html'),
        i18n        = require('i18n'),
        usfm        = require('utils/usfm'),
        langs       = require('languages'),
        projModel   = require('app/models/project'),
        fontModel   = require('app/models/font'),
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
                    i = 0,
                    s = null,
                    t = null,
                    arr = [];
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
                project.set("SourceLanguageName", getSettingValue(55, "SourceLanguageName"));
                project.set("TargetLanguageName", getSettingValue(56, "TargetLanguageName"));
                project.set("SourceLanguageCode", getSettingValue(59, "SourceLanguageCode"));
                project.set("TargetLanguageCode", getSettingValue(60, "TargetLanguageCode"));
                project.set("SourceDir", (getSettingValue(115, "SourceIsRTL") === "1") ? "rtl" : "ltr");
                project.set("TargetDir", (getSettingValue(116, "TargetIsRTL") === "1") ? "rtl" : "ltr");
                value = getSettingValue(124, "ProjectName");
                if (value.length > 0) {
                    project.set("name", value);
                } else {
                    // project name not found -- build it from the source & target languages
                    project.set("name", i18n.t("view.lblSourceToTargetAdaptations", {source: project.get("SourceLanguageName"), target: project.get("TargetLanguageName")}));

                }
                // filters (USFM only -- other settings are ignored)
                value = getSettingValue(124, "UseSFMarkerSet");
                if (value === "UsfmOnly") {
                    value = getSettingValue(123, "UseFilterMarkers");
                    if (value !== project.get("FilterMarkers")) {
                        project.set("UseCustomFilters", "true");
                        project.set("FilterMarkers", value);
                    }
                }
//                    value = model.get("SourceLanguageCode") + "." + model.get("TargetLanguageCode");
                value = Underscore.uniqueId();
                project.set("id", value);
                // The following settings require some extra work
                // Punctuation pairs
                value = getSettingValue(79, "PunctuationPairsSourceSet(stores space for an empty cell)");
                value2 = getSettingValue(80, "PunctuationPairsTargetSet(stores space for an empty cell)");
                for (i = 0; i < value.length; i++) {
                    s = value.charAt(i);
                    t = value2.charAt(i);
                    if (s && s.length > 0) {
                        arr[arr.length] = {s: s, t: t};
                    }
                }
                project.set({PunctPairs: arr});
                // Auto capitalization
                value = getSettingValue(115, "LowerCaseSourceLanguageChars");
                value2 = getSettingValue(116, "UpperCaseSourceLanguageChars");
                value3 = getSettingValue(117, "LowerCaseTargetLanguageChars");
                value4 = getSettingValue(118, "UpperCaseTargetLanguageChars");
                for (i = 0; i < value.length; i++) {
                    s = value.charAt(i) + value2.charAt(i);
                    t = value3.charAt(i) + value4.charAt(i);
                    if (s && s.length > 0) {
                        arr[arr.length] = {s: s, t: t};
                    }
                }
                project.set({CasePairs: arr});
                value = getSettingValue(121, "AutoCapitalizationFlag");
                project.set("AutoCapitalization", (value === "1") ? "true" : "false");
                value = getSettingValue(122, "SourceHasUpperCaseAndLowerCase");
                project.set("SourceHasUpperCase", (value === "1") ? "true" : "false");

                // Fonts, if they're installed on this device (getFontList is async)
                if (navigator.Fonts) {
                    navigator.Fonts.getFontList(
                        function (fontList) {
                            if (fontList) {
                                // Source Font
                                value = getSettingValue(16, "FaceName");
                                if ($.inArray(value, fontList) > -1) {
                                    project.set("SourceFont", value);
                                }
                                // Target Font
                                value = getSettingValue(34, "FaceName");
                                if ($.inArray(value, fontList) > -1) {
                                    project.set("TargetFont", value);
                                }
                            }
                        },
                        function (error) {
                            console.log("FontList error: " + error);
                        }
                    );
                }
                // done -- display the OK button
                $("#status1").html(i18n.t("view.dscCopyProjectFound", {project: project.get("name")}));
                $("#OK").removeAttr("disabled");
            };
            reader.readAsText(file, "UTF-8");
        },

        // CopyProjectView
        // Copy a project file from an .aic file on the device.
        CopyProjectView = Marionette.ItemView.extend({
            template: Handlebars.compile(tplCopyOrImport),
            ////
            // Event Handlers
            ////
            events: {
                "change #selFile": "browserImportAIC",
                "click .autocomplete-suggestion": "mobileImportAIC",
                "click #OK": "onOK"
            },
            // Handler for the OK button click -- 
            // saves any changes and goes back to the home page
            onOK: function (event) {
                // save the model
                this.model.trigger('change');
                // head back to the home page
                window.history.go(-1);
            },
            // Handler for the click event on the project file list (mobile only) -
            // reconstitutes the file object from the path and calls importSettingsFile()
            mobileImportAIC: function (event) {
                console.log("mobileImportAIC");
                // open selected .aic file
                var index = $(event.currentTarget).attr('id').trim();
                var model = this.model;
                console.log("index: " + index + ", FileList[index]: " + fileList[index]);
                // request the persistent file system
                window.resolveLocalFileSystemURL(fileList[index],
                    function (entry) {
                        entry.file(
                            function (file) {
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
                    $("#browserSelect").hide();
//                    localURL = cordova.file.dataDirectory;
                    var localURLs    = [
                        cordova.file.dataDirectory,
                        cordova.file.documentsDirectory,
                        cordova.file.externalApplicationStorageDirectory,
                        cordova.file.externalCacheDirectory,
                        cordova.file.externalRootDirectory,
                        cordova.file.externalDataDirectory,
                        cordova.file.sharedDirectory,
                        cordova.file.syncedDataDirectory
                    ];
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
                                        addFileEntry(entries[i]);
                                    } else {
                                        if (entries[i].name.indexOf(".aic") > 0) {
                                            fileList[index] = entries[i].toURL();
                                            fileStr += "<div class=\"autocomplete-suggestion\" id=\"" + index + "\">" + entries[i].fullPath + "</div>";
                                            index++;
                                        }
                                    }
                                }
                                statusStr += fileStr;
                                if (statusStr.length > 0) {
                                    $("#mobileSelect").html(statusStr);
                                    $("#OK").attr("disabled", true);
                                } else {
                                    // nothing to select -- inform the user
                                    $("#mobileSelect").html("<span class=\"topcoat-notification\">!</span> <em>" + i18n.t('view.dscNoDocumentsFound') + "</em>");
                                    $("#OK").removeAttr("disabled");
                                }
                            },
                            function (error) {
                                console.log("readEntries error: " + error.code);
                                statusStr += "<p>readEntries error: " + error.code + "</p>";
                            }
                        );
                    };
                    var addError = function (error) {
                        console.log("getDirectory error: " + error.code);
                        statusStr += "<p>getDirectory error: " + error.code + ", " + error.message + "</p>";
                    };
                    for (i = 0; i < localURLs.length; i++) {
                        if (localURLs[i] === null || localURLs[i].length === 0) {
                            continue; // skip blank / non-existent paths for this platform
                        }
                        window.resolveLocalFileSystemURL(localURLs[i], addFileEntry, addError);
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
                "click #SourceHasCases": "onClickSourceHasCases",
                "click #AutoCapitalize": "onClickAutoCapitalize"
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
                        s = Handlebars.Utils.escapeExpression(s);
                        t = Handlebars.Utils.escapeExpression(t);
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
                    }
                    
                    // color picker
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
                }
            }
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
                $("table").append("<tr id='r-" + newID + "'><td><input type='text' class='topcoat-text-input new-row s' id='s-" + newID + "' style='width:100%;' maxlength='1' value=''></td><td><input type='text' id='t-" + newID + "' class='topcoat-text-input new-row t' style='width:100%;' maxlength='1' value=''></td><td><button class='topcoat-icon-button--quiet delete-row hide' title='" + i18n.t('view.ttlDelete') + "' id='d-" + newID + "'><span class='topcoat-icon topcoat-icon--item-delete'></span></button></td></tr>");
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
                        s = Handlebars.Utils.escapeExpression(s);
                        t = Handlebars.Utils.escapeExpression(t);
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
                    value = (filter.indexOf("\\" + item.get('name') + " ") >= 0) ? "true" : "false";
                    htmlstring += "<tr><td><label class='topcoat-checkbox'><input class='c' type='checkbox' id='filter-" + index + " value='" + value;
                    if (value === "true") {
                        htmlstring += " checked";
                    }
                    htmlstring += "><div class='topcoat-checkbox__checkmark'></div></label></td><td><span class='n'>" + item.get('name') + "</span></td><td>" + item.get('description') + "</td></tr>";
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
                    languages.fetch({reset: true, data: {name: key}});
                    this.$("#name-suggestions").show();
                }
//                $(".topcoat-list__header").html(i18n.t("view.lblPossibleLanguages"));
//                console.log(key + ": " + languages.length + " results.");
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
                    trimmedValue = null;
                switch (step) {
                case 1: // source language
                    this.model.set("SourceLanguageName", currentView.langName);
                    this.model.set("SourceLanguageCode", currentView.langCode);
                    this.model.set("SourceVariant", Handlebars.Utils.escapeExpression($('#LanguageVariant').val().trim()));
                    this.model.set("SourceDir", ($('#SourceRTL').is(':checked') === true) ? "rtl" : "ltr");
                    break;
                case 2: // target language
                    this.model.set("TargetLanguageName", currentView.langName);
                    this.model.set("TargetLanguageCode", currentView.langCode);
                    this.model.set("TargetVariant", Handlebars.Utils.escapeExpression($('#LanguageVariant').val().trim()));
                    this.model.set("TargetDir", ($('#TargetRTL').is(':checked') === true) ? "rtl" : "ltr");
                    this.model.set("name", i18n.t("view.lblSourceToTargetAdaptations", {source: this.model.get("SourceLanguageName"), target: currentView.langName}));
                    break;
                case 3: // source font
                    tempfont = $('#font').val();
                    tempSize = $('#FontSize').val();
                    tempColor = $('#color').val();
                    this.model.set('SourceFont', tempfont);
                    this.model.set('SourceFontSize', tempSize);
                    this.model.set('SourceColor', tempColor);
                    break;
                case 4: // target font
                    tempfont = $('#font').val();
                    tempSize = $('#FontSize').val();
                    tempColor = $('#color').val();
                    this.model.set('TargetFont', tempfont);
                    this.model.set('TargetFontSize', tempSize);
                    this.model.set('TargetColor', tempColor);
                    break;
                case 5: // navigation font
                    tempfont = $('#font').val();
                    tempSize = $('#FontSize').val();
                    tempColor = $('#color').val();
                    this.model.set('NavigationFont', tempfont);
                    this.model.set('NavigationFontSize', tempSize);
                    this.model.set('NavigationColor', tempColor);
                    break;
                case 6: // punctuation
                    this.model.set("CopyPunctuation", ($('#CopyPunctuation').is(':checked') === true) ? "true" : "false");
                    if ($('#CopyPunctuation').is(':checked')) {
                        // don't need to update this if we aren't copying punctuation
                        this.model.set({PunctPairs: currentView.getRows()});
                    }
                    break;
                case 7: // cases
                    this.model.set("SourceHasUpperCase", ($('#SourceHasCases').is(':checked') === true) ? "true" : "false");
                    this.model.set("AutoCapitalization", ($('#AutoCapitalize').is(':checked') === true) ? "true" : "false");
                    if ($('#AutoCapitalize').is(':checked')) {
                        // don't need to update this if we aren't capitalizing the target
                        this.model.set({CasePairs: currentView.getRows()});
                    }
                    break;
                case 8: // USFM filtering
                    this.model.set("CustomFilters", ($('#UseCustomFilters').is(':checked') === true) ? "true" : "false");
                    if (($('#UseCustomFilters').is(':checked') === true)) {
                        this.model.set("FilterMarkers", currentView.getFilterString());
                    }
                    break;
                }
                this.model.trigger('change');
//                this.model.save();
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
                "keyup #LanguageVariant": "buildFullLanguageCode",
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
//                $(".topcoat-list__header").html(i18n.t("view.lblPossibleLanguages"));
            },

            onkeypressLanguageName: function (event) {
                this.$("#name-suggestions").show();
//                $(".topcoat-list__header").html(i18n.t("view.lblSearching"));
                if (event.keycode === 13) { // enter key pressed
                    event.preventDefault();
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
                            newValue = value.substr(0, value.indexOf("-x-") + 3) + $('#LanguageVariant').val().trim();
                        } else {
                            // add a new variant
                            newValue = value + "-x-" + $('#LanguageVariant').val().trim();
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
                    this.model.set('SourceFont', $('#font').val());
                    this.model.set('SourceFontSize', $('#FontSize').val());
                    this.model.set('SourceColor', $('#color').val());
                    break;
                case i18n.t('view.lblTargetFont'): // target font
                    this.model.set('TargetFont', $('#font').val());
                    this.model.set('TargetFontSize', $('#FontSize').val());
                    this.model.set('TargetColor', $('#color').val());
                    break;
                case i18n.t('view.lblNavFont'): // navigation font
                default:
                    this.model.set('NavigationFont', $('#font').val());
                    this.model.set('NavigationFontSize', $('#FontSize').val());
                    this.model.set('NavigationColor', $('#color').val());
                    break;
                }
                // display the project settings list
                $('#StepInstructions').show();
                $("#OKCancelButtons").hide();
                $('#WizardSteps').show();
                this.ShowStep(step);
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
                if (step < this.numSteps) {
                    step++;
                    this.ShowStep(step);
                } else {
                    // last step -- finish up
                    // save the model
                    this.model.trigger('change');
                    // head back to the home page
                    window.history.go(-1);
//                    window.Application.home();
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
                    this.model.set("SourceDir", ($('#RTL').is(':checked') === true) ? "rtl" : "ltr");
                    this.model.set("SourceVariant", $('#LanguageVariant').val().trim());
                    break;
                case 2: // target language
                    this.model.set("TargetLanguageName", currentView.langName);
                    this.model.set("TargetLanguageCode", currentView.langCode);
                    this.model.set("TargetVariant", $('#LanguageVariant').val().trim());
                    this.model.set("TargetDir", ($('#tRTL').is(':checked') === true) ? "rtl" : "ltr");
                    // also set the ID and name of the project, now that we (should) have both source and target defined
                    // TODO: do we need to add the variant to the ID and/or name?
//                    value = this.model.get("SourceLanguageCode") + "." + this.model.get("TargetLanguageCode");
                    value = Underscore.uniqueId();
                    this.model.set("id", value);
                    this.model.set("name", i18n.t("view.lblSourceToTargetAdaptations", {source: this.model.get("SourceLanguageName"), target: this.model.get("TargetLanguageName")}));
                    console.log("id: " + value);
                    break;
                case 3: // fonts
                    break;
                case 4: // punctuation
                    this.model.set("CopyPunctuation", ($('#CopyPunctuation').is(':checked') === true) ? "true" : "false");
                    this.model.set({PunctPairs: currentView.getRows()});
                    break;
                case 5: // cases
                    this.model.set("SourceHasUpperCase", ($('#SourceHasCases').is(':checked') === true) ? "true" : "false");
                    this.model.set("AutoCapitalization", ($('#AutoCapitalize').is(':checked') === true) ? "true" : "false");
                    this.model.set({CasePairs: currentView.getRows()});
                    break;
                case 6: // USFM filtering
                    this.model.set("CustomFilters", ($('#UseCustomFilters').is(':checked') === true) ? "true" : "false");
                    if (($('#UseCustomFilters').is(':checked') === true)) {
                        this.model.set("FilterMarkers", currentView.getFilterString());
                    }
                    break;
                }
            },

            OnNewProject: function () {
                // create a new project model object
                //this.openDB();
                this.numSteps = 6;
                languages = new langs.LanguageCollection();
                USFMMarkers = new usfm.MarkerCollection();
                USFMMarkers.fetch({reset: true, data: {name: ""}}); // return all results
            },

            ShowStep: function (number) {
                // clear out the old view (if any)
                currentView = null;
                var newWidth = "width:" + (100 / this.numSteps * number) + "%;";
                this.$("#progress").attr("style", newWidth);
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
