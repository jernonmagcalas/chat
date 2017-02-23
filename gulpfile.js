'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const symlink = require('gulp-sym');
const webpack = require('webpack');
const ts = require('gulp-typescript');
const chen = require('chen-typescript');

/**
 * Build client source code task
 */
const clientWebpack = webpack(require('./src/client/webpack.config'));
gulp.task('build-client-src', done => {
  clientWebpack.run((err, stats) => {

    if (err) {
      throw new gutil.PluginError('build-client-src', err);
    }

    gutil.log('[build-client-src]', stats.toString({
      chunks: false,
      colors: true
    }));

    done();
  });
});

/**
 * Build client
 */
gulp.task('build-client', ['build-client-src']);

/**
 * Build server source code task
 */
const tsProject = ts.createProject('./src/server/tsconfig.json', { typescript: chen });
gulp.task('build-server-src', () => {

  let result = tsProject.src()
    .pipe(sourcemaps.init())
    .pipe(tsProject(ts.reporter.fullReporter()));

  return result.js
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

/**
 * Build server task
 */
gulp.task('build-server', ['build-server-src'], () => {
  return gulp.src('dist/artisan.js')
    .pipe(symlink('artisan', { force: true, relative: true }));
});

/**
 * Sass compilation
 */
gulp.task('sass', () => {
  return gulp.src('resources/assets/sass/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/css'));
});

/**
 * Create image folder symlink
 */
gulp.task('symlink-images', () => {
  return gulp.src('resources/assets/images')
    .pipe(symlink('public/images', { force: true, relative: true }));
});

/**
 * Create fonts folder symlink
 */
gulp.task('symlink-fonts', () => {
  return gulp.src('resources/assets/fonts')
    .pipe(symlink('public/fonts', { force: true, relative: true }));
});

/**
 * Create js folder symlink
 */
gulp.task('symlink-js', () => {
  return gulp.src('resources/assets/js')
    .pipe(symlink('public/js', { force: true, relative: true }));
});

/**
 * Task for creating asset symlinks
 */
gulp.task('symlink-assets', ['symlink-images', 'symlink-fonts', 'symlink-js']);

/**
 * Build assets task
 */
gulp.task('build-assets', ['sass', 'symlink-assets']);

/**
 * Build assets watch task
 */
gulp.task('build-assets:watch', ['build-assets'], () => {
  gulp.watch('resources/assets/sass/**/*.scss', ['sass']);
});

/**
 * Default task
 */
gulp.task('default', ['build-client', 'build-server', 'build-assets']);

/**
 * Watch task
 */
gulp.task('watch', ['default', 'build-assets:watch'], () => {
  gulp.watch('src/server/**/*.ts', ['build-server']);
  gulp.watch('src/client/**/*.tsx', ['build-client']);
});
