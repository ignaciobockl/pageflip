/**
 * PageFlipBook Custom Element
 *
 * Framework-agnostic web component for page flip book.
 * Uses Shadow DOM for style encapsulation.
 * SSR-friendly with declarative shadow DOM support.
 * @packageDocumentation
 */
import { FlipEngine as PageFlip } from "@pageflip/core";
import type {
	FlipCorner,
	PageDensity,
	PageFlipConfig,
	PageFlipInstance,
	PageOrientation,
	PageSource,
} from "@pageflip/core";

/**
 * PageFlipBook element tag name
 */
export const PAGE_FLIP_BOOK_TAG = "page-flip-book";

/**
 * Default configuration
 */
const DEFAULT_CONFIG: PageFlipConfig = {
	width: 800,
	height: 600,
	size: "stretch",
	flippingTime: 1000,
	drawShadow: true,
	maxShadowOpacity: 0.5,
	showCover: false,
	usePortrait: true,
	mobileScrollSupport: true,
	swipeDistance: 30,
	clickEventForward: true,
	disableFlipByClick: false,
	showPageCorners: true,
};

/**
 * Observed attributes for reactive updates
 */
const OBSERVED_ATTRIBUTES = [
	"width",
	"height",
	"size",
	"flipping-time",
	"draw-shadow",
	"max-shadow-opacity",
	"show-cover",
	"use-portrait",
	"mobile-scroll-support",
	"swipe-distance",
	"click-event-forward",
	"disable-flip-by-click",
	"show-page-corners",
	"renderer",
	"theme",
	"aria-label",
	"aria-label-prev",
	"aria-label-next",
] as const;

const BOOLEAN_ATTRIBUTES = new Set<string>([
	"draw-shadow",
	"show-cover",
	"use-portrait",
	"mobile-scroll-support",
	"click-event-forward",
	"disable-flip-by-click",
	"show-page-corners",
]);

const NUMBER_ATTRIBUTES = new Set<string>([
	"width",
	"height",
	"flipping-time",
	"max-shadow-opacity",
	"swipe-distance",
	"min-width",
	"max-width",
	"min-height",
	"max-height",
]);

const STRING_CONFIG_ATTRIBUTES = new Set<string>([
	"size",
	"renderer",
	"aria-label",
	"aria-label-prev",
	"aria-label-next",
]);

type ConfigAttributeName =
	| "width"
	| "height"
	| "size"
	| "flippingTime"
	| "drawShadow"
	| "maxShadowOpacity"
	| "showCover"
	| "usePortrait"
	| "mobileScrollSupport"
	| "swipeDistance"
	| "clickEventForward"
	| "disableFlipByClick"
	| "showPageCorners"
	| "renderer"
	| "ariaLabel"
	| "ariaLabelPrev"
	| "ariaLabelNext"
	| "minWidth"
	| "maxWidth"
	| "minHeight"
	| "maxHeight";

/**
 * PageFlipBook - Custom Element for page flip
 *
 * @example
 * ```html
 * <page-flip-book width="800" height="600" size="stretch">
 *   <div slot="pages">
 *     <div slot="page-0">Page 1</div>
 *     <div slot="page-1">Page 2</div>
 *   </div>
 *   <page-flip-toolbar slot="toolbar" position="bottom"></page-flip-toolbar>
 * </page-flip-book>
 * ```
 *
 * @example
 * ```js
 * const book = document.querySelector('page-flip-book');
 * book.flipNext();
 * book.turnToPage(5);
 * book.addEventListener('flip', (e) => console.log(e.detail.pageIndex));
 * ```
 */
export class PageFlipBook extends HTMLElement {
	#shadow: ShadowRoot;
	#instance: PageFlipInstance | null = null;
	#config: PageFlipConfig;
	#initialized = false;
	#resizeObserver: ResizeObserver | null = null;
	#mutationObserver: MutationObserver | null = null;

