var gulp = require('gulp');

gulp.task('run', startServer());

gulp.task('default', ['run']);

function startServer(){
	var nodemon = require('nodemon');
	var exec = 'node';
	var script = './site/server.js';

	nodemon({
		script: script,
		exec: exec
	});
}