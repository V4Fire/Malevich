/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import fs = require('fs');
import $C = require('collection.js');
import path = require('upath');

export * from './helpers';
export * from './const';

const
	files = fs.readdirSync(path.resolve(__dirname), {withFileTypes: false});

const
	components = $C(files).reduce((res, file) => {
		file = file.replace(/\.\w+/, '');

		if (!/^(?:index|helpers|const)$/.test(file)) {
			res[file.camelize(false)] = require(path.resolve(__dirname, file)).default;
		}

		return res;
	}, {});

export default components as Record<string, Record<string, Function>>;
