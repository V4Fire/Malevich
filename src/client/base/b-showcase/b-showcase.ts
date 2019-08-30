/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import iBlock, { component, system, prop } from 'super/i-block/i-block';
export * from 'super/i-dynamic-page/i-dynamic-page';

@component()
export default class bShowcase extends iBlock {
	@prop({type: Object, required: false})
	diff?: DesignSystem;

	@prop({type: Object, required: false})
	dataProp?: DesignSystem;

	/**
	 * Component value store
	 */
	@system({
		replace: false,
		init: (o) => o.sync.link()
	})

	protected dataStore!: DesignSystem;

	/**
	 * Data
	 */
	protected get data(): DesignSystem {
		return this.dataStore;
	}

	/**
	 * Rounding dictionary
	 */
	protected get rounding(): CanUndef<Dictionary> {
		return this.data.rounding;
	}

	/**
	 * Colors kits
	 */
	protected get colors(): Dictionary {
		return this.data.colors;
	}

	/**
	 * All text styles
	 */
	protected get textStyles(): Dictionary {
		return this.data.text;
	}

	/**
	 * Returns text classes
	 * with common text styles for the specified style name
	 *
	 * @param name
	 */
	protected createTextClasses(name: string): ReadonlyArray<string> {
		const
			commonClass = `text_style_${name}`,
			componentClasses = this.provide.elClasses({text: {style: name}});

		return Object.freeze([...componentClasses, commonClass]);
	}
}
