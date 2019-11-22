/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import request = require('request-promise-native');

/**
 * Returns file data for the specified filename
 *
 * @param file
 * @param token
 */
export async function getFile(file: string, token: string): Promise<CanUndef<Figma.File | ErrorResponse>> {
	try {
		return await request({
			uri: `https://api.figma.com/v1/files/${file}`,
			json: true,
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
	} catch (e) {
		return {
			err: [{
				name: 'Cannot parse response from Figma API',
				description: `I can't parse JSON string for the file with id ${file}. Message: ${e.message}`
			}]
		};
	}
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
	try {
		return await request({
			uri: `https://api.figma.com/v1/images/${file}/?ids=${ids.join(',')}&format=${format}`,
			json: true,
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

	} catch (e) {
		return {
			err: [{
				name: 'Cannot parse response from Figma API',
				description: `I can't parse JSON string for the file with id ${file}. Message: ${e.message}`
			}]
		};
	}
}
