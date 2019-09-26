/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import converters, { WARNINGS } from './converters';
import { textNameNormalizer } from './converters/helpers';

import $C = require('collection.js');
import path = require('upath');

import * as mixins from './mixins';
import * as h from './helpers';

export const DS: DesignSystem = {};

export const DIFFS = {};

export default {
	text: {
		style: {
			// Store field "as is"
			fontFamily: true,
			fontWeight: true,

			italic: ({italic}) => italic ? {fontStyle: 'italic'} : undefined,

			fontSize: ({fontSize}) => fontSize.px,
			letterSpacing: ({letterSpacing}) => letterSpacing.px,

			textDecoration: mixins.textDecoration,
			lineHeightPx: mixins.lineHeight,
			textCase: mixins.textTransform
		}
	},

	radius: storeBorderRadius,
	color: storeColor
};

/**
 * Writes component to Design System
 *
 * @param name
 * @param el
 */
export function storeComponent(name: string, el: Figma.Node): void {
	const
		[prefix, ...componentArgs] = el.name.split('/');

	if (!DS.components) {
		DS.components = {};
	}

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
 * Stores text styles to the Design System by the specified name
 *
 * @param name
 * @param style
 */
export function storeTextStyle(name: string, style: Dictionary): void {
	const
		styleName = textNameNormalizer(name);

	if (!DS.text) {
		DS.text = {};
	}

	h.set(styleName, style, DS.text);
	setDiff(`text.${styleName}`, style);
}

/**
 * Stores color to kit with a key that specified at the name
 *
 * @param color
 * @param layer
 */
function storeColor({color}: {color: Figma.Color}, layer: Figma.Node): string {
	if (!DS.colors) {
		DS.colors = {};
	}

	const
		[hue, num] = layer.name.split('/');

	const
		{colors} = DS,
		value = mixins.calcColor({color});

	if (hue && num) {
		if (!colors[hue]) {
			colors[hue] = [];
		}

		(<string[]>colors[hue])[num - 1] = value;
		setDiff(`colors.${hue}.${num - 1}`, value);

	} else {
		colors[layer.name] = value;
		setDiff(`colors.${layer.name}`, value);
	}

	return value;
}

/**
 * Stores border radius from api rectangle
 * @param layer
 */
function storeBorderRadius(layer: Figma.Node): CanUndef<string> {
	if (Object.isNumber(layer.cornerRadius)) {
		if (!DS.rounding) {
			DS.rounding = {};
		}

		const
			value = <string>layer.cornerRadius.px;

		DS.rounding[layer.name] = value;
		setDiff(`rounding.${layer.name}`, value);

		return value;
	}
}
