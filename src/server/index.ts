/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import * as express from 'express';

import config = require('config');
import fs = require('fs');
import $C = require('collection.js');

import path = require('path');

const
	// @ts-ignore
	{api, src} = config,
	app = module.exports = express();

fs.readdir(path.resolve(__dirname, 'controllers'), (err, files) => {
	if (err) {
		return;
	}

	$C(files).forEach((el) => {
		const
			{default: {url, method, fn}} = require(path.resolve(__dirname, 'controllers', el));

		app[method](url, fn);
	});
});

app.use('/dist/client', express.static(src.clientOutput()));
app.use('/assets', express.static(src.assets()));

[
	['/**', 'p-root']

].forEach(([route, file]) => {
	file += '.html';
	app.get(route, (req, res) => res.sendFile(path.join(src.clientOutput(), file)));
});

app.listen(api.port);
console.log('App launched');
console.log(`http://localhost:${api.port}`);
