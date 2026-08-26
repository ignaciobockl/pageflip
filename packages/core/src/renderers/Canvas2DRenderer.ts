/**
 * Canvas 2D Renderer
 *
 * Renders page flip animation using Canvas 2D API.
 * Handles HiDPI, pages, shadows, corners, and fold animation.
 * @packageDocumentation
 */
import {
	DEFAULT_MAX_SHADOW_OPACITY,
	DEFAULT_PAGE_CORNER_SIZE,
	MAX_TEXTURE_SIZE_FALLBACK,
} from "../constants";
import type {
	FlipCorner,
	IRenderer,
	Point,
	Rect,
	RenderFrame,
	RenderPage,
	RendererCapabilities,
	RendererOptions,
} from "../types";

type FoldCurve = {
	start: Point;
	control: Point;
	end: Point;
};

/**
 * Canvas 2D renderer configuration
 */
export interface Canvas2DRendererConfig {
	/** Enable high DPI rendering */
	highDPI: boolean;
	/** Enable shadow rendering */
	drawShadow: boolean;
	/** Maximum shadow opacity (0-1) */
	maxShadowOpacity: number;
	/** Enable page corner indicators */
	showPageCorners: boolean;
	/** Corner size in pixels */
	cornerSize: number;
	/** Background color */
	backgroundColor: string;
}

/**
 * Default configuration
 */
export const DEFAULT_CANVAS_CONFIG: Canvas2DRendererConfig = {
	highDPI: true,
	drawShadow: true,
	maxShadowOpacity: DEFAULT_MAX_SHADOW_OPACITY,
	showPageCorners: true,
	cornerSize: DEFAULT_PAGE_CORNER_SIZE,
	backgroundColor: "transparent",
};

/**
 * Canvas2DRenderer - Canvas 2D implementation of IRenderer
 *
 * Renders page flip frames with realistic shadows and fold curves.
 */
export class Canvas2DRenderer implements IRenderer {
	readonly name = "canvas2d" as const;
	readonly capabilities: RendererCapabilities = {
		zoom: false,
		pan: false,
		hiDPI: true,
		maxTextureSize: MAX_TEXTURE_SIZE_FALLBACK,
		supportsVideo: true,
		supportsPDF: false,
		supportsPBR: false,
	};

	private canvas: HTMLCanvasElement | null = null;
	private context: CanvasRenderingContext2D | null = null;
	private config: Canvas2DRendererConfig;
	private dpr = 1;
	private width = 0;
	private height = 0;

	/**
	 * Create canvas 2D renderer
	 * @param config - Renderer configuration
	 */
	constructor(config: Partial<Canvas2DRendererConfig> = {}) {
		this.config = { ...DEFAULT_CANVAS_CONFIG, ...config };
	}

	/**
	 * Initialize renderer with canvas element
	 *
	 * @param canvas - Canvas element to render to
	 * @param options - Renderer options
	 */
	async init(
		canvas: HTMLCanvasElement,
		options: RendererOptions = {},
	): Promise<void> {
		this.canvas = canvas;
		this.context = canvas.getContext("2d", {
			alpha: true,
			desynchronized: false,
			willReadFrequently: false,
			...options.contextAttributes,
		});

		if (!this.context) {
			throw new Error("Failed to get 2D context");
		}

		const highDPI = options.highDPI ?? this.config.highDPI;
		this.dpr = highDPI ? window.devicePixelRatio || 1 : 1;

		this.context.imageSmoothingEnabled = true;
		this.context.imageSmoothingQuality = "high";
	}

	/**
	 * Render a frame
	 *
	 * @param frame - Frame data to render
	 */
	render(frame: RenderFrame): void {
		if (!this.context || !this.canvas) {
			return;
		}

		const ctx = this.context;
		const { dpr, flipProgress, pages } = frame;

		this.clear();

		ctx.save();
		ctx.scale(dpr, dpr);

		const sortedPages = [...pages].sort((a, b) => a.zIndex - b.zIndex);
		for (const page of sortedPages) {
			this.drawPage(page, frame);
		}

		if (flipProgress > 0 && flipProgress < 1) {
			this.drawFoldOverlay(frame);
		}

		ctx.restore();
	}

	/**
	 * Resize renderer
	 *
	 * @param width - New width in CSS pixels
	 * @param height - New height in CSS pixels
	 * @param dpr - Device pixel ratio
	 */
	resize(width: number, height: number, dpr: number): void {
		if (!this.canvas) {
			return;
		}

		this.width = width;
		this.height = height;
		this.dpr = this.config.highDPI ? dpr : 1;

		this.canvas.width = width * this.dpr;
		this.canvas.height = height * this.dpr;
		this.canvas.style.width = `${width}px`;
		this.canvas.style.height = `${height}px`;
	}

	/**
	 * Destroy renderer and cleanup
	 */
	destroy(): void {
		this.canvas = null;
		this.context = null;
	}

