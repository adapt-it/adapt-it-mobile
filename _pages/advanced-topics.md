---
permalink: /advanced-topics/
layout: page
title:  Advanced Topics
desc:   Get more out of Adapt It Mobile.
date:   2017-01-03 12:21
---

* [Changing the user interface language](#changing-ui-language)
* [Working with Filtered Text](#filtered-text)

----

<a id="changing-ui-language"></a>

## Changing the user interface language

Adapt It Mobile supports the following languages for its user interface:

- English
- French
- Spanish
- Tok Pisin

By default, Adapt It Mobile will attempt to use the same user interface language as your device. If Adapt It Mobile doesn't support your device's language, it will fall back on English for its user interface.

**To override this default behavior, complete the following steps:**

1. In Adapt It Mobile's main screen, click on the globe icon in the lower left corner: 

  ![Adapt]({{ site.baseurl }}/assets/img/globe.png)

2. In the User Interface Language screen, click on the desired option.

  ![Adapt]({{ site.baseurl }}/assets/img/ui-language.png)

  - Click "Use the language specified on this device" to have Adapt It Mobile use the language specified on the device
  - Select a specific language to have Adapt It Mobile override the default settings and always use the language you specify.

3. Click on the OK button to save your changes and return to the main Adapt It Mobile screen. 

***Note on contributing***: If you are interested in localizing Adapt It Mobile's user interface to a language you know, we'd love to work with you! Send us an email at `developers at adapt-it dot org` and let's talk.

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

![Multiple Filters](https://raw.githubusercontent.com/adapt-it/adapt-it-mobile/gh-pages/assets/img/f-multi.gif)

To close the filtered text window, click on either the X icon in the upper right corner of the window or in the darker area outside the window.

![Single Filters](https://raw.githubusercontent.com/adapt-it/adapt-it-mobile/gh-pages/assets/img/f-single.gif)

