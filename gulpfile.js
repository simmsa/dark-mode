var gulp = require('gulp');
var watch = require('gulp-watch');

gulp.task('default', function(){
    // Do stuff here
});

gulp.task('file-watch', function(){

    watch('**/*.*', function(file){
        // Do things when files change here
    });
});
