'use strict';
var spritesmith      = require('gulp.spritesmith');		 // уведомления об ошибках

module.exports = function (options) {

    var gulp = options.gulp;

    var spriteData =
        gulp.src(options.path.src.sprite)
            .pipe(spritesmith({
                imgName: options.sprite.imgName || 'sprite.png',
                cssName: options.sprite.cssName || '_sprite.sass',
                imgPath: options.staticFolder + options.path.build.sprite + 'sprite.png'
            }));

    spriteData.img.pipe(gulp.dest(options.path.build.sprite)); // путь, куда сохраняем картинку
    return spriteData.css.pipe(gulp.dest(options.path.src.sprLang)); // путь, куда сохраняем стили
};
