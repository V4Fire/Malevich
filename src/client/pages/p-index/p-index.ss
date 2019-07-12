/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

- namespace [%fileName%]

- include 'super/i-dynamic-page'|b as placeholder

- template index() extends ['i-dynamic-page'].index
	- block body
		< header.&__header
			< a href = \/
				< img.&__logo :src = require('assets/img/logo-full.svg')

		< main.&__content
			< h1.&__title
				Publish your Design System

			< section.&__ds-publishing
				< .&__ds-figma-importing v-if = stage === 'figmaImport'
					< b-form &
						v-once |
						ref = files |
						:id = dom.getId('fileForm') |
						:method = 'get' |
						:dataProvider = 'API.FigmaFiles'
					.

						< b-input &
							:name = 'id' |
							:validators = [['required', {showMsg: false}]] |
							:placeholder = 'Enter file key' |
							@validationEnd = onValidationEnd
						.

						< b-button &
							v-func = false |
							ref = formSubmit |
							:type = 'submit' |
							:name = 'file' |
							:disabled = true
						.
							Find file

				< form.&__form v-else
					< b-button :rounding = 'small' | @click = onFigmaImportClick
						Import from figma

						< template #preIcon
							< img.&__icon :src = require('assets/img/figma.svg')
