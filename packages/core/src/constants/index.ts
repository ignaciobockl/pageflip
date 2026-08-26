/**
 * PageFlip Core Constants — Single Source of Truth.
 *
 * All magic numbers, strings, and configuration defaults live here.
 * Import from '@pageflip/core/constants' — never inline values.
 * @packageDocumentation
 */
export const DEFAULT_FLIPPING_TIME = 1000;
export const MIN_FLIPPING_TIME = 200;
export const MAX_FLIPPING_TIME = 5000;
export const DEFAULT_SWIPE_DISTANCE = 30;
export const MIN_SWIPE_DISTANCE = 10;
export const MAX_SWIPE_DISTANCE = 200;
export const DEFAULT_MAX_SHADOW_OPACITY = 0.5;
export const MIN_SHADOW_OPACITY = 0;
export const MAX_SHADOW_OPACITY = 1;
export const SHADOW_BLUR_BASE = 10;
export const SHADOW_BLUR_MAX = 40;
export const SHADOW_OFFSET_BASE = 20;
export const DEFAULT_PAGE_CORNER_SIZE = 48;
export const MIN_PAGE_CORNER_SIZE = 24;
export const MAX_PAGE_CORNER_SIZE = 120;
export const MIN_WIDTH = 200;
export const MAX_WIDTH = 4000;
export const MIN_HEIGHT = 200;
export const MAX_HEIGHT = 4000;
export const RENDERER_PRIORITY = ["webgpu", "webgl", "canvas2d"] as const;
export const DEFAULT_RENDERER = "auto" as const;
export const MAX_TEXTURE_SIZE_FALLBACK = 4096;

/**
 * ARIA label constants.
 */
export const ARIA_LABELS = {
	PREV_BUTTON: "Previous page",
	NEXT_BUTTON: "Next page",
	ZOOM_IN: "Zoom in",
	ZOOM_OUT: "Zoom out",
	ZOOM_RESET: "Reset zoom",
	FULLSCREEN_ENTER: "Enter fullscreen",
	FULLSCREEN_EXIT: "Exit fullscreen",
	PAGE_CORNER: "Turn page",
	PAGE_INDICATOR: "Go to page",
	BOOK_REGION: "Interactive flip book",
} as const;

/**
 * Keyboard shortcuts mapping.
 */
export const KEYBOARD_SHORTCUTS = {
	NEXT: ["ArrowRight", " "] as const,
	PREV: ["ArrowLeft", "Shift+ "] as const,
	FIRST: ["Home"] as const,
	LAST: ["End"] as const,
	ZOOM_IN: ["+", "="] as const,
	ZOOM_OUT: ["-", "_"] as const,
	ZOOM_RESET: ["0"] as const,
	FULLSCREEN: ["f", "F"] as const,
} as const;

/**
 * Event name constants.
 */
export const EVENT_NAMES = {
	INIT: "init",
	UPDATE: "update",
	FLIP: "flip",
	STATE_CHANGE: "statechange",
	ORIENTATION_CHANGE: "orientationchange",
	ERROR: "error",
} as const;

/**
 * CSS class names for styling.
 */
export const CSS_CLASSES = {
	BOOK: "pf-book",
	PAGE: "pf-page",
	PAGE_FRONT: "pf-page--front",
	PAGE_BACK: "pf-page--back",
	CORNER: "pf-corner",
	CORNER_TOP_LEFT: "pf-corner--top-left",
	CORNER_TOP_RIGHT: "pf-corner--top-right",
	CORNER_BOTTOM_LEFT: "pf-corner--bottom-left",
	CORNER_BOTTOM_RIGHT: "pf-corner--bottom-right",
	TOOLBAR: "pf-toolbar",
	PAGE_INDICATOR: "pf-page-indicator",
	ZOOM_CONTROLS: "pf-zoom-controls",
	FULLSCREEN_TOGGLE: "pf-fullscreen-toggle",
	LOADING: "pf-loading",
	SHADOW: "pf-shadow",
	HARD_PAGE: "pf-page--hard",
	RTL: "pf--rtl",
	DARK: "pf--dark",
	REDUCED_MOTION: "pf--reduced-motion",
} as const;

/**
 * Data attribute names.
 */
export const DATA_ATTRS = {
	CURRENT_PAGE: "data-current-page",
	TOTAL_PAGES: "data-total-pages",
	ORIENTATION: "data-orientation",
	STATE: "data-state",
	RENDERER: "data-renderer",
	THEME: "data-theme",
} as const;
