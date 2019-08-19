/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import 'models/api/figma/rights';
import iDynamicPage, { component, TitleValue } from 'super/i-dynamic-page/i-dynamic-page';
import bButton from 'form/b-button/b-button';
import bForm from 'form/b-form/b-form';

export * from 'super/i-dynamic-page/i-dynamic-page';

@component()
export default class pIndex<D extends object = Dictionary> extends iDynamicPage<D> {
	/** @override */
	readonly pageTitleProp: TitleValue = 'Malevich';

	/** @override */
	protected readonly $refs!: {
		formSubmit: bButton;
	};

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
	 * Handler: on figma import approve rights click
	 *
	 * @param form
	 * @param body
	 */
	protected onFigmaImport(form: bForm, body: Dictionary): Promise<void> {
		return this.router.replace(`/ext/figma/rights/${body.id}`);
	}
}
