/**
 * Flip Engine.
 *
 * Orchestrates the page flip animation state machine.
 * @packageDocumentation
 */

import {
	DEFAULT_PAGE_CORNER_SIZE,
	DEFAULT_SWIPE_DISTANCE,
	EVENT_NAMES,
} from "../constants";

import { InputManager } from "../input/InputManager";
import type { InputEvent, InputEventListener } from "../input/InputManager";

import { LayoutCalculator } from "../layout/LayoutCalculator";
import type { LayoutResult } from "../layout/LayoutCalculator";
import { OrientationManager } from "../layout/OrientationManager";
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
	Rect,
	RenderPage,
	StateChangeEvent,
} from "../types";
import {
	calculateFoldAngle,
	calculateFoldCurve,
	calculateFoldProgress,
} from "./bezier";
import {
	DEFAULT_CONFIG,
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
	flipDirection: FlipDirection;
	flipCorner: FlipCorner;
	flipTargetPage: number;
	frameId: number | null;
};

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
		flipDirection: "next",
		flipCorner: "top",
		flipTargetPage: 0,
		frameId: null,
	};
	/** Resize observer. */
	private resizeObserver: ResizeObserver | null = null;
	/** Effective configuration. */
	private config: Required<PageFlipConfig>;
	/** Layout calculator instance. */
	private readonly layoutCalculator: LayoutCalculator;
	/** Orientation manager instance. */
	private readonly orientationManager: OrientationManager;
	/** Input manager for all user interactions. */
	private inputManager: InputManager;
	/** Input event unsubscribe. */
	private inputUnsubscribe: (() => void) | null = null;
	/** Current layout result. */
	private currentLayout: LayoutResult | null = null;

	/**
	 * Create a new FlipEngine instance.
	 */
	public constructor(container: HTMLElement, config: PageFlipConfig) {
		super();
		this.container = container;
		this.config = { ...DEFAULT_CONFIG, ...config };
		this.canvas = this.createCanvas();
		this.container.appendChild(this.canvas);
		this.layoutCalculator = new LayoutCalculator();
		this.orientationManager = new OrientationManager(this.layoutCalculator);
		this.orientationManager.setPortraitPreference(this.config.usePortrait);
		this.inputManager = new InputManager({
			pageRect: this.currentLayout?.pageRect ?? {
				x: 0,
				y: 0,
				width: this.config.width,
				height: this.config.height,
			},
			cornerSize: DEFAULT_PAGE_CORNER_SIZE,
			clickToFlip: !this.config.disableFlipByClick,
			swipeDistance: this.config.swipeDistance ?? DEFAULT_SWIPE_DISTANCE,
			dragThreshold: 5,
			enableKeyboard: true,
			enableWheelZoom: this.config.renderer !== "canvas2d",
			enableHorizontalScroll: true,
		});
		this.bindEvents();
		this.bindInputEvents();
		this.calculateLayout();
		void this.orientationManager.updateOrientation(
			this.container.getBoundingClientRect(),
			this.config,
		);
		void this.initialize();
		this.emitInit();
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
		this.inputManager.setConfig({
			enableWheelZoom: this.config.renderer !== "canvas2d",
		});
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
		this.inputUnsubscribe?.();
		this.inputManager.reset();
		this.abortController.abort();
		this.resizeObserver?.disconnect();
		this.runtime.renderer?.destroy();
		this.canvas.remove();
		this.runtime.pages = [];
	}
	/** Update configuration. */
	public updateConfig(config: Partial<PageFlipConfig>): void {
		const previousOrientation = this.runtime.orientation;
		this.config = { ...this.config, ...config };
		if (config.usePortrait !== undefined) {
			this.orientationManager.setPortraitPreference(config.usePortrait);
		}
		this.inputManager.setConfig({
			clickToFlip: !this.config.disableFlipByClick,
			swipeDistance: this.config.swipeDistance ?? DEFAULT_SWIPE_DISTANCE,
			enableWheelZoom: this.config.renderer !== "canvas2d",
		});
		this.calculateLayout();
		void this.orientationManager.updateOrientation(
			this.container.getBoundingClientRect(),
			this.config,
		);
		if (this.runtime.orientation !== previousOrientation) {
			this.emitOrientationChange(previousOrientation);
		}
		this.emitUpdate();
	}
	/** Get current layout result. */
	public getLayout(): LayoutResult | null {
		return this.currentLayout;
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
		const toCanvasPoint = (clientX: number, clientY: number) => {
			const rect = this.canvas.getBoundingClientRect();
			return { x: clientX - rect.left, y: clientY - rect.top };
		};
		this.canvas.addEventListener(
			"mousedown",
			(event) =>
				this.inputManager.onMouseDown(
					toCanvasPoint(event.clientX, event.clientY),
				),
			{ signal },
		);
		this.canvas.addEventListener(
			"mousemove",
			(event) =>
				this.inputManager.onMouseMove(
					toCanvasPoint(event.clientX, event.clientY),
				),
			{ signal },
		);
		this.canvas.addEventListener(
			"mouseup",
			(event) => {
				this.inputManager.onMouseMove(
					toCanvasPoint(event.clientX, event.clientY),
				);
				this.inputManager.onMouseUp();
			},
			{ signal },
		);
		this.canvas.addEventListener(
			"mouseleave",
			() => this.inputManager.onMouseLeave(),
			{
				signal,
			},
		);
		this.canvas.addEventListener(
			"touchstart",
			(event) =>
				this.inputManager.onTouchStart(
					Array.from(event.touches, (touch) => ({
						...toCanvasPoint(touch.clientX, touch.clientY),
						identifier: touch.identifier,
					})),
				),
			{ passive: true, signal },
		);
		this.canvas.addEventListener(
			"touchmove",
			(event) => {
				if (!this.config.mobileScrollSupport) {
					event.preventDefault();
				}
				this.inputManager.onTouchMove(
					Array.from(event.touches, (touch) => ({
						...toCanvasPoint(touch.clientX, touch.clientY),
						identifier: touch.identifier,
					})),
				);
			},
			{ passive: false, signal },
		);
		this.canvas.addEventListener(
			"touchend",
			(event) =>
				this.inputManager.onTouchEnd(
					Array.from(event.changedTouches, (touch) => ({
						...toCanvasPoint(touch.clientX, touch.clientY),
						identifier: touch.identifier,
					})),
				),
			{ signal },
		);
		this.canvas.addEventListener(
			"touchcancel",
			() => this.inputManager.onTouchCancel(),
			{
				signal,
			},
		);
		this.canvas.addEventListener(
			"keydown",
			(event) => this.inputManager.onKeyDown(event),
			{
				signal,
			},
		);
		this.canvas.addEventListener(
			"wheel",
			(event) => this.inputManager.onWheel(event),
			{
				passive: false,
				signal,
			},
		);
		this.resizeObserver =
			typeof ResizeObserver === "undefined"
				? null
				: new ResizeObserver(() => this.onResize());
		this.resizeObserver?.observe(this.container);
	}
	/** Bind unified input events from InputManager. */
	private bindInputEvents(): void {
		const listener: InputEventListener = (event: InputEvent) => {
			switch (event.type) {
				case "dragStart":
					if (event.corner && this.config.showPageCorners) {
						this.runtime.flipCorner = event.corner;
						this.setState("user_fold");
					}
					break;
				case "dragMove":
					if (event.corner && event.currentPoint) {
						const pageRect =
							this.currentLayout?.pageRect ?? this.runtime.bounds;
						const angle = calculateFoldAngle(
							pageRect,
							event.corner,
							event.currentPoint,
						);
						const progress = calculateFoldProgress(angle);
						if (progress > 0.1) {
							this.setState("fold_corner");
						}
						this.renderFrame(
							progress,
							event.corner,
							this.runtime.flipDirection,
						);
					}
					break;
				case "dragEnd":
					void this.handleDragEnd(event);
					break;
				case "click":
					if (event.keyboardAction === "next") {
						void this.flipNext();
					} else if (event.keyboardAction === "prev") {
						void this.flipPrev();
					}
					break;
				case "swipe":
					if (event.swipeDirection === "next") {
						void this.flipNext();
					} else if (event.swipeDirection === "prev") {
						void this.flipPrev();
					}
					break;
				case "keyAction":
					if (event.keyboardAction) {
						this.handleKeyAction(event.keyboardAction);
					}
					break;
				case "wheelZoom":
					break;
				case "wheelScroll":
					if (event.scrollDirection === "left") {
						void this.flipNext();
					} else if (event.scrollDirection === "right") {
						void this.flipPrev();
					}
					break;
				default:
					break;
			}
		};

		this.inputUnsubscribe = this.inputManager.onInput(listener);
	}
	/** Emit initialization event. */
	private emitInit(): void {
		this.dispatchEvent(new CustomEvent(EVENT_NAMES.INIT, { detail: this }));
	}
	/** Calculate layout using the layout calculator. */
	private calculateLayout(): void {
		this.currentLayout = this.layoutCalculator.calculate(
			this.container.getBoundingClientRect(),
			this.config,
		);
		this.runtime.bounds = this.currentLayout.pageRect;
		this.runtime.orientation = this.currentLayout.orientation;
		this.inputManager.setPageRect(this.currentLayout.pageRect);
		this.resizeCanvas();
	}
	/** Resize canvas backing store. */
	private resizeCanvas(): void {
		if (!this.currentLayout) {
			return;
		}
		const dpr = window.devicePixelRatio || 1;
		this.canvas.width = this.currentLayout.pageRect.width * dpr;
		this.canvas.height = this.currentLayout.pageRect.height * dpr;
		this.runtime.renderer?.resize(
			this.currentLayout.pageRect.width,
			this.currentLayout.pageRect.height,
			dpr,
		);
	}
	/** Get the current page rectangle. */
	private getCurrentPageRect(): Rect {
		return this.currentLayout?.pageRect ?? this.runtime.bounds;
	}
	/** Handle drag end (mouse up or touch end). */
	private async handleDragEnd(event: InputEvent): Promise<void> {
		if (!event.corner || !this.currentLayout || !event.currentPoint) {
			this.setState("read");
			this.render();
			return;
		}

		const pageRect = this.currentLayout.pageRect;
		const angle = calculateFoldAngle(
			pageRect,
			event.corner,
			event.currentPoint,
		);
		const progress = calculateFoldProgress(angle);

		if (progress > 0.5) {
			await this.runFlip(this.runtime.pageIndex + 1, event.corner);
			return;
		}

		this.setState("read");
		this.render();
	}
	/** Handle keyboard actions. */
	private handleKeyAction(action: string): void {
		switch (action) {
			case "next":
				void this.flipNext();
				return;
			case "prev":
				void this.flipPrev();
				return;
			case "first":
				void this.turnToPage(0);
				return;
			case "last":
				void this.turnToPage(this.pageCount - 1);
				return;
			case "zoomIn":
			case "zoomOut":
			case "zoomReset":
			case "fullscreen":
				return;
		}
	}
	/** Handle resize updates. */
	private onResize(): void {
		this.calculateLayout();
		const orientationEvent = this.orientationManager.updateOrientation(
			this.container.getBoundingClientRect(),
			this.config,
		);
		if (orientationEvent) {
			this.emitOrientationChange(orientationEvent.previousOrientation);
		}
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
