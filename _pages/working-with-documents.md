---
permalink: /working-with-documents/
layout: page
title:  Working with documents
desc:   How to import and export documents.
date:   2017-01-03 12:21
---

* [Importing a document](#importing-a-document)
* [Exporting a document](#exporting-a-document)

----

<a id="importing-a-document"></a>

## Importing a document 

Complete the following steps to import documents into Adapt It Mobile.

1. [Copy the files to your mobile device]({{ site.baseurl }}/getstarted#copy-documents-to-device), if you haven't already done so. You can also use your device's Cut / Copy functionality to place snippets of text on the Clipboard -- Adapt It Mobile will recognize that there is text on the clipboard and will add an entry to the list of available documents (see step 4 below).
2. Open Adapt It Mobile on your device. If you haven't already, [create]({{ site.baseurl }}/Working-with-projects#creating-a-project) or [copy]({{ site.baseurl }}/Working-with-projects#copying-a-project) a project to manage the translation work you'll be doing.
3. On the main screen, you should see a list of available tasks for your translation project. The second item should be "Import":

    ![Import Documents]({{ site.baseurl }}/assets/img/import.png)
4. Click the Import Documents button to display the import document screen. Here Adapt It Mobile will automatically scan your mobile device, displaying any documents that Adapt It Mobile can import. If there is text on your device's clipboard, Adapt It Mobile will add an entry titled "Clipboard text..."

  Adapt It Mobile currently supports the following document formats:

  - Adapt It desktop (.xml) document
  - USFM
  - USX
  - Plain text (.txt)
  
  In addition, Adapt It Mobile can also import Knowledge Base / translation memory file data:
  
  - Adapt It desktop (.xml) Knowledge Base
  - Translation Memory eXchange (.TMX) format
  
    ***Note:*** If you see a warning message instead of a list of available documents, Adapt It Mobile has not found any documents on your device that it can import. If this is the case, [copy the files to your mobile device]({{ site.baseurl }}/getstarted#copy-project-to-device) and retry this operation.
5. Select the document you would like to import. 

    ![Select documents and Import]({{ site.baseurl }}/assets/img/import-docs.png)

    When Adapt It Mobile finishes importing, an OK button will display.
6. Click the OK button to return to the home page.

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

4. Select the format you would like to export the document to, and the filename to export to (if you selected Export to File). 

  ![Export File format]({{ site.baseurl }}/assets/img//export-sel-fmt.png)

  Adapt It Mobile currently supports the following file formats:

  - Adapt It desktop (.xml) (this includes the source and target text for the project)
  - [USFM](http://paratext.org/about/usfm) (.sfm)
  - [USX](https://app.thedigitalbiblelibrary.org/static/docs/usx/index.html) (.usx)
  - Plain text (.txt) with no formatting
  
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
    
   Note that these export options require you to configure them before exporting (for example, you need to turn Bluetooth on and pair with a computer before attempting to export)

6. When Adapt It Mobile finishes exporting, an OK button will display. Click the OK button to return to the home page.

---

<a id="exported-file-location"></a>

#### Exported File location
When you Export a document to a file, Adapt It Mobile saves a copy on the local mobile device:

- For iOS, documents are saved in the Documents folder for Adapt It Mobile. You can use the [Apple File Sharing](https://support.apple.com/en-us/HT201301) feature to transfer these files to your computer for forther processing.
- For Android, documents are stored on the SD card (if available) or the Internal Storage -- in a directory labeled `AIM_Exports_<language code>`, where `<language code>` is the RFC 5646 language code of the *target language*. These files can be copied over to your computer using the [Android File Transfer utility](https://www.android.com/filetransfer/).
