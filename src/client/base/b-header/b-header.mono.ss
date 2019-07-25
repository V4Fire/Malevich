/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

- namespace [%dirName%]
- include 'super/i-block'|b as placeholder

- @@ignore
- template index() extends ['i-block'].index

	- block root
		< ?.${self.name()}
			< header.&__header
				< a href = \/
					< img.&__logo :src = require('assets/img/logo-full.svg')
