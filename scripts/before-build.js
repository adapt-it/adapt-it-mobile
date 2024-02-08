const fs = require('fs');
const path = require('path');

module.exports = function(ctx) {
    // Android -- copy the build-extras.gradle file into the app directory so it gets run
    if (ctx.opts.platforms.includes('android'))  {
        fs.copyFile(path.join(ctx.opts.projectRoot, 'scripts/build-extras.gradle'), path.join(ctx.opts.projectRoot, 'platforms/android/app/build-extras.gradle'), (err) => {
            if (err) throw err;
            console.log('build-extras.gradle copied to android/app directory');
        });
    }
};