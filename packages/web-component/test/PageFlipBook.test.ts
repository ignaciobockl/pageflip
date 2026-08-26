import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	mock,
	test,
} from "bun:test";

const flush = async () => {
	await Promise.resolve();
	await Promise.resolve();
};

class MockResizeObserver {
	public observe(): void {}
	public disconnect(): void {}
}

class MockMutationObserver {
	public constructor(private readonly callback: MutationCallback) {}

	public observe(): void {}
	public disconnect(): void {}
	public trigger(mutations: MutationRecord[] = []): void {
		this.callback(mutations, this as unknown as MutationObserver);
	}

	public takeRecords(): MutationRecord[] {
		return [];
	}

	public static instances: MockMutationObserver[] = [];
}

class MockFlipEngine extends EventTarget {
	public static instances: MockFlipEngine[] = [];

	public pageCount = 0;
	public currentPageIndex = 0;
	public orientation = "portrait" as const;
	public state = "idle";
	public bounds = {
		x: 10,
		y: 20,
		width: 800,
		height: 600,
	};
	public destroyed = false;
	public readonly container: HTMLElement;
	public readonly config: Record<string, unknown>;
	public readonly loadFromHtmlCalls: HTMLElement[][] = [];
	public readonly loadFromSourcesCalls: unknown[][] = [];
	public readonly updateConfigCalls: Record<string, unknown>[] = [];
	public readonly flipNextCalls: unknown[] = [];
	public readonly flipPrevCalls: unknown[] = [];
	public readonly flipCalls: Array<{ pageIndex: number; corner?: string }> = [];
	public readonly turnToPageCalls: number[] = [];
	public readonly turnToNextPageCalls: number[] = [];
	public readonly turnToPrevPageCalls: number[] = [];
	public readonly loadFromImagesCalls: string[][] = [];
	public readonly updateFromHtmlCalls: HTMLElement[][] = [];
	public readonly updateFromImagesCalls: string[][] = [];
	public readonly setRendererCalls: string[] = [];

	public constructor(container: HTMLElement, config: Record<string, unknown>) {
		super();
		this.container = container;
		this.config = config;
		MockFlipEngine.instances.push(this);
	}

	public static reset(): void {
		MockFlipEngine.instances = [];
	}

	public async flipNext(corner?: string): Promise<void> {
		this.flipNextCalls.push(corner);
	}

	public async flipPrev(corner?: string): Promise<void> {
		this.flipPrevCalls.push(corner);
	}

	public async flip(pageIndex: number, corner?: string): Promise<void> {
		this.flipCalls.push({ pageIndex, corner });
	}

	public async turnToPage(pageIndex: number): Promise<void> {
		this.turnToPageCalls.push(pageIndex);
	}

	public async turnToNextPage(): Promise<void> {
		this.turnToNextPageCalls.push(1);
	}

	public async turnToPrevPage(): Promise<void> {
		this.turnToPrevPageCalls.push(1);
	}

	public async loadFromHtml(elements: HTMLElement[]): Promise<void> {
		this.loadFromHtmlCalls.push(elements);
		this.pageCount = elements.length;
	}

	public async loadFromImages(urls: string[]): Promise<void> {
		this.loadFromImagesCalls.push(urls);
	}

	public async loadFromSources(sources: unknown[]): Promise<void> {
		this.loadFromSourcesCalls.push(sources);
		this.pageCount = sources.length;
	}

	public async updateFromHtml(elements: HTMLElement[]): Promise<void> {
		this.updateFromHtmlCalls.push(elements);
	}

	public async updateFromImages(urls: string[]): Promise<void> {
		this.updateFromImagesCalls.push(urls);
	}

	public async setRenderer(rendererId: string): Promise<void> {
		this.setRendererCalls.push(rendererId);
	}

	public updateConfig(config: Record<string, unknown>): void {
		this.updateConfigCalls.push(config);
	}

	public destroy(): void {
		this.destroyed = true;
	}
}

mock.module("@pageflip/core", () => ({
	FlipEngine: MockFlipEngine,
}));

const originalResizeObserver = globalThis.ResizeObserver;
const originalMutationObserver = globalThis.MutationObserver;

globalThis.ResizeObserver =
	MockResizeObserver as unknown as typeof ResizeObserver;
globalThis.MutationObserver = class extends MockMutationObserver {
	public constructor(callback: MutationCallback) {
		super(callback);
		MockMutationObserver.instances.push(this);
	}
} as unknown as typeof MutationObserver;

const { PAGE_FLIP_BOOK_TAG, PageFlipBook } = await import(
	"../src/PageFlipBook"
);

