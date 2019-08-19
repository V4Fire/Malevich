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

		< main.&__content
			< h1.&__title
				Publish your Design System

			< section.&__ds-publishing
				< b-form &
					v-once |
					ref = files |
					:id = dom.getId('fileForm') |
					:delegateAction = onFigmaImport
				.
					< b-input.&__form-item &
						:name = 'id' |
						:validators = [['required', {showMsg: false}]] |
						:placeholder = 'Enter a file key' |
						@onValidationEnd = onValidationEnd
					.

					< b-button.&__form-item &
						ref = formSubmit |
						:exterior = 'dark' |
						:type = 'submit' |
						:disabled = true |
						:rounding = 'small'
					.
						Import from figma

						< template #preIcon
							< img.&__icon :src = require('assets/img/figma.svg')
