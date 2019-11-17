/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

// tslint:disable:binary-expression-operand-order
// tslint:disable:no-bitwise

import extend from 'core/prelude/extend';

/**
 * Returns string: number + 'em'
 */
extend(Number.prototype, 'em', createPostfixGetter('em'));

/**
 * Returns string: number + 'rem'
 */
extend(Number.prototype, 'rem', createPostfixGetter('rem'));

/**
 * Returns string: number + 'px'
 */
extend(Number.prototype, 'px', createPostfixGetter('px'));

/**
 * Returns string: number + 'vh'
 */
extend(Number.prototype, 'vh', createPostfixGetter('vh'));

/**
 * Returns string: number + 'vw'
 */
extend(Number.prototype, 'vw', createPostfixGetter('vw'));

/**
 * Returns string: number + 'vmin'
 */
extend(Number.prototype, 'vmin', createPostfixGetter('vmin'));

/**
 * Returns string: number + 'vmax'
 */
extend(Number.prototype, 'vmax', createPostfixGetter('vmax'));

/** @see Sugar.Number.isInteger */
extend(Number.prototype, 'isInteger', function (): boolean {
	return this % 1 === 0;
});

const
	decPartRgxp = /\.\d+/;

extend(Number.prototype, 'pad', function (
	this: Number,
	place: number = 0,
	sign?: boolean,
	base: number = 10
): string {
	const
		val = Number(this);

	let str = Math.abs(val).toString(base || 10);
	str = repeatString('0', place - str.replace(decPartRgxp, '').length) + str;

	if (sign || val < 0) {
		str = (val < 0 ? '-' : '+') + str;
	}

	return str;
});

/** @see Sugar.Number.floor */
extend(Number.prototype, 'floor', createRoundingFunction(Math.floor));

/** @see Sugar.Number.round */
extend(Number.prototype, 'round', createRoundingFunction(Math.round));

/** @see Sugar.Number.ceil */
extend(Number.prototype, 'ceil', createRoundingFunction(Math.ceil));

function createPostfixGetter(nm: string): PropertyDescriptor {
	return {
		get(): string {
			return Number(this) + nm;
		}
	};
}

function createRoundingFunction(method: Function): Function {
	return function (this: Number, precision?: number): number {
		const
			val = Number(this);

		if (precision) {
			let
				multiplier = Math.pow(10, Math.abs(precision));

			if (precision < 0) {
				multiplier = 1 / multiplier;
			}

			return method(val * multiplier) / multiplier;
		}

		return method(val);
	};
}

function repeatString(str: string, num: number): string {
	str = String(str);

	let
		res = '';

	while (num > 0) {
		if (num & 1) {
			res += str;
		}

		num >>= 1;

		if (num) {
			str += str;
		}
	}

	return res;
}
