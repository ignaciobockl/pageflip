import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

import {
	Canvas2DRenderer,
	DEFAULT_CANVAS_CONFIG,
} from "../../src/renderers/Canvas2DRenderer";
import { RendererFactory } from "../../src/renderers/RendererFactory";
import type { RenderFrame, RenderPage } from "../../src/types";

const originalDocument = globalThis.document;
const originalNavigator = globalThis.navigator;
const originalWindow = globalThis.window;

type GradientStop = {
	offset: number;
	color: string;
};

class MockGradient {
	public readonly stops: GradientStop[] = [];

	public addColorStop(offset: number, color: string): void {
		this.stops.push({ offset, color });
	}
}

class MockContext2D {
	public readonly calls: string[] = [];
	public readonly gradients: MockGradient[] = [];
	public fillStyle: string | CanvasGradient | CanvasPattern = "";
	public strokeStyle: string | CanvasGradient | CanvasPattern = "";
	public lineWidth = 0;
	public shadowColor = "";
	public shadowOffsetX = 0;
	public shadowOffsetY = 0;
	public shadowBlur = 0;
	public imageSmoothingEnabled = false;
	public imageSmoothingQuality: ImageSmoothingQuality = "low";

	public save(): void {
		this.calls.push("save");
	}

	public restore(): void {
		this.calls.push("restore");
	}

	public scale(x: number, y: number): void {
		this.calls.push(`scale:${x}:${y}`);
	}

	public clearRect(x: number, y: number, width: number, height: number): void {
		this.calls.push(`clearRect:${x}:${y}:${width}:${height}`);
	}

	public setTransform(
		a: number,
		b: number,
		c: number,
		d: number,
		e: number,
		f: number,
	): void {
		this.calls.push(`setTransform:${a}:${b}:${c}:${d}:${e}:${f}`);
	}

	public fillRect(x: number, y: number, width: number, height: number): void {
		this.calls.push(`fillRect:${x}:${y}:${width}:${height}`);
	}

	public strokeRect(x: number, y: number, width: number, height: number): void {
		this.calls.push(`strokeRect:${x}:${y}:${width}:${height}`);
	}

	public beginPath(): void {
		this.calls.push("beginPath");
	}

	public moveTo(x: number, y: number): void {
		this.calls.push(`moveTo:${x}:${y}`);
	}

	public lineTo(x: number, y: number): void {
		this.calls.push(`lineTo:${x}:${y}`);
	}

	public closePath(): void {
		this.calls.push("closePath");
	}

	public fill(): void {
		this.calls.push("fill");
	}

	public stroke(): void {
		this.calls.push("stroke");
	}

	public quadraticCurveTo(
		cpx: number,
		cpy: number,
		x: number,
		y: number,
	): void {
		this.calls.push(`quadraticCurveTo:${cpx}:${cpy}:${x}:${y}`);
	}

	public createLinearGradient(): CanvasGradient {
		this.calls.push("createLinearGradient");
		const gradient = new MockGradient();
		this.gradients.push(gradient);
		return gradient as unknown as CanvasGradient;
	}

	public reset(): void {
		this.calls.length = 0;
		this.gradients.length = 0;
	}

	public getCallCount(name: string): number {
		return this.calls.filter((call) => call === name).length;
	}

	public hasCall(prefix: string): boolean {
		return this.calls.some((call) => call.startsWith(prefix));
	}

	public getGradient(index = 0): MockGradient | undefined {
		return this.gradients[index];
	}

	public getContextAttributes(): CanvasRenderingContext2DSettings {
		return {};
	}

	public canvas = {} as HTMLCanvasElement;
	public globalAlpha = 1;
	public globalCompositeOperation: GlobalCompositeOperation = "source-over";
	public drawImage = mock(() => {});
	public clip = mock(() => {});
	public translate = mock(() => {});
	public rotate = mock(() => {});
	public transform = mock(() => {});
	public rect = mock(() => {});
	public arc = mock(() => {});
	public strokeText = mock(() => {});
	public fillText = mock(() => {});
	public measureText = mock(() => ({ width: 0 }) as TextMetrics);
	public setLineDash = mock(() => {});
	public getLineDash = mock(() => []);
	public resetTransform = mock(() => {});
	public createPattern = mock(() => null);
	public createRadialGradient = mock(
		() => new MockGradient() as unknown as CanvasGradient,
	);
	public isPointInPath = mock(() => false);
	public isPointInStroke = mock(() => false);
	public getTransform = mock(() => new DOMMatrix());
	public putImageData = mock(() => {});
	public getImageData = mock(
		() => ({ data: new Uint8ClampedArray() }) as ImageData,
	);
	public createImageData = mock(
		() => ({ data: new Uint8ClampedArray() }) as ImageData,
	);
	public drawFocusIfNeeded = mock(() => {});
	public scrollPathIntoView = mock(() => {});
	public strokeTextWrap = mock(() => {});
	public fillTextWrap = mock(() => {});
	public direction: CanvasDirection = "inherit";
	public font = "10px sans-serif";
	public filter = "none";
	public fontKerning: CanvasFontKerning = "auto";
	public fontStretch: CanvasFontStretch = "normal";
	public fontVariantCaps: CanvasFontVariantCaps = "normal";
	public textAlign: CanvasTextAlign = "start";
	public textBaseline: CanvasTextBaseline = "alphabetic";
	public letterSpacing = "0px";
	public wordSpacing = "0px";
	public lineCap: CanvasLineCap = "butt";
	public lineDashOffset = 0;
	public lineJoin: CanvasLineJoin = "miter";
	public miterLimit = 10;
	public shadowOffsetZ = 0;
	public strokeStyleAlt = "";
	public textRendering: CanvasTextRendering = "auto";
	public imageSmoothingQualityAlt: ImageSmoothingQuality = "low";
}

