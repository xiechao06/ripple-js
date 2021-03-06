const gulp = require('gulp');
const connect = require('gulp-connect');
const portfinder = require('portfinder');
const { exec } = require('child_process');
const sourcemaps = require('gulp-sourcemaps');
const rollup = require('gulp-better-rollup');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const fs = require('fs');

gulp.task('connect', function () {
  portfinder.getPort(function (err, port) {
    connect.server({
      port,
      livereload: true,
    });
  });
});

gulp.task('html', function () {
  gulp.src('index.html')
  .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch('index.html', ['html']);
  gulp.watch('js/main.js', ['build']);
});

gulp.task('build', function () {
  gulp.src('js/main.js')
  .pipe(sourcemaps.init())
  .pipe(rollup({
    globals: {
      virtualDom: 'virtual-dom',
    },
    plugins: [nodeResolve(), commonjs()],
  }, 'iife'))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest('./dist/js/'))
  .pipe(connect.reload());
});

gulp.task('link', function (cb) {
  fs.access('../../dist/rimple.browser.js', fs.constants.R_OK, (err) => {
    if (err) {
      console.log('please run npm build in package root directory!');
      return;
    }
    exec('ln -sf ../../../dist/rimple.browser.js ./js/rimple.browser.js', () => {
      exec('ln -sf ../../../dist/rimple.browser.js.map ./js/rimple.browser.js.map', () => {
        cb();
      });
    });
  });
});

gulp.task('default', ['link', 'build', 'connect', 'watch']);
