import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { createRef } from "react";
import { flushSync } from "react-dom";
import { type Root, createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { act } from "react-dom/test-utils";

import { PageFlip } from "../src/components/PageFlip";

const flush = async () => {
	await Promise.resolve();
	await Promise.resolve();
};

class MockFlipEngine extends EventTarget {
	public static shouldThrow = false;
	public static instances: MockFlipEngine[] = [];

	public pageCount = 0;
	public currentPageIndex = 0;
	public orientation = "portrait" as const;
	public state = "idle" as const;
	public bounds = {
		left: 0,
		top: 0,
		width: 800,
		height: 600,
		x: 0,
		y: 0,
		right: 800,
		bottom: 600,
	};
	public destroyed = false;
	public readonly container: HTMLElement;
	public readonly config: Record<string, unknown>;
	public readonly loadFromHtmlCalls: HTMLElement[][] = [];

	public constructor(container: HTMLElement, config: Record<string, unknown>) {
		super();
		this.container = container;
		this.config = config;
		MockFlipEngine.instances.push(this);
	}

	public static reset(): void {
		MockFlipEngine.shouldThrow = false;
		MockFlipEngine.instances = [];
	}

	public async flipNext(): Promise<void> {}
	public async flipPrev(): Promise<void> {}
	public async flip(): Promise<void> {}
	public async turnToPage(): Promise<void> {}
	public async turnToNextPage(): Promise<void> {}
	public async turnToPrevPage(): Promise<void> {}

	public async loadFromHtml(elements: HTMLElement[]): Promise<void> {
		if (MockFlipEngine.shouldThrow) {
			throw new Error("load failed");
		}

		this.loadFromHtmlCalls.push(elements);
		this.pageCount = elements.length;
	}

	public async loadFromImages(urls: string[]): Promise<void> {
		if (MockFlipEngine.shouldThrow || urls.includes("error")) {
			throw new Error("load failed");
		}
		this.pageCount = urls.length;
	}

	public async loadFromSources(sources: unknown[]): Promise<void> {
		if (MockFlipEngine.shouldThrow) {
			throw new Error("load failed");
		}
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
	public updateConfig(): void {}
}

mock.module("@pageflip/core", () => ({
	FlipEngine: MockFlipEngine,
}));

describe("PageFlip", () => {
	let container: HTMLDivElement;
	let root: Root | null;

	beforeEach(() => {
		root = null;
		container = document.createElement("div");
		document.body.append(container);
		root = createRoot(container);
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
		MockFlipEngine.reset();
	});

	test("renders loading state before client initialization and then loads children", async () => {
		flushSync(() => {
			root?.render(
				<PageFlip width={800} height={600}>
					<div>Page 1</div>
					<div>Page 2</div>
				</PageFlip>,
			);
		});

		expect(container.innerHTML).toContain('aria-busy="true"');

		await act(async () => {
			await flush();
		});

		expect(container.querySelector(".pf-book")).not.toBeNull();
		expect(container.innerHTML).toContain('data-total-pages="2"');
		expect(MockFlipEngine.instances).toHaveLength(1);
		expect(MockFlipEngine.instances[0]?.loadFromHtmlCalls[0]).toHaveLength(2);
	});

	test("forwards the instance through refs", async () => {
		const ref = createRef<MockFlipEngine | null>();

		await act(async () => {
			root?.render(
				<PageFlip ref={ref} width={800} height={600} images={["1.png"]} />,
			);
			await flush();
		});

		expect(ref.current).toBe(MockFlipEngine.instances[0] ?? null);
	});

	test("supports SSR without accessing client-only APIs", () => {
		const html = renderToString(
			<PageFlip width={800} height={600}>
				<div>SSR page</div>
			</PageFlip>,
		);

		expect(html).toContain('aria-busy="true"');
		expect(html).toContain("Loading flip book");
	});

	test("renders an error state when initialization fails", async () => {
		await act(async () => {
			root?.render(<PageFlip width={800} height={600} images={["error"]} />);
			await flush();
		});

		expect(container.textContent).toContain(
			"Failed to load flip book: load failed",
		);
		expect(container.querySelector(".pf--error")).not.toBeNull();
	});
});
