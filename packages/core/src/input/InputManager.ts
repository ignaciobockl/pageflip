/**
 * Input Manager
 *
 * Orchestrates all input handlers (mouse, touch, keyboard, wheel)
 * and provides unified interface for FlipEngine.
 * @packageDocumentation
 */
import type { FlipCorner, Point, Rect } from "../types";
import { KeyboardHandler } from "./KeyboardHandler";
import { MouseHandler } from "./MouseHandler";
import { TouchHandler } from "./TouchHandler";
import { WheelHandler } from "./WheelHandler";

/**
 * Input manager configuration
 */
export interface InputManagerConfig {
	/** Page rectangle for hit testing */
	pageRect: Rect;
	/** Corner hit area size */
	cornerSize: number;
	/** Click-to-flip enabled */
	clickToFlip: boolean;
	/** Swipe distance threshold */
	swipeDistance: number;
	/** Drag threshold */
	dragThreshold: number;
	/** Keyboard navigation enabled */
	enableKeyboard: boolean;
	/** Wheel zoom enabled */
	enableWheelZoom: boolean;
	/** Horizontal scroll navigation */
	enableHorizontalScroll: boolean;
}

/**
 * Unified input event types
 */
export type InputEventType =
	| "dragStart"
	| "dragMove"
	| "dragEnd"
	| "click"
	| "doubleClick"
	| "swipe"
	| "keyAction"
	| "wheelZoom"
	| "wheelScroll";

/**
 * Input event payload
 */
export interface InputEvent {
	/** Event type */
	type: InputEventType;
	/** Corner involved (for drag/swipe) */
	corner: FlipCorner | null;
	/** Start point */
	startPoint: Point | null;
	/** Current point */
	currentPoint: Point | null;
	/** Drag distance */
	dragDistance: number;
	/** Swipe direction */
	swipeDirection: "next" | "prev" | null;
	/** Keyboard action */
	keyboardAction:
		| "next"
		| "prev"
		| "first"
		| "last"
		| "zoomIn"
		| "zoomOut"
		| "zoomReset"
		| "fullscreen"
		| null;
	/** Wheel zoom delta */
	zoomDelta: number;
	/** Wheel scroll direction */
	scrollDirection: "left" | "right" | "up" | "down" | null;
	/** Timestamp */
	timestamp: number;
}

/**
 * Input event listener
 */
export type InputEventListener = (event: InputEvent) => void;

/**
 * InputManager - Central input orchestration
 *
 * Combines MouseHandler, TouchHandler, KeyboardHandler, WheelHandler
 * and emits unified InputEvent for FlipEngine consumption.
 */
export class InputManager {
	private config: InputManagerConfig;
	private mouseHandler: MouseHandler;
	private touchHandler: TouchHandler;
	private keyboardHandler: KeyboardHandler;
	private wheelHandler: WheelHandler;
	private listeners: Set<InputEventListener> = new Set();
	private isDragging = false;
	private activeCorner: FlipCorner | null = null;
	private dragStartPoint: Point | null = null;
	private pointerDownPoint: Point | null = null;

	/**
	 * Create input manager
	 * @param config - Manager configuration
	 */
	constructor(config: Partial<InputManagerConfig> = {}) {
		this.config = {
			pageRect: { x: 0, y: 0, width: 800, height: 600 },
			cornerSize: 48,
			clickToFlip: true,
			swipeDistance: 30,
			dragThreshold: 5,
			enableKeyboard: true,
			enableWheelZoom: true,
			enableHorizontalScroll: true,
			...config,
		};

		this.mouseHandler = new MouseHandler({
			pageRect: this.config.pageRect,
			cornerSize: this.config.cornerSize,
			clickToFlip: this.config.clickToFlip,
			dragThreshold: this.config.dragThreshold,
		});

		this.touchHandler = new TouchHandler({
			pageRect: this.config.pageRect,
			cornerSize: this.config.cornerSize,
			swipeDistance: this.config.swipeDistance,
			preventDefaultOnDrag: true,
			enableSwipe: true,
		});

		this.keyboardHandler = new KeyboardHandler({
			enableNavigation: this.config.enableKeyboard,
			enableZoom: this.config.enableWheelZoom,
			enableFullscreen: this.config.enableKeyboard,
			enableFirstLast: this.config.enableKeyboard,
		});

		this.wheelHandler = new WheelHandler({
			enableZoom: this.config.enableWheelZoom,
			enableHorizontalScroll: this.config.enableHorizontalScroll,
		});
	}

	/**
	 * Update configuration
	 * @param config - New configuration
	 */
	setConfig(config: Partial<InputManagerConfig>): void {
		this.config = { ...this.config, ...config };

		this.mouseHandler.setConfig({
			pageRect: this.config.pageRect,
			cornerSize: this.config.cornerSize,
			clickToFlip: this.config.clickToFlip,
			dragThreshold: this.config.dragThreshold,
		});

		this.touchHandler.setConfig({
			pageRect: this.config.pageRect,
			cornerSize: this.config.cornerSize,
			swipeDistance: this.config.swipeDistance,
		});

		this.keyboardHandler.setConfig({
			enableNavigation: this.config.enableKeyboard,
			enableZoom: this.config.enableWheelZoom,
			enableFullscreen: this.config.enableKeyboard,
			enableFirstLast: this.config.enableKeyboard,
		});

		this.wheelHandler.setConfig({
			enableZoom: this.config.enableWheelZoom,
			enableHorizontalScroll: this.config.enableHorizontalScroll,
		});
	}

