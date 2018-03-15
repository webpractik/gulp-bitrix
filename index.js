'use strict';

const gulp         = require('gulp'),
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
	vinyl		= require('vinyl'),
	gulpIf      = require('gulp-if');

var webpractikBuild = function (options) {
	var options = options || {};
	options.path = options.path || {};

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

// SASS
// ====
	gulp.task('sass', options.taskSass || function() {
		return gulp.src(path.src.sass)
			.pipe(newer({
					dest: path.build.css,
					ext:  '.css'
				})
			)
			.pipe(plumber(gulpIf(isDevelopment(), notify.onError({
				message: '<%= error.message %>',
				title: 'Sass Error!'
			}), function (error) {
				console.log(error.message)
			})))
			.pipe(gulpIf(isDevelopment(), sourcemaps.init()))
			.pipe(sass.sync({
				includePaths: [process.env['INIT_CWD'] + includePath]
			}))
			.pipe(autoprefixer({
				browsers: ['last 12 versions', '> 1%'],
				cascade:  false,
				remove:   false
			}))
			.pipe(debug({'title': '- sass'}))
			.pipe(duration('sass time'))
			.pipe(gulpIf(isDevelopment(), sourcemaps.write()))
			.pipe(gulp.dest(path.build.css))
		//.pipe(reload({stream: true}));
	});

// components
	gulp.task('sassComponents', options.sassComponents || function() {
		return gulp.src(path.src.sassComponents, {since: gulp.lastRun('sassComponents')})
			.pipe(plumber(gulpIf(isDevelopment(), notify.onError({
				message: '<%= error.message %>',
				title: 'Sass Components Error!'
			}), function (error) {
				console.log(error.message)
			})))
			.pipe(gulpIf(isDevelopment(), sourcemaps.init()))
			.pipe(sass.sync({
				includePaths: [process.env['INIT_CWD'] + includePath]
			}))
			.pipe(autoprefixer({
				browsers: ['last 12 versions', '> 1%'],
				cascade:  false,
				remove:   false
			}))
			.pipe(debug({'title': '- sassComponents'}))
			.pipe(duration('sassComponents time'))
			.pipe(gulpIf(isDevelopment(), sourcemaps.write()))
			.pipe(gulp.dest(function(file) {
				return file.base;
			}))
		//.pipe(reload({stream: true}));
	});


// project
// данный task по сути костыль, чтобы обойти newer и подкючаемые файлы (_*.sass) запускались
	gulp.task('sassProject', options.sassProject || function() {
		return gulp.src(path.src.sassProject)
			.pipe(plumber(gulpIf(isDevelopment(), notify.onError({
				message: '<%= error.message %>',
				title: 'Sass Project Error!'
			}), function (error) {
				console.log(error.message)
			})))
			.pipe(gulpIf(isDevelopment(), sourcemaps.init()))
			.pipe(sass.sync({
				includePaths: [process.env['INIT_CWD'] + includePath]
			}))
			.pipe(autoprefixer({
				browsers: ['last 12 versions', '> 1%'],
				cascade:  false,
				remove:   false
			}))
			.pipe(debug({'title': '- sassProject'}))
			.pipe(duration('sassProject time'))
			.pipe(gulpIf(isDevelopment(), sourcemaps.write()))
			.pipe(gulp.dest(path.build.css + 'global/'))
		//.pipe(reload({stream: true}));
	});


// SPRITE
// ======
	gulp.task('sprite', options.spriteTask || function() {
		var spriteData =
			gulp.src(path.src.sprite)
				.pipe(spritesmith({
					imgName: 'sprite.png',
					cssName: '_sprite.sass',
					imgPath: staticFolder + path.build.sprite + 'sprite.png'
				}));

		spriteData.img.pipe(gulp.dest(path.build.sprite)); // путь, куда сохраняем картинку
		return spriteData.css.pipe(gulp.dest(path.src.sprLang)); // путь, куда сохраняем стили
	});


// PHP
// ===
	gulp.task('php', options.phpTask || function() {
		return gulp.src(path.src.php)
			.pipe(debug({'title': '- php'}))
			.pipe(reload({stream: true}));
	});


// JS
// ==
	gulp.task('js', options.jsTask || function() {
		return gulp.src(path.src.js, {since: gulp.lastRun('js')})
			.pipe(plumber(gulpIf(isDevelopment(), notify.onError({
				message: '<%= error.message %>',
				title: 'Js Task Error!'
			}), function (error) {
				console.log(error.message)
			})))
			.pipe(gulpIf(isDevelopment(), sourcemaps.init()))
			.pipe(babel({
				presets: [
					[es2015],
					[react]
				]
			}))
			.pipe(debug({'title': '- js'}))
			.pipe(duration('js time'))
			.pipe(gulp.dest(path.build.js))
			.pipe(reload({stream: true}));
	});

	gulp.task('jsx', options.jsxTask || function() {
		return gulp.src(path.src.jsx, {since: gulp.lastRun('jsx')})
			.pipe(plumber(gulpIf(isDevelopment(), notify.onError({
				message: '<%= error.message %>',
				title: 'Jsx task Error!'
			}), function (error) {
				console.log(error.message)
			})))
			.pipe(gulpIf(isDevelopment(), sourcemaps.init()))
			.pipe(babel({
				presets: [
					[es2015],
					[react]
				]
			}))
			.pipe(debug({'title': '- js'}))
			.pipe(duration('js time'))
			.pipe(gulp.dest(path.build.js))
			.pipe(reload({stream: true}));
	});

	gulp.task('jsComponents', options.jsComponentsTask || function() {
		console.log(process.env.NODE_ENV);
		return gulp.src(path.src.jsComponents, {since: gulp.lastRun('jsComponents')})
			.pipe(plumber(gulpIf(isDevelopment(), notify.onError({
				message: '<%= error.message %>',
				title: 'Jsx Components task Error!'
			}), function (error) {
				console.log(error.message)
			})))
			.pipe(debug({'title': '- jsComponents'}))
			.pipe(gulpIf(isDevelopment(), sourcemaps.init()))
			.pipe(babel({
				presets: [
					[es2015],
					[react]
				]
			}))
			.pipe(duration('jsComponents time'))
			.pipe(gulpIf(isDevelopment(), sourcemaps.write()))
			.pipe(gulp.dest(function(file) {
				return file.base;
			}))
			.pipe(reload({stream: true}));
	});

// IMAGES
// ======
	gulp.task('img', options.imgTask || function() {
		return gulp.src(path.src.img)
			.pipe(newer(path.build.img))
			.pipe(debug({'title': '- img'}))
			.pipe(imagemin({progressive: true}))
			.pipe(duration('img time'))
			.pipe(gulp.dest(path.build.img))
			.pipe(reload({stream: true}));
	});
	gulp.task('pic', options.picTask || function() {
		return gulp.src(path.src.pic)
			.pipe(newer(path.build.pic))
			.pipe(debug({'title': '- pic'}))
			.pipe(imagemin({progressive: true}))
			.pipe(duration('pic time'))
			.pipe(gulp.dest(path.build.pic))
			.pipe(reload({stream: true}));
	});


// FONTS
// =====
	gulp.task('fonts', options.fontsTask || function() {
		return gulp.src(path.src.fonts)
			.pipe(newer(path.build.fonts))
			.pipe(gulp.dest(path.build.fonts))
			.pipe(reload({stream: true}));
	});


// SERVER (only for local development)
// ===================================
	gulp.task('browserSync', options.browserSyncTask || function() {
		browserSync({
			proxy:  'letovo.dev:8080',
			port:   8080,
			open:   false,
			notify: true
		});
	});

	/* Выводит расширение файла */
	var getExtension = function (string) {
		var arrStr = string.split('.');
		var strLen = arrStr[arrStr.length - 1];
		return strLen;
	};

	/* Возвращает путь к собранному файлу */
	var getBuidExtension = function (string, ext) {
		var strLen = getExtension(string).length;
		return string.substr(0, string.length - strLen) + ext;
	};



// WATCH
// =====
	gulp.task('watch', options.watchTask || function() {
		gulp.watch(path.src.sass, {delay: isDevelopment() ? 200 : 1000}, gulp.series('sass'));
		gulp.watch(path.src.sassInclude, {delay: isDevelopment() ? 200 : 1000}, gulp.series('sassProject'));
		gulp.watch(path.src.sassComponents, gulp.series('sassComponents')).on('unlink', function (e) {
			del(getBuidExtension(e, 'css'), {force: true});
			del(getBuidExtension(e, 'css.map'), {force: true});
		});
		gulp.watch(path.src.js, {delay: isDevelopment() ? 200 : 1000}, gulp.series('js'));
		gulp.watch(path.src.jsx, {delay: isDevelopment() ? 200 : 1000}, gulp.series('jsx'));
		gulp.watch(path.src.jsComponents, {delay: isDevelopment() ? 200 : 1000}, gulp.series('jsComponents')).on('unlink', function (e) {
			del(getBuidExtension(e, 'js', path.build.js), {force: true});
			del(getBuidExtension(e, 'js.map', path.build.js), {force: true});
		});
		gulp.watch(path.src.sprite, {delay: isDevelopment() ? 200 : 1000}, gulp.series('sprite', 'sass'));
		gulp.watch(path.src.img, {delay: isDevelopment() ? 200 : 1000}, gulp.series('img'));
		gulp.watch(path.src.pic, {delay: isDevelopment() ? 200 : 1000}, gulp.series('pic'));
		return gulp.watch(path.src.fonts, {delay: isDevelopment() ? 200 : 1000}, gulp.series('fonts'));
		// gulp.watch(path.src.php,['php']);
	});

	/* Очистка билда */
	gulp.task('clean', function(cb) {
		return rimraf(path.clean.build, cb);
	});

	/* Очистка полная */
	gulp.task('full-clean', function(cb) {
		rimraf(path.clean.build, cb);
		return rimraf(path.clean.modules, cb);
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
	gulp.task('get-env', function(callback) {
		try {
			env(__dirname + '/.env')
		} catch (e) {
			console.log(e.message + ' [Build will be started with production settings]');
			process.env.NODE_ENV = 'production';
		}
		callback();
	});



// START
// =====
	gulp.task('default', options.defaultTasks || gulp.series('get-env', 'sprite', 'img', 'pic', 'fonts', gulp.parallel('sass', 'sassComponents', 'jsComponents', 'js', 'jsx'),'watch'));
	gulp.task('one', options.oneTasks || gulp.series('sprite', 'img', 'pic', 'fonts', gulp.parallel('sass', 'sassComponents', 'jsComponents', 'js', 'jsx')));
	gulp.task('prod', options.defaultTasks || gulp.series('set-prod-node-env', 'sprite', 'img', 'pic', 'fonts', gulp.parallel('sass', 'sassComponents', 'jsComponents', 'js', 'jsx'),'watch'));
	gulp.task('prod-one', options.oneTasks || gulp.series('set-prod-node-env', 'sprite', 'img', 'pic', 'fonts', gulp.parallel('sass', 'sassComponents', 'jsComponents', 'js', 'jsx')));
	gulp.task('dev', options.defaultTasks || gulp.series('set-dev-node-env', 'sprite', 'img', 'pic', 'fonts', gulp.parallel('sass', 'sassComponents', 'jsComponents', 'js', 'jsx'),'watch'));
	gulp.task('one-dev', options.oneTasks || gulp.series('set-dev-node-env', 'sprite', 'img', 'pic', 'fonts', gulp.parallel('sass', 'sassComponents', 'jsComponents', 'js', 'jsx')));

};

webpractikBuild();
module.exports = webpractikBuild;



