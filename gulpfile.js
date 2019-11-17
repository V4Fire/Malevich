'use strict';

/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

const
	$C = require('collection.js'),
	path = require('upath'),
	isPathInside = require('is-path-inside');

const
	nodemon = require('gulp-nodemon'),
	plumber = require('gulp-plumber');

const
	{src} = require('config'),
	{config, resolve} = require('@pzlr/build-core');

const
	defineRequire = include('build/require.gulp');

module.exports = function (gulp = require('gulp')) {
	require('@v4fire/client/gulpfile')(gulp);

	gulp.task('build:server', () => {
		const
			ts = require('gulp-typescript'),
			defReq = `(${defineRequire.toString()})();\n`,
			header = require('gulp-header'),
			isDep = new RegExp(`(^.*?(?:^|[\\/])(${config.dependencies.map((el) => RegExp.escape(el)).join('|')}))(?:$|[\\/])`),
			tsProject = ts.createProject('server.tsconfig.json');

		function dest(file) {
			const
				out = src.serverOutput(),
				depDecl = isDep.exec(file.path);

			if (depDecl) {
				file.base = $C(resolve.rootDependencies).one.get((el) => isPathInside(el, depDecl[1]));
				return path.join(out, 'node_modules', depDecl[2]);
			}

			return out;
		}

		return gulp.src(['*.d.ts', `${config.serverDir}/**/*.ts`, ...resolve.rootDependencies.map((el) => `${el}/**/*.ts`)])
			.pipe(plumber())
			.pipe(tsProject())
			.js
			.pipe(header(defReq))
			.pipe(gulp.dest(dest));
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
