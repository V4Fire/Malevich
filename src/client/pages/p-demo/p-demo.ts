/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import iDynamicPage, { component } from 'super/i-dynamic-page/i-dynamic-page';
import DS = require('@v4fire/design-system');

export * from 'super/i-dynamic-page/i-dynamic-page';

@component()
export default class pDemo extends iDynamicPage {
	protected get textStyles(): Dictionary<string>[] {
		const
			text = DS.text;

		return Object.keys(text).reduce((res, key) => {
			const
				el = text[key];

			if (Object.isArray(el)) {
				for (let i = 0; i < el.length; i++) {
					if (el[i]) {
						res.push({
							...<Dictionary>el[i],
							id: `${key}${i}`
						});
					}
				}

			} else {
				res.push({
					...el,
					id: key
				});
			}

			return res;
		}, <Dictionary<string>[]>[]);
	}
}
