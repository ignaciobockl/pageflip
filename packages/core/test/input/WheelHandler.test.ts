import { afterEach, describe, expect, test } from "bun:test";

import { WheelHandler } from "../../src/input/WheelHandler";

const originalDateNow = Date.now;

function createWheelEvent(overrides: Partial<WheelEvent> = {}) {
	const event = {
		deltaX: 0,
		deltaY: 0,
		deltaMode: 0,
		ctrlKey: false,
		shiftKey: false,
		metaKey: false,
		preventDefaultCalled: false,
		preventDefault() {
			this.preventDefaultCalled = true;
		},
		...overrides,
	};

	return event as WheelEvent & { preventDefaultCalled: boolean };
}

afterEach(() => {
	Date.now = originalDateNow;
});

describe("WheelHandler", () => {
	test("handles zoom and scroll events with normalization and getters", () => {
		let now = 100;
		Date.now = () => now;

		const handler = new WheelHandler({
			zoomSensitivity: 0.01,
			scrollThreshold: 40,
			debounceMs: 10,
			minZoom: 0.5,
			maxZoom: 3,
		});

		const zoomEvent = createWheelEvent({
			deltaY: 5,
			deltaMode: 1,
			ctrlKey: true,
		});
		expect(handler.onWheel(zoomEvent)).toEqual({
			handled: true,
			action: "zoom",
			zoomDelta: -0.8,
			scrollDirection: null,
			ctrlKey: true,
			shiftKey: false,
			metaKey: false,
		});
		expect(zoomEvent.preventDefaultCalled).toBe(true);
		expect(handler.getZoomConfig()).toEqual({
			minZoom: 0.5,
			maxZoom: 3,
			sensitivity: 0.01,
		});
		expect(handler.isZoomEnabled()).toBe(true);
		expect(handler.isHorizontalScrollEnabled()).toBe(true);

		now = 120;
		const horizontalEvent = createWheelEvent({ deltaX: -2, deltaMode: 2 });
		expect(handler.onWheel(horizontalEvent)).toEqual({
			handled: true,
			action: "scroll",
			zoomDelta: 0,
			scrollDirection: "left",
			ctrlKey: false,
			shiftKey: false,
			metaKey: false,
		});
		expect(horizontalEvent.preventDefaultCalled).toBe(true);

		now = 140;
		expect(handler.onWheel(createWheelEvent({ deltaY: 50 }))).toEqual({
			handled: true,
			action: "scroll",
			zoomDelta: 0,
			scrollDirection: "down",
			ctrlKey: false,
			shiftKey: false,
			metaKey: false,
		});

		now = 160;
		expect(handler.onWheel(createWheelEvent({ deltaY: -45 }))).toEqual({
			handled: true,
			action: "scroll",
			zoomDelta: 0,
			scrollDirection: "up",
			ctrlKey: false,
			shiftKey: false,
			metaKey: false,
		});
	});

	test("supports debouncing, config updates, disabled modes, and reset", () => {
		let now = 200;
		Date.now = () => now;

		const handler = new WheelHandler({
			enableZoom: false,
			enableHorizontalScroll: false,
			scrollThreshold: 30,
			debounceMs: 50,
		});

		expect(handler.isZoomEnabled()).toBe(false);
		expect(handler.isHorizontalScrollEnabled()).toBe(false);

		expect(handler.onWheel(createWheelEvent({ deltaY: 20 }))).toEqual({
			handled: false,
			action: "none",
			zoomDelta: 0,
			scrollDirection: null,
			ctrlKey: false,
			shiftKey: false,
			metaKey: false,
		});

		now = 220;
		expect(handler.onWheel(createWheelEvent({ deltaY: 15 }))).toEqual({
			handled: false,
			action: "none",
			zoomDelta: 0,
			scrollDirection: null,
			ctrlKey: false,
			shiftKey: false,
			metaKey: false,
		});

		handler.setConfig({
			enableZoom: true,
			enableHorizontalScroll: true,
			debounceMs: 0,
			scrollThreshold: 10,
		});
		now = 280;
		const debouncedFlush = handler.onWheel(createWheelEvent({ deltaX: 1 }));
		expect(debouncedFlush.scrollDirection).toBe("down");

		handler.reset();
		now = 300;
		expect(
			handler.onWheel(createWheelEvent({ deltaX: 20 })).scrollDirection,
		).toBe("right");
		now = 320;
		const zoomEvent = createWheelEvent({ deltaY: 10, ctrlKey: true });
		expect(handler.onWheel(zoomEvent).action).toBe("zoom");
	});
});
