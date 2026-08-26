import { describe, expect, test } from "bun:test";

import {
	calculateFoldAngle,
	calculateFoldCurve,
	calculateFoldProgress,
	getCornerHitArea,
	lerpPoint,
	quadraticBezierPoint,
	quadraticBezierTangent,
} from "../../src/engine/bezier";

describe("bezier engine math", () => {
	test("computes bezier points and tangents", () => {
		expect(
			quadraticBezierPoint(0, { x: 0, y: 0 }, { x: 5, y: 10 }, { x: 10, y: 0 }),
		).toEqual({ x: 0, y: 0 });
		expect(
			quadraticBezierTangent(
				0.5,
				{ x: 0, y: 0 },
				{ x: 5, y: 10 },
				{ x: 10, y: 0 },
			),
		).toEqual({ x: 10, y: 0 });
	});

	test("creates fold geometry and hit areas", () => {
		const rect = { x: 0, y: 0, width: 100, height: 200 };
		expect(calculateFoldCurve(rect, "top", 0.5, 90).control).toEqual({
			x: 50,
			y: -50,
		});
		expect(getCornerHitArea(rect, "bottom", 20)).toEqual({
			x: 80,
			y: 180,
			width: 20,
			height: 20,
		});
	});

	test("maps points to fold angle and progress", () => {
		const rect = { x: 0, y: 0, width: 100, height: 100 };
		expect(calculateFoldAngle(rect, "top", { x: 0, y: 0 })).toBe(0);
		expect(calculateFoldProgress(270)).toBe(1);
		expect(lerpPoint({ x: 0, y: 0 }, { x: 10, y: 20 }, 0.5)).toEqual({
			x: 5,
			y: 10,
		});
	});
});
