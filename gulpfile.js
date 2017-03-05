var gulp = require('gulp');
var nodemon = require('nodemon');
var watch = require('gulp-watch');
var jasmine = require('gulp-jasmine');
var os = require('os');
var open = require('gulp-open');
var SpecReporter = require('jasmine-spec-reporter').SpecReporter;
var execute = require('child_process').exec;
var vnu = require('vnu-jar');
var DatabaseManager = require('./site/server/database-manager.js');


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

gulp.task('validate', validateHtml);

gulp.task('empty_leaderboard', emptyLeaderboard);

function startServer() {
  var exec = 'node';

  nodemon({
      script: config.server.src,
      exec: exec
  });

  //var address = config.use_https ? config.server.https_address : config.server.http_address;
  //gulp.src('')
  //    .pipe(open({app: browser, uri: address}));
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

// TODO: Make this work.
function validateHtml() {
  var htmlFiles = config.htmlFiles;

  var chunks = [];
  var stream = gulp.src(htmlFiles);
  stream.on("data", function (chunk){
    chunks.push(chunk);
  });

  stream.on("end", function () {
    for (var i = 0; i < chunks.length; i++) {
      execute(`java -jar ${vnu} --verbose ${chunks[i].path}`, (error, stdout) => {
        if (error) {
          console.log(error);
        } else {
          console.log(stdout);
        }
      });
    }
  });
}

function emptyLeaderboard() {
  var manager = new DatabaseManager('site/server/leaderboard.db');

  manager.deleteAllEntries(function (err) {
    if (err) console.log(err);
    else console.log('Successfully emptied the leaderboard database.');
  });
}
