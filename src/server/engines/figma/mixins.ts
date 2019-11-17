/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import { createRGBAString, convertFloatColor } from 'engines/helpers/blend-modes';
type Declaration = Partial<CSSStyleDeclaration> | void;

/**
 * Transforms color with optional opacity
 * to CSS rgba notation
 *
 * @param r
 * @param g
 * @param b
 * @param a
 * @param [opacity]
 */
export function calcColor(
	{color: {r, g, b, a}, opacity}: {color: Figma.Color; opacity?: number}
): string {
	if (a === 1 && opacity) {
		a = opacity;
	}

	const
		{r: red, g: green, b: blue, a: alpha} = convertFloatColor({r, g, b, a});

	return createRGBAString(red, green, blue, alpha);
}

/**
 * Transforms line-height property
 * @param value
 */
export function lineHeight(
	value: Figma.TypeStyle
): Declaration {
	return {lineHeight: value.lineHeightPx.round().px};
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
