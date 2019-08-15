/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

- namespace [%fileName%]

- include 'super/i-dynamic-page'|b as placeholder
- include 'base/b-header/b-header.mono.ss'|b

- template index() extends ['i-dynamic-page'].index
	- block body
		+= self.getTpl('b-header/')()

		: defAttrs = { &
			':info': "'Some info text'",
			':error': "'Some error text'",
			':mods': '{showInfo: false, showError: false}'
		} .

		< main.&__content
			< h1.&__header
				Typography | iText frame

			< .&__text-container v-for = s in textStyles
				< .&__label
					{{ s.name }}

				< . :class = provide.elClasses({text: {style: s.id}})
					The quick brown fox jumps over the lazy dog

				< .&__text-additional
					< .&__props[.&_style_base]
						< p v-for = value, prop in s.style
							{{ prop }}: {{ value }}

			< h1.&__header
				Components

			< h2.&__text[.&_style_heading4]
				Button

			< b-v4-component-demo
				< b-button &
					v-func = false |
					slot-scope = {ctx} |
					@statusReady = ctx.debug |
					${defAttrs}
				.
					Some text

			< h2.&__text[.&_style_heading3]
				Input

			< b-v4-component-demo
				< b-input &
					v-func = false |
					slot-scope = {ctx} |
					:placeholder = 'Input here...' |
					@statusReady = ctx.debug |
					${defAttrs}
				.
