const fs = require('fs');
const cp = require('child_process');
const path = require('path');

module.exports = function(ctx) {
    // Android / iOS -- minify and copy over the langtags.js file
    // cp.exec('terser langtags.js -o ../www/lib/langtags.min.js');
    // Android -- copy the build-extras.gradle file into the app directory so it gets run
    if (ctx.opts.platforms.includes('android'))  {
        fs.copyFile(path.join(ctx.opts.projectRoot, 'scripts/build-extras.gradle'), path.join(ctx.opts.projectRoot, 'platforms/android/app/build-extras.gradle'), (err) => {
            if (err) throw err;
            console.log('build-extras.gradle copied to android/app directory');
        });
    }
};