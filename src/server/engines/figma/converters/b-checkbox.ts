/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

import { validState, convertMod, textNameNormalizer } from 'engines/figma/converters/helpers';
import { RAW } from 'engines/figma/converters/const';
import * as mixins from 'engines/figma/mixins';

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

		let
			strokeColor = $C(ch).get('strokes.0'),
			backgroundColor = $C(ch).get('fills.0');

		if (strokeColor) {
			strokeColor = mixins.calcColor(strokeColor);
		}

		const
			{width, height} = ch.absoluteBoundingBox,
			border = ch.strokeWeight && strokeColor && `${ch.strokeWeight.px} solid ${strokeColor}` || undefined,
			borderRadius = ch.cornerRadius && ch.cornerRadius.px || undefined;

		if (backgroundColor) {
			backgroundColor = mixins.calcColor(backgroundColor);
		}

		if (ch.name === 'checkerBack') {
			const
				effect = $C(ch).get('effects.0'),
				shadowOffset = $C(effect).get('offset');

			let
				boxShadow;

			if (shadowOffset) {
				boxShadow = `${shadowOffset.x.px} ${shadowOffset.y.px} ${mixins.calcColor(effect)}`;
			}

			res.checkbox = {
				width: width.px,
				height: height.px,

				border,
				borderRadius: borderRadius || (ch.type === 'ELLIPSE' ? '100%' : 'none'),

				backgroundColor,
				boxShadow
			};
		}

		if (ch.name === 'check') {
			res.check = {
				width: width.px,
				height: height.px,

				border,
				borderRadius: borderRadius || (ch.type === 'ELLIPSE' ? '100%' : 'none'),

				color: backgroundColor
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
				const
					style = <string>$C(RAW.styles).get(`${el.styles.text}.name`);

				labelBound = $C(el).get('absoluteBoundingBox');
				common.textStyle = textNameNormalizer(style);
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
	exterior(name: string, el: Figma.Node): Dictionary {
		const
			res: {block: Dictionary; mods?: Dictionary} = {
				block: checkboxCommon(el.children)
			};

		if (name === 'switch') {
			$C(el.children).forEach((c) => {
				if (c.name === 'check') {
					const checkStyles = {
						backgroundColor: (<Dictionary>res.block.check).color
					};

					Object.assign(<Dictionary>res.block.check, checkStyles);
				}

				if (/m:\w+/.test(c.name)) {
					const
						name = c.name.replace('m:', '');

					if (!res.mods) {
						res.mods = {};
					}

					(<Dictionary>res.mods)[name] = convertMod(name, c, 'bCheckbox', el);

					if (name === 'checked') {
						const
							back = <Figma.Node>$C(c.children).one.get((el) => el.name === 'checkerBack'),
							check = <Figma.Node>$C(c.children).one.get((el) => el.name === 'check');

						if (back && check) {
							const
								x = (check.absoluteBoundingBox.x - (back.absoluteBoundingBox.x + (back.strokeWeight || 0))).px;

							// @ts-ignore
							res.mods.checked.true.check.transform = `translateX(${x})`;
						}
					}
				}
			});
		}

		return res;
	}
};
