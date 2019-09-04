'use strict';

/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

const
	config = require('@v4fire/client/config/default'),
	o = require('uniconf/options').option;

module.exports = config.createConfig({dirs: [__dirname, 'client']}, {
	__proto__: config,

	runtime() {
		return {
			...super.runtime(),

			'ds-diff': true,
			'ds-vars': true,

			'blockNames': true
		};
	},

	appName: o('app-name', {
		env: true,
		default: 'Malevich',
		coerce(value) {
			global['APP_NAME'] = value;
			return value;
		}
	})
});
