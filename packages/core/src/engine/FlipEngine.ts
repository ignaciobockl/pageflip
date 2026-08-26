/**
 * Flip Engine.
 *
 * Orchestrates the page flip animation state machine.
 * @packageDocumentation
 */
import {
	DEFAULT_PAGE_CORNER_SIZE,
	EVENT_NAMES,
	KEYBOARD_SHORTCUTS,
} from "../constants";
import { PluginManager } from "../plugins/PluginManager";
import { RendererFactory } from "../renderers/RendererFactory";
import type {
	FlipCorner,
	FlipDirection,
	FlipEvent,
	FlipState,
	IRenderer,
	OrientationChangeEvent,
	PageData,
	PageFlipConfig,
	PageFlipInstance,
	PageOrientation,
	PageSource,
	Point,
	Rect,
	RenderPage,
	StateChangeEvent,
} from "../types";
import {
	calculateFoldAngle,
	calculateFoldCurve,
	calculateFoldProgress,
	getCornerHitArea,
} from "./bezier";
import {
	DEFAULT_CONFIG,
	calculateLayoutBounds,
	createHtmlPages,
	createImagePages,
	createSourcePages,
} from "./flipEngineShared";
import {
	calculateCreaseShadow,
	calculatePageEdgeShadow,
	calculateShadowParams,
} from "./shadow";

/**
 * FlipEngine runtime.
 */
type FlipRuntime = {
	pages: PageData[];
	pageIndex: number;
	orientation: PageOrientation;
	state: FlipState;
	bounds: Rect;
	renderer: IRenderer | null;
	dragPoint: Point | null;
	activeCorner: FlipCorner | null;
	flipDirection: FlipDirection;
	flipCorner: FlipCorner;
	flipTargetPage: number;
	frameId: number | null;
};

/**
 * Interactive page corners.
 */
const FLIP_CORNERS: readonly FlipCorner[] = ["top", "bottom"];

/**
 * Check whether a keyboard shortcut contains a pressed key.
 */
function includesKey(keys: readonly string[], key: string): boolean {
	return keys.includes(key);
}

/**
 * Core animation and state management.
 */
export class FlipEngine extends EventTarget implements PageFlipInstance {
	/** Host container. */
	private readonly container: HTMLElement;
	/** Rendering canvas. */
	private readonly canvas: HTMLCanvasElement;
	/** Event lifecycle controller. */
	private readonly abortController = new AbortController();
	/** Engine runtime. */
	private readonly runtime: FlipRuntime = {
		pages: [],
		pageIndex: 0,
		orientation: "portrait",
		state: "idle",
		bounds: { x: 0, y: 0, width: 0, height: 0 },
		renderer: null,
		dragPoint: null,
		activeCorner: null,
		flipDirection: "next",
		flipCorner: "top",
		flipTargetPage: 0,
		frameId: null,
	};
	/** Resize observer. */
	private resizeObserver: ResizeObserver | null = null;
	/** Effective configuration. */
	private config: Required<PageFlipConfig>;

	/**
	 * Create a new FlipEngine instance.
	 */
	public constructor(container: HTMLElement, config: PageFlipConfig) {
		super();
		this.container = container;
		this.config = { ...DEFAULT_CONFIG, ...config };
		this.canvas = this.createCanvas();
		this.container.appendChild(this.canvas);
		this.bindEvents();
		this.calculateLayout();
		void this.initialize();
		this.dispatchEvent(new CustomEvent(EVENT_NAMES.INIT, { detail: this }));
	}

	/** Current page count. */
	public get pageCount(): number {
		return this.runtime.pages.length;
	}
	/** Current page index. */
	public get currentPageIndex(): number {
		return this.runtime.pageIndex;
	}
	/** Current orientation. */
	public get orientation(): PageOrientation {
		return this.runtime.orientation;
	}
	/** Current flip state. */
	public get state(): FlipState {
		return this.runtime.state;
	}
	/** Current bounds. */
	public get bounds(): Rect {
		return this.runtime.bounds;
	}

