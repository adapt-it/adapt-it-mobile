---
permalink: /getstarted/
layout: page
title:  Getting started
desc:   How to download and use Adapt It Mobile.
date:   2017-01-03 12:21
---

Here you will find step-by-step instructions for setting up Adapt It Mobile on your device.

* [Before you install](#before-you-install)
  * [System requirements](#system-requirements)
  * [Copy documents to your device](#copy-documents-to-device)
  * [(Optional) Copy project to your device](#copy-project-to-device)
* [Installing](#installing-adapt-it-mobile)
* [Next Steps](#next-steps)

----

<a id="before-you-install"></a>

## Before you install 

<a id="system-requirements"></a>

### Make sure your mobile device meets the following system requirements: 

- Apple iPad, iPod or iPhone running iOS 8.x or later
- Android device running Android 4.0.x or later

<a id="copy-documents-to-device"></a>

### Copy any documents you will be adapting to your device. 

Adapt It Mobile can read text (.txt) files, as well as files from Paratext, Bibledit (.usfm, .usx, .sfm) and Adapt It desktop (.xml). If you have a use case for some other format that you would like us to support, please use the issue tracker to create a [New issue](https://github.com/adapt-it/adapt-it-mobile/issues/new), and we will consider it for a future release.

To copy files to your device, you can use one of the following methods:

- On Android devices, you can copy files from your desktop computer to Google Drive, and then download them using the Google Drive app for Android.
- On Android devices, you can also directly transfer files to your device using one of the following programs:

  - [Android File Transfer](https://www.android.com/intl/en_us/filetransfer/) 
  - [Superbeam](https://play.google.com/store/apps/details?id=com.majedev.superbeam&hl=en)
  - [ES File Explorer](https://play.google.com/store/apps/details?id=com.estrongs.android.pop&hl=en)

  **NOTE: document and project files MUST be copied to the Documents or Downloads directories, or a subdirectory of these directories.**

- On Apple devices, you can use the [Apple File Sharing](https://support.apple.com/en-us/HT201301) capability to directly transfer files to your device.

---
**Tip:** If you are looking for a test file to import, you can download one of the following:

- *USFM:* Spanish / Reina-Valera Moderna - [James.usfm](https://raw.githubusercontent.com/pasosdeJesus/biblia_dp/master/ref/reina_valera_moderna_nt/59_James.usfm)
- *USX:* Any of the [public domain entries on the Digital Bible Library](http://app.thedigitalbiblelibrary.org/entries/public_domain_entries)

---

<a id="copy-project-to-device"></a>

### (optional) Copy the Adapt It desktop project file to your device. 

If you have already created an adaptation project in Adapt It desktop with the same source and target languages you will be using for your adaptation, you can copy the project file from your computer to your mobile device and use it in Adapt It Mobile. The project file is named `AI-ProjectConfiguration.aic` and will be located under the directory:

    Adapt It Unicode Work / <project name> / AI-ProjectConfiguration.aic

Use the same method described above to copy the files to your computer. Also note that only project files created using the Unicode version of Adapt It desktop can be copied over; the older Ansi / "regular" version is not supported.

----

<a id="installing-adapt-it-mobile"></a>

## Installing Adapt It Mobile 

### Android
_Note: For the pre-release version of Adapt It Mobile, we are using the PhoneGap Build service to host our builds. We are planning on placing the release version in the Google Play app store._

1. On your Android device, open up the System Settings > Security section, and verify that "Unknown Sources / allow installation of apps from sources other than Google Play store" is selected. 
2. Using your mobile device's web browser, navigate to [https://build.phonegap.com/apps/713362/share](https://build.phonegap.com/apps/713362/share).
3. Under the Android section, click on the Download button to download the Adapt It Mobile app to your device.
4. Once the app has downloaded, click on the file in the list. You will be asked if you want to install Adapt It Mobile. Click the Install button. 

### iOS
For the pre-release version of Adapt It Mobile on iOS, we are using Apple's [Test Flight App](https://itunes.apple.com/us/app/testflight/id899247664?mt=8) to facilitate testing. Send us an email at `developers at adapt-it dot org` to be added to the pre-release test group.

----

<a id="next-steps"></a>

# Next steps 

Now that you have installed Adapt It Mobile, you'll want to take a look at our step-by-step instructions on how to use the app.

## Working with Projects

* [Creating a new project]({{ site.baseurl }}/working-with-projects#creating-a-project)
* [Copying a project]({{ site.baseurl }}/working-with-projects#copying-a-project)
* [Editing a project]({{ site.baseurl }}/working-with-projects#editing-a-project)

## Working with Documents

* [Importing a document]({{ site.baseurl }}/working-with-documents#importing-a-document)
* [Exporting a document]({{ site.baseurl }}/working-with-documents#exporting-a-Document)

## Adapting

* [Searching for a document of chapter to adapt]({{ site.baseurl }}/adapting#search-page)
* [Adapting from where you left off]({{ site.baseurl }}/adapting#adapting-from-where-you-left-off)
* [Adapting basics]({{ site.baseurl }}/adapting#adapting-basics)
* [Inserting a placeholder]({{ site.baseurl }}/adapting#inserting-a-placeholder)
* [Inserting a retranslation]({{ site.baseurl }}/adapting#inserting-a-retranslation)

## Advanced topics

* [Changing the user interface language]({{ site.baseurl }}/advanced-topics#changing-ui-language)
* [Working with Filtered Text]({{ site.baseurl }}/advanced-topics#filtered-text)

## Troubleshooting

Having issues with Adapt It Mobile? Take a look at our [support]({{ site.baseurl }}/support) page for possible solutions, or for information on how to get in contact with us.
