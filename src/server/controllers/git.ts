/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import * as ExpressTypes from 'express';
import { ControllersKit } from '../interfaces/controllers';

import gitPromise = require('simple-git/promise');
import fs = require('fs');
import path = require('upath');

const {

	DS_PACKAGE,
	DS_PACKAGE_USERNAME,
	DS_PACKAGE_PASSWORD

} = process.env;

const
	dsRepoLocalPath = path.resolve(process.cwd(), 'repository');

let
	needInit = false;

if (!fs.existsSync(dsRepoLocalPath)) {
	needInit = true;
	fs.mkdirSync(dsRepoLocalPath);
}

const
	git = gitPromise(dsRepoLocalPath);

if (needInit) {
	git
		.clone(`https://${DS_PACKAGE_USERNAME}:${DS_PACKAGE_PASSWORD}@${DS_PACKAGE}`, dsRepoLocalPath)
		.catch(console.log);

} else {
	git.pull().catch(console.log);
}

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
		}
	]
} as ControllersKit;

async function push(req: ExpressTypes.Request, res: ExpressTypes.Response): Promise<void> {
	if (req.body && req.body.message) {
		let
			next = 0;

		await git.tags(['list']).then((tags) => {
			const
				latest = tags.all.length ? tags.all[tags.all.length - 1] : undefined;

			if (latest) {
				next = parseInt(latest.replace('v.', ''), 10);
				next += 1;
			}
		});

		await git.commit(req.body.message, 'index.js');
		await git.addAnnotatedTag(`v.${next}`, req.body.message);
		await git.pushTags();
		await git.push();
	}

	res.send({error: {name: 'Please enter the commit message for your changes'}});
}

async function get(req: Dictionary, res: ExpressTypes.Response): Promise<void> {
	const tags = await git.tags();
	res.send({tags});
}
