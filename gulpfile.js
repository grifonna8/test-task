const {src, dest, watch, series} = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const minify = require('gulp-minify');
const htmlmin = require('gulp-htmlmin');
const tinypng = require('gulp-tinypng-compress');

// Static server
function bs() {
  serveSass();
  browserSync.init({
      server: {
          baseDir: "./"
      }
  });
  watch("./*.html").on('change', browserSync.reload);
  watch("./sass/**/*.sass", serveSass);
  watch("./sass/**/*.scss", serveSass);
  watch("./js/*.js").on('change', browserSync.reload);
};

function serveSass() {
  return src("./sass/**/*.sass", "./sass/**/*.scss")
      .pipe(sass())
      .pipe(autoprefixer({
        cascade: false
      }))
      .pipe(dest("./css"))
      .pipe(browserSync.stream());
};

function buildCSS(done) {
  src('css/**/**.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(dest('dist/css/'));
  done();
}

function buildJS(done) {
  src(['js/**.js', '!js/**.min.js']) /* завернули в массив и сказали, что уже минимизированные файлы брать не надо */
      .pipe(minify({ext:{ /* настройка из плагина, чтобы не переименовывал файлы, кот. в него поступают */
            min:'.js'
          }
      }))
    .pipe(dest('dist/js/'));
  src('js/**.min.js').pipe(dest('dist/js/')); /* добавляем все файлы min.js в папку тоже, т.к. готовим все файлы к публикации  */
  done();
}

function html(done) {
  src('**.html')
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(dest('dist/')); /* взяли все файлы .html, минимизировали и перенесли в dist  */
  done();
}

function php(done) {
  src(['**.php'])
      .pipe(dest('dist/')); /* ищем все файлы php и переносим*/
  src('phpmailer/**/**')
      .pipe(dest('dist/phpmailer/')); /* переносим в отдел. папку phpmailer файлы оттуда */
  done();
}

function fonts(done) {
  src('fonts/**/**')
      .pipe(dest('dist/fonts/')); /* переносим в отдел. папку fonts все шрифты */
  done();
}

function imagemin(done) {
  src('img//**/*.{png,jpg,jpeg}')
      .pipe(tinypng({key: 'NsDLdH3vDc0JRz5yjSJHTjYM2qxSwTGS',})) /* сжали */
      .pipe(dest('dist/img/')) /* переместили */
  src('img/**/**.svg')
      .pipe(dest('dist/img/')) /* перместили svg файлы в img тоже */
  done();
}

exports.serve = bs;
exports.build = series(buildCSS, buildJS, html, php, fonts, imagemin);