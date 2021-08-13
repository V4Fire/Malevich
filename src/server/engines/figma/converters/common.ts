/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import $C = require('collection.js');
import request = require('request-promise-native');
import fs = require('fs-extra-promise');
import path = require('upath');

import scheme, { storeTextStyle } from 'engines/figma/scheme';
import { RAW, ERRORS, textNameNormalizer } from 'engines/figma/converters';
import { getImages, ImagesResponse } from 'engines/figma/endpoints';
import { DS_REPO_PATH } from 'core/const';
import { ExternalAssetsOpts } from 'engines/figma/converters/interface';
import { ResponseMeta } from 'engines/figma/interface';

const
	mark = /^@/;

export default {
	colors(canvas: Figma.CANVAS): void {
		$C(canvas.children).forEach((c) => {
			if (mark.test(c.name)) {
				const
					id = c.styles.fill;

				c.name = c.name.replace(mark, '');

				RAW.data[id] = {
					name: c.name,
					type: c.type,
					value: <string>scheme.color(c.fills[0], c)
				};
			}
		});
	},

	illustrations(canvas: Figma.Node, meta: ResponseMeta): Promise<void> {
		return getExternalAssets(canvas, meta, {type: 'illustrations'});
	},

	icons(canvas: Figma.Node, info: ResponseMeta): Promise<void> {
		return getExternalAssets(canvas, info, {type: 'icons'});
	},

	typography(canvas: Figma.Node): void {
		$C(canvas.children).forEach((c) => {
			if (!mark.test(c.name)) {
				return;
			}

			if (!c.styles || !c.styles.text) {
				ERRORS.push({
					name: 'Error while creating typography styles',
					description: `${c.name} layer has no styles identifier`
				});
			}

			const
				id = c.styles.text;

			c.name = c.name.replace(mark, '');

			RAW.data[id] = {
				type: c.type,
				name: textNameNormalizer(c.name),
				style: {}
			};

			$C(scheme.text).forEach((value, key) => {
				if (c[key]) {
					if (Object.isDictionary(value)) {
						$C(value).forEach((v, k) => {
							if (Object.isFunction(v)) {
								if (c[key][k]) {
									const
										result = v(c[key]);

									Object.assign(
										RAW.data[id].style,
										Object.isDictionary(result) ? result : {[k]: result});
								}

							} else if (v) {
								(<Dictionary>RAW.data[id].style)[k] = c[key][k];
							}
						});

					} else if (Object.isFunction(value)) {
						Object.assign(RAW.data[id].style, (<Function>value)(c));
					}

					if (Object.isDictionary(RAW.data[id].style)) {
						storeTextStyle(c.name, <Dictionary>RAW.data[id].style);
					}
				}
			});
		});
	},

	rounding(canvas: Figma.Node): void {
		$C(canvas.children).forEach((c) => {
			if (mark.test(c.name)) {
				c.name = c.name.replace(mark, '');

				RAW.data[c.id] = {
					type: c.type,
					name: c.name,
					value: scheme.radius(c)
				};
			}
		});
	}
};

async function getExternalAssets(
	canvas: Figma.Node,
	{file, token}: ResponseMeta,
	opts: ExternalAssetsOpts
): Promise<void> {

	const items = $C(canvas.children).to({}).reduce((res, c: Figma.Node) => {
		if (c.type === 'INSTANCE' || c.type === 'COMPONENT') {
			res[c.id] = c.name;

		} else if (c.type === 'COMPONENT_SET') {
			const
				iconName = c.name;

			$C(c.children).forEach((variant) => {
				const
					head: string[] = [],
					tail: string[] = [],
					mods = variant.name.split(', ');

				mods.forEach((modString) => {
					const
						[name, value] = modString.split('=');

					if (name.toLowerCase() === 'size' && Object.isNumber(Number(value))) {
						// This is the size (first level folder)
						head.push(value);

					} else {
						tail.push(value);
					}
				});

				if (head.length === 0) {
					// No size in the design system object
					head.push(iconName);
				}

				// icons/24/arrow/foo/right.svg
				res[variant.id] = [opts.type].concat(head, tail).join('/');
			});
		}

		return res;
	});

	const
		ids = Object.keys(items),
		response = await getImages({file, ids}, token);

	if (response) {
		if (response.err) {
			ERRORS.push({
				name: 'Error while getting assets pack'
			});

		} else {
			await Promise.all($C((<ImagesResponse>response).images).reduce((res, value, key) => {
				const
					assetPath = path.join(DS_REPO_PATH, `${items[key].toLowerCase()}.svg`);

				if (!fs.existsSync(path.dirname(assetPath))) {
					fs.mkdirSync(path.dirname(assetPath), {recursive: true});
				}

				const result = new Promise((resolve, reject) => {
					request(value)
						.then((data) => fs.writeFileAsync(assetPath, data))
						.then(resolve)
						.catch(reject);
				});

				(<Promise<unknown | Dictionary>[]>res).push(result);
				return res;
			}, [])).catch(console.log);
		}
	}
}
