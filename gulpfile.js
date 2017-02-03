var gulp = require('gulp');
var nodemon = require('nodemon');
var watch = require('gulp-watch');
var jasmineBrowser = require('gulp-jasmine-browser');
var os = require('os');
var open = require('gulp-open');

//parameters for starting server and tests
var config = require('./config.js')

//determine name of platform main browser
var browser = os.platform() === 'linux' ? 'google-chrome' : (
              os.platform() === 'darwin' ? 'google chrome' : (
              os.platform() === 'win32' ? 'chrome' : 'firefox'));

gulp.task('start', startServer);

gulp.task('test:server', testServer);
gulp.task('test:client', testClient);

function startServer(){
  var exec = 'node';

  nodemon({
      script: config.server.src,
      exec: exec
  });

  gulp.src('')
      .pipe(open({app: browser, uri: config.server.address}));
}

function testServer(){
  var testFiles = config.serverTests.files;
  gulp.src(testFiles)
      .pipe(watch(testFiles))
      .pipe(jasmineBrowser.specRunner())
      .pipe(jasmineBrowser.server({port: config.serverTests.port}));
  gulp.src('')
      .pipe(open({app: browser, uri: config.serverTests.address}));
}

function testClient(){
  var testFiles = config.clientTests.files
  gulp.src(testFiles)
      .pipe(watch(testFiles))
      .pipe(jasmineBrowser.specRunner())
      .pipe(jasmineBrowser.server({port: config.clientTests.port}));
  gulp.src('')
      .pipe(open({app: browser, uri: config.clientTests.address}));
}