class MockCanvasElement {
	public width = 0;
	public height = 0;
	public readonly style: Record<string, string> = {};
	public readonly context = new MockContext2D();
	public lastContextType: string | null = null;
	public lastContextOptions: CanvasRenderingContext2DSettings | null = null;

	public getContext(
		type: string,
		options?: CanvasRenderingContext2DSettings,
	): CanvasRenderingContext2D | null {
		this.lastContextType = type;
		this.lastContextOptions = options ?? null;
		return type === "2d"
			? (this.context as unknown as CanvasRenderingContext2D)
			: null;
	}
}

const page: RenderPage = {
	index: 0,
	density: "hard",
	rect: { x: 10, y: 20, width: 120, height: 180 },
	content: { type: "image", src: "page-1.png" },
	isFront: true,
	zIndex: 2,
};

const secondPage: RenderPage = {
	index: 1,
	density: "soft",
	rect: { x: 140, y: 20, width: 120, height: 180 },
	content: { type: "html", element: {} as HTMLElement },
	isFront: false,
	zIndex: 1,
};

function createFrame(overrides: Partial<RenderFrame> = {}): RenderFrame {
	return {
		pages: [page, secondPage],
		viewport: { x: 0, y: 0, width: 300, height: 200 },
		dpr: 2,
		flipProgress: 0.5,
		flipDirection: "next",
		flipCorner: "top",
		...overrides,
	};
}

