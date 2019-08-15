/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import iDynamicPage, { component, system } from 'super/i-dynamic-page/i-dynamic-page';
import DS = require('@v4fire/design-system');

export * from 'super/i-dynamic-page/i-dynamic-page';

@component()
export default class pDemo extends iDynamicPage {
	/**
	 * Rounding dictionary from Design System
	 */
	@system()
	rounding: Dictionary = DS.rounding;

	/**
	 * Colors kits from Design System
	 */
	@system()
	colors: Dictionary = DS.colors;

	/**
	 * All text styles from Design System
	 */
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
