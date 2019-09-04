'use strict';
var gulp         = require('gulp'),
    plumber      = require('gulp-plumber'),		 // уведомления об ошибках
    notify       = require('gulp-notify'),       // всплывающие уведомления
    newer        = require('gulp-newer'),        // ограничение выборки для ускорения компиляции
    babel        = require('gulp-babel'),        // babel
    sourcemaps   = require('gulp-sourcemaps'),
    duration     = require('gulp-duration'),     // время выполнения
    debug        = require('gulp-debug'),       // отладка
    gulpIf      = require('gulp-if');

var isDevelopment = function() {
    return !process.env.NODE_ENV || process.env.NODE_ENV == 'development';
};

module.exports = function (options) {
    var gulp = options.gulp;

    return gulp.src(options.path.src.jsComponents, {since: gulp.lastRun('jsComponents')})
        .pipe(plumber(gulpIf(isDevelopment(), notify.onError({
            message: '<%= error.message %>',
            title: 'Jsx Components task Error!'
        }), function (error) {
            console.log(error.message)
        })))
        .pipe(debug({'title': '- jsComponents'}))
        .pipe(gulpIf(isDevelopment() && options.sourcemaps, sourcemaps.init()))
        .pipe(babel({
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: ['@babel/plugin-proposal-class-properties', '@babel/plugin-proposal-private-methods']
        }))
        .pipe(duration('jsComponents time'))
        .pipe(gulpIf(isDevelopment() && options.sourcemaps, sourcemaps.write()))
        .pipe(gulp.dest(function(file) {
            return file.base;
        }))
}
