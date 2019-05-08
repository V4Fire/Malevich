/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import API, { provider, DecodersTable } from 'models/api';
import * as _ from 'models/api/figma/meta';

export {
	_ as types
};

@provider('API')
export default class FigmaFiles extends API {
	/** @override */
	baseURL: string = '/figma/files/:id';

	/** @override */
	static request: typeof API.request = API.request({
		cacheTTL: (2).seconds()
	});
}
