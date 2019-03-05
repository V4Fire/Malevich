'use strict';

/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import * as express from 'express';

const
	{api, src} = require('config'),
	querystring = require('querystring'),
	https = require('https'),
	path = require('path');

const
	index = module.exports = express();

index.use('/dist/client', express.static(src.clientOutput()));
index.use('/assets', express.static(src.assets()));

index.get('/api/figma', (req, res) => {
	const
		{FIGMA_CLIENT_ID, FIGMA_CLIENT_SECRET, FIGMA_REDIRECT_URI} = process.env,
		{query} = req;

	if (query && query.code && query.state) {
		const postData = querystring.stringify({
			client_id: FIGMA_CLIENT_ID,
			client_secret: FIGMA_CLIENT_SECRET,
			redirect_uri: FIGMA_REDIRECT_URI,
			code: query.code,
			grant_type: 'authorization_code'
		});

		const req = https.request({
				method: 'POST',
				protocol: 'https:',
				host: 'www.figma.com',
				path: '/api/oauth/token'
			},
			(res) => {
				res.setEncoding('utf8');
				res.on('data', (res) => {
					// save access_token, refresh_token, expires_in from res
				});
			});

		req.on('error', (e) => {
			console.error(`problem with request: ${e.message}`);
		});

		req.write(postData);
		req.end();
	}

	res.redirect('/');
});

[
	['/**', 'p-root']

].forEach(([route, file]) => {
	file += '.html';
	index.get(route, (req, res) => res.sendFile(path.join(src.clientOutput(), file)));
});

index.listen(api.port);
console.log('App launched');
console.log(`http://localhost:${api.port}`);