describe("Canvas2DRenderer", () => {
	beforeEach(() => {
		globalThis.window = { devicePixelRatio: 2 } as Window & typeof globalThis;
		globalThis.document = {
			createElement: () =>
				new MockCanvasElement() as unknown as HTMLCanvasElement,
		} as Document;
		globalThis.navigator = {} as Navigator;
		RendererFactory.clearCache();
	});

	afterEach(() => {
		globalThis.document = originalDocument;
		globalThis.navigator = originalNavigator;
		globalThis.window = originalWindow;
		RendererFactory.clearCache();
	});

	test("init configures the 2d context and render draws pages and fold overlay", async () => {
		const canvas = new MockCanvasElement();
		const renderer = new Canvas2DRenderer();

		await renderer.init(canvas as unknown as HTMLCanvasElement, {
			highDPI: true,
			contextAttributes: { alpha: false },
		});

		renderer.render(createFrame());

		expect(canvas.lastContextType).toBe("2d");
		expect(canvas.lastContextOptions).toEqual({
			alpha: false,
			desynchronized: false,
			willReadFrequently: false,
		});
		expect(canvas.context.imageSmoothingEnabled).toBe(true);
		expect(canvas.context.imageSmoothingQuality).toBe("high");
		expect(canvas.context.hasCall("setTransform:1:0:0:1:0:0")).toBe(true);
		expect(canvas.context.hasCall("clearRect:0:0:0:0")).toBe(true);
		expect(canvas.context.hasCall("scale:2:2")).toBe(true);
		expect(canvas.context.getCallCount("createLinearGradient")).toBe(1);
		expect(canvas.context.getCallCount("quadraticCurveTo:150:-100:300:0")).toBe(
			3,
		);
	});

	test("resize updates canvas size and destroy releases references", async () => {
		const canvas = new MockCanvasElement();
		const renderer = new Canvas2DRenderer();

		await renderer.init(canvas as unknown as HTMLCanvasElement);
		renderer.resize(320, 240, 3);

		expect(canvas.width).toBe(960);
		expect(canvas.height).toBe(720);
		expect(canvas.style.width).toBe("320px");
		expect(canvas.style.height).toBe("240px");

		renderer.destroy();
		canvas.context.reset();
		renderer.render(createFrame());

		expect(canvas.context.calls).toEqual([]);
	});

	test("drawPage draws background, content, shadow, and corner indicators", async () => {
		const canvas = new MockCanvasElement();
		const renderer = new Canvas2DRenderer() as Canvas2DRenderer & {
			drawPage(page: RenderPage, frame: RenderFrame): void;
		};

		await renderer.init(canvas as unknown as HTMLCanvasElement);
		canvas.context.reset();

		renderer.drawPage(page, createFrame({ flipProgress: 0 }));

		expect(canvas.context.getCallCount("save")).toBe(2);
		expect(canvas.context.getCallCount("restore")).toBe(2);
		expect(canvas.context.hasCall("fillRect:10:20:120:180")).toBe(true);
		expect(canvas.context.hasCall("strokeRect:10.5:20.5:119:179")).toBe(true);
		expect(canvas.context.getCallCount("beginPath")).toBe(2);
		expect(canvas.context.getCallCount("fill")).toBe(2);
		expect(canvas.context.getCallCount("stroke")).toBe(2);
	});

	test("drawFoldOverlay uses fold curve, gradients, and shadow settings", async () => {
		const canvas = new MockCanvasElement();
		const renderer = new Canvas2DRenderer({
			maxShadowOpacity: 0.4,
		}) as Canvas2DRenderer & {
			drawFoldOverlay(frame: RenderFrame): void;
		};

		await renderer.init(canvas as unknown as HTMLCanvasElement);
		canvas.context.reset();

		renderer.drawFoldOverlay(
			createFrame({ flipCorner: "bottom", flipProgress: 0.25 }),
		);

		expect(canvas.context.getCallCount("createLinearGradient")).toBe(1);
		expect(
			canvas.context.getCallCount(
				"quadraticCurveTo:150:270.71067811865476:300:200",
			),
		).toBe(3);
		expect(canvas.context.shadowColor).toBe(
			"rgba(0, 0, 0, 0.28284271247461906)",
		);
		expect(canvas.context.shadowOffsetX).toBe(2.5);
		expect(canvas.context.shadowOffsetY).toBe(-2.5);
		expect(canvas.context.shadowBlur).toBe(17.5);
		expect(canvas.context.getGradient()?.stops).toEqual([
			{ offset: 0, color: "rgba(0,0,0,0.05)" },
			{ offset: 0.5, color: "rgba(0,0,0,0.15)" },
			{ offset: 1, color: "rgba(0,0,0,0.05)" },
		]);
	});

	test("calculateFoldCurve returns expected top and bottom curves", () => {
		const renderer = new Canvas2DRenderer() as Canvas2DRenderer & {
			calculateFoldCurve(
				pageRect: RenderFrame["viewport"],
				corner: "top" | "bottom",
				progress: number,
			): {
				start: { x: number; y: number };
				control: { x: number; y: number };
				end: { x: number; y: number };
			};
		};

		expect(
			renderer.calculateFoldCurve(
				{ x: 0, y: 0, width: 300, height: 200 },
				"top",
				0.5,
			),
		).toEqual({
			start: { x: 0, y: 0 },
			control: { x: 150, y: -100 },
			end: { x: 300, y: 0 },
		});

		expect(
			renderer.calculateFoldCurve(
				{ x: 0, y: 0, width: 300, height: 200 },
				"bottom",
				0.25,
			),
		).toEqual({
			start: { x: 0, y: 200 },
			control: { x: 150, y: 270.71067811865476 },
			end: { x: 300, y: 200 },
		});
	});

	test("config getters and setters merge values without mutating defaults", () => {
		const renderer = new Canvas2DRenderer({ drawShadow: false });

		expect(renderer.getConfig()).toEqual({
			...DEFAULT_CANVAS_CONFIG,
			drawShadow: false,
		});

		renderer.setConfig({ backgroundColor: "#111111", cornerSize: 24 });

		expect(renderer.getConfig()).toEqual({
			...DEFAULT_CANVAS_CONFIG,
			drawShadow: false,
			backgroundColor: "#111111",
			cornerSize: 24,
		});
		expect(DEFAULT_CANVAS_CONFIG.cornerSize).toBe(48);
		expect(DEFAULT_CANVAS_CONFIG.backgroundColor).toBe("transparent");
	});

	test("exposes capabilities and factory resolves canvas2d capabilities", async () => {
		const renderer = new Canvas2DRenderer();

		expect(renderer.capabilities).toEqual({
			zoom: false,
			pan: false,
			hiDPI: true,
			maxTextureSize: 4096,
			supportsVideo: true,
			supportsPDF: false,
			supportsPBR: false,
		});

		expect(await RendererFactory.getCapabilities("canvas2d")).toEqual(
			renderer.capabilities,
		);
	});
});
