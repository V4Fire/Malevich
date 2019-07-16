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
/// <reference types="figma"/>

interface DesignSystem extends Dictionary {
	colors?: {
		[key: string]: string[];
	},

	borderRadius?: {
		[key: string]: number | number[];
	},

	components: Dictionary<string>;
	blocks: Dictionary<string>;
}
