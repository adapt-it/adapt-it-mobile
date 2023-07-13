---
permalink: /working-with-documents/
layout: page
title:  Working with documents
desc:   How to import and export documents.
date:   2017-01-03 12:21
---

* [Supported file types](#supported-file-types)
* [Opening a document from another app](#opening-a-document)
* [Importing a document](#importing-a-document)
* [Exporting a document](#exporting-a-document)

----

<a id="supported-file-types"></a>

## Supported file types

Adapt It Mobile currently supports the following document formats for opening, import, and export:

- Adapt It desktop (.xml) document
- USFM
- USX
- Plain text (.txt)
  
In addition, Adapt It Mobile can also import and export Knowledge Base / translation memory file data:

- Adapt It desktop (.xml) Knowledge Base
- Translation Memory eXchange (.TMX) format
- Key term documents in SFM format

----

<a id="opening-a-document"></a>

## Opening a document

When you install Adapt It Mobile, it registers itself on your mobile device that can edit any document of the [supported file types](#supported-file-types). You can use the Share functionality on your device to share the document with Adapt It Mobile. To so this, complete the following steps:

1. Select the document you would like to share with / import into Adapt It Mobile. This must be a document file type that is supported by Adapt It Mobile.
2. Locate and press the Share button in your app. The share button will look different depending on the app and platform you are using ( [refer to this Wikipedia article for example icons](#https://en.wikipedia.org/wiki/Share_icon) ). Your mobile device should bring up a "share panel," allowing you to select the app to share the document with. Here's an example of a share panel on an iOS device:

   ![iOS share panel]({{ site.baseurl }}/assets/img/share-panel.png)
3. Select Adapt It Mobile from the share panel. Adapt It Mobile will launch if needed, and import the selected document into the current project. 

   ***Note:*** If you do not see the Adapt It Mobile icon in the share panel, verify that the selected document is one of the supported file types](#supported-file-types).
   
----

<a id="importing-a-document"></a>

## Importing a document 

Complete the following steps to import documents into Adapt It Mobile.

1. Copy the files to your mobile device. These files must be placed in the appropriate documents directory for Adapt It Mobile to see them:
  - On iOS, you must use the [Finder on your Mac](#https://support.apple.com/en-us/HT210598) (macOS Catalina or later), or [iTunes File Sharing](#https://support.apple.com/en-us/HT201301) (Mojave or earlier) to copy files to Adapt It Mobile's documents directory.
  - On Android, you can use a utility such as Android File Transfer to copy the documents into one of the following directories:
    
    - `/data/Android/org.adaptit.adaptitmobile/files`
    - `/sdcard/data/Android/org.adaptit.adaptitmobile/files`
    
  ***TIP:*** You can also use your device's Cut / Copy functionality to place snippets of text on the Clipboard -- Adapt It Mobile will recognize that there is text on the clipboard and will add an entry to the list of available documents (see step 4 below).

2. Open Adapt It Mobile on your device. If you haven't already, [create]({{ site.baseurl }}/Working-with-projects#creating-a-project) or [copy]({{ site.baseurl }}/Working-with-projects#copying-a-project) a project to manage the translation work you'll be doing.
3. On the main screen, you should see a list of available tasks for your translation project. The second item should be "Import":

    ![Import]({{ site.baseurl }}/assets/img/import.png)
    
4. Click the Import button to display the import document screen. Here Adapt It Mobile will automatically scan your mobile device, displaying any documents that Adapt It Mobile can import. If there is text on your device's clipboard, Adapt It Mobile will add an entry titled "Clipboard text...". 
  
    ***Note:*** If you see a warning message instead of a list of available documents, Adapt It Mobile has not found any documents on your device that it can import. If this is the case, copy the files to your mobile device using one of the methods in step 1 and retry this operation.
    
5. Select the document you would like to import. 

    ![Select documents and Import]({{ site.baseurl }}/assets/img/import-docs.png)

    Adapt It Mobile will import the document.

6. When Adapt It Mobile finishes importing, it will prompt you to enter a name for the imported text (or clipboard snippet). You can either accept the name that it has suggested, or specify another name for the document.

    ![Specify name for the imported document]({{ site.baseurl }}/assets/img/import-name.png)

7. Click the OK button to return to the home page.

----

<a id="exporting-a-document"></a>

## Exporting a document 

1. On the main Adapt It Mobile screen, click Export Document.

   ![Export button]({{ site.baseurl }}/assets/img/export.png)

   If you do not see an Export Document link, you might not have imported any documents. Follow the steps to [import a document](#importing-a-document) and [adapt a document]({{ site.baseurl }}/adapting).

2. Select where you would like to send the file:

   - If you want to copy the content of the document to another app on the mobile device, select Copy to Clipboard.
   - If you want to export the document to a file and optionally send it to another device (via email or Bluetooth, for example), select Export to File.

3. Select the document you would like to export. You can also select the Knowledge Base for export if desired.

   ![Export select document]({{ site.baseurl }}/assets/img/export-sel-doc.png)
   
   __Gloss and Free Translation document export__
   
   If you have the "Show Gloss and Free Translation Modes" option checked in the Editor and User Interface Settings screen _and_ select a document, you will then be prompted to select either the translation, gloss, or free translation data to export from that document. Select the type of data you want to export to continue.

4. Select the format you would like to export the document to, and the filename to export to (if you selected Export to File). 

   ![Export File format]({{ site.baseurl }}/assets/img//export-sel-fmt.png)

    __Translation document export__
    
   Adapt It Mobile currently supports the following file formats for translated documents:

   - Adapt It desktop (.xml) (this includes the source and target text for the project)
   - [USFM](http://paratext.org/about/usfm) (.sfm)
   - [USX](https://app.thedigitalbiblelibrary.org/static/docs/usx/index.html) (.usx)
   - Plain text (.txt) with no formatting
  
    __Gloss and Free Translation document export__
  
     If you selected gloss or free translation data to export in the previous step, USFM is the only file format available. You can keep the default file name for export, or specify a different file name.
   
    __Knowledge Base document export__
   
    If you selected the Knowledge Base for export, Adapt It Mobile will display two options for the file format:
  
   ![KB Format]({{ site.baseurl }}/assets/img//export-kb-sel-fmt.png)

   - Adapt It desktop (.xml) (you cannot modify the file name for this file, as it includes the source and target language info for the project)
   - Translation Memory Exchange (.tmx)

5. Click OK to start the export process. Adapt It Mobile will convert the document to the specified format.

   - If you selected Copy to Clipboard, Adapt It Mobile will copy the document to the Clipboard.
   - If you selected Export to File, Adapt It Mobile will export a copy of the document to the local device (see [Exported File Location](#exported-file-location) for details on where these files are stored). Adapt It Mobile will then display a file sharing popup, to allow you to export the file via one of a number of options. Several outputs are supported, including:
    
    - SMS (text messaging)
    - email
    - WhatsApp
    - Bluetooth (Android)
    - AirDrop (iOS)
    
   Note that these export options require you to configure them before exporting (for example, you need to turn Bluetooth on and pair with a computer before attempting to export).

6. When Adapt It Mobile finishes exporting, an OK button will display. Click the OK button to return to the home page.

---

<a id="exported-file-location"></a>

#### Exported File location
When you Export a document to a file, Adapt It Mobile saves a copy on the local mobile device:

- For iOS, documents are saved in the Documents folder for Adapt It Mobile. You can use the [Apple File Sharing](https://support.apple.com/en-us/HT201301) feature to transfer these files to your computer for forther processing.
- For Android, documents are stored on the SD card (if available) or the Internal Storage -- in a directory labeled `AIM_Exports_<language code>`, where `<language code>` is the RFC 5646 language code of the *target language*. These files can be copied over to your computer using the [Android File Transfer utility](https://www.android.com/filetransfer/).
