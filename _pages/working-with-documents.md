---
permalink: /working-with-documents/
layout: page
title:  Working with documents
desc:   How to import and export documents.
date:   2017-01-03 12:21
---

* [Supported file types](#supported-file-types)
* [Importing a document](#importing-a-document)
* [Importing text from the clipboard](#importing-from-clipboard)
* [Opening a document from another app](#opening-a-document)
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
- Lexical Interchange (.LIFT) format

----

<a id="importing-a-document"></a>

## Importing a document 

Complete the following steps to import documents into Adapt It Mobile.

1. Make sure your mobile device can access the files you want to import. You can either copy the files to your mobile device, or use a cloud service such as Google Drive or iCloud.
2. Open Adapt It Mobile on your device. If you haven't already, [create]({{ site.baseurl }}/Working-with-projects#creating-a-project) or [copy]({{ site.baseurl }}/Working-with-projects#copying-a-project) a project to manage the translation work you'll be doing.
3. On the main screen, you should see a list of available tasks for your translation project. The second item should be "Import":

    ![Import]({{ site.baseurl }}/assets/img/import.png)
    
  Click the Import button to display the import document screen. 

4. Tap on the Select File button to select a file:

    ![Select File]({{ site.baseurl }}/assets/img/import-file.png)

   Adapt It Mobile will display the file chooser dialog.
   
7. Navigate to and select the document you would like to import. Adapt It Mobile will attempt to import the file.

8. When Adapt It Mobile finishes importing, it will return the status of the import (either success or failure). If you are importing a document, you can either accept the name that it has suggested or specify another name for the document:

    ![Specify name for the imported document]({{ site.baseurl }}/assets/img/import-name.png)

9. Click the OK button to return to the home page.

----

<a id="importing-from-clipboard"></a>

## Importing text from the clipboard

Adapt It Mobile can also import text from the clipboard as a document. This can be useful if you need to translate a smaller portion of unformatted text, or if you have [formatted text](#supported-file-types) in another program that you want to just copy in via the clipboard. 

Complete the following steps to import text from the clipboard.

1. Open Adapt It Mobile on your device. If you haven't already, [create]({{ site.baseurl }}/Working-with-projects#creating-a-project) or [copy]({{ site.baseurl }}/Working-with-projects#copying-a-project) a project to manage the translation work you'll be doing.
2. On the main screen, you should see a list of available tasks for your translation project. The second item should be "Import":

    ![Import]({{ site.baseurl }}/assets/img/import.png)
    
  Click the Import button to display the import document screen. 

3. Tap on the Import Clipboard Text button to copy from the clipboard:

    ![Select File]({{ site.baseurl }}/assets/img/import-clipboard.png)

   If necessary, Adapt It Mobile will ask you for permission to copy text from the clipboard. Tap the Allow button to allow Adapt It Mobile to copy from the clipboard.

5. When Adapt It Mobile finishes importing, it will return the status of the import (either success or failure). If you are importing a document, you can either accept the name that it has suggested or specify another name for the document:

    ![Specify name for the imported document]({{ site.baseurl }}/assets/img/import-name.png)

6. Click the OK button to return to the home page.

----

<a id="opening-a-document"></a>

## Opening a document from another app

When you install Adapt It Mobile, it registers itself on your mobile device that can edit any document of the [supported file types](#supported-file-types). You can use the Share functionality on your device to share the document with Adapt It Mobile. To so this, complete the following steps:

1. Select the document you would like to share with / import into Adapt It Mobile. This must be a document file type that is supported by Adapt It Mobile.
2. Locate and press the Share button in your app. The share button will look different depending on the app and platform you are using ( [refer to this Wikipedia article for example icons](#https://en.wikipedia.org/wiki/Share_icon) ). Your mobile device should bring up a "share panel," allowing you to select the app to share the document with. Here's an example of a share panel on an iOS device:

   ![iOS share panel]({{ site.baseurl }}/assets/img/share-panel.png)
3. Select Adapt It Mobile from the share panel. Adapt It Mobile will launch if needed, and import the selected document into the current project. 

   ***Note:*** If you do not see the Adapt It Mobile icon in the share panel, verify that the selected document is one of the supported file types](#supported-file-types).
   
----

<a id="exporting-a-document"></a>

## Exporting a document 

1. On the main Adapt It Mobile screen, click Export Document.

   ![Export button]({{ site.baseurl }}/assets/img/export.png)

   If you do not see an Export Document link, you might not have imported any documents. Follow the steps to [import a document](#importing-a-document) and [adapt a document]({{ site.baseurl }}/adapting).

2. Select where you would like to send the file:

   - If you want to copy the content of the document to another app on the mobile device, select Copy to Clipboard.

   ![Copy to Clipboard]({{ site.baseurl }}/assets/img/export-clipboard.png)
   
   - If you want to export the document as a file, select Export to File.

   ![Export to File]({{ site.baseurl }}/assets/img/export-file.png)

4. Select the document you would like to export. You can also select the Knowledge Base or Glossing Knowledge Base for export if they are not empty.

   ![Export select document]({{ site.baseurl }}/assets/img/export-sel-doc.png)
   
   __Gloss and Free Translation document export__
   
   If you have the "Show Gloss and Free Translation Modes" option checked in the Editor and User Interface Settings screen _and_ select a document, you will then be prompted to select either the translation, gloss, or free translation data to export from that document. Select the type of data you want to export to continue.

   ![Select data to export]({{ site.baseurl }}/assets/img/export-sel-data.png)

5. Select the format you would like to export the document to, depending on the type of data being exported. 

    __Translation document export__

   ![Export File format]({{ site.baseurl }}/assets/img//export-sel-fmt.png)
    
   Adapt It Mobile currently supports the following file formats for translated documents:

   - Adapt It desktop (.xml) (this includes the source and target text for the project)
   - [USFM](http://paratext.org/about/usfm) (.sfm)
   - [USX](https://app.thedigitalbiblelibrary.org/static/docs/usx/index.html) (.usx)
   - Plain text (.txt) with no formatting
    
     If you selected gloss or free translation data to export in the previous step, USFM is the only file format available.
   
    __Knowledge Base document export__
   
    If you selected the Knowledge Base for export, Adapt It Mobile will display options for the file format:
  
   ![KB Format]({{ site.baseurl }}/assets/img/export-kb-sel-fmt.png)

   - Adapt It desktop (.xml)
   - Translation Memory Exchange (.tmx)
   - Lexical Interchange (.LIFT)
   - \lx keyword data (.sfm)

    __Glossing Knowledge Base document export__
   
    If you selected the Glossing Knowledge Base for export, Adapt It Desktop (.xml) is the only file format available:
  
   ![KB Format]({{ site.baseurl }}/assets/img/export-gloss-kb-fmt.png)

6. Click OK to start the export process. Adapt It Mobile will convert the document to the specified format.

   - If you selected Copy to Clipboard, Adapt It Mobile will copy the document to the Clipboard.
   - If you selected Export to File, Adapt It Mobile will display the file chooser dialog. Here you can navigate to the directory where you want to export the file to, as well as specify a different name if desired.

7. When Adapt It Mobile finishes exporting, an OK button will display. Click the OK button to return to the home page.

