import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { createElement } from "react";
import { type Root, createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";

import { usePageFlip } from "../src/hooks/usePageFlip";

const flush = async () => {
	await Promise.resolve();
	await Promise.resolve();
};

class MockFlipEngine extends EventTarget {
	public static instances: MockFlipEngine[] = [];

	public pageCount = 0;
	public currentPageIndex = 0;
	public orientation = "portrait" as const;
	public state = "idle" as const;
	public bounds = { x: 0, y: 0, width: 800, height: 600 };
	public destroyed = false;
	public readonly updatedConfigs: Record<string, unknown>[] = [];

	public constructor() {
		super();
		MockFlipEngine.instances.push(this);
	}

	public static reset(): void {
		MockFlipEngine.instances = [];
	}

	public async flipNext(): Promise<void> {}
	public async flipPrev(): Promise<void> {}
	public async flip(): Promise<void> {}
	public async turnToPage(): Promise<void> {}
	public async turnToNextPage(): Promise<void> {}
	public async turnToPrevPage(): Promise<void> {}
	public async loadFromHtml(elements: HTMLElement[]): Promise<void> {
		this.pageCount = elements.length;
	}
	public async loadFromImages(urls: string[]): Promise<void> {
		this.pageCount = urls.length;
	}
	public async loadFromSources(sources: unknown[]): Promise<void> {
		this.pageCount = sources.length;
	}
	public async updateFromHtml(): Promise<void> {}
	public async updateFromImages(): Promise<void> {}
	public async setRenderer(): Promise<void> {}
	public getRenderer() {
		return {};
	}
	public destroy(): void {
		this.destroyed = true;
	}
	public updateConfig(config: Record<string, unknown>): void {
		this.updatedConfigs.push(config);
	}
}

mock.module("@pageflip/core", () => ({
	FlipEngine: MockFlipEngine,
}));

describe("usePageFlip", () => {
	let container: HTMLDivElement;
	let root: Root | null;
	let latestHook: ReturnType<typeof usePageFlip> | null = null;

	function Harness() {
		latestHook = usePageFlip({
			width: 800,
			height: 600,
			images: ["1.png", "2.png"],
		});

		return createElement("div", { ref: latestHook.ref });
	}

	beforeEach(() => {
		root = null;
		container = document.createElement("div");
		document.body.append(container);
		root = createRoot(container);
		latestHook = null;
		MockFlipEngine.reset();
	});

	afterEach(async () => {
		if (!root) {
			return;
		}

		await act(async () => {
			root.unmount();
			await flush();
		});
		container.remove();
		latestHook = null;
		MockFlipEngine.reset();
	});

	test("creates an instance and exposes it through the hook", async () => {
		await act(async () => {
			root?.render(createElement(Harness));
			await flush();
		});

		expect(MockFlipEngine.instances).toHaveLength(1);
		expect(latestHook?.instance).toBe(MockFlipEngine.instances[0] ?? null);
		expect(latestHook?.loading).toBe(false);
		expect(latestHook?.error).toBeNull();
	});

	test("reload destroys the current instance, updates config, and creates a new one", async () => {
		await act(async () => {
			root?.render(createElement(Harness));
			await flush();
		});

		const firstInstance = MockFlipEngine.instances[0];

		await act(async () => {
			await latestHook?.reload({ maxWidth: 1024 });
			await flush();
		});

		expect(firstInstance?.updatedConfigs).toEqual([{ maxWidth: 1024 }]);
		expect(firstInstance?.destroyed).toBe(true);
		expect(MockFlipEngine.instances).toHaveLength(2);
		expect(latestHook?.instance).toBe(MockFlipEngine.instances[1] ?? null);
	});

	test("cleans up the instance on unmount", async () => {
		await act(async () => {
			root?.render(createElement(Harness));
			await flush();
		});

		const instance = MockFlipEngine.instances[0];

		await act(async () => {
			root?.unmount();
			await flush();
		});

		expect(instance?.destroyed).toBe(true);
	});
});
