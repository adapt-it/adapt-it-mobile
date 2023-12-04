// Gulpfile for Adapt It Mobile builds
var gulp = require("gulp"),
    fs = require("fs"),
    cp = require('child_process'),
    cordova = require("cordova-lib").cordova;

// prep the Android platform -- either add it or clean it
gulp.task("prep-android-dir", function (done) {
    var path = "./platforms/android";
    if (!fs.existsSync(path)) {
        process.stdout.write('Android dir not detected -- creating platform android\n');
        var cmd = cp.spawn('cordova', ["platform", "add", "android"], {stdio: 'inherit'}).on('exit', done);
    } else {
        process.stdout.write('cleaning platform android\n');
        cordova.clean("android");
        done();
    }
});

// build Android
gulp.task("build-android", function (done) {
    cordova.build({
        "platforms": ["android"],
        "options": {
            argv: ["--release", "--verbose", "--buildConfig=build.json", "--gradleArg=--no-daemon"]
        }
    }, done());
});

// prep the iOS platform -- either add it or clean it
gulp.task("prep-ios-dir", function (done) {
    var path = "./platforms/ios";
    if (!fs.existsSync(path)) {
        process.stdout.write('ios dir not detected -- creating platform ios\n');
        var cmd = cp.spawn('cordova', ["platform", "add", "ios@latest"], {stdio: 'inherit'}).on('exit', done);
    } else {
        process.stdout.write('cleaning platform ios\n');
        cordova.clean("ios");
        done();
    }
});

// build iOS
gulp.task("build-ios", function (done) {
    cordova.build({
        "platforms": ["ios"],
        "options": {
            argv: ["--release", "--verbose", "--buildConfig=build.json", "--device"]
        }
    }, done());
});

// prep both Android and iOS
gulp.task("prep", gulp.parallel("prep-android-dir", "prep-ios-dir"));

// build both Android and iOS
gulp.task("build", gulp.parallel("build-android", "build-ios"));

// default (gulp) - just build Android for the CI build
gulp.task("default", gulp.series("build-android"), function () {
    // Copy results to bin folder
    gulp.src("platforms/android/app/build/output/apk/release/*.apk").pipe(gulp.dest("bin/release/android"));         // Gradle build
});
