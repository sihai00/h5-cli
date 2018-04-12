const gulp = require('gulp')
// const minify = require('gulp-uglify')
const concat = require('gulp-concat')
const sass = require("gulp-sass")
const autoprefixer = require('gulp-autoprefixer')
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')
const fileinclude = require('gulp-file-include')
const rev = require('gulp-rev-append')
const sourcemaps = require('gulp-sourcemaps')
const browserSync = require('browser-sync').create()
const htmlmin = require('gulp-htmlmin')
const rimraf = require('gulp-rimraf')
const babel = require('gulp-babel')

// 压缩es6
const uglifyjs = require('uglify-es')
const composer = require('gulp-uglify/composer')
const minify = composer(uglifyjs, console)

const options = {
  removeComments: true,//清除HTML注释
  collapseWhitespace: true,//压缩HTML
  collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
  removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
  removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
  removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
  minifyJS: true,//压缩页面JS
  minifyCSS: true//压缩页面CSS
}

const project = {
  concatjs: {
    main: ["src/js/common/zepto.js", "src/js/common/touch.js", "src/js/common/!(zepto|touch).js"],
    build: "dist/js"
  },
  vender: {
    main: "src/js/vender/*.js",
    build: "dist/js/vender",
  },
  js: {
    main: "src/js/!(common|vender)/*.js",
    build: "dist/js",
    watch: "src/js/**"
  },
  sass: {
    main: "src/sass/main.scss",
    build: "dist/css",
    watch: "src/sass/**"
  },
  html: {
    main: "src/html/*.html",
    build: "dist",
    watch: "src/html/**"
  },
  assets: {
    main: "src/assets/**",
    build: "dist/assets"
  },
}

// 合并压缩公共js
// 开发环境
gulp.task('concatjs:debug', function() {
  gulp.src(project.concatjs.main)
    .pipe(concat('common.js'))
    .pipe(babel({
      presets: ['@babel/preset-es2015'],
    }))
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    // .pipe(minify())
    .pipe(gulp.dest(project.concatjs.build))
})
// 生产环境
gulp.task('concatjs', function() {
  gulp.src(project.concatjs.main)
    .pipe(concat('common.js'))
    .pipe(babel({
      presets: ['@babel/preset-es2015'],
    }))
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(minify())
    .pipe(gulp.dest(project.concatjs.build))
})

// js
// 开发环境
gulp.task('js:debug', function() {
  gulp.src(project.js.main)
    .pipe(sourcemaps.init())
    // .pipe(babel({
    //   presets: ['@babel/preset-es2015'],
    // }))
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(sourcemaps.write('.'))
    // .pipe(minify())
    .pipe(gulp.dest(project.js.build))
})
// 生产环境
gulp.task('js', function() {
  gulp.src(project.js.main)
    .pipe(babel({
      presets: ['@babel/preset-es2015'],
    }))
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(minify())
    .pipe(gulp.dest(project.js.build))
})

// vender 第三方单独js裤
gulp.task('vender', function() {
  gulp.src(project.vender.main)
    .pipe(gulp.dest(project.vender.build))
})

// sass
// 开发环境
gulp.task("sass:debug", function() {
  gulp.src(project.sass.main)
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(autoprefixer('last 2 versions'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(project.sass.build))
})
// 生产环境
gulp.task("sass", function() {
  gulp.src(project.sass.main)
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(autoprefixer('last 2 versions'))
    .pipe(gulp.dest(project.sass.build))
})

// html
gulp.task('html', function() {
  gulp.src(project.html.main)
    .pipe(fileinclude())
    .pipe(gulp.dest(project.html.build))
    .pipe(rev())
    .pipe(htmlmin(options))
    .pipe(gulp.dest(project.html.build))
})

// 删除
gulp.task('delete', function() {
  gulp.src('dist', { read: false })
   .pipe(rimraf())
})

// assets
gulp.task("assets", function() {
  gulp.src(project.assets.main)
    .pipe(gulp.dest(project.assets.build))
})

// 开发环境打包
gulp.task('build:debug', function() {
  gulp.start(['sass:debug', 'html', 'vender', 'concatjs:debug', 'js:debug',  'assets'])
})

// 生产环境打包
gulp.task('build', function() {
  gulp.start(['sass', 'html', 'vender', 'concatjs', 'js', 'assets'])
})

// 服务器
gulp.task('serve', ['build:debug'], function() {
  browserSync.init({
    server: {
      baseDir: 'dist',
      index: './index.html'
    }
  })

  gulp.watch(project.sass.watch, ['build:debug', browserSync.reload])
  gulp.watch(project.js.watch, ['build:debug', browserSync.reload])
  gulp.watch(project.html.watch, ['build:debug', browserSync.reload])
  // gulp.watch(['dist/**', 'dist/*/**']).on('change', browserSync.reload)
})
