/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

/**
 * Extends an object or a function by the specified method
 *
 * @param obj
 * @param name - method name
 * @param method
 */
export default function extend(obj: Function | object, name: string, method: Function | PropertyDescriptor): void {
	const descriptor = <PropertyDescriptor>{
		configurable: true
	};

	if (typeof method === 'function') {
		descriptor.writable = true;
		descriptor.value = method;

	} else {
		Object.assign(descriptor, method);
	}

	Object.defineProperty(obj, name, descriptor);
}
