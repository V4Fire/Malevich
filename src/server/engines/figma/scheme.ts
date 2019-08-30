/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import $C = require('collection.js');
import converters, { WARNINGS } from './converters';
import path = require('upath');

import * as mixins from './mixins';
import * as h from './helpers';

export const DS: DesignSystem = {
	components: {},
	colors: {},
	text: {},
	rounding: {}
};

export const DIFFS = {};

export default {
	text: {
		style: {
			fontFamily: true,
			fontWeight: true,
			fontSize: ({fontSize}) => fontSize.px,
			letterSpacing: ({letterSpacing}) => letterSpacing.px,
			textDecoration: mixins.textDecoration,
			lineHeightPx: mixins.lineHeight,
			textCase: mixins.textTransform
		}
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
			selfLayers = <Figma.Node[]>[],
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
					link.mods[mod] = adapter(c, el);
					setDiff(`components.${name}.mods.${mod}`, link.mods[mod]);
				}

			} else if (prefix !== 'Master') {

				selfLayers.push(c);
			}
		});

		if (selfLayers.length) {
			const
				adapter = $C(converters).get(`${name}.selfLayer`);

			if (Object.isFunction(adapter)) {
				link.block = adapter(selfLayers, el);
				setDiff(`components.${name}.block`, link.block);
			}
		}

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

				link.mods[mod][value] = adapter(target, el);
				setDiff(`components.${name}.mods.${mod}.${value}`, link.mods[mod][value]);

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
				const
					component = el.children.length === 1 ? el.children[0] : el,
					calculated = adapter(component, el),
					value = componentArgs[0].toLowerCase();

				link.exterior[value] = calculated;
				setDiff(`components.${name}.exterior.${value}`, calculated);
			}
		}
	}
}

/**
 * Check diff changes and writes old value to storage
 *
 * @param pathToField
 * @param value
 */
export function setDiff(pathToField: string, value: unknown): void {
	const
		latestStableDS = require(path.resolve(process.cwd(), 'repository')),
		latest = $C(latestStableDS).get(pathToField);

	if (latest) {
		if (!Object.fastCompare(latest, value)) {
			h.set(pathToField, latest, DIFFS);
		}
	}
}

/**
 * Stores color to kit with a key that specified at the name
 *
 * @param color
 * @param parent
 */
function storeColor<T extends Figma.NodeType>(
	{color}: {color: Figma.Color},
	parent: Figma.Node
): string {
	const
		[, hue, num] = parent.name.split('/');

	const
		{colors} = DS,
		value = mixins.calcColor({color});

	if (!colors[hue]) {
		colors[hue] = [value];

	} else {
		colors[hue][num - 1] = value;
	}

	setDiff(`colors.${hue}.${num - 1}`, value);
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
	if (Object.isNumber(rect.cornerRadius) && DS.rounding) {
		const
			name = parent.name.split('/')[1],
			value = <string>rect.cornerRadius.px;

		DS.rounding[name] = value;
		setDiff(`rounding.${name}`, value);
	}
}
