/**
 * Wheel Handler
 *
 * Handles wheel events for zoom and scroll interactions.
 * Designed for future zoom/pan functionality with WebGL renderer.
 * @packageDocumentation
 */

/**
 * Wheel handler configuration
 */
export interface WheelHandlerConfig {
	/** Enable zoom via wheel (Ctrl/Cmd + wheel) */
	enableZoom: boolean;
	/** Enable horizontal scroll for navigation */
	enableHorizontalScroll: boolean;
	/** Zoom sensitivity factor */
	zoomSensitivity: number;
	/** Minimum zoom level */
	minZoom: number;
	/** Maximum zoom level */
	maxZoom: number;
	/** Scroll threshold for navigation (px) */
	scrollThreshold: number;
	/** Debounce time for scroll events (ms) */
	debounceMs: number;
}

/**
 * Wheel delta information
 */
export interface WheelDelta {
	/** Horizontal delta */
	deltaX: number;
	/** Vertical delta */
	deltaY: number;
	/** Delta mode (0=pixel, 1=line, 2=page) */
	deltaMode: number;
}

/**
 * Wheel handler result
 */
export interface WheelHandlerResult {
	/** Whether event was handled */
	handled: boolean;
	/** Action type */
	action: "zoom" | "scroll" | "none";
	/** Zoom delta (for zoom action) */
	zoomDelta: number;
	/** Scroll direction (for scroll action) */
	scrollDirection: "left" | "right" | "up" | "down" | null;
	/** Whether modifier key was pressed */
	ctrlKey: boolean;
	shiftKey: boolean;
	metaKey: boolean;
}

/**
 * WheelHandler - Pure wheel event handling
 *
 * No side effects, fully testable, prepared for zoom/pan.
 */
export class WheelHandler {
	private config: WheelHandlerConfig;
	private lastScrollTime = 0;
	private accumulatedDeltaX = 0;
	private accumulatedDeltaY = 0;

	/**
	 * Create wheel handler
	 * @param config - Handler configuration
	 */
	constructor(config: Partial<WheelHandlerConfig> = {}) {
		this.config = {
			enableZoom: true,
			enableHorizontalScroll: true,
			zoomSensitivity: 0.001,
			minZoom: 0.25,
			maxZoom: 5,
			scrollThreshold: 50,
			debounceMs: 16,
			...config,
		};
	}

	/**
	 * Update handler configuration
	 * @param config - New configuration
	 */
	setConfig(config: Partial<WheelHandlerConfig>): void {
		this.config = { ...this.config, ...config };
	}

	/**
	 * Handle wheel event
	 *
	 * @param event - Wheel event
	 * @returns Handler result
	 */
	onWheel(event: WheelEvent): WheelHandlerResult {
		const now = Date.now();
		const delta = this.normalizeDelta(event);
		const isZoomModifier = event.ctrlKey || event.metaKey;

		if (now - this.lastScrollTime < this.config.debounceMs) {
			this.accumulatedDeltaX += delta.deltaX;
			this.accumulatedDeltaY += delta.deltaY;
			return {
				handled: false,
				action: "none",
				zoomDelta: 0,
				scrollDirection: null,
				ctrlKey: event.ctrlKey,
				shiftKey: event.shiftKey,
				metaKey: event.metaKey,
			};
		}

		this.lastScrollTime = now;
		const totalDeltaX = this.accumulatedDeltaX + delta.deltaX;
		const totalDeltaY = this.accumulatedDeltaY + delta.deltaY;
		this.accumulatedDeltaX = 0;
		this.accumulatedDeltaY = 0;

		const result: WheelHandlerResult = {
			handled: false,
			action: "none",
			zoomDelta: 0,
			scrollDirection: null,
			ctrlKey: event.ctrlKey,
			shiftKey: event.shiftKey,
			metaKey: event.metaKey,
		};

		if (this.config.enableZoom && isZoomModifier && totalDeltaY !== 0) {
			result.handled = true;
			result.action = "zoom";
			result.zoomDelta = -totalDeltaY * this.config.zoomSensitivity;
			event.preventDefault();
			return result;
		}

		if (
			this.config.enableHorizontalScroll &&
			Math.abs(totalDeltaX) > Math.abs(totalDeltaY)
		) {
			if (Math.abs(totalDeltaX) >= this.config.scrollThreshold) {
				result.handled = true;
				result.action = "scroll";
				result.scrollDirection = totalDeltaX > 0 ? "right" : "left";
				event.preventDefault();
			}

			return result;
		}

		if (Math.abs(totalDeltaY) >= this.config.scrollThreshold) {
			result.handled = true;
			result.action = "scroll";
			result.scrollDirection = totalDeltaY > 0 ? "down" : "up";
		}

		return result;
	}

	/**
	 * Normalize wheel delta across browsers
	 *
	 * @param event - Wheel event
	 * @returns Normalized delta
	 * @private
	 */
	private normalizeDelta(event: WheelEvent): WheelDelta {
		const { deltaX, deltaY, deltaMode } = event;

		let multiplier = 1;
		if (deltaMode === 1) {
			multiplier = 16;
		} else if (deltaMode === 2) {
			multiplier = 400;
		}

		return {
			deltaX: deltaX * multiplier,
			deltaY: deltaY * multiplier,
			deltaMode,
		};
	}

	/**
	 * Get current zoom configuration
	 */
	getZoomConfig(): { minZoom: number; maxZoom: number; sensitivity: number } {
		return {
			minZoom: this.config.minZoom,
			maxZoom: this.config.maxZoom,
			sensitivity: this.config.zoomSensitivity,
		};
	}

	/**
	 * Reset accumulated deltas
	 */
	reset(): void {
		this.accumulatedDeltaX = 0;
		this.accumulatedDeltaY = 0;
		this.lastScrollTime = 0;
	}

	/**
	 * Check if zoom is enabled
	 */
	isZoomEnabled(): boolean {
		return this.config.enableZoom;
	}

	/**
	 * Check if horizontal scroll is enabled
	 */
	isHorizontalScrollEnabled(): boolean {
		return this.config.enableHorizontalScroll;
	}
}
