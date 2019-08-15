/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

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
