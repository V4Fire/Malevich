/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import blend from 'engines/helpers/blend-modes';
import { simpleSize, convertMod } from 'engines/figma/converters/helpers';
import { WARNINGS, IGNORE_BLEND } from 'engines/figma/converters/const';
import * as mixins from 'engines/figma/mixins';

import $C = require('collection.js');

function buttonState(el: Figma.Node, parent: Figma.Node): Dictionary {
	const
		childLayer = $C(el.children).one.get((c) => c.name === 'background'),
		mode = childLayer.blendMode.camelize(false),
		childFill = $C(childLayer).get('fills.0');

	const
		parentLayer = $C(parent.children).one.get((c) => c.name === 'background'),
		parentFill = $C(parentLayer).get('fills.0');

	let
		childColor;

	if (childFill) {
		childColor = childFill.color;
		childColor.a = Math.min(childFill.opacity || childLayer.opacity || 1, childColor.a);
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

	if ($C(childLayer).get('strokes.0')) {
		const
			chBorderColor = $C(childLayer).get('strokes.0.color'),
			parBorderColor = $C(parentLayer).get('strokes.0.color');

		chBorderColor.a = Math.min(childLayer.opacity || 1, chBorderColor.a);

		const borderColor = !IGNORE_BLEND.has(childLayer.blendMode) ?
			blend(chBorderColor, parBorderColor, mode) :
			mixins.calcColor({color: chBorderColor});

		result.border = `${childLayer.strokeWeight.px} solid ${borderColor}`;
	}

	result.backgroundColor = !IGNORE_BLEND.has(childLayer.blendMode) ?
		blend(childColor, parentColor, mode) :
		mixins.calcColor({color: childColor});

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

	exterior(name: string, el: Figma.Node): Dictionary {
		const
			result: Record<string, Dictionary> = {
				mods: {},
				base: {}
			};

		$C(el.children).forEach((c) => {
			if (c.name === 'background') {
				if ($C(c).get('fills.0')) {
					result.base.backgroundColor = mixins.calcColor(c.fills[0]);

				} else if ($C(c).get('children.0.children.0.fills.0')) {
					result.base.backgroundColor = mixins.calcColor($C(c).get('children.0.children.0.fills.0'));
				}

				if ($C(c).get('strokes.0')) {
					result.base.border = `${c.strokeWeight.px} solid ${mixins.calcColor(c.strokes[0])}`;
				}

				return;
			}

			if (c.name.toLowerCase() === 'text') {
				result.base.color = mixins.calcColor(c.fills[0]);
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
