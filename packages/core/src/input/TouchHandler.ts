/**
 * Touch Handler
 *
 * Handles touch events for page flip interaction on mobile/tablet:
 * touchstart, touchmove, touchend, touchcancel.
 * Uses passive listeners where possible for scroll performance.
 * @packageDocumentation
 */
import { DEFAULT_PAGE_CORNER_SIZE, DEFAULT_SWIPE_DISTANCE } from "../constants";
import type { FlipCorner, Point, Rect } from "../types";

/**
 * Touch event types
 */
export type TouchEventType =
	| "touchstart"
	| "touchmove"
	| "touchend"
	| "touchcancel";

/**
 * Touch handler configuration
 */
export interface TouchHandlerConfig {
	/** Page rectangle for hit testing */
	pageRect: Rect;
	/** Corner hit area size */
	cornerSize: number;
	/** Minimum swipe distance to trigger flip (px) */
	swipeDistance: number;
	/** Whether to prevent default touch behavior during drag */
	preventDefaultOnDrag: boolean;
	/** Whether to support horizontal swipe gestures */
	enableSwipe: boolean;
	/** Maximum time for swipe gesture (ms) */
	swipeTimeout: number;
}

/**
 * Touch interaction result
 */
export interface TouchInteractionResult {
	/** Whether interaction was handled */
	handled: boolean;
	/** Corner hit (if any) */
	corner: FlipCorner | null;
	/** Start point of touch */
	startPoint: Point | null;
	/** Current point */
	currentPoint: Point | null;
	/** Whether dragging */
	isDragging: boolean;
	/** Drag distance */
	dragDistance: number;
	/** Swipe velocity (px/ms) */
	velocity: number;
	/** Swipe direction */
	swipeDirection: "left" | "right" | null;
	/** Touch identifier */
	touchId: number | null;
}

/**
 * Touch point with timestamp
 */
interface TouchPoint extends Point {
	timestamp: number;
}

/**
 * TouchHandler - Pure touch event handling
 *
 * No side effects, fully testable, passive listener compatible.
 */
export class TouchHandler {
	private config: TouchHandlerConfig;
	private state: TouchInteractionResult;
	private touchStartTime = 0;
	private activeTouches: Map<number, TouchPoint> = new Map();

	/**
	 * Create touch handler
	 * @param config - Handler configuration
	 */
	constructor(config: Partial<TouchHandlerConfig> = {}) {
		this.config = {
			pageRect: { x: 0, y: 0, width: 800, height: 600 },
			cornerSize: DEFAULT_PAGE_CORNER_SIZE,
			swipeDistance: DEFAULT_SWIPE_DISTANCE,
			preventDefaultOnDrag: true,
			enableSwipe: true,
			swipeTimeout: 500,
			...config,
		};

		this.state = this.getInitialState();
	}

	/**
	 * Update handler configuration
	 * @param config - New configuration
	 */
	setConfig(config: Partial<TouchHandlerConfig>): void {
		this.config = { ...this.config, ...config };
	}

	/**
	 * Update page rect (called on layout change)
	 * @param pageRect - New page rectangle
	 */
	setPageRect(pageRect: Rect): void {
		this.config.pageRect = pageRect;
	}

	/**
	 * Handle touchstart event
	 *
	 * @param touches - Array of touch points
	 * @returns Interaction result
	 */
	onTouchStart(
		touches: ReadonlyArray<{ x: number; y: number; identifier: number }>,
	): TouchInteractionResult {
		this.state = this.getInitialState();
		this.touchStartTime = Date.now();

		const touch = touches[0];
		if (!touch) {
			return { ...this.state };
		}

		const point: TouchPoint = {
			x: touch.x,
			y: touch.y,
			timestamp: this.touchStartTime,
		};
		this.activeTouches.set(touch.identifier, point);

		this.state.touchId = touch.identifier;
		this.state.startPoint = point;
		this.state.currentPoint = point;

		const corner = this.hitTestCorner(point);
		if (corner) {
			this.state.corner = corner;
			this.state.handled = true;
		}

		return { ...this.state };
	}

