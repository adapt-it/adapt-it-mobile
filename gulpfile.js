// Gulpfile for Adapt It Mobile builds
var gulp = require("gulp"),
    fs = require("fs"),
    cordova = require("cordova-lib").cordova;

// call "cordova platform add android" if needed
gulp.task("prep-android-dir", function (done) {
    var path = "./platforms/android";
    if (!fs.existsSync(path)) {
        process.stdout.write('Android dir not detected -- creating platform android\n');
        cordova.platforms("add", "android");
        done();
    } else {
        process.stdout.write('cleaning platform android\n');
        cordova.clean("android");
        done();
    }
});

gulp.task("build-android", gulp.series("prep-android-dir"), function (done) {
    cordova.build({
        "platforms": ["android"],
        "options": {
            argv: ["--release", "--verbose", "--buildConfig=build.json", "--gradleArg=--no-daemon"]
        }
    }, done());
});

// call "cordova platform add ios" if needed
gulp.task("prep-ios-dir", function (done) {
    var path = "./platforms/ios";
    if (!fs.existsSync(path)) {
        process.stdout.write('ios dir not detected -- creating platform ios\n');
        cordova.platforms("add", "ios");
        done();
    } else {
        process.stdout.write('cleaning platform ios\n');
        cordova.clean("ios");
        done();
    }
});

gulp.task("build-ios", gulp.series("prep-ios-dir"), function (done) {
    cordova.build({
        "platforms": ["ios"],
        "options": {
            argv: ["--release", "--verbose", "--buildConfig=build.json", "--device"]
        }
    }, done());
});

gulp.task("build", gulp.parallel("build-android", "build-ios"));

gulp.task("default", gulp.series("build"), function () {
    // Copy results to bin folder
    gulp.src("platforms/android/app/build/output/apk/release/*.apk").pipe(gulp.dest("bin/release/android"));         // Gradle build
    // gulp.src("platforms/ios/build/device/*.ipa").pipe(gulp.dest("bin/release/ios"));
});
