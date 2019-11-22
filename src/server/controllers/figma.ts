/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import { ControllersKit } from 'interfaces/controllers';
import { get } from 'controllers/git';

import * as ExpressTypes from 'express';

import querystring = require('querystring');
import request = require('request-promise-native');

import $C = require('collection.js');

import create from 'engines/figma';
import { getFile } from 'engines/figma/endpoints';

const {

	FIGMA_CLIENT_ID,
	FIGMA_CLIENT_SECRET,
	FIGMA_REDIRECT_URI

} = process.env;

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
			fn: files
		},

		{
			url: 'rights',
			method: 'get',
			fn: approveRights
		}
	]
} as ControllersKit;

function approveRights(req: Dictionary, res: ExpressTypes.Response): void {
	const
		session = (<Dictionary<string>>req.session),
		code = session.id,
		query = querystring.stringify({
			client_id: FIGMA_CLIENT_ID,
			redirect_uri: FIGMA_REDIRECT_URI,
			scope: 'file_read',
			response_type: 'code',
			state: code
		});

	res.redirect(`https://www.figma.com/oauth?${query}`);
}

async function authorize(req: Dictionary, res: ExpressTypes.Response): Promise<void> {
	const
		query = <Dictionary>req.query;

	if (query && query.code && query.state) {
		const body = {
			client_id: FIGMA_CLIENT_ID,
			client_secret: FIGMA_CLIENT_SECRET,
			redirect_uri: FIGMA_REDIRECT_URI,
			code: <string>query.code,
			grant_type: 'authorization_code'
		};

		const tokenRequest = await request.post({
			uri: 'https://www.figma.com/api/oauth/token',
			json: true,
			body
		});

		if (tokenRequest) {
			(<Dictionary>req.session).figma = {
				accessToken: tokenRequest.access_token,
				expiresIn: tokenRequest.expires_in,
				refreshToken: tokenRequest.refresh_token
			};
		}
	}

	res.redirect('/publish');
}

async function files(req: Dictionary, res: ExpressTypes.Response): Promise<void> {
	const
		fileName = <string>$C(req).get('params.file'),
		session = <Dictionary>req.session,
		token = <string>$C(session).get('figma.accessToken');

	if (token && fileName) {
		const
			data = await getFile(fileName, token);

		let
			response;

		if (data) {
			if ((<ErrorResponse>data).err) {
				response = (<ErrorResponse>data).err;

			} else {
				const
					result = await create(<Figma.File>data, {token, file: fileName});

				if (result) {
					response = {
						...result,
						meta: Object.select(<Figma.File>data, ['thumbnailUrl', 'lastModified', 'version'])
					};
				}
			}
		}

		(<Dictionary>session.figma).data = response;
		res.send(response);
		return;
	}

	res.send({
		err: [{
			name: 'Error while getting file by name from Figma',
			description: 'I can\'t find token or filename'
		}]
	});
}
