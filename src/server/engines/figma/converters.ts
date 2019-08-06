/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import $C = require('collection.js');
import * as mixins from './mixins';

export const RAW: {
	styles: Dictionary;
	data: Record<string, unknown>;
} = {
	styles: {},
	data: {}
};

export const
	WARNINGS: ContentError[] = [];

const CONVERTERS = {
	bButton: {
		size: simpleSize,

		hover: buttonState,
		active: buttonState,
		disabled: buttonState,

		exterior(el: Figma.Node): Dictionary {
			const
				background = el.children.find((c) => c.name === 'background'),
				text = el.children.find((c) => c.name.toLowerCase() === 'text');

			let bg;

			if ($C(background).get('fills.0')) {
				bg = mixins.calcColor(background.fills[0]);

			} else if ($C(background).get('children.0.children.0.fills.0')) {
				bg = mixins.calcColor($C(background).get('children.0.children.0.fills.0'));
			}

			return {
				color: mixins.calcColor(text.fills[0]),
				backgroundColor: bg || 'none'
			};
		},
		preIcon: buttonWithIcon,
		postIcon: (el: Figma.Node) => buttonWithIcon(el, 'post')
	},

	bInput: {
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
				textColor = $C(value).get('fills.0'),
				baseBgColor = $C(base).get('children.0.fills.0'),
				baseBorderColor = $C(base).get('children.0.strokes.0');

			if (textColor) {
				textColor = mixins.calcColor(textColor);
			}

			if (baseBgColor) {
				baseBgColor = mixins.calcColor(baseBgColor);
			}

			if (baseBorderColor) {
				baseBorderColor = mixins.calcColor(baseBorderColor);
			}

			return {
				textColor,
				baseBgColor,
				baseBorderColor
			};
		},
		focus: () => ({foo: 1}),
		valid(el: Figma.Node): Dictionary {
			const result = {
				valid: {},
				invalid: {}
			};

			const
				callAdaptersForMod = (mod, m) => {
					const
						adapter = CONVERTERS.bInput[mod];

					if (Object.isFunction(adapter)) {
						return adapter(m);
					}
				};

			const
				state = {true: 'valid', false: 'invalid'};

			$C(el.children).forEach((valueGroup) => {
				// true false group if layers
				$C(valueGroup.children).forEach((layer) => {
					if (/m:\w+/.test(layer.name)) {
						const
							name = layer.name.replace('m:', '');

						return result[state[valueGroup.name]][name] = callAdaptersForMod(name, layer);
					}
				});
			});

			return result;
		}
	}
} as Record<string, Record<string, Function>>;

export default CONVERTERS;

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
		iconSize: i.width,
		offset: Math.abs(i.x - b.x),

		baseBgColor: mixins.calcColor(fill),
		baseStrokeWeight: strokeWeight,
		baseStrokeColor: mixins.calcColor(stroke)
	};
}

function simpleSize(el: Figma.Node): Dictionary {
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
		horOffset: Math.abs(b.y - t.y),
		vertOffset: Math.abs(b.x - t.x),
		textHeight: t.height,
		height: b.height,
		textStyle
	};
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
		iconSize: i.width,
		offset: Math.abs(i.x - t.x) - (pos === 'post' ? t.width : i.width)
	};
}

function buttonState(el: Figma.Node): Dictionary {
	const
		layer = el.children[0];

	return {
		blendMode: layer.blendMode,
		opacity: $C(layer).get('fills.0.opacity'),
		backgroundColor: mixins.calcColor(layer.fills[0])
	};
}
