/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

- namespace [%fileName%]

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
	- block body
		: defAttrs = { &
			':info': "'Some info text'",
			':error': "'Some error text'",
			':mods': '{showInfo: false, showError: false}'
		} .

		< main.&__content
			< h1.&__header
				Typography

			< .&__row v-for = value, key in textStyles
				< .&__container[.&_type_text]
					< .&__label
						{{ key }}

					< . :class = createTextClasses(key)
						The quick brown fox jumps over the lazy dog

					< .&__text-additional
						< .&__props[.text_style_base]
							< p v-for = v, prop in value
								{{ prop }}: {{ v }}

				< .&__container[.&_type_text] v-if = field.get('diff.text.' + key)
					< .&__label
						{{ key }}

					< . :class = createTextClasses(key)
						The quick brown fox jumps over the lazy dog

					< .&__text-additional
						< .&__props[.text_style_base]
							< p v-for = v, prop in diff.text[key]
								{{ prop }}: {{ v }}

			< h1.&__header
				Colors

			< .&__row
				- block colors(lib)
					< template v-for = kit, name in ${lib}
						< .&__color-wrap v-for = c, index in kit
							< .&__color &
								:style = {backgroundColor: c} |
								:title = name
							.

							< .&__color-description
								< .&__color-name
									{{ name + '/' + index }}

								< .&__color-value
									{{ c }}

				< .&__container[.&_type_colors]
					+= self.colors('colors')

				< .&__container[.&_type_text] v-if = field.get('diff.colors')
					+= self.colors('diff.colors')

			< h1.&__header
				Rounding

			< .&__row
				< .&__rounding-wrap v-for = val, key in rounding
					< .&__rounding :style = {borderRadius: val}

					< .&__rounding-name
						{{ key }}

			< h1.&__header
				Components

			< .&__row
				< .&__container
					< h2.&__text[.text_style_heading4]
						Button

					< b-v4-component-demo
						< b-button &
							v-func = false |
							slot-scope = {ctx} |
							:exterior = 'primary' |
							@statusReady = ctx.debug |
							${defAttrs}
						.
							Some text

			< .&__row
				< .&__container
					< h2.&__text[.text_style_heading3]
						Input

					< b-v4-component-demo
						< b-input &
							v-func = false |
							slot-scope = {ctx} |
							:placeholder = 'Input here...' |
							@statusReady = ctx.debug |
							${defAttrs}
						.
