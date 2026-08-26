import { describe, expect, test } from "bun:test";

import {
	DEFAULT_LIGHT_ANGLE,
	calculateCreaseShadow,
	calculatePageEdgeShadow,
	calculateShadowParams,
	calculateStackShadow,
} from "../../src/engine/shadow";

describe("shadow engine math", () => {
	test("computes fold shadows", () => {
		const rect = { x: 0, y: 0, width: 120, height: 240 };
		const shadow = calculateShadowParams(0.5, rect, DEFAULT_LIGHT_ANGLE, 0.5);
		expect(shadow.blur).toBe(25);
		expect(shadow.color).toBe("rgba(0, 0, 0, 0.5)");
	});

	test("computes edge and crease shadows", () => {
		const rect = { x: 0, y: 0, width: 100, height: 200 };
		expect(calculatePageEdgeShadow(rect, false, 0.5)).toEqual({
			color: "rgba(0, 0, 0, 0)",
			offsetX: 0,
			offsetY: 0,
			blur: 0,
		});
		expect(calculatePageEdgeShadow(rect, true, 0.5)).toEqual({
			color: "rgba(0, 0, 0, 0.15)",
			offsetX: 1,
			offsetY: 2,
			blur: 8,
		});
		expect(calculateCreaseShadow(0.5, rect)).toEqual({
			color: "rgba(0, 0, 0, 0.4)",
			offsetX: 0,
			offsetY: 0,
			blur: 25,
		});
	});

	test("softens stack shadows by depth", () => {
		const stack = calculateStackShadow(1, 4, {
			color: "rgba(0, 0, 0, 0.4)",
			offsetX: 0,
			offsetY: 0,
			blur: 10,
		});
		expect(stack.color).toBe("rgba(0, 0, 0, 0.15000000000000002)");
		expect(stack.blur).toBe(12);
	});
});
