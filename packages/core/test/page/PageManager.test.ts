import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { PageManager } from "../../src/page/PageManager";
import type { PageSource } from "../../src/types";

const originalDateNow = Date.now;
const originalConsoleError = console.error;
const originalHTMLElement = globalThis.HTMLElement;
const originalImage = globalThis.Image;

class MockHTMLElement {
	public id = "";
}

class MockImage {
	public static pending = new Map<string, MockImage[]>();

	public onload: ((event: Event) => void) | null = null;
	public onerror: ((event: Event | string) => void) | null = null;

	private _src = "";

	public get src(): string {
		return this._src;
	}

	public set src(value: string) {
		this._src = value;

		if (value.startsWith("error:")) {
			queueMicrotask(() => {
				this.onerror?.(new Event("error"));
			});
			return;
		}

		if (value.startsWith("pending:")) {
			const images = MockImage.pending.get(value) ?? [];
			images.push(this);
			MockImage.pending.set(value, images);
			return;
		}

		queueMicrotask(() => {
			this.onload?.(new Event("load"));
		});
	}

	public static complete(src: string): void {
		for (const image of MockImage.pending.get(src) ?? []) {
			image.onload?.(new Event("load"));
		}

		MockImage.pending.delete(src);
	}

	public static reset(): void {
		MockImage.pending.clear();
	}
}

function createElement(id: string): HTMLElement {
	const element = new MockHTMLElement() as unknown as HTMLElement;
	element.id = id;
	return element;
}

