/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import 'models/api/figma/rights';
import 'models/api/figma/files';

import iDynamicPage, { component, TitleValue } from 'super/i-dynamic-page/i-dynamic-page';
import bButton from 'form/b-button/b-button';
import bInput from 'form/b-input/b-input';
export * from 'super/i-dynamic-page/i-dynamic-page';

@component()
export default class pIndex<D extends object = Dictionary> extends iDynamicPage<D> {
	/** @override */
	readonly pageTitleProp: TitleValue = 'Malevich';

	/** @override */
	protected readonly $refs!: {
		formSubmit: bButton;
	};

	/** @override */
	protected syncRouterState(data?: CanUndef<Dictionary>): Dictionary {
		if (data) {
			data = {
				stage: data.stage || this.stage
			};

		} else {
			data = {
				stage: this.stage
			};
		}

		return data;
	}

	/**
	 * Handler: on figma import approve rights click
	 */
	protected onFigmaImportClick(): Promise<void> {
		return this.router.replace('/ext/figma/rights');
	}

	/**
	 * Handler: form field validation end
	 *
	 * @param component
	 * @param result
	 */
	protected onValidationEnd(component: bInput, result: boolean): void {
		const
			{formSubmit} = this.$refs;

		if (formSubmit) {
			formSubmit.setMod('disabled', !result);
		}
	}
}
