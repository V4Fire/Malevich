/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import { ControllersKit } from 'interfaces/controllers';
import * as e from 'express';

import querystring = require('querystring');
import https = require('https');

const
	{FIGMA_CLIENT_ID, FIGMA_CLIENT_SECRET, FIGMA_REDIRECT_URI} = process.env;

export default {
	namespace: 'api/figma',
	routes: [
		{
			url: 'authorize',
			method: 'get',
			fn: authorize
		},

		{
			url: 'rights',
			method: 'get',
			fn: approveRights
		}
	]

} as ControllersKit;

function approveRights(req: e.Request, res: e.Response): void {
	const
		// @ts-ignore
		code = req.session.id,
		query = querystring.stringify({
			client_id: FIGMA_CLIENT_ID,
			redirect_uri: FIGMA_REDIRECT_URI,
			scope: 'file_read',
			response_type: 'code',
			state: code
		});

	res.redirect(`https://www.figma.com/oauth?${query}`);
}

function authorize(req: e.Request, res: e.Response): void {
	const
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
