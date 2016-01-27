/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require) {

    "use strict";

    var $ = require('jquery');

    return function PageSlider(container) {

        var theContainer = container,
            currentPage,
            stateHistory = [];

        this.back = function () {
            location.hash = stateHistory[stateHistory.length - 2];
        };

        // Use this function if you want PageSlider to automatically determine the sliding direction based on the state history
        this.slidePage = function (page) {

            var l = stateHistory.length,
                state = window.location.hash;

            if (l === 0) {
                stateHistory.push(state);
                this.slidePageFrom(page);
                return;
            }
            if (state === stateHistory[l - 2]) {
                stateHistory.pop();
                this.slidePageFrom(page, 'page-left');
            } else {
                stateHistory.push(state);
                this.slidePageFrom(page, 'page-right');
            }

        };

        // Use this function directly if you want to control the sliding direction outside PageSlider
        this.slidePageFrom = function (page, from) {
            
//            console.log("slidePageFrom: " + page + ", " + from);

            theContainer.append(page);

            if (!currentPage || !from) {
                page.attr("class", "page page-center");
                currentPage = page;
                return;
            }

            // Position the page at the starting position of the animation
            page.attr("class", "page " + from);

            currentPage.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function (e) {
                console.log("transitionend: " + e.target);
                $(e.target).remove();
            });

            // EDB BUGBUG 1/27/2016:
            // Caught between a rock and a hard place.
            // Issue: the animation here doesn't work in older Android browsers. 
            // Details: Forcing the reflow does create the animation of sliding pages, 
            //          but on older browsers the page slides mostly offscreen (see 
            //          our issue #73). I'm unsure of where the problem lies, as it 
            //          does work properly on newer browsers - caniuse.com states that
            //          3d transforms are supported on older versions of the Android
            //          browser, but I've seen a few mentions that older Android 
            //          devices don't support 3d trandsforms in hardware.
            // Workaround that broke: we initially went with the crosswalk browser plugin,
            //          that replaces the normal webview with the latest Chromium browser.
            //          This created more headaches than it solved -- multiple .apk files
            //          for x86 and AMD, but more of sn issue, it didn't work on several
            //          Android devices. We had to pull it.
            // Current workaround: remove crosswalk AND remove the force reflow here. The 
            //          implication is that we don't get a nice animation, but it'll work
            //          on all browsers. This should be revisited to see if we can't get
            //          at least SOME animation to work.
            // Force reflow. More information here: http://www.phpied.com/rendering-repaint-reflowrelayout-restyle/
//            var temp = theContainer[0].offsetWidth;
            // end EDB BUGBUG
            
            // Position the new page and the current page at the ending position of their animation with a transition class indicating the duration of the animation
            page.attr("class", "page transition page-center");
            currentPage.attr("class", "page transition " + (from === "page-left" ? "page-right" : "page-left"));
            currentPage = page;
        };
    };

});