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

		< b-showcase :data = data
