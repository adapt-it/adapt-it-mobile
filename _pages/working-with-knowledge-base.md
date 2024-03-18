---
permalink: /working-with-knowledge-base/
layout: page
title:  Working with the Knowledge Base
desc:   How to manage the available translations in your project.
date:   2023-11-08 12:21
---

The translations you create in Adapt It Mobile are stored in a **knowledge base**, also known as a translation memory. The knowledge base contains words or phrases in the source language, and one or more translations in the target language. The next time you translate that word or phrase, Adapt It Mobile will suggest the previous translation -- you can either use that translation or type in a new one as appropriate.

In addition to the normal process of translating text, there are 3 oher ways to build up the knowledge base:

- You can [import data from a Rapid Word Collection workshop](#rwc-file)
- You can [import a key word (sfm) file](#keyword-file)
- You can [directly add translations using the knowledge base editor](#kb-editor)

The following sections describe these methods in more detail.

<a id="rwc-file"></a>

## Importing data from a Rapid Word Collection workshop

The [Rapid Word Collection](https://rapidwords.net) method was developed to help translation teams quickly collect words for language documentation and translation. Using a set of prompts in a workshop setting, attendees can build up a lexicon of 10,000 words in a matter of weeks.

If your translation team has gone through the RWC process, you can export the collected data in LIFT format, and then [import the data into Adapt It Mobile]({{ site.baseurl }}/working-with-documents#importing-a-document). The Knowledge Base will then be pre-filled with entries that can be used to translate literacy materials, Scriptures, etc.

<a id="keyword-file"></a>

## Importing key words

If your language community has agreed upon translations for key terms (names of people or places, for example), you can create a text file that uses Standard Format Markup to list these terms using \lx and \ge markers. (See [this sample document](https://github.com/adapt-it/adapt-it-mobile/files/11757741/kb_key_terms.txt) for details. 

You can then [import the data into Adapt It Mobile]({{ site.baseurl }}/working-with-documents#importing-a-document), and the Knowledge Base will then be pre-filled with these entries.

<a id="kb-editor"></a>

## Using the Knowledge Base editor

The Knowledge Base Editor allows you to view the list of current translations, get information about a specific item in the Knowledge Base, search for a specific translation, and add a new translation -- even if the source word or phrase does not exist in the imported documents for the current project. 

To open the Knowledge Base editor, complete the following steps:

1. Open Adapt It Mobile on your device.

2. On the main screen, click the Settings button.

3. On the Settings screen, click the Knowledge Base button:

    ![Knowledge Base button]({{ site.baseurl }}/assets/img/KB.jpg)

  The Knowledge Base editor will appear:

* On the top portion of the editor, Adapt It Mobile displays the name of the current project, as well as the total number of entries in the Knowledge Base (each entry can have one or more translations).
* Below the project information, there is a search bar where you can [search the Knowledge Base](#kb-search) for specific items.
* Below the search bar, the Add Entry... button allows you to [create a new Knowledge Base item](#kb-new-tu)
* The lower portion of the screen displays the list of Knowledge Base items (this will be filtered if there is text in the search bar). Adapt It Mobile lists 100 items in the list at a time -- you can page through the listings using the forward and back buttons just above the list.
Each item in the list will display the source text, and if there is exactly one translation, its translation in the target language. If the entry has more than one translation, the number of translations will display. To get more details about an item, click on that item. See [Get details about an item in the knowledge base](#kb-view-tu).

----

<a id="kb-view-tu"></a>

## Get details about an item in the knowledge base

Complete the following steps to view or edit an item in the Knowledge Base.

1. [Open the Knowledge Base Editor](#kb-editor) on your device.

2. Click an entry in the Knowledge Base list. If no entries appear in the list, make sure the search bar has no text and that there is at least one entry in the Knowledge Base.

At the top of the screen, the entry's source language word/phrase appears in a darker grey box. Below that, the Add Translation... button appears:

![Add Translation button]({{ site.baseurl }}/assets/img/add-rs.jpg)

To add a translation for this source, click this button. At the prompt, enter the translation.

  - Click OK to add the specified translation to this source word / phrase.
  - Click Cancel to _not_ add the specified translation.

Below the Add Translation... button, Adapt It Mobile displays the list of translations defined for the selected source word/phrase. Click on a translation to display a list of actions for that translation:

  - To edit a translation, click the Edit translation button.
  - To Find where this translation is used in the project's documents, click the Find in Documents... button.
  - To hide the translation from being suggested when you translate, click the Remove translation button.

When you are done viewing / editing this entry, click on the Back button (<) in the toolbar on the top of the screen.

----

<a id="kb-search"></a>

## Search the Knowledge Base

Complete the following steps to search for items in the Knowledge Base.

1. [Open the Knowledge Base Editor](#kb-editor) on your device.

2. Click in the search bar and enter in text to search for. All items matching your search query will be displayed in the list in the lower portion of the Knowledge Base editor screen. If no items match your search criteria, the list will display "No entries found."

3. If more than one page of results match the search criteria, you can use the forward and back arrows to navigate between pages.

----

<a id="kb-new-tu"></a>

## Create a new Knowledge Base entry

To create a new Knowledge Base entry, complete the following steps.


1. [Open the Knowledge Base Editor](#kb-editor) on your device.

2. Click the Add Entry... button in the editor:

    ![Add Entry... button]({{ site.baseurl }}/assets/img/add-tu.jpg)

3. In the Add Entry screen, enter in a word or phrase in the source language edit field, and a translation (word or phrase) in the target language editor field. To add more translations, click on the Add Translation... button and follow the dialog prompt.

- Click the Done button to add the entry to the Knowledge Base and return to the Knowledge Base editor. 
- Click the Cancel button to discard the entry and return to the Knowledge Base editor.

