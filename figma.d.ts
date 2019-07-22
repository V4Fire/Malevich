/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

declare namespace Figma {
	interface File {
		name: string;
		lastModified: string;
		thumbnailURL: string;
		version: string;
		document: Node;
		components: Map<string, Component>;
		schemaVersion: number;
		styles: Styles;
	}

	type Node<T extends NodeType = NodeType> = {
		id: string;
		name: string;
		visible: boolean;
		type: T;
	} & NodeTypes[T];

	interface NodeTypes {
		DOCUMENT: DOCUMENT;
		CANVAS: CANVAS;
		FRAME: FRAME;
		GROUP: GROUP;
		VECTOR: VECTOR;
		BOOLEAN: BOOLEAN;
		BOOLEAN_OPERATION: BOOLEAN_OPERATION;
		STAR: STAR;
		LINE: LINE;
		ELLIPSE: ELLIPSE;
		REGULAR_POLYGON: REGULAR_POLYGON;
		RECTANGLE: RECTANGLE;
		TEXT: TEXT;
		SLICE: SLICE;
		COMPONENT: COMPONENT;
		INSTANCE: INSTANCE;
	}

	type NodeType = keyof NodeTypes;

	interface DOCUMENT {
		children: Node[];
	}

	interface CANVAS {
		children: Node[];
		backgroundColor: Color;
		exportSettings: ExportSetting[];
	}

	interface ExportSetting {
		suffix: string;
		format: ImageType;
		constraint: Constrain;
	}

	interface Color {
		r: number;
		g: number;
		b: number;
		a: number;
	}

	type Styles = Dictionary<StyleType, string>;

	interface Constrain {
		type: ConstrainType;
		value: number;
	}

	interface Component {
		key: string;
		name: string;
		description: string;
	}

	interface Style {
		key: string;
		name: string;
		style_type: StyleType;
	}

	type ImageType = 'JPG' | 'PNG' | 'SVG';
	type ConstrainType = 'SCALE' | 'WIDTH' | 'HEIGHT';
	type StyleType = 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
	type PathWindingRule = 'EVENODD' | 'NONZERO';
	type StrokeAlign = 'INSIDE' | 'OUTSIDE' | 'CENTER';
	type BooleanOperation = 'UNION' | 'INTERSECT' | 'SUBTRACT' | 'EXCLUDE';

	interface Path {
		path: string;
		windingRule: PathWindingRule;
	}

	interface NODE_BASE {
		name: string;
		exportSettings: ExportSetting[];
		blendMode: BlendMode;
		preserveRatio: boolean;
		constraints: LayoutConstraint;

		transitionNodeID?: string | null;
		transitionDuration?: number | null;
		transitionEasing?: EasingType | null;

		absoluteBoundingBox: Rectangle;
		size?: Vector;

		opacity: number;
		effects: Effect[];
		isMask: boolean;

		relativeTransform?: Transform;
	}

	interface FRAME extends NODE_BASE {
		children: Node[];
		background: Paint[];
		backgroundColor: Color;

		clipsContent: boolean;
		layoutGrids?: LayoutGrid[];
	}

	type GROUP = FRAME;
	type COMPONENT = FRAME;
	type STAR = VECTOR;
	type LINE = VECTOR;
	type ELLIPSE = VECTOR;
	type SLICE = NODE_BASE;
	type REGULAR_POLYGON = VECTOR;

	interface INSTANCE extends FRAME {
		componentId: string;
	}

	interface VECTOR extends NODE_BASE {
		fills: Paint[];
		fillGeometry: Path[];
		strokes: Paint[];
		strokeWeight: number;
		strokeGeometry: Path[];
		strokeAlign: StrokeAlign;
		styles: Styles;
	}

	interface RECTANGLE extends VECTOR {
		cornerRadius: number;
		rectangleCornerRadii: number;
	}

	interface BOOLEAN_OPERATION extends VECTOR {
		children: Node[];
		booleanOperation: BooleanOperation;
	}

	interface TEXT extends VECTOR {
		characters: string;
		style: TypeStyle;
		characterStyleOverrides: number[];
		styleOverrideTable: Dictionary<number, TypeStyle>;
	}