	/**
	 * Update page rect (called on layout change)
	 * @param pageRect - New page rectangle
	 */
	setPageRect(pageRect: Rect): void {
		this.config.pageRect = pageRect;
		this.mouseHandler.setPageRect(pageRect);
		this.touchHandler.setPageRect(pageRect);
	}

	/** Handle mousedown */
	onMouseDown(point: Point): void {
		this.pointerDownPoint = point;

		const result = this.mouseHandler.onMouseDown(point);
		if (result.corner) {
			this.isDragging = true;
			this.activeCorner = result.corner;
			this.dragStartPoint = result.startPoint;
			this.emit({
				type: "dragStart",
				corner: result.corner,
				startPoint: result.startPoint,
				currentPoint: point,
				dragDistance: 0,
				swipeDirection: null,
				keyboardAction: null,
				zoomDelta: 0,
				scrollDirection: null,
				timestamp: Date.now(),
			});
		}
	}

	/** Handle mousemove */
	onMouseMove(point: Point): void {
		const result = this.mouseHandler.onMouseMove(point);
		if (this.isDragging && this.activeCorner) {
			this.emit({
				type: "dragMove",
				corner: this.activeCorner,
				startPoint: this.dragStartPoint,
				currentPoint: point,
				dragDistance: result.dragDistance,
				swipeDirection: null,
				keyboardAction: null,
				zoomDelta: 0,
				scrollDirection: null,
				timestamp: Date.now(),
			});
		}
	}

	/** Handle mouseup */
	onMouseUp(): void {
		if (this.isDragging && this.activeCorner) {
			const result = this.mouseHandler.onMouseUp();
			this.emit({
				type: "dragEnd",
				corner: this.activeCorner,
				startPoint: this.dragStartPoint,
				currentPoint: null,
				dragDistance: result.dragDistance,
				swipeDirection: null,
				keyboardAction: null,
				zoomDelta: 0,
				scrollDirection: null,
				timestamp: Date.now(),
			});
		} else if (this.pointerDownPoint) {
			const result = this.mouseHandler.onClick(this.pointerDownPoint);
			if (result.handled && result.clickPoint) {
				const direction = this.mouseHandler.getFlipDirectionFromClick(
					result.clickPoint,
				);
				this.emit({
					type: "click",
					corner: null,
					startPoint: null,
					currentPoint: result.clickPoint,
					dragDistance: 0,
					swipeDirection: null,
					keyboardAction: direction,
					zoomDelta: 0,
					scrollDirection: null,
					timestamp: Date.now(),
				});
			}
		}

		this.isDragging = false;
		this.activeCorner = null;
		this.dragStartPoint = null;
		this.pointerDownPoint = null;
	}

	/** Handle mouseleave */
	onMouseLeave(): void {
		if (this.isDragging) {
			this.mouseHandler.onMouseLeave();
			this.emit({
				type: "dragEnd",
				corner: this.activeCorner,
				startPoint: this.dragStartPoint,
				currentPoint: null,
				dragDistance: 0,
				swipeDirection: null,
				keyboardAction: null,
				zoomDelta: 0,
				scrollDirection: null,
				timestamp: Date.now(),
			});
			this.isDragging = false;
			this.activeCorner = null;
			this.dragStartPoint = null;
		}

		this.pointerDownPoint = null;
	}

	/** Handle double click */
	onDoubleClick(point: Point): void {
		const result = this.mouseHandler.onDoubleClick(point);
		if (result.handled) {
			this.emit({
				type: "doubleClick",
				corner: null,
				startPoint: null,
				currentPoint: point,
				dragDistance: 0,
				swipeDirection: null,
				keyboardAction: "zoomReset",
				zoomDelta: 0,
				scrollDirection: null,
				timestamp: Date.now(),
			});
		}
	}

	/** Handle touchstart */
	onTouchStart(
		touches: ReadonlyArray<{ x: number; y: number; identifier: number }>,
	): void {
		const result = this.touchHandler.onTouchStart(touches);
		if (result.corner) {
			this.isDragging = true;
			this.activeCorner = result.corner;
			this.dragStartPoint = result.startPoint;
			this.emit({
				type: "dragStart",
				corner: result.corner,
				startPoint: result.startPoint,
				currentPoint: result.currentPoint,
				dragDistance: 0,
				swipeDirection: null,
				keyboardAction: null,
				zoomDelta: 0,
				scrollDirection: null,
				timestamp: Date.now(),
			});
		}
	}

