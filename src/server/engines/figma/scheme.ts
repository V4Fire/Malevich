/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

interface Data<T extends Figma.NodeType> {
	ds: DesignSystem;
	parent: Figma.Node;
	targetField?: string;
}

type Declaration = Partial<CSSStyleDeclaration> | void;

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

/**
 * Scheme methods factory
 * @param fn
 */
export function f(fn: Function): Function {
	return (
		ds: DesignSystem,
		parent: Figma.Node,
		value: Figma.NodeType | string | number,
		targetField?: string
	) => fn.call({ds, parent, targetField}, value);
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
	this: Data<T>,
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

	if (!this.ds || !this.ds.colors) {
		return;
	}

	const
		{colors} = this.ds,
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
	if (rect.cornerRadius && this.ds.rounding) {
		this.ds.rounding[this.parent.name.split('/')[1]] = rect.cornerRadius;
	}
}
