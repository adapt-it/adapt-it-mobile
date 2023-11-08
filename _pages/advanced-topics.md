---
permalink: /advanced-topics/
layout: page
title:  Advanced Topics
desc:   Get more out of Adapt It Mobile.
date:   2020-09-17 12:21
---

* [Changing the user interface language](#changing-ui-language)
* [Working with filtered text](#filtered-text)
* [Viewing and editing existing translations](#show-translations)
* [Working with the Knowledge Base]({{ site.baseurl }}/working-with-knowledge-base)
* [Searching for a specific translation](#search-for-translation)
* [Previewing the translation](#preview-mode)
* [Changing editor settings](#editor-settings)
* [Working with multiple projects]({{ site.baseurl }}/managing-projects)

----

<a id="changing-ui-language"></a>

## Changing the user interface language

Adapt It Mobile supports the following languages for its user interface:

- English
- French
- Portuguese
- Spanish
- Tok Pisin

By default, Adapt It Mobile will attempt to use the same user interface language as your device. If Adapt It Mobile doesn't support your device's language, it will fall back on English for its user interface. 

**To override this default behavior, complete the following steps:**

1. Open the User Interface language Settings in either of the following places:

  - In Adapt It Mobile's main screen, click on the globe icon in the lower left corner: 

  ![Adapt]({{ site.baseurl }}/assets/img/globe.png)
  
  - In the Project Settings, click on the General Settings (the first link). The User Interface Language controls are just below the Editor settings.

2. In the User Interface Language screen, click on the desired option.

  ![Adapt]({{ site.baseurl }}/assets/img/ui-language.png)

  - Click "Use the language specified on this device" to have Adapt It Mobile use the language specified on the device
  - Select a specific language to have Adapt It Mobile override the default settings and always use the language you specify.

3. Click on the OK button to save your changes and return to the main Adapt It Mobile screen. 

***Note on contributing***: If you are interested in localizing Adapt It Mobile's user interface to a language you know, we'd love to work with you! Send us an email at `developers at adapt-it dot org` and let's talk.

----

<a id="filtered-text"></a>

## Working with Filtered Text

USFM, one of the document formats supported by Adapt It Mobile, can contain both **text that needs translation** and **markup information about the text** (translation consultant notes, for example) that should not be translated. Adapt It Mobile *filters* -- or hides -- some of this markup text, so that the user can focus on translating the text. 

In Adapt It Mobile, filtered text is represented by a blue "funnel" icon next to the text being translated:

![Filtered Text icon](https://raw.githubusercontent.com/adapt-it/adapt-it-mobile/master/docs/filter.png)

### Viewing filtered text

To view the filtered text at a specific point in the adaptation, scroll the view to that point and click the Filtered Text icon. A screen similar to the following displays:

![filter window](https://user-images.githubusercontent.com/1458944/28687791-3dd3e208-72d5-11e7-9117-f8925db5d1b8.png)

This window has the following elements:

- A title line, with the current index and total number of usfm markers that are being filtered out in the display.
- The current marker being displayed
- The text associated with the filtered marker
- Informational text that states whether the filtered text can be made available for adaptation (text in *red* cannot be made available for adaptation; text in *green* can).
- If there is more than one filtered marker, there are also arrow keys that allow the user to go to the previous / next filtered marker.

To move to the previous / next filtered marker, click on the forward / back arrows:

![Multiple Filters]({{ site.baseurl }}/assets/img/f-multi.gif)

To close the filtered text window, click on either the X icon in the upper right corner of the window or in the darker area outside the window.

![Single Filters]({{ site.baseurl }}/assets/img/f-single.gif)

----

<a id="show-translations"></a>

## Viewing and Editing Existing Translations

The Show Translations screen allows you to view and edit the possible translations for a selected source phrase in the text. To display the Show Translations screen, complete the following steps:

1. In the adaptation screen, select the translated word or phrase. The selection needs to have text in both the source and target line.
2. Click the More Actions menu, and then click the Show Translations... menu command. The Show Translations screen will display:

  ![Show Translations]({{ site.baseurl }}/assets/img/Show_Translations.png)

### Show Translations screen layout

On the top portion of the Show Translations screen, Adapt It Mobile displays the current translation (source and target languages are also displayed). 

Below this section, Adapt It Mobile displays the list of available translations and their relative frequencies according to the Knowledge Base. List items in red have been deleted or hidden, and do not appear in the drop-down list when translating.

**Note** If you have imported a Knowledge Base - either from an Adapt It desktop project or from a .TMX file - the relative frequency might not match the number of times the translations appear in your imported documents. 

Click on a translation from the list of available translations to display the actions for that translation. For list items displayed in black, the following actions are available:

  ![Translation Actions]({{ site.baseurl }}/assets/img/st-actions.png)

  - **Use this translation** - Click this button to use the selected transation as the current translation.
  - **Edit translation** - Click this button to edit the spelling of the selected translation. Note that the old spelling of the translation will remain as a *deleted* item in the available translations list; if you wish to restore the old spelling as an option in the dropdown list during adaptation, you can click the Restore translation button (see below). 
  - **Find in documents...** - Click this button to find instances of the selected translation in the imported documents. Adapt It Mobile will display the result counts for each chapter on the Show Translations page; to view individual instances, click on an item in the search results list and Adapt It Mobile will load the selected chapter and show the [search results](#search-for-translation) for that translation. 
  - **Remove translation** - click this button to remove this translation from the dropdown list while adapting. 

For items in red -- that have been deleted or hidden -- the following action is available:

  - **Restore translation** - Click this button to restore the translation, so that it appears in the drop-down list while adapting.

----

<a id="search-for-translation"></a>

## Search for a Specific Translation

Adapt It Mobile supports searching for a specific translation within the documents you've imported into your translation project. To do this, complete the following steps:

1. In the adaptation screen, select the translated word or phrase you would like to search for. The selection needs to have text in both the source and target line.
2. Click the More Actions menu, and then click the Find in Documents... menu command.

  ![More actions menu]({{ site.baseurl }}/assets/img/menu-130.png)

   Adapt It Mobile will search for the selected translation, and then display a search bar just below the toolbar that contains the results of the search:
   
  ![Search Bar]({{ site.baseurl }}/assets/img/search-bar.png)
   
  The search bar contains the following elements:
  
  - The source and target phrase being searched for
  - The number of search results within the imported documents, and the current index within that number
  - Previous and Next buttons that will display and select the previous and next search results, respectively. Note that the search results could span several books or chapters -- Adapt It Mobile will load the book/chapter as needed.
  - A Close button [ X ] that closes the search bar and clears the current search.

----

<a id="preview-mode"></a>

## Previewing the Translation

As you translate the text, you might want to read through the draft to verify its accuracy and ease of comprehension in the target language. Adapt It Mobile allows you to do this easily with Preview Mode. In Preview Mode, all markers, filters, and source text are hidden, so that only the target language translation is visible.

- To enable Preview mode, click on the More Actions button in the top right of the screen, and then click on the Show Preview menu command.
  
  ![More actions menu]({{ site.baseurl }}/assets/img/menu-130.png)

- To disable Preview mode, click on the More Actions button in the top right of the screen, and then click on the Hide Preview menu command.

----

<a id="editor-settings"></a>

## Changing Editor Settings

Currently Adapt It Mobile has the following editor settings that can be modified:

- Copy Source _(default = checked)_
  
  When checked, Adapt It Mobile will automatically copy the source into the target field if an entry cannot be found in the Knowledge Base for the current source. Uncheck this box if you would like the target edit field to remain empty if no KB entry can be found for the source.

- Wrap at Standard Format Markers _(default = checked)_
  
  When checked, Adapt It Mobile will cause the UI to display the word or phrase *following* text with USFM markers on a new line. Uncheck this box if you would like the the next phrase to appear just after text with USFM, for a more compact display.

- Stop Selection at Boundaries _(default = checked)_

  When checked, Adapt It Mobile will only allow the user to select up to the end of a phrase boundary (for example, all the words up to a punctuation mark). Uncheck this box if you would like to select more sections of text at once.
  
- Allow editing of Blank Source Phrases _(Since: 1.6.0 / Default = unchecked)_

  By default, Adapt It Mobile will not allow you to add a target translation for a verse with no source text. Check this box if you would like to add translations for blank verses; however, any translations added will be erased if you import the same chapter and include source text for these verses.

- Show Gloss and Free Translation Modes _(Since: 1.9.0 / Default = unchecked)_

  By default, Adapt It Mobile will not display the gloss and free translation lines in the adaptation editor. When this box is checked, the gloss and free translation lines are displayed in the editor, and you can select the Gloss and Free Translation editor modes from the More Actions (...) dropdown menu. 
  Check this box if you would like to display the gloss and free translation lines, as well as select the gloss and free translation editor modes from the More Actions (...) dropdown menu.
  
- Default Free Translation Text _(Since: 1.9.0 / default = Use Gloss Text)_

  This editor settings group is only displayed when the user has the Show Gloss and Free Translation Modes setting checked (above). When the user is in the Free Translation editor mode, Adapt It Mobile will take text from either the gloss or target line and use them as a default when moving to a text space that hasn't been filled out (the user can delete this default text and write another translation if desired). Select the Use Gloss Text option if you would like the gloss line to be used as a default in the free translation text field; select the Use Target Text option if you would like the target text line to be used as a default in the free translation text field.
  

