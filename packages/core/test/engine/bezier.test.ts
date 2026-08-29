import { describe, expect, test } from "bun:test";

import {
	calculateFoldAngle,
	calculateFoldCurve,
	calculateFoldProgress,
	cubicBezierEase,
	easeInOutStrong,
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

	test("easeInOutStrong clamps endpoints and is monotonic", () => {
		expect(easeInOutStrong(0)).toBe(0);
		expect(easeInOutStrong(1)).toBe(1);
		expect(easeInOutStrong(-0.5)).toBe(0);
		expect(easeInOutStrong(1.5)).toBe(1);

		let previous = 0;
		for (let step = 0; step <= 10; step += 1) {
			const value = easeInOutStrong(step / 10);
			expect(value).toBeGreaterThanOrEqual(previous);
			previous = value;
		}
	});

	test("cubicBezierEase resolves standard curves", () => {
		expect(cubicBezierEase(0, 0.77, 0, 0.175, 1)).toBe(0);
		expect(cubicBezierEase(1, 0.77, 0, 0.175, 1)).toBe(1);
		expect(cubicBezierEase(0.5, 0.42, 0, 0.58, 1)).toBeCloseTo(0.5, 2);
	});
});
