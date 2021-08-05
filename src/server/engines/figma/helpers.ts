/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

/**
 * Sets a property to the specified object
 *
 * @param path - path to the property (bla.baz.foo)
 * @param value
 * @param obj
 */
export function set<T = unknown>(path: string, value: T, obj: object): T {
	if (!obj) {
		return value;
	}

	const
		chunks = path.split('.');

	for (let i = 0; i < chunks.length; i++) {
		const
			prop = chunks[i];

		if (i + 1 === chunks.length) {
			path = prop;
			break;
		}

		if (!obj[prop] || typeof obj[prop] !== 'object') {
			obj[prop] = isNaN(Number(chunks[i + 1])) ? {} : [];
		}

		obj = <Dictionary>obj[prop];
	}

	obj[path] = value;
	return value;
}
