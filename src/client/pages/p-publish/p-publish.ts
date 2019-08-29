/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import 'models/api/adapters';
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
	protected data?: Dictionary;

	/**
	 * Returns info value from the design system base file
	 * @param [field]
	 */
	protected fileInfo(field?: string): CanUndef<string> {
		return this.field.get(`data.meta${field ? `.${field}` : ''}`);
	}

	/**
	 * Handler: form field validation end
	 * @param result
	 */
	protected onValidationEnd(result: boolean): void {
		const
			{formSubmit} = this.$refs;

		console.log(3230);
		if (formSubmit) {
			console.log(result, 1111);
			formSubmit.setMod('disabled', !result);
		}
	}

	/**
	 * Handler: form load success
	 * @param res
	 */
	protected onPublishSuccess(res: Dictionary): void {
		this.field.set('data', res);
		this.stage = 'preview';
	}

	/**
	 * Handler: on reset changes button click
	 */
	protected async onResetChanges(): Promise<void> {
		await this.get({endpoint: 'reset'});
		this.stage = undefined;
	}
}
