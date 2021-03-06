/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import * as ExpressTypes from 'express';
import { ControllersKit } from 'interfaces/controllers';

import fs = require('fs');
import path = require('upath');
import prettier = require('prettier');
import gitPromise = require('simple-git/promise');
import $C = require('collection.js');

import { DS_REPO_PATH } from 'core/const';

const
	git = gitPromise(DS_REPO_PATH);

export default {
	namespace: 'api/git',
	routes: [
		{
			url: '/',
			method: 'get',
			fn: get
		},

		{
			url: 'commit',
			method: 'post',
			fn: push
		},

		{
			url: 'reset',
			method: 'get',
			fn: reset
		}
	]
} as ControllersKit;

async function push(req: ExpressTypes.Request, res: ExpressTypes.Response): Promise<void> {
	const
		sessionDS = $C(req).get('session.figma.data.designSystem');

	if (req.body && req.body.message && sessionDS) {
		let
			next = 0;

		await writeDsFile(sessionDS);

		await git.tags(['list']).then((tags) => {
			const
				latest = tags.all.length ? tags.all[tags.all.length - 1] : undefined;

			if (latest) {
				next = parseInt(latest.replace('v.', ''), 10);
				next += 1;
			}
		});

		await git.add('./*');
		await git.commit(req.body.message);
		await git.addAnnotatedTag(`v.${next}`, req.body.message);
		await git.pushTags();
		await git.push();

		// @ts-ignore
		req.session.destroy();
		res.send({status: 'ok'});

		return;
	}

	const
		errorsMsg = !req.body || !req.body.message ?
			'Please enter the commit message for your changes' :
			'Session has no Design System';

	res.send({error: {name: errorsMsg}});
}

async function reset(req: ExpressTypes.Request, res: ExpressTypes.Response): Promise<void> {
	await git.reset('hard');
	res.send({status: 'ok'});
}

/**
 * Sends actual info about the design system repo
 *
 * @param req
 * @param res
 */
export async function get(req: Dictionary, res: ExpressTypes.Response): Promise<void> {
	const
		tags = await git.tags();

	res.send({
		tags
	});
}

async function writeDsFile(data: Dictionary): Promise<void> {
	const
		filePath = path.join(DS_REPO_PATH, 'index.js'),
		str = `module.exports = ${JSON.stringify(data)}`;

	return fs.promises.writeFile(filePath, prettier.format(str));
}
