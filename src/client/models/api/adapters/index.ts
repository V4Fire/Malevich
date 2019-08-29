/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import API, { provider } from 'models/api';

@provider('convert')
export default class Adapters extends API {
	/** @override */
	baseURL: string = '/:service/files/:file';

	/** @override */
	static request: typeof API.request = API.request({
		cacheTTL: (2).seconds()
	});
}
