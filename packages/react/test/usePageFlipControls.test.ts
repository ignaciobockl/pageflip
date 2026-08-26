import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createElement } from "react";
import { type Root, createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";

import { usePageFlipControls } from "../src/hooks/usePageFlipControls";

describe("usePageFlipControls", () => {
	let container: HTMLDivElement;
	let root: Root | null;

	beforeEach(() => {
		root = null;
		container = document.createElement("div");
		document.body.append(container);
		root = createRoot(container);
	});

	afterEach(() => {
		root?.unmount();
		container.remove();
	});

	test("maps navigation methods to the instance API", async () => {
		const calls: unknown[][] = [];
		const instance = {
			pageCount: 12,
			currentPageIndex: 4,
			orientation: "landscape",
			state: "flipping",
			bounds: { x: 0, y: 0, width: 0, height: 0 },
			flipNext: async (...args: unknown[]) => {
				calls.push(["flipNext", ...args]);
			},
			flipPrev: async (...args: unknown[]) => {
				calls.push(["flipPrev", ...args]);
			},
			flip: async (...args: unknown[]) => {
				calls.push(["flip", ...args]);
			},
			turnToPage: async (...args: unknown[]) => {
				calls.push(["turnToPage", ...args]);
			},
			turnToNextPage: async () => {
				calls.push(["turnToNextPage"]);
			},
			turnToPrevPage: async () => {
				calls.push(["turnToPrevPage"]);
			},
			loadFromHtml: async () => {},
			loadFromImages: async () => {},
			loadFromSources: async () => {},
			updateFromHtml: async () => {},
			updateFromImages: async () => {},
			setRenderer: async () => {},
			getRenderer: () => ({}),
			destroy: () => {},
			updateConfig: () => {},
		} as Parameters<typeof usePageFlipControls>[0];

		let controls: ReturnType<typeof usePageFlipControls> | null = null;

		function Harness() {
			controls = usePageFlipControls(instance);
			return null;
		}

		await act(async () => {
			root?.render(createElement(Harness));
		});

		await controls?.flipNext("top-right");
		await controls?.flipPrev("top-left");
		await controls?.flipTo(8, "bottom-right");
		await controls?.goTo(2);
		await controls?.next();
		await controls?.prev();

		expect(calls).toEqual([
			["flipNext", "top-right"],
			["flipPrev", "top-left"],
			["flip", 8, "bottom-right"],
			["turnToPage", 2],
			["turnToNextPage"],
			["turnToPrevPage"],
		]);
		expect(controls?.getCurrentPage()).toBe(4);
		expect(controls?.getPageCount()).toBe(12);
		expect(controls?.getOrientation()).toBe("landscape");
		expect(controls?.getState()).toBe("flipping");
	});

	test("returns safe defaults when there is no instance", async () => {
		let controls: ReturnType<typeof usePageFlipControls> | null = null;

		function Harness() {
			controls = usePageFlipControls(null);
			return null;
		}

		await act(async () => {
			root?.render(createElement(Harness));
		});

		expect(controls?.getCurrentPage()).toBe(-1);
		expect(controls?.getPageCount()).toBe(0);
		expect(controls?.getOrientation()).toBe("portrait");
		expect(controls?.getState()).toBe("idle");
	});
});
