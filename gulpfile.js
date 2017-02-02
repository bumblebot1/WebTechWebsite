var gulp = require('gulp');

gulp.task('run', startServer());

gulp.task('default', ['run']);

function startServer(){
	var nodemon = require('nodemon');
	var exec = 'node';

	nodemon({
		script: './site/server.js',
		exec: exec
	});
}
