/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import iDynamicPage, { component, system } from 'super/i-dynamic-page/i-dynamic-page';
export * from 'super/i-dynamic-page/i-dynamic-page';

@component()
export default class pDemo extends iDynamicPage {
	@system()
	data?: DesignSystem = DS;
}
