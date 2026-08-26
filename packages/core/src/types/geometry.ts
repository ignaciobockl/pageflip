/**
 * 2D point coordinate.
 */
export type Point = {
	/** X coordinate in pixels. */
	x: number;
	/** Y coordinate in pixels. */
	y: number;
};

/**
 * Rectangle bounds.
 */
export type Rect = {
	/** Left position. */
	x: number;
	/** Top position. */
	y: number;
	/** Width in pixels. */
	width: number;
	/** Height in pixels. */
	height: number;
};

/**
 * Size dimensions.
 */
export type Size = {
	/** Width in pixels. */
	width: number;
	/** Height in pixels. */
	height: number;
};

/**
 * Bezier curve definition for page fold.
 */
export type BezierCurve = {
	/** Start point of curve. */
	start: Point;
	/** Control point of quadratic bezier. */
	control: Point;
	/** End point of curve. */
	end: Point;
};

/**
 * Shadow parameters for rendering.
 */
export type ShadowParams = {
	/** Shadow color (rgba). */
	color: string;
	/** Horizontal offset. */
	offsetX: number;
	/** Vertical offset. */
	offsetY: number;
	/** Blur radius. */
	blur: number;
};
