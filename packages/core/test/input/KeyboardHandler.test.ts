import { describe, expect, test } from "bun:test";

import { KeyboardHandler } from "../../src/input/KeyboardHandler";

function createKeyboardEvent(
	key: string,
	overrides: Partial<KeyboardEvent> = {},
) {
	const event = {
		key,
		ctrlKey: false,
		shiftKey: false,
		altKey: false,
		metaKey: false,
		preventDefaultCalled: false,
		preventDefault() {
			this.preventDefaultCalled = true;
		},
		...overrides,
	};

	return event as KeyboardEvent & { preventDefaultCalled: boolean };
}

describe("KeyboardHandler", () => {
	test("maps default shortcuts and prevents default for handled keys", () => {
		const handler = new KeyboardHandler();
		const event = createKeyboardEvent("ArrowRight", {
			ctrlKey: true,
			shiftKey: true,
		});

		expect(handler.getActionForKey("ArrowRight")).toBe("next");
		expect(handler.getActionForKey("ArrowLeft")).toBe("prev");
		expect(handler.getActionForKey("Home")).toBe("first");
		expect(handler.getActionForKey("End")).toBe("last");
		expect(handler.getActionForKey("+")).toBe("zoomIn");
		expect(handler.getActionForKey("-")).toBe("zoomOut");
		expect(handler.getActionForKey("0")).toBe("zoomReset");
		expect(handler.getActionForKey("f")).toBe("fullscreen");

		expect(handler.onKeyDown(event)).toEqual({
			handled: true,
			action: "next",
			key: "ArrowRight",
			ctrlKey: true,
			shiftKey: true,
			altKey: false,
			metaKey: false,
		});
		expect(event.preventDefaultCalled).toBe(true);
		expect(handler.getShortcuts().get("arrowright")).toBe("next");
	});

	test("supports custom keys, enable/disable toggles, and default reset", () => {
		const handler = new KeyboardHandler({
			enableNavigation: false,
			enableZoom: false,
			enableFullscreen: false,
			enableFirstLast: false,
			customKeys: { n: ["next"], p: ["prev"] },
		});

		expect(handler.getActionForKey("ArrowRight")).toBe("none");
		expect(handler.getActionForKey("n")).toBe("next");

		const ignored = createKeyboardEvent("z");
		expect(handler.onKeyDown(ignored)).toEqual({
			handled: false,
			action: "none",
			key: "z",
			ctrlKey: false,
			shiftKey: false,
			altKey: false,
			metaKey: false,
		});
		expect(ignored.preventDefaultCalled).toBe(false);

		handler.addCustomKey("Z", "zoomReset");
		expect(handler.getActionForKey("z")).toBe("zoomReset");
		handler.removeCustomKey("z");
		expect(handler.getActionForKey("z")).toBe("none");

		handler.setNavigationEnabled(true);
		handler.setZoomEnabled(true);
		handler.setFullscreenEnabled(true);
		handler.setConfig({ enableFirstLast: true });
		expect(handler.getActionForKey("ArrowRight")).toBe("next");
		expect(handler.getActionForKey("+")).toBe("zoomIn");
		expect(handler.getActionForKey("f")).toBe("fullscreen");
		expect(handler.getActionForKey("Home")).toBe("first");

		handler.resetToDefaults();
		expect(handler.getActionForKey("n")).toBe("none");
		expect(handler.getActionForKey("ArrowRight")).toBe("next");
	});
});
