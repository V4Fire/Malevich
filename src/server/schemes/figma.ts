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
			textDecoration: true,
			lineHeightPx: true,
			textCase: f(textTransform)
		},

		fills: f(fillsToColor)
	},

	radius: f(storeBorderRadius),

	// For group with "@Colors" name.
	// forEach by children and use :calcColor for it's child's "fills" color
	color: f(storeColor)
};

/**
 * Scheme methods factory
 *
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
 * @param fills
 */
function fillsToColor<T extends Figma.NodeType>(
	this: Data<T>,
	fills: Figma.Paint[]
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
	name: string,
	{color}: {color: Figma.Color}
): void {
	const
		[hue, num] = name.split('/');

	if (!this.ds || !this.ds.colors) {
		return;
	}

	const
		{colors} = this.ds;

	if (!colors[hue]) {
		colors[hue] = [];

	} else {
		colors[hue][num] = calcColor.call(this, {color});
	}
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
 * Stores border radius from api rectangle
 * @param rect
 */
function storeBorderRadius<T extends Figma.NodeType>(
	this: Data<T>,
	rect: Figma.RECTANGLE
): void {
	if (rect.cornerRadius) {
		if (this.ds.borderRadius) {
			this.ds.borderRadius[parent.name.split('/')[1]] = rect.cornerRadius;
		}

	} else {
		const
			value = parent.name.split('/');

		if (!value[2]) {
			throw new Error('Error at instance naming');
		}

		if (this.ds.borderRadius) {
			this.ds.borderRadius[`${value.slice(0).join('/')}`] = new Array(4).fill(this.ds.borderRadius[value[1]]);
		}
	}
}
