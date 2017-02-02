var gulp = require('gulp');
var path = require('path');

gulp.task('run', startServer());

gulp.task('default', ['run']);

function startServer(){
	var nodemon = require('nodemon');
	var exec = 'node';
	var script = path.resolve('./site/server.js');

	nodemon({
		script: script,
		exec: exec
	});
}