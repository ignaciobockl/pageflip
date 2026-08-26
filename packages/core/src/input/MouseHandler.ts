/**
 * Mouse Handler
 *
 * Handles mouse events for page flip interaction:
 * mousedown, mousemove, mouseup, mouseleave, click, dblclick.
 * @packageDocumentation
 */
import { DEFAULT_PAGE_CORNER_SIZE } from "../constants";
import type { FlipCorner, Point, Rect } from "../types";

/**
 * Mouse event types
 */
export type MouseEventType =
	| "mousedown"
	| "mousemove"
	| "mouseup"
	| "mouseleave"
	| "click"
	| "dblclick";

/**
 * Mouse handler configuration
 */
export interface MouseHandlerConfig {
	/** Page rectangle for hit testing */
	pageRect: Rect;
	/** Corner hit area size */
	cornerSize: number;
	/** Whether click on page triggers flip */
	clickToFlip: boolean;
	/** Whether double click triggers action */
	doubleClickAction: boolean;
	/** Minimum drag distance to start interaction (px) */
	dragThreshold: number;
}

/**
 * Mouse interaction result
 */
export interface MouseInteractionResult {
	/** Whether interaction was handled */
	handled: boolean;
	/** Corner hit (if any) */
	corner: FlipCorner | null;
	/** Start point of drag */
	startPoint: Point | null;
	/** Current point */
	currentPoint: Point | null;
	/** Whether dragging */
	isDragging: boolean;
	/** Drag distance */
	dragDistance: number;
	/** Click position (for click-to-flip) */
	clickPoint: Point | null;
}

/**
 * MouseHandler - Pure mouse event handling
 *
 * No side effects, fully testable, no direct DOM dependencies.
 */
export class MouseHandler {
	private config: MouseHandlerConfig;
	private state: MouseInteractionResult;

	/**
	 * Create mouse handler
	 * @param config - Handler configuration
	 */
	constructor(config: Partial<MouseHandlerConfig> = {}) {
		this.config = {
			pageRect: { x: 0, y: 0, width: 800, height: 600 },
			cornerSize: DEFAULT_PAGE_CORNER_SIZE,
			clickToFlip: true,
			doubleClickAction: false,
			dragThreshold: 5,
			...config,
		};

		this.state = this.getInitialState();
	}

	/**
	 * Update handler configuration
	 * @param config - New configuration
	 */
	setConfig(config: Partial<MouseHandlerConfig>): void {
		this.config = { ...this.config, ...config };
	}

	/**
	 * Get current page rect
	 */
	getPageRect(): Rect {
		return this.config.pageRect;
	}

	/**
	 * Update page rect (called on layout change)
	 * @param pageRect - New page rectangle
	 */
	setPageRect(pageRect: Rect): void {
		this.config.pageRect = pageRect;
	}

	/**
	 * Handle mousedown event
	 *
	 * @param point - Mouse position in page coordinates
	 * @returns Interaction result
	 */
	onMouseDown(point: Point): MouseInteractionResult {
		this.state = this.getInitialState();

		const corner = this.hitTestCorner(point);

		if (corner) {
			this.state.corner = corner;
			this.state.startPoint = point;
			this.state.currentPoint = point;
			this.state.isDragging = false;
			this.state.dragDistance = 0;
			this.state.handled = true;
		}

		return { ...this.state };
	}

	/**
	 * Handle mousemove event
	 *
	 * @param point - Mouse position in page coordinates
	 * @returns Interaction result
	 */
	onMouseMove(point: Point): MouseInteractionResult {
		if (!this.state.startPoint) {
			return { ...this.state };
		}

		this.state.currentPoint = point;
		this.state.dragDistance = this.calculateDistance(
			this.state.startPoint,
			point,
		);

		if (
			!this.state.isDragging &&
			this.state.dragDistance >= this.config.dragThreshold
		) {
			this.state.isDragging = true;
		}

		this.state.handled = this.state.isDragging;
		return { ...this.state };
	}

	/**
	 * Handle mouseup event
	 *
	 * @returns Final interaction result
	 */
	onMouseUp(): MouseInteractionResult {
		const result = { ...this.state };
		this.state = this.getInitialState();
		return result;
	}

	/**
	 * Handle mouseleave event (cancel drag)
	 *
	 * @returns Final interaction result
	 */
	onMouseLeave(): MouseInteractionResult {
		const result = { ...this.state };
		this.state = this.getInitialState();
		return result;
	}

	/**
	 * Handle click event
	 *
	 * @param point - Click position
	 * @returns Interaction result with click point
	 */
	onClick(point: Point): MouseInteractionResult {
		if (!this.config.clickToFlip) {
			return { ...this.state, handled: false };
		}

		this.state.clickPoint = point;
		this.state.handled = true;
		return { ...this.state };
	}

	/**
	 * Handle double click event
	 *
	 * @param point - Double click position
	 * @returns Interaction result
	 */
	onDoubleClick(point: Point): MouseInteractionResult {
		if (!this.config.doubleClickAction) {
			return { ...this.state, handled: false };
		}

		this.state.clickPoint = point;
		this.state.handled = true;
		return { ...this.state };
	}

	/**
	 * Get current interaction state
	 */
	getState(): MouseInteractionResult {
		return { ...this.state };
	}

	/**
	 * Reset handler state
	 */
	reset(): void {
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
	 * Determine flip direction from click position
	 *
	 * @param point - Click point
	 * @returns 'next' or 'prev'
	 */
	getFlipDirectionFromClick(point: Point): "next" | "prev" {
		const { pageRect } = this.config;
		const centerX = pageRect.x + pageRect.width / 2;
		return point.x >= centerX ? "next" : "prev";
	}

	/**
	 * Get initial state
	 * @private
	 */
	private getInitialState(): MouseInteractionResult {
		return {
			handled: false,
			corner: null,
			startPoint: null,
			currentPoint: null,
			isDragging: false,
			dragDistance: 0,
			clickPoint: null,
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
