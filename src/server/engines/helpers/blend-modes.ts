/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

export interface RGB {
	r: number;
	g: number;
	b: number;
}

export interface RGBA extends RGB {
	a: number;
}

const blendModes = {
	colorBurn(top: RGBA, bottom: RGBA): string {
		const getColor = (f, b) => {
			const
				tmp = 255 - ((255 - b) * 255) / f;

			if (f === 0) {
				f = 255;

			} else if (tmp < 0) {
				f = 0;

			} else {
				f = tmp;
			}

			return f.round();
		};

		const
			red = getColor(top.r, bottom.r),
			green = getColor(top.g, bottom.g),
			blue = getColor(top.b, bottom.b);

		return blendModes.normal({r: red, g: green, b: blue, a: top.a}, bottom);
	},

	normal(top: RGBA, bottom: RGBA): string {
		const
			red = (top.r * top.a + bottom.r * bottom.a * (1 - top.a)).round(),
			green = (top.g * top.a + bottom.g * bottom.a * (1 - top.a)).round(),
			blue = (top.b * top.a + bottom.b * bottom.a * (1 - top.a)).round();

		return createRGBAString(red, green, blue);
	}
};

/**
 * Returns rgba string for specified channels
 *
 * @param r
 * @param g
 * @param b
 * @param [a]
 */
export function createRGBAString(r: number, g: number, b: number, a: number = 1): string {
	return `rgba(${[r, g, b, a].join(',')})`;
}

/**
 * Returns a color, mixed with the specified mode
 *
 * @param top
 * @param bottom
 * @param [mode]
 * @see https://en.wikipedia.org/wiki/Blend_modes
 */
export default function blend(top: RGBA, bottom: RGBA, mode: string = 'normal'): CanUndef<string> {
	if (!blendModes[mode]) {
		return;
	}

	const
		t = convertFloatColor(top),
		b = convertFloatColor(bottom);

	return blendModes[mode](t, b);
}

/**
 * Returns color converted from fractional-style RGBA to 255-styled
 * @param color
 */
export function convertFloatColor(color: RGBA): RGBA {
	const
		keys = ['r', 'g', 'b'];

	const result = keys.reduce((res, channel) => {
		const
			value = (color[channel] * 255).round();

		res[channel] = Number(value);
		return res;
	}, <RGBA>{});

	if (color.hasOwnProperty('a')) {
		result.a = color.a.round(2);
	}

	return result;
}
