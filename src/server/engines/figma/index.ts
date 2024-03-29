/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import $C = require('collection.js');

import { DS, DIFFS, storeComponent } from 'engines/figma/scheme';
import converters, { RAW, ERRORS, WARNINGS } from 'engines/figma/converters';
import { ResponseMeta } from 'engines/figma/interface';

export * from 'engines/figma/interface';

const
	BLOCK_CHECKER = /^b([A-Z].*)/;

/**
 * Parses file for generate DS
 *
 * @param data
 * @param meta
 */
export default async function (data: Figma.File, meta: ResponseMeta): Promise<{
	err: ContentError[];
	warnings: ContentError[];
	designSystem: DesignSystem;
	diff: Record<string, Dictionary | true>;
	approved: boolean;
}> {
	const
		pages = data.document.children;

	let
		tasks = [];

	RAW.styles = data.styles;

	try {
		pages.forEach((p) => {
			tasks = tasks.concat(tasks, p.children.map(async (el) => {
				if (el.type === 'FRAME') {
					await findSubjects(el, meta);
				}
			}));
		});

		await Promise.all(tasks);

	} catch (e) {
		ERRORS.push({
			name: 'Incorrect file'
		});
	}

	return {
		err: ERRORS,
		warnings: WARNINGS,
		designSystem: DS,
		diff: DIFFS,
		approved: !Boolean(ERRORS.length)
	};
}

/**
 * Finds subjects in the pages list
 *
 * @param canvas
 * @param meta
 */
async function findSubjects(canvas: Figma.Node, meta: ResponseMeta): Promise<void> {
	const
		name = canvas.name.toLowerCase();

	if (Object.isFunction(converters.common[name])) {
		await converters.common[name](canvas, meta);
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
		storeComponent(name, data);
		return;
	}

	$C(data.children).forEach((c) => {
		if (c.type === 'TEXT') {
			return;
		}

		if (c.type === 'GROUP' && !new RegExp('Master|^m:').test(c.name)) {
			parseNode(c, name);

		} else {
			storeComponent(name, c);
		}
	});
}
