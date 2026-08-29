import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { createElement } from "react";
import { type Root, createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";

import { usePageFlipEvents } from "../src/hooks/usePageFlipEvents";

class MockPageFlipInstance extends EventTarget {
	public pageCount = 0;
	public currentPageIndex = 0;
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

describe("usePageFlipEvents", () => {
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

	test("binds typed event handlers and cleans them up on unmount", async () => {
		const instance = new MockPageFlipInstance();
		const onFlip = mock();
		const onChangeState = mock();
		const onChangeOrientation = mock();
		const onInit = mock();
		const onUpdate = mock();
		const onError = mock();

		function Harness() {
			usePageFlipEvents(instance, {
				onFlip,
				onChangeState,
				onChangeOrientation,
				onInit,
				onUpdate,
				onError,
			});

			return null;
		}

		await act(async () => {
			root?.render(createElement(Harness));
		});

		const error = new Error("boom");

		instance.dispatchEvent(
			new CustomEvent("flip", {
				detail: {
					pageIndex: 2,
					direction: "forward",
					corner: "top-right",
					timestamp: Date.now(),
				},
			}),
		);
		instance.dispatchEvent(
			new CustomEvent("statechange", {
				detail: {
					state: "flipping",
					previousState: "idle",
					timestamp: Date.now(),
				},
			}),
		);
		instance.dispatchEvent(
			new CustomEvent("orientationchange", {
				detail: {
					orientation: "landscape",
					previousOrientation: "portrait",
					timestamp: Date.now(),
				},
			}),
		);
		instance.dispatchEvent(new CustomEvent("init", { detail: instance }));
		instance.dispatchEvent(new CustomEvent("update", { detail: instance }));
		instance.dispatchEvent(new CustomEvent("error", { detail: error }));

		expect(onFlip).toHaveBeenCalledWith(
			expect.objectContaining({ pageIndex: 2, direction: "forward" }),
		);
		expect(onChangeState).toHaveBeenCalledWith(
			expect.objectContaining({ state: "flipping" }),
		);
		expect(onChangeOrientation).toHaveBeenCalledWith(
			expect.objectContaining({ orientation: "landscape" }),
		);
		expect(onInit).toHaveBeenCalledWith(instance);
		expect(onUpdate).toHaveBeenCalledWith(instance);
		expect(onError).toHaveBeenCalledWith(error);

		await act(async () => {
			root?.unmount();
		});

		instance.dispatchEvent(
			new CustomEvent("flip", { detail: { pageIndex: 4 } }),
		);
		expect(onFlip).toHaveBeenCalledTimes(1);
	});
});
