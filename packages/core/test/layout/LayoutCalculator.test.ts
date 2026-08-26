import { describe, expect, test } from "bun:test";

import { DEFAULT_PAGE_CORNER_SIZE } from "../../src/constants";
import {
	DEFAULT_CONSTRAINTS,
	LayoutCalculator,
	type LayoutConstraints,
} from "../../src/layout/LayoutCalculator";
import type { PageFlipConfig, Rect } from "../../src/types";

const containerRect: Rect = {
	x: 0,
	y: 0,
	width: 400,
	height: 600,
};

describe("LayoutCalculator", () => {
	test("calculates fixed layout from config", () => {
		const calculator = new LayoutCalculator();
		const config: PageFlipConfig = {
			width: 200,
			height: 400,
			showCover: true,
			usePortrait: true,
		};

		expect(calculator.calculate(containerRect, config)).toEqual({
			pageWidth: 200,
			pageHeight: 400,
			scale: 1.5,
			offsetX: 50,
			offsetY: 0,
			orientation: "portrait",
			isCoverVisible: true,
			containerRect,
			pageRect: {
				x: 50,
				y: 0,
				width: 300,
				height: 600,
			},
		});
	});

	test("updates constraints and applies them in stretch mode", () => {
		const calculator = new LayoutCalculator({
			minWidth: 250,
			maxWidth: 350,
		});

		calculator.setConstraints({
			minHeight: 450,
			maxHeight: 550,
		});

		const result = calculator.calculate(
			{ x: 0, y: 0, width: 500, height: 700 },
			{
				width: 100,
				height: 100,
				size: "stretch",
			},
		);

		expect(result.pageWidth).toBe(350);
		expect(result.pageHeight).toBe(550);
		expect(result.scale).toBe(700 / 550);
		expect(result.offsetX).toBeCloseTo((500 - 350 * (700 / 550)) / 2, 10);
		expect(result.offsetY).toBe(0);
		expect(result.orientation).toBe("portrait");
		expect(result.isCoverVisible).toBe(false);
	});

	test("prefers config constraints over instance constraints and can force landscape", () => {
		const calculator = new LayoutCalculator({
			minWidth: 1000,
			maxWidth: 1200,
			minHeight: 1000,
			maxHeight: 1200,
		});

		const result = calculator.calculate(
			{ x: 0, y: 0, width: 300, height: 500 },
			{
				width: 200,
				height: 400,
				size: "stretch",
				minWidth: 220,
				maxWidth: 260,
				minHeight: 300,
				maxHeight: 320,
				usePortrait: false,
			},
		);

		expect(result.pageWidth).toBe(260);
		expect(result.pageHeight).toBe(320);
		expect(result.orientation).toBe("landscape");
		expect(result.scale).toBe(300 / 260);
	});

	test("calculates fixed layout directly and supports landscape orientation", () => {
		const calculator = new LayoutCalculator();

		expect(
			calculator.calculateFixed(
				{ x: 0, y: 0, width: 600, height: 400 },
				{ width: 500, height: 300 },
				true,
			),
		).toEqual({
			pageWidth: 500,
			pageHeight: 300,
			scale: 1.2,
			offsetX: 0,
			offsetY: 20,
			orientation: "landscape",
			isCoverVisible: false,
			containerRect: { x: 0, y: 0, width: 600, height: 400 },
			pageRect: {
				x: 0,
				y: 20,
				width: 600,
				height: 360,
			},
		});
	});

	test("calculates stretch layout directly with clamped dimensions", () => {
		const calculator = new LayoutCalculator();
		const constraints: LayoutConstraints = {
			minWidth: 250,
			maxWidth: 300,
			minHeight: 200,
			maxHeight: 260,
		};

		const result = calculator.calculateStretch(
			{ x: 0, y: 0, width: 200, height: 500 },
			constraints,
			false,
		);

		expect(result).toEqual({
			pageWidth: 250,
			pageHeight: 260,
			scale: 0.8,
			offsetX: 0,
			offsetY: 146,
			orientation: "landscape",
			isCoverVisible: false,
			containerRect: { x: 0, y: 0, width: 200, height: 500 },
			pageRect: {
				x: 0,
				y: 146,
				width: 200,
				height: 208,
			},
		});
	});

	test("calculates corner hit areas with default and custom sizes", () => {
		const calculator = new LayoutCalculator();
		const pageRect: Rect = { x: 10, y: 20, width: 100, height: 200 };

		const defaultAreas = calculator.calculateCornerHitAreas(pageRect);
		const customAreas = calculator.calculateCornerHitAreas(pageRect, 12);

		expect(defaultAreas.get("top-left")).toEqual({
			x: 10,
			y: 20,
			width: DEFAULT_PAGE_CORNER_SIZE,
			height: DEFAULT_PAGE_CORNER_SIZE,
		});
		expect(customAreas.get("top-right")).toEqual({
			x: 98,
			y: 20,
			width: 12,
			height: 12,
		});
		expect(customAreas.get("bottom-left")).toEqual({
			x: 10,
			y: 208,
			width: 12,
			height: 12,
		});
		expect(customAreas.get("bottom-right")).toEqual({
			x: 98,
			y: 208,
			width: 12,
			height: 12,
		});
	});

	test("hit tests each corner and returns null for misses", () => {
		const calculator = new LayoutCalculator();
		const pageRect: Rect = { x: 100, y: 100, width: 80, height: 120 };

		expect(calculator.hitTestCorner({ x: 100, y: 100 }, pageRect, 16)).toBe(
			"top-left",
		);
		expect(calculator.hitTestCorner({ x: 180, y: 100 }, pageRect, 16)).toBe(
			"top-right",
		);
		expect(calculator.hitTestCorner({ x: 100, y: 220 }, pageRect, 16)).toBe(
			"bottom-left",
		);
		expect(calculator.hitTestCorner({ x: 180, y: 220 }, pageRect, 16)).toBe(
			"bottom-right",
		);
		expect(
			calculator.hitTestCorner({ x: 140, y: 160 }, pageRect, 16),
		).toBeNull();
	});

	test("returns page bounds unchanged", () => {
		const calculator = new LayoutCalculator();
		const layout = calculator.calculateFixed(containerRect, {
			width: 200,
			height: 300,
		});

		expect(calculator.getPageBounds(layout, 2, 10)).toBe(layout.pageRect);
	});

	test("exports default constraints based on shared constants", () => {
		expect(DEFAULT_CONSTRAINTS).toEqual({
			minWidth: 200,
			maxWidth: 4000,
			minHeight: 200,
			maxHeight: 4000,
		});
	});
});