describe("PageFlipBook", () => {
	let host: HTMLDivElement;

	beforeEach(() => {
		host = document.createElement("div");
		document.body.append(host);
		MockFlipEngine.reset();
		MockMutationObserver.instances = [];
	});

	afterEach(() => {
		host.remove();
		MockFlipEngine.reset();
		MockMutationObserver.instances = [];
	});

	afterAll(() => {
		globalThis.ResizeObserver = originalResizeObserver;
		globalThis.MutationObserver = originalMutationObserver;
	});

	test("registers the custom element and renders shadow slots", () => {
		expect(customElements.get(PAGE_FLIP_BOOK_TAG)).toBe(PageFlipBook);

		const element = document.createElement("page-flip-book") as PageFlipBook;
		const slotNames = Array.from(
			element.shadowRoot?.querySelectorAll("slot") ?? [],
		).map((slot) => slot.getAttribute("name"));

		expect(slotNames).toEqual([
			"pages",
			"toolbar",
			"page-corner-top-left",
			"page-corner-top-right",
			"page-corner-bottom-left",
			"page-corner-bottom-right",
		]);
	});

	test("parses attributes, loads slotted pages, and emits init", async () => {
		const element = document.createElement("page-flip-book") as PageFlipBook;
		element.setAttribute("width", "960");
		element.setAttribute("height", "540");
		element.setAttribute("draw-shadow", "false");
		element.setAttribute("theme", "dark");
		element.setAttribute("aria-label", "Story book");

		const pages = document.createElement("div");
		pages.slot = "pages";
		pages.append(
			document.createElement("article"),
			document.createElement("article"),
		);
		element.append(pages);

		const initListener = mock(() => {});
		element.addEventListener("init", initListener as EventListener);

		host.append(element);
		await flush();

		const instance = MockFlipEngine.instances[0];
		expect(instance).toBeDefined();
		expect(instance?.config.width).toBe(960);
		expect(instance?.config.height).toBe(540);
		expect(instance?.config.drawShadow).toBe(false);
		expect(instance?.loadFromHtmlCalls[0]).toHaveLength(2);
		expect(element.getAttribute("data-theme")).toBe("dark");
		expect(
			element.shadowRoot?.querySelector(".pf-book")?.getAttribute("aria-label"),
		).toBe("Story book");
		expect(initListener).toHaveBeenCalledTimes(1);
		expect(
			element.shadowRoot?.querySelector(".pf-book__loading"),
		).toHaveProperty("style.display", "none");
		expect(element.shadowRoot?.querySelector(".pf-book__canvas")).toBeNull();
	});

	test("loads individually slotted pages in page order", async () => {
		const element = document.createElement("page-flip-book") as PageFlipBook;
		const pageTwo = document.createElement("div");
		pageTwo.slot = "page-2";
		pageTwo.textContent = "Page 3";
		const pageZero = document.createElement("div");
		pageZero.slot = "page-0";
		pageZero.textContent = "Page 1";
		element.append(pageTwo, pageZero);

		host.append(element);
		await flush();

		const sources = MockFlipEngine.instances[0]?.loadFromSourcesCalls[0] as
			| Array<{ metadata?: { pageIndex?: number } }>
			| undefined;

		expect(sources?.map((source) => source.metadata?.pageIndex)).toEqual([
			0, 2,
		]);
	});

	test("forwards engine events and proxies public API", async () => {
		const element = document.createElement("page-flip-book") as PageFlipBook;
		const pages = document.createElement("div");
		pages.slot = "pages";
		pages.append(document.createElement("div"));
		element.append(pages);
		host.append(element);
		await flush();

		const instance = MockFlipEngine.instances[0];
		if (!instance) {
			throw new Error("Missing mock instance");
		}

		instance.currentPageIndex = 3;
		instance.pageCount = 12;
		instance.orientation = "landscape";
		instance.state = "flipping";

		const flipListener = mock(() => {});
		element.addEventListener("flip", flipListener as EventListener);
		instance.dispatchEvent(
			new CustomEvent("flip", { detail: { pageIndex: 3 } }),
		);

		await element.flipNext("top-right");
		await element.flipPrev("bottom-left");
		await element.flip(5, "top-right");
		await element.turnToPage(4);
		await element.turnToNextPage();
		await element.turnToPrevPage();
		await element.loadFromHtml([document.createElement("section")]);
		await element.loadFromImages(["1.png"]);
		await element.loadFromSources([
			{ type: "image", content: "2.png" },
		] as never);
		await element.updateFromHtml([document.createElement("section")]);
		await element.updateFromImages(["3.png"]);
		await element.setRenderer("webgl");
		element.updateConfig({ showCover: true });

		expect(flipListener).toHaveBeenCalledTimes(1);
		expect((flipListener.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
			pageIndex: 3,
		});
		expect(instance.flipNextCalls).toEqual(["top-right"]);
		expect(instance.flipPrevCalls).toEqual(["bottom-left"]);
		expect(instance.flipCalls).toEqual([{ pageIndex: 5, corner: "top-right" }]);
		expect(instance.turnToPageCalls).toEqual([4]);
		expect(instance.turnToNextPageCalls).toHaveLength(1);
		expect(instance.turnToPrevPageCalls).toHaveLength(1);
		expect(instance.loadFromImagesCalls).toEqual([["1.png"]]);
		expect(instance.updateFromHtmlCalls).toHaveLength(1);
		expect(instance.updateFromImagesCalls).toEqual([["3.png"]]);
		expect(instance.setRendererCalls).toEqual(["webgl"]);
		expect(instance.updateConfigCalls.at(-1)).toMatchObject({
			showCover: true,
		});
		expect(element.currentPageIndex).toBe(3);
		expect(element.pageCount).toBe(12);
		expect(element.orientation).toBe("landscape");
		expect(element.state).toBe("flipping");
		expect(element.bounds).toBeInstanceOf(DOMRect);
		expect(element.bounds?.width).toBe(800);
	});

	test("updates config after attribute changes and destroys cleanly", async () => {
		const element = document.createElement("page-flip-book") as PageFlipBook;
		const pages = document.createElement("div");
		pages.slot = "pages";
		pages.append(document.createElement("div"));
		element.append(pages);
		host.append(element);
		await flush();

		const instance = MockFlipEngine.instances[0];
		element.setAttribute("flipping-time", "1500");

		expect(instance?.updateConfigCalls.at(-1)).toMatchObject({
			flippingTime: 1500,
		});

		element.destroy();

		expect(instance?.destroyed).toBe(true);
		expect(element.isConnected).toBe(false);
	});
});
