import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createElement } from "react";
import { type Root, createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";

import { usePageFlipState } from "../src/hooks/usePageFlipState";

class MockPageFlipInstance extends EventTarget {
	public pageCount = 6;
	public currentPageIndex = 1;
	public orientation = "portrait" as const;
	public state = "idle" as const;
	public bounds = { x: 0, y: 0, width: 800, height: 600 };

	public async flipNext(): Promise<void> {}
	public async flipPrev(): Promise<void> {}
	public async flip(): Promise<void> {}
	public async turnToPage(): Promise<void> {}
	public async turnToNextPage(): Promise<void> {}
	public async turnToPrevPage(): Promise<void> {}
	public async loadFromHtml(): Promise<void> {}
	public async loadFromImages(): Promise<void> {}
	public async loadFromSources(): Promise<void> {}
	public async updateFromHtml(): Promise<void> {}
	public async updateFromImages(): Promise<void> {}
	public async setRenderer(): Promise<void> {}
	public getRenderer() {
		return {};
	}
	public destroy(): void {}
	public updateConfig(): void {}
}

describe("usePageFlipState", () => {
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

	test("subscribes to flip, state, orientation, and update events", async () => {
		const instance = new MockPageFlipInstance();

		function Harness({ current }: { current: MockPageFlipInstance | null }) {
			const state = usePageFlipState(current);
			return createElement("output", null, JSON.stringify(state));
		}

		await act(async () => {
			root?.render(createElement(Harness, { current: instance }));
		});

		expect(container.textContent).toContain('"currentPage":1');
		expect(container.textContent).toContain('"pageCount":6');

		instance.currentPageIndex = 3;
		instance.dispatchEvent(
			new CustomEvent("flip", { detail: { pageIndex: 3 } }),
		);

		await act(async () => {});
		expect(container.textContent).toContain('"currentPage":3');

		instance.state = "flipping";
		instance.dispatchEvent(
			new CustomEvent("statechange", {
				detail: {
					state: "flipping",
					previousState: "idle",
					timestamp: Date.now(),
				},
			}),
		);

		await act(async () => {});
		expect(container.textContent).toContain('"state":"flipping"');
		expect(container.textContent).toContain('"isFlipping":true');

		instance.orientation = "landscape";
		instance.dispatchEvent(
			new CustomEvent("orientationchange", {
				detail: {
					orientation: "landscape",
					previousOrientation: "portrait",
					timestamp: Date.now(),
				},
			}),
		);

		await act(async () => {});
		expect(container.textContent).toContain('"orientation":"landscape"');

		instance.pageCount = 8;
		instance.dispatchEvent(new CustomEvent("update", { detail: instance }));

		await act(async () => {});
		expect(container.textContent).toContain('"pageCount":8');
	});

	test("resets to defaults when the instance becomes null", async () => {
		const instance = new MockPageFlipInstance();

		function Harness({ current }: { current: MockPageFlipInstance | null }) {
			const state = usePageFlipState(current);
			return createElement("output", null, JSON.stringify(state));
		}

		await act(async () => {
			root?.render(createElement(Harness, { current: instance }));
		});

		await act(async () => {
			root?.render(createElement(Harness, { current: null }));
		});

		expect(container.textContent).toBe(
			'{"currentPage":0,"pageCount":0,"orientation":"portrait","state":"idle","isFlipping":false,"bounds":null}',
		);
	});
});
