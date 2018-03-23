'use strict';
var rimraf       = require('rimraf');

module.exports = function (options) {
    var gulp = options.gulp;
    return rimraf(options.path.clean.build, options.callback)
}