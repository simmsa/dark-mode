var gulp = require("gulp");
var exec = require("gulp-exec");
var rename = require("gulp-rename");
var less = require("gulp-less");

gulp.task("postcss", function(){
    var options = {
        continueOnError: false,
        pipeStdout: true
    };
    return gulp.src("styles/postcss/*.js")
        .pipe(exec("node <%= file.path %>", options))
        .pipe(rename({
            extname: ".css"
        }))
        .pipe(gulp.dest("styles/css"));
});

gulp.task("less", function(){
    return gulp.src("styles/less/*.less")
        .pipe(less({}))
        .pipe(gulp.dest("styles/css"));
});

gulp.task("default", ["postcss", "less"]);
