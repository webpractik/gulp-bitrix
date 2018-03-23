'use strict';
module.exports = function (options) {
    var gulp         = require('gulp'),
        plumber      = require('gulp-plumber'),		 // уведомления об ошибках
        autoprefixer = require('gulp-autoprefixer'), // установка префиксов
        notify       = require('gulp-notify'),       // всплывающие уведомления
        imagemin     = require('gulp-imagemin'),	 // минификация изображений
        newer        = require('gulp-newer'),        // ограничение выборки для ускорения компиляции
        sass         = require('gulp-sass'),         // компилятор sass на C без compass
        rimraf       = require('rimraf'),            // удаление файлов
        jscs         = require('gulp-jscs'),         // проверка js файлов на стандарт
        browserSync  = require('browser-sync'),      // livereload
        reload       = browserSync.reload,

        babel        = require('gulp-babel'),        // babel
        es2015       = require('babel-preset-es2015'),
        react        = require('babel-preset-react'),

        spritesmith  = require('gulp.spritesmith'),
        sourcemaps   = require('gulp-sourcemaps'),

        duration     = require('gulp-duration'),     // время выполнения
        debug        = require('gulp-debug'),       // отладка
        chokidar	= require('chokidar'),
        env			= require('node-env-file'),
        del			= require('del'),
        gulpIf      = require('gulp-if');

    var options = options || {};
    options.path = options.path || {};
    options.excludeTasks = options.excludeTasks || [];
    options.includeTasks = options.includeTasks || [];
    options.sprite = {};


    var build = {};

    var __dirname = options.dirName || __dirname;


    /*Функция, которая выясняет является ли текущая среда разработкой*/
    var isDevelopment = function() {
        return !process.env.NODE_ENV || process.env.NODE_ENV == 'development';
    };


// PATH
// ====
    var path = Object.assign(options.path, {
        build: {
            js:     'build/js/',
            css:    'build/css/',
            img:    'build/img/',
            pic:    'build/pic/',
            fonts:  'build/fonts/',
            sprite: 'build/img/sprite/'
        },
        src:   {
            php:            [
                '../../local/**/*.php',
                '!../../local/static/',
                '!../../local/php_interface/',
                '!../../local/modules/'
            ],
            js:             'assets/js/**/*.js',
            jsx:			'assets/js/**/*.jsx',
            sass:           'assets/sass/**/*.sass',
            sassInclude:    'assets/sass/global/**/_*.sass',
            sassProject:    'assets/sass/global/project.sass',
            img:            ['assets/img/**/*.*', '!assets/img/sprite/*.*'],
            pic:            'assets/pic/**/*.*',
            fonts:          'assets/fonts/**/*.*',
            sprite:         'assets/img/sprite/*.*',
            sprLang:        'assets/sass/global/include/',
            sassComponents: [
                '../templates/.default/components/**/style.sass',
                '../templates/main/components/**/style.sass',
                '../components/**/.default/style.sass',
                '../components/**/style.sass',
                '../templates/main/components/**/.default/style.sass',
                '../templates/main/components/**/style.sass'
            ],
            jsComponents:   [
                '../templates/.default/components/bitrix/**/.default/**/*.jsx',
                '../templates/.default/components/bitrix/**/*.jsx',
                '../components/**/.default/**/*.jsx',
                '../components/**/*.jsx'
            ]
        },
        clean: {
            build:   './build',
            modules: './node_modules'
        }
    });

    var includePath = options.includePath || '/assets/sass/global/include/',
        staticFolder = options.staticFolder || '/local/static/';

    function requireTask(taskName, path, options) {
        options = options || {};
        options.taskName = taskName;
        gulp.task(taskName, function(callback) {
            require(path)(options);
            callback();
        });
    }
// SASS
// ====
    requireTask('sass', './src/sass', {path: path, includePath: includePath, gulp: gulp, sourcemaps: options.sourcemaps});
// components
    requireTask('sassComponents', './src/sassComponents', {path: path, includePath: includePath, gulp: gulp, sourcemaps: options.sourcemaps});

// project
// данный task по сути костыль, чтобы обойти newer и подкючаемые файлы (_*.sass) запускались
    requireTask('sassProject', './src/sassProject', {path: path, includePath: includePath, gulp: gulp, sourcemaps: options.sourcemaps});

// SPRITE
// ======
    requireTask('sprite', './src/sprite', {path: path, gulp: gulp, staticFolder: staticFolder,  sprite: {imgName: options.sprite.imgName, cssName: options.sprite.cssName}});

// PHP
// ===
    requireTask('php', './src/php', {gulp: gulp, path: path});

// JS
// ==
    requireTask('js', './src/js', {path: path, gulp: gulp, sourcemaps: options.sourcemaps});
    requireTask('jsx', './src/jsx', {path: path, gulp: gulp, sourcemaps: options.sourcemaps});
    requireTask('jsComponents', './src/jsComponents', {path: path, gulp: gulp, sourcemaps: options.sourcemaps});

// IMAGES
// ======
    requireTask('img', './src/img', {path: path, gulp: gulp});
    requireTask('pic', './src/pic', {path: path, gulp: gulp});

// FONTS
// =====
    requireTask('fonts', './src/fonts', {path: path, gulp: gulp});


// SERVER (only for local development)
// ===================================
    requireTask('browserSynch', './src/browserSynch', {gulp: gulp});

    /* Выводит расширение файла */
    var getExtension = function (string) {
            var arrStr = string.split('.');
            var strLen = arrStr[arrStr.length - 1];
            return strLen;
        },

        /* Возвращает путь к собранному файлу */
        getBuidExtension = function (string, ext) {
            var strLen = getExtension(string).length;
            return string.substr(0, string.length - strLen) + ext;
        },

        /* Переменные задержки обработки watcher-а */
        developmentWatchDelay = options.developmentWatchDelay || 200,
        productionWatchDelay = options.productionWatchDelay || 1000;


    /* Задача watcher-а */
    gulp.task('watch', function() {
        gulp.watch(path.src.sass, {delay: isDevelopment() ? developmentWatchDelay : productionWatchDelay}, gulp.series('sass'));
        gulp.watch(path.src.sassInclude, {delay: isDevelopment() ? developmentWatchDelay : productionWatchDelay}, gulp.series('sassProject'));
        gulp.watch(path.src.sassComponents, gulp.series('sassComponents')).on('unlink', function (e) {
            del(getBuidExtension(e, 'css'), {force: true});
            del(getBuidExtension(e, 'css.map'), {force: true});
        });
        gulp.watch(path.src.js, {delay: isDevelopment() ? developmentWatchDelay : productionWatchDelay}, gulp.series('js'));
        gulp.watch(path.src.jsx, {delay: isDevelopment() ? developmentWatchDelay : productionWatchDelay}, gulp.series('jsx'));
        gulp.watch(path.src.jsComponents, {delay: isDevelopment() ? developmentWatchDelay : productionWatchDelay}, gulp.series('jsComponents')).on('unlink', function (e) {
            del(getBuidExtension(e, 'js', path.build.js), {force: true});
            del(getBuidExtension(e, 'js.map', path.build.js), {force: true});
        });
        gulp.watch(path.src.sprite, {delay: isDevelopment() ? developmentWatchDelay : productionWatchDelay}, gulp.series('sprite', 'sass'));
        gulp.watch(path.src.img, {delay: isDevelopment() ? developmentWatchDelay : productionWatchDelay}, gulp.series('img'));
        gulp.watch(path.src.pic, {delay: isDevelopment() ? developmentWatchDelay : productionWatchDelay}, gulp.series('pic'));
        return gulp.watch(path.src.fonts, {delay: isDevelopment() ? developmentWatchDelay : productionWatchDelay}, gulp.series('fonts'));
    });

    /* Очистка билда */
    requireTask('clean', './src/clean', {path: path, gulp: gulp, callback: function () {}});

    /* Очистка полная */
    requireTask('full-clean', './src/clean', {path: path, gulp: gulp, callback: function () {}});

    /* Переключаем на окружение development */
    gulp.task('set-dev-node-env', function(callback) {
        process.env.NODE_ENV = 'development';
        callback();
    });

    /* Переключаем на окружение production */
    gulp.task('set-prod-node-env', function(callback) {
        process.env.NODE_ENV = 'production';
        callback();
    });

    /* Берем значения из .env файла */
    requireTask('get-env', './src/getEnv', {gulp: gulp, dirname: __dirname});

    /* Проверяем есть у массива данный элемент, если массив пустой - то возвращем true*/
    var inArray = function (str, array) {
        if (!array[0]) return true;
        return (array.indexOf(str) !== -1);
    };

    /* Пустая функция */
    var skip = function (callback) {
        console.log('skipped');
        callback();
    };


// START
// =====
    build.path = path;
    build.options = options;

    build.sass = !inArray('sass', options.excludeTasks) && inArray('sass', options.includeTasks) ? gulp.series('sass') : skip,
        build.sassComponents = !inArray('sassComponents', options.excludeTasks) && inArray('sassComponents', options.includeTasks) ? gulp.series('sassComponents') : skip,
        build.jsComponents = !inArray('jsComponents', options.excludeTasks) && inArray('jsComponents', options.includeTasks) ? gulp.series('jsComponents') : skip,
        build.sassProject = !inArray('sassProject', options.excludeTasks) && inArray('sassProject', options.includeTasks) ? gulp.series('sassProject') : skip,
        build.js = !inArray('js', options.excludeTasks) && inArray('js', options.includeTasks) ? gulp.series('js') : skip,
        build.jsx = !inArray('jsx', options.excludeTasks) && inArray('jsx', options.includeTasks) ? gulp.series('jsx') : skip,
        build.sprite = !inArray('sprite', options.excludeTasks) && inArray('sprite', options.includeTasks) ? gulp.series('sprite') : skip,
        build.img =	!inArray('img', options.excludeTasks) && inArray('img', options.includeTasks) ? gulp.series('img') : skip,
        build.pic = !inArray('pic', options.excludeTasks) && inArray('pic', options.includeTasks) ? gulp.series('pic') : skip,
        build.fonts = !inArray('fonts', options.excludeTasks) && inArray('fonts', options.includeTasks) ? gulp.series('fonts') : skip,
        build.watch = !inArray('watch', options.excludeTasks) && inArray('watch', options.includeTasks) ? gulp.series('watch') : skip,
        build.getEnv = !inArray('get-env', options.excludeTasks) ? gulp.series('get-env') : skip,
        build.setProd = gulp.series('set-prod-node-env'),
        build.setDev = gulp.series('set-dev-node-env'),
        build.clean = gulp.series('clean'),
        build.fullClean = gulp.series('full-clean');
    build.def = gulp.series(build.getEnv, build.sprite, build.img, build.pic, build.fonts, gulp.parallel(build.sass, build.sassComponents, build.sassProject, build.jsComponents, build.js, build.jsx), build.watch),
        build.one = gulp.series(build.getEnv, build.sprite, build.img, build.pic, build.fonts, gulp.parallel(build.sass, build.sassComponents, build.sassProject, build.jsComponents, build.js, build.jsx)),
        build.prod = gulp.series(build.setProd, build.sprite, build.img, build.pic, build.fonts, gulp.parallel(build.sass, build.sassComponents, build.sassProject, build.jsComponents, build.js, build.jsx), build.watch),
        build.prodOne = gulp.series(build.setProd, build.sprite, build.img, build.pic, build.fonts, gulp.parallel(build.sass, build.sassComponents, build.sassProject, build.jsComponents, build.js, build.jsx)),
        build.dev = gulp.series(build.setDev, build.sprite, build.img, build.pic, build.fonts, gulp.parallel(build.sass, build.sassComponents, build.sassProject, build.jsComponents, build.js, build.jsx), build.watch),
        build.devOne = gulp.series(build.setDev, build.sprite, build.img, build.pic, build.fonts, gulp.parallel(build.sass, build.sassComponents, build.sassProject, build.jsComponents, build.js, build.jsx));
    /* Автоматически создает задачи */
    build.init = function (obj) {
        var innerGulpObj = obj || gulp;
        if (!innerGulpObj._registry._tasks.sass) innerGulpObj.task('sass', build.sass);
        if (!innerGulpObj._registry._tasks.sassComponents) innerGulpObj.task('sassComponents', build.sassComponents);
        if (!innerGulpObj._registry._tasks.sassProject) innerGulpObj.task('sassProject', build.sassProject);
        if (!innerGulpObj._registry._tasks.js) innerGulpObj.task('js', build.js);
        if (!innerGulpObj._registry._tasks.jsx) innerGulpObj.task('jsx', build.jsx);
        if (!innerGulpObj._registry._tasks.jsComponents) innerGulpObj.task('jsComponents', build.jsComponents);
        if (!innerGulpObj._registry._tasks.sprite) innerGulpObj.task('sprite', build.sprite);
        if (!innerGulpObj._registry._tasks.img) innerGulpObj.task('img', build.img);
        if (!innerGulpObj._registry._tasks.pic) innerGulpObj.task('pic', build.pic);
        if (!innerGulpObj._registry._tasks.fonts) innerGulpObj.task('fonts', build.fonts);
        if (!innerGulpObj._registry._tasks.watch) innerGulpObj.task('watch', build.watch);
        if (!innerGulpObj._registry._tasks['set-prod-node-env']) innerGulpObj.task('set-prod-node-env', build.setProd);
        if (!innerGulpObj._registry._tasks['set-dev-node-env']) innerGulpObj.task('set-dev-node-env', build.setDev);
        if (!innerGulpObj._registry._tasks.clean) innerGulpObj.task('clean', build.clean);
        if (!innerGulpObj._registry._tasks['full-clean']) innerGulpObj.task('full-clean', build.fullClean);
        if (!innerGulpObj._registry._tasks['get-env']) innerGulpObj.task('get-env', build.getEnv);
        build.def = innerGulpObj.series('get-env', 'sprite', 'img', 'pic', 'fonts', innerGulpObj.parallel('sass', 'sassComponents', 'sassProject', 'jsComponents', 'js', 'jsx'),'watch'),
            build.one = innerGulpObj.series('get-env', 'sprite', 'img', 'pic', 'fonts', innerGulpObj.parallel('sass', 'sassComponents', 'sassProject', 'jsComponents', 'js', 'jsx')),
            build.prod = innerGulpObj.series('set-prod-node-env', 'sprite', 'img', 'pic', 'fonts', innerGulpObj.parallel('sass', 'sassComponents', 'sassProject', 'jsComponents', 'js', 'jsx'),'watch'),
            build.prodOne = innerGulpObj.series('set-prod-node-env', 'sprite', 'img', 'pic', 'fonts', innerGulpObj.parallel('sass', 'sassComponents', 'sassProject', 'jsComponents', 'js', 'jsx')),
            build.dev = innerGulpObj.series('set-dev-node-env', 'sprite', 'img', 'pic', 'fonts', innerGulpObj.parallel('sass', 'sassComponents', 'sassProject', 'jsComponents', 'js', 'jsx'),'watch'),
            build.devOne = innerGulpObj.series('set-dev-node-env', 'sprite', 'img', 'pic', 'fonts', innerGulpObj.parallel('sass', 'sassComponents', 'sassProject', 'jsComponents', 'js', 'jsx'));
        if (!innerGulpObj._registry._tasks['default']) innerGulpObj.task('default', build.def);
        if (!innerGulpObj._registry._tasks['one']) innerGulpObj.task('one', build.one);
        if (!innerGulpObj._registry._tasks['prod']) innerGulpObj.task('prod', build.prod);
        if (!innerGulpObj._registry._tasks['prodOne']) innerGulpObj.task('prodOne', build.prodOne);
        if (!innerGulpObj._registry._tasks['dev']) innerGulpObj.task('dev', build.dev);
        if (!innerGulpObj._registry._tasks['devOne']) innerGulpObj.task('devOne', build.devOne);
    };
    build.gulp = gulp;
    return build;
};

