import { describe, expect, test } from "bun:test";

import { MouseHandler } from "../../src/input/MouseHandler";
import type { Point, Rect } from "../../src/types";

const pageRect: Rect = { x: 10, y: 20, width: 200, height: 100 };

describe("MouseHandler", () => {
	test("handles mouse drag lifecycle and reset flows", () => {
		const handler = new MouseHandler({
			pageRect,
			cornerSize: 20,
			dragThreshold: 10,
		});

		expect(handler.getPageRect()).toEqual(pageRect);
		expect(handler.getState()).toEqual({
			handled: false,
			corner: null,
			startPoint: null,
			currentPoint: null,
			isDragging: false,
			dragDistance: 0,
			clickPoint: null,
		});

		expect(handler.onMouseDown({ x: 100, y: 60 })).toEqual(handler.getState());

		const start = { x: 15, y: 25 };
		expect(handler.onMouseDown(start)).toEqual({
			handled: true,
			corner: "top",
			startPoint: start,
			currentPoint: start,
			isDragging: false,
			dragDistance: 0,
			clickPoint: null,
		});

		expect(handler.onMouseMove({ x: 20, y: 28 })).toMatchObject({
			handled: false,
			isDragging: false,
		});

		const moved = handler.onMouseMove({ x: 40, y: 55 });
		expect(moved.handled).toBe(true);
		expect(moved.isDragging).toBe(true);
		expect(moved.dragDistance).toBeGreaterThanOrEqual(10);

		expect(handler.onMouseUp()).toEqual(moved);
		expect(handler.getState()).toEqual({
			handled: false,
			corner: null,
			startPoint: null,
			currentPoint: null,
			isDragging: false,
			dragDistance: 0,
			clickPoint: null,
		});

		handler.onMouseDown({ x: 15, y: 115 });
		expect(handler.onMouseLeave()).toMatchObject({
			handled: true,
			corner: "bottom",
		});
		handler.reset();
		expect(handler.getState().handled).toBe(false);
	});

	test("handles click, double click, config updates, and hit testing", () => {
		const handler = new MouseHandler({
			pageRect,
			cornerSize: 20,
			clickToFlip: false,
			doubleClickAction: false,
		});

		const clickPoint: Point = { x: 25, y: 30 };
		expect(handler.onClick(clickPoint)).toMatchObject({ handled: false });
		expect(handler.onDoubleClick(clickPoint)).toMatchObject({ handled: false });

		handler.setConfig({
			clickToFlip: true,
			doubleClickAction: true,
			cornerSize: 10,
		});
		expect(handler.onClick(clickPoint)).toEqual({
			handled: true,
			corner: null,
			startPoint: null,
			currentPoint: null,
			isDragging: false,
			dragDistance: 0,
			clickPoint,
		});

		const doubleClickPoint: Point = { x: 180, y: 80 };
		expect(handler.onDoubleClick(doubleClickPoint)).toMatchObject({
			handled: true,
			clickPoint: doubleClickPoint,
		});

		handler.setPageRect({ x: 0, y: 0, width: 100, height: 100 });
		expect(handler.getPageRect()).toEqual({
			x: 0,
			y: 0,
			width: 100,
			height: 100,
		});
		expect(handler.hitTestCorner({ x: 5, y: 5 })).toBe("top");
		expect(handler.hitTestCorner({ x: 95, y: 5 })).toBe("top");
		expect(handler.hitTestCorner({ x: 5, y: 95 })).toBe("bottom");
		expect(handler.hitTestCorner({ x: 95, y: 95 })).toBe("bottom");
		expect(handler.hitTestCorner({ x: 50, y: 50 })).toBeNull();
		expect(handler.getFlipDirectionFromClick({ x: 49, y: 50 })).toBe("prev");
		expect(handler.getFlipDirectionFromClick({ x: 50, y: 50 })).toBe("next");
	});
});
