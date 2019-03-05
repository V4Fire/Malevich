/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import iDynamicPage, { component, TitleValue } from 'super/i-dynamic-page/i-dynamic-page';
export * from 'super/i-dynamic-page/i-dynamic-page';

@component()
export default class pIndex extends iDynamicPage {
	/** @override */
	readonly pageTitleProp: TitleValue = 'Malevich';
}
