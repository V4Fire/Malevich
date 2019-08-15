/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import { simpleSize, borderedBlockState, validState } from './helpers';
import { WARNINGS, RAW } from './const';
import * as mixins from '../mixins';

import $C = require('collection.js');

function inputWithIcon(el: Figma.Node): Dictionary {
	const
		icon = $C(el.children).one.get((c) => c.name === 'icon'),
		iconBackground = $C(el.children).one.get((c) => c.name === 'iconBackground');

	if (!iconBackground || !icon) {
		WARNINGS.push({
			name: `No icon or background for ${el.name}`
		});
	}

	const
		{absoluteBoundingBox: i} = icon,
		{absoluteBoundingBox: b} = iconBackground;

	const
		bgLayer = $C(iconBackground).get('children.0'),
		fill = $C(bgLayer).get('fills.0'),
		stroke = $C(bgLayer).get('strokes.0'),
		strokeWeight = $C(bgLayer).get('strokeWeight');

	return {
		iconSize: i.width.px,
		offset: Math.abs(i.x - b.x).px,

		base: {
			backgroundColor: mixins.calcColor(fill),
			border: `${strokeWeight.px} solid ${mixins.calcColor(stroke)}`
		}
	};
}

export default {
	selfLayer(els: Figma.Node[]): Dictionary | void {
		const
			res = {};

		$C(els).forEach((el) => {
			if (el.name === 'background') {
				const
					layer = $C(el).get('children.0');

				if (layer) {
					const
						borderColor = $C(layer).get('strokes.0'),
						backgroundFill = $C(layer).get('fills.0');

					Object.assign(res, {
						border: `${layer.strokeWeight.px} solid ${mixins.calcColor(borderColor)}`,
						backgroundColor: mixins.calcColor(backgroundFill)
					});
				}

				return res;
			}
		});

		return res;
	},
	size(el: Figma.Node): Dictionary {
		const
			placeholder = $C(el.children).one.get((c) => c.name === 'placeholder'),
			pFill = $C(placeholder).get('fills.0');

		return {
			placeholderColor: pFill && mixins.calcColor(pFill),
			placeholderStyle: placeholder && $C(RAW.styles).get(`${placeholder.styles.text}.name`),
			...simpleSize(el)
		};
	},

	preIcon: inputWithIcon,
	postIcon: inputWithIcon,

	readonly(el: Figma.Node): Dictionary {
		const
			value = $C(el.children).one.get((c) => c.name === 'value'),
			base = $C(el.children).one.get((c) => c.name === 'background');

		if (!value || !base) {
			WARNINGS.push({
				name: `No background or value for ${el.name}`
			});
		}

		let
			color = $C(value).get('fills.0'),
			backgroundColor = $C(base).get('children.0.fills.0'),
			borderColor = $C(base).get('children.0.strokes.0');

		if (color) {
			color = mixins.calcColor(color);
		}

		if (backgroundColor) {
			backgroundColor = mixins.calcColor(backgroundColor);
		}

		if (borderColor) {
			borderColor = mixins.calcColor(borderColor);
		}

		return {
			color,
			backgroundColor,
			borderColor
		};
	},

	focus: borderedBlockState,
	valid: (el: Figma.Node) => validState(el, 'bInput')
};
