var IcomaticUtils = (function() {
return {
fallbacks: [{ from: 'roundedrectangleoutline', 'to': '\ue043' },{ from: 'rectangleoutline', 'to': '\ue040' },{ from: 'circleoutline', 'to': '\ue015' },{ from: 'imageoutline', 'to': '\ue02b' },{ from: 'hipstamatic', 'to': '\ue029' },{ from: 'videocamera', 'to': '\ue052' },{ from: 'arrowright', 'to': '\ue003' },{ from: 'attachment', 'to': '\ue005' },{ from: 'githubtext', 'to': '\ue025' },{ from: 'googleplus', 'to': '\ue027' },{ from: 'arrowdown', 'to': '\ue001' },{ from: 'arrowleft', 'to': '\ue002' },{ from: 'backlight', 'to': '\ue008' },{ from: 'checkmark', 'to': '\ue014' },{ from: 'nextlight', 'to': '\ue033' },{ from: 'pinterest', 'to': '\ue03a' },{ from: 'wordpress', 'to': '\ue056' },{ from: 'audiooff', 'to': '\ue006' },{ from: 'bookmark', 'to': '\ue00b' },{ from: 'calendar', 'to': '\ue00e' },{ from: 'collapse', 'to': '\ue017' },{ from: 'computer', 'to': '\ue019' },{ from: 'download', 'to': '\ue01b' },{ from: 'dribbble', 'to': '\ue01c' },{ from: 'facebook', 'to': '\ue020' },{ from: 'favorite', 'to': '\ue021' },{ from: 'feedback', 'to': '\ue022' },{ from: 'linkedin', 'to': '\ue02e' },{ from: 'listview', 'to': '\ue02f' },{ from: 'location', 'to': '\ue030' },{ from: 'question', 'to': '\ue03f' },{ from: 'settings', 'to': '\ue047' },{ from: 'tileview', 'to': '\ue04b' },{ from: 'arrowup', 'to': '\ue004' },{ from: 'behance', 'to': '\ue00a' },{ from: 'comment', 'to': '\ue018' },{ from: 'preview', 'to': '\ue03d' },{ from: 'refresh', 'to': '\ue041' },{ from: 'retweet', 'to': '\ue042' },{ from: 'twitter', 'to': '\ue04e' },{ from: 'camera', 'to': '\ue010' },{ from: 'cancel', 'to': '\ue011' },{ from: 'delete', 'to': '\ue01a' },{ from: 'expand', 'to': '\ue01f' },{ from: 'flickr', 'to': '\ue023' },{ from: 'folder', 'to': '\ue024' },{ from: 'github', 'to': '\ue026' },{ from: 'pencil', 'to': '\ue037' },{ from: 'picasa', 'to': '\ue039' },{ from: 'plugin', 'to': '\ue03b' },{ from: 'search', 'to': '\ue046' },{ from: 'tablet', 'to': '\ue049' },{ from: 'tumblr', 'to': '\ue04d' },{ from: 'unlock', 'to': '\ue04f' },{ from: 'upload', 'to': '\ue050' },{ from: 'alert', 'to': '\ue000' },{ from: 'audio', 'to': '\ue007' },{ from: 'brush', 'to': '\ue00c' },{ from: 'build', 'to': '\ue00d' },{ from: 'cloud', 'to': '\ue016' },{ from: 'email', 'to': '\ue01d' },{ from: 'error', 'to': '\ue01e' },{ from: 'group', 'to': '\ue028' },{ from: 'image', 'to': '\ue02c' },{ from: 'minus', 'to': '\ue032' },{ from: 'phone', 'to': '\ue038' },{ from: 'print', 'to': '\ue03e' },{ from: 'share', 'to': '\ue048' },{ from: 'vimeo', 'to': '\ue054' },{ from: 'back', 'to': '\ue009' },{ from: 'call', 'to': '\ue00f' },{ from: 'cart', 'to': '\ue012' },{ from: 'chat', 'to': '\ue013' },{ from: 'home', 'to': '\ue02a' },{ from: 'like', 'to': '\ue02d' },{ from: 'lock', 'to': '\ue031' },{ from: 'next', 'to': '\ue034' },{ from: 'page', 'to': '\ue035' },{ from: 'path', 'to': '\ue036' },{ from: 'plus', 'to': '\ue03c' },{ from: 'save', 'to': '\ue045' },{ from: 'text', 'to': '\ue04a' },{ from: 'time', 'to': '\ue04c' },{ from: 'user', 'to': '\ue051' },{ from: 'view', 'to': '\ue053' },{ from: 'wifi', 'to': '\ue055' },{ from: 'rss', 'to': '\ue044' }],
substitute: function(el) {
    var curr = el.firstChild;
    var next, alt;
    var content;
    while (curr) {
        next = curr.nextSibling;
        if (curr.nodeType === Node.TEXT_NODE) {
            content = curr.nodeValue;
            for (var i = 0; i < IcomaticUtils.fallbacks.length; i++) {
                content = content.replace( IcomaticUtils.fallbacks[i].from, function(match) {
                    alt = document.createElement('span');
                    alt.setAttribute('class', 'icomatic-alt');
                    alt.innerHTML = match;
                    el.insertBefore(alt, curr);
                    return IcomaticUtils.fallbacks[i].to;
                });
            }
            alt = document.createTextNode(content);
            el.replaceChild(alt, curr);
        }
        curr = next;
    }
},
run: function(force) {
    force = typeof force !== 'undefined' ? force : false;
    var s = getComputedStyle(document.body);
    if (('WebkitFontFeatureSettings' in s)
        || ('MozFontFeatureSettings' in s)
        || ('MsFontFeatureSettings' in s)
        || ('OFontFeatureSettings' in s)
        || ('fontFeatureSettings' in s))
        if (!force)
            return;
    var els = document.querySelectorAll('.icomatic');
    for (var i = 0; i < els.length; i++)
        IcomaticUtils.substitute(els[i]);
}
} // end of object
} // end of fn
)()