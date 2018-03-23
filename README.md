## Сборка проектов на Bitrix

<h5>Включение модуля в сборку:</h5>

Устаравливаем модуль:

<pre>npm install gulp-bitrix</pre>

В <b>gulpfile.js</b> вызываем модуль с параметрами. Например:

<pre>var tasks = require('gulp-bitrix')({dirName: __dirname});</pre>

Опцию dirName желательно указывать, чтобы сборка брала корневую папку вашего проекта, а не корневую папку модуля.

Возвращается объект, который содержит в себе функции, которые можно вызывать в задачу.

На данный момент содержит в себе функции-задачи:

<b style="color: red">def</b> - выполняется сборка и включается watcher <br>
<b style="color: red">one</b> - выполняется сборка, без запуска watcher <br>
<b style="color: red">dev</b> - выполняется сборка c настройками среды development и включается watcher <br>
<b style="color: red">one</b> - выполняется сборка c настройками среды development, без запуска watcher <br>
<b style="color: red">prod</b> - выполняется сборка c настройками среды production и включается watcher <br>
<b style="color: red">prodOne</b> - выполняется сборка c настройками среды production, без запуска watcher <br>
<b style="color: red">sass</b> - сборка sass-файлов <br>
<b style="color: red">sassProject</b> - сборка файла project.css <br>
<b style="color: red">sassComponents</b> - сборка стилей в папках компонентов Битрикса <br>
<b style="color: red">js</b> - babel-сборка js файлов <br>
<b style="color: red">jsx</b> - babel-cборка jsx файлов <br>
<b style="color: red">jsComponents</b> - сборка js-файлов в комонентах Битрикс <br>
<b style="color: red">fonts</b> - сборка шрифтов <br>
<b style="color: red">img и pic</b> - минификация картинок из разных директорий <br>
<b style="color: red">clean</b> - очистка файлов проекта <br>
<b style="color: red">fullClean</b> - очистка папки build <br>
<b style="color: red">setProd</b> - установка режима Production <br>
<b style="color: red">setDev</b> - установка режима Development <br>
<b style="color: red">watch</b> - watcher <br>
<b style="color: red">getEnv</b> - получение из файла .env данных о среде <br>

<h5>Также можно получить некоторые опции по-умолчанию:</h5>

<b style="color: red">path</b> - пути к файлам проекта по-умолчанию <br>
<b style="color: red">options</b> - путь к переданным опциям <br>
<b style="color: red">gulp</b> - ссылка на объект gulp модуля <br>


Пример использования модуля:
<pre>gulp.task('default', gulp.series(tasks.def));</pre>

Любую из стандартных функций можно переопределить.

Также имеется возможность развернуть задачи одной командой.
<pre>tasks.init(gulp)</pre>

В функцию передается текущий экземпляр <b>gulp</b>.

