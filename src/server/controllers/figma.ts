/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import { Controller } from 'interfaces/controllers';
import * as e from 'express';

import querystring = require('querystring');
import https = require('https');

export default {
	url: 'api/figma',
	method: 'get',
	fn(req: e.Request, res: e.Response): void {
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

			const request = https.request({
					method: 'POST',
					protocol: 'https:',
					host: 'www.figma.com',
					path: '/api/oauth/token'
				},
				(res) => {
					res.setEncoding('utf8');
					res.on('data', (r) => {
						// save access_token, refresh_token, expires_in from res
					});
				});

			request.on('error', (e) => {
				console.error(`problem with request: ${e.message}`);
			});

			request.write(postData);
			request.end();
		}

		res.redirect('/');
	}
} as Controller;
