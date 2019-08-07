/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

type Declaration = Partial<CSSStyleDeclaration> | void;

/**
 * Transforms figma color to CSS rgba notation
 *
 * @param r
 * @param g
 * @param b
 * @param a
 */
export function calcColor(
	{color: {r, g, b, a}}: {color: Figma.Color}
): string {
	return `rgba(${(r * 255).toFixed()}, ${(g * 255).toFixed()}, ${(b * 255).toFixed()}, ${a})`;
}

/**
 * Transforms line-height property
 * @param value
 */
export function lineHeight(
	value: Figma.TypeStyle
): Declaration {
	return {lineHeight: `${value.lineHeightPx}px`};
}

/**
 * Transforms text-decoration property
 * @param value
 */
export function textDecoration(
	value: Figma.TypeStyle
): Declaration {
	return {textDecoration: value.textDecoration.toLowerCase()};
}

/**
 * Transforms text-transform property
 * @param value
 */
export function textTransform(
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
