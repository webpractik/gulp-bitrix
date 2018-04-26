'use strict';
var notify       = require('gulp-notify'),       // всплывающие уведомления
    imagemin     = require('gulp-imagemin'),	 // минификация изображений
    newer        = require('gulp-newer'),        // ограничение выборки для ускорения компиляции
    duration     = require('gulp-duration'),     // время выполнения
    debug        = require('gulp-debug'),       // отладка
    gulpIf      = require('gulp-if');

module.exports = function (options) {
    var gulp = options.gulp;
    return gulp.src(options.path.src.img)
        .pipe(newer(options.path.build.img))
        .pipe(debug({'title': '- img'}))
        .pipe(imagemin({progressive: true}))
        .pipe(duration('img time'))
        .pipe(gulp.dest(options.path.build.img))
}