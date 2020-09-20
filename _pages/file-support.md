---
permalink: /about/file-support
layout: page
title:  Text and Paratext
desc:   Supported file types
date:   2017-01-03 12:21
---

## Document import / export

Adapt It Mobile currently supports the following document formats:

- Adapt It desktop (.xml) document
- USFM
- USX
- Plain text (.txt)

## Clipboard import / export

Adapt It Mobile also supports copying text from other programs on your mobile device. This can be either plain text, or text formatted in one of the supported formats above. Note that if you are copying formatted text, you'll need to include the entire file. There are formatting markers that indicate the book and chapter, etc., and these need to be included in order for Adapt It Mobile to import the file data properly.

Adapt It Mobile can also export entire files in any of the above formats to the clipboard.

# Translation memory / Knowledge base import and export

Adapt It Mobile can also import and export the following translation memory data formats:

- Adapt It desktop (.xml) Knowledge Base
- Translation Memory Exchange (.TMX) format

Importing these files can speed up the initial translation work, as Adapt It Mobile will have possible translation matches loaded from the memory files.

Notes:

- For import, these files need to have both the same source and target language information as the current project.
- Adapt It Mobile will also build translation memory data when Adapt It desktop (.xml) documents are loaded, if the documents have some translation work started in them.
- The TMX file format can include data not relevant to a single source/target translation pair. This extraneous information is not imported by Adapt It Mobile. For this reason, Adapt It Mobile is not recommended for "round-tripping" (i.e., importing, updating, and then exporting) TMX file data.
