/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import https = require('https');

/**
 * Returns file data for the specified filename
 *
 * @param file
 * @param token
 */
export async function getFile(file: string, token: string): Promise<CanUndef<Figma.File | ErrorResponse>> {
	let str = '';

	await new Promise((resolve, reject) => {
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

	let
		response;

	try {
		response = JSON.parse(str);

	} catch (e) {
		return {
			err: [{
				name: 'Cannot parse response from Figma API',
				description: `I can't parse JSON string for the file with id ${file}. Stacktrace: ${JSON.stringify(e)}`
			}]
		};
	}

	return response;
}

export type AssetFormat = 'jpg' | 'png' | 'svg' | 'pdf';
export interface ImagesResponse {
	err: null | ErrorResponse;
	images: Dictionary<string>;
}

/**
 * Tries to get assets ids list from the specified file
 *
 * @param ids
 * @param file
 * @param token
 * @param [format]
 */
export async function getImages(
	{file, ids}: {file: string; ids: string[]},
	token: string,
	format: AssetFormat = 'svg'
): Promise<CanUndef<ImagesResponse | ErrorResponse>> {
	let
		str = '',
		response;

	await new Promise((resolve, reject) => {
		https.request({
				method: 'GET',
				host: 'api.figma.com',
				path: `/v1/images/${file}/?ids=${ids.join(',')}&format=${format}`,
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
		response = JSON.parse(str);

	} catch (e) {
		return {
			err: [{
				name: 'Cannot parse response from Figma API',
				description: `I can't parse JSON string for the file with id ${file}. Stacktrace: ${JSON.stringify(e)}`
			}]
		};
	}

	return response;
}
