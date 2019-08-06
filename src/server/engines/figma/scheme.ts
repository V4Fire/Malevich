/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import $C = require('collection.js');

interface Data<T extends Figma.NodeType> {
	parent: Figma.Node;
	targetField?: string;
}

type Declaration = Partial<CSSStyleDeclaration> | void;

export const DS: DesignSystem = {
	components: {},
	colors: {},
	text: {},
	rounding: {}
};

export const RAW: {styles: Dictionary; data: Record<string, unknown>} = {
	styles: {},
	data: {}
};

const
	WARNINGS: ContentError[] = [];

export default {
	text: {
		style: {
			fontFamily: true,
			fontWeight: true,
			fontSize: true,
			letterSpacing: true,
			textDecoration: f(textDecoration),
			lineHeightPx: f(lineHeight),
			textCase: f(textTransform)
		},

		fills: f(fillsToColor)
	},

	state: {
		blendMode: true,

		fills: {
			opacity: true,
			color: f(calcColor)
		}
	},

	radius: f(storeBorderRadius),

	// For group with "@Colors" name.
	// forEach by children and use :calcColor for it's child's "fills" color
	color: f(storeColor)
};

const adapters: Record<string, Record<string, Function>> = {
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
				bg = calcColor(background.fills[0]);

			} else if ($C(background).get('children.0.children.0.fills.0')) {
				bg = calcColor($C(background).get('children.0.children.0.fills.0'));
			}

			return {
				color: calcColor(text.fills[0]),
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
				placeholderColor: pFill && calcColor(pFill),
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
				textColor = calcColor(textColor);
			}

			if (baseBgColor) {
				baseBgColor = calcColor(baseBgColor);
			}

			if (baseBorderColor) {
				baseBorderColor = calcColor(baseBorderColor);
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
						adapter = adapters.bInput[mod];

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
};

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

		baseBgColor: calcColor(fill),
		baseStrokeWeight: strokeWeight,
		baseStrokeColor: calcColor(stroke)
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
		backgroundColor: calcColor(layer.fills[0])
	};
}

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
					adapter = $C(adapters).get(`${name}.${mod}`);

				if (mod && Object.isFunction(adapter)) {
					link.mods[mod] = adapter(c);
				}
			}
		});

		if (componentArgs && modReg.test(componentArgs[componentArgs.length - 1])) {
			const
				[, mod, value] = componentArgs[componentArgs.length - 1].match(modReg),
				adapter = $C(adapters).get(`${name}.${mod}`);

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
				adapter = $C(adapters).get(`${name}.exterior`);

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
 * Scheme methods factory
 * @param fn
 */
export function f(fn: Function): Function {
	return (
		parent: Figma.Node,
		value: Figma.NodeType | string | number,
		targetField?: string
	) => fn.call({parent, targetField}, value);
}

/**
 * Transforms figma color to CSS rgba notation
 *
 * @param r
 * @param g
 * @param b
 * @param a
 */
function calcColor<T extends Figma.NodeType>(
	{color: {r, g, b, a}}: {color: Figma.Color}
): string {
	return `rgba(${(r * 255).toFixed()}, ${(g * 255).toFixed()}, ${(b * 255).toFixed()}, ${a})`;
}

/**
 * Returns css notation of the specified fills value
 *
 * @param fills
 * @param styles
 */
function fillsToColor<T extends Figma.NodeType>(
	this: Data<T>,
	{fills, styles}: {fills: Figma.Paint[]; styles: Figma.Styles}
): Declaration {
	return {[this.targetField || 'color']: calcColor.call(this, fills[0])};
}

/**
 * Stores color to kit with key specified at name
 *
 * @param name
 * @param color
 */
function storeColor<T extends Figma.NodeType>(
	this: Data<T>,
	{color}: {color: Figma.Color}
): string | void {
	const
		[, hue, num] = this.parent.name.split('/');

	if (!DS || !DS.colors) {
		return;
	}

	const
		{colors} = DS,
		value = calcColor.call(this, {color});

	if (!colors[hue]) {
		colors[hue] = [value];

	} else {
		colors[hue][num - 1] = value;
	}

	return value;
}

/**
 * Creates text-transform style
 * @param value
 */
function textTransform<T extends Figma.NodeType>(
	this: Data<T>,
	value: Figma.TypeStyle
): Declaration {
	if (!value.textCase) {
		return;
	}

	const types = {
		UPPER: 'uppercase',
		LOWER: 'lowercase'
	};

	return {textTransform: types[value.textCase] || null};
}

/**
 * Transforms text-decoration property
 * @param value
 */
function textDecoration<T extends Figma.NodeType>(
	this: Data<T>,
	value: Figma.TypeStyle
): Declaration {
	return {textDecoration: value.textDecoration.toLowerCase()};
}

/**
 * Transforms line-height property
 * @param value
 */
function lineHeight<T extends Figma.NodeType>(
	this: Data<T>,
	value: Figma.TypeStyle
): Declaration {
	return {lineHeight: `${value.lineHeightPx}px`};
}

/**
 * Stores border radius from api rectangle
 * @param rect
 */
function storeBorderRadius<T extends Figma.NodeType>(
	this: Data<T>,
	rect: Figma.RECTANGLE
): void {
	if (rect.cornerRadius && DS.rounding) {
		DS.rounding[this.parent.name.split('/')[1]] = rect.cornerRadius;
	}
}
