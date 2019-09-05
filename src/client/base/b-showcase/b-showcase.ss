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
		< main.&__content
			< h1.&__header
				Typography

			< .&__row v-for = value, key in textStyles
				< .&__container[.&_type_text]
					< .&__label
						{{ key }}

					< .text[.&_diff_true]
						< . :class = createTextClasses(key)
							The quick brown fox jumps over the lazy dog

					< .&__text-additional
						< .&__props[.text_style_base]
							< p v-for = v, prop in value
								{{ prop }}: {{ v }}

				< . &
					v-if = field.get('diff.text.' + key) |
					:class = provide.elClasses({container: {type: 'text', oldVersion: true}})
				.
					< .&__label
						{{ key }}

					< . :class = createTextClasses(key)
						The quick brown fox jumps over the lazy dog

					< .&__text-additional
						< .&__props[.text_style_base]
							< p v-for = v, prop in diff.text[key]
								{{ prop }}:

								< span :class = provide.elClasses({propValue: {highlight: textStyles[key][prop] !== v}})
									{{ v }}

			< h1.&__header
				Colors

			< .&__row
				- block colors(lib)
					< .&__colors-over-wrapper
						< template v-for = kit, name in ${lib}
							< .&__color-wrap v-for = c, index in kit
								< .&__color &
									:style = {backgroundColor: c} |
									:title = name
								.

								< .&__color-description
									< .&__color-name
										{{ name + '/' + (index + 1) }}

									< .&__color-value
										{{ c }}

				< .&__container[.&_type_colors]
					+= self.colors('colors')

				< . &
					v-if = field.get('diff.colors') |
					:class = provide.elClasses({container: {type: 'colors', oldVersion: true}})
				.
					+= self.colors('diff.colors')

			< h1.&__header
				Rounding

			< .&__row
				< .&__container
					< .&__rounding-wrap v-for = val, key in rounding
						< .&__rounding :style = {borderRadius: val}

						< .&__rounding-name
							< b
								{{ key }}:
							{{ val }}

				< . &
					v-if = field.get('diff.rounding') |
					:class = provide.elClasses({container: {type: 'colors', oldVersion: true}})
				.
					< .&__rounding-wrap v-for = val, key in field.get('diff.rounding')
						< .&__rounding :style = {borderRadius: val}

						< .&__rounding-name
							< b
								{{ key }}:

							< span :class = provide.elClasses({propValue: {highlight: true}})
								{{ val }}

			< h1.&__header
				Components

			< .&__row v-for = b in blockNames
				< .&__container
					< h2.&__text[.text_style_heading4]
						{{ b }}

					< b-v4-component-demo
						< component &
							v-func = false |
							slot-scope = {ctx} |
							:is = b.dasherize() |
							:diff = false |
							:v-attrs = blockAttrs[b] |
							@statusReady = ctx.debug
						.
							Some text

				< . &
					v-if = field.get('diff.components.' + b) |
					:class = provide.elClasses({container: {type: 'component', oldVersion: true}})
				.
					< h2.&__text[.text_style_heading4]
						{{ b }}

					< b-v4-component-demo :highlight = highlightedMods[b]
						< component &
							v-func = false |
							slot-scope = {ctx} |
							:is = b.dasherize() |
							:diff = true |
							:v-attrs = blockAttrs[b] |
							@statusReady = ctx.debug
						.
							Some text
