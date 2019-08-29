/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import $C = require('collection.js');

import scheme, { DS, DIFFS, setDiff, writeComponent } from './scheme';
import { RAW, ERRORS, WARNINGS } from './converters';
import * as h from './helpers';

const
	BLOCK_CHECKER = /^b([A-Z].*)/;

/**
 * Parses file for generate DS
 * @param data
 */
export default function parse(
	data: Figma.File
): {
	errors: ContentError[];
	warnings: ContentError[];
	designSystem: DesignSystem;
	diff: Record<string, Dictionary | true>;
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
		warnings: WARNINGS,
		designSystem: DS,
		diff: DIFFS,
		approved: !Boolean(ERRORS.length)
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

	const
		master = /^Master(?:$|\/)/,
		isComponent = master.test(data.name) || (BLOCK_CHECKER.test(data.name) && data.type === 'COMPONENT');

	if (t === 'block' && isComponent) {
		writeComponent(name, data);
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
							value: <string>scheme.color(rect.fills[0], c)
						};

						break;
					}

					parseNode(c, t, name);
					break;

				case 'RECTANGLE':
				case 'VECTOR':
					if (h.checkFieldName(data.name, '@Radius')) {
						scheme.radius(c, data);
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
						name: data.name,
						style: {}
					};

					const
						chunks = data.name.toLowerCase().split('/');

					$C(scheme.text).forEach((value, key) => {
						if (c[key]) {
							if (Object.isObject(value)) {
								$C(value).forEach((v, k) => {
									if (Object.isFunction(v)) {
										if (c[key][k]) {
											const
												result = v(c[key]);

											Object.assign(
												RAW.data[c.id].style,
												Object.isObject(result) ? result : {[k]: result});
										}

									} else if (v) {
										(<Dictionary>RAW.data[c.id].style)[k] = c[key][k];
									}
								});

							} else if (Object.isFunction(value)) {
								Object.assign(RAW.data[c.id].style, (<Function>value)(c, data));
							}

							if (
								!data.name.match(/@/) &&
								(chunks.length === 1 || parseInt(chunks[chunks.length - 1], 10)) &&
								RAW.data[c.id].style
							) {
								h.set(chunks.join(''), RAW.data[c.id].style, DS.text);
								setDiff(chunks.join(''), <Dictionary>RAW.data[c.id].style);
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
