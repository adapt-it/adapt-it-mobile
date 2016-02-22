// Gulpfile for Adapt It Mobile builds
var gulp = require("gulp"),
    fs = require("fs"),
    ts = require("gulp-typescript"),
    path = require("path"),
    cordova = require("cordova-lib").cordova.raw,
    buildDir = path.join(__dirname, 'build'),
    plugins = ['org.apache.cordova.file'],
    winPlatforms = ["android", "windows", "wp8"],
    linuxPlatforms = ["android"],
    osxPlatforms = ["ios"],
    buildArgs = {
        android: ["--release", "--device", "--gradleArg=--no-daemon"],
        ios: ["--release", "--device"],
        windows: ["--release", "--device"],
        wp8: ["--release", "--device"]
    },
    platformsToBuild = process.platform === "darwin" ? osxPlatforms :
                       (process.platform === "linux" ? linuxPlatforms : winPlatforms);

gulp.task("default", ["build"], function () {
    // Copy results to bin folder
    gulp.src("platforms/android/ant-build/*.apk").pipe(gulp.dest("bin/release/android"));   // Ant build
    gulp.src("platforms/android/bin/*.apk").pipe(gulp.dest("bin/release/android"));         // Gradle build
    gulp.src("platforms/windows/AppPackages/**/*").pipe(gulp.dest("bin/release/windows/AppPackages"));
    gulp.src("platforms/wp8/bin/Release/*.xap").pipe(gulp.dest("bin/release/wp8"));
    gulp.src("platforms/ios/build/device/*.ipa").pipe(gulp.dest("bin/release/ios"));
});

gulp.task('create', ['clean'], function () {
    fs.mkdirSync(buildDir);
    process.chdir(buildDir);

    fs.symlinkSync(path.join('..', 'src', 'CordovaConfig.xml'), 'config.xml');
    fs.symlinkSync(path.join('..', 'src', 'www'), 'www');

    return cordova.plugins('add', plugins)
    .then(function() {
        // point to node_modules/cordova-android/
        return cordova.platform('add', platform_dirs);
    });
});

gulp.task("scripts", function () {
    gulp.src("scripts/**/*.ts")
        .pipe(ts({
            noImplicitAny: false,
            noEmitOnError: true,
            removeComments: false,
            sourceMap: true,
            out: "appBundle.js",
            target: "es5"
        }))
        .pipe(gulp.dest("www/scripts"));
});

gulp.task("build", ["scripts"], function () {
    return cordova.build(platformsToBuild, buildArgs);
});

gulp.task("build-win", ["scripts"], function () {
    return cordova.build("windows", buildArgs);
});

gulp.task("build-wp8", ["scripts"], function () {
    return cordova.build("wp8", buildArgs);
});

gulp.task("build-android", ["scripts"], function () {
    return cordova.build("android", buildArgs);
});

gulp.task("build-ios", ["scripts"], function () {
    return cordova.build("ios", buildArgs);
});

//gulp.task("package", ["build"], function () {
//    return cordova.packageProject(platformsToBuild);
//});