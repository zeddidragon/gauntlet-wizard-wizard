var gulp = require('gulp')
var jade = require('gulp-jade')

gulp.task('build', function(){
  gulp.src('./index.jade')
    .pipe(jade({pretty: true}))
    .pipe(gulp.dest('./'))
})
