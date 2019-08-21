/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import API, { provider } from 'models/api';
import * as _ from 'models/api/figma/meta';

export {
	_ as types
};

@provider('adapter')
export default class FigmaRights extends API {
	/** @override */
	baseURL: string = '/figma/rights/:key';

	/** @override */
	static request: typeof API.request = API.request({
		cacheTTL: (2).seconds()
	});
}
