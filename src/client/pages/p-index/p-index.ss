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
			< img.&__logo :src = require('assets/img/logo-full.svg')

		< main.&__content
			< h1.&__title
				Publish your Design System

			< section.&__ds-publishing
				< form.&__form
					< b-button :rounding = 'small'
						Import from figma

						< template v-slot:preIcon
							< img.&__icon :src = require('assets/img/figma.svg')
