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
			< b-v4-component-demo
				< b-button &
					v-func = false |
					slot-scope = {ctx} |
					@statusReady = ctx.debug |
					${defAttrs}
				.
					Some text

			< b-v4-component-demo
				< b-input &
					v-func = false |
					slot-scope = {ctx} |
					:placeholder = 'Input here...' |
					@statusReady = ctx.debug |
					${defAttrs}
				.
					Some text
