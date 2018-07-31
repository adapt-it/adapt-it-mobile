// Gulpfile for Adapt It Mobile builds
var gulp = require("gulp"),
    fs = require("fs"),
    path = require("path"),
    exec = require("child_process").exec,
    cordova = require("cordova-lib").cordova,
    buildDir = path.join(process.cwd(), 'platforms'),
    pluginDir = path.join(process.cwd(), 'plugins'),
    buildArgs = {
        android: ["--release", "--device", "--gradleArg=--no-daemon"],
        ios: ["--release", "--device"],
        windows: ["--release", "--device"],
        wp8: ["--release", "--device"]
    };

gulp.task("default", ["build"], function () {
    // Copy results to bin folder
    gulp.src("platforms/android/ant-build/*.apk").pipe(gulp.dest("bin/release/android"));   // Ant build
    gulp.src("platforms/android/bin/*.apk").pipe(gulp.dest("bin/release/android"));         // Gradle build
    gulp.src("platforms/ios/build/device/*.ipa").pipe(gulp.dest("bin/release/ios"));
});

gulp.task("build", ["build-android", "build-ios"]);

gulp.task("build-android", function () {
    cordova.platforms("add", "android");
    return gulp.src('dist')
        .pipe(cordova.clean("android"))
        .pipe(cordova.build("android", buildArgs));
});

gulp.task("build-ios", function () {
    cordova.platforms("add", "ios");
    return gulp.src('dist')
        .pipe(cordova.clean("ios"))
        .pipe(cordova.build("ios", buildArgs));
});

gulp.task("build-win", function () {
    cordova.platforms("add", "windows");
    return gulp.src('dist')
        .pipe(cordova.clean("windows"))
        .pipe(cordova.build("windows", buildArgs));
});

gulp.task("package", ["build"], function () {
    return cordova.packageProject(platformsToBuild);
});