/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import blend from '../../helpers/blend-modes';
import { simpleSize, convertMod } from './helpers';
import { WARNINGS, IGNORE_BLEND } from './const';
import * as mixins from '../mixins';

import $C = require('collection.js');

function buttonState(el: Figma.Node, parent: Figma.Node): Dictionary {
	const
		childLayer = el.children[0],
		mode = childLayer.blendMode.camelize(false),
		childFill = $C(childLayer).get('fills.0');

	const
		parentLayer = $C(parent.children).one.get((c) => c.name === 'background'),
		parentFill = $C(parentLayer).get('children.0.children.0.fills.0');

	let
		childColor;

	if (childFill) {
		childColor = childFill.color;
		childColor.a = Math.min(childFill.opacity || 1, childColor.a);
	}

	let
		parentColor;

	if (parentFill) {
		parentColor = parentFill.color;
		parentColor.a = Math.min(parentFill.opacity || 1, parentColor.a);
	}

	const
		result: Dictionary = {};

	if (!parentColor) {
		parentColor = {
			r: 0,
			g: 0,
			b: 0,
			a: 0
		};
	}

	result.backgroundColor = !IGNORE_BLEND.has[mode] ? blend(childColor, parentColor, mode) : mixins.calcColor(childColor);
	return {true: result};
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
		true: {
			iconSize: i.width.px,
			offset: (Math.abs(i.x - t.x) - (pos === 'post' ? t.width : i.width)).px
		}
	};
}

export default {
	size: simpleSize,

	hover: buttonState,
	focused: buttonState,
	active: buttonState,
	disabled: buttonState,

	exterior(el: Figma.Node): Dictionary {
		const
			result: Dictionary = {
				mods: {}
			};

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

				(<Dictionary>result.mods)[name] = convertMod(name, c, 'bButton', el);
				return;
			}
		});

		return result;
	},

	preIcon: buttonWithIcon,
	postIcon: (el: Figma.Node) => buttonWithIcon(el, 'post')
};
