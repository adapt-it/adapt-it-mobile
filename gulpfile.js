// Gulpfile for Adapt It Mobile builds
var gulp = require("gulp"),
    fs = require("fs"),
    path = require("path"),
    del = require('del'),
    buildDir = path.join(__dirname, 'build'),
    testPlatform = 'ios',
    pkg = require('./package.json'),
    jshint = require('gulp-jshint'),
    cordova_lib = require('cordova-lib'),
    cdv = cordova_lib.cordova.raw;

gulp.task("default", ["build"], function () {
    gutil.log("default taek");
    // Copy results to bin folder
    gulp.src("platforms/android/bin/*.apk").pipe(gulp.dest("bin/release/android"));         // Gradle build
    gulp.src("platforms/ios/build/device/*.ipa").pipe(gulp.dest("bin/release/ios"));
    // not currently building Windows UWP
//    gulp.src("platforms/windows/AppPackages/**/*").pipe(gulp.dest("bin/release/windows/AppPackages"));
});

gulp.task('build', function() {
    return cdv.build();
});

gulp.task('run', function(cb) {
    process.chdir(buildDir);
    return cdv.run({platforms:[testPlatform], options:['--device']});
});

gulp.task('emulate', function() {
    process.chdir(buildDir);
    return cdv.emulate({platforms:[testPlatform]});
});

gulp.task('release', function() {
    process.chdir(buildDir);
    return cdv.build({options: ['--release']});
    // TODO: copy the apk file(s) out of ./build/.
});

gulp.task('build-js', function() {
    process.chdir(buildDir);
    return gulp.src('js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('bundle.js'))
        //only uglify if gulp is ran with '--type production'
        .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop()) 
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/assets/javascript'));
});

// Create the cordova project under ./build/. This version doesn't use cordova
// create, instead just links config.xml and www/
gulp.task('recreate', ['clean'], function() {
    // TODO: remove "uri" when cordova-lib 0.21.7 is released.
    var srcDir = path.join(__dirname, 'src');

    fs.mkdirSync(buildDir);
    process.chdir(buildDir);

    fs.symlinkSync(path.join('..', 'src', 'config.xml'), 'config.xml');
    fs.symlinkSync(path.join('..', 'src', 'www'), 'www');
    // We could alternatively copy www and then watch it to copy changes.
    // Useful if using SASS CoffeeScrite etc.

    // Must first add plugins then platforms. If adding platforms first,
    // cordova fails expecting to find the ./build/plugins directory.
    // TODO: try 3rd param {cli_variables: {...}}.
    return cdv.plugins('add', plugins)
    .then(function() {
        return cdv.platform('add', platform_dirs);
    });
});

