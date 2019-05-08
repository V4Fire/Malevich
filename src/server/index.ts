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
import cookieParser = require('cookie-parser');
import session = require('express-session');

const
	// @ts-ignore
	{api, src} = config,
	app = module.exports = express();

app.use(cookieParser());
app.use(session({
	secret: process.env.SESSION_SECRET,
	cookie: {
		maxAge: 60000
	}
}));

const
	files = fs.readdirSync(path.resolve(__dirname, 'controllers'), {withFileTypes: false});

$C(files).forEach((el) => {
	const
		{default: {namespace, routes}} = require(path.resolve(__dirname, 'controllers', el));

	$C(routes).forEach((r) => {
		app[r.method](path.join('/', namespace, r.url), r.fn);
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
