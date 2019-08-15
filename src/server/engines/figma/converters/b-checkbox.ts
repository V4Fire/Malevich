/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import { validState } from './helpers';
import { RAW } from './const';
import * as mixins from '../mixins';

import $C = require('collection.js');

function checkboxCommon(els: Figma.Node[]): Dictionary {
	return els.reduce((res, ch) => {
		if (ch.name === 'label') {
			const
				color = $C(ch).get('fills.0');

			if (color) {
				res.label = {
					color: mixins.calcColor(color)
				};
			}
		}

		if (ch.name === 'checkerBack') {
			const
				layer = $C(ch).get('children.0'),
				effect = $C(ch).get('effects.0'),
				shadowOffset = $C(effect).get('offset');

			let
				strokeColor = $C(layer).get('strokes.0'),
				backgroundColor = $C(layer).get('fills.0'),
				boxShadow;

			if (shadowOffset) {
				boxShadow = `${shadowOffset.x.px} ${shadowOffset.y.px} ${mixins.calcColor(effect)}`;
			}

			if (backgroundColor) {
				backgroundColor = mixins.calcColor(backgroundColor);
			}

			if (strokeColor) {
				strokeColor = mixins.calcColor(strokeColor);
			}

			res.checkbox = {
				backgroundColor,
				border: layer.strokeWeight && `${layer.strokeWeight.px} solid ${strokeColor}` || undefined,
				borderRadius: layer.cornerRadius && layer.cornerRadius.px || undefined,
				boxShadow
			};
		}

		return res;
	}, <Dictionary>{});
}

export default {
	selfLayer(els: Figma.Node[]): Dictionary {
		const
			common = checkboxCommon(els);

		let
			labelBound, checkboxBound;

		$C(els).forEach((el) => {
			if (el.name === 'label') {
				labelBound = $C(el).get('absoluteBoundingBox');
				common.textStyle = $C(RAW.styles).get(`${el.styles.text}.name`);
			}

			if (el.name === 'checkerBack') {
				checkboxBound = $C(el).get('absoluteBoundingBox');
			}
		});

		if (common.label && checkboxBound && labelBound) {
			(<Dictionary>common.label).marginLeft = Math.abs(checkboxBound.x + checkboxBound.width - labelBound.x).px;
		}

		return common;
	},

	focus: (el: Figma.Node) => checkboxCommon(el.children),
	disabled: (el: Figma.Node) => checkboxCommon(el.children),
	valid: (el: Figma.Node) => validState(el, 'bCheckbox', 'checkerBack'),
	exterior(el: Figma.Node): Dictionary {
		console.log(111, el.name);
		return {};
	}
};
