'use strict';
var rimraf       = require('rimraf');

module.exports = function (options) {
    var gulp = options.gulp;
    rimraf(options.path.clean.build, options.callback);
    return rimraf(options.path.clean.modules, options.callback);
}