/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import $C = require('collection.js');
import converters, { WARNINGS } from './converters';
import * as mixins from './mixins';

type Declaration = Partial<CSSStyleDeclaration> | void;

export const DS: DesignSystem = {
	components: {},
	colors: {},
	text: {},
	rounding: {}
};

export default {
	text: {
		style: {
			fontFamily: true,
			fontWeight: true,
			fontSize: true,
			letterSpacing: true,
			textDecoration: mixins.textDecoration,
			lineHeightPx: mixins.lineHeight,
			textCase: mixins.textTransform
		},

		fills: fillsToColor
	},

	radius: storeBorderRadius,

	// For group with "@Colors" name.
	// forEach by children and use the calcColor mixin for it's child's "fills" color
	color: storeColor
};

/**
 * Writes component to Design System
 *
 * @param name
 * @param el
 */
export function writeComponent(name: string, el: Figma.Node): void {
	const
		[prefix, ...componentArgs] = el.name.split('/');

	if (!DS.components[name]) {
		DS.components[name] = {
			mods: {}
		};
	}

	const
		link = DS.components[name];

	if (prefix === 'Master') {
		// For blocks with Master component
		const
			modReg = /(\w+):(\w+)/;

		$C(el.children).forEach((c) => {
			const
				[prefix] = c.name.split('/');

			// Nested Master component
			if (prefix !== 'Master' && modReg.test(c.name)) {
				const
					[, , mod] = c.name.match(modReg),
					adapter = $C(converters).get(`${name}.${mod}`);

				if (mod && Object.isFunction(adapter)) {
					link.mods[mod] = adapter(c);
				}
			}
		});

		if (componentArgs && modReg.test(componentArgs[componentArgs.length - 1])) {
			const
				[, mod, value] = componentArgs[componentArgs.length - 1].match(modReg),
				adapter = $C(converters).get(`${name}.${mod}`);

			if (Object.isFunction(adapter)) {
				if (!link.mods[mod]) {
					link.mods[mod] = {};
				}

				let
					target = el;

				if (
					el.children.length === 1 &&
					el.children[0].name.includes(prefix)
				) {
					target = el.children[0];
				}

				link.mods[mod][value] = adapter(target);

			} else {
				WARNINGS.push({
					name: 'Adapter didn\'t created',
					description: `Please declare an adapter for component ${name}, ${prefix}, mod ${mod}`
				});
			}
		}

	} else if (prefix === name) {
		// For blocks with Exterior
		if (componentArgs.length === 1) {
			const
				adapter = $C(converters).get(`${name}.exterior`);

			if (Object.isFunction(adapter)) {
				if (!link.exterior) {
					link.exterior = {};
				}

				// Calculates exterior from nested Master component
				link.exterior[componentArgs[0].toLowerCase()] = adapter(el.children[0]);
			}
		}
	}
}

/**
 * Returns css notation of the specified fills value
 *
 * @param fills
 * @param styles
 * @param parent
 * @param [targetField]
 */
function fillsToColor<T extends Figma.NodeType>(
	{fills, styles}: {fills: Figma.Paint[]; styles: Figma.Styles},
	parent: Figma.Node,
	targetField: string = 'color'
): Declaration {
	return {[targetField]: mixins.calcColor(fills[0])};
}

/**
 * Stores color to kit with key specified at name
 *
 * @param name
 * @param parent
 */
function storeColor<T extends Figma.NodeType>(
	{color}: {color: Figma.Color},
	parent: Figma.Node
): string | void {
	const
		[, hue, num] = parent.name.split('/');

	if (!DS || !DS.colors) {
		return;
	}

	const
		{colors} = DS,
		value = mixins.calcColor({color});

	if (!colors[hue]) {
		colors[hue] = [value];

	} else {
		colors[hue][num - 1] = value;
	}

	return value;
}

/**
 * Stores border radius from api rectangle
 *
 * @param rect
 * @param parent
 */
function storeBorderRadius<T extends Figma.NodeType>(
	rect: Figma.RECTANGLE,
	parent: Figma.Node
): void {
	if (rect.cornerRadius && DS.rounding) {
		DS.rounding[parent.name.split('/')[1]] = rect.cornerRadius;
	}
}
