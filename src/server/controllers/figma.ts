/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import { ControllersKit } from '../interfaces/controllers';
import * as ExpressTypes from 'express';

import $C = require('collection.js');
import querystring = require('querystring');
import https = require('https');

import scheme from '../schemes/figma';

const
	{FIGMA_CLIENT_ID, FIGMA_CLIENT_SECRET, FIGMA_REDIRECT_URI} = process.env;

const
	ERRORS: ContentError[] = [];

const DS = {
	components: {

	},

	blocks: {

	}
};

export interface ContentError {
	name: string;
	description?: string;
}

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

function approveRights(req: Dictionary, res: ExpressTypes.Response): void {
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

async function authorize(req: Dictionary, res: ExpressTypes.Response): Promise<void> {
	const
		query = <Dictionary>req.query;

	if (query && query.code && query.state) {
		await new Promise((resolve, reject) => {
			const postData = querystring.stringify({
				client_id: FIGMA_CLIENT_ID,
				client_secret: FIGMA_CLIENT_SECRET,
				redirect_uri: FIGMA_REDIRECT_URI,
				code: <string>query.code,
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

async function getFiles(req: Dictionary, res: ExpressTypes.Response): Promise<void> {
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

		try {
			parseFigmaFile(JSON.parse(str));

		} catch {
			ERRORS.push({name: 'File parsing error'});
		}

		res.send(JSON.parse(str));
	}

	res.send();
}

function parseFigmaFile(data: Figma.File): void {
	const
		pages = data.document.children;

	pages.sort((a, b) => a.name < b.name ? 1 : a.name > b.name ? -1 : 0);

	$C(pages).forEach((page) => {
		if (page.type === 'CANVAS') {
			findSubjects(page);
		}
	});
}

/**
 * Finds subjects in pages list
 * @param canvas
 */
function findSubjects(canvas: Figma.Node): void {
	const
		interfaceRegExp = /^i([A-Z].*)/;

	let
		match;

	$C(canvas.children).forEach((p) => {
		match = canvas.name.match(interfaceRegExp);

		if (match && match[1]) {
			parseNode(p, p.name, 'interface');
		}
	});
}

type PageType = 'interface' | 'block';

function parseNode(data: Figma.Node, name: string, t: PageType): void {
	$C(data.children).forEach((c) => {
		if (t === 'interface') {
			switch (c.type) {
				case 'COMPONENT':
				case 'INSTANCE':
				case 'GROUP':
					parseNode(c, name, t);
					break;

				case 'TEXT':
					console.log(c.id, c.name);
					DS.components[c.id] = {
						type: c.type
					};

					$C(scheme.text).forEach((value, key) => {
						if (c[key]) {
							if (Object.isObject(value)) {
								$C(value).forEach((v, k) => {
									if (Object.isFunction(v)) {
										Object.assign(DS.components[c.id], v(DS, data, c[key]));

									} else if (v) {
										DS.components[c.id][k] = c[key][k];
									}
								});

							} else if (Object.isFunction(value)) {
								// @ts-ignore
								Object.assign(DS.components[c.id], value(DS, data, c[key]));
							}
						}
					});

					break;

				default:
					ERRORS.push({
						name: 'Type is not registered',
						description: `${c.type} is not registered at design system loader`
					});

					return;
			}
		}

		// Search components and serve it
		if (c.type === 'COMPONENT') {
			switch (c.name) {
				case c.name.includes('Master'):
					// Determines master component
					break;

				case c.name.split(':').length > 1:
					// This is a mod
					break;

				default:
					// Add an error for showing at the interface
					ERRORS.push({
						name: 'Component name discrepancy',
						description: `${c.name} is not allowed name for a component`
					});
			}
		}
	});
}
