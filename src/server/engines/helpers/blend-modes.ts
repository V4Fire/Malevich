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

			return f;
		};

		const
			red = getColor(top.r, bottom.r),
			green = getColor(top.g, bottom.g),
			blue = getColor(top.b, bottom.b);

		return blendModes.normal({r: red, g: green, b: blue, a: top.a}, bottom);
	},

	normal(top: RGBA, bottom: RGBA): string {
		const
			red = top.r * top.a + bottom.r * bottom.a * (1 - top.a),
			green = top.g * top.a + bottom.g * bottom.a * (1 - top.a),
			blue = top.b * top.a + bottom.b * bottom.a * (1 - top.a);

		return createRGBA(red, green, blue);
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
export function createRGBA(r: number, g: number, b: number, a: number = 1): string {
	return `rgba(${(r * 255).toFixed()}, ${(g * 255).toFixed()}, ${(b * 255).toFixed()}, ${a.round(2)})`;
}

/**
 * Returns a color, mixed with the specified mode
 *
 * @param top
 * @param bottom
 * @param [mode]
 * @see https://en.wikipedia.org/wiki/Blend_modes
 */
export default function blend(top: string, bottom: string, mode: string = 'normal'): CanUndef<string> {
	if (!blendModes[mode]) {
		return;
	}

	return blendModes[mode](top, bottom);
}
