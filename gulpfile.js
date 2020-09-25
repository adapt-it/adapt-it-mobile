// Gulpfile for Adapt It Mobile builds
var gulp = require("gulp"),
    cordova = require("cordova-lib").cordova;

gulp.task("build-android", function (done) {
    cordova.build({
        "platforms": ["android"],
        "options": {
            argv: ["--release", "-d", "--buildConfig=build.json", "--gradleArg=--no-daemon"]
        }
    }, done());
});

gulp.task("build-ios", function (done) {
    cordova.build({
        "platforms": ["ios"],
        "options": {
            argv: ["--release", "-d", "--buildConfig=build.json", "--device"]
        }
    }, done());
});

gulp.task("build", gulp.parallel("build-android", "build-ios"));

gulp.task("default", gulp.series("build"), function () {
    // Copy results to bin folder
    gulp.src("platforms/android/ant-build/*.apk").pipe(gulp.dest("bin/release/android"));   // Ant build
    gulp.src("platforms/android/bin/*.apk").pipe(gulp.dest("bin/release/android"));         // Gradle build
    gulp.src("platforms/ios/build/device/*.ipa").pipe(gulp.dest("bin/release/ios"));
});
