var next_pile_idx = 0, next_strip_idx = 0;
var selected;

function create_pile(source_text, target_text) {
    var pile, source, target, edit;

    pile = document.createElement('div');
    pile.id = "pile-" + next_pile_idx;
    pile.className = "pile";

    source = document.createElement('div');
    source.id = "source-" + next_pile_idx;
    source.className = 'source';
    source.innerHTML = source_text;
    pile.appendChild(source);

    target = document.createElement('div');
    target.id = "target-" + next_pile_idx;
    target.className = 'target';
    pile.appendChild(target);

    edit = document.createElement('input');
    edit.id = "target-edit-" + next_pile_idx;
    edit.className = "target-edit";
    edit.type = "text";
    edit.value = target_text;
    edit.size = target_text.length + 2;

    // Allow clicking directly on the input box
    edit.addEventListener("mousedown", function (event) {
        //console.log('mousedown on ' + edit.id);
        Util.stopPropagation(event);
    }, false);
    edit.addEventListener("keydown", function (event) {
        if ((event.keyCode === 9) ||
            (event.keyCode === 13)) {
            var next_edit = null;
            // If tab/enter is pressed, blur and move to edit the next pile
            Util.stopEvent(event);
            edit.blur();

            if (event.shiftKey) {
                next_edit = pile.previousSibling;
                if (next_edit.id.substr(0,4) !== "pile") {
                    // Probably a header
                    next_edit = null;
                }
            } else {
                next_edit = pile.nextSibling;
            }
            if (next_edit) {
                //console.log("next edit: " + next_edit.id);
                // Do it in a new execution context for iOS
                //setTimeout(function () { edit_pile(next_edit); }, 10);
                edit_pile(next_edit);
            }
        }
    }, false);
    edit.onblur = function () {
        // Reset the input box to plain text
        var new_ttext = edit.value;
        //console.log("new_ttext.length: " + new_ttext.length);

        edit.size = new_ttext.length;
    }
    target.appendChild(edit);

    next_pile_idx++;
    return pile;
}

function create_strip(into, title, word_string) {
    var id = "strip-" + next_strip_idx,
        strip, header, pile,
        i, words = word_string.split(' ');

    strip = document.createElement('div');
    strip.id = id;
    strip.className = "strip";
    next_strip_idx++;

    header = document.createElement('div');
    header.id = id + "-header";
    header.className = "strip-header";
    header.innerHTML = title;
    strip.appendChild(header);

    for (i = 0; i < words.length; i++) {
    //    var pile = create_pile(words[i], "*" + words[i] + "*");
		var pile = create_pile(words[i], words[i]);
		strip.appendChild(pile);
    }

    document.getElementById(into).appendChild(strip);

    // Activate select list for this strip
    strip.selectlist = SelectList('#' + id + ' .pile',
                                  'ui-selecting',
                                  'ui-selected',
                                  {callback: handle_select,
                                   longclick_time: 333});
}

function edit_pile (pile) {
    var edit = $(".target .target-edit", pile)[0];

    //console.log("editing " + pile.id);

    //setTimeout(function () { edit.focus(); }, 20);
    //edit.select();
    edit.setSelectionRange(0, 9999);
    edit.focus();
}

function handle_select(selected, dblclick, longclick) {
    //console.log(">> handle_select: " + selected.length);

    var strip = selected[0].parentNode;

    /*
    if (pile_edit) {
        pile_edit.blur();
    }
    */

    if (selected.length === 1) {
    	// allow creation of retranslation
    	// Don't allow the creation of a new phrase, but do allow the user to uncreate one
        $("#tb-phrase").attr("disabled", true);
        $("#tb-retranslation").removeAttr("disabled");
    	
        if (longclick) {
            // Long click to edit pile
            
            edit_pile(selected[0]);

        } else if (dblclick) {
            // Split one pile

            var cur_box = selected[0], new_box,
                strip = cur_box.parentNode,
                src = $('#' + cur_box.id + " .source")[0],
                swords = src.innerHTML.split(" "),
                tgt = $('#' + cur_box.id + " .target")[0];

            // Split based on source words
            // Put all target words in the first pile
            if (swords.length > 1) {
                src.innerHTML = swords[0];

                for (i = swords.length - 1; i > 0; i--) {
                    new_box = create_pile(swords[i], "");
                    strip.insertBefore(new_box, cur_box.nextSibling);
                }
            }
        } else if (!dblclick) {
            // Single pile clicked/selected

            //console.log("Selected " + selected[0].id);

        }

    } else if (selected.length > 1) {
    	// allow creation of placeholder, phrase and retranslation
        $("#tb-placeholder").removeAttr("disabled");
        $("#tb-phrase").removeAttr("disabled");
        $("#tb-retranslation").removeAttr("disabled");
/*
    	// Join multiple piles

        var first = selected[0],
            smsg, tmsg, new_pile;

        // Join source and target words into one new pile
        smsg = $.map(selected, function (o) {
            return $("#" + o.id + " .source").text();
        }).join(" ");
        tmsg = $.map(selected, function (o) {
            return $("#" + o.id + " .target .target-edit")[0].value;
        }).join(" ");

        new_pile = create_pile(smsg, tmsg);
        $(first).before(new_pile);

        // Remove all prior selected piles
        for (i = 0; i < selected.length; i++ ) {
            strip.removeChild(selected[i]);
        }
*/
    } else if (selected.length < 1) {
    	// nothing selected - do not allow creation of phrase or retranslation
        $("#tb-phrase").attr("disabled", true);
        $("#tb-retranslation").attr("disabled", true);    
    }

    if (selected.length !== 1) {
        this.clear();
    }
}

