/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

/// <reference types="@v4fire/client"/>
/// <reference types="@types/node"/>
/// <reference types="@types/express"/>
/// <reference types="./figma"/>

interface DesignSystem extends Dictionary {
	colors?: {
		[key: string]: string | string[];
	},

	rounding?: {
		[key: string]: string;
	},

	text?: Dictionary<string>;
	components?: Record<string, Dictonary<string>>;
}

interface ContentError {
	name: string;
	description?: string;
}

interface ErrorResponse {
	err: ContentError[];
}
