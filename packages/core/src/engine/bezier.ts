/**
 * Bezier Curve Mathematics.
 *
 * Pure mathematical functions for quadratic bezier curves
 * used in page fold simulation.
 * @packageDocumentation
 */
import { DEFAULT_PAGE_CORNER_SIZE } from "../constants";
import type { BezierCurve, FlipCorner, Point, Rect } from "../types";

/**
 * Calculate point on quadratic bezier curve at parameter t.
 */
export function quadraticBezierPoint(
	t: number,
	p0: Point,
	p1: Point,
	p2: Point,
): Point {
	const u = 1 - t;
	return {
		x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
		y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
	};
}

/**
 * Calculate derivative (tangent) of quadratic bezier at parameter t.
 */
export function quadraticBezierTangent(
	t: number,
	p0: Point,
	p1: Point,
	p2: Point,
): Point {
	const u = 1 - t;
	return {
		x: 2 * u * (p1.x - p0.x) + 2 * t * (p2.x - p1.x),
		y: 2 * u * (p1.y - p0.y) + 2 * t * (p2.y - p1.y),
	};
}

/**
 * Calculate fold curve for page flip animation.
 */
export function calculateFoldCurve(
	pageRect: Rect,
	corner: FlipCorner,
	progress: number,
	foldAngle: number,
): BezierCurve {
	const angleRad = (foldAngle * Math.PI) / 180;
	const foldDepth = Math.sin(angleRad) * pageRect.height * 0.5;
	const controlOffset = foldDepth * progress;
	const edgeY = corner === "top" ? 0 : pageRect.height;
	return {
		start: { x: 0, y: edgeY },
		control: {
			x: pageRect.width * 0.5,
			y: corner === "top" ? -controlOffset : pageRect.height + controlOffset,
		},
		end: { x: pageRect.width, y: edgeY },
	};
}

/**
 * Calculate page corner hit test area.
 */
export function getCornerHitArea(
	pageRect: Rect,
	corner: FlipCorner,
	cornerSize: number = DEFAULT_PAGE_CORNER_SIZE,
): Rect {
	return {
		x: corner === "top" ? pageRect.x : pageRect.x + pageRect.width - cornerSize,
		y:
			corner === "top" ? pageRect.y : pageRect.y + pageRect.height - cornerSize,
		width: cornerSize,
		height: cornerSize,
	};
}

/**
 * Calculate fold angle from mouse/touch position.
 */
export function calculateFoldAngle(
	pageRect: Rect,
	corner: FlipCorner,
	point: Point,
): number {
	const cornerPoint =
		corner === "top"
			? { x: 0, y: 0 }
			: { x: pageRect.width, y: pageRect.height };
	const dx = point.x - cornerPoint.x;
	const dy = point.y - cornerPoint.y;
	const distance = Math.hypot(dx, dy);
	const maxDistance = Math.hypot(pageRect.width, pageRect.height);
	return Math.min(distance / maxDistance, 1) * 180;
}

/**
 * Calculate fold progress from angle.
 */
export function calculateFoldProgress(angle: number): number {
	return Math.min(Math.max(angle / 180, 0), 1);
}

/**
 * Interpolate between two points.
 */
export function lerpPoint(a: Point, b: Point, t: number): Point {
	return {
		x: a.x + (b.x - a.x) * t,
		y: a.y + (b.y - a.y) * t,
	};
}

/**
 * Strong ease-in-out curve (matching the design token `--pf-ease-in-out`).
 * Starts fast, decelerates late; suited for on-screen movement.
 */
export function easeInOutStrong(progress: number): number {
	const clamped = Math.min(Math.max(progress, 0), 1);
	return cubicBezierEase(clamped, 0.77, 0, 0.175, 1);
}

/**
 * Evaluate a cubic bezier easing curve at parameter t.
 *
 * Uses a single Newton iteration then falls back to binary search to
 * resolve x = t before sampling y, matching common CSS cubic-bezier
 * implementations.
 */
export function cubicBezierEase(
	t: number,
	p1x: number,
	p1y: number,
	p2x: number,
	p2y: number,
): number {
	const sampleCurveX = (value: number): number => {
		const u = 1 - value;
		return (
			3 * u * u * value * p1x +
			3 * u * value * value * p2x +
			value * value * value
		);
	};
	const sampleCurveY = (value: number): number => {
		const u = 1 - value;
		return (
			3 * u * u * value * p1y +
			3 * u * value * value * p2y +
			value * value * value
		);
	};
	const sampleCurveDerivativeX = (value: number): number => {
		const u = 1 - value;
		return (
			3 * u * u * p1x +
			6 * u * value * (p2x - p1x) +
			3 * value * value * (1 - p2x)
		);
	};

	if (t <= 0) return 0;
	if (t >= 1) return 1;

	let x = t;
	for (let iteration = 0; iteration < 8; iteration += 1) {
		const xEstimate = sampleCurveX(x) - t;
		const derivative = sampleCurveDerivativeX(x);
		if (Math.abs(xEstimate) < 1e-6) return sampleCurveY(x);
		if (Math.abs(derivative) < 1e-6) break;
		x -= xEstimate / derivative;
	}

	let lower = 0;
	let upper = 1;
	x = t;
	while (lower < upper) {
		const xEstimate = sampleCurveX(x);
		if (Math.abs(xEstimate - t) < 1e-6) return sampleCurveY(x);
		if (t < xEstimate) upper = x;
		else lower = x;
		x = (upper + lower) * 0.5;
	}
	return sampleCurveY(x);
}
