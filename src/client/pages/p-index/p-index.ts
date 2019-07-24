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
export default class pIndex<D extends object = Dictionary> extends iDynamicPage<D> {
	/** @override */
	readonly pageTitleProp: TitleValue = 'Malevich';

	/**
	 * Handler: on figma import approve rights click
	 */
	protected onFigmaImportClick(): Promise<void> {
		return this.router.replace('/ext/figma/rights');
	}
}
