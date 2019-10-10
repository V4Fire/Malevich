/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import $C = require('collection.js');
import { WARNINGS } from './const';

export default {
	size(el: Figma.Node): CanUndef<Dictionary> {
		const
			icon = $C(el.children).one.get((c) => c.name === 'icon');

		if (icon && icon.absoluteBoundingBox) {
			const
				{width, height} = icon.absoluteBoundingBox;

			return {width: width.px, height: height.px};
		}

		WARNINGS.push({
			name: `No icon layer for bIconButton component with ${el.name}`
		});
	}
};
