'use strict';
var env			= require('node-env-file');


module.exports = function (options) {
    var gulp = options.gulp;
    try {
        env(options.dirname + '/.env')
        console.log('Current mode: ' + process.env.NODE_ENV);
    } catch (e) {
        console.log(e.message + ' [Build will be started with production settings]');
        process.env.NODE_ENV = 'production';
    }
}