/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import $C = require('collection.js');
import * as mixins from './mixins';

export interface RawData {
	name: string;
	type: string;
	style?: Dictionary;
	value?: number | string;
}

export const RAW: {
	styles: Dictionary;
	data: Record<string, RawData>;
} = {
	styles: {},
	data: {}
};

export const
	ERRORS: ContentError[] = [],
	WARNINGS: ContentError[] = [];

const CONVERTERS = {
	bButton: {
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

					result[name] = convertMod(name, c, 'bButton');
					return;
				}
			});

			return result;
		},
		preIcon: buttonWithIcon,
		postIcon: (el: Figma.Node) => buttonWithIcon(el, 'post')
	},

	bInput: {
		selfLayer(el: Figma.Node): Dictionary | void {
			if (el.name === 'background') {
				const
					res = {},
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

		focus: (el: Figma.Node): CanUndef<Dictionary> => {
			const
				ch = $C(el).get('children.0.children.0');

			if (!ch) {
				ERRORS.push({
					name: 'Wrong structure',
					description: 'Group has no needed layer for calculating focus state'
				});

				return;
			}

			const
				effect = $C(ch).get('effects.0'),
				offset = $C(effect).get('offset');

			let shadow;

			if (effect && offset) {
				shadow = `${offset.x.px} ${offset.y.px} ${($C(effect).get('radius') || 0).px} ${mixins.calcColor(effect)}`;
			}

			return {
				boxShadow: shadow,
				border: `${ch.strokeWeight.px} solid ${mixins.calcColor(ch.strokes[0])}`
			};
		},

		valid(el: Figma.Node): Dictionary {
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
					back = $C(valueGroup.children).one.get(({name}) => name === 'background');

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
						l = layer.absoluteBoundingBox;

					if (/m:\w+/.test(layer.name)) {
						const
							name = layer.name.replace('m:', '');

						store[name] = convertMod(name, layer, 'bInput');
						return;
					}

					// validation icon
					if (layer.type === 'VECTOR') {
						store.icon = {
							name: layer.name,
							offset: {
								top: (l.y - full.y).px,
								right: ((full.x + full.width) - (l.x + l.width)).px
							},
							width: l.width.px,
							height: l.height.px,
							color: mixins.calcColor(layer.fills[0])
						};

						return;
					}

					if (layer.name === 'info') {
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
		iconSize: i.width.px,
		offset: Math.abs(i.x - b.x).px,

		base: {
			backgroundColor: mixins.calcColor(fill),
			border: `${strokeWeight.px} solid ${mixins.calcColor(stroke)}`
		}
	};
}

function convertMod(mod: string, el: Figma.Node, block: string): unknown {
	const
		adapter = CONVERTERS[block][mod];

	if (Object.isFunction(adapter)) {
		return adapter(el);
	}
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
		horOffset: Math.abs(b.y - t.y).px,
		vertOffset: Math.abs(b.x - t.x).px,
		textHeight: t.height.px,
		height: b.height.px,
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
		iconSize: i.width.px,
		offset: (Math.abs(i.x - t.x) - (pos === 'post' ? t.width : i.width)).px
	};
}

function buttonState(el: Figma.Node): Dictionary {
	const
		layer = el.children[0],
		ignoreBlend = {PASS_THROUGH: true};

	return {
		blendMode: !ignoreBlend[layer.blendMode] ? toDashCase(layer.blendMode) : undefined,
		opacity: $C(layer).get('fills.0.opacity'),
		backgroundColor: mixins.calcColor(layer.fills[0])
	};
}

function toDashCase(value: string): string {
	return value.toLowerCase().dasherize();
}