	/** Handle touchmove */
	onTouchMove(
		touches: ReadonlyArray<{ x: number; y: number; identifier: number }>,
	): void {
		const result = this.touchHandler.onTouchMove(touches);
		if (this.isDragging && this.activeCorner) {
			this.emit({
				type: "dragMove",
				corner: this.activeCorner,
				startPoint: this.dragStartPoint,
				currentPoint: result.currentPoint,
				dragDistance: result.dragDistance,
				swipeDirection: null,
				keyboardAction: null,
				zoomDelta: 0,
				scrollDirection: null,
				timestamp: Date.now(),
			});
		}
	}

	/** Handle touchend */
	onTouchEnd(
		changedTouches: ReadonlyArray<{ x: number; y: number; identifier: number }>,
	): void {
		const result = this.touchHandler.onTouchEnd(changedTouches);

		if (this.isDragging && this.activeCorner) {
			const swipeDirection = this.touchHandler.getFlipDirectionFromSwipe();
			if (swipeDirection) {
				this.emit({
					type: "swipe",
					corner: this.activeCorner,
					startPoint: this.dragStartPoint,
					currentPoint: result.currentPoint,
					dragDistance: result.dragDistance,
					swipeDirection,
					keyboardAction: null,
					zoomDelta: 0,
					scrollDirection: null,
					timestamp: Date.now(),
				});
			} else {
				this.emit({
					type: "dragEnd",
					corner: this.activeCorner,
					startPoint: this.dragStartPoint,
					currentPoint: result.currentPoint,
					dragDistance: result.dragDistance,
					swipeDirection: null,
					keyboardAction: null,
					zoomDelta: 0,
					scrollDirection: null,
					timestamp: Date.now(),
				});
			}
		}

		this.isDragging = false;
		this.activeCorner = null;
		this.dragStartPoint = null;
	}

	/** Handle touchcancel */
	onTouchCancel(): void {
		if (this.isDragging) {
			this.touchHandler.onTouchCancel();
			this.emit({
				type: "dragEnd",
				corner: this.activeCorner,
				startPoint: this.dragStartPoint,
				currentPoint: null,
				dragDistance: 0,
				swipeDirection: null,
				keyboardAction: null,
				zoomDelta: 0,
				scrollDirection: null,
				timestamp: Date.now(),
			});
			this.isDragging = false;
			this.activeCorner = null;
			this.dragStartPoint = null;
		}
	}

	/** Handle keydown */
	onKeyDown(event: KeyboardEvent): void {
		const result = this.keyboardHandler.onKeyDown(event);
		if (result.handled && result.action !== "none") {
			this.emit({
				type: "keyAction",
				corner: null,
				startPoint: null,
				currentPoint: null,
				dragDistance: 0,
				swipeDirection: null,
				keyboardAction: result.action,
				zoomDelta: 0,
				scrollDirection: null,
				timestamp: Date.now(),
			});
		}
	}

	/** Handle wheel */
	onWheel(event: WheelEvent): void {
		const result = this.wheelHandler.onWheel(event);
		if (result.handled) {
			if (result.action === "zoom") {
				this.emit({
					type: "wheelZoom",
					corner: null,
					startPoint: null,
					currentPoint: null,
					dragDistance: 0,
					swipeDirection: null,
					keyboardAction: null,
					zoomDelta: result.zoomDelta,
					scrollDirection: null,
					timestamp: Date.now(),
				});
			} else if (result.action === "scroll") {
				this.emit({
					type: "wheelScroll",
					corner: null,
					startPoint: null,
					currentPoint: null,
					dragDistance: 0,
					swipeDirection: null,
					keyboardAction: null,
					zoomDelta: 0,
					scrollDirection: result.scrollDirection,
					timestamp: Date.now(),
				});
			}
		}
	}

	/**
	 * Subscribe to input events
	 * @param listener - Callback function
	 * @returns Unsubscribe function
	 */
	onInput(listener: InputEventListener): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	/**
	 * Emit event to all listeners
	 * @private
	 */
	private emit(event: InputEvent): void {
		for (const listener of this.listeners) {
			try {
				listener(event);
			} catch (error) {
				console.error("[InputManager] Listener error:", error);
			}
		}
	}

	/** Get mouse handler */
	getMouseHandler(): MouseHandler {
		return this.mouseHandler;
	}

	/** Get touch handler */
	getTouchHandler(): TouchHandler {
		return this.touchHandler;
	}

	/** Get keyboard handler */
	getKeyboardHandler(): KeyboardHandler {
		return this.keyboardHandler;
	}

	/** Get wheel handler */
	getWheelHandler(): WheelHandler {
		return this.wheelHandler;
	}

	/** Check if currently dragging */
	isCurrentlyDragging(): boolean {
		return this.isDragging;
	}

	/** Get active corner */
	getActiveCorner(): FlipCorner | null {
		return this.activeCorner;
	}

	/** Reset all handlers */
	reset(): void {
		this.mouseHandler.reset();
		this.touchHandler.reset();
		this.keyboardHandler.resetToDefaults();
		this.wheelHandler.reset();
		this.isDragging = false;
		this.activeCorner = null;
		this.dragStartPoint = null;
		this.pointerDownPoint = null;
	}
}
