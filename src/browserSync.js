'use strict';
var browserSync  = require('browser-sync'),      // livereload
    reload       = browserSync.reload;

    module.exports = function (options) {
    var gulp = options.gulp;
    browserSync({
        proxy:  'letovo.dev:8080',
        port:   8080,
        open:   false,
        notify: true
    });

}