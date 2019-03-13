/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import 'models/api/figma/rights';

import iDynamicPage, { component, TitleValue } from 'super/i-dynamic-page/i-dynamic-page';
export * from 'super/i-dynamic-page/i-dynamic-page';

@component()
export default class pIndex extends iDynamicPage {
	/** @override */
	readonly pageTitleProp: TitleValue = 'Malevich';

	/**
	 * Handler: on figma import approve rights click
	 */
	protected onFigmaImportClick(): void {
		this.router.replace('/api/figma/rights');
		location.reload();
	}
}