	/**
	 * Handle touchmove event
	 *
	 * @param touches - Array of touch points
	 * @returns Interaction result
	 */
	onTouchMove(
		touches: ReadonlyArray<{ x: number; y: number; identifier: number }>,
	): TouchInteractionResult {
		const trackedTouch = touches.find(
			(touch) => touch.identifier === this.state.touchId,
		);
		if (!trackedTouch || !this.state.startPoint) {
			return { ...this.state };
		}

		const point: TouchPoint = {
			x: trackedTouch.x,
			y: trackedTouch.y,
			timestamp: Date.now(),
		};
		this.activeTouches.set(trackedTouch.identifier, point);

		this.state.currentPoint = point;
		this.state.dragDistance = this.calculateDistance(
			this.state.startPoint,
			point,
		);

		if (!this.state.isDragging && this.state.dragDistance >= 10) {
			this.state.isDragging = true;
			this.state.handled = true;
		}

		return { ...this.state };
	}

	/**
	 * Handle touchend event
	 *
	 * @param changedTouches - Array of ended touch points
	 * @returns Final interaction result with swipe detection
	 */
	onTouchEnd(
		changedTouches: ReadonlyArray<{ x: number; y: number; identifier: number }>,
	): TouchInteractionResult {
		const endedTouch = changedTouches.find(
			(touch) => touch.identifier === this.state.touchId,
		);
		if (!endedTouch || !this.state.startPoint || !this.state.currentPoint) {
			const result = { ...this.state };
			this.cleanup();
			return result;
		}

		const endPoint: TouchPoint = {
			x: endedTouch.x,
			y: endedTouch.y,
			timestamp: Date.now(),
		};
		const duration = endPoint.timestamp - this.touchStartTime;

		if (this.config.enableSwipe && duration <= this.config.swipeTimeout) {
			const dx = endPoint.x - this.state.startPoint.x;
			const distance = Math.abs(dx);

			if (distance >= this.config.swipeDistance) {
				this.state.velocity = distance / duration;
				this.state.swipeDirection = dx > 0 ? "right" : "left";
				this.state.handled = true;
			}
		}

		const result = { ...this.state };
		this.cleanup();
		return result;
	}

	/**
	 * Handle touchcancel event
	 *
	 * @returns Final interaction result
	 */
	onTouchCancel(): TouchInteractionResult {
		const result = { ...this.state };
		this.cleanup();
		return result;
	}

	/**
	 * Get current interaction state
	 */
	getState(): TouchInteractionResult {
		return { ...this.state };
	}

	/**
	 * Reset handler state
	 */
	reset(): void {
		this.cleanup();
		this.state = this.getInitialState();
	}

	/**
	 * Hit test page corners
	 *
	 * @param point - Point to test
	 * @returns Corner hit or null
	 */
	hitTestCorner(point: Point): FlipCorner | null {
		const { pageRect, cornerSize } = this.config;
		const { x, y, width, height } = pageRect;

		if (
			point.x >= x &&
			point.x <= x + cornerSize &&
			point.y >= y &&
			point.y <= y + cornerSize
		) {
			return "top";
		}

		if (
			point.x >= x + width - cornerSize &&
			point.x <= x + width &&
			point.y >= y &&
			point.y <= y + cornerSize
		) {
			return "top";
		}

		if (
			point.x >= x &&
			point.x <= x + cornerSize &&
			point.y >= y + height - cornerSize &&
			point.y <= y + height
		) {
			return "bottom";
		}

		if (
			point.x >= x + width - cornerSize &&
			point.x <= x + width &&
			point.y >= y + height - cornerSize &&
			point.y <= y + height
		) {
			return "bottom";
		}

		return null;
	}

	/**
	 * Get flip direction from swipe
	 *
	 * @returns 'next' (swipe left) or 'prev' (swipe right)
	 */
	getFlipDirectionFromSwipe(): "next" | "prev" | null {
		if (!this.state.swipeDirection) {
			return null;
		}

		return this.state.swipeDirection === "left" ? "next" : "prev";
	}

	/**
	 * Whether to prevent default during active drag
	 */
	shouldPreventDefault(): boolean {
		return this.config.preventDefaultOnDrag && this.state.isDragging;
	}

	/**
	 * Clean up state
	 * @private
	 */
	private cleanup(): void {
		this.activeTouches.clear();
		this.touchStartTime = 0;
		this.state.touchId = null;
	}

	/**
	 * Get initial state
	 * @private
	 */
	private getInitialState(): TouchInteractionResult {
		return {
			handled: false,
			corner: null,
			startPoint: null,
			currentPoint: null,
			isDragging: false,
			dragDistance: 0,
			velocity: 0,
			swipeDirection: null,
			touchId: null,
		};
	}

	/**
	 * Calculate distance between two points
	 * @private
	 */
	private calculateDistance(a: Point, b: Point): number {
		const dx = b.x - a.x;
		const dy = b.y - a.y;
		return Math.sqrt(dx * dx + dy * dy);
	}
}
