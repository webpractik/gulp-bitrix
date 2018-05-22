'use strict';
module.exports = function(options) {
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

        spritesmith  = require('gulp.spritesmith'),
        sourcemaps   = require('gulp-sourcemaps'),

        duration     = require('gulp-duration'),     // время выполнения
        debug        = require('gulp-debug'),       // отладка
        chokidar     = require('chokidar'),
        env          = require('node-env-file'),
        del          = require('del'),
        deepExtend   = require('deep-extend'),
        gulpIf       = require('gulp-if');

    var options          = options || {};
    options.path         = options.path || {};
    options.excludeTasks = options.excludeTasks || ['1'];
    options.includeTasks = options.includeTasks || [];
    options.sprite       = {};


    var build = {};

    var __dirname = options.dirName || __dirname;
    /*Функция, которая выясняет является ли текущая среда разработкой*/
    var isDevelopment = function() {
        return !process.env.NODE_ENV || process.env.NODE_ENV == 'development';
    };


// PATH
// ====
    var path = {};
    deepExtend(path, {
        build: {
            js:     'local/static/build/js/',
            css:    'local/static/build/css/',
            img:    'local/static/build/img/',
            pic:    'local/static/build/pic/',
            fonts:  'local/static/build/fonts/',
            sprite: 'local/static/build/img/sprite/'
        },
        src:   {
            php:            [
                'local/**/*.php',
                '!local/static/',
                '!local/php_interface/',
                '!local/modules/'
            ],
            js:             'local/static/assets/js/**/*.js',
            jsx:            'local/static/assets/js/**/*.jsx',
            sass:           'local/static/assets/sass/**/*.sass',
            sassInclude:    'local/static/assets/sass/global/**/_*.sass',
            sassProject:    'local/static/assets/sass/global/project.sass',
            img:            ['local/static/assets/img/**/*.*', '!local/static/assets/img/sprite/*.*'],
            pic:            'local/static/assets/pic/**/*.*',
            fonts:          'local/static/assets/fonts/**/*.*',
            sprite:         'local/static/assets/img/sprite/*.*',
            sprLang:        'local/static/assets/sass/global/include/',
            sassComponents: [
                'local/templates/.default/components/**/style.sass',
                'local/templates/main/components/**/style.sass',
                'local/components/**/.default/style.sass',
                'local/components/**/style.sass',
                'local/templates/main/components/**/.default/style.sass',
                'local/templates/main/components/**/style.sass'
            ],
            jsComponents:   [
                'local/templates/.default/components/bitrix/**/.default/**/*.jsx',
                'local/templates/.default/components/bitrix/**/*.jsx',
                'local/components/**/.default/**/*.jsx',
                'local/components/**/*.jsx'
            ]
        },
        clean: {
            build:   'local/static/build',
            modules: './node_modules'
        }
    }, options.path);

    var includePath  = options.includePath || ['/local/static/assets/sass/global/include/'],
        staticFolder = options.staticFolder || '/local/static/';

        includePath.map(function (currentValue, index, array) {
            array[index] = process.env['INIT_CWD'] + currentValue;
        });


    function requireTask(taskName, path, options) {
        options          = options || {};
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
    requireTask('sprite', './src/sprite', {path: path, gulp: gulp, staticFolder: staticFolder, sprite: {imgName: options.sprite.imgName, cssName: options.sprite.cssName}});

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
    var getExtension          = function(string) {
            var arrStr = string.split('.');
            var strLen = arrStr[arrStr.length - 1];
            return strLen;
        },

        /* Возвращает путь к собранному файлу */
        getBuidExtension      = function(string, ext) {
            var strLen = getExtension(string).length;
            return string.substr(0, string.length - strLen) + ext;
        },

        /* Переменные задержки обработки watcher-а */
        developmentWatchDelay = options.developmentWatchDelay || 200,
        productionWatchDelay  = options.productionWatchDelay || 1000;


    /* Очистка билда */
    requireTask('clean', './src/clean', {
        path: path, gulp: gulp, callback: function() {
        }
    });

    /* Очистка полная */
    requireTask('full-clean', './src/clean', {
        path: path, gulp: gulp, callback: function() {
        }
    });

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
    var inArray = function(str, array) {
        if (!array[0]) return true;
        return (array.indexOf(str) !== -1);
    };

    /* Пустая функция */
    var skip = function(callback) {
        console.log('skipped');
        callback();
    };


    /* Задача watcher-а */
    gulp.task('watch', function() {
        gulp.watch(path.src.sass, {delay: isDevelopment() ? developmentWatchDelay : productionWatchDelay}, gulp.series('sass'));
        gulp.watch(path.src.sassInclude, {delay: isDevelopment() ? developmentWatchDelay : productionWatchDelay}, gulp.series('sassProject'));
        gulp.watch(path.src.sassComponents, gulp.series('sassComponents')).on('unlink', function(e) {
            del(getBuidExtension(e, 'css'), {force: true});
            del(getBuidExtension(e, 'css.map'), {force: true});
        });
        gulp.watch(path.src.js, {delay: isDevelopment() ? developmentWatchDelay : productionWatchDelay}, gulp.series('js'));
        gulp.watch(path.src.jsx, {delay: isDevelopment() ? developmentWatchDelay : productionWatchDelay}, gulp.series('jsx'));
        gulp.watch(path.src.jsComponents, {delay: isDevelopment() ? developmentWatchDelay : productionWatchDelay}, gulp.series('jsComponents')).on('unlink', function(e) {
            del(getBuidExtension(e, 'js', path.build.js), {force: true});
            del(getBuidExtension(e, 'js.map', path.build.js), {force: true});
        });
        gulp.watch(path.src.sprite, {delay: isDevelopment() ? developmentWatchDelay : productionWatchDelay}, gulp.series('sprite', 'sass'));
        gulp.watch(path.src.img, {delay: isDevelopment() ? developmentWatchDelay : productionWatchDelay}, gulp.series('img'));
        gulp.watch(path.src.pic, {delay: isDevelopment() ? developmentWatchDelay : productionWatchDelay}, gulp.series('pic'));
        return gulp.watch(path.src.fonts, {delay: isDevelopment() ? developmentWatchDelay : productionWatchDelay}, gulp.series('fonts'));
    });

    var newTasks = [];


// START
// =====
    build.path     = path;
    build.options  = options;
    build.newTasks = [];
    build.sass = !inArray('sass', options.excludeTasks) && inArray('sass', options.includeTasks) ? gulp.series('sass') : skip,
        build.sassComponents = !inArray('sassComponents', options.excludeTasks) && inArray('sassComponents', options.includeTasks) ? gulp.series('sassComponents') : skip,
        build.jsComponents = !inArray('jsComponents', options.excludeTasks) && inArray('jsComponents', options.includeTasks) ? gulp.series('jsComponents') : skip,
        build.sassProject = !inArray('sassProject', options.excludeTasks) && inArray('sassProject', options.includeTasks) ? gulp.series('sassProject') : skip,
        build.js = !inArray('js', options.excludeTasks) && inArray('js', options.includeTasks) ? gulp.series('js') : skip,
        build.jsx = !inArray('jsx', options.excludeTasks) && inArray('jsx', options.includeTasks) ? gulp.series('jsx') : skip,
        build.sprite = !inArray('sprite', options.excludeTasks) && inArray('sprite', options.includeTasks) ? gulp.series('sprite') : skip,
        build.img = !inArray('img', options.excludeTasks) && inArray('img', options.includeTasks) ? gulp.series('img') : skip,
        build.pic = !inArray('pic', options.excludeTasks) && inArray('pic', options.includeTasks) ? gulp.series('pic') : skip,
        build.fonts = !inArray('fonts', options.excludeTasks) && inArray('fonts', options.includeTasks) ? gulp.series('fonts') : skip,
        build.watch = !inArray('watch', options.excludeTasks) && inArray('watch', options.includeTasks) ? gulp.series('watch') : skip,
        build.getEnv = !inArray('get-env', options.excludeTasks) ? gulp.series('get-env') : skip,
        build.setProd = gulp.series('set-prod-node-env'),
        build.setDev = gulp.series('set-dev-node-env'),
        build.clean = gulp.series('clean'),
        build.fullClean = gulp.series('full-clean');
    /* Перестройка общих задач */
    build.refreshBuild = function() {
        Object.assign(path, build.path);
        build.def = gulp.series(build.getEnv, build.sprite, build.img, build.pic, build.fonts, gulp.parallel(build.sass, build.sassComponents, build.sassProject, build.jsComponents, build.js, build.jsx), build.newTasks, build.watch),
            build.one = gulp.series(build.getEnv, build.sprite, build.img, build.pic, build.fonts, gulp.parallel(build.sass, build.sassComponents, build.sassProject, build.jsComponents, build.js, build.jsx)),
            build.prod = gulp.series(build.setProd, build.sprite, build.img, build.pic, build.fonts, gulp.parallel(build.sass, build.sassComponents, build.sassProject, build.jsComponents, build.js, build.jsx), build.watch),
            build.prodOne = gulp.series(build.setProd, build.sprite, build.img, build.pic, build.fonts, gulp.parallel(build.sass, build.sassComponents, build.sassProject, build.jsComponents, build.js, build.jsx)),
            build.dev = gulp.series(build.setDev, build.sprite, build.img, build.pic, build.fonts, gulp.parallel(build.sass, build.sassComponents, build.sassProject, build.jsComponents, build.js, build.jsx), build.watch),
            build.devOne = gulp.series(build.setDev, build.sprite, build.img, build.pic, build.fonts, gulp.parallel(build.sass, build.sassComponents, build.sassProject, build.jsComponents, build.js, build.jsx));
    };
    /* Автоматически создает задачи */
    build.init    = function(obj, opt) {
        var innerGulpObj = obj || gulp,
            opt          = opt || {},
            initDefault  = opt.initDefault ? 'default' : 'def';
        Object.assign(path, build.path);
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
        build.def = innerGulpObj.series('get-env', 'sprite', 'img', 'pic', 'fonts', innerGulpObj.parallel('sass', 'sassComponents', 'sassProject', 'jsComponents', 'js', 'jsx'), build.newTasks, 'watch'),
            build.one = innerGulpObj.series('get-env', 'sprite', 'img', 'pic', 'fonts', innerGulpObj.parallel('sass', 'sassComponents', 'sassProject', 'jsComponents', 'js', 'jsx'), build.newTasks),
            build.prod = innerGulpObj.series('set-prod-node-env', 'sprite', 'img', 'pic', 'fonts', innerGulpObj.parallel('sass', 'sassComponents', 'sassProject', 'jsComponents', 'js', 'jsx'), build.newTasks, 'watch'),
            build.prodOne = innerGulpObj.series('set-prod-node-env', 'sprite', 'img', 'pic', 'fonts', innerGulpObj.parallel('sass', 'sassComponents', 'sassProject', 'jsComponents', 'js', 'jsx'), build.newTasks),
            build.dev = innerGulpObj.series('set-dev-node-env', 'sprite', 'img', 'pic', 'fonts', innerGulpObj.parallel('sass', 'sassComponents', 'sassProject', 'jsComponents', 'js', 'jsx'), build.newTasks, 'watch'),
            build.devOne = innerGulpObj.series('set-dev-node-env', 'sprite', 'img', 'pic', 'fonts', innerGulpObj.parallel('sass', 'sassComponents', 'sassProject', 'jsComponents', 'js', 'jsx'), build.newTasks);
        if (!innerGulpObj._registry._tasks['def']) innerGulpObj.task(initDefault, build.def);
        if (!innerGulpObj._registry._tasks['one']) innerGulpObj.task('one', build.one);
        if (!innerGulpObj._registry._tasks['prod']) innerGulpObj.task('prod', build.prod);
        if (!innerGulpObj._registry._tasks['prodOne']) innerGulpObj.task('prodOne', build.prodOne);
        if (!innerGulpObj._registry._tasks['dev']) innerGulpObj.task('dev', build.dev);
        if (!innerGulpObj._registry._tasks['devOne']) innerGulpObj.task('devOne', build.devOne);
        for (var index = 0; index < build.newTasks.length; index++) {
            if (!innerGulpObj._registry._tasks[newTasks[index]]) innerGulpObj.task(newTasks[index], build.newTasks[index]);
        }
    };
    build.addTask = function(name, task) {
        gulp.task(name, gulp.series(task));
        newTasks.push(name);
        build.newTasks.push(gulp.series(task));
        build[name] = gulp.series(task);
        build.refreshBuild();
    };

    build.refreshBuild();

    build.gulp = gulp;
    return build;
};