	/** Animate to next page. */
	public async flipNext(corner: FlipCorner = "top"): Promise<void> {
		await this.flip(this.runtime.pageIndex + 1, corner);
	}
	/** Animate to previous page. */
	public async flipPrev(corner: FlipCorner = "bottom"): Promise<void> {
		await this.flip(this.runtime.pageIndex - 1, corner);
	}
	/** Animate to a specific page. */
	public async flip(pageIndex: number, corner?: FlipCorner): Promise<void> {
		await this.runFlip(pageIndex, corner);
	}
	/** Jump to page without animation. */
	public async turnToPage(pageIndex: number): Promise<void> {
		if (pageIndex >= 0 && pageIndex < this.pageCount) {
			this.runtime.pageIndex = pageIndex;
			this.render();
			this.emitUpdate();
		}
	}
	/** Jump to next page. */
	public async turnToNextPage(): Promise<void> {
		await this.turnToPage(this.runtime.pageIndex + 1);
	}
	/** Jump to previous page. */
	public async turnToPrevPage(): Promise<void> {
		await this.turnToPage(this.runtime.pageIndex - 1);
	}
	/** Load pages from HTML elements. */
	public async loadFromHtml(elements: HTMLElement[]): Promise<void> {
		this.replacePages(createHtmlPages(elements));
	}
	/** Load pages from image URLs. */
	public async loadFromImages(urls: string[]): Promise<void> {
		this.replacePages(createImagePages(urls));
	}
	/** Load pages from mixed sources. */
	public async loadFromSources(sources: PageSource[]): Promise<void> {
		this.replacePages(createSourcePages(sources));
	}
	/** Update pages from HTML elements. */
	public async updateFromHtml(elements: HTMLElement[]): Promise<void> {
		this.replacePages(createHtmlPages(elements), false);
	}
	/** Update pages from image URLs. */
	public async updateFromImages(urls: string[]): Promise<void> {
		this.replacePages(createImagePages(urls), false);
	}
	/** Switch renderer at runtime. */
	public async setRenderer(rendererId: "canvas2d" | "webgl"): Promise<void> {
		this.config.renderer = rendererId;
		await this.initializeRenderer();
		this.render();
	}
	/** Get current renderer. */
	public getRenderer(): IRenderer {
		if (!this.runtime.renderer) {
			throw new Error("Renderer not initialized");
		}
		return this.runtime.renderer;
	}
	/** Destroy instance and cleanup. */
	public destroy(): void {
		if (this.runtime.frameId !== null) {
			cancelAnimationFrame(this.runtime.frameId);
		}
		this.abortController.abort();
		this.resizeObserver?.disconnect();
		this.runtime.renderer?.destroy();
		this.canvas.remove();
	}
	/** Update configuration. */
	public updateConfig(config: Partial<PageFlipConfig>): void {
		const previousOrientation = this.runtime.orientation;
		this.config = { ...this.config, ...config };
		this.calculateLayout();
		if (previousOrientation !== this.runtime.orientation) {
			this.emitOrientationChange(previousOrientation);
		}
		this.emitUpdate();
	}

