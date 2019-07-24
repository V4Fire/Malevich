/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import fs = require('fs');
import path = require('upath');
import $C = require('collection.js');

import scheme from './scheme';
import * as h from './helpers';

const
	ERRORS: ContentError[] = [];

export interface ContentError {
	name: string;
	description?: string;
}

const DS: DesignSystem = {
	components: {},
	colors: {},
	text: {},
	rounding: {}
};

const
	content = fs.readFileSync(path.resolve(process.cwd(), 'response.json'), {encoding: 'utf-8'});

let
	STYLES: Figma.Styles;

const
	RAW_DATA: Record<string, unknown> = {},
	BLOCK_CHECKER = /^b([A-Z].*)/;

if (content) {
	const ds = parse(JSON.parse(content));
	fs.writeFile('ds.json', JSON.stringify(ds), console.log);
}

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
		pages = data.document.children;

	pages.sort((a, b) => a.name < b.name ? 1 : a.name > b.name ? -1 : 0);

	STYLES = data.styles;

	$C(pages).forEach((page) => {
		if (page.type === 'CANVAS') {
			findSubjects(page);
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

						RAW_DATA[c.id] = {
							type: c.type,
							name: c.name,
							value: scheme.color(DS, c, rect.fills[0])
						};

						break;
					}

					parseNode(c, t, name);
					break;

				case 'RECTANGLE':
				case 'VECTOR':
					if (h.checkFieldName(data.name, '@Radius')) {
						scheme.radius(DS, data, c);
						RAW_DATA[c.id] = {
							type: c.type,
							name: data.name,
							value: DS.rounding && DS.rounding[data.name.split('/').slice(0)]
						};
					}

					break;

				case 'TEXT':
					RAW_DATA[c.id] = {
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
											Object.assign(RAW_DATA[c.id], v(DS, data, c[key]));
										}

									} else if (v) {
										(<Dictionary>RAW_DATA[c.id])[k] = c[key][k];
									}
								});

							} else if (Object.isFunction(value)) {
								Object.assign(RAW_DATA[c.id], (<Function>value)(DS, data, c));
							}

							if (
								!data.name.match(/@/) &&
								(chunks.length === 1 || parseInt(chunks[chunks.length - 1], 10))
							) {
								h.set(chunks.join('.'), RAW_DATA[c.id], DS.text);
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
			switch (c.type) {
				case 'GROUP':
					parseNode(c, t, name);
					break;

				case 'COMPONENT':
				case 'INSTANCE':
					if (BLOCK_CHECKER.test(c.name)) {
						name = c.name;
					}

					if (/^Master/.test(c.name)) {
						if (c.type === 'INSTANCE') {
							parseNode(c, t, name);
						}

						break;
					}

					const
						[blockName, exterior] = (<string>name).split('/');

					let target;

					if (exterior && DS.components) {
						if (!DS.components[blockName]) {
							DS.components[blockName] = {
								exterior: {
									[exterior]: {}
								}
							};

							target = DS.components[blockName].exterior[exterior];

						} else {
							if (!DS.components[blockName].exterior[exterior]) {
								DS.components[blockName].exterior[exterior] = {};
							}

							target = DS.components[blockName].exterior[exterior];
						}

					} else {
						if (!DS.components[blockName]) {
							DS.components[blockName] = {exterior: {}};
						}

						target = DS.components[blockName];
					}

					if (c.name === 'color') {
						const
							colorRect = c.children[0];

						if (colorRect.styles) {
							const
								styleLink = STYLES[colorRect.styles.fill],
								[hue, num] = styleLink.name.split('/');

							if (DS.colors) {
								target.backgroundColor = DS.colors[hue][num - 1];
							}

							break;
						}
					}

					if (/s:/.test(c.name)) {
						if (!target.state) {
							target.state = {};
						}

						target.state[c.name] = {};

						const
							rect = c.children[0];

						$C(scheme.state).forEach((state, key) => {
							if (Object.isObject(state)) {
								$C(state).forEach((s, k) => {
									if (Object.isFunction(s)) {
										Object.assign(target.state[c.name], {[k]: s(DS, c, rect[key][0])});

									} else {
										target.state[c.name][k] = rect[key][0][k];
									}
								});

							} else if (Object.isFunction(state)) {
								Object.assign(target.state[c.name], (<Function>state)(rect));

							} else if (state) {
								target.state[c.name][key] = rect[key];
							}
						});
					}

					parseNode(c, t, name);
			}
		}
	});
}
