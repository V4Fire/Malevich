/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import iStaticPage, { component, computed, system } from 'super/i-static-page/i-static-page';
export * from 'super/i-static-page/i-static-page';

@component({root: true})
export default class pRoot extends iStaticPage {
	/**
	 * Design system object if present
	 */
	@system()
	protected DS?: DesignSystem = DS;

	/**
	 * Project design system
	 */
	@computed({cache: true, dependencies: ['DS']})
	get designSystem(): CanUndef<DesignSystem> {
		return this.DS;
	}
}
