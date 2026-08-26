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
