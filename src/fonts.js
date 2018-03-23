'use strict';
var newer        = require('gulp-newer');

module.exports = function (options) {
    var gulp = options.gulp;
    return gulp.src(options.path.src.fonts)
        .pipe(newer(options.path.build.fonts))
        .pipe(gulp.dest(options.path.build.fonts))
}