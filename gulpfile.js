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
	debug        = require('gulp-debug');        // отладка

var webpractikBuild = function (options) {
	var options = options || {};

// PATH
// ====
		var path = options.path || {
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
		};

		var includePath = options.includePath || '/assets/sass/global/include/',
			staticFolder = options.staticFolder || '/local/static/';

		gulp.task('hello', function () {
			console.log('hello')
		});
// SASS
// ====
		gulp.task('sass', options.taskSass || function() {
			gulp.src(path.src.sass)
				.pipe(newer({
						dest: path.build.css,
						ext:  '.css'
					})
				)
				.pipe(plumber())
				.pipe(sourcemaps.init())
				.pipe(sass.sync({
					includePaths: [process.env['INIT_CWD'] + includePath]
				}).on('error', notify.onError({
					message: '<%= error.message %>',
					title: 'Sass Error!'
				})))
				.pipe(autoprefixer({
					browsers: ['last 12 versions', '> 1%'],
					cascade:  false,
					remove:   false
				}))
				.pipe(debug({'title': '- sass'}))
				.pipe(duration('sass time'))
				.pipe(sourcemaps.write('.'))
				.pipe(gulp.dest(path.build.css))
			//.pipe(reload({stream: true}));
		});

// components
		gulp.task('sassComponents', options.sassComponents || function() {
			gulp.src(path.src.sassComponents)
				.pipe(plumber())
				.pipe(sourcemaps.init())
				.pipe(sass.sync({
					includePaths: [process.env['INIT_CWD'] + includePath]
				}).on('error', notify.onError({
					message: '<%= error.message %>',
					title: 'Sass Error!'
				})))
				.pipe(autoprefixer({
					browsers: ['last 12 versions', '> 1%'],
					cascade:  false,
					remove:   false
				}))
				.pipe(debug({'title': '- sassComponents'}))
				.pipe(duration('sassComponents time'))
				.pipe(sourcemaps.write('./'))
				.pipe(gulp.dest(function(file) {
					return file.base;
				}))
			//.pipe(reload({stream: true}));
		});


// project
// данный task по сути костыль, чтобы обойти newer и подкючаемые файлы (_*.sass) запускались
		gulp.task('sassProject', options.sassProject || function() {
			gulp.src(path.src.sassProject)
				.pipe(plumber())
				.pipe(sass.sync({
					includePaths: [process.env['INIT_CWD'] + includePath]
				}).on('error', notify.onError({
					message: '<%= error.message %>',
					title: 'Sass Error!'
				})))
				.pipe(autoprefixer({
					browsers: ['last 12 versions', '> 1%'],
					cascade:  false,
					remove:   false
				}))
				.pipe(debug({'title': '- sassProject'}))
				.pipe(duration('sassProject time'))
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
			spriteData.css.pipe(gulp.dest(path.src.sprLang)); // путь, куда сохраняем стили
		});


// PHP
// ===
		gulp.task('php', options.phpTask || function() {
			gulp.src(path.src.php)
				.pipe(debug({'title': '- php'}))
				.pipe(reload({stream: true}));
		});


// JS
// ==
		gulp.task('js', options.jsTask || function() {
			gulp.src(path.src.js)
				.pipe(plumber())
				.pipe(babel({
					presets: [
						[es2015],
						[react]
					]
				}).on('error', notify.onError({
					message: '<%= error.message %>',
					title: 'Babel Error!'
				})))
				.pipe(debug({'title': '- js'}))
				.pipe(duration('js time'))
				.pipe(gulp.dest(path.build.js))
				.pipe(reload({stream: true}));
		});

		gulp.task('jsx', options.jsxTask || function() {
			gulp.src(path.src.jsx)
				.pipe(plumber())
				.pipe(babel({
					presets: [
						[es2015],
						[react]
					]
				}).on('error', notify.onError({
					message: '<%= error.message %>',
					title: 'Babel Error!'
				})))
				.pipe(debug({'title': '- js'}))
				.pipe(duration('js time'))
				.pipe(gulp.dest(path.build.js))
				.pipe(reload({stream: true}));
		});

		gulp.task('jsComponents', options.jsComponentsTask || function() {

			gulp.src(path.src.jsComponents)
				.pipe(plumber())
				.pipe(debug({'title': '- jsComponents'}))
				.pipe(sourcemaps.init())
				.pipe(babel({
					presets: [
						[es2015],
						[react]
					]
				}).on('error', notify.onError({
					message: '<%= error.message %>',
					title: 'Babel Error!'
				})))
				.pipe(duration('jsComponents time'))
				.pipe(sourcemaps.write('.'))
				.pipe(gulp.dest(function(file) {
					return file.base;
				}))
				.pipe(reload({stream: true}));
		});

// IMAGES
// ======
		gulp.task('img', options.imgTask || function() {
			gulp.src(path.src.img)
				.pipe(newer(path.build.img))
				.pipe(debug({'title': '- img'}))
				.pipe(imagemin({progressive: true}))
				.pipe(duration('img time'))
				.pipe(gulp.dest(path.build.img))
				.pipe(reload({stream: true}));
		});
		gulp.task('pic', options.picTask || function() {
			gulp.src(path.src.pic)
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
			gulp.src(path.src.fonts)
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


// WATCH
// =====
		gulp.task('watch', options.watchTask || function() {
			gulp.watch(path.src.sass, ['sass']);
			gulp.watch(path.src.sassInclude, ['sassProject']);
			gulp.watch(path.src.sassComponents, ['sassComponents']);
			gulp.watch(path.src.js, ['js']);
			gulp.watch(path.src.jsx, ['jsx']);
			gulp.watch(path.src.jsComponents, ['jsComponents']);
			gulp.watch(path.src.sprite, ['sprite', 'sass']);
			gulp.watch(path.src.img, ['img']);
			gulp.watch(path.src.pic, ['pic']);
			gulp.watch(path.src.fonts, ['fonts']);
			// gulp.watch(path.src.php,['php']);
		});


// START
// =====
		gulp.task('default', options.defaultTasks || ['sprite', 'sass', 'sassComponents', 'jsComponents', 'js', 'jsx', 'img', 'pic', 'fonts', 'watch']);
		gulp.task('one', options.oneTasks || ['sprite', 'sass', 'sassComponents', 'jsComponents', 'js', 'jsx', 'img', 'pic', 'fonts']);
// gulp.task('local', ['sprite', 'sass', 'sassComponents', 'js', 'img', 'pic', 'fonts', 'watch', 'browserSync']);
// gulp.task('local-watch', ['watch', 'browserSync']);

// Очистка билда
		gulp.task('clean', function(cb) {
			rimraf(path.clean.build, cb);
		});

// Очистка полная
		gulp.task('full-clean', function(cb) {
			rimraf(path.clean.build, cb);
			rimraf(path.clean.modules, cb);
		});

		/* Переключаем на окружение development */
		gulp.task('set-dev-node-env', function() {
			return process.env.NODE_ENV = 'development';
		});

		/* Переключаем на окружение production */
		gulp.task('set-prod-node-env', function() {
			return process.env.NODE_ENV = 'production';
		});
	};

webpractikBuild();
module.exports = webpractikBuild;



