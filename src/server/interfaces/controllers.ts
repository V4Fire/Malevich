/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

export interface Controller {
	url: string;
	method: 'get' | 'post' | 'put' | 'patch' | 'head' | 'delete';
	fn: Function;
}
