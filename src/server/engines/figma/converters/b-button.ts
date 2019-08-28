/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import blend from '../../helpers/blend-modes';
import { simpleSize, convertMod } from './helpers';
import { WARNINGS } from './const';
import * as mixins from '../mixins';

import $C = require('collection.js');

function buttonState(el: Figma.Node, parent: Figma.Node): Dictionary {
	const
		layer = el.children[0],
		ignoreBlend = {PASS_THROUGH: true},
		opacity = $C(layer).get('fills.0.opacity');

	const
		result: Dictionary = {};

	if (opacity) {
		result.opacity = opacity.round(2);
	}

	const
		background = $C(parent.children).one.get((c) => c.name === 'background'),
		blendMode = layer.blendMode.camelize(false),
		layerFill = layer.fills[0],
		top = layerFill.color;

	let bottom;

	if (background && layerFill) {
		const
			fill = $C(background).get('children.0.children.0.fills.0');

		const
			{color, opacity} = fill || layerFill;

		if (opacity && color.a && opacity !== color.a) {
			color.a = Math.min(opacity, color.a);
		}

		if (layerFill.opacity && top.a && layerFill.opacity !== top.a) {
			top.a = Math.min(layerFill.opacity, top.a);
		}

		bottom = color;
	}

	result.backgroundColor = !ignoreBlend[layer.blendMode] ?
		blend(top, bottom, blendMode) :
		top;

	return result;
}

function buttonWithIcon(el: Figma.Node, pos: 'pre' | 'post' = 'pre'): Dictionary {
	const
		icon = $C(el.children).one.get((c) => c.name === 'icon'),
		text = $C(el.children).one.get((c) => c.name === 'text');

	if (!icon || !text) {
		WARNINGS.push({
			name: `No text or icon for ${el.name}`
		});
	}

	const
		{absoluteBoundingBox: i} = icon,
		{absoluteBoundingBox: t} = text;

	return {
		iconSize: i.width.px,
		offset: (Math.abs(i.x - t.x) - (pos === 'post' ? t.width : i.width)).px
	};
}

export default {
	size: simpleSize,

	hover: buttonState,
	focus: buttonState,
	active: buttonState,
	disabled: buttonState,

	exterior(el: Figma.Node): Dictionary {
		const
			result: Dictionary = {};

		$C(el.children).forEach((c) => {
			if (c.name === 'background') {
				if ($C(c).get('fills.0')) {
					result.backgroundColor = mixins.calcColor(c.fills[0]);

				} else if ($C(c).get('children.0.children.0.fills.0')) {
					result.backgroundColor = mixins.calcColor($C(c).get('children.0.children.0.fills.0'));
				}

				return;
			}

			if (c.name.toLowerCase() === 'text') {
				result.color = mixins.calcColor(c.fills[0]);
				return;
			}

			if (/m:\w+/.test(c.name)) {
				const
					name = c.name.replace('m:', '');

				result[name] = convertMod(name, c, 'bButton', el);
				return;
			}
		});

		return result;
	},

	preIcon: buttonWithIcon,
	postIcon: (el: Figma.Node) => buttonWithIcon(el, 'post')
};