	/**
	 * Clear canvas
	 * @private
	 */
	private clear(): void {
		if (!this.context || !this.canvas) {
			return;
		}

		const ctx = this.context;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		if (this.config.backgroundColor !== "transparent") {
			ctx.fillStyle = this.config.backgroundColor;
			ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		}
	}

	/**
	 * Draw a single page
	 * @private
	 */
	private drawPage(page: RenderPage, frame: RenderFrame): void {
		if (!this.context) {
			return;
		}

		const ctx = this.context;
		const { content, density, isFront, rect } = page;
		const { flipCorner, flipProgress } = frame;

		if (rect.width <= 0 || rect.height <= 0) {
			return;
		}

		ctx.save();
		this.applyPageTransform(ctx, page, frame);
		this.drawPageBackground(ctx, rect, isFront, density);
		this.drawPageContent(ctx, rect, content, isFront);

		if (this.config.drawShadow) {
			this.drawPageShadow(ctx, rect, isFront, frame);
		}

		if (this.config.showPageCorners && isFront) {
			this.drawPageCorner(ctx, rect, flipCorner, flipProgress);
		}

		ctx.restore();
	}

	/**
	 * Apply page transform for flip animation
	 * @private
	 */
	private applyPageTransform(
		_ctx: CanvasRenderingContext2D,
		page: RenderPage,
		frame: RenderFrame,
	): void {
		if (!this.isPageFlipping(page.index, frame)) {
			return;
		}

		return;
	}

	/**
	 * Check if page is currently flipping
	 * @private
	 */
	private isPageFlipping(pageIndex: number, frame: RenderFrame): boolean {
		const { flipDirection, flipProgress, pages } = frame;
		if (flipProgress <= 0 || flipProgress >= 1 || pages.length === 0) {
			return false;
		}

		const orderedPages = [...pages].sort((a, b) => a.index - b.index);
		const targetPage =
			flipDirection === "next"
				? orderedPages[orderedPages.length - 1]
				: orderedPages[0];

		return targetPage?.index === pageIndex;
	}

	/**
	 * Draw page background
	 * @private
	 */
	private drawPageBackground(
		ctx: CanvasRenderingContext2D,
		rect: Rect,
		isFront: boolean,
		density: "soft" | "hard",
	): void {
		ctx.fillStyle = isFront ? "#ffffff" : "#fcfcfc";
		ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

		if (density === "hard") {
			ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
			ctx.lineWidth = 1;
			ctx.strokeRect(
				rect.x + 0.5,
				rect.y + 0.5,
				rect.width - 1,
				rect.height - 1,
			);
		}
	}

	/**
	 * Draw page content (HTML, image, or renderer)
	 * @private
	 */
	private drawPageContent(
		ctx: CanvasRenderingContext2D,
		rect: Rect,
		content: unknown,
		isFront: boolean,
	): void {
		if (!content) {
			return;
		}

		if (typeof content === "object" && content !== null) {
			const candidate = content as {
				type?: string;
				src?: string;
				element?: HTMLElement;
			};

			if (candidate.type === "image" && candidate.src) {
				ctx.fillStyle = isFront ? "#f0f0f0" : "#ebebeb";
				ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
				return;
			}

			if (candidate.type === "html" && candidate.element) {
				ctx.fillStyle = isFront ? "#fafafa" : "#f4f4f4";
				ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
			}
		}
	}

	/**
	 * Draw page shadow
	 * @private
	 */
	private drawPageShadow(
		ctx: CanvasRenderingContext2D,
		rect: Rect,
		isFront: boolean,
		frame: RenderFrame,
	): void {
		if (!this.config.drawShadow) {
			return;
		}

		if (this.isPageFlipping(frame.pages[0]?.index ?? -1, frame)) {
			return;
		}

		ctx.save();
		ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
		ctx.shadowOffsetX = isFront ? 2 : -2;
		ctx.shadowOffsetY = 4;
		ctx.shadowBlur = 8;
		ctx.fillStyle = "rgba(255, 255, 255, 0.01)";
		ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
		ctx.restore();
	}