	type Transform = number[][];
	type ConstraintVertical = 'TOP' | 'BOTTOM' | 'CENTER' | 'TOP_BOTTOM' | 'SCALE';
	type ConstraintHorizontal = 'LEFT' | 'RIGHT' | 'CENTER' | 'LEFT_RIGHT' | 'SCALE';
	type EasingType =  'EASE_IN' | 'EASE_OUT' | 'EASE_IN_AND_OUT';
	type EffectType = 'INNER_SHADOW' | 'DROP_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
	type ScaleMode = 'FILL' | 'FIT' | 'TILE' | 'STRETCH';
	type TextCase = 'UPPER' | 'LOWER' | 'TITLE';
	type TextDecoration = 'STRIKETHROUGH' | 'UNDERLINE';
	type TextAlignHorizontal = 'LEFT' | 'RIGHT' | 'CENTER' | 'JUSTIFY';
	type TextAlignVertical = 'TOP' | 'CENTER' | 'BOTTOM';
	type LineHeightUnit = 'PIXELS' | 'FONT_SIZE_%' | 'INTRINSIC_%';
	type PaintType =
		'SOLID' |
		'GRADIENT_LINEAR' |
		'GRADIENT_RADIAL' |
		'GRADIENT_ANGULAR' |
		'GRADIENT_DIAMOND' |
		'IMAGE' |
		'EMOJI';

	interface TypeStyle {
		fontFamily: string;
		fontPostScriptName: string;
		paragraphSpacing: number;
		paragraphIndent: number;
		italic: boolean;
		fontWeight: number;
		fontSize: number;
		textCase: TextCase;
		textDecoration: TextDecoration;
		textAlignHorizontal: TextAlignHorizontal;
		textAlignVertical: TextAlignVertical;
		letterSpacing: number;
		fills: Paint[];
		lineHeightPx: number;
		lineHeightPercent: number;
		lineHeightPercentFontSize: number;
		lineHeightUnit: LineHeightUnit;
	}

	interface ColorStop {
		position: number;
		color: Color;
	}

	interface Paint {
		type: PaintType;
		visible: boolean;
		opacity: number;
		color: Color;
		blendMode: BlendMode;

		gradientHandlePositions: Vector[];
		gradientStops: ColorStop[];

		scaleMode: ScaleMode;
		imageTransformTransform?: Transform;
		scalingFactor?: number;
		imageRef: string;
	}

	interface Effect {
		type: EffectType;
		offset: Vector;
		radius: number;
		visible: boolean;
		color: Color;
		blendMode: BlendMode;
	}

	interface LayoutConstraint {
		vertical: ConstraintVertical;
		horizontal: ConstraintHorizontal;
	}

	interface Rectangle extends Vector {
		width: number;
		height: number;
	}

	interface Vector {
		x: number;
		y: number;
	}

	interface LayoutGrid {
		pattern: LayoutGridPattern;
		sectionSize: number;
		visible: boolean;
		color: Color;

		alignment: LayoutGridAlignment;
		gutterSize: number;
		offset: number;

		count: number;
	}

	type LayoutGridPattern = 'COLUMNS' | 'ROWS' | 'GRID';
	type LayoutGridAlignment = 'MIN' | 'MAX' | 'CENTER';

	enum BlendMode {
		PASS_THROUGH = 'PASS_THROUGH',
		NORMAL = 'NORMAL',

		DARKEN = 'DARKEN',
		MULTIPLY = 'MULTIPLY',
		LINEAR_BURN = 'LINEAR_BURN',
		COLOR_BURN = 'COLOR_BURN',

		LIGHTEN = 'LIGHTEN',
		SCREEN = 'SCREEN',
		LINEAR_DODGE = 'LINEAR_DODGE',
		COLOR_DODGE = 'COLOR_DODGE',

		OVERLAY = 'OVERLAY',
		SOFT_LIGHT = 'SOFT_LIGHT',
		HARD_LIGHT = 'HARD_LIGHT',

		DIFFERENCE = 'DIFFERENCE',
		EXCLUSION = 'EXCLUSION',

		HUE = 'HUE',
		SATURATION = 'SATURATION',
		COLOR = 'COLOR',
		LUMINOSITY = 'LUMINOSITY'
	}
}