describe("PageManager", () => {
	beforeEach(() => {
		let now = 0;
		Date.now = () => {
			now += 1;
			return now;
		};
		console.error = () => {};
		globalThis.HTMLElement = MockHTMLElement as unknown as typeof HTMLElement;
		globalThis.Image = MockImage as unknown as typeof Image;
		MockImage.reset();
	});

	afterEach(() => {
		Date.now = originalDateNow;
		console.error = originalConsoleError;
		globalThis.HTMLElement = originalHTMLElement;
		globalThis.Image = originalImage;
		MockImage.reset();
	});

	test("loadFromHtml populates pages and getters", async () => {
		const manager = new PageManager({ maxCacheSize: 10 });
		const elements = [createElement("page-0"), createElement("page-1")];

		const pages = await manager.loadFromHtml(elements, ["hard", "soft"]);

		expect(pages).toHaveLength(2);
		expect(pages[0]).toMatchObject({
			id: "page-0",
			index: 0,
			density: "hard",
			content: { type: "html", element: elements[0] },
			metadata: { sourceIndex: 0 },
		});
		expect(manager.getPage(0)).toEqual(pages[0]);
		expect(manager.getPage(10)).toBeNull();
		expect(manager.getAllPages()).toEqual(pages);
		expect(manager.getPageCount()).toBe(2);
		expect(manager.isPageLoaded(0)).toBe(true);
	});

	test("loadFromImages and loadFromSources expose status, cache stats, and memory usage", async () => {
		const imageManager = new PageManager({ maxCacheSize: 10 });

		const imagePages = await imageManager.loadFromImages([
			"cover.png",
			"error:broken",
		]);

		expect(imagePages).toHaveLength(2);
		expect(imagePages[0].content).toEqual({
			type: "image",
			src: "cover.png",
			alt: "Page 1",
		});
		expect(imageManager.getPageLoadStatus(0)).toEqual({
			loaded: true,
			error: null,
		});
		const failedStatus = imageManager.getPageLoadStatus(1);
		expect(failedStatus?.loaded).toBe(false);
		expect(failedStatus?.error?.message).toBe(
			"Failed to load image: error:broken",
		);

		const sourceManager = new PageManager({ maxCacheSize: 10 });
		const htmlElement = createElement("mixed-html");
		const sources: PageSource[] = [
			{
				type: "html",
				content: htmlElement,
				density: "hard",
				metadata: { chapter: 1 },
			},
			{
				type: "image",
				content: "page-2.png",
			},
			{
				type: "renderer",
				content: { page: 3 },
				rendererId: "canvas2d",
				metadata: "custom",
			},
		];

		const sourcePages = await sourceManager.loadFromSources(sources);

		expect(sourcePages).toEqual([
			{
				id: "page-0",
				index: 0,
				density: "hard",
				content: { type: "html", element: htmlElement },
				metadata: { chapter: 1, sourceIndex: 0 },
			},
			{
				id: "page-1",
				index: 1,
				density: "soft",
				content: { type: "image", src: "page-2.png" },
				metadata: { sourceIndex: 1, value: undefined },
			},
			{
				id: "page-2",
				index: 2,
				density: "soft",
				content: {
					type: "renderer",
					rendererId: "canvas2d",
					source: { page: 3 },
				},
				metadata: { sourceIndex: 2, value: "custom" },
			},
		]);
		expect(sourceManager.getMemoryUsage()).toBe(361472);
		expect(sourceManager.getCacheStats()).toEqual({
			size: 3,
			maxSize: 10,
			hitRate: 0,
			memoryUsage: 361472,
		});
	});

	test("updateFromHtml and updateFromImages replace page content and resize collections", async () => {
		const manager = new PageManager({ maxCacheSize: 10 });

		await manager.loadFromHtml([
			createElement("initial-0"),
			createElement("initial-1"),
		]);

		const updatedHtml = await manager.updateFromHtml([
			createElement("updated-0"),
			createElement("updated-1"),
			createElement("updated-2"),
		]);

		expect(updatedHtml).toHaveLength(3);
		expect(manager.getPageCount()).toBe(3);
		expect(manager.getPage(2)?.content).toEqual({
			type: "html",
			element:
				updatedHtml[2].content.type === "html"
					? updatedHtml[2].content.element
					: null,
		});

		const updatedImages = await manager.updateFromImages(["updated-0.png"]);

		expect(updatedImages).toHaveLength(1);
		expect(updatedImages[0].content).toEqual({
			type: "image",
			src: "updated-0.png",
			alt: "Page 1",
		});
		expect(manager.getAllPages()).toEqual(updatedImages);
		expect(manager.getPageCount()).toBe(1);
	});

	test("setCurrentPage preloads adjacent pages and ensurePageLoaded resolves pending pages", async () => {
		const preloadManager = new PageManager({ preloadAdjacent: true });
		const preloadCalls: number[] = [];

		(
			preloadManager as PageManager & {
				ensurePageLoaded(index: number): Promise<null>;
			}
		).ensurePageLoaded = async (index: number) => {
			preloadCalls.push(index);
			return null;
		};

		await preloadManager.loadFromHtml([
			createElement("page-0"),
			createElement("page-1"),
			createElement("page-2"),
		]);
		preloadManager.setCurrentPage(1);
		await Promise.resolve();

		expect(preloadCalls).toEqual([0, 2]);

		const manager = new PageManager({ maxCacheSize: 10 });
		const loading = manager.loadFromImages(["pending:page-0"]);

		expect(manager.isPageLoaded(0)).toBe(false);
		const ensuredPage = manager.ensurePageLoaded(0);
		MockImage.complete("pending:page-0");

		expect(await ensuredPage).toEqual({
			id: "page-0",
			index: 0,
			density: "soft",
			content: { type: "image", src: "pending:page-0", alt: "Page 1" },
			metadata: { sourceIndex: 0 },
		});
		await loading;
		expect(manager.isPageLoaded(0)).toBe(true);
	});

	test("clear and destroy remove pages and reset state", async () => {
		const manager = new PageManager({ maxCacheSize: 10 });
		let memoryPressureCalls = 0;

		manager.onMemoryPressure(() => {
			memoryPressureCalls += 1;
		});
		await manager.loadFromHtml([
			createElement("page-0"),
			createElement("page-1"),
		]);

		manager.clear();

		expect(manager.getAllPages()).toEqual([]);
		expect(manager.getPageCount()).toBe(0);
		expect(manager.getMemoryUsage()).toBe(0);

		manager.destroy();
		await manager.loadFromHtml([
			createElement("destroyed-0"),
			createElement("destroyed-1"),
		]);
		manager.setConfig({ maxCacheSize: 1 });

		expect(memoryPressureCalls).toBe(0);
	});

	test("evicts least recently used pages when cache limit is exceeded", async () => {
		const manager = new PageManager({ maxCacheSize: 10 });

		await manager.loadFromHtml([
			createElement("page-0"),
			createElement("page-1"),
			createElement("page-2"),
		]);

		expect(manager.getPage(0)?.id).toBe("page-0");
		expect(manager.getPage(2)?.id).toBe("page-2");

		manager.setConfig({ maxCacheSize: 2 });

		expect(manager.getPage(1)).toBeNull();
		expect(manager.getAllPages().map((page) => page.id)).toEqual([
			"page-0",
			"page-2",
		]);
		expect(manager.getCacheStats().size).toBe(2);
	});

	test("calls the memory pressure callback when cache eviction happens", async () => {
		const manager = new PageManager({ maxCacheSize: 10 });
		let memoryPressureCalls = 0;

		manager.onMemoryPressure(() => {
			memoryPressureCalls += 1;
		});
		await manager.loadFromHtml([
			createElement("page-0"),
			createElement("page-1"),
			createElement("page-2"),
		]);

		manager.setConfig({ maxCacheSize: 1 });

		expect(memoryPressureCalls).toBe(1);
		expect(manager.getAllPages()).toHaveLength(1);
	});
});
