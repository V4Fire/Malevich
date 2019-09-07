/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import iBlock, { component, system, prop, watch } from 'super/i-block/i-block';
export * from 'super/i-dynamic-page/i-dynamic-page';

@component()
export default class bShowcase extends iBlock {
	/**
	 * Difference between data and stable Design system
	 */
	@prop({type: Object, required: false})
	diff?: DesignSystem;

	/**
	 * Design System data for showing
	 */
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
	 * Mods, that needs to highlight into the interface
	 * (grouped by a component name)
	 */
	@system()
	protected highlightedMods: Dictionary = {};

	/**
	 * Additional attributes for components
	 */
	@system()
	protected blockAttrs: Dictionary = {
		bButton: {
			exterior: 'primary',
			size: 'm'
		},

		bInput: {
			info: 'Some info text',
			error: 'Some error text',
			size: 'm',
			mods: {showInfo: false, showError: false},
			placeholder: 'Input text here...'
		}
	};

	/**
	 * Names of blocks with styles for showing
	 */
	protected get blockNames(): string[] {
		const
			{components = {}} = this.data;

		return Object.keys(components);
	}

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
	protected get colors(): CanUndef<Dictionary> {
		return this.data.colors;
	}

	/**
	 * All text styles
	 */
	protected get textStyles(): CanUndef<Dictionary> {
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
	 * @param data
	 */
	protected setVariables<T extends Dictionary>(data: T): void {
		const rec = (d, path?: string) => {
			Object.forEach(<Dictionary>d, (el, key) => {
				if (Object.isObject(el)) {
					return rec(el, `${path ? `${path}.${key}` : key}`);
				}

				if (path) {
					const
						{style} = document.documentElement,
						variable = `--${path.split('.').join('-')}-${key}`;

					if (this.diff) {
						const
							diff = this.field.get(`${path}.${key}`, this.diff);

						style.setProperty(`${variable}-diff`, <string>(diff || el));
					}

					style.setProperty(variable, <string>el);
				}
			});
		};

		rec(data);
	}

	/**
	 * Runs css variable setter for components data
	 */
	@watch({field: 'data', immediate: true})
	protected initializeVariables(): void {
		this.setVariables(this.data);
	}

	/**
	 * Extracts mods, that needs to highlighting in the interface
	 */
	@watch({field: 'diff', immediate: true})
	protected initializeHighlights(): void {
		const
			components = <Dictionary>this.field.get('diff.components');

		if (components) {
			Object.forEach(components, (_, name: string) => {
				const
					mods = this.field.get(`${name}.mods`, components);

				if (mods) {
					const
						compMods = this.highlightedMods[name] = {};

					Object.forEach(mods, (value, modName: string) => {
						compMods[modName] = {};

						if (Object.isObject(value)) {
							Object.keys(value).forEach((modValue) => {
								compMods[modName][modValue] = true;
							});
						}
					});
				}
			});
		}
	}
}
