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

		const
			{width, height} = ch.absoluteBoundingBox;

		let
			backgroundColor = $C(ch).get('fills.0');

		if (backgroundColor) {
			backgroundColor = mixins.calcColor(backgroundColor);
		}

		if (ch.name === 'checkerBack') {
			const
				effect = $C(ch).get('effects.0'),
				shadowOffset = $C(effect).get('offset');

			let
				strokeColor = $C(ch).get('strokes.0'),
				boxShadow;

			if (shadowOffset) {
				boxShadow = `${shadowOffset.x.px} ${shadowOffset.y.px} ${mixins.calcColor(effect)}`;
			}

			if (strokeColor) {
				strokeColor = mixins.calcColor(strokeColor);
			}

			res.checkbox = {
				width: width.px,
				height: height.px,

				border: ch.strokeWeight && `${ch.strokeWeight.px} solid ${strokeColor}` || undefined,
				borderRadius: ch.cornerRadius && ch.cornerRadius.px || undefined,

				backgroundColor,
				boxShadow
			};
		}

		if (ch.name === 'check') {
			res.check = {
				width: width.px,
				height: height.px,
				backgroundColor
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

	checked: (el: Figma.Node) => ({true: checkboxCommon(el.children)}),
	focused: (el: Figma.Node) => ({true: checkboxCommon(el.children)}),
	disabled: (el: Figma.Node) => ({true: checkboxCommon(el.children)}),
	valid: (el: Figma.Node) => validState(el, 'bCheckbox', 'checkerBack'),
	exterior(el: Figma.Node): Dictionary {
		return {};
	}
};