	/**
	 * Draw page corner indicator
	 * @private
	 */
	private drawPageCorner(
		ctx: CanvasRenderingContext2D,
		rect: Rect,
		flipCorner: FlipCorner,
		flipProgress: number,
	): void {
		const size = this.config.cornerSize;
		const opacity = Math.max(0.1, 0.3 - flipProgress * 0.2);
		const y = flipCorner === "top" ? rect.y : rect.y + rect.height - size;

		ctx.fillStyle = `rgba(59, 130, 246, ${opacity})`;
		ctx.strokeStyle = `rgba(59, 130, 246, ${Math.min(opacity + 0.3, 0.6)})`;
		ctx.lineWidth = 1;

		for (const x of [rect.x, rect.x + rect.width - size]) {
			ctx.beginPath();
			if (flipCorner === "top") {
				ctx.moveTo(x, y + size);
				ctx.lineTo(x, y);
				ctx.lineTo(x + size, y);
			} else {
				ctx.moveTo(x, y);
				ctx.lineTo(x, y + size);
				ctx.lineTo(x + size, y + size);
			}
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
	}

	/**
	 * Draw fold overlay during flip animation
	 * @private
	 */
	private drawFoldOverlay(frame: RenderFrame): void {
		if (!this.context) {
			return;
		}

		const ctx = this.context;
		const { flipCorner, flipProgress, viewport } = frame;
		const pageRect: Rect = {
			x: 0,
			y: 0,
			width: viewport.width,
			height: viewport.height,
		};
		const foldCurve = this.calculateFoldCurve(
			pageRect,
			flipCorner,
			flipProgress,
		);

		this.drawFoldedPageBack(ctx, foldCurve, frame);
		if (this.config.drawShadow) {
			this.drawFoldShadow(ctx, foldCurve, flipProgress, frame);
		}
		this.drawCrease(ctx, foldCurve, flipProgress);
	}

	/**
	 * Calculate fold curve for current progress
	 * @private
	 */
	private calculateFoldCurve(
		pageRect: Rect,
		corner: FlipCorner,
		progress: number,
	): FoldCurve {
		const { height, width } = pageRect;
		const isTop = corner === "top";
		const foldAngle = progress * 180;
		const angleRad = (foldAngle * Math.PI) / 180;
		const foldDepth = Math.sin(angleRad) * height * 0.5;

		return {
			start: { x: 0, y: isTop ? 0 : height },
			control: {
				x: width * 0.5,
				y: isTop ? -foldDepth : height + foldDepth,
			},
			end: { x: width, y: isTop ? 0 : height },
		};
	}

	/**
	 * Draw folded page back side
	 * @private
	 */
	private drawFoldedPageBack(
		ctx: CanvasRenderingContext2D,
		curve: FoldCurve,
		frame: RenderFrame,
	): void {
		const { height, width } = frame.viewport;
		const isTop = curve.control.y < 0;

		ctx.save();
		ctx.beginPath();
		ctx.moveTo(curve.start.x, curve.start.y);
		ctx.quadraticCurveTo(
			curve.control.x,
			curve.control.y,
			curve.end.x,
			curve.end.y,
		);

		if (isTop) {
			ctx.lineTo(width, 0);
			ctx.lineTo(0, 0);
		} else {
			ctx.lineTo(width, height);
			ctx.lineTo(0, height);
		}
		ctx.closePath();

		ctx.fillStyle = "#f5f5f5";
		ctx.fill();

		const gradient = ctx.createLinearGradient(0, 0, 0, height);
		gradient.addColorStop(0, "rgba(0,0,0,0.05)");
		gradient.addColorStop(0.5, "rgba(0,0,0,0.15)");
		gradient.addColorStop(1, "rgba(0,0,0,0.05)");
		ctx.fillStyle = gradient;
		ctx.fill();

		ctx.restore();
	}

	/**
	 * Draw fold shadow
	 * @private
	 */
	private drawFoldShadow(
		ctx: CanvasRenderingContext2D,
		curve: FoldCurve,
		progress: number,
		frame: RenderFrame,
	): void {
		const { height, width } = frame.viewport;
		const isTop = curve.control.y < 0;

		ctx.save();
		ctx.beginPath();
		ctx.moveTo(curve.start.x, curve.start.y);
		ctx.quadraticCurveTo(
			curve.control.x,
			curve.control.y,
			curve.end.x,
			curve.end.y,
		);

		if (isTop) {
			ctx.lineTo(width, 0);
			ctx.lineTo(0, 0);
		} else {
			ctx.lineTo(width, height);
			ctx.lineTo(0, height);
		}
		ctx.closePath();

		const opacity = Math.sin(progress * Math.PI) * this.config.maxShadowOpacity;
		const blur = 10 + 30 * progress;
		const offset = 10 * progress;

		ctx.shadowColor = `rgba(0, 0, 0, ${opacity})`;
		ctx.shadowOffsetX = offset;
		ctx.shadowOffsetY = isTop ? offset : -offset;
		ctx.shadowBlur = blur;
		ctx.fillStyle = "rgba(0, 0, 0, 0)";
		ctx.fill();

		ctx.restore();
	}

	/**
	 * Draw crease line
	 * @private
	 */
	private drawCrease(
		ctx: CanvasRenderingContext2D,
		curve: FoldCurve,
		progress: number,
	): void {
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(curve.start.x, curve.start.y);
		ctx.quadraticCurveTo(
			curve.control.x,
			curve.control.y,
			curve.end.x,
			curve.end.y,
		);

		const opacity = Math.sin(progress * Math.PI) * 0.3;
		ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.restore();
	}

	/**
	 * Update configuration
	 * @param config - New configuration
	 */
	setConfig(config: Partial<Canvas2DRendererConfig>): void {
		this.config = { ...this.config, ...config };
	}

	/**
	 * Get current configuration
	 */
	getConfig(): Canvas2DRendererConfig {
		return { ...this.config };
	}
}
