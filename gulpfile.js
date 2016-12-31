// Gulpfile for Adapt It Mobile builds
var gulp = require("gulp"),
//    create = require('gulp-cordova-create'),
//    plugin = require('gulp-cordova-plugin'),
//    android = require('gulp-cordova-build-android'), 
//    ios = require('gulp-cordova-build-ios'),
    fs = require("fs"),
    ts = require("gulp-typescript"),
    path = require("path"),
    cordova = require("cordova-lib").cordova,
    buildDir = path.join(__dirname, 'build'),
    plugins = ['org.apache.cordova.file'],
    winPlatforms = ["android", "windows", "wp8"],
    linuxPlatforms = ["android"],
    osxPlatforms = ["android", "ios"],
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
//    gulp.src("platforms/windows/AppPackages/**/*").pipe(gulp.dest("bin/release/windows/AppPackages"));
//    gulp.src("platforms/wp8/bin/Release/*.xap").pipe(gulp.dest("bin/release/wp8"));
    gulp.src("platforms/ios/build/device/*.ipa").pipe(gulp.dest("bin/release/ios"));
});

gulp.task('create', ['clean'], function () {
    fs.mkdirSync(buildDir);
    process.chdir(buildDir);

    fs.symlinkSync(path.join('..', 'src', 'CordovaConfig.xml'), 'config.xml');
    fs.symlinkSync(path.join('..', 'src', 'www'), 'www');

    return cordova.plugins('add', plugins)
        .then(function () {
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

gulp.task("plugins", ["scripts"], function () {
    cordova.plugin('add', 'cordova-plugin-device');
    cordova.plugin('add', 'cordova-plugin-dialogs');
    cordova.plugin('add', 'cordova-plugin-file');
    cordova.plugin('add', 'cordova-plugin-file-transfer');
    cordova.plugin('add', 'cordova-plugin-fonts');
    cordova.plugin('add', 'cordova-plugin-globalization');
    cordova.plugin('add', 'cordova-plugin-splashscreen');
    cordova.plugin('add', 'cordova-plugin-whitelist');
    cordova.plugin('add', 'cordova-sqlite-storage');
});

gulp.task("build", ["build-android", "build-ios"]);

gulp.task("build-android", function () {
    cordova.platforms("add", "android");
    return gulp.src('dist')
        .pipe(create())
        .pipe(plugin('cordova-plugin-device'))
        .pipe(plugin('cordova-plugin-dialogs'))
        .pipe(plugin('cordova-plugin-file'))
        .pipe(plugin('cordova-plugin-file-transfer'))
        .pipe(plugin('cordova-plugin-fonts'))
        .pipe(plugin('cordova-plugin-globalization'))
        .pipe(plugin('cordova-plugin-splashscreen'))
        .pipe(plugin('cordova-plugin-whitelist'))
        .pipe(plugin('cordova-sqlite-storage'))
        .pipe(cordova.build("ios", buildArgs))
        .pipe(gulp.dest('apk'));
});

gulp.task("build-ios", ["plugins"], function () {
    return gulp.src('dist')
        .pipe(create())
        .pipe(plugin('cordova-plugin-device'))
        .pipe(plugin('cordova-plugin-dialogs'))
        .pipe(plugin('cordova-plugin-file'))
        .pipe(plugin('cordova-plugin-file-transfer'))
        .pipe(plugin('cordova-plugin-fonts'))
        .pipe(plugin('cordova-plugin-globalization'))
        .pipe(plugin('cordova-plugin-splashscreen'))
        .pipe(plugin('cordova-plugin-whitelist'))
        .pipe(plugin('cordova-sqlite-storage'))
        .pipe(cordova.build("ios", buildArgs));
});

gulp.task("build-win", ["plugins"], function () {
    return gulp.src('dist')
        .pipe(cordova.platforms("add", "windows"))
        .pipe(cordova.plugin('add', 'cordova-plugin-device'))
        .pipe(cordova.plugin('add', 'cordova-plugin-dialogs'))
        .pipe(cordova.plugin('add', 'cordova-plugin-file'))
        .pipe(cordova.plugin('add', 'cordova-plugin-file-transfer'))
        .pipe(cordova.plugin('add', 'cordova-plugin-fonts'))
        .pipe(cordova.plugin('add', 'cordova-plugin-globalization'))
        .pipe(cordova.plugin('add', 'cordova-plugin-splashscreen'))
        .pipe(cordova.plugin('add', 'cordova-plugin-whitelist'))
        .pipe(cordova.plugin('add', 'cordova-sqlite-storage'))
        .pipe(cordova.build("windows", buildArgs));
});

gulp.task("build-wp8", ["plugins"], function () {
    return gulp.src('dist')
        .pipe(cordova.platforms("add", "wp8"))
        .pipe(cordova.plugin('add', 'cordova-plugin-device'))
        .pipe(cordova.plugin('add', 'cordova-plugin-dialogs'))
        .pipe(cordova.plugin('add', 'cordova-plugin-file'))
        .pipe(cordova.plugin('add', 'cordova-plugin-file-transfer'))
        .pipe(cordova.plugin('add', 'cordova-plugin-fonts'))
        .pipe(cordova.plugin('add', 'cordova-plugin-globalization'))
        .pipe(cordova.plugin('add', 'cordova-plugin-splashscreen'))
        .pipe(cordova.plugin('add', 'cordova-plugin-whitelist'))
        .pipe(cordova.plugin('add', 'cordova-sqlite-storage'))
        .pipe(cordova.build("wp8", buildArgs));
});

//gulp.task("package", ["build"], function () {
//    return cordova.packageProject(platformsToBuild);
//});