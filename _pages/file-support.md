---
permalink: /about/file-support
layout: page
title:  Work with Text and Paratext
desc:   File types supported by Adapt It Mobile
date:   2020-09-21 12:21
---

## Importing and exporting documents

Adapt It Mobile currently supports the following document formats:

| File Type                    | Description |
|----------------------------|-------------------------------|
| **Adapt It desktop (.xml)** | Document format for Adapt It desktop translation document. This document contains source and target (translated) text, as well as formatting markers. |
| **USFM** | [United Standard Format Markers](https://ubsicap.github.io/usfm/) document. This document format contains text and markup styling, and is supported by a variety of translation programs including Bibledit and Paratext. |
| **USX** | XML-based document format used by Paratext. |
| **Plain text (.txt)** | Text document format. When importing, Adapt It Mobile will check this document format for USFM content, as some translation tools will export USFM content with a text (.txt) extension. |

## Translate text from the clipboard? No problem!

Adapt It Mobile also supports using your mobile device's cut/copy/paste feature to copy text from other programs. The text copied into Adapt It Mobile can be either plain text or text formatted in one of the supported formats above. 

Adapt It Mobile can also export entire files in any of the above formats to the clipboard.

## Pre-populating your translation memory

If your translation team already has a working lexicon--either through [Rapid Word Collection](https://rapidwords.net) or through translation work done in another program--Adapt It Mobile can import that data to pre-populate translation suggestions for you. Adapt It Mobile supports the following translation memory data formats:

- Adapt It desktop (.xml) Knowledge Base
- Translation Memory Exchange (.TMX) format
- Lexical Interchange Format (.LIFT)
- SFM keyword files using \lx and \ge markers

Notes:

- For import, these files need to have both the same source and target language information as the current project.
- Adapt It Mobile will also build translation memory data when Adapt It desktop (.xml) documents are loaded, if the documents have some translation work started in them.
- The TMX and LIFT file formats can include data not relevant to a single source/target translation pair. This extraneous information is not imported by Adapt It Mobile. For this reason, Adapt It Mobile is not recommended for "round-tripping" (i.e., importing, updating, and then exporting) TMX or LIFT file data.
