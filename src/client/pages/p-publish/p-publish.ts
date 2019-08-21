/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import 'models/api/git';
import iDynamicPage, { component, field, TitleValue } from 'super/i-dynamic-page/i-dynamic-page';

export * from 'super/i-dynamic-page/i-dynamic-page';

@component()
export default class pPublish<D extends object = Dictionary> extends iDynamicPage<D> {
	/** @override */
	readonly dataProvider: string = 'publish.Git';

	/** @override */
	readonly pageTitleProp: TitleValue = 'Malevich: Commit Changes';

	/**
	 * Info about design system conversion result
	 */
	@field()
	protected dsMeta?: Dictionary;

	/**
	 * Returns info value from the design system base file
	 * @param [field]
	 */
	protected fileInfo(field?: string): CanUndef<string> {
		return this.field.get(`dsMeta.file${field ? `.${field}` : ''}`);
	}

	/**
	 * Handler: form load success
	 * @param res
	 */
	protected onPublishSuccess(res: Dictionary): void {
		this.stage = 'commit';
		this.field.set('dsMeta', res);
	}
}
