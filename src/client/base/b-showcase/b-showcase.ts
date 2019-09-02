/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import iBlock, { component, system, prop, watch } from 'super/i-block/i-block';

export * from 'super/i-dynamic-page/i-dynamic-page';

const BLACK_LIST = [
	'b-v4-component-demo', 'b-form', 'b-showcase', 'b-dynamic-page', 'b-skeleton', 'b-progress-icon',
	'b-header', 'b-remote-provider', 'b-window-form', 'b-option', 'b-router', 'b-input-hidden',
	'b-input-birthday', 'b-input-number', 'b-input-time', 'b-notifier', 'b-up',  'b-component-renderer', 'b-progress'
];

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
	 * Available blocks
	 */
	@system()
	protected blockNames: string[] = BLOCK_NAMES || [];

	/**
	 * Additional attributes for components
	 */
	@system()
	protected blockAttrs: Dictionary = {
		'b-button': {
			exterior: 'primary'
		},

		'b-input': {
			info: 'Some info text',
			error: 'Some error text',
			mods: {showInfo: false, showError: false},
			placeholder: 'Input text here...'
		}
	};

	/**
	 * Components black list for hiding
	 */
	@system()
	protected blackList: Set<string> = new Set(BLACK_LIST);

	/**
	 * Data for showing
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

	/**
	 * Writes values into css variables
	 *
	 * @param data
	 * @param [path]
	 */
	protected setVariables(data: unknown, path?: string): void {
		Object.forEach(<Dictionary>data, (el, key) => {
			if (Object.isObject(el)) {
				return this.setVariables(el, `${path ? `${path}.${key}` : key}`);
			}

			if (path) {
				document.documentElement.style.setProperty(`--${path.split('.').join('-')}-${key}`, <string>el);
			}
		});
	}

	/**
	 * Runs css variable setter
	 */
	@watch({field: 'diff', immediate: true})
	protected initializeDiff(): void {
		this.setVariables(this.data);
	}
}
