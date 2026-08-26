import { afterEach, describe, expect, test } from "bun:test";

import { InputManager } from "../../src/input/InputManager";
import type { InputEvent } from "../../src/input/InputManager";

const originalDateNow = Date.now;
const originalConsoleError = console.error;

function createKeyboardEvent(key: string) {
	const event = {
		key,
		ctrlKey: false,
		shiftKey: false,
		altKey: false,
		metaKey: false,
		preventDefault() {},
	};

	return event as KeyboardEvent;
}

function createWheelEvent(overrides: Partial<WheelEvent> = {}) {
	return {
		deltaX: 0,
		deltaY: 0,
		deltaMode: 0,
		ctrlKey: false,
		shiftKey: false,
		metaKey: false,
		preventDefault() {},
		...overrides,
	} as WheelEvent;
}

afterEach(() => {
	Date.now = originalDateNow;
	console.error = originalConsoleError;
});

describe("InputManager", () => {
	test("integrates mouse, keyboard, wheel, config propagation, and reset", () => {
		let now = 100;
		Date.now = () => now;

		const manager = new InputManager({
			pageRect: { x: 0, y: 0, width: 100, height: 100 },
			cornerSize: 15,
			dragThreshold: 10,
		});
		const events: InputEvent[] = [];
		const errors: unknown[][] = [];

		console.error = (...args: unknown[]) => {
			errors.push(args);
		};

		const unsubscribe = manager.onInput((event) => {
			events.push(event);
		});
		manager.onInput(() => {
			throw new Error("boom");
		});

		expect(manager.getMouseHandler()).toBeDefined();
		expect(manager.getTouchHandler()).toBeDefined();
		expect(manager.getKeyboardHandler()).toBeDefined();
		expect(manager.getWheelHandler()).toBeDefined();
		expect(manager.isCurrentlyDragging()).toBe(false);
		expect(manager.getActiveCorner()).toBeNull();

		manager.onMouseDown({ x: 5, y: 5 });
		expect(manager.isCurrentlyDragging()).toBe(true);
		expect(manager.getActiveCorner()).toBe("top");

		now = 110;
		manager.onMouseMove({ x: 30, y: 20 });
		now = 120;
		manager.onMouseUp();

		now = 130;
		manager.onMouseDown({ x: 60, y: 60 });
		now = 140;
		manager.onMouseUp();

		manager.getMouseHandler().setConfig({ doubleClickAction: true });
		now = 150;
		manager.onDoubleClick({ x: 40, y: 40 });

		now = 160;
		manager.onKeyDown(createKeyboardEvent("ArrowLeft"));
		now = 170;
		manager.onWheel(createWheelEvent({ deltaY: 20, ctrlKey: true }));
		now = 190;
		manager.onWheel(createWheelEvent({ deltaX: 60 }));

		expect(events.map((event) => event.type)).toEqual([
			"dragStart",
			"dragMove",
			"dragEnd",
			"click",
			"doubleClick",
			"keyAction",
			"wheelZoom",
			"wheelScroll",
		]);
		expect(events[3]?.keyboardAction).toBe("next");
		expect(events[4]?.keyboardAction).toBe("zoomReset");
		expect(events[5]?.keyboardAction).toBe("prev");
		expect(events[6]?.zoomDelta).toBeLessThan(0);
		expect(events[7]?.scrollDirection).toBe("right");
		expect(errors).toHaveLength(events.length);
		expect(errors[0]?.[0]).toBe("[InputManager] Listener error:");

		unsubscribe();
		const countBeforeUnsubscribedEvent = events.length;
		now = 210;
		manager.onKeyDown(createKeyboardEvent("Home"));
		expect(events).toHaveLength(countBeforeUnsubscribedEvent);

		manager.setConfig({
			pageRect: { x: 10, y: 10, width: 120, height: 120 },
			cornerSize: 20,
			clickToFlip: false,
			swipeDistance: 15,
			enableKeyboard: false,
			enableWheelZoom: false,
			enableHorizontalScroll: false,
		});
		manager.setPageRect({ x: 20, y: 20, width: 140, height: 140 });
		expect(manager.getMouseHandler().getPageRect()).toEqual({
			x: 20,
			y: 20,
			width: 140,
			height: 140,
		});
		expect(manager.getKeyboardHandler().getActionForKey("ArrowRight")).toBe(
			"none",
		);
		expect(manager.getWheelHandler().isZoomEnabled()).toBe(false);
		expect(manager.getWheelHandler().isHorizontalScrollEnabled()).toBe(false);

		manager.onMouseDown({ x: 80, y: 80 });
		manager.onMouseUp();
		manager.reset();
		expect(manager.isCurrentlyDragging()).toBe(false);
		expect(manager.getActiveCorner()).toBeNull();
		expect(manager.getKeyboardHandler().getActionForKey("ArrowRight")).toBe(
			"none",
		);
	});

	test("integrates touch start, move, end, cancel, and swipe flows", () => {
		let now = 300;
		Date.now = () => now;

		const manager = new InputManager({
			pageRect: { x: 0, y: 0, width: 100, height: 100 },
			cornerSize: 20,
			swipeDistance: 20,
		});
		const events: InputEvent[] = [];
		manager.onInput((event) => {
			events.push(event);
		});

		manager.onTouchStart([{ x: 10, y: 10, identifier: 1 }]);
		now = 320;
		manager.onTouchMove([{ x: 40, y: 12, identifier: 1 }]);
		now = 340;
		manager.onTouchEnd([{ x: 70, y: 12, identifier: 1 }]);

		now = 360;
		manager.onTouchStart([{ x: 10, y: 90, identifier: 2 }]);
		now = 380;
		manager.onTouchMove([{ x: 14, y: 91, identifier: 2 }]);
		now = 400;
		manager.onTouchCancel();

		expect(events.map((event) => event.type)).toEqual([
			"dragStart",
			"dragMove",
			"swipe",
			"dragStart",
			"dragMove",
			"dragEnd",
		]);
		expect(events[2]?.swipeDirection).toBe("prev");
		expect(events[5]?.corner).toBe("bottom");
		expect(manager.isCurrentlyDragging()).toBe(false);
		expect(manager.getActiveCorner()).toBeNull();

		manager.onMouseLeave();
	});
});
