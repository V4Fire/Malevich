/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import iStaticPage, { component, system } from 'super/i-static-page/i-static-page';
import { PageSchema } from 'base/b-router/b-router';
export * from 'super/i-static-page/i-static-page';

@component({root: true})
export default class pRoot<
	P extends Dictionary = Dictionary,
	Q extends Dictionary = Dictionary,
	M extends Dictionary = Dictionary,
	D extends Dictionary = Dictionary
> extends iStaticPage<P, Q, M, D> {
	/**
	 * Active page component
	 */
	get activePage(): CanUndef<string> {
		return this.route && this.getField('route.meta.page');
	}

	/**
	 * Routes declaration
	 */
	@system()
	readonly routes: PageSchema = {
		index : {
			path: '/',
			page: 'p-index'
		},

		external: {
			path: '/ext/:service/:controller',
			redirect: '/api/:service/:controller',
			external: true
		}
	};
}