	/** Create the canvas element. */
	private createCanvas(): HTMLCanvasElement {
		const canvas = document.createElement("canvas");
		canvas.tabIndex = 0;
		canvas.style.width = "100%";
		canvas.style.height = "100%";
		canvas.style.display = "block";
		return canvas;
	}
	/** Initialize renderer and plugins. */
	private async initialize(): Promise<void> {
		await this.initializeRenderer();
		await PluginManager.applyAll(this);
		this.render();
	}
	/** Initialize the active renderer. */
	private async initializeRenderer(): Promise<void> {
		this.runtime.renderer?.destroy();
		this.runtime.renderer = await RendererFactory.create(
			this.config.renderer,
			this.canvas,
			this.config.rendererOptions,
		);
		this.resizeCanvas();
	}
	/** Bind all DOM events. */
	private bindEvents(): void {
		const signal = this.abortController.signal;
		this.canvas.addEventListener(
			"mousedown",
			(event) => this.onPointerStart(event.clientX, event.clientY),
			{ signal },
		);
		this.canvas.addEventListener(
			"mousemove",
			(event) => this.onPointerMove(event.clientX, event.clientY),
			{ signal },
		);
		this.canvas.addEventListener("mouseup", () => this.onPointerEnd(), {
			signal,
		});
		this.canvas.addEventListener("mouseleave", () => this.onPointerEnd(), {
			signal,
		});
		this.canvas.addEventListener(
			"click",
			(event) => this.onClick(event.clientX, event.clientY),
			{ signal },
		);
		this.canvas.addEventListener(
			"touchstart",
			(event) => this.onTouchStart(event),
			{ passive: true, signal },
		);
		this.canvas.addEventListener(
			"touchmove",
			(event) => this.onTouchMove(event),
			{ passive: false, signal },
		);
		this.canvas.addEventListener("touchend", () => this.onPointerEnd(), {
			signal,
		});
		this.canvas.addEventListener("keydown", (event) => this.onKeyDown(event), {
			signal,
		});
		this.resizeObserver =
			typeof ResizeObserver === "undefined"
				? null
				: new ResizeObserver(() => this.onResize());
		this.resizeObserver?.observe(this.container);
	}
	/** Calculate current layout. */
	private calculateLayout(): void {
		const layout = calculateLayoutBounds(
			this.container.getBoundingClientRect(),
			this.config,
		);
		this.runtime.bounds = layout.bounds;
		this.runtime.orientation = layout.orientation;
		this.resizeCanvas();
	}
	/** Resize canvas backing store. */
	private resizeCanvas(): void {
		const dpr = window.devicePixelRatio || 1;
		this.canvas.width = this.runtime.bounds.width * dpr;
		this.canvas.height = this.runtime.bounds.height * dpr;
		this.runtime.renderer?.resize(
			this.runtime.bounds.width,
			this.runtime.bounds.height,
			dpr,
		);
	}
	/** Convert a client point into canvas coordinates. */
	private getCanvasPoint(clientX: number, clientY: number): Point {
		const rect = this.canvas.getBoundingClientRect();
		return { x: clientX - rect.left, y: clientY - rect.top };
	}
	/** Get the current page rectangle. */
	private getCurrentPageRect(): Rect {
		return {
			x: 0,
			y: 0,
			width: this.runtime.bounds.width,
			height: this.runtime.bounds.height,
		};
	}
	/** Hit test an interactive page corner. */
	private hitTestCorner(point: Point): FlipCorner | null {
		return (
			FLIP_CORNERS.find((corner) => {
				const area = getCornerHitArea(
					this.getCurrentPageRect(),
					corner,
					DEFAULT_PAGE_CORNER_SIZE,
				);
				return (
					point.x >= area.x &&
					point.x <= area.x + area.width &&
					point.y >= area.y &&
					point.y <= area.y + area.height
				);
			}) ?? null
		);
	}
	/** Start pointer interaction. */
	private onPointerStart(clientX: number, clientY: number): void {
		if (this.runtime.state !== "idle" || !this.config.showPageCorners) {
			return;
		}
		const point = this.getCanvasPoint(clientX, clientY);
		const corner = this.hitTestCorner(point);
		if (corner) {
			this.runtime.dragPoint = point;
			this.runtime.activeCorner = corner;
			this.setState("user_fold");
		}
	}
	/** Update pointer interaction. */
	private onPointerMove(clientX: number, clientY: number): void {
		if (!this.runtime.activeCorner) {
			return;
		}
		const point = this.getCanvasPoint(clientX, clientY);
		this.runtime.dragPoint = point;
		const progress = calculateFoldProgress(
			calculateFoldAngle(
				this.getCurrentPageRect(),
				this.runtime.activeCorner,
				point,
			),
		);
		this.setState(progress > 0.1 ? "fold_corner" : "user_fold");
		this.renderFrame(
			progress,
			this.runtime.activeCorner,
			this.runtime.flipDirection,
		);
	}
	/** End pointer interaction. */
	private onPointerEnd(): void {
		if (!this.runtime.activeCorner || !this.runtime.dragPoint) {
			return;
		}
		const corner = this.runtime.activeCorner;
		const progress = calculateFoldProgress(
			calculateFoldAngle(
				this.getCurrentPageRect(),
				corner,
				this.runtime.dragPoint,
			),
		);
		this.runtime.activeCorner = null;
		this.runtime.dragPoint = null;
		if (progress > 0.5) {
			void this.runFlip(this.runtime.pageIndex + 1, corner);
			return;
		}
		this.setState("read");
		this.render();
	}
	/** Handle click interactions. */
	private onClick(clientX: number, clientY: number): void {
		if (this.config.disableFlipByClick || this.runtime.state !== "idle") {
			return;
		}
		const point = this.getCanvasPoint(clientX, clientY);
		void (point.x > this.getCurrentPageRect().width / 2
			? this.flipNext()
			: this.flipPrev());
	}
	/** Handle touch start. */
	private onTouchStart(event: TouchEvent): void {
		const touch = event.touches.item(0);
		if (touch) {
			this.onPointerStart(touch.clientX, touch.clientY);
		}
	}
	/** Handle touch move. */
	private onTouchMove(event: TouchEvent): void {
		if (!this.config.mobileScrollSupport) {
			event.preventDefault();
		}
		const touch = event.touches.item(0);
		if (touch) {
			this.onPointerMove(touch.clientX, touch.clientY);
		}
	}
	/** Handle keyboard interactions. */
	private onKeyDown(event: KeyboardEvent): void {
		if (includesKey(KEYBOARD_SHORTCUTS.NEXT, event.key)) {
			event.preventDefault();
			void this.flipNext();
		}
		if (includesKey(KEYBOARD_SHORTCUTS.PREV, event.key)) {
			event.preventDefault();
			void this.flipPrev();
		}
		if (includesKey(KEYBOARD_SHORTCUTS.FIRST, event.key)) {
			event.preventDefault();
			void this.turnToPage(0);
		}
		if (includesKey(KEYBOARD_SHORTCUTS.LAST, event.key)) {
			event.preventDefault();
			void this.turnToPage(this.pageCount - 1);
		}
	}
	/** Handle resize updates. */
	private onResize(): void {
		this.calculateLayout();
		this.render();
		this.emitUpdate();
	}
	/** Build pages for the renderer. */
	private buildRenderPages(): RenderPage[] {
		return this.runtime.pages.map((page, index) => ({
			index,
			density: page.density,
			rect: this.getCurrentPageRect(),
			content: page.content,
			isFront: index <= this.runtime.pageIndex,
			zIndex: index,
		}));
	}
	/** Render the current resting frame. */
	private render(): void {
		this.renderFrame(0, this.runtime.flipCorner, this.runtime.flipDirection);
	}
	/** Render a specific frame. */
	private renderFrame(
		progress: number,
		corner: FlipCorner,
		direction: FlipDirection,
	): void {
		if (!this.runtime.renderer) {
			return;
		}
		const pageRect = this.getCurrentPageRect();
		void calculateFoldCurve(pageRect, corner, progress, progress * 180);
		void calculateShadowParams(
			progress,
			pageRect,
			undefined,
			this.config.maxShadowOpacity,
		);
		void calculateCreaseShadow(progress, pageRect);
		void calculatePageEdgeShadow(pageRect, progress > 0, progress);
		this.runtime.renderer.render({
			pages: this.buildRenderPages(),
			viewport: this.runtime.bounds,
			dpr: window.devicePixelRatio || 1,
			flipProgress: progress,
			flipDirection: direction,
			flipCorner: corner,
		});
	}
	/** Replace all pages and optionally reset the active page. */
	private replacePages(pages: PageData[], resetIndex = true): void {
		this.runtime.pages = pages;
		this.runtime.pageIndex = resetIndex
			? 0
			: Math.min(this.runtime.pageIndex, Math.max(pages.length - 1, 0));
		this.render();
		this.emitUpdate();
	}
	/** Update the engine state and emit events. */
	private setState(state: FlipState): void {
		if (state === this.runtime.state) {
			return;
		}
		const previousState = this.runtime.state;
		this.runtime.state = state;
		this.dispatchEvent(
			new CustomEvent(EVENT_NAMES.STATE_CHANGE, {
				detail: {
					state,
					previousState,
					timestamp: Date.now(),
				} satisfies StateChangeEvent,
			}),
		);
	}
	/** Emit update event. */
	private emitUpdate(): void {
		this.dispatchEvent(new CustomEvent(EVENT_NAMES.UPDATE, { detail: this }));
	}
	/** Emit flip event. */
	private emitFlip(): void {
		this.dispatchEvent(
			new CustomEvent(EVENT_NAMES.FLIP, {
				detail: {
					pageIndex: this.runtime.pageIndex,
					direction: this.runtime.flipDirection,
					corner: this.runtime.flipCorner,
					timestamp: Date.now(),
				} satisfies FlipEvent,
			}),
		);
	}
	/** Emit orientation change event. */
	private emitOrientationChange(previousOrientation: PageOrientation): void {
		this.dispatchEvent(
			new CustomEvent(EVENT_NAMES.ORIENTATION_CHANGE, {
				detail: {
					orientation: this.runtime.orientation,
					previousOrientation,
					timestamp: Date.now(),
				} satisfies OrientationChangeEvent,
			}),
		);
	}
	/** Run an animated flip transition. */
	private async runFlip(pageIndex: number, corner?: FlipCorner): Promise<void> {
		if (
			this.runtime.renderer === null ||
			pageIndex < 0 ||
			pageIndex >= this.pageCount ||
			pageIndex === this.runtime.pageIndex
		) {
			return;
		}
		this.runtime.flipDirection =
			pageIndex > this.runtime.pageIndex ? "next" : "prev";
		this.runtime.flipCorner =
			corner ?? (this.runtime.flipDirection === "next" ? "top" : "bottom");
		this.runtime.flipTargetPage = pageIndex;
		this.setState("flipping");
		const start = performance.now();
		await new Promise<void>((resolve) => {
			const tick = (time: number) => {
				const progress = Math.min((time - start) / this.config.flippingTime, 1);
				const eased =
					progress < 0.5
						? 4 * progress * progress * progress
						: 1 - (-2 * progress + 2) ** 3 / 2;
				this.renderFrame(
					eased,
					this.runtime.flipCorner,
					this.runtime.flipDirection,
				);
				if (progress < 1) {
					this.runtime.frameId = requestAnimationFrame(tick);
					return;
				}
				this.runtime.pageIndex = this.runtime.flipTargetPage;
				this.setState("read");
				this.render();
				this.emitFlip();
				resolve();
			};
			this.runtime.frameId = requestAnimationFrame(tick);
		});
	}
}
