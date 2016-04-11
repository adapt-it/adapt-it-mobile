// iosAfterPrepare.js
// Node.js build script run after "cordova ios prepare" (part of cordova build).
// This adds the various orientations to the plist file for your project.

module.exports = function (context) {
    var fs    = require('fs'),     // nodejs.org/api/fs.html
        plist = require('plist'),  // www.npmjs.com/package/plist
        // Here you will replace the product name with yours, so that the .plist file can be found
        FILEPATH = 'platforms/ios/Adapt\ It\ Mobile/Adapt\ It\ Mobile-Info.plist',
        xml = fs.readFileSync(FILEPATH, 'utf8'),
        obj = plist.parse(xml);

    obj.UISupportedInterfaceOrientations = [
        "UIInterfaceOrientationPortrait",
        "UIInterfaceOrientationPortraitUpsideDown",
        "UIInterfaceOrientationLandscapeLeft",
        "UIInterfaceOrientationLandscapeRight"
    ];
    
    obj.UIFileSharingEnabled = "YES";

    xml = plist.build(obj);
    fs.writeFileSync(FILEPATH, xml, { encoding: 'utf8' });

};