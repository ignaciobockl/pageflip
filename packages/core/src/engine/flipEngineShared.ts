import {
	ARIA_LABELS,
	DEFAULT_FLIPPING_TIME,
	DEFAULT_MAX_SHADOW_OPACITY,
	DEFAULT_SWIPE_DISTANCE,
	MAX_HEIGHT,
	MAX_WIDTH,
	MIN_HEIGHT,
	MIN_WIDTH,
} from "../constants";
import type {
	PageData,
	PageFlipConfig,
	PageOrientation,
	PageSource,
	Rect,
} from "../types";

/**
 * Default configuration values.
 */
export const DEFAULT_CONFIG: Required<PageFlipConfig> = {
	width: 800,
	height: 600,
	size: "fixed",
	minWidth: MIN_WIDTH,
	maxWidth: MAX_WIDTH,
	minHeight: MIN_HEIGHT,
	maxHeight: MAX_HEIGHT,
	flippingTime: DEFAULT_FLIPPING_TIME,
	drawShadow: true,
	maxShadowOpacity: DEFAULT_MAX_SHADOW_OPACITY,
	showCover: false,
	usePortrait: true,
	mobileScrollSupport: true,
	swipeDistance: DEFAULT_SWIPE_DISTANCE,
	clickEventForward: true,
	disableFlipByClick: false,
	showPageCorners: true,
	renderer: "auto",
	rendererOptions: {},
	ariaLabel: ARIA_LABELS.BOOK_REGION,
	ariaLabelPrev: ARIA_LABELS.PREV_BUTTON,
	ariaLabelNext: ARIA_LABELS.NEXT_BUTTON,
};

/**
 * Calculate layout bounds for the book viewport.
 */
export function calculateLayoutBounds(
	containerRect: DOMRect,
	config: Required<PageFlipConfig>,
): { bounds: Rect; orientation: PageOrientation } {
	const targetWidth =
		config.size === "stretch"
			? Math.min(
					Math.max(containerRect.width, config.minWidth),
					config.maxWidth,
				)
			: config.width;
	const targetHeight =
		config.size === "stretch"
			? Math.min(
					Math.max(containerRect.height, config.minHeight),
					config.maxHeight,
				)
			: config.height;
	const scale = Math.min(
		containerRect.width / targetWidth,
		containerRect.height / targetHeight,
	);
	return {
		orientation:
			config.usePortrait && targetWidth <= targetHeight
				? "portrait"
				: "landscape",
		bounds: {
			x: (containerRect.width - targetWidth * scale) / 2,
			y: (containerRect.height - targetHeight * scale) / 2,
			width: targetWidth * scale,
			height: targetHeight * scale,
		},
	};
}

/**
 * Create pages from HTML elements.
 */
export function createHtmlPages(elements: HTMLElement[]): PageData[] {
	return elements.map((element, index) => ({
		id: `page-${index}`,
		index,
		density: "soft",
		content: { type: "html", element },
	}));
}

/**
 * Create pages from image URLs.
 */
export function createImagePages(urls: string[]): PageData[] {
	return urls.map((src, index) => ({
		id: `page-${index}`,
		index,
		density: "soft",
		content: { type: "image", src, alt: `Page ${index + 1}` },
	}));
}

/**
 * Create pages from mixed sources.
 */
export function createSourcePages(sources: PageSource[]): PageData[] {
	return sources.map((source, index) => ({
		id: `page-${index}`,
		index,
		density: source.density ?? "soft",
		content:
			source.type === "html"
				? { type: "html", element: source.content as HTMLElement }
				: source.type === "image"
					? { type: "image", src: source.content as string }
					: {
							type: "renderer",
							rendererId: source.rendererId ?? "custom",
							source: source.content,
						},
		metadata: source.metadata,
	}));
}
