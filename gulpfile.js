var gulp = require('gulp');
var watch = require('gulp-watch');
var less = require('gulp-less');

gulp.task('default', function(){
    // Do stuff here
});

gulp.task('file-watch', function(){
    watch('**/*.*', function(file){
        // Do things when files change here
        gulp.src("styles/less/*.less")
        .pipe(less({
            paths: []
        }))
        .pipe(gulp.dest("styles/css"));
    });
});
