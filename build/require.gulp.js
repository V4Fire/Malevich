'use strict';

/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

module.exports = function () {
	const
		r = require,
		path = require('path');

	const
		{config} = require('@pzlr/build-core'),
		dest = config.serverDir,
		lib = path.join(dest, 'node_modules'),
		deps = config.dependencies,
		cache = Object.create(null);

	function n(url) {
		return './' + url;
	}

	require = (url) => {
		if (url in cache) {
			return r(cache[url]);
		}

		if (!path.isAbsolute(url) && !/^\.*\//.test(url) && /\//.test(url)) {
			let
				resolveUrl;

			for (let i = 0; i < deps.length + 1; i++) {
				try {
					if (i) {
						resolveUrl = r.resolve(path.join(lib, deps[i - 1], url));

					} else {
						resolveUrl = r.resolve(path.join(dest, url));
					}

					break;

				} catch (_) {}
			}

			if (resolveUrl) {
				cache[url] = n(path.relative(__dirname, resolveUrl));
				return r(cache[url]);
			}
		}

		cache[url] = url;
		return r(url);
	};
};
