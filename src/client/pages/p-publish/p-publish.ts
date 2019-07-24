/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import 'models/api/figma/files';
import 'models/api/git';

import iDynamicPage, { component, field, TitleValue } from 'super/i-dynamic-page/i-dynamic-page';
import bButton from 'form/b-button/b-button';

export * from 'super/i-dynamic-page/i-dynamic-page';

@component()
export default class pPublish<D extends object = Dictionary> extends iDynamicPage<D> {
	/** @override */
	readonly dataProvider: string = 'publish.Git';

	/** @override */
	readonly pageTitleProp: TitleValue = 'Malevich: Commit Changes';

	/** @override */
	protected readonly $refs!: {
		formSubmit: bButton;
	};

	/**
	 * Info about design system conversion result
	 */
	@field()
	protected dsInfo?: Dictionary;

	/**
	 * Returns info value from the design system base file
	 * @param [field]
	 */
	protected fileInfo(field?: string): CanUndef<string> {
		return this.field.get(`dsInfo.file${field ? `.${field}` : ''}`);
	}

	/**
	 * Handler: form field validation end
	 * @param result
	 */
	protected onValidationEnd(result: boolean): void {
		const
			{formSubmit} = this.$refs;

		if (formSubmit) {
			formSubmit.setMod('disabled', !result);
		}
	}

	/**
	 * Handler: form load success
	 * @param res
	 */
	protected onPublishSuccess(res: Dictionary): void {
		this.stage = 'commit';
		this.field.set('dsInfo', res);
	}
}