/* toolbar button handlers */
// togglePhrase
// Toggles (creates or destroys) a phrase:
// - If the current word selection does not have a phrase associated with it
//   a new phrase is created.
// - If there is a phrase in the word selection, but it doesn't match the bounds
//   of the selection, the phrase is expanded to match the word selection.
// - If the word selection is a phrase, the phrase is destroyed. 
// This behavior is similar to that of the desktop AI.
function togglePhrase() {
	alert("Phrase");
	// get the current (new) checkbox value
	var checked = $("#tb-phrase").attr("checked");
	// create phrase
	if (checked = "checked") {
		// Join multiple piles
	    var first = selected[0],
	        smsg, tmsg, new_pile;
	
	    // Join source and target words into one new pile
	    smsg = $.map(selected, function (o) {
	        return $("#" + o.id + " .source").text();
	    }).join(" ");
	    tmsg = $.map(selected, function (o) {
	        return $("#" + o.id + " .target .target-edit")[0].value;
	    }).join(" ");
	
	    new_pile = create_pile(smsg, tmsg);
	    $(first).before(new_pile);
	
	    // Remove all prior selected piles
	    for (i = 0; i < selected.length; i++ ) {
	        strip.removeChild(selected[i]);
	    }
	}
	else {
		// unmake the phrase
	}
}

// togglePlaceholder
// Toggles (creates or destroys) a placeholder:
// - If the current starting point of the word selection does not have a placeholder associated with it
//   a new placeholder is created.
// - If there is a placeholder associated with the starting point of the word selection,
//   the placeholder is removed. 
// This behavior is similar to that of the desktop AI.
function togglePlaceholder() {
	alert("placeholder");
	// get the current (new) checkbox value
	alert($("#tb-placeholder").attr("checked"));
}

// toggleRetranslation
// Toggles (creates or destroys) a retranslation:
// - If the current word selection does not have a placeholder associated with it
//   a new placeholder is created.
// - If the word selection is associated with a retranslation, the retranslation is destroyed. 
// This behavior is similar to that of the desktop AI.
function toggleRetranslation() {
	alert("retranslation");
	// get the current (new) checkbox value
	alert($("#tb-retranslation").attr("checked"));
}

function doUndo() {
	alert("undo");
}

// doGoBack
// Sets the current focus to the first edit field in the _previous_ chapter (if available).
// This can either be a verse or section description before a verse.
// This behavior is similar to that of the desktop AI.
function doGoBack() {
	alert("Go Back");
}

// doGoBack
// Sets the current focus to the first edit field in the _next_ chapter (if available).
// This can either be a verse or section description before a verse.
// This behavior is similar to that of the desktop AI.
function doGoForward() {
	alert("Go Forward");
}

$(document).ready(function() {
    var v;

    for (v = 1; v <= source_text.verses; v++) {
        var strip = create_strip("chapter", v, source_text[v]);
    }
    
    // disable the phrase and retranslation buttons (placeholder is OK)
    $("#tb-phrase").attr("disabled", true);
    $("#tb-retranslation").attr("disabled", true);
    
    // wire up the button handlers
    $("#tb-undo").bind("click", function() {
    	doUndo();
    });
    $("#tb-goback").bind("click", function() {
    	doGoBack();
    });
    $("#tb-goforward").bind("click", function() {
    	doGoForward();
    });
    $("#tb-phrase").bind("click", function() {
    	togglePhrase();
    });
    $("#tb-placeholder").bind("click", function() {
    	togglePlaceholder();
    });
    $("#tb-retranslation").bind("click", function() {
    	toggleRetranslation();
    });
    
});