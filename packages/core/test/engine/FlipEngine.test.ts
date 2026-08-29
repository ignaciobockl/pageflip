import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { EVENT_NAMES } from "../../src/constants";
import { FlipEngine } from "../../src/engine/FlipEngine";

const originalDocument = globalThis.document;
const originalWindow = globalThis.window;
const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;

class MockElement extends EventTarget {
	public readonly children: MockElement[] = [];
	public readonly style: Record<string, string> = {};
	public parent: MockElement | null = null;
	public tabIndex = 0;

	public appendChild<T extends MockElement>(child: T): T {
		child.parent = this;
		this.children.push(child);
		return child;
	}

	public querySelector(selector: string): MockElement | null {
		return selector === "canvas"
			? (this.children.find((child) => child instanceof MockCanvasElement) ??
					null)
			: null;
	}

	public remove(): void {
		if (!this.parent) {
			return;
		}
		this.parent.children.splice(this.parent.children.indexOf(this), 1);
		this.parent = null;
	}

	public getBoundingClientRect(): DOMRect {
		return {
			x: 0,
			y: 0,
			left: 0,
			top: 0,
			right: 0,
			bottom: 0,
			width: 0,
			height: 0,
			toJSON: () => null,
		} as DOMRect;
	}

	public set innerHTML(_value: string) {
		this.children.length = 0;
	}
}

class MockCanvasElement extends MockElement {
	public width = 0;
	public height = 0;

	public getContext(): CanvasRenderingContext2D {
		return {
			clearRect() {},
			setTransform() {},
		} as CanvasRenderingContext2D;
	}
}

function createContainer(width = 800, height = 600): HTMLElement {
	const container = new MockElement();
	container.getBoundingClientRect = () =>
		({
			x: 0,
			y: 0,
			left: 0,
			top: 0,
			right: width,
			bottom: height,
			width,
			height,
			toJSON: () => null,
		}) as DOMRect;
	(globalThis.document.body as unknown as MockElement).appendChild(container);
	return container as unknown as HTMLElement;
}

describe("FlipEngine", () => {
	beforeEach(() => {
		globalThis.document = {
			body: new MockElement(),
			createElement: (tagName: string) =>
				(tagName === "canvas"
					? new MockCanvasElement()
					: new MockElement()) as never,
		} as Document;
		globalThis.window = { devicePixelRatio: 1 } as Window & typeof globalThis;
		globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
			callback(performance.now() + 1000);
			return 1;
		}) as typeof requestAnimationFrame;
		globalThis.cancelAnimationFrame = (() => {}) as typeof cancelAnimationFrame;
	});

	afterEach(() => {
		globalThis.document = originalDocument;
		globalThis.window = originalWindow;
		globalThis.requestAnimationFrame = originalRequestAnimationFrame;
		globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
	});

	test("loads pages and flips with keyboard shortcuts", async () => {
		const container = createContainer();
		const engine = new FlipEngine(container, { width: 800, height: 600 });
		await Promise.resolve();
		await engine.loadFromImages(["1.png", "2.png"]);

		const canvas = container.querySelector("canvas") as
			| (EventTarget & MockCanvasElement)
			| null;
		expect(canvas).not.toBeNull();

		const flipEvents: number[] = [];
		engine.addEventListener(EVENT_NAMES.FLIP, (event) => {
			flipEvents.push(
				(event as CustomEvent<{ pageIndex: number }>).detail.pageIndex,
			);
		});

		const keydown = new Event("keydown") as Event & {
			key: string;
			preventDefault(): void;
		};
		keydown.key = "ArrowRight";
		keydown.preventDefault = () => {};
		canvas?.dispatchEvent(keydown);
		await Promise.resolve();

		expect(engine.pageCount).toBe(2);
		expect(engine.currentPageIndex).toBe(1);
		expect(engine.state).toBe("read");
		expect(flipEvents).toEqual([1]);

		engine.destroy();
	});

	test("emits orientation changes when config updates", async () => {
		const container = createContainer();
		const engine = new FlipEngine(container, { width: 800, height: 600 });
		await Promise.resolve();

		const orientations: string[] = [];
		engine.addEventListener(EVENT_NAMES.ORIENTATION_CHANGE, (event) => {
			orientations.push(
				(event as CustomEvent<{ orientation: string }>).detail.orientation,
			);
		});

		engine.updateConfig({ width: 400, height: 800 });

		expect(engine.orientation).toBe("portrait");
		expect(orientations).toEqual(["portrait"]);

		engine.destroy();
	});
});