	/**
	 * Create element
	 */
	constructor() {
		super();
		this.#shadow = this.attachShadow({ mode: "open", delegatesFocus: true });
		this.#config = { ...DEFAULT_CONFIG };
		this.#render();
	}

	/**
	 * Observed attributes for reactive updates
	 */
	static get observedAttributes(): string[] {
		return [...OBSERVED_ATTRIBUTES];
	}

	/**
	 * Called when element is connected to DOM
	 */
	connectedCallback(): void {
		if (this.#initialized) {
			return;
		}

		this.#parseAttributes();
		this.#setupResizeObserver();
		this.#setupMutationObserver();
		void this.#initializePageFlip();
	}

	/**
	 * Called when element is disconnected from DOM
	 */
	disconnectedCallback(): void {
		this.#cleanup();
	}

	/**
	 * Called when observed attribute changes
	 * @param name - Attribute name
	 * @param oldValue - Previous value
	 * @param newValue - Next value
	 */
	attributeChangedCallback(
		name: string,
		oldValue: string | null,
		newValue: string | null,
	): void {
		if (oldValue === newValue) {
			return;
		}

		this.#parseAttribute(name, newValue);

		if (this.#initialized && this.#instance) {
			this.#instance.updateConfig(this.#config);
		}
	}

	/**
	 * Parse all attributes
	 */
	#parseAttributes(): void {
		for (const attribute of OBSERVED_ATTRIBUTES) {
			this.#parseAttribute(attribute, this.getAttribute(attribute));
		}
	}

	/**
	 * Parse single attribute
	 * @param name - Attribute name
	 * @param value - Attribute value
	 */
	#parseAttribute(name: string, value: string | null): void {
		if (name === "theme") {
			if (value === null) {
				this.removeAttribute("data-theme");
				return;
			}

			this.setAttribute("data-theme", value);
			return;
		}

		if (value === null) {
			return;
		}

		const configKey = this.#toConfigAttributeName(name);

		if (BOOLEAN_ATTRIBUTES.has(name)) {
			this.#setConfigValue(configKey, value !== "false");
			return;
		}

		if (NUMBER_ATTRIBUTES.has(name)) {
			const numberValue = Number.parseFloat(value);

			if (!Number.isNaN(numberValue)) {
				this.#setConfigValue(configKey, numberValue);
			}

			return;
		}

		if (STRING_CONFIG_ATTRIBUTES.has(name)) {
			this.#setConfigValue(configKey, value);
			if (name === "aria-label") {
				this.#bookElement?.setAttribute("aria-label", value);
			}
		}
	}

	/**
	 * Render shadow DOM template
	 */
	#render(): void {
		this.#shadow.innerHTML = `
			<style>
				:host {
					display: block;
					width: 100%;
					height: 100%;
					contain: layout style paint;
				}

				.pf-book {
					width: 100%;
					height: 100%;
					position: relative;
					overflow: hidden;
					background: var(--pf-color-bg, #ffffff);
				}

				.pf-book__canvas {
					width: 100%;
					height: 100%;
					display: block;
				}

				.pf-book__loading {
					position: absolute;
					inset: 0;
					display: flex;
					align-items: center;
					justify-content: center;
					background: var(--pf-color-bg, #ffffff);
					z-index: 10;
				}

				.pf-book__spinner {
					width: 32px;
					height: 32px;
					border: 3px solid var(--pf-color-border, #e2e8f0);
					border-top-color: var(--pf-color-primary, #3b82f6);
					border-radius: 50%;
					animation: pf-spin 1s linear infinite;
				}

				@keyframes pf-spin {
					from { transform: rotate(0deg); }
					to { transform: rotate(360deg); }
				}

				::slotted([slot="pages"]) {
					display: none;
				}

				::slotted([slot="toolbar"]) {
					position: absolute;
					bottom: 0;
					left: 0;
					right: 0;
					z-index: 100;
				}

				::slotted([slot="page-corner"]) {
					position: absolute;
					z-index: 10;
					touch-action: none;
				}

				:host([data-theme="dark"]) {
					color-scheme: dark;
				}

				:host([data-theme="light"]) {
					color-scheme: light;
				}
			</style>

			<div class="pf-book" part="book" role="region" aria-roledescription="book">
				<canvas class="pf-book__canvas" part="canvas" aria-hidden="true"></canvas>

				<div class="pf-book__loading" part="loading" aria-busy="true" aria-label="Loading flip book">
					<div class="pf-book__spinner" part="spinner"></div>
				</div>

				<slot name="pages" part="pages-slot"></slot>
				<slot name="toolbar" part="toolbar-slot"></slot>
				<slot name="page-corner-top-left" part="corner-top-left"></slot>
				<slot name="page-corner-top-right" part="corner-top-right"></slot>
				<slot name="page-corner-bottom-left" part="corner-bottom-left"></slot>
				<slot name="page-corner-bottom-right" part="corner-bottom-right"></slot>
			</div>
		`;

		const ariaLabel = this.getAttribute("aria-label") ?? this.#config.ariaLabel;
		if (ariaLabel) {
			this.#bookElement?.setAttribute("aria-label", ariaLabel);
		}
	}

	/**
	 * Initialize PageFlip core
	 */
	async #initializePageFlip(): Promise<void> {
		const container = this.#bookElement;
		const placeholderCanvas = this.#placeholderCanvas;
		const loadingElement = this.#loadingElement;

		if (!container || !placeholderCanvas || !loadingElement) {
			return;
		}

		try {
			this.#instance = new PageFlip(container, this.#config);
			placeholderCanvas.remove();
			await this.#loadFromSlots();
			loadingElement.style.display = "none";
			this.#initialized = true;
			this.dispatchEvent(
				new CustomEvent("init", {
					detail: this.#instance,
					bubbles: true,
					composed: true,
				}),
			);
			this.#forwardEvents();
		} catch (error: unknown) {
			console.error("[PageFlipBook] Failed to initialize:", error);
			this.dispatchEvent(
				new CustomEvent("error", {
					detail: error instanceof Error ? error : new Error(String(error)),
					bubbles: true,
					composed: true,
				}),
			);
		}
	}

	/**
	 * Load content from slots
	 */
	async #loadFromSlots(): Promise<void> {
		if (!this.#instance) {
			return;
		}

		const pagesSlot = this.#shadow.querySelector(
			'slot[name="pages"]',
		) as HTMLSlotElement | null;

		if (!pagesSlot) {
			return;
		}

		const assignedElements = pagesSlot.assignedElements() as HTMLElement[];
		const pageElements = assignedElements.flatMap((element) => {
			const children = [...element.children].filter(
				(child): child is HTMLElement => child instanceof HTMLElement,
			);

			return children.length > 0 ? children : [element];
		});

		if (pageElements.length > 0) {
			await this.#instance.loadFromHtml(pageElements);
			return;
		}

		const sources: PageSource[] = [];
		const pageItems = [...this.querySelectorAll("[slot^='page-']")].filter(
			(item): item is HTMLElement => item instanceof HTMLElement,
		);

		for (const [index, item] of pageItems.entries()) {
			const slotName = item.getAttribute("slot");
			const pageIndex = Number.parseInt(
				slotName?.replace("page-", "") ?? String(index),
				10,
			);

			if (item instanceof HTMLImageElement) {
				sources.push({
					type: "image",
					content: item.getAttribute("src") ?? "",
					density: this.#getPageDensity(item),
					metadata: { pageIndex },
				});
				continue;
			}

			sources.push({
				type: "html",
				content: item,
				density: this.#getPageDensity(item),
				metadata: { pageIndex },
			});
		}

		if (sources.length > 0) {
			sources.sort((left, right) => {
				const leftPageIndex = this.#getSourcePageIndex(left.metadata);
				const rightPageIndex = this.#getSourcePageIndex(right.metadata);
				return leftPageIndex - rightPageIndex;
			});
			await this.#instance.loadFromSources(sources);
		}
	}

	/**
	 * Forward PageFlip events as CustomEvents
	 */
	#forwardEvents(): void {
		if (!this.#instance) {
			return;
		}

		const eventMap = [
			["flip", "flip"],
			["statechange", "statechange"],
			["orientationchange", "orientationchange"],
			["update", "update"],
			["error", "error"],
		] as const;

		for (const [pageFlipEvent, customEventName] of eventMap) {
			this.#instance.addEventListener(pageFlipEvent, (event: Event) => {
				const customEvent = event as CustomEvent<unknown>;
				this.dispatchEvent(
					new CustomEvent(customEventName, {
						detail: customEvent.detail,
						bubbles: true,
						composed: true,
					}),
				);
			});
		}
	}

	/**
	 * Setup resize observer
	 */
	#setupResizeObserver(): void {
		this.#resizeObserver = new ResizeObserver(() => {
			this.#instance?.updateConfig({});
		});

		this.#resizeObserver.observe(this);
	}

	/**
	 * Setup mutation observer for slot changes
	 */
	#setupMutationObserver(): void {
		this.#mutationObserver = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (
					mutation.type === "childList" &&
					this.#initialized &&
					this.#instance
				) {
					void this.#loadFromSlots();
				}
			}
		});

		this.#mutationObserver.observe(this, {
			childList: true,
			subtree: true,
		});
	}

	/**
	 * Cleanup resources
	 */
	#cleanup(): void {
		this.#resizeObserver?.disconnect();
		this.#mutationObserver?.disconnect();
		this.#resizeObserver = null;
		this.#mutationObserver = null;
		this.#instance?.destroy();
		this.#instance = null;
		this.#initialized = false;
	}

	/**
	 * Convert attribute name to config key
	 * @param name - Attribute name
	 * @returns Config key
	 */
	#toConfigAttributeName(name: string): ConfigAttributeName {
		return name.replace(/-([a-z])/g, (_, letter: string) =>
			letter.toUpperCase(),
		) as ConfigAttributeName;
	}

	/**
	 * Set config value
	 * @param key - Config key
	 * @param value - Config value
	 */
	#setConfigValue<K extends keyof PageFlipConfig>(
		key: K,
		value: PageFlipConfig[K],
	): void {
		this.#config = {
			...this.#config,
			[key]: value,
		};
	}

	/**
	 * Get page density from element
	 * @param element - Page element
	 * @returns Page density
	 */
	#getPageDensity(element: HTMLElement): PageDensity {
		return element.getAttribute("data-density") === "hard" ? "hard" : "soft";
	}

	/**
	 * Read page index from source metadata
	 * @param metadata - Source metadata
	 * @returns Page index
	 */
	#getSourcePageIndex(metadata: unknown): number {
		if (
			typeof metadata === "object" &&
			metadata !== null &&
			"pageIndex" in metadata &&
			typeof metadata.pageIndex === "number"
		) {
			return metadata.pageIndex;
		}

		return 0;
	}

	/**
	 * Get book root element
	 */
	get #bookElement(): HTMLElement | null {
		return this.#shadow.querySelector(".pf-book");
	}

	/**
	 * Get loading element
	 */
	get #loadingElement(): HTMLElement | null {
		return this.#shadow.querySelector(".pf-book__loading");
	}

	/**
	 * Get placeholder canvas
	 */
	get #placeholderCanvas(): HTMLCanvasElement | null {
		return this.#shadow.querySelector(".pf-book__canvas");
	}

	/**
	 * Get PageFlip instance
	 */
	get instance(): PageFlipInstance | null {
		return this.#instance;
	}

	/**
	 * Flip to next page with animation
	 * @param corner - Corner to flip from
	 */
	flipNext(corner?: FlipCorner): Promise<void> {
		return this.#instance?.flipNext(corner) ?? Promise.resolve();
	}

	/**
	 * Flip to previous page with animation
	 * @param corner - Corner to flip from
	 */
	flipPrev(corner?: FlipCorner): Promise<void> {
		return this.#instance?.flipPrev(corner) ?? Promise.resolve();
	}

	/**
	 * Flip to specific page with animation
	 * @param pageIndex - Page index
	 * @param corner - Corner to flip from
	 */
	flip(pageIndex: number, corner?: FlipCorner): Promise<void> {
		return this.#instance?.flip(pageIndex, corner) ?? Promise.resolve();
	}

	/**
	 * Jump to page without animation
	 * @param pageIndex - Page index
	 */
	turnToPage(pageIndex: number): Promise<void> {
		return this.#instance?.turnToPage(pageIndex) ?? Promise.resolve();
	}

	/**
	 * Jump to next page without animation
	 */
	turnToNextPage(): Promise<void> {
		return this.#instance?.turnToNextPage() ?? Promise.resolve();
	}

	/**
	 * Jump to previous page without animation
	 */
	turnToPrevPage(): Promise<void> {
		return this.#instance?.turnToPrevPage() ?? Promise.resolve();
	}

	/**
	 * Load pages from HTML elements
	 * @param elements - HTML elements
	 */
	loadFromHtml(elements: HTMLElement[]): Promise<void> {
		return this.#instance?.loadFromHtml(elements) ?? Promise.resolve();
	}

	/**
	 * Load pages from image URLs
	 * @param urls - Image URLs
	 */
	loadFromImages(urls: string[]): Promise<void> {
		return this.#instance?.loadFromImages(urls) ?? Promise.resolve();
	}

	/**
	 * Load pages from mixed sources
	 * @param sources - Page sources
	 */
	loadFromSources(sources: PageSource[]): Promise<void> {
		return this.#instance?.loadFromSources(sources) ?? Promise.resolve();
	}

	/**
	 * Update pages from HTML elements
	 * @param elements - HTML elements
	 */
	updateFromHtml(elements: HTMLElement[]): Promise<void> {
		return this.#instance?.updateFromHtml(elements) ?? Promise.resolve();
	}

	/**
	 * Update pages from image URLs
	 * @param urls - Image URLs
	 */
	updateFromImages(urls: string[]): Promise<void> {
		return this.#instance?.updateFromImages(urls) ?? Promise.resolve();
	}

	/**
	 * Switch renderer
	 * @param rendererId - Renderer ID
	 */
	setRenderer(rendererId: "canvas2d" | "webgl"): Promise<void> {
		return this.#instance?.setRenderer(rendererId) ?? Promise.resolve();
	}

	/**
	 * Get current page index
	 */
	get currentPageIndex(): number {
		return this.#instance?.currentPageIndex ?? 0;
	}

	/**
	 * Get total page count
	 */
	get pageCount(): number {
		return this.#instance?.pageCount ?? 0;
	}

	/**
	 * Get current orientation
	 */
	get orientation(): PageOrientation {
		return this.#instance?.orientation ?? "portrait";
	}

	/**
	 * Get current flip state
	 */
	get state(): string {
		return this.#instance?.state ?? "idle";
	}

	/**
	 * Get bounds rectangle
	 */
	get bounds(): DOMRect | null {
		if (!this.#instance) {
			return null;
		}

		const { x, y, width, height } = this.#instance.bounds;
		return new DOMRect(x, y, width, height);
	}

	/**
	 * Update configuration
	 * @param config - Partial config
	 */
	updateConfig(config: Partial<PageFlipConfig>): void {
		this.#config = { ...this.#config, ...config };
		this.#instance?.updateConfig(this.#config);
	}

	/**
	 * Destroy component
	 */
	destroy(): void {
		this.#cleanup();
		this.remove();
	}
}

if (!customElements.get(PAGE_FLIP_BOOK_TAG)) {
	customElements.define(PAGE_FLIP_BOOK_TAG, PageFlipBook);
}

declare global {
	interface HTMLElementTagNameMap {
		"page-flip-book": PageFlipBook;
	}
}
