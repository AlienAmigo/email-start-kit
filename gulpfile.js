"use strict";

const { series, parallel, src, dest, watch } = require("gulp");
const plumber = require("gulp-plumber");
const sass = require("gulp-sass")(require("sass"));
const browserSync = require("browser-sync").create();
const pug = require("gulp-pug");
const prettyHtml = require("gulp-pretty-html");
const replace = require("gulp-replace");
const del = require("del");
const inlineCss = require("gulp-inline-css");
const tobase64 = require("gulp-img64");
const cssBase64 = require("gulp-css-base64");

const nth = {};
nth.config = require("./config.js");

const dir = nth.config.dir;
const options = nth.config.options;

/**
 * Проверка существования файла или папки
 * @param  {string} path      Путь до файла или папки
 * @return {boolean}
 */

function fileExist(filepath) {
  let flag = true;
  try {
    fs.accessSync(filepath, fs.F_OK);
  } catch (e) {
    flag = false;
  }
  return flag;
}

function clean() {
  return del(dir.build);
}
exports.clean = clean;

function compileStyles() {
  return src(dir.src + "scss/style.scss")
    .pipe(
      plumber({
        errorHandler: function (err) {
          console.log(err.message);
          this.emit("end");
        },
      })
    )
    .pipe(sass())
    .pipe(dest(dir.src + "css/"))
    .pipe(browserSync.stream());
}
exports.compileStyles = compileStyles;

function compilePug() {
  return src(dir.src + "pug/**/*.pug")
    .pipe(
      plumber({
        errorHandler: function (err) {
          console.log(err.message);
          this.emit("end");
        },
      })
    )
    .pipe(pug())
    .pipe(
      prettyHtml({
        indent_size: 2,
        indent_char: " ",
        unformatted: ["code", "em", "strong", "span", "i", "b", "br"],
        content_unformatted: [],
      })
    )
    .pipe(
      replace(/^(\s*)(<button.+?>)(.*)(<\/button>)/gm, "$1$2\n$1  $3\n$1$4")
    )
    .pipe(
      replace(
        /^( *)(<.+?>)(<script>)([\s\S]*)(<\/script>)/gm,
        "$1$2\n$1$3\n$4\n$1$5\n"
      )
    )
    .pipe(
      replace(
        /^( *)(<.+?>)(<script\s+src.+>)(?:[\s\S]*)(<\/script>)/gm,
        "$1$2\n$1$3$4"
      )
    )
    .pipe(dest(dir.src));
}
exports.compilePug = compilePug;

function copyImages() {
  return src(dir.src + "img/**/*.{jpg,jpeg,png,svg,webp,gif}").pipe(
    dest(dir.build + "img/")
  );
}
exports.copyImages = copyImages;

function copyHTML() {
  return src(dir.src + "*.html").pipe(dest(dir.build));
}
exports.copyHTML = copyHTML;

function copyCSS() {
  return src(dir.src + "css/*.css").pipe(dest(dir.build + "css/"));
}
exports.copyCSS = copyCSS;

function base64CSS() {
  return src(dir.src + "css/style.css")
    .pipe(
      cssBase64({
        baseDir: ".",
        maxWeightResource: 1000000,
      })
    )
    .pipe(dest((file) => file.base));
}
exports.base64CSS = base64CSS;

function compileMailHTML64() {
  return src(dir.src + "*.html")
    .pipe(tobase64())
    .pipe(dest((file) => file.base));
}
exports.compileMailHTML64 = compileMailHTML64;

function compileMailHTML() {
  return src(dir.src + "*.html")
    .pipe(
      inlineCss({
        applyStyleTags: true,
        applyLinkTags: true,
        removeStyleTags: true,
        removeLinkTags: true,
        removeHtmlSelectors: true,
      })
    )
    .pipe(dest(dir.build));
}
exports.compileMailHTML = compileMailHTML;

function serve() {
  browserSync.init({
    server: dir.build,
    startPath: "index.html",
    open: false,
    port: 8080,
  });
  watch([dir.src + "scss/**/*.scss"], compileStyles);
  watch([dir.src + "*.html"], copyHTML);
  watch([dir.src + "css/**/*.css"], copyCSS);
  watch([dir.src + "scss/**/*.{css,sass,scss}"], compileStyles);
  watch([dir.src + "img/**/*.{jpg,jpeg,png,svg,webp,gif}"], copyImages);
  watch([dir.src + "pug/*.pug"], compilePug);
  watch([dir.build + "*.html", dir.build + "*.{jpg,jpeg,png,svg,webp,gif}"]).on(
    "change",
    browserSync.reload
  );
}

exports.build = series(
  clean,
  compileStyles,
  compilePug,
  compileMailHTML,
  copyImages
);

exports.build64 = series(
  clean,
  compileStyles,
  compilePug,
  base64CSS,
  compileMailHTML64,
  compileMailHTML
);

exports.default = series(
  clean,
  parallel(compileStyles, compilePug, copyHTML, copyCSS, copyImages),
  serve
);
