---
layout: post
title:  Public Beta 11
categories: News
---

## Release 1.0 beta 11 available for download

We are pleased to announce the eleventh public beta for Adapt It Mobile 1.0. 

***Bug Fixes***
This beta release fixes several issues found during testing:

- Fixed an issue where removing a phrase didn't preserve the associated marker information (#291)
- Fixed an issue where the possible translations on the "choose translation" menu were hard to distinguish, because the items were spaced evenly with no line between the options (#292)
- Fixed an issue where KB entries with trailing space + punctuation were not removed (#293)
- Fixed an issue where extra punctuation was added when clicking back on the target field (#294)
- Fixed an issue where the double-tap phrase selection was off by one word (#297)
- Fixed an issue where selecting from the drop-down "choose translation" menu was causing the cursor to skip one or more lines. (#299)
- Added two editor options that were in Adapt It desktop, but not in Adapt It Mobile: wrapping at standard format markers (#302) and automatic copying of text from source to target when there is nothing in the KB (#300)

***New Features***
Also included in this release are the following enhancements:

- The version / build info is displayed in the Settings / General Settings page (along with the two editor options listed above and the UI locale setting that was displayed on the main menu page) (issue #298)
- Portuguese localization (#304)
- A new way to select phrases in the adaptation editor: *long press selection mode* (issue #212). This feature works as follows: 

1. The user presses / holds the starting pile in the selection. After 1 second, the color on the selection changes and the user gets an audible "ping" telling them that it's in long-press selection mode. The user can then lift their finger from the starting pile location.
2. The user clicks on the ending pile in the selection. There's no time limit, as it's still in the long press selection mode. All the words between the two piles become part of the selection.

Some other nuances of this feature:

- If the user clicks outside the strip, all the words up to the beginning / ending of the strip (depending on where the user clicked) become part of the selection.
- If the user clicks an empty area, the long-press selection goes away.
- If the user presses / holds the same pile, the long-press selection mode toggles off, and the starting pile is the only one selected.

Here's an animated .gif of this selection process in action:

![longpress](https://user-images.githubusercontent.com/1458944/38842797-82153556-41b1-11e8-84fd-188eb42161aa.gif)

With this change, there are now three ways to select a phrase in Adapt It Mobile:

1. Click/drag the words that will form the phrase.
2. Double-tap a pile to select the whole strip.
3. The "long press selection" method outlined above.

---

***More info about this release***

The above issues can be found [in our issue tracker](https://github.com/adapt-it/adapt-it-mobile/milestone/23?closed=1).

Please refer to the [Adapt It Mobile Wiki site](https://github.com/adapt-it/adapt-it-mobile/wiki#using-adapt-it-mobile) for instructions on installing. Issues and enhancement requests can be reported through our [issues page](https://github.com/adapt-it/adapt-it-mobile/issues). Thanks!

- [Source code (zip)](https://github.com/adapt-it/adapt-it-mobile/archive/v1.0.0b11.zip)
- [Source code (tar.gz)](https://github.com/adapt-it/adapt-it-mobile/archive/v1.0.0b11.tar.gz)

