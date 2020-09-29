// Gulpfile for Adapt It Mobile builds
var gulp = require("gulp"),
    cordova = require("cordova-lib").cordova;

gulp.task("build-android", function (done) {
    cordova.build({
        "platforms": ["android"],
        "options": {
            argv: ["--release", "--verbose", "--buildConfig=build.json", "--gradleArg=--no-daemon"]
        }
    }, done());
});

gulp.task("build-ios", function (done) {
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
    gulp.src("platforms/ios/build/device/*.ipa").pipe(gulp.dest("bin/release/ios"));
});
