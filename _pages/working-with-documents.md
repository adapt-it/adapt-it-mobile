---
permalink: /working-with-documents/
layout: page
title:  Working with documents
desc:   How to import and export documents.
date:   2017-01-03 12:21
---

* [Importing a document](#importing-a-project)
* [Exporting a project](#exporting-a-project)

----

<a id="importing-a-document"></a>
## Importing a document 

Complete the following steps to import documents into Adapt It Mobile.

1. [Copy the files to your mobile device](/getstarted#copy-documents-to-device), if you haven't already done so.
2. Open Adapt It Mobile on your device. If you haven't already, [create](/Working-with-projects#creating-a-project) or [copy](/Working-with-projects#copying-a-project) a project to manage the translation work you'll be doing.
3. On the main screen, you should see a list of available tasks for your translation project. The second item should be "Import":

    ![Import Documents](/assets/img/import.png)
4. Click the Import Documents button to display the import document screen. Here Adapt It Mobile will automatically scan your mobile device, displaying any documents that Adapt It Mobile can import.

    ***Note:*** If you see a warning message instead of a list of available documents, Adapt It Mobile has not found any documents on your device. If this is the case, [copy the files to your mobile device](/getstarted#copy-project-to-device) and retry this operation.
5. Select the document you would like to import. 

    ![Select documents and Import](/assets/img/import-docs.png)

    When Adapt It Mobile finishes importing, an OK button will display.
6. Click the OK button to return to the home page.

----

<a id="exporting-a-document"></a>
## Exporting a document 

1. On the main Adapt It Mobile screen, click Export Document.

  ![Adapt](/assets/img/export.png)

  If you do not see an Export Document link, you might not have imported any documents. Follow the steps to [import a document](Importing-a-document) and [adapt a document](Adapting-from-where-you-left-off).

2. Select the document you would like to export.

  ![Adapt](/assets/img/export-sel-doc.png)

3. Select the format you would like to export the document to, and the filename to export to. 

  ![Adapt](/assets/img//export-sel-fmt.png)

  Adapt It Mobile currently supports the following file formats:

  - Adapt It desktop (.xml) (this includes the source and target text for the project)
  - [USFM](http://paratext.org/about/usfm) (.sfm)
  - [USX](https://app.thedigitalbiblelibrary.org/static/docs/usx/index.html) (.usx)
  - Plain text (.txt) with no formatting

4. Click OK to start the export process. Adapt It Mobile will start to export the document to the local device.

  - For iOS, documents are saved in the Documents folder for Adapt It Mobile. Use the [iTunes Sharing](https://support.apple.com/en-us/HT201301) feature to transfer these files to your computer for forther processing.
  - For Android, documents are stored on the SD card (if available) or the Internal Storage -- in a directory labeled `AIM_Exports_<language code>`, where `<language code>` is the RFC 5646 language code of the *target language*. These files can be copied over to your computer using the [Android File Transfer utility](https://www.android.com/filetransfer/).

5. When Adapt It Mobile finishes exporting, an OK button will display. Click the OK button to return to the home page.
