/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import $C = require('collection.js');

import scheme, { DS, RAW, writeComponent } from './scheme';
import * as h from './helpers';

const
	ERRORS: ContentError[] = [],
	BLOCK_CHECKER = /^b([A-Z].*)/;

/**
 * Parses file for generate DS
 * @param data
 */
export default function parse(
	data: Figma.File
): {
	errors: ContentError[];
	designSystem: DesignSystem;
	approved: boolean;
} {
	const
		pages = data.document.children,
		ds = pages.find((p) => p.name === 'DS');

	ds.children.sort((a, b) => a.name < b.name ? 1 : a.name > b.name ? -1 : 0);

	RAW.styles = data.styles;

	$C(ds.children).forEach((el) => {
		if (el.type === 'FRAME') {
			findSubjects(el);
		}
	});

	return {
		errors: ERRORS,
		designSystem: DS,
		approved: Boolean(DS)
	};
}

/**
 * Finds subjects in pages list
 * @param canvas
 */
function findSubjects(canvas: Figma.Node): void {
	const
		i = /^i([A-Z].*)/;

	$C(canvas.children).forEach((p) => {
		const
			matchB = canvas.name.match(BLOCK_CHECKER),
			matchI = canvas.name.match(i);

		if (matchI && matchI[1] || matchB && matchB[1]) {
			parseNode(p, matchI ? 'interface' : 'block', matchI ? matchI[0] : matchB[0]);
		}
	});
}

type PageType = 'interface' | 'block';

function parseNode(data: Figma.Node, t: PageType, name: string): void {
	if (/^!/.test(data.name)) {
		return;
	}

	$C(data.children).forEach((c) => {
		if (t === 'interface') {
			switch (c.type) {
				case 'COMPONENT':
				case 'INSTANCE':
				case 'GROUP':
					if (h.checkFieldName(c.name, '@Color') && c.name.split('/').length === 3) {
						const
							rect = c.children[0];

						if (!rect) {
							ERRORS.push({
								name: 'No color rectangle',
								description: `${c.name} has no color definition rectangle`
							});

							break;
						}

						RAW.data[c.id] = {
							type: c.type,
							name: c.name,
							value: scheme.color(c, rect.fills[0])
						};

						break;
					}

					parseNode(c, t, name);
					break;

				case 'RECTANGLE':
				case 'VECTOR':
					if (h.checkFieldName(data.name, '@Radius')) {
						scheme.radius(data, c);
						RAW.data[c.id] = {
							type: c.type,
							name: data.name,
							value: DS.rounding && DS.rounding[data.name.split('/').slice(0)]
						};
					}

					break;

				case 'TEXT':
					RAW.data[c.id] = {
						type: c.type,
						name: data.name
					};

					const
						chunks = data.name.toLowerCase().split('/');

					$C(scheme.text).forEach((value, key) => {
						if (c[key]) {
							if (Object.isObject(value)) {
								$C(value).forEach((v, k) => {
									if (Object.isFunction(v)) {
										if (c[key][k]) {
											Object.assign(RAW.data[c.id], v(data, c[key]));
										}

									} else if (v) {
										(<Dictionary>RAW.data[c.id])[k] = c[key][k];
									}
								});

							} else if (Object.isFunction(value)) {
								Object.assign(RAW.data[c.id], (<Function>value)(data, c));
							}

							if (
								!data.name.match(/@/) &&
								(chunks.length === 1 || parseInt(chunks[chunks.length - 1], 10))
							) {
								h.set(chunks.join('.'), RAW.data[c.id], DS.text);
							}
						}
					});

					break;

				default:
					ERRORS.push({
						name: 'Type is not registered',
						description: `${c.type} is not registered at design system loader`
					});

					return;
			}
			return;
		}

		if (t === 'block') {
			if (c.type === 'TEXT') {
				return;
			}

			if (
				c.type === 'GROUP' &&
				!new RegExp('Master|^m:').test(c.name)
			) {
				parseNode(c, t, name);

			} else {
				writeComponent(name, c);
			}

		}
	});
}
