const gulp = require('gulp');
const portfinder = require('portfinder');
const connect = require('gulp-connect');
const { exec } = require('child_process');
const sourcemaps = require('gulp-sourcemaps');
const rollup = require('gulp-better-rollup');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const json = require('rollup-plugin-json');

gulp.task('connect', function () {
  portfinder.getPort(function (err, port) {
    connect.server({
      livereload: true,
      port,
      fallback: 'index.html',
    });
  });
});

gulp.task('html', function () {
  gulp.src('index.html')
  .pipe(connect.reload());
});

gulp.task('css', function () {
  gulp.src('index.html')
  .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch('index.html', ['html']);
  gulp.watch('js/**/*.js', ['build']);
  gulp.watch('css/main.css', ['css']);
});

gulp.task('link', function (cb) {
  exec('ln -sf ../../../dist/ripple.js ./js/ripple.js', (err) => {
    if (err) {
      console.log('please run npm build in package root directory!');
      return;
    }
    exec('ln -sf ../../../dist/ripple.js.map ./js/ripple.js.map', () => {
      cb();
    });
  });
});

gulp.task('build', function () {
  gulp.src('js/main.js')
  .pipe(sourcemaps.init())
  .pipe(rollup({
    external: ['virtual-dom'],
    globals: {
      'virtual-dom': 'virtualDom',
    },
    plugins: [ nodeResolve(), commonjs(), json() ],
  }, 'iife'))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest('./dist/js/'))
  .pipe(connect.reload());
});


gulp.task('default', ['link', 'build', 'connect', 'watch']);