var gulp = require('gulp');
var nodemon = require('nodemon');
var watch = require('gulp-watch');
var jasmine = require('gulp-jasmine');
var os = require('os');
var open = require('gulp-open');
var SpecReporter = require('jasmine-spec-reporter').SpecReporter;


//parameters for starting server and tests
var config = require('./config.js')

//determine name of platform main browser
var browser = os.platform() === 'linux' ? 'google-chrome' : (
              os.platform() === 'darwin' ? 'google chrome' : (
              os.platform() === 'win32' ? 'chrome' : 'firefox'));

gulp.task('start', startServer);
gulp.task('start:matchmaker', startMatchmaker);
gulp.task('start:router', startRouter);

gulp.task('test:server', testServer);

function startServer() {
  var exec = 'node';

  nodemon({
      script: config.server.src,
      exec: exec
  });

  gulp.src('')
      .pipe(open({app: browser, uri: config.server.http_address}));
}

function startMatchmaker() {
  var exec = 'node';

  nodemon({
      script: config.matchmaker.src,
      exec: exec
  });
}

function startRouter() {
  var exec = 'node';

  nodemon({
      script: config.router.src,
      exec: exec
  });
}

function testServer() {
  var testFiles = config.serverTests.testFiles;
  var serverFiles = config.serverTests.allFiles;

  //run the tests for the server
  gulp.src(testFiles)
      .pipe(jasmine({
          reporter: new SpecReporter()
      }));

  //watch all server files for changes and rerun tests
  gulp.watch(serverFiles, function () {
    gulp.src(testFiles)
      .pipe(jasmine({
          reporter: new SpecReporter()
      }));
  });
}
