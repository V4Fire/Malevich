/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import './core/prelude/index';
import express = require('express');
import config = require('config');
import $C = require('collection.js');

import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');
import session = require('express-session');

import path = require('upath');
import fs = require('fs');
import gitPromise = require('simple-git/promise');

const
	{DS_PACKAGE} = process.env,
	dsRepoLocalPath = path.resolve(process.cwd(), 'repository');

let
	needInit = false;

if (!fs.existsSync(dsRepoLocalPath)) {
	needInit = true;
	fs.mkdirSync(dsRepoLocalPath);
}

const
	git = gitPromise(dsRepoLocalPath);

if (needInit && DS_PACKAGE) {
	git
		.clone(DS_PACKAGE, dsRepoLocalPath)
		.catch(console.log);

} else {
	git.reset('hard').catch(console.log);
	git.pull().catch(console.log);
}

const
	// @ts-ignore
	{api, src} = config,
	app = module.exports = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
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
