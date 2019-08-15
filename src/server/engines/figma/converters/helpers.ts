/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import { WARNINGS, ERRORS, RAW } from './const';
import * as mixins from '../mixins';

import path = require('upath');
import $C = require('collection.js');

/**
 * Returns sizes calculations for the specified el
 * @param el
 */
export function simpleSize(el: Figma.Node): Dictionary {
	const
		background = $C(el.children).one.get((c) => c.name === 'background'),
		text = $C(el.children).one.get((c) => c.name.toLowerCase() === 'text' || c.name.toLowerCase() === 'value');

	if (!background || !text) {
		WARNINGS.push({
			name: `No text or background for ${el.name}`
		});
	}

	const
		b = background.absoluteBoundingBox,
		t = text.absoluteBoundingBox,
		fontOptions = RAW.styles[text.styles.text];

	let textStyle;

	if (fontOptions) {
		textStyle = (<Figma.Style>fontOptions).name;
	}

	return {
		horOffset: Math.abs(b.y - t.y).px,
		vertOffset: Math.abs(b.x - t.x).px,
		textHeight: t.height.px,
		height: b.height.px,
		textStyle
	};
}

/**
 * Run adapter for the specified block mod
 *
 * @param mod
 * @param el
 * @param block
 */
export function convertMod(mod: string, el: Figma.Node, block: string): CanUndef<unknown> {
	const
		converters = require(path.resolve(__dirname, block.dasherize())).default,
		adapter = converters[mod];

	if (Object.isFunction(adapter)) {
		return adapter(el);
	}
}

/**
 * Returns options for bordered block state (hover, focus, valid, etc.)
 * @param el
 */
export function borderedBlockState(el: Figma.Node): CanUndef<Dictionary> {
	const
		ch = $C(el).get('children.0.children.0');

	if (!ch) {
		ERRORS.push({
			name: 'Wrong structure',
			description: `Group has no needed layer for calculating focus state for ${el.name}`
		});

		return;
	}

	const
		effect = $C(ch).get('effects.0'),
		offset = $C(effect).get('offset');

	let shadow;

	if (effect && offset) {
		const
			radius = Math.round($C(effect).get('radius') || 0);

		shadow = `${offset.x.px} ${offset.y.px} ${radius.px} ${mixins.calcColor(effect)}`;
	}

	return {
		boxShadow: shadow,
		border: `${ch.strokeWeight.px} solid ${mixins.calcColor(ch.strokes[0])}`
	};
}

/**
 * Returns options for valid states
 *
 * @param el
 * @param blockName
 * @param backLayer
 * @param infoLayer
 */
export function validState(
	el: Figma.Node,
	blockName: string,
	backLayer: string = 'background',
	infoLayer: string = 'info'
): Dictionary {
	const result = {
		true: {
			style: {}
		},
		false: {
			style: {}
		}
	};

	const
		state = {true: 'true', false: 'false'};

	$C(el.children).forEach((valueGroup) => {
		// 'true' 'false' groups
		const
			store = result[state[valueGroup.name]],
			full = valueGroup.absoluteBoundingBox,
			back = $C(valueGroup.children).one.get(({name}) => name === backLayer);

		if (!back) {
			ERRORS.push({
				name: 'No background layer',
				description: `${el.name} has no background layer for state '${valueGroup.name}'`
			});

			return;
		}

		const
			b = back.absoluteBoundingBox;

		if (back.children[0]) {
			const
				ch = back.children[0];

			Object.assign(store.style, {
				border: `${ch.strokeWeight.px} solid ${mixins.calcColor(ch.strokes[0])}`
			});
		}

		$C(valueGroup.children).forEach((layer) => {
			const
				l = layer.absoluteBoundingBox,
				backBox = back.absoluteBoundingBox;

			if (/m:\w+/.test(layer.name)) {
				const
					name = layer.name.replace('m:', '');

				store[name] = convertMod(name, layer, blockName);
				return;
			}

			// validation icon
			if (layer.type === 'VECTOR') {
				store.icon = {
					name: layer.name,
					width: l.width.px,
					height: l.height.px,
					color: mixins.calcColor(layer.fills[0]),
					offset: {
						top: (l.y - full.y).px,
						right: ((backBox.x + backBox.width) - (l.x + l.width)).px
					}
				};

				return;
			}

			if (layer.name === infoLayer) {
				const
					fontOptions = RAW.styles[layer.styles.text];

				store.info = {
					textStyle: fontOptions && (<Figma.Style>fontOptions).name,
					color: mixins.calcColor(layer.fills[0]),
					offset: {
						top: (l.y - (b.y + b.height)).px,
						left: (l.x - b.x).px
					}
				};

				return;
			}
		});
	});

	return result;
}
