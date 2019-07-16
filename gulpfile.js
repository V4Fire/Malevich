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
	{src} = require('config'),
	{config} = require('@pzlr/build-core');

module.exports = function (gulp = require('gulp')) {
	require('@v4fire/client/gulpfile')(gulp);

	gulp.task('build:server', () => {
		const
			ts = require('gulp-typescript'),
			tsProject = ts.createProject('tsconfig.server.json', {noLib: false});

		return gulp.src(['*.d.ts', `${config.serverDir}/**/*.ts`])
			.pipe(tsProject())
			.pipe(gulp.dest(src.serverOutput()));
	});

	gulp.task('watch:server.build', (done) => {
		gulp.watch(`${config.serverDir}/**/*.ts`, gulp.series('build:server'));
		done();
	});

	gulp.task('watch:server', (done) => {
		const
			stream = nodemon({
				script: src.serverOutput(),
				ext: 'js',
				watch: [src.serverOutput()],
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
