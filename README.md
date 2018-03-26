## Сборка проектов на Bitrix

<h5>Включение модуля в сборку:</h5>

Устаравливаем модуль:

<pre>npm install gulp-bitrix</pre>

В <b>gulpfile.js</b> вызываем модуль с параметрами. Например:

<pre>var tasks = require('gulp-bitrix')({dirName: __dirname});</pre>

Опцию dirName желательно указывать, чтобы сборка брала корневую папку вашего проекта, а не корневую папку модуля.


<h4>Задачи:</h4>
Модуль возвращет объект, который содержит в себе функции, которые можно вызывать в задаче.

На данный момент, содержит в себе задачи:r

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


Пример использования модуля через свойство:
<pre>gulp.task('default', tasks.def);</pre>

Любую из стандартных задач можно переопределить, просто присвоив другую функцию:

<pre>tasks.sass = function(callback) {
         console.log('custom-sass-task');
         callback();
     };</pre>
     
Можно добавлять новые задачи с помощью функции <b>addTask(name, task)</b> где:
<b>name</b> - название новой задачи;
<b>task</b> - функция.

<pre>
    tasks.addTask('custom', function(callback) {
        console.log('custom');
        callback();
    });
</pre> 

Функции подключаемые вами пользуются модулями, которые подключены в вашем Gulp-файле. То есть если вы собираетесь пользоваться только
стандартными функциями - то модуль будет работать без дополнительных подключений. Если вы хотите переопределить или добавить
свою задачу - нужно будет определить модули, которые используются в задаче.

Также имеется возможность развернуть задачи одной командой.
<pre>tasks.init(gulp)</pre>
В функцию передается текущий экземпляр <b>gulp</b>.

Default - функция gulp при этом не создается, вместо нее устанавливается функция 'def'. Ее можно определить в вайшей default-функции
<pre>gulp.task('default', gulp.series('def'))</pre>

Или задать функции task.init() опцию initDefault: 
<pre>tasks.init(gulp, {initDefault: true})</pre>

<b>Внимание!</b><br>
Если вы переопределяете стандартные задачи, добавляете свои или изменяете настройки путей - 
это нужно делать до того как будет вызван  tasks.init(), иначе будут приняты только те изменения, которые были до ее вызова. 

Еще один способ переопределить стандартные задачи - это просто определить их через gulp.task, опять же это
 делается до вызова функции init().
 
 <pre>
 // Эта задача заменит стандартную
 gulp.task('sass', function (callback) {
     console.log('custom-sass');
     callback();
 });
 
 tasks.init(gulp, {initDefault: true});</pre>
 
Этот способ работает только при переопределении задачи, добавить таким образом задачу, чтобы она использовалась модулем, не получится. 
 
<h4>Переопределение путей:</h4>

Есть два способа - сделать это путем изменения в модуле:

<pre>tasks.path.build.js = './my-folder/script.js';</pre>

Либо передать в опциях при вызове модуля:

<pre>var tasks = require('gulp-bitrix')(
    {
        dirName: __dirname,
        path: {build: {js: './my-folder/'}}
    }
);</pre>

Но такой способ годится для более радикального изменения, так как будет изменено свойство build полностью.

<h4>Опции:</h4>

При вызове модуля ему можно передать ряд опций:

<b style="color: red">dirName</b> - директория относительно которой проставлены пути <br>
<b style="color: red">path</b> - с помощью этой опции можно поменять пути к файлам. Изменения свойств объекта path происходит
 путем наложения объекта, то есть определив одно свойство другие остаются как и были.<br>
<b style="color: red">includeTasks</b> - массив в котором можно перечислить задачи, которые будут выполнены в сборке. Если ничего не
 указано, выполняется весь список.<br>
 <b style="color: red">excludeTasks</b> - массив в котором можно перечислить задачи, которые не будут выполняться. Если ничего не
  указано, то все задачи будут выполнены.<br>
  <b style="color: red">includePath</b> - используется для определения пути к файлам sass, которые подключаются в project.sass <br>
  <b style="color: red">staticFolder</b> - стоит менять только если папка сборки находится в другом месте, нежели корневая папка
   используемых в задаче файлах<br>
   <b style="color: red">sourcemaps</b> - если выставлена эта опция - то будут генерироваться sourcemaps на сборке dev <br>
   <b style="color: red">developmentWatchDelay</b> - задержка watcher-a в изменении файла в development-среде <br>
   <b style="color: red">productionWatchDelay</b> - задержка watcher-a в изменении файла в production-среде <br>
    <b style="color: red">sprite.imgName</b> - можно указать имя файла, который будет создан при сборке спрайта (по-умолчанию "sprite.png") <br>
    <b style="color: red">sprite.cssName</b> - можно указать имя sass-файла, который будет создан при сборке спрайта (по-умолчанию "sprite.sass") <br>

