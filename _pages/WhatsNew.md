---
permalink: /ReleaseNotes/
layout: page
title:  What's new in Adapt It Mobile
desc:   Learn about the latest updates for Adapt It Mobile
date:   2022-09-01 12:21
---

### What's new in Adapt It Mobile 1.6.0

#### Merge full USFM chapters and Scripture portions

Adapt It Mobile now supports multiple USFM imports of the same Scripture source text book. This is to support import of source text from Key It, the text input app from the Adapt It team -- although any USFM source text should also work, provided the /id marker is included in the file.

Note that multiple imports of the same source verses will remove any translations for the duplicate verses. Adapt It Mobile will warn the user before importing duplicate USFM files.

#### Empty / blank source verse handling

Adapt It Mobile now displays blank source verses on separate lines. By default blank source verses cannot be translated, but the user can configure this setting in the editor settings for the project.

For more information, see the help topic ![Changing Editor Settings]({{ site.baseurl }}/advanced-topics/#editor-settings)
