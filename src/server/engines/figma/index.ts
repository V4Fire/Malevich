/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import $C = require('collection.js');

import { DS, DIFFS, writeComponent } from './scheme';
import converters, { RAW, ERRORS, WARNINGS } from './converters';

const
	BLOCK_CHECKER = /^b([A-Z].*)/;

/**
 * Parses file for generate DS
 * @param data
 */
export default function (data: Figma.File): {
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
		name = canvas.name.toLowerCase();

	if (Object.isFunction(converters.common[name])) {
		converters.common[name](canvas);
		return;
	}

	const
		block = canvas.name.match(BLOCK_CHECKER);

	if (block) {
		$C(canvas.children).forEach((p) => {
			parseNode(p, block ? block[0] : canvas.name);
		});
	}
}

function parseNode(data: Figma.Node, name: string): void {
	if (/^!/.test(data.name)) {
		return;
	}

	const
		master = /^Master(?:$|\/)/,
		isComponent = master.test(data.name) || (BLOCK_CHECKER.test(data.name) && data.type === 'COMPONENT');

	if (isComponent) {
		writeComponent(name, data);
		return;
	}

	$C(data.children).forEach((c) => {
		if (c.type === 'TEXT') {
			return;
		}

		if (c.type === 'GROUP' && !new RegExp('Master|^m:').test(c.name)) {
			parseNode(c, name);

		} else {
			writeComponent(name, c);
		}
	});
}
