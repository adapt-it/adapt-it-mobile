---
layout: post
title:  Public Beta 12
categories: News
---

## Release 1.0 beta 12 available for download

We are pleased to announce the latest public beta for Adapt It Mobile 1.0.

This beta release fixes several issues found during testing, focusing on RTL text rendering / editing:

- Add embedded font for code points that are common in RTL languages - [Scheherazade](https://software.sil.org/scheherazade/) (#309). Adapt It Mobile now comes with 4 embedded fonts, that can be used in addition to the fonts installed on your mobile device:
  - [Source Sans Pro](https://www.adobe.com/products/type/font-information/Source-Sans-Pro-Readme-file.html)
  - [Andika](https://software.sil.org/andika/)
  - [Gentium](https://software.sil.org/gentium/)
  - [Scheherazade](https://software.sil.org/scheherazade/) 
- Fixed several layout issues with RTL text (#320, #259)
- Fixed an issue where the "Wrap at Standard Format Markers" was not working in Android (#318). Also added several markers to the list of markers that cause a newline.
- Fixed an issue where the Android system setting (Display > Font size) was causing rendering display issues in Adapt It Mobile (#314). Now this system setting is ignored; Adapt It Mobile does have its own font size setting under Settings > Source Font / Target Font / Navigation Font
- Fixed an issue where uppercase file extensions (.SFM, .USFM, .XML) were being parsed as text files (#310).

These issues can be found [in our issue tracker](https://github.com/adapt-it/adapt-it-mobile/milestone/24?closed=1).

Please refer to the [Adapt It Mobile Wiki site](https://github.com/adapt-it/adapt-it-mobile/wiki#using-adapt-it-mobile) for instructions on installing. Issues and enhancement requests can be reported through our [issues page](https://github.com/adapt-it/adapt-it-mobile/issues). Thanks!

- [Source code (zip)](https://github.com/adapt-it/adapt-it-mobile/archive/v1.0.0b12.zip)
- [Source code (tar.gz)](https://github.com/adapt-it/adapt-it-mobile/archive/v1.0.0b12.tar.gz)

