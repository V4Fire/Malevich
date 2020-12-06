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

	async icons(canvas: Figma.Node, {file, token}: {file: string; token: string}): Promise<void> {
		const icons = $C(canvas.children).to({}).reduce((res, c: Figma.Node) => {
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
							head.push(iconName);

						} else {
							tail.push(value);
						}
					});

					if (head.length === 0) {
						// No size in the design system object
						head.push(iconName);
					}

					// 24/arrow/foo/right
					res[variant.id] = [].concat(head, tail).join('/');
				});
			}

			return res;
		});

		const
			ids = Object.keys(icons),
			response = await getImages({file, ids}, token);

		if (response) {
			if (response.err) {
				ERRORS.push({
					name: 'Error while getting icons pack'
				});

			} else {
				await Promise.all($C((<ImagesResponse>response).images).reduce((res, value, key) => {
					const
						iconPath = path.join(DS_REPO_PATH, `${icons[key].toLowerCase()}.svg`);

					if (!fs.existsSync(path.dirname(iconPath))) {
						fs.mkdirSync(path.dirname(iconPath), {recursive: true});
					}

					const result = new Promise((resolve, reject) => {
						request(value)
							.then((data) => fs.writeFileAsync(iconPath, data))
							.then(resolve)
							.catch(reject);
					});

					(<Promise<unknown | Dictionary>[]>res).push(result);
					return res;
				}, [])).catch(console.log);
			}
		}
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
