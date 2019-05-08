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
			url: 'files/:file',
			method: 'get',
			fn: getFiles
		},

		{
			url: 'rights',
			method: 'get',
			fn: approveRights
		}
	]

} as ControllersKit;

function approveRights(req: Dictionary, res: e.Response): void {
	const
		code = (<Dictionary<string>>req.session).id,
		query = querystring.stringify({
			client_id: FIGMA_CLIENT_ID,
			redirect_uri: FIGMA_REDIRECT_URI,
			scope: 'file_read',
			response_type: 'code',
			state: code
		});

	res.redirect(`https://www.figma.com/oauth?${query}`);
}

async function authorize(req: Dictionary, res: e.Response): Promise<void> {
	const
		query = <Dictionary>req.query;

	if (query && query.code && query.state) {
		await new Promise((resolve, reject) => {
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
				(r) => {
					r.setEncoding('utf8');
					r.on('data', (rr) => {
						try {
							if (rr) {
								rr = JSON.parse(rr);

								(<Dictionary>req.session).figma = {
									accessToken: rr.access_token,
									expiresIn: rr.expires_in,
									refreshToken: rr.refresh_token
								};
							}

						} catch (e) {
							reject(e);
						}

						resolve();
					});
				});

			request.on('error', (e) => {
				console.error(`problem with request: ${e.message}`);
				reject(e.message);
			});

			request.write(postData);
			request.end();
		});
	}

	res.redirect('/?stage=figmaImport');
}

async function getFiles(req: Dictionary, res: e.Response): Promise<void> {
	if (req.session && (<Dictionary>req.session).figma && (<Dictionary>(<Dictionary>req.session).figma).accessToken) {
		let str = '';

		await new Promise((resolve, reject) => {
			const
				token = <string>(<Dictionary>(<Dictionary>req.session).figma).accessToken,
				file = (<Dictionary>req.params).file;

			https.request({
				method: 'GET',
				host: 'api.figma.com',
				path: `/v1/files/${file}`,
				headers: {
					Authorization: `Bearer ${token}`
				}
			},
			(res) => {
				res.setEncoding('utf8');
				res.on('data', (r) => {
					str += r;
				});

				res.on('end', resolve);
			}).on('error', reject).end();
		});

		console.log(str);

		res.send(str);
	}

	res.send();
}
