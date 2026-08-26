import type {
	FlipCorner,
	FlipDirection,
	PageDensity,
	Point,
	Rect,
} from "./index";

/**
 * Renderer capabilities.
 */
export type RendererCapabilities = {
	/** Supports zoom/pan. */
	zoom: boolean;
	/** Supports panning. */
	pan: boolean;
	/** Supports high DPI. */
	hiDPI: boolean;
	/** Maximum texture size. */
	maxTextureSize: number;
	/** Supports video rendering. */
	supportsVideo: boolean;
	/** Supports PDF rendering. */
	supportsPDF: boolean;
	/** Supports PBR rendering. */
	supportsPBR: boolean;
};

/**
 * Page to render.
 */
export type RenderPage = {
	/** Page index. */
	index: number;
	/** Page density. */
	density: PageDensity;
	/** Page rect in viewport. */
	rect: Rect;
	/** Page content (HTML canvas, image, etc.). */
	content: unknown;
	/** Whether page is front side. */
	isFront: boolean;
	/** Z-index for layering. */
	zIndex: number;
};

/**
 * Render frame data.
 */
export type RenderFrame = {
	/** Pages to render. */
	pages: RenderPage[];
	/** Viewport bounds. */
	viewport: Rect;
	/** Device pixel ratio. */
	dpr: number;
	/** Current flip progress (0-1). */
	flipProgress: number;
	/** Flip direction. */
	flipDirection: FlipDirection;
	/** Active flip corner. */
	flipCorner: FlipCorner;
};

/**
 * Texture source for upload.
 */
export type TextureSource =
	| HTMLImageElement
	| HTMLVideoElement
	| HTMLCanvasElement
	| ImageBitmap;

/**
 * Texture handle.
 */
export type TextureHandle = {
	/** Texture identifier. */
	id: number;
	/** Texture width. */
	width: number;
	/** Texture height. */
	height: number;
	/** Dispose texture. */
	dispose: () => void;
};

/**
 * Renderer interface.
 */
export interface IRenderer {
	/** Renderer identifier. */
	readonly name: "canvas2d" | "webgl" | "webgpu";
	/** Renderer capabilities. */
	readonly capabilities: RendererCapabilities;
	/** Initialize renderer. */
	init(
		canvas: HTMLCanvasElement,
		options: import("./page").RendererOptions,
	): Promise<void>;
	/** Render frame. */
	render(frame: RenderFrame): void;
	/** Resize renderer. */
	resize(width: number, height: number, dpr: number): void;
	/** Destroy renderer. */
	destroy(): void;
	/** Set zoom level (optional). */
	setZoom?(level: number, center: Point): void;
	/** Set pan offset (optional). */
	setPan?(offset: Point): void;
	/** Upload texture (optional). */
	uploadTexture?(source: TextureSource): Promise<TextureHandle>;
}
