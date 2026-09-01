import type {
	FlipCorner,
	FlipState,
	IRenderer,
	PageFlipConfig,
	PageOrientation,
	PageSource,
	Rect,
} from "./index";

/**
 * Public PageFlip instance interface.
 */
export type PageFlipInstance = EventTarget & {
	/** Total number of pages. */
	readonly pageCount: number;
	/** Current page index (0-based). */
	readonly currentPageIndex: number;
	/** Current orientation. */
	readonly orientation: PageOrientation;
	/** Current flip state. */
	readonly state: FlipState;
	/** Current bounds rectangle. */
	readonly bounds: Rect;
	/** Animate to next page. */
	flipNext: (corner?: FlipCorner) => Promise<void>;
	/** Animate to previous page. */
	flipPrev: (corner?: FlipCorner) => Promise<void>;
	/** Animate to specific page. */
	flip: (pageIndex: number, corner?: FlipCorner) => Promise<void>;
	/** Jump to page without animation. */
	turnToPage: (pageIndex: number) => Promise<void>;
	/** Jump to next page. */
	turnToNextPage: () => Promise<void>;
	/** Jump to previous page. */
	turnToPrevPage: () => Promise<void>;
	/** Load pages from HTML elements. */
	loadFromHtml: (elements: HTMLElement[]) => Promise<void>;
	/** Load pages from image URLs. */
	loadFromImages: (urls: string[]) => Promise<void>;
	/** Load pages from mixed sources. */
	loadFromSources: (sources: PageSource[]) => Promise<void>;
	/** Update pages from HTML elements. */
	updateFromHtml: (elements: HTMLElement[]) => Promise<void>;
	/** Update pages from image URLs. */
	updateFromImages: (urls: string[]) => Promise<void>;
	/** Switch renderer at runtime. */
	setRenderer: (rendererId: "canvas2d" | "webgl") => Promise<void>;
	/** Get current renderer. */
	getRenderer: () => IRenderer;
	/** Destroy instance and cleanup. */
	destroy: () => void;
	/** Update configuration. */
	updateConfig: (config: Partial<PageFlipConfig>) => void;
};

/**
 * Page flip plugin interface.
 */
export type PageFlipPlugin = {
	/** Plugin unique name. */
	name: string;
	/** Plugin version. */
	version: string;
	/** Install plugin. */
	install: (instance: PageFlipInstance) => void | Promise<void>;
	/** Uninstall plugin. */
	uninstall: (instance: PageFlipInstance) => void | Promise<void>;
};

/**
 * Event map for PageFlip EventTarget.
 */
export type PageFlipEventMap = {
	/** Initialization event. */
	init: CustomEvent<PageFlipInstance>;
	/** Update event. */
	update: CustomEvent<PageFlipInstance>;
	/** Flip event. */
	flip: CustomEvent<import("./events").FlipEvent>;
	/** State change event. */
	statechange: CustomEvent<import("./events").StateChangeEvent>;
	/** Orientation change event. */
	orientationchange: CustomEvent<import("./events").OrientationChangeEvent>;
	/** Error event. */
	error: CustomEvent<Error>;
};
