import { afterEach, describe, expect, test } from "bun:test";

import { TouchHandler } from "../../src/input/TouchHandler";
import type { Point, Rect } from "../../src/types";

const originalDateNow = Date.now;
const pageRect: Rect = { x: 0, y: 0, width: 200, height: 120 };

afterEach(() => {
	Date.now = originalDateNow;
});

describe("TouchHandler", () => {
	test("handles touch drag lifecycle, swipe detection, and reset", () => {
		let now = 100;
		Date.now = () => now;

		const handler = new TouchHandler({
			pageRect,
			cornerSize: 20,
			swipeDistance: 30,
		});
		expect(handler.getState().handled).toBe(false);

		expect(handler.onTouchStart([])).toEqual(handler.getState());

		const start = handler.onTouchStart([{ x: 10, y: 10, identifier: 1 }]);
		expect(start).toMatchObject({
			handled: true,
			corner: "top",
			touchId: 1,
		});

		expect(
			handler.onTouchMove([{ x: 40, y: 10, identifier: 2 }]),
		).toMatchObject(start);

		now = 140;
		const moved = handler.onTouchMove([{ x: 50, y: 10, identifier: 1 }]);
		expect(moved.isDragging).toBe(true);
		expect(moved.handled).toBe(true);
		expect(moved.dragDistance).toBeGreaterThanOrEqual(10);
		expect(handler.shouldPreventDefault()).toBe(true);

		now = 180;
		const ended = handler.onTouchEnd([{ x: 70, y: 10, identifier: 1 }]);
		expect(ended.handled).toBe(true);
		expect(ended.swipeDirection).toBe("right");
		expect(ended.velocity).toBeGreaterThan(0);
		expect(handler.getFlipDirectionFromSwipe()).toBe("prev");
		expect(handler.getState().touchId).toBeNull();

		handler.reset();
		expect(handler.getState()).toEqual({
			handled: false,
			corner: null,
			startPoint: null,
			currentPoint: null,
			isDragging: false,
			dragDistance: 0,
			velocity: 0,
			swipeDirection: null,
			touchId: null,
		});
	});

	test("handles touch cancel, non-swipe endings, config updates, and helpers", () => {
		let now = 200;
		Date.now = () => now;

		const handler = new TouchHandler({
			pageRect,
			cornerSize: 20,
			preventDefaultOnDrag: false,
			enableSwipe: false,
		});

		expect(handler.shouldPreventDefault()).toBe(false);
		expect(handler.hitTestCorner({ x: 5, y: 5 })).toBe("top");
		expect(handler.hitTestCorner({ x: 195, y: 5 })).toBe("top");
		expect(handler.hitTestCorner({ x: 5, y: 115 })).toBe("bottom");
		expect(handler.hitTestCorner({ x: 195, y: 115 })).toBe("bottom");
		expect(handler.hitTestCorner({ x: 50, y: 50 })).toBeNull();
		expect(handler.getFlipDirectionFromSwipe()).toBeNull();

		handler.setConfig({
			swipeDistance: 15,
			enableSwipe: true,
			preventDefaultOnDrag: true,
		});
		handler.setPageRect({ x: 10, y: 10, width: 100, height: 100 });

		now = 220;
		handler.onTouchStart([{ x: 15, y: 105, identifier: 3 }]);
		const cancelled = handler.onTouchCancel();
		expect(cancelled.corner).toBe("bottom");
		expect(handler.getState().touchId).toBeNull();

		now = 300;
		handler.onTouchStart([{ x: 15, y: 15, identifier: 4 }]);
		now = 320;
		handler.onTouchMove([{ x: 22, y: 16, identifier: 4 }]);
		now = 340;
		const ended = handler.onTouchEnd([{ x: 28, y: 16, identifier: 4 }]);
		expect(ended.swipeDirection).toBeNull();
		expect(handler.getFlipDirectionFromSwipe()).toBeNull();

		const orphanEnd = handler.onTouchEnd([{ x: 99, y: 99, identifier: 999 }]);
		expect(orphanEnd.touchId).toBeNull();
	});
});
