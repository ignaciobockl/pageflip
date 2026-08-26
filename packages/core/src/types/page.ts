/**
 * Page density type.
 */
export type PageDensity = "soft" | "hard";

/**
 * Book orientation.
 */
export type PageOrientation = "portrait" | "landscape";

/**
 * Page corner for flip initiation.
 */
export type FlipCorner = "top" | "bottom";

/**
 * Flip direction.
 */
export type FlipDirection = "next" | "prev";

/**
 * Current flip state machine state.
 */
export type FlipState =
	| "idle"
	| "user_fold"
	| "fold_corner"
	| "flipping"
	| "read";

/**
 * Renderer-specific options.
 */
export type RendererOptions = {
	/** Canvas context attributes. */
	contextAttributes?: CanvasRenderingContext2DSettings;
	/** Enable high DPI rendering. */
	highDPI?: boolean;
};

/**
 * Page flip configuration options.
 */
export type PageFlipConfig = {
	/** Page width in pixels (required). */
	width: number;
	/** Page height in pixels (required). */
	height: number;
	/** Layout mode: fixed size or stretch to container. */
	size?: "fixed" | "stretch";
	/** Minimum width constraint. */
	minWidth?: number;
	/** Maximum width constraint. */
	maxWidth?: number;
	/** Minimum height constraint. */
	minHeight?: number;
	/** Maximum height constraint. */
	maxHeight?: number;
	/** Flip animation duration in milliseconds. */
	flippingTime?: number;
	/** Enable page shadow rendering. */
	drawShadow?: boolean;
	/** Maximum shadow opacity (0-1). */
	maxShadowOpacity?: number;
	/** Show first/last page as cover. */
	showCover?: boolean;
	/** Prefer portrait orientation. */
	usePortrait?: boolean;
	/** Enable mobile scroll during interaction. */
	mobileScrollSupport?: boolean;
	/** Minimum swipe distance to trigger flip (px). */
	swipeDistance?: number;
	/** Forward click events to page content. */
	clickEventForward?: boolean;
	/** Disable flip by clicking page. */
	disableFlipByClick?: boolean;
	/** Show page corner indicators. */
	showPageCorners?: boolean;
	/** Renderer preference. */
	renderer?: "auto" | "canvas2d" | "webgl";
	/** Renderer-specific options. */
	rendererOptions?: RendererOptions;
	/** ARIA label for book region. */
	ariaLabel?: string;
	/** ARIA label for previous button. */
	ariaLabelPrev?: string;
	/** ARIA label for next button. */
	ariaLabelNext?: string;
};

/**
 * Page content types.
 */
export type PageContent =
	| { type: "html"; element: HTMLElement }
	| { type: "image"; src: string; alt?: string }
	| { type: "renderer"; rendererId: string; source: unknown };

/**
 * Page data structure.
 */
export type PageData<T = unknown> = {
	/** Unique page identifier. */
	id: string;
	/** Zero-based page index. */
	index: number;
	/** Page density. */
	density: PageDensity;
	/** Page content. */
	content: PageContent;
	/** Custom metadata. */
	metadata?: T;
};

/**
 * Page source for loading.
 */
export type PageSource = {
	/** Source type. */
	type: "html" | "image" | "renderer";
	/** Content data. */
	content: HTMLElement | string | unknown;
	/** Page density. */
	density?: PageDensity;
	/** Renderer ID for renderer type. */
	rendererId?: string;
	/** Custom metadata. */
	metadata?: unknown;
};
