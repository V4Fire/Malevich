'use strict';

/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

const
	nodemon = require('gulp-nodemon'),
	plumber = require('gulp-plumber'),
	{src} = require('config'),
	{config} = require('@pzlr/build-core');

const
	defineRequire = include('build/require.gulp');

module.exports = function (gulp = require('gulp')) {
	require('@v4fire/client/gulpfile')(gulp);

	gulp.task('build:server', () => {
		const
			ts = require('gulp-typescript'),
			defReq = `(${defineRequire.toString()})();\n`,
			header = require('gulp-header'),
			tsProject = ts.createProject('server.tsconfig.json');

		return gulp.src(['*.d.ts', `${config.serverDir}/**/*.ts`])
			.pipe(plumber())
			.pipe(tsProject())
			.js
			.pipe(header(defReq))
			.pipe(gulp.dest(src.serverOutput()));
	});

	gulp.task('watch:server.build', (done) => {
		gulp.watch(`${config.serverDir}/**/*.ts`, gulp.series('build:server'));
		done();
	});

	gulp.task('watch:server', (done) => {
		const
			dest = src.serverOutput(),
			stream = nodemon({
				script: dest,
				ext: 'js',
				watch: [dest],
				done
			});

		stream.on('quit', function () {
			console.log('App has quit');
			process.exit();

		}).on('restart', function (files) {
			console.log('App restarted due to: ', files);
		});

		done();
	});

	gulp.task(
		'start:watch:server', gulp.series(['build:server', 'watch:server.build', 'watch:server'])
	);

	global.callGulp(module);
};

module.exports();
