/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import { PageSchema } from 'core/router/interface';

export default <PageSchema>{
	index : {
		path: '/',
		page: 'p-index'
	},

	publish: {
		path: '/publish',
		page: 'p-publish'
	},

	demo: {
		path: '/demo',
		page: 'p-demo'
	},

	external: {
		path: '/ext/:service/:controller/:key',
		redirect: '/api/:service/:controller/:key',
		external: true
	}
};
