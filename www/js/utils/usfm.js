/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        /* Converted from AI_USFM.xml, with non-settable markers at the end.
           Many of the style-related properties are moved to the styles.css file; the markers array in AIM
           only maintains the following properties:
           - name: the marker name (e.g. "h" for "\h")
           - description: brief description of the marker
           - filter: default marker state of the marker
           - userCanSetFilter: whether the marker can be filtered out
           - inform: whether the marker is displayed in the UI above the pile (if not, the filter / wedge icon is displayed)
        */
        markers = [
            {
                name: "h",
                description: "Running header text for a book (basic)",
                filter: "0",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "h1",
                description: "Running header text",
                filter: "0",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "h2",
                description: "Running header text, left side of page",
                filter: "0",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "h3",
                description: "Running header text, right side of page",
                filter: "0",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "rem",
                description: "Comments and remarks",
                filter: "1",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "sts",
                description: "Status of this file",
                filter: "1",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "lit",
                description: "For a comment or note inserted for liturgical use",
                filter: "1",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "nt",
                description: "Note",
                filter: "1",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "nc",
                description: "Note centered",
                filter: "1",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "ca",
                endMarker: "ca*",
                description: "Second (alternate) chapter number (for coding dual versification; useful for places where different traditions of chapter breaks need to be supported in the same translation)",
                filter: "1",
                userCanSetFilter: "1"
            },
            {
                name: "cl",
                description: "Chapter label used for translations that add a word such as 'Chapter' before chapter numbers (e.g. Psalms). The subsequent text is the chapter label.",
                filter: "1",
                userCanSetFilter: "1"
            },
            {
                name: "cp",
                description: "Published chapter number (this is a chapter marking that would be used in the published text)",
                filter: "1",
                userCanSetFilter: "1"
            },
            {
                name: "cd",
                description: "Chapter Description (Publishing option D, e.g. in Russian Bibles)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "va",
                endMarker: "va*",
                description: "Second (alternate) verse number (for coding dual numeration in Psalms; see also NRSV Exo 22.1-4)",
                filter: "1",
                userCanSetFilter: "1"
            },
            {
                name: "vp",
                endMarker: "vp*",
                description: "Published verse marker - this is a verse marking that would be used in the published text",
                filter: "1",
                userCanSetFilter: "1"
            },
            {
                name: "mt",
                description: "The main title of the book (if single level)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "mt1",
                description: "The main title of the book (if multiple levels) (basic)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "mt2",
                description: "A secondary title usually occurring before the main title (basic)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "mt3",
                description: "A secondary title occurring after the main title",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "mt4",
                description: "A small secondary title sometimes occuring within parentheses",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "st",
                description: "Secondary title",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "mte",
                description: "The main title of the book repeated at the end of the book (if single level)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "mte1",
                description: "The main title of the book repeated at the end of the book (if multiple levels)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "mte2",
                description: "A secondary title occurring before or after the 'ending' main title",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "div",
                description: "Division heading",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "bn",
                description: "Psalms book number",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "ms",
                description: "A major section division heading, level 1 (if single level) (basic)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "ms1",
                description: "A major section division heading, level 1 (if multiple levels)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "ms2",
                description: "A major section division heading, level 2",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "ms3",
                description: "A major section division heading, level 3",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "s",
                description: "A section heading, level 1 (if single level) (basic)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "s1",
                description: "A section heading, level 1 (if multiple levels)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "s2",
                description: "A section heading, level 2 (e.g. Proverbs 22-24)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "s3",
                description: "A section heading, level 3 (e.g. Genesis 'The First Day')",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "s4",
                description: "A section heading, level 4",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "sr",
                description: "A section division references range heading",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "sx",
                description: "Extra heading 1",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "sz",
                description: "Extra heading 2",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "sp",
                description: "A heading, to identify the speaker (e.g. Job) (basic)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "d",
                description: "A Hebrew text heading, to provide description (e.g. Psalms)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "di",
                description: "Descriptive title (Hebrew subtitle)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "hl",
                description: "Hebrew letter",
                filter: "1",
                userCanSetFilter: "1"
            },
            {
                name: "r",
                description: "Parallel reference(s) (basic)",
                filter: "1",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "dvrf",
                description: "Division reference",
                filter: "1",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "mr",
                description: "A major section division references range heading (basic)",
                filter: "1",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "br",
                description: "Psalms book reference",
                filter: "1",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "x",
                endMarker: "x*",
                description: "A list of cross references (basic)",
                filter: "1",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "rr",
                description: "Right margin reference",
                filter: "1",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "rq",
                endMarker: "rq*",
                description: "A cross-reference indicating the source text for the preceding quotation",
                filter: "1",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "@",
                description: "Cross reference, origin reference",
                filter: "1",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "xr",
                description: "Cross reference target references",
                filter: "1",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "pc",
                description: "Paragraph spanning chapters",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "pt",
                description: "Preface title",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "ps",
                description: "Preface section heading",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "ps",
                description: "Paragraph text, no break with next paragraph text at chapter boundary",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "pp",
                description: "Preface paragraph",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "pq",
                description: "Preface poetry",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "pm",
                description: "Preface continue at margin",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "qa",
                description: "Poetry text, Acrostic marker/heading",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "qs",
                endMarker: "qs*",
                description: "Poetry text, Selah",
                userCanSetFilter: "1"
            },
            {
                name: "f",
                endMarker: "f*",
                description: "A Footnote text item (basic)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "fe",
                endMarker: "fe*",
                description: "An Endnote text item",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "pro",
                endMarker: "pro*",
                description: "For indicating pronunciation in CJK texts",
                filter: "1",
                userCanSetFilter: "1"
            },
            {
                name: "imt",
                description: "Introduction main title, level 1 (if single level) (basic)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "imt1",
                description: "Introduction major title, level 1 (if multiple levels)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "imt2",
                description: "Introduction major title, level 2",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "imt3",
                description: "Introduction major title, level 3",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "imt4",
                description: "Introduction major title, level 4 (usually within parenthesis)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "imte",
                description: "Introduction major title at introduction end, level 1 (if single level)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "imte1",
                description: "Introduction major title at introduction end, level 1 (if multiple levels)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "imte2",
                description: "Introduction major title at introduction end, level 2",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "is",
                description: "Introduction section heading, level 1 (if single level) (basic)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "is1",
                description: "Introduction section heading, level 1 (if multiple levels)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "is2",
                description: "Introduction section heading, level 2",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "ip",
                description: "Introduction prose paragraph (basic)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "ipi",
                description: "Introduction prose paragraph, indented, with first line indent",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "ipq",
                description: "Introduction prose paragraph, quote from the body text",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "ipr",
                description: "Introduction prose paragraph, right aligned",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "iq",
                description: "Introduction poetry text, level 1 (if single level)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "iq1",
                description: "Introduction poetry text, level 1 (if multiple levels)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "iq2",
                description: "Introduction poetry text, level 2",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "iq3",
                description: "Introduction poetry text, level 3",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "im",
                description: "Introduction prose paragraph, with no first line indent (may occur after poetry)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "imi",
                description: "Introduction prose paragraph text, indented, with no first line indent",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "ili",
                description: "A list entry, level 1 (if single level)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "ili1",
                description: "A list entry, level 1 (if multiple levels)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "ili2",
                description: "A list entry, level 2",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "imq",
                description: "Introduction prose paragraph, quote from the body text, with no first line indent",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "ib",
                description: "Introduction blank line",
                filter: "1",
                userCanSetFilter: "1"
            },
            {
                name: "iot",
                description: "Introduction outline title (basic)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "io",
                description: "Introduction outline text, level 1 (if single level)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "io1",
                description: "Introduction outline text, level 1 (if multiple levels) (basic)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "io2",
                description: "Introduction outline text, level 2",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "io3",
                description: "Introduction outline text, level 3",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "io4",
                description: "Introduction outline text, level 4",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "ior",
                endMarker: "ior*",
                description: "Introduction references range for outline entry; for marking references separately",
                userCanSetFilter: "1"
            },
            {
                name: "iex",
                description: "Introduction explanatory or bridge text (e.g. explanation of missing book in Short Old Testament)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "iqt",
                endMarker: "iqt*",
                description: "For quoted scripture text appearing in the introduction",
                userCanSetFilter: "1"
            },
            {
                name: "gm",
                description: "Glossary main entry",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "gs",
                description: "Glossary subentry",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "gd",
                description: "Glossary definition",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "gp",
                description: "Glossary paragraph",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "tis",
                description: "Topical index heading (level 1)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "tpi",
                description: "Topical index heading (level 2)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "tps",
                description: "Topical index heading (level 3)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "tir",
                description: "Topical index reference",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "periph",
                description: "Periheral content division marker which should be followed by an additional division argument/title.",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "p2",
                description: "Front or back matter text paragraph, level 2 (if multiple levels)",
                userCanSetFilter: "1",
                inform: "1"
            },
            {
                name: "xtSee",
                endMarker: "xtSee*",
                description: "Concordance and Names Index markup for an alternate entry target reference.",
                userCanSetFilter: "1"
            },
            {
                name: "xtSeeAlso",
                endMarker: "xtSeeAlso*",
                description: "Concordance and Names Index markup for an additional entry target reference.",
                userCanSetFilter: "1"
            },
            {
                name: "pub",
                description: "Front matter publication data",
                userCanSetFilter: "1"
            },
            {
                name: "toc",
                description: "Front matter table of contents",
                userCanSetFilter: "1"
            },
            {
                name: "toc1",
                description: "Long table of contents text",
                userCanSetFilter: "1"
            },
            {
                name: "toc2",
                description: "Short table of contents text",
                userCanSetFilter: "1"
            },
            {
                name: "toc3",
                description: "Book Abbreviation",
                userCanSetFilter: "1"
            },
            {
                name: "pref",
                description: "Front matter preface",
                userCanSetFilter: "1"
            },
            {
                name: "intro",
                description: "Front matter introduction",
                userCanSetFilter: "1"
            },
            {
                name: "conc",
                description: "Back matter concordance",
                userCanSetFilter: "1"
            },
            {
                name: "glo",
                description: "Back matter glossary",
                userCanSetFilter: "1"
            },
            {
                name: "idx",
                description: "Back matter index",
                userCanSetFilter: "1"
            },
            {
                name: "maps",
                description: "Back matter map index",
                userCanSetFilter: "1"
            },
            {
                name: "cov",
                description: "Other peripheral materials - cover",
                userCanSetFilter: "1"
            },
            {
                name: "spine",
                description: "Other peripheral materials - spine",
                userCanSetFilter: "1"
            },
            {
                name: "pubinfo",
                description: "Publication information - Lang, Credit, Version, Copies, Publisher, Id, Logo",
                userCanSetFilter: "1"
            },
            {
                name: "fig",
                endMarker: "fig*",
                description: "Illustration [Columns to span, height, filename, caption text]",
                filter: "1",
                userCanSetFilter: "1"
            },
            {
                name: "cap",
                description: "Picture caption",
                filter: "1",
                userCanSetFilter: "1",
                inform: "1"
            },
            /* userCanSetFilter=0 elements -- these guys don't show up in the usfm filtering dialog;
               they're either always visible or always filtered out, depending on the inform property */
            {
                name: "id",
	            description: "File identification (BOOKID, FILENAME, EDITOR, MODIFICATION DATE)",
	            png: "1",
	            special: "1",
	            inform: "1",
                userCanSetFilter: "0"
            },
            {
                name: "ide",
	            description: "File encoding information",
	            usfm: "1",
	            filter: "1",
                userCanSetFilter: "0"
            },
            {
                name: "restore",
	            description: "Project restore information",
	            usfm: "1",
	            filter: "1"
            },
            {
                name: "c",
	            description: "Chapter number (basic)",
	            usfm: "1",
	            inform: "1"
            },
            {
                name: "v",
	            description: "A verse number (basic)",
	            usfm: "1",
                inform: "1"
            },
            {
                name: "vt",
	            description: "Verse text",
	            inform: "1"
            },
            {
                name: "vn",
	            description: "Verse number",
                inform: "1"
            },
            {
                name: "xo",
                endMarker: "xo*",
                description: "The cross reference origin reference (basic)",
                filter: "1",
                inform: "1"
            },
            {
                name: "xt",
                endMarker: "xt*",
                description: "The cross reference target reference(s), protocanon only (basic)",
                filter: "1",
                inform: "1"
            },
            {
                name: "xk",
                endMarker: "xk*",
                description: "A cross reference keyword",
                filter: "1",
                inform: "1"
            },
            {
                name: "xq",
                endMarker: "xq*",
                description: "A cross-reference quotation from the scripture text",
                filter: "1",
                inform: "1"
            },
            {
                name: "xot",
                endMarker: "xot*",
                description: "Cross-reference target reference(s), Old Testament only",
                filter: "1",
                inform: "1"
            },
            {
                name: "xnt",
                endMarker: "xnt*",
                description: "Cross-reference target reference(s), New Testament only",
                filter: "1",
                inform: "1"
            },
            {
                name: "xdc",
                endMarker: "xdc*",
                description: "Cross-reference target reference(s), Deuterocanon only",
                filter: "1",
                inform: "1"
            },
            {
                name: "p",
                description: "Paragraph text, with first line indent (basic)",
                inform: "1"
            },
            {
                name: "pi",
                description: "Paragraph text, level 1 indent (if sinlge level), with first line indent; often used for discourse (basic)",
                inform: "1"
            },
            {
                name: "pi1",
                description: "Paragraph text, level 1 indent (if multiple levels), with first line indent; often used for discourse",
                inform: "1"
            },
            {
                name: "pi2",
                description: "Paragraph text, level 2 indent, with first line indent; often used for discourse",
                inform: "1"
            },
            {
                name: "pi3",
                description: "Paragraph text, level 3 indent, with first line indent; often used for discourse",
                inform: "1"
            },
            {
                name: "pgi",
                description: "Indented paragraph",
                inform: "1"
            },
            {
                name: "ph",
                description: "Paragraph text, with level 1 hanging indent (if single level)",
                inform: "1"
            },
            {
                name: "ph1",
                description: "Paragraph text, with level 1 hanging indent (if multiple levels)",
                inform: "1"
            },
            {
                name: "ph2",
                description: "Paragraph text, with level 2 hanging indent",
                inform: "1"
            },
            {
                name: "ph3",
                description: "Paragraph text, with level 3 hanging indent",
                inform: "1"
            },
            {
                name: "phi",
	            description: "Paragraph text, indented with hanging indent",
                inform: "1"
            },
            {
                name: "m",
                description: "Paragraph text, with no first line indent (may occur after poetry) (basic)",
                inform: "1"
            },
            {
                name: "pmo",
                description: "Embedded text opening",
                inform: "1"
            },
            {
                name: "mi",
                description: "Paragraph text, indented, with no first line indent; often used for discourse",
                inform: "1"
            },
            {
                name: "pc",
                description: "Paragraph text, centered (for Inscription)",
                inform: "1"
            },
            {
                name: "pr",
                description: "Paragraph text, right aligned",
                inform: "1"
            },
            {
                name: "psi",
                description: "Paragraph text, indented, with no break with next paragraph text (at chapter boundary)",
                inform: "1"
            },
            {
                name: "pm",
                description: "Embedded text paragraph",
                inform: "1"
            },
            {
                name: "pmc",
                description: "Embedded text closing",
                inform: "1"
            },
            {
                name: "pmr",
                description: "Embedded text refrain (e.g. Then all the people shall say, 'Amen!')",
                inform: "1"
            },
            {
                name: "nb",
                description: "Paragraph text, with no break from previous paragraph text (at chapter boundary) (basic)",
                inform: "1"
            },
            {
                name: "cls",
                description: "Closure of an Epistle",
                inform: "1"
            },
            {
                name: "q",
                description: "Poetry text, level 1 indent (if single level)",
                inform: "1"
            },
            {
                name: "q1",
                description: "Poetry text, level 1 indent (if multiple levels) (basic)",
                inform: "1"
            },
            {
                name: "q2",
                description: "Poetry text, level 2 indent (basic)",
                inform: "1"
            },
            {
                name: "q3",
                description: "Poetry text, level 3 indent",
                inform: "1"
            },
            {
                name: "q4",
                description: "Poetry text, level 4 indent",
                inform: "1"
            },
            {
                name: "qc",
                description: "Poetry text, centered",
                inform: "1"
            },
            {
                name: "qr",
                description: "Poetry text, Right Aligned",
                inform: "1"
            },
            {
                name: "qac",
                endMarker: "qac*",
                description: "Poetry text, Acrostic markup of the first character of a line of acrostic poetry"
            },
            {
                name: "qm",
                description: "Poetry, left margin",
                inform: "1"
            },
            {
                name: "qm",
                description: "Poetry text, embedded, level 1 indent (if single level)",
                inform: "1"
            },
            {
                name: "qm1",
                description: "Poetry text, embedded, level 1 indent (if multiple levels)",
                inform: "1"
            },
            {
                name: "qm2",
                description: "Poetry text, embedded, level 2 indent",
                inform: "1"
            },
            {
                name: "qm3",
                description: "Poetry text, embedded, level 3 indent",
                inform: "1"
            },
            {
                name: "fe",
                description: "Footnote (end)"
            },
            {
                name: "fr",
                endMarker: "fr*",
                description: "The origin reference for the footnote (basic)",
                inform: "1"
            },
            {
                name: "fk",
                endMarker: "fk*",
                description: "A footnote keyword (basic)",
                inform: "1"
            },
            {
                name: "fq",
                endMarker: "fq*",
                description: "A footnote scripture quote or alternate rendering (basic)",
                inform: "1"
            },
            {
                name: "fqa",
                endMarker: "fqa*",
                description: "A footnote alternate rendering for a portion of scripture text",
                inform: "1"
            },
            {
                name: "fl",
                endMarker: "fl*",
                description: "A footnote label text item, for marking or 'labelling' the type or alternate translation being provided in the note.",
                inform: "1"
            },
            {
                name: "fp",
                endMarker: "fp*",
                description: "A Footnote additional paragraph marker",
                inform: "1"
            },
            {
                name: "ft",
                endMarker: "ft*",
                description: "Footnote text, Protocanon (basic)",
                inform: "1"
            },
            {
                name: "fdc",
                endMarker: "fdc*",
                description: "Footnote text, applies to Deuterocanon only",
                inform: "1"
            },
            {
                name: "fv",
                endMarker: "fv*",
                description: "A verse number within the footnote text",
                inform: "1"
            },
            {
                name: "fm",
                endMarker: "fm*",
                description: "An additional footnote marker location for a previous footnote",
                inform: "1"
            },
            {
                name: "F",
                description: "Footnote (end)"
            },
            {
                name: "qt",
                endMarker: "qt*",
                description: "For Old Testament quoted text appearing in the New Testament (basic)",
                inform: "1"
            },
            {
                name: "nd",
                endMarker: "nd*",
                description: "For name of deity (basic)"
            },
            {
                name: "tl",
                endMarker: "tl*",
                description: "For transliterated words"
            },
            {
                name: "dc",
                endMarker: "dc*",
                description: "Deuterocanonical/LXX additions or insertions in the Protocanonical text"
            },
            {
                name: "bk",
                endMarker: "bk*",
                description: "For the quoted name of a book"
            },
            {
                name: "sig",
                endMarker: "sig*",
                description: "For the signature of the author of an Epistle"
            },
            {
                name: "pn",
                endMarker: "pn*",
                description: "For a proper name"
            },
            {
                name: "wj",
                endMarker: "wj*",
                description: "For marking the words of Jesus"
            },
            {
                name: "k",
                endMarker: "k*",
                description: "For a keyword"
            },
            {
                name: "sls",
                endMarker: "sls*",
                description: "To represent where the original text is in a secondary language or from an alternate text source"
            },
            {
                name: "ord",
                endMarker: "ord*",
                description: "For the text portion of an ordinal number"
            },
            {
                name: "add",
                endMarker: "add*",
                description: "For a translational addition to the text",
                inform: "1"
            },
            {
                name: "no",
                endMarker: "no*",
                description: "A character style, use normal text"
            },
            {
                name: "bd",
                endMarker: "bd*",
                description: "A character style, use bold text"
            },
            {
                name: "it",
                endMarker: "it*",
                description: "A character style, use italic text"
            },
            {
                name: "bdit",
                endMarker: "bdit*",
                description: "A character style, use bold + italic text"
            },
            {
                name: "em",
                endMarker: "em*",
                description: "A character style, use emphasized text style"
            },
            {
                name: "sc",
                endMarker: "sc*",
                description: "A character style, for small capitalization text"
            },
            {
                name: "ie",
                description: "Introduction ending marker"
            },
            {
                name: "li",
                description: "A list entry, level 1 (if single level)",
                inform: "1"
            },
            {
                name: "li1",
                description: "A list entry, level 1 (if multiple levels)",
                inform: "1"
            },
            {
                name: "li2",
                description: "A list entry, level 2",
                inform: "1"
            },
            {
                name: "li3",
                description: "A list entry, level 3",
                inform: "1"
            },
            {
                name: "li4",
                description: "A list entry, level 4",
                inform: "1"
            },
            {
                name: "qh",
                description: "List or Genealogy",
                inform: "1"
            },
            {
                name: "tr",
                description: "A new table row",
                inform: "1"
            },
            {
                name: "tr1",
                description: "A table Row",
                inform: "1"
            },
            {
                name: "tr2",
                description: "A table Row",
                inform: "1"
            },
            {
                name: "th1",
                description: "A table heading, column 1"
            },
            {
                name: "th2",
                description: "A table heading, column 2"
            },
            {
                name: "th3",
                description: "A table heading, column 3"
            },
            {
                name: "th4",
                description: "A table heading, column 4"
            },
            {
                name: "thr1",
                description: "A table heading, column 1, right aligned"
            },
            {
                name: "thr2",
                description: "A table heading, column 2, right aligned"
            },
            {
                name: "thr3",
                description: "A table heading, column 3, right aligned"
            },
            {
                name: "thr4",
                description: "A table heading, column 4, right aligned"
            },
            {
                name: "tc1",
                description: "A table cell item, column 1"
            },
            {
                name: "tc2",
                description: "A table cell item, column 2"
            },
            {
                name: "tc3",
                description: "A table cell item, column 3"
            },
            {
                name: "tc4",
                description: "A table cell item, column 4"
            },
            {
                name: "tcr1",
                description: "A table cell item, column 1, right aligned"
            },
            {
                name: "tcr2",
                description: "A table cell item, column 2, right aligned"
            },
            {
                name: "tcr3",
                description: "A table cell item, column 3, right aligned"
            },
            {
                name: "tcr4",
                description: "A table cell item, column 4, right aligned"
            },
            {
                name: "w",
                endMarker: "w*",
                description: "A wordlist text item"
            },
            {
                name: "wr",
                endMarker: "wr*",
                description: "A Wordlist text item"
            },
            {
                name: "wh",
                endMarker: "wh*",
                description: "A Hebrew wordlist text item"
            },
            {
                name: "wg",
                endMarker: "wg*",
                description: "A Greek Wordlist text item"
            },
            {
                name: "ndx",
                endMarker: "ndx*",
                description: "A subject index text item"
            },
            {
                name: "p1",
                description: "Front or back matter text paragraph, level 1 (if multiple levels)",
                inform: "1"
            },
            {
                name: "k1",
                description: "Concordance main entry text or keyword, level 1",
                inform: "1"
            },
            {
                name: "k2",
                description: "Concordance main entry text or keyword, level 2",
                inform: "1"
            },
            {
                name: "pb",
                description: "Page Break used for new reader portions and children's bibles where content is controlled by the page",
                inform: "1"
            },
            {
                name: "b",
                description: "Poetry text stanza break (e.g. stanza break) (basic)",
                inform: "1"
            },
            {
                name: "hr",
                description: "Horizontal rule"
            },
            {
                name: "loc",
                description: "Picture location"
            },
            {
                name: "cat",
                description: "Picture catalog number"
            },
            {
                name: "des",
                description: "Picture description"
            },
            {
                name: "px",
                description: "Paragraph extra 1",
                inform: "1"
            },
            {
                name: "pz",
                description: "Paragraph extra 2",
                inform: "1"
            },
            {
                name: "qx",
                description: "Poetry extra 1",
                inform: "1"
            },
            {
                name: "qz",
                description: "Poetry extra 2",
                inform: "1"
            },
            {
                name: "addpn",
                endMarker: "addpn*",
                description: "For chinese words to be dot underline and underline"
            },
            {
                name: "efm",
                endMarker: "efm*",
                description: "ID or Caller for an extended (study) note. Used within a source project duplicte (target) text when autoring study material.",
                filter: "1"
            },
            {
                name: "ef",
                endMarker: "ef*",
                description: "A Study Note text item",
                filter: "1"
            },
            /* AI-specific markers (filtered) */
            {
                name: "bt",
                description: "Back-translation (and all \bt... initial forms)",
                filter: "1",
                inform: "1"
            },
            {
                name: "free",
                endMarker: "free*",
                description: "Free translation",
                filter: "1",
                inform: "1"
            },
            {
                name: "note",
                endMarker: "note*",
                description: "Adapt It note",
                filter: "1",
                inform: "1"
            },
            {
                name: "__normal",
                description: "Normal",
                filter: "1"
            },
            {
                name: "_src_lang_interlinear",
                description: "Source Language Interlinear Text",
                filter: "1"
            },
            {
                name: "_tgt_lang_interlinear",
                description: "Target Language Interlinear Text",
                filter: "1"
            },
            {
                name: "_gls_lang_interlinear",
                description: "Gloss Language Interlinear Text",
                filter: "1"
            },
            {
                name: "_nav_lang_interlinear",
                description: "Navigation Language Interlinear Text",
                filter: "1"
            },
            {
                name: "_hdr_ftr_interlinear",
                description: "Header-Footer Interlinear Text",
                filter: "1"
            },
            {
                name: "_small_para_break",
                description: "Small Paragraph Break",
                filter: "1"
            },
            {
                name: "_body_text",
                description: "Body Text",
                filter: "1"
            },
            {
                name: "_heading_base",
                description: "Heading Base",
                filter: "1"
            },
            {
                name: "_intro_base",
                description: "Intro Base",
                filter: "1"
            },
            {
                name: "_list_base",
                description: "List Base",
                filter: "1"
            },
            {
                name: "_notes_base",
                description: "Notes Base",
                filter: "1"
            },
            {
                name: "_peripherals_base",
                description: "Peripherals Base",
                filter: "1"
            },
            {
                name: "_vernacular_base",
                description: "Vernacular Base",
                filter: "1"
            },
            {
                name: "_annotation_ref",
                description: "Annotation Reference",
                filter: "1"
            },
            {
                name: "_annotation_text",
                description: "Annotation Text",
                filter: "1"
            },
            {
                name: "_dft_para_font",
                description: "Default Paragraph Font",
                filter: "1"
            },
            {
                name: "_footnote_caller",
                description: "Footnote Caller",
                filter: "1"
            },
            {
                name: "_normal_table",
                description: "Normal Table",
                filter: "1"
            },
            {
                name: "_table_grid",
                description: "Table Grid",
                filter: "1"
            },
            {
                name: "_footer",
                description: "Footer",
                filter: "1"
            },
            {
                name: "_header",
                description: "Header",
                filter: "1"
            },
            {
                name: "_horiz_rule",
                description: "Horizontal Rule",
                filter: "1"
            },
            {
                name: "_single_boxed_para",
                description: "Single Boxed Paragraph",
                filter: "1"
            },
            {
                name: "_double_boxed_para",
                description: "Double Boxed Paragraph",
                filter: "1"
            },
            {
                name: "_unknown_para_style",
                description: "Unknown Paragraph Style Marker",
                filter: "1"
            },
            {
                name: "_unknown_char_style",
                description: "Unknown Character Style Marker",
                filter: "1"
            },
            {
                name: "_hidden_note",
                description: "Hidden Note",
                filter: "1"
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
