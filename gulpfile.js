var gulp = require("gulp");
var exec = require("gulp-exec");
var rename = require("gulp-rename");
var less = require("gulp-less");
var cssLint = require("gulp-csslint");
var runSequence = require("run-sequence");

gulp.task("staticCss", function(){
    var options = {
        continueOnError: false,
        pipeStdout: true
    };
    gulp.src("build/CssBuilder.js")
        .pipe(exec("node <%= file.path %>", options))
        .pipe(rename("dark-mode.css"))
        .pipe(gulp.dest("styles/css"));
});

gulp.task("less", function(){
    return gulp.src("styles/less/*.less")
        .pipe(less({}))
        .pipe(gulp.dest("styles/css"));
});

gulp.task("lintCss", function(){
    gulp.src("styles/css/dark-mode.css")
    .pipe(cssLint({
        "important": false,
        "universal-selector": false,
        "unqualified-attributes": false,
        "regex-selectors": false
    }))
    .pipe(cssLint.reporter());
});

// Use run sequence to explicitly build the css then run the linter
gulp.task("buildStaticCssThenLint", function(){
    runSequence("staticCss", "lintCss");
});

gulp.task("default", ["less", "buildStaticCssThenLint"]);
