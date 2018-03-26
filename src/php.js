'use strict';
var debug        = require('gulp-debug'),
    browserSync  = require('browser-sync'),      // livereload
    reload       = browserSync.reload


module.exports = function (options) {
    var gulp = options.gulp;
    return gulp.src(options.path.src.php)
        .pipe(debug({'title': '- php'}))
        .pipe(reload({stream: true}));
}