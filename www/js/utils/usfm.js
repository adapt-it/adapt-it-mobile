/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        /* USFM: https://ubsicap.github.io/usfm/index.html
           version support: 3.0
        */
        /* Converted from AI_USFM.xml, with non-settable markers at the end.
           Many of the style-related properties are moved to the styles.css file; the markers array in AIM
           only maintains the following properties:
           - name: the marker name (e.g. "h" for "\h")
           - type: _most_ of the USX 3.x element types, used to emit USX -->
             <xml> | <book> | <chapter> | <verse> | <para> | <table> (includes tags for table/row/cell) | 
             <char> | <ms> | <note> | <sidebar> | <periph> | <figure> | <ref>
           - description: brief description of the marker
           - filter: default marker state of the marker
           - userCanSetFilter: whether the marker can be filtered out
           - inform: whether the marker is displayed in the UI above the pile (if not, the filter / wedge icon is displayed)
        */
        markers = [
            {
                name: "h",
                type: "para",
                description: "Running header text for a book (basic)",
                filter: "0",
                userCanSetFilter: "1",
                navigationText: "hdr",
                inform: "1"
            },
            {
                name: "h1",
                type: "para",
                description: "Running header text",
                filter: "0",
                userCanSetFilter: "1",
                navigationText: "hdr",
                inform: "1"
            },
            {
                name: "h2",
                type: "para",
                description: "Running header text, left side of page",
                filter: "0",
                userCanSetFilter: "1",
                navigationText: "hdr",
                inform: "1"
            },
            {
                name: "h3",
                type: "para",
                description: "Running header text, right side of page",
                filter: "0",
                userCanSetFilter: "1",
                navigationText: "hdr",
                inform: "1"
            },
            {
                name: "rem",
                type: "para",
                description: "Comments and remarks",
                filter: "1",
                userCanSetFilter: "1",
                navigationText: "comment",
                inform: "1"
            },
            {
                name: "sts",
                type: "para",
                description: "Status of this file",
                filter: "1",
                userCanSetFilter: "1",
                navigationText: "comment",
                inform: "1"
            },
            {
                name: "lit",
                type: "para",
                description: "For a comment or note inserted for liturgical use",
                filter: "1",
                userCanSetFilter: "1",
                navigationText: "lit-note",
                inform: "1"
            },
            {
                name: "nt",
                type: "note",
                description: "Note",
                filter: "1",
                userCanSetFilter: "1",
                navigationText: "note",
                inform: "1"
            },
            {
                name: "nc",
                type: "note",
                description: "Note centered",
                filter: "1",
                userCanSetFilter: "1",
                navigationText: "note",
                inform: "1"
            },
            {
                name: "esb",
                type: "sidebar",
                description: "Sidebar",
                filter: "1",
                userCanSetFilter: "1"
            },
            {
                name: "esbe",
                type: "sidebar",
                description: "Sidebar",
                filter: "1",
                userCanSetFilter: "1"
            },
            {
                name: "ca",
                type: "chapter",
                endMarker: "ca*",
                description: "Second (alternate) chapter number (for coding dual versification; useful for places where different traditions of chapter breaks need to be supported in the same translation)",
                filter: "1",
                userCanSetFilter: "1"
            },
            {
                name: "cl",
                type: "para",
                description: "Chapter label used for translations that add a word such as 'Chapter' before chapter numbers (e.g. Psalms). The subsequent text is the chapter label.",
                filter: "1",
                userCanSetFilter: "1"
            },
            {
                name: "cp",
                type: "chapter",
                description: "Published chapter number (this is a chapter marking that would be used in the published text)",
                filter: "1",
                userCanSetFilter: "1"
            },
            {
                name: "cd",
                type: "para",
                description: "Chapter Description (Publishing option D, e.g. in Russian Bibles)",
                userCanSetFilter: "1",
                navigationText: "chapter descr",
                inform: "1"
            },
            {
                name: "va",
                type: "char",
                endMarker: "va*",
                description: "Second (alternate) verse number (for coding dual numeration in Psalms; see also NRSV Exo 22.1-4)",
                filter: "1",
                userCanSetFilter: "1"
            },
            {
                name: "vp",
                type: "char",
                endMarker: "vp*",
                description: "Published verse marker - this is a verse marking that would be used in the published text",
                filter: "1",
                userCanSetFilter: "1"
            },
            {
                name: "mt",
                type: "para",
                description: "The main title of the book (if single level)",
                userCanSetFilter: "1",
                navigationText: "main title",
                inform: "1"
            },
            {
                name: "mt1",
                type: "para",
                description: "The main title of the book (if multiple levels) (basic)",
                userCanSetFilter: "1",
                navigationText: "main title L1",
                inform: "1"
            },
            {
                name: "mt2",
                type: "para",
                description: "A secondary title usually occurring before the main title (basic)",
                userCanSetFilter: "1",
                navigationText: "secondary title L2",
                inform: "1"
            },
            {
                name: "mt3",
                type: "para",
                description: "A secondary title occurring after the main title",
                userCanSetFilter: "1",
                navigationText: "secondary title L3",
                inform: "1"
            },
            {
                name: "mt4",
                type: "para",
                description: "A small secondary title sometimes occuring within parentheses",
                userCanSetFilter: "1",
                navigationText: "main title L4",
                inform: "1"
            },
            {
                name: "mte",
                type: "para",
                description: "The main title of the book repeated at the end of the book (if single level)",
                userCanSetFilter: "1",
                navigationText: "main title at end",
                inform: "1"
            },
            {
                name: "mte1",
                type: "para",
                description: "The main title of the book repeated at the end of the book (if multiple levels)",
                userCanSetFilter: "1",
                navigationText: "main title at end L1",
                inform: "1"
            },
            {
                name: "mte2",
                type: "para",
                description: "A secondary title occurring before or after the 'ending' main title",
                userCanSetFilter: "1",
                navigationText: "main title at end L2",
                inform: "1"
            },
            {
                name: "div",
                type: "para",
                description: "Division heading",
                userCanSetFilter: "1",
                navigationText: "division head",
                inform: "1"
            },
            {
                name: "ms",
                type: "para",
                description: "A major section division heading, level 1 (if single level) (basic)",
                userCanSetFilter: "1",
                navigationText: "major sect head",
                inform: "1"
            },
            {
                name: "ms1",
                type: "para",
                description: "A major section division heading, level 1 (if multiple levels)",
                userCanSetFilter: "1",
                navigationText: "major sect head L1",
                inform: "1"
            },
            {
                name: "ms2",
                type: "para",
                description: "A major section division heading, level 2",
                userCanSetFilter: "1",
                navigationText: "major sect head L2",
                inform: "1"
            },
            {
                name: "ms3",
                type: "para",
                description: "A major section division heading, level 3",
                userCanSetFilter: "1",
                navigationText: "major sect head L3",
                inform: "1"
            },
            {
                name: "s",
                type: "para",
                description: "A section heading, level 1 (if single level) (basic)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "s1",
                type: "para",
                description: "A section heading, level 1 (if multiple levels)",
                userCanSetFilter: "1",
                navigationText: "sect head L1",
                inform: "1"
            },
            {
                name: "s2",
                type: "para",
                description: "A section heading, level 2 (e.g. Proverbs 22-24)",
                userCanSetFilter: "1",
                navigationText: "sect head L2",
                inform: "1"
            },
            {
                name: "s3",
                type: "para",
                description: "A section heading, level 3 (e.g. Genesis 'The First Day')",
                userCanSetFilter: "1",
                navigationText: "sect head L3",
                inform: "1"
            },
            {
                name: "s4",
                type: "para",
                description: "A section heading, level 4",
                userCanSetFilter: "1",
                navigationText: "sect head L4",
                inform: "1"
            },
            {
                name: "sr",
                type: "para",
                description: "A section division references range heading",
                userCanSetFilter: "1",
                navigationText: "sect head range refs",
                inform: "1"
            },
            {
                name: "sp",
                type: "para",
                description: "A heading, to identify the speaker (e.g. Job) (basic)",
                userCanSetFilter: "1",
                navigationText: "speaker",
                inform: "1"
            },
            {
                name: "d",
                type: "para",
                description: "A Hebrew text heading, to provide description (e.g. Psalms)",
                userCanSetFilter: "1",
                navigationText: "descr title",
                inform: "1"
            },
            {
                name: "di",
                type: "para",
                description: "Descriptive title (Hebrew subtitle)",
                userCanSetFilter: "1",
                navigationText: "descr title",
                inform: "1"
            },
            {
                name: "sd",
                type: "para",
                description: "Semantic division",
                userCanSetFilter: "1",
                navigationText: "descr title",
                inform: "1"
            },
            {
                name: "sd1",
                type: "para",
                description: "Semantic division",
                userCanSetFilter: "1",
                navigationText: "descr title",
                inform: "1"
            },
            {
                name: "sd2",
                type: "para",
                description: "Semantic division",
                userCanSetFilter: "1",
                navigationText: "descr title",
                inform: "1"
            },
            {
                name: "sd3",
                type: "para",
                description: "Semantic division",
                userCanSetFilter: "1",
                navigationText: "descr title",
                inform: "1"
            },
            {
                name: "hl",
                type: "para",
                description: "Hebrew letter",
                filter: "1",
                userCanSetFilter: "1"
            },
            {
                name: "r",
                type: "para",
                description: "Parallel reference(s) (basic)",
                filter: "1",
                userCanSetFilter: "1",
                navigationText: "ref",
                inform: "1"
            },
            {
                name: "dvrf",
                type: "para",
                description: "Division reference",
                filter: "1",
                userCanSetFilter: "1",
                navigationText: "div-ref",
                inform: "1"
            },
            {
                name: "mr",
                type: "para",
                description: "A major section division references range heading (basic)",
                filter: "1",
                userCanSetFilter: "1",
                navigationText: "mjr-sect-refs",
                inform: "1"
            },
            {
                name: "br",
                type: "para",
                description: "Psalms book reference",
                filter: "1",
                userCanSetFilter: "1",
                navigationText: "Ps-bk-ref",
                inform: "1"
            },
            {
                name: "x",
                type: "note",
                endMarker: "x*",
                description: "A list of cross references (basic)",
                filter: "1",
                userCanSetFilter: "1",
                navigationText: "x-refs",
                inform: "1"
            },
            {
                name: "rr",
                type: "note",
                description: "Right margin reference",
                filter: "1",
                userCanSetFilter: "1",
                navigationText: "rt-marg-ref",
                inform: "1"
            },
            {
                name: "rq",
                type: "char",
                endMarker: "rq*",
                description: "A cross-reference indicating the source text for the preceding quotation",
                filter: "1",
                userCanSetFilter: "1",
                navigationText: "x-ref to source",
                inform: "1"
            },
            {
                name: "@",
                type: "note",
                description: "Cross reference, origin reference",
                filter: "1",
                userCanSetFilter: "1",
                navigationText: "x-refs orig",
                inform: "1"
            },
            {
                name: "xr",
                type: "note",
                description: "Cross reference target references",
                filter: "1",
                userCanSetFilter: "1",
                navigationText: "x-refs tgt",
                inform: "1"
            },
            {
                name: "pc",
                type: "para",
                description: "Paragraph spanning chapters",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "pt",
                type: "para",
                description: "Preface title",
                userCanSetFilter: "1",
                navigationText: "preface title",
                inform: "1"
            },
            {
                name: "ps",
                type: "para",
                description: "Preface section heading",
                userCanSetFilter: "1",
                navigationText: "preface section head",
                inform: "1"
            }, // REMOVED PNG /ps tag (conflicts with official one above)
            {
                name: "pp",
                type: "para",
                description: "Preface paragraph",
                userCanSetFilter: "1",
                navigationText: "preface paragraph",
                inform: "1"
            },
            {
                name: "pq",
                type: "para",
                description: "Preface poetry",
                userCanSetFilter: "1",
                navigationText: "preface poetry",
                inform: "1"
            },
            {
                name: "pmo",
                type: "para",
                description: "Embedded text opening",
                userCanSetFilter: "1",
                navigationText: "preface at margin",
                inform: "1"
            },
            {
                name: "pm",
                type: "para",
                description: "Embedded text paragraph",
                userCanSetFilter: "1",
                navigationText: "preface at margin",
                inform: "1"
            }, // REMOVED PNG /pm tag (conflicts with official one above)
            {
                name: "qa",
                type: "para",
                description: "Poetry text, Acrostic marker/heading",
                userCanSetFilter: "1",
                navigationText: "acrostic hdg",
                inform: "1"
            },
            {
                name: "qs",
                type: "char",
                endMarker: "qs*",
                description: "Poetry text, Selah",
                userCanSetFilter: "1"
            },
            {
                name: "f",
                type: "note",
                endMarker: "f*",
                description: "A Footnote text item (basic)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "pro",
                type: "char",
                endMarker: "pro*",
                description: "For indicating pronunciation in CJK texts",
                filter: "1",
                userCanSetFilter: "1"
            },
            {
                name: "imt",
                type: "para",
                description: "Introduction main title, level 1 (if single level) (basic)",
                userCanSetFilter: "1",
                navigationText: "intro main title",
                inform: "1"
            },
            {
                name: "imt1",
                type: "para",
                description: "Introduction major title, level 1 (if multiple levels)",
                userCanSetFilter: "1",
                navigationText: "intro main title L1",
                inform: "1"
            },
            {
                name: "imt2",
                type: "para",
                description: "Introduction major title, level 2",
                userCanSetFilter: "1",
                navigationText: "intro main title L2",
                inform: "1"
            },
            {
                name: "imt3",
                type: "para",
                description: "Introduction major title, level 3",
                userCanSetFilter: "1",
                navigationText: "intro main title L3",
                inform: "1"
            },
            {
                name: "imt4",
                type: "para",
                description: "Introduction major title, level 4 (usually within parenthesis)",
                userCanSetFilter: "1",
                navigationText: "intro main title L4",
                inform: "1"
            },
            {
                name: "imte",
                type: "para",
                description: "Introduction major title at introduction end, level 1 (if single level)",
                userCanSetFilter: "1",
                navigationText: "intro major title at end",
                inform: "1"
            },
            {
                name: "imte1",
                type: "para",
                description: "Introduction major title at introduction end, level 1 (if multiple levels)",
                userCanSetFilter: "1",
                navigationText: "intro major title at end",
                inform: "1"
            },
            {
                name: "imte2",
                type: "para",
                description: "Introduction major title at introduction end, level 2",
                userCanSetFilter: "1",
                navigationText: "intro major title at end",
                inform: "1"
            },
            {
                name: "is",
                type: "para",
                description: "Introduction section heading, level 1 (if single level) (basic)",
                userCanSetFilter: "1",
                navigationText: "intro sect head",
                inform: "1"
            },
            {
                name: "is1",
                type: "para",
                description: "Introduction section heading, level 1 (if multiple levels)",
                userCanSetFilter: "1",
                navigationText: "intro sect head L1",
                inform: "1"
            },
            {
                name: "is2",
                type: "para",
                description: "Introduction section heading, level 2",
                userCanSetFilter: "1",
                navigationText: "intro sect head L2",
                inform: "1"
            },
            {
                name: "ip",
                type: "para",
                description: "Introduction prose paragraph (basic)",
                userCanSetFilter: "1",
                navigationText: "intro paragraph",
                inform: "1"
            },
            {
                name: "ipi",
                type: "para",
                description: "Introduction prose paragraph, indented, with first line indent",
                userCanSetFilter: "1",
                navigationText: "intro paragraph indented",
                inform: "1"
            },
            {
                name: "ipq",
                type: "para",
                description: "Introduction prose paragraph, quote from the body text",
                userCanSetFilter: "1",
                navigationText: "intro para quote",
                inform: "1"
            },
            {
                name: "ipr",
                type: "para",
                description: "Introduction prose paragraph, right aligned",
                userCanSetFilter: "1",
                navigationText: "intro para right align",
                inform: "1"
            },
            {
                name: "iq",
                type: "para",
                description: "Introduction poetry text, level 1 (if single level)",
                userCanSetFilter: "1",
                navigationText: "intro poetry",
                inform: "1"
            },
            {
                name: "iq1",
                type: "para",
                description: "Introduction poetry text, level 1 (if multiple levels)",
                userCanSetFilter: "1",
                navigationText: "intro poetry L1",
                inform: "1"
            },
            {
                name: "iq2",
                type: "para",
                description: "Introduction poetry text, level 2",
                userCanSetFilter: "1",
                navigationText: "intro poetry L2",
                inform: "1"
            },
            {
                name: "iq3",
                type: "para",
                description: "Introduction poetry text, level 3",
                userCanSetFilter: "1",
                navigationText: "intro poetry L3",
                inform: "1"
            },
            {
                name: "im",
                type: "para",
                description: "Introduction prose paragraph, with no first line indent (may occur after poetry)",
                userCanSetFilter: "1",
                navigationText: "intro para no indent",
                inform: "1"
            },
            {
                name: "imi",
                type: "para",
                description: "Introduction prose paragraph text, indented, with no first line indent",
                userCanSetFilter: "1",
                navigationText: "intro para no indent",
                inform: "1"
            },
            {
                name: "ili",
                type: "para",
                description: "A list entry, level 1 (if single level)",
                userCanSetFilter: "1",
                navigationText: "intro list L1",
                inform: "1"
            },
            {
                name: "ili1",
                type: "para",
                description: "A list entry, level 1 (if multiple levels)",
                navigationText: "intro list L1",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "ili2",
                type: "para",
                description: "A list entry, level 2",
                userCanSetFilter: "1",
                navigationText: "intro list L2",
                inform: "1"
            },
            {
                name: "imq",
                type: "para",
                description: "Introduction prose paragraph, quote from the body text, with no first line indent",
                userCanSetFilter: "1",
                navigationText: "intro para quote no indent",
                inform: "1"
            },
            {
                name: "ib",
                type: "para",
                description: "Introduction blank line",
                filter: "1",
                userCanSetFilter: "1"
            },
            {
                name: "iot",
                type: "para",
                description: "Introduction outline title (basic)",
                userCanSetFilter: "1",
                navigationText: "intro outline title",
                inform: "1"
            },
            {
                name: "io",
                type: "para",
                description: "Introduction outline text, level 1 (if single level)",
                userCanSetFilter: "1",
                navigationText: "intro outline",
                inform: "1"
            },
            {
                name: "io1",
                type: "para",
                description: "Introduction outline text, level 1 (if multiple levels) (basic)",
                userCanSetFilter: "1",
                navigationText: "intro outline L1",
                inform: "1"
            },
            {
                name: "io2",
                type: "para",
                description: "Introduction outline text, level 2",
                userCanSetFilter: "1",
                navigationText: "intro outline L2",
                inform: "1"
            },
            {
                name: "io3",
                type: "para",
                description: "Introduction outline text, level 3",
                userCanSetFilter: "1",
                navigationText: "intro outline L3",
                inform: "1"
            },
            {
                name: "io4",
                type: "para",
                description: "Introduction outline text, level 4",
                userCanSetFilter: "1",
                navigationText: "intro outline L4",
                inform: "1"
            },
            {
                name: "ior",
                type: "char",
                endMarker: "ior*",
                description: "Introduction references range for outline entry; for marking references separately",
                userCanSetFilter: "1"
            },
            {
                name: "iex",
                type: "para",
                description: "Introduction explanatory or bridge text (e.g. explanation of missing book in Short Old Testament)",
                userCanSetFilter: "1",
                navigationText: "intro explain text",
                inform: "1"
            },
            {
                name: "iqt",
                type: "char",
                endMarker: "iqt*",
                description: "For quoted scripture text appearing in the introduction",
                userCanSetFilter: "1"
            },
            {
                name: "gm",
                type: "para",
                description: "Glossary main entry",
                userCanSetFilter: "1",
                navigationText: "glossary main entry",
                inform: "1"
            },
            {
                name: "gs",
                type: "para",
                description: "Glossary subentry",
                navigationText: "glossary subentry",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "gd",
                type: "para",
                description: "Glossary definition",
                userCanSetFilter: "1",
                navigationText: "glossary definition",
                inform: "1"
            },
            {
                name: "gp",
                type: "para",
                description: "Glossary paragraph",
                userCanSetFilter: "1",
                navigationText: "glossary paragraph",
                inform: "1"
            },
            {
                name: "tis",
                type: "para",
                description: "Topical index heading (level 1)",
                userCanSetFilter: "1",
                navigationText: "topical index L1",
                inform: "1"
            },
            {
                name: "tpi",
                type: "para",
                description: "Topical index heading (level 2)",
                userCanSetFilter: "1",
                navigationText: "topical index L2",
                inform: "1"
            },
            {
                name: "tps",
                type: "para",
                description: "Topical index heading (level 3)",
                userCanSetFilter: "1",
                navigationText: "topical index L3",
                inform: "1"
            },
            {
                name: "tir",
                type: "para",
                description: "Topical index reference",
                userCanSetFilter: "1",
                navigationText: "topical index reference",
                inform: "1"
            },
            {
                name: "periph",
                type: "periph",
                description: "Periheral content division marker which should be followed by an additional division argument/title.",
                userCanSetFilter: "1",
                navigationText: "Periph matter div",
                inform: "1"
            },
            {
                name: "p2",
                type: "para",
                description: "Front or back matter text paragraph, level 2 (if multiple levels)",
                userCanSetFilter: "1",
                navigationText: "Periph matter para L2",
                inform: "1"
            },
            {
                name: "xtSee",
                type: "char",
                endMarker: "xtSee*",
                description: "Concordance and Names Index markup for an alternate entry target reference.",
                userCanSetFilter: "1"
            },
            {
                name: "xtSeeAlso",
                type: "char",
                endMarker: "xtSeeAlso*",
                description: "Concordance and Names Index markup for an additional entry target reference.",
                userCanSetFilter: "1"
            },
            {
                name: "pub",
                type: "para",
                description: "Front matter publication data",
                userCanSetFilter: "1"
            },
            {
                name: "toc",
                type: "para",
                description: "Front matter table of contents",
                userCanSetFilter: "1"
            },
            {
                name: "toc1",
                type: "para",
                description: "Long table of contents text",
                userCanSetFilter: "1"
            },
            {
                name: "toc2",
                type: "para",
                description: "Short table of contents text",
                userCanSetFilter: "1"
            },
            {
                name: "toc3",
                type: "para",
                description: "Book Abbreviation",
                userCanSetFilter: "1"
            },
            {
                name: "toca",
                type: "para",
                description: "Alternative language front matter table of contents",
                userCanSetFilter: "1"
            },
            {
                name: "toca1",
                type: "para",
                description: "Long Alternative language table of contents text",
                userCanSetFilter: "1"
            },
            {
                name: "toca2",
                type: "para",
                description: "Short Alternative language table of contents text",
                userCanSetFilter: "1"
            },
            {
                name: "toca3",
                type: "para",
                description: "Alternative language Book Abbreviation",
                userCanSetFilter: "1"
            },
            {
                name: "fig",
                type: "figure",
                endMarker: "fig*",
                description: "Illustration [Columns to span, height, filename, caption text]",
                filter: "1",
                userCanSetFilter: "1"
            },
            {
                name: "cap",
                type: "para",
                description: "Picture caption",
                filter: "1",
                userCanSetFilter: "1",
                navigationText: "picture caption",
                inform: "1"
            },
            /* userCanSetFilter=0 elements -- these guys don't show up in the usfm filtering dialog;
               they're either always visible or always filtered out, depending on the inform property */
            {
                name: "usfm",
                type: "para",
                description: "usfm version",
                special: "1",
                inform: "1",
                navigationText: "usfm",
                userCanSetFilter: "0"
            },
            {
                name: "id",
                type: "book",
                description: "File identification (BOOKID, FILENAME, EDITOR, MODIFICATION DATE)",
                png: "1",
                special: "1",
                inform: "1",
                navigationText: "id",
                userCanSetFilter: "0"
            },
            {
                name: "ide",
                type: "xml",
                description: "File encoding information (UTF-8 is the only supported encoding in AIM)",
                usfm: "1",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "restore",
                type: "para",
                description: "Project restore information",
                usfm: "1",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "c",
                type: "chapter",
                description: "Chapter number (basic)",
                usfm: "1",
                inform: "1",
                userCanSetFilter: "0"
            },
            {
                name: "v",
                type: "verse",
                description: "A verse number (basic)",
                usfm: "1",
                inform: "1",
                userCanSetFilter: "0"
            },
            {
                name: "vt",
                type: "verse",
                description: "Verse text",
                inform: "1",
                userCanSetFilter: "0"
            },
            {
                name: "vn",
                type: "verse",
                description: "Verse number",
                inform: "1",
                userCanSetFilter: "0"
            },
            {
                name: "xo",
                type: "char",
                endMarker: "xo*",
                description: "The cross reference origin reference (basic)",
                filter: "1",
                inform: "1",
                userCanSetFilter: "0"
            },
            {
                name: "xt",
                type: "char",
                endMarker: "xt*",
                description: "The cross reference target reference(s), protocanon only (basic)",
                filter: "1",
                inform: "1",
                userCanSetFilter: "0"
            },
            {
                name: "xta",
                type: "char",
                endMarker: "xta*",
                description: "Target reference(s) extra / added text",
                filter: "1",
                inform: "1",
                userCanSetFilter: "0"
            },
            {
                name: "xop",
                type: "char",
                endMarker: "xop*",
                description: "Published cross reference origen text",
                filter: "1",
                inform: "1",
                userCanSetFilter: "0"
            },
            {
                name: "xk",
                type: "char",
                endMarker: "xk*",
                description: "A cross reference keyword",
                filter: "1",
                inform: "1",
                userCanSetFilter: "0"
            },
            {
                name: "xq",
                type: "char",
                endMarker: "xq*",
                description: "A cross-reference quotation from the scripture text",
                filter: "1",
                inform: "1",
                userCanSetFilter: "0"
            },
            {
                name: "xot",
                type: "char",
                endMarker: "xot*",
                description: "Cross-reference target reference(s), Old Testament only",
                filter: "1",
                inform: "1",
                userCanSetFilter: "0"
            },
            {
                name: "xnt",
                type: "char",
                endMarker: "xnt*",
                description: "Cross-reference target reference(s), New Testament only",
                filter: "1",
                inform: "1",
                userCanSetFilter: "0"
            },
            {
                name: "xdc",
                type: "char",
                endMarker: "xdc*",
                description: "Cross-reference target reference(s), Deuterocanon only",
                filter: "1",
                inform: "1",
                userCanSetFilter: "0"
            },
            {
                name: "jmp",
                type: "char",
                endMarker: "jmp*",
                description: "Link text",
                filter: "1",
                inform: "1",
                userCanSetFilter: "0"
            },
            {
                name: "po",
                type: "para",
                description: "Paragraph opening of an epistle/letter",
                filter: "0",
                inform: "1",
                navigationText: "paragraph",
                userCanSetFilter: "0"
            },
            {
                name: "p",
                type: "para",
                description: "Paragraph text, with first line indent (basic)",
                filter: "0",
                inform: "1",
                navigationText: "paragraph",
                userCanSetFilter: "0"
            },
            {
                name: "pi",
                type: "para",
                description: "Paragraph text, level 1 indent (if single level), with first line indent; often used for discourse (basic)",
                filter: "0",
                inform: "1",
                navigationText: "para indented",
                userCanSetFilter: "0"
            },
            {
                name: "pi1",
                type: "para",
                description: "Paragraph text, level 1 indent (if multiple levels), with first line indent; often used for discourse",
                filter: "0",
                inform: "1",
                navigationText: "para indented L1",
                userCanSetFilter: "0"
            },
            {
                name: "pi2",
                type: "para",
                description: "Paragraph text, level 2 indent, with first line indent; often used for discourse",
                filter: "0",
                inform: "1",
                navigationText: "para indented L2",
                userCanSetFilter: "0"
            },
            {
                name: "pi3",
                type: "para",
                description: "Paragraph text, level 3 indent, with first line indent; often used for discourse",
                filter: "0",
                inform: "1",
                navigationText: "para indented L3",
                userCanSetFilter: "0"
            },
            {
                name: "pgi",
                type: "para",
                description: "Indented paragraph",
                inform: "1",
                navigationText: "para indented",
                userCanSetFilter: "0"
            },
            {
                name: "ph",
                type: "para",
                description: "Paragraph text, with level 1 hanging indent (if single level)",
                inform: "1",
                navigationText: "para hang indent",
                userCanSetFilter: "0"
            },
            {
                name: "ph1",
                type: "para",
                description: "Paragraph text, with level 1 hanging indent (if multiple levels)",
                inform: "1",
                navigationText: "para hang indent L1",
                userCanSetFilter: "0"
            },
            {
                name: "ph2",
                type: "para",
                description: "Paragraph text, with level 2 hanging indent",
                inform: "1",
                navigationText: "para hang indent L2",
                userCanSetFilter: "0"
            },
            {
                name: "ph3",
                type: "para",
                description: "Paragraph text, with level 3 hanging indent",
                inform: "1",
                navigationText: "para hang indent L3",
                userCanSetFilter: "0"
            },
            {
                name: "phi",
                type: "para",
                description: "Paragraph text, indented with hanging indent",
                inform: "1",
                navigationText: "para indent hang indent",
                userCanSetFilter: "0"
            },
            {
                name: "m",
                type: "para",
                description: "Paragraph text, with no first line indent (may occur after poetry) (basic)",
                inform: "1",
                navigationText: "paragraph margin",
                userCanSetFilter: "0"
            },
            {
                name: "mi",
                type: "para",
                description: "Paragraph text, indented, with no first line indent; often used for discourse",
                inform: "1",
                navigationText: "para indent no 1st line indent",
                userCanSetFilter: "0"
            },
            {
                name: "pc",
                type: "para",
                description: "Paragraph text, centered (for Inscription)",
                inform: "1",
                navigationText: "para spans chapters",
                userCanSetFilter: "0"
            },
            {
                name: "pr",
                type: "para",
                description: "Paragraph text, right aligned",
                inform: "1",
                navigationText: "para right aligned",
                userCanSetFilter: "0"
            },
            {
                name: "psi",
                type: "para",
                description: "Paragraph text, indented, with no break with next paragraph text (at chapter boundary)",
                inform: "1",
                userCanSetFilter: "0"
            },
            {
                name: "pmc",
                type: "para",
                description: "Embedded text closing",
                inform: "1",
                navigationText: "para embedded text closing",
                userCanSetFilter: "0"
            },
            {
                name: "pmr",
                type: "para",
                description: "Embedded text refrain (e.g. Then all the people shall say, 'Amen!')",
                inform: "1",
                navigationText: "para embedded text refrain",
                userCanSetFilter: "0"
            },
            {
                name: "nb",
                type: "para",
                description: "Paragraph text, with no break from previous paragraph text (at chapter boundary) (basic)",
                inform: "1",
                navigationText: "para no break",
                userCanSetFilter: "0"
            },
            {
                name: "cls",
                type: "para",
                description: "Closure of an Epistle",
                inform: "1",
                navigationText: "Epistle close",
                userCanSetFilter: "0"
            },
            {
                name: "q",
                type: "para",
                description: "Poetry text, level 1 indent (if single level)",
                inform: "1",
                navigationText: "poetry",
                userCanSetFilter: "0"
            },
            {
                name: "q1",
                type: "para",
                description: "Poetry text, level 1 indent (if multiple levels) (basic)",
                inform: "1",
                navigationText: "poetry L1",
                userCanSetFilter: "0"
            },
            {
                name: "q2",
                type: "para",
                description: "Poetry text, level 2 indent (basic)",
                inform: "1",
                navigationText: "poetry L2",
                userCanSetFilter: "0"
            },
            {
                name: "q3",
                type: "para",
                description: "Poetry text, level 3 indent",
                inform: "1",
                navigationText: "poetry L3",
                userCanSetFilter: "0"
            },
            {
                name: "q4",
                type: "para",
                description: "Poetry text, level 4 indent",
                inform: "1",
                navigationText: "poetry L4",
                userCanSetFilter: "0"
            },
            {
                name: "qc",
                type: "para",
                description: "Poetry text, centered",
                inform: "1",
                userCanSetFilter: "0"
            },
            {
                name: "qr",
                type: "para",
                description: "Poetry text, Right Aligned",
                inform: "1",
                navigationText: "poetry right margin",
                userCanSetFilter: "0"
            },
            {
                name: "qac",
                type: "char",
                endMarker: "qac*",
                description: "Poetry text, Acrostic markup of the first character of a line of acrostic poetry",
                userCanSetFilter: "0"
            },
            {
                name: "qd",
                type: "para",
                description: "Hebrew note; musical performance comment at end of poetic section",
                navigationText: "Hebrew note",
                userCanSetFilter: "0"
            },
            {
                name: "qm",
                type: "para",
                description: "Poetry, left margin",
                inform: "1",
                navigationText: "poetry margin",
                userCanSetFilter: "0"
            }, // REMOVED PNG /qm (conflicts with above)
            {
                name: "qm1",
                type: "para",
                description: "Poetry text, embedded, level 1 indent (if multiple levels)",
                inform: "1",
                navigationText: "poetry embed L1",
                userCanSetFilter: "0"
            },
            {
                name: "qm2",
                type: "para",
                description: "Poetry text, embedded, level 2 indent",
                inform: "1",
                navigationText: "poetry embed L2",
                userCanSetFilter: "0"
            },
            {
                name: "qm3",
                type: "para",
                description: "Poetry text, embedded, level 3 indent",
                inform: "1",
                navigationText: "poetry embed L3",
                userCanSetFilter: "0"
            },
            {
                name: "fe",
                type: "note",
                description: "Endnote",
                inform: "1",
                navigationText: "endnote",
                userCanSetFilter: "1"
            },
            {
                name: "fr",
                type: "note",
                endMarker: "fr*",
                description: "The origin reference for the footnote (basic)",
                inform: "1",
                navigationText: "ref",
                userCanSetFilter: "0"
            },
            {
                name: "fk",
                type: "note",
                endMarker: "fk*",
                description: "A footnote keyword (basic)",
                inform: "1",
                navigationText: "keyword",
                userCanSetFilter: "0"
            },
            {
                name: "fq",
                type: "note",
                endMarker: "fq*",
                description: "A footnote scripture quote or alternate rendering (basic)",
                inform: "1",
                navigationText: "quote",
                userCanSetFilter: "0"
            },
            {
                name: "fqa",
                type: "note",
                endMarker: "fqa*",
                description: "A footnote alternate rendering for a portion of scripture text",
                inform: "1",
                navigationText: "alt-transln",
                userCanSetFilter: "0"
            },
            {
                name: "fl",
                type: "note",
                endMarker: "fl*",
                description: "A footnote label text item, for marking or 'labelling' the type or alternate translation being provided in the note.",
                inform: "1",
                navigationText: "label",
                userCanSetFilter: "0"
            },
            {
                name: "fw",
                type: "note",
                endMarker: "fw*",
                description: "Footnote witness list",
                userCanSetFilter: "0"
            },
            {
                name: "fp",
                type: "note",
                endMarker: "fp*",
                description: "A Footnote additional paragraph marker",
                inform: "1",
                navigationText: "new-paragr",
                userCanSetFilter: "0"
            },
            {
                name: "ft",
                type: "note",
                endMarker: "ft*",
                description: "Footnote text, Protocanon (basic)",
                inform: "1",
                navigationText: "fn-text",
                userCanSetFilter: "0"
            },
            {
                name: "fdc",
                type: "note",
                endMarker: "fdc*",
                description: "Footnote text, applies to Deuterocanon only",
                inform: "1",
                navigationText: "deut-canon",
                userCanSetFilter: "0"
            },
            {
                name: "fv",
                type: "note",
                endMarker: "fv*",
                description: "A verse number within the footnote text",
                inform: "1",
                navigationText: "verse#",
                userCanSetFilter: "0"
            },
            {
                name: "fm",
                type: "note",
                endMarker: "fm*",
                description: "An additional footnote marker location for a previous footnote",
                inform: "1",
                navigationText: "call-prev",
                userCanSetFilter: "0"
            },
            {
                name: "ts",
                type: "ms",
                description: "Translator's section (identifies a section of text that can be translated)",
                inform: "1",
                userCanSetFilter: "1"
            },
            {
                name: "ts-s",
                type: "ms",
                description: "Translator's section start (paired with ts-e)",
                inform: "1",
                userCanSetFilter: "1"
            },
            {
                name: "ts-e",
                type: "ms",
                description: "Translator's section end (paired with ts-s)",
                inform: "1",
                userCanSetFilter: "1"
            },
            {
                name: "qt-s",
                type: "ms",
                description: "Quotation speaker start",
                inform: "1",
                userCanSetFilter: "1"
            },
            {
                name: "qt-e",
                type: "ms",
                description: "Quotation speaker end",
                inform: "1",
                userCanSetFilter: "1"
            },
            {
                name: "qt1-s",
                type: "ms",
                description: "Quotation speaker start, L1",
                inform: "1",
                userCanSetFilter: "1"
            },
            {
                name: "qt1-e",
                type: "ms",
                description: "Quotation speaker end, L1",
                inform: "1",
                userCanSetFilter: "1"
            },
            {
                name: "qt2-s",
                type: "ms",
                description: "Quotation speaker start, L2",
                inform: "1",
                userCanSetFilter: "1"
            },
            {
                name: "qt2-e",
                type: "ms",
                description: "Quotation speaker end, L2",
                inform: "1",
                userCanSetFilter: "1"
            },
            {
                name: "qt3-s",
                type: "ms",
                description: "Quotation speaker start, L3",
                inform: "1",
                userCanSetFilter: "1"
            },
            {
                name: "qt3-e",
                type: "ms",
                description: "Quotation speaker end, L3",
                inform: "1",
                userCanSetFilter: "1"
            },
            {
                name: "qt",
                type: "char",
                endMarker: "qt*",
                description: "For Old Testament quoted text appearing in the New Testament (basic)",
                inform: "1",
                navigationText: "Quotation",
                userCanSetFilter: "0"
            },
            {
                name: "nd",
                type: "char",
                endMarker: "nd*",
                description: "For name of deity (basic)",
                userCanSetFilter: "0"
            },
            {
                name: "tl",
                type: "char",
                endMarker: "tl*",
                description: "For transliterated words",
                userCanSetFilter: "0"
            },
            {
                name: "dc",
                type: "char",
                endMarker: "dc*",
                description: "Deuterocanonical/LXX additions or insertions in the Protocanonical text",
                userCanSetFilter: "0"
            },
            {
                name: "bk",
                type: "char",
                endMarker: "bk*",
                description: "For the quoted name of a book",
                userCanSetFilter: "0"
            },
            {
                name: "sig",
                type: "char",
                endMarker: "sig*",
                description: "For the signature of the author of an Epistle",
                userCanSetFilter: "0"
            },
            {
                name: "pn",
                type: "char",
                endMarker: "pn*",
                description: "For a proper name",
                userCanSetFilter: "0"
            },
            {
                name: "png",
                type: "char",
                endMarker: "png*",
                description: "Geographic proper name",
                userCanSetFilter: "0"
            },
            {
                name: "rb",
                type: "char",
                endMarker: "rb*",
                description: "Ruby glossing text",
                userCanSetFilter: "0"
            },
            {
                name: "wj",
                type: "char",
                endMarker: "wj*",
                description: "For marking the words of Jesus",
                userCanSetFilter: "0"
            },
            {
                name: "k",
                type: "char",
                endMarker: "k*",
                description: "For a keyword",
                userCanSetFilter: "0"
            },
            {
                name: "sls",
                type: "char",
                endMarker: "sls*",
                description: "To represent where the original text is in a secondary language or from an alternate text source",
                userCanSetFilter: "0"
            },
            {
                name: "ord",
                type: "char",
                endMarker: "ord*",
                description: "For the text portion of an ordinal number",
                userCanSetFilter: "0"
            },
            {
                name: "add",
                type: "char",
                endMarker: "add*",
                description: "For a translational addition to the text",
                inform: "1",
                navigationText: "addl material",
                userCanSetFilter: "0"
            },
            {
                name: "no",
                type: "char",
                endMarker: "no*",
                description: "A character style, use normal text",
                userCanSetFilter: "0"
            },
            {
                name: "bd",
                type: "char",
                endMarker: "bd*",
                description: "A character style, use bold text",
                userCanSetFilter: "0"
            },
            {
                name: "it",
                type: "char",
                endMarker: "it*",
                description: "A character style, use italic text",
                userCanSetFilter: "0"
            },
            {
                name: "bdit",
                type: "char",
                endMarker: "bdit*",
                description: "A character style, use bold + italic text",
                userCanSetFilter: "0"
            },
            {
                name: "em",
                type: "char",
                endMarker: "em*",
                description: "A character style, use emphasized text style",
                userCanSetFilter: "0"
            },
            {
                name: "sc",
                type: "char",
                endMarker: "sc*",
                description: "A character style, for small capitalization text",
                userCanSetFilter: "0"
            },
            {
                name: "sup",
                type: "char",
                endMarker: "sup*",
                description: "Superscript text",
                userCanSetFilter: "0"
            },
            {
                name: "ie",
                type: "para",
                description: "Introduction ending marker",
                userCanSetFilter: "0"
            },
            {
                name: "lh",
                type: "para",
                description: "List header",
                inform: "1",
                navigationText: "list header",
                userCanSetFilter: "0"
            },
            {
                name: "lf",
                type: "para",
                description: "List footer",
                inform: "1",
                navigationText: "list footer",
                userCanSetFilter: "0"
            },
            {
                name: "lik",
                type: "char",
                endMarker: "lik*",
                description: "List entry key",
                userCanSetFilter: "0"
            },
            {
                name: "liv",
                type: "char",
                endMarker: "liv*",
                description: "List entry value",
                userCanSetFilter: "0"
            },
            {
                name: "liv1",
                type: "char",
                endMarker: "liv1*",
                description: "List entry value, level 1",
                userCanSetFilter: "0"
            },
            {
                name: "liv2",
                type: "char",
                endMarker: "liv2*",
                description: "List entry value, level 2",
                userCanSetFilter: "0"
            },
            {
                name: "liv3",
                type: "char",
                endMarker: "liv3*",
                description: "List entry value, level 3",
                userCanSetFilter: "0"
            },
            {
                name: "litl",
                type: "char",
                endMarker: "litl*",
                description: "List entry total",
                userCanSetFilter: "0"
            },
            {
                name: "li",
                type: "para",
                description: "A list entry, level 1 (if single level)",
                inform: "1",
                navigationText: "list item",
                userCanSetFilter: "0"
            },
            {
                name: "li1",
                type: "para",
                description: "A list entry, level 1 (if multiple levels)",
                inform: "1",
                navigationText: "list item L1",
                userCanSetFilter: "0"
            },
            {
                name: "li2",
                type: "para",
                description: "A list entry, level 2",
                inform: "1",
                navigationText: "list item L2",
                userCanSetFilter: "0"
            },
            {
                name: "li3",
                type: "para",
                description: "A list entry, level 3",
                inform: "1",
                navigationText: "list item L3",
                userCanSetFilter: "0"
            },
            {
                name: "li4",
                type: "para",
                description: "A list entry, level 4",
                inform: "1",
                navigationText: "list item L4",
                userCanSetFilter: "0"
            },
            {
                name: "lim",
                type: "para",
                description: "Embedded list entry, level 1 (if single level)",
                inform: "1",
                navigationText: "list item",
                userCanSetFilter: "0"
            },
            {
                name: "lim1",
                type: "para",
                description: "Embedded list entry, level 1 (if multiple levels)",
                inform: "1",
                navigationText: "list item L1",
                userCanSetFilter: "0"
            },
            {
                name: "lim2",
                type: "para",
                description: "Embedded list entry, level 2",
                inform: "1",
                navigationText: "list item L2",
                userCanSetFilter: "0"
            },
            {
                name: "lim3",
                type: "para",
                description: "Embedded list entry, level 3",
                inform: "1",
                navigationText: "list item L3",
                userCanSetFilter: "0"
            },
            {
                name: "tr",
                type: "table",
                description: "A new table row",
                inform: "1",
                navigationText: "table row",
                userCanSetFilter: "0"
            },
            {
                name: "th1",
                type: "table",
                description: "A table heading, column 1",
                userCanSetFilter: "0"
            },
            {
                name: "th2",
                type: "table",
                description: "A table heading, column 2",
                userCanSetFilter: "0"
            },
            {
                name: "th3",
                type: "table",
                description: "A table heading, column 3",
                userCanSetFilter: "0"
            },
            {
                name: "th4",
                type: "table",
                description: "A table heading, column 4",
                userCanSetFilter: "0"
            },
            {
                name: "thr1",
                type: "table",
                description: "A table heading, column 1, right aligned",
                userCanSetFilter: "0"
            },
            {
                name: "thr2",
                type: "table",
                description: "A table heading, column 2, right aligned",
                userCanSetFilter: "0"
            },
            {
                name: "thr3",
                type: "table",
                description: "A table heading, column 3, right aligned",
                userCanSetFilter: "0"
            },
            {
                name: "thr4",
                type: "table",
                description: "A table heading, column 4, right aligned",
                userCanSetFilter: "0"
            },
            {
                name: "tc1",
                type: "table",
                description: "A table cell item, column 1",
                userCanSetFilter: "0"
            },
            {
                name: "tc2",
                type: "table",
                description: "A table cell item, column 2",
                userCanSetFilter: "0"
            },
            {
                name: "tc3",
                type: "table",
                description: "A table cell item, column 3",
                userCanSetFilter: "0"
            },
            {
                name: "tc4",
                type: "table",
                description: "A table cell item, column 4",
                userCanSetFilter: "0"
            },
            {
                name: "tcr1",
                type: "table",
                description: "A table cell item, column 1, right aligned",
                userCanSetFilter: "0"
            },
            {
                name: "tcr2",
                type: "table",
                description: "A table cell item, column 2, right aligned",
                userCanSetFilter: "0"
            },
            {
                name: "tcr3",
                type: "table",
                description: "A table cell item, column 3, right aligned",
                userCanSetFilter: "0"
            },
            {
                name: "tcr4",
                type: "table",
                description: "A table cell item, column 4, right aligned",
                userCanSetFilter: "0"
            },
            {
                name: "w",
                type: "char",
                endMarker: "w*",
                description: "A wordlist text item",
                userCanSetFilter: "0"
            },
            {
                name: "wr",
                type: "char",
                endMarker: "wr*",
                description: "A Wordlist text item",
                userCanSetFilter: "0"
            },
            {
                name: "wh",
                type: "char",
                endMarker: "wh*",
                description: "A Hebrew wordlist text item",
                userCanSetFilter: "0"
            },
            {
                name: "wa",
                type: "char",
                endMarker: "wa*",
                description: "Aramaic wordlist text item",
                userCanSetFilter: "0"
            },
            {
                name: "wg",
                type: "char",
                endMarker: "wg*",
                description: "A Greek Wordlist text item",
                userCanSetFilter: "0"
            },
            {
                name: "ndx",
                type: "char",
                endMarker: "ndx*",
                description: "A subject index text item",
                userCanSetFilter: "0"
            },
            {
                name: "p1",
                type: "para",
                description: "Front or back matter text paragraph, level 1 (if multiple levels)",
                inform: "1",
                navigationText: "Periph matter para L1",
                userCanSetFilter: "0"
            },
            {
                name: "k1",
                type: "para",
                description: "Concordance main entry text or keyword, level 1",
                inform: "1",
                navigationText: "conc main entry/keyword L1",
                userCanSetFilter: "0"
            },
            {
                name: "k2",
                type: "para",
                description: "Concordance main entry text or keyword, level 2",
                inform: "1",
                navigationText: "conc main entry/keyword L2",
                userCanSetFilter: "0"
            },
            {
                name: "pb",
                type: "para",
                description: "Page Break used for new reader portions and children's bibles where content is controlled by the page",
                inform: "1",
                navigationText: "new page",
                userCanSetFilter: "0"
            },
            {
                name: "b",
                type: "para",
                description: "Poetry text stanza break (e.g. stanza break) (basic)",
                inform: "1",
                navigationText: "stanza break",
                userCanSetFilter: "0"
            },
            {
                name: "hr",
                type: "para",
                description: "Horizontal rule",
                userCanSetFilter: "0"
            },
            {
                name: "loc",
                type: "para",
                description: "Picture location",
                userCanSetFilter: "0"
            },
            {
                name: "cat",
                type: "char",
                endMarker: "cat*",
                description: "Content category",
                userCanSetFilter: "0"
            },
            {
                name: "des",
                type: "para",
                description: "Picture description",
                userCanSetFilter: "0"
            },
            {
                name: "px",
                type: "para",
                description: "Paragraph extra 1",
                inform: "1",
                navigationText: "para extra 1",
                userCanSetFilter: "0"
            },
            {
                name: "pz",
                type: "para",
                description: "Paragraph extra 2",
                inform: "1",
                navigationText: "para extra 2",
                userCanSetFilter: "0"
            },
            {
                name: "qx",
                type: "para",
                description: "Poetry extra 1",
                inform: "1",
                navigationText: "poetry extra 1",
                userCanSetFilter: "0"
            },
            {
                name: "qz",
                type: "para",
                description: "Poetry extra 2",
                inform: "1",
                navigationText: "poetry extra 2",
                userCanSetFilter: "0"
            },
            {
                name: "addpn",
                type: "char",
                endMarker: "addpn*",
                description: "For chinese words to be dot underline and underline",
                userCanSetFilter: "0"
            },
            {
                name: "efm",
                type: "char",
                endMarker: "efm*",
                description: "ID or Caller for an extended (study) note. Used within a source project duplicte (target) text when autoring study material.",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "ef",
                type: "char",
                endMarker: "ef*",
                description: "A Study Note text item",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "z-ref",
                type: "ref",
                endMarker: "z-ref*",
                description: "USX ref marker",
                filter: "1",
                userCanSetFilter: "1"
            },
            /* EDB 5/27/21: could not find these in USFM 3.0 spec - are they still active? */
            {
                name: "bn",
                type: "para",
                description: "Psalms book number",
                userCanSetFilter: "1",
                navigationText: "Psalm book number",
                inform: "1"
            },
            {
                name: "sx",
                type: "para",
                description: "Extra heading 1",
                userCanSetFilter: "1",
                navigationText: "sect head extra 1",
                inform: "1"
            },
            {
                name: "sz",
                type: "para",
                description: "Extra heading 2",
                userCanSetFilter: "1",
                navigationText: "sect head extra 2",
                inform: "1"
            },
            /* end EDB 5/27/21 */
            /* AI-specific markers (filtered) */
            {
                name: "bt",
                type: "para",
                description: "Back-translation (and all \bt... initial forms)",
                filter: "1",
                inform: "1",
                navigationText: "back-trans",
                userCanSetFilter: "0"
            },
            {
                name: "free",
                type: "char",
                endMarker: "free*",
                description: "Free translation",
                filter: "1",
                inform: "1",
                navigationText: "free-trans",
                userCanSetFilter: "0"
            },
            {
                name: "note",
                type: "char",
                endMarker: "note*",
                description: "Adapt It note",
                filter: "1",
                inform: "1",
                navigationText: "note",
                userCanSetFilter: "0"
            },
            {
                name: "__normal",
                type: "para",
                description: "Normal",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_src_lang_interlinear",
                type: "para",
                description: "Source Language Interlinear Text",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_tgt_lang_interlinear",
                type: "para",
                description: "Target Language Interlinear Text",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_gls_lang_interlinear",
                type: "para",
                description: "Gloss Language Interlinear Text",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_nav_lang_interlinear",
                type: "para",
                description: "Navigation Language Interlinear Text",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_hdr_ftr_interlinear",
                type: "para",
                description: "Header-Footer Interlinear Text",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_small_para_break",
                type: "para",
                description: "Small Paragraph Break",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_body_text",
                type: "para",
                description: "Body Text",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_heading_base",
                type: "para",
                description: "Heading Base",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_intro_base",
                type: "para",
                description: "Intro Base",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_list_base",
                type: "para",
                description: "List Base",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_notes_base",
                type: "para",
                description: "Notes Base",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_peripherals_base",
                type: "para",
                description: "Peripherals Base",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_vernacular_base",
                type: "para",
                description: "Vernacular Base",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_annotation_ref",
                type: "para",
                description: "Annotation Reference",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_annotation_text",
                type: "para",
                description: "Annotation Text",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_dft_para_font",
                type: "para",
                description: "Default Paragraph Font",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_footnote_caller",
                type: "para",
                description: "Footnote Caller",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_normal_table",
                type: "para",
                description: "Normal Table",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_table_grid",
                type: "para",
                description: "Table Grid",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_footer",
                type: "para",
                description: "Footer",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_header",
                type: "para",
                description: "Header",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_horiz_rule",
                type: "para",
                description: "Horizontal Rule",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_single_boxed_para",
                type: "para",
                description: "Single Boxed Paragraph",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_double_boxed_para",
                type: "para",
                description: "Double Boxed Paragraph",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_unknown_para_style",
                type: "para",
                description: "Unknown Paragraph Style Marker",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_unknown_char_style",
                type: "para",
                description: "Unknown Character Style Marker",
                filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "_hidden_note",
                type: "para",
                description: "Hidden Note",
                filter: "1",
                userCanSetFilter: "0"
            }
        ],

        findByName = function (searchKey) {
            var deferred = $.Deferred();
            var results = markers.filter(function (element) {
                return element.name.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
            deferred.resolve(results);
            return deferred.promise();
        },

        Marker = Backbone.Model.extend({

            sync: function (method, model, options) {
                if (method === "read") {
                    findByName(this.data.name).done(function (data) {
                        options.success(data);
                    });
                }
            }

        }),

        MarkerCollection = Backbone.Collection.extend({

            model: Marker,

            sync: function (method, model, options) {
                if (method === "read") {
                    findByName(options.data.name).done(function (data) {
                        options.success(data);
                    });
                }
            }

        });

    return {
        Marker: Marker,
        MarkerCollection: MarkerCollection
    };

});
