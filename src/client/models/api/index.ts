/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import Provider, { provider } from 'core/data';
export * from 'core/data';

@provider
export default class API extends Provider {
	/** @override */
	static request: typeof Provider.request = Provider.request({
		api: {namespace: 'api'},
		cacheStrategy: 'never',
		responseType: 'json'
	});
}
