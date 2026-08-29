import { describe, expect, test } from "bun:test";

import {
	DEFAULT_CONSTRAINTS,
	clampRectToConstraints,
	clampSizeToConstraints,
	createConstraintsFromConfig,
	mergeConstraints,
	rectFitsConstraints,
	sizeFitsConstraints,
	validateConstraints,
} from "../../src/layout/Constraints";

describe("Constraints", () => {
	test("validates constraints with defaults, clamping, and min/max reconciliation", () => {
		expect(validateConstraints({})).toEqual(DEFAULT_CONSTRAINTS);
		expect(
			validateConstraints({
				minWidth: 100,
				maxWidth: 5000,
				minHeight: 4500,
				maxHeight: 100,
			}),
		).toEqual({
			minWidth: 200,
			maxWidth: 4000,
			minHeight: 200,
			maxHeight: 200,
		});

		expect(
			validateConstraints({
				minWidth: 900,
				maxWidth: 600,
				minHeight: 700,
				maxHeight: 500,
			}),
		).toEqual({
			minWidth: 600,
			maxWidth: 600,
			minHeight: 500,
			maxHeight: 500,
		});
	});

	test("checks and clamps sizes against constraints", () => {
		const constraints = {
			minWidth: 200,
			maxWidth: 400,
			minHeight: 300,
			maxHeight: 500,
		};

		expect(sizeFitsConstraints({ width: 250, height: 450 }, constraints)).toBe(
			true,
		);
		expect(sizeFitsConstraints({ width: 150, height: 450 }, constraints)).toBe(
			false,
		);
		expect(
			clampSizeToConstraints({ width: 100, height: 700 }, constraints),
		).toEqual({
			width: 200,
			height: 500,
		});
	});

	test("checks and clamps rects while preserving position", () => {
		const constraints = {
			minWidth: 200,
			maxWidth: 400,
			minHeight: 300,
			maxHeight: 500,
		};

		expect(
			rectFitsConstraints({ x: 1, y: 2, width: 400, height: 300 }, constraints),
		).toBe(true);
		expect(
			rectFitsConstraints({ x: 1, y: 2, width: 401, height: 299 }, constraints),
		).toBe(false);
		expect(
			clampRectToConstraints(
				{ x: 10, y: 20, width: 100, height: 600 },
				constraints,
			),
		).toEqual({
			x: 10,
			y: 20,
			width: 200,
			height: 500,
		});
	});

	test("merges constraints using the most restrictive values", () => {
		expect(
			mergeConstraints(
				{ minWidth: 250, maxWidth: 800, minHeight: 350, maxHeight: 900 },
				{ minWidth: 300, maxWidth: 600 },
				{ minHeight: 500, maxHeight: 700 },
			),
		).toEqual({
			minWidth: 300,
			maxWidth: 600,
			minHeight: 500,
			maxHeight: 700,
		});

		expect(mergeConstraints({ minWidth: 900, maxWidth: 600 })).toEqual({
			minWidth: 600,
			maxWidth: 600,
			minHeight: 200,
			maxHeight: 4000,
		});
	});

	test("creates validated constraints from config", () => {
		expect(
			createConstraintsFromConfig({
				minWidth: 100,
				maxWidth: 450,
				minHeight: 250,
				maxHeight: 5000,
			}),
		).toEqual({
			minWidth: 200,
			maxWidth: 450,
			minHeight: 250,
			maxHeight: 4000,
		});
	});
});
