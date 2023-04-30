---
permalink: /free-translation/
layout: page
title:  Free Translation
desc:   Using Adapt It Mobile's free translation editor.
date:   2023-04-05 12:21
---

A *free translation* is an idiomatic translation of an adapted target text, usually created later in the translation cycle to verify a translation's accuracy. Using both a free translation and a more literal *back translation* (a translation from the target language back to the original text), a translation consultant can check the translation's accuracy and identify areas that need improvement.

This section gives step-by-step instructions on how to use the free translation editor in Adapt It Mobile.

* [Enabling gloss and free translation modes](#edit-view-gloss-ft)
* [Switching editor modes](#switch-editor-modes)
* [Free translation mode](#free-translation-mode)
* [Free translation toolbar](#free-translation-toolbar)

----

<a id="edit-view-gloss-ft"></a>

## Enabling gloss and free translation modes 

Complete the following steps to view and edit glosses and free translations in Adapt It Mobile.

1. Make sure you have followed the steps to [Create](https://github.com/adapt-it/adapt-it-mobile/wiki/Creating-a-new-project) or [Copy](https://github.com/adapt-it/adapt-it-mobile/wiki/Copying-a-project) a project, and have [imported some documents](https://github.com/adapt-it/adapt-it-mobile/wiki/Importing-a-document) into Adapt It Mobile.
2. Start Adapt It Mobile. On the main screen, you should see a list of available actions.
3. Click on the Settings button:

    ![Settings button]({{ site.baseurl }}/assets/img/Settings.png)

4. On the settings screen, click on the Editor and User Interface button:

    ![Editor and User Interface button]({{ site.baseurl }}/assets/img/editor-ui.png)

5. On the Editor and User Interface screen, select the Show Gloss and Free Translation Modes checkbox in the Editor group:

    ![Show Gloss and Free Translation Modes checkbox]({{ site.baseurl }}/assets/img/show-gloss-ft.png)
    
6. (Optional) In the Default Free Translation Text group, specify whether to use gloss text or target text to populate the free translation text field when editing.
    Notes:
    - This only specifies the default text that will populate the free translation edit field if the field is blank for a word or phrase.
    - Because Adapt It Mobile is populating the free translation field from the target or gloss data, the initial translation from source to target (or gloss) should be complete before working in free translation mode.
    
7. Click on the OK button to save your changes.


----

<a id="switch-editor-mode"></a>

## Switching editor modes

Once you have enabled viewing / editing glosses and free translations in your project, you can switch between the three editor modes (adapting, glossing, and free translation). Complete the following steps to switch between editor modes.

1. Make sure you have followed the steps to [Create](https://github.com/adapt-it/adapt-it-mobile/wiki/Creating-a-new-project) or [Copy](https://github.com/adapt-it/adapt-it-mobile/wiki/Copying-a-project) a project, and have [imported some documents](https://github.com/adapt-it/adapt-it-mobile/wiki/Importing-a-document) into Adapt It Mobile.
2. Start Adapt It Mobile. From the main screen, you should see a list of available actions. 

    If you **only** see a Settings and Import Documents button in this list, verify that you have [imported some documents](https://github.com/adapt-it/adapt-it-mobile/wiki/Importing-a-document) into Adapt It Mobile. 
3. The last action should be the name of a chapter or book that you have imported into the project:

    ![Adapt]({{ site.baseurl }}/assets/img/Adapt.png)

    If this is your first time opening the project actions after importing documents, this will be the first chapter of the first document you imported (or the first document, if this was a text file). Otherwise, it will be the document and chapter you last adapted. Click on this link to open that chapter and start adapting.
    
4. In the adaptation editor, click on the More Actions menu button on the top right side of the screen. The More Actions dropdown menu will display:

    ![More Actions menu]({{ site.baseurl }}/assets/img/more-actions-menu.png)

5. Select the desired editor mode:

  - Adapting - to adapt the source text into the target language
  - [Glossing](#edit-view-gloss-ft) - to add a gloss in a third language
  - Free Translation - to add an idiomatic translation of the source text
      
----

<a id="free-translation-mode"></a>

## Free translation editor mode 

The free translation editor consists of the following:

### Free Translation toolbar

For more information, see [Free translation toolbar](#free-translation-toolbar).

### Free translation text area

The free translation text area is where you enter the idiomatic translation of the current selection. If there is not currently a free translation of the current selection, Adapt It Mobile will suggest either the gloss or target text, based on the [Editor and User Interface setting](#edit-view-gloss-ft).

### Selection area

The current translation (source, target, and gloss lines) are displayed in the area below the free translation text area, with the selected words and phrases -- highlighted in blue -- that correspond to the free translation.

### Mobile and desktop differences

Adapt It Mobile's free translation editor is similar to the desktop version of Adapt It, with the following differences:

- Adapt It Mobile does not extend the selection beyond punctuation boundaries.
- There is no "adjust selection" feature in Adapt It Mobile; instead, the user can expand or shrink the selection.

## Selecting text to translate

There are several ways to select text in the free translation editor:

- Use the Next and Previous buttons
To move to the previous and next phrase (selecting the entire phrase), click on the Previous [ <- ] and Next [ -> ] buttons, respectively.

- Drag to select
To select a specific phrase you want to translate, drag over the words that make up that phrase. You should see the words highlight in blue as you do so.

- Double-tap
To select the entire strip of text, tap twice quickly on a source word within that strip. You should see the entire strip of text highlight.

- Tap and hold
To select a specific phrase you want to translate, you can tap and hold the starting word of the selection. After a couple seconds, the color of the selection will change and you'll hear an audible chime. Now tap on the last word in the phrase you want to select.

- Expand and shrink the selection
Click on the Expand selection button to add one word to the end of the selection, up to the next punctuation.
Click on the Shrink selection button to shrink the end of the selection by one word. The minimum selection size is one word.

Once you have selected the words you want to create a free translation for, tap in the free translation edit field to bring it into focus. Type in the equivalent phrase in the target language.

## To move to the next / previous edit field

Click on the Next [ <- ] and Previous [ -> ] buttons, that allow you to go to the previous and next untranslated fields, respectively.

----

<a id="free-translation-toolbar"></a>

## Free translation toolbar

Unlike the adaptation editor mode, the user cannot insert / remove placeholders, retranslations, or phrases while glossing. However, the following toolbar buttons are available when in free translation mode:

    ![Free translation toolbar]({{ site.baseurl }}/assets/img/ft-toolbar.png)

### Expand selection

Click this button to expand the end of the selected text by one word. You can expand the selection up to the phrase boundary (i.e., the next punctuation or verse).

### Shrink selection

Click this button to shrink the selected text by one word. You can shrink the selection down to one word.

### Clear free translation edit field

Click the "trash can" button to clear / remove the current text in the free translation edit field. You can then leave this selection blank or type in a new free translation for the selected words.

The following toolbar buttons are also displayed in each editor mode (adapting, glossing, and free translation):

- Undo
- Move backwards
- Move forwards
