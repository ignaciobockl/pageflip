/**
 * Orientation Manager
 *
 * Handles portrait/landscape orientation detection, changes, and locking.
 * @packageDocumentation
 */
import type { PageFlipConfig, PageOrientation, Rect } from "../types";
import type { LayoutCalculator } from "./LayoutCalculator";

/**
 * Orientation change event
 */
export interface OrientationChangeEvent {
	/** New orientation */
	orientation: PageOrientation;
	/** Previous orientation */
	previousOrientation: PageOrientation;
	/** Whether change was automatic (container resize) */
	automatic: boolean;
	/** Timestamp */
	timestamp: number;
}
/**
 * Orientation lock state
 */
export type OrientationLock = "none" | "portrait" | "landscape";
/**
 * OrientationManager - Handles orientation logic
 */
export class OrientationManager {
	private currentOrientation: PageOrientation = "portrait";
	private lockedOrientation: OrientationLock = "none";
	private usePortraitPreference = true;
	private listeners: Set<(event: OrientationChangeEvent) => void> = new Set();
	private layoutCalculator: LayoutCalculator;

	/**
	 * Create orientation manager
	 * @param layoutCalculator - LayoutCalculator instance
	 */
	constructor(layoutCalculator: LayoutCalculator) {
		this.layoutCalculator = layoutCalculator;
	}
	/**
	 * Set portrait preference
	 * @param usePortrait - Whether to prefer portrait when possible
	 */
	setPortraitPreference(usePortrait: boolean): void {
		this.usePortraitPreference = usePortrait;
	}
	/**
	 * Get current portrait preference
	 */
	getPortraitPreference(): boolean {
		return this.usePortraitPreference;
	}
	/**
	 * Set orientation lock
	 * @param lock - Lock state
	 */
	setOrientationLock(lock: OrientationLock): void {
		this.lockedOrientation = lock;
	}
	/**
	 * Get current orientation lock
	 */
	getOrientationLock(): OrientationLock {
		return this.lockedOrientation;
	}
	/**
	 * Get current orientation
	 */
	getOrientation(): PageOrientation {
		return this.currentOrientation;
	}
	/**
	 * Update orientation based on container and config
	 *
	 * @param containerRect - Container bounds
	 * @param config - PageFlip configuration
	 * @returns OrientationChangeEvent if changed, null otherwise
	 */
	updateOrientation(
		containerRect: Rect,
		config: PageFlipConfig,
	): OrientationChangeEvent | null {
		const previousOrientation = this.currentOrientation;
		const { size = "fixed", width, height, usePortrait = true } = config;
		let newOrientation: PageOrientation;

		if (this.lockedOrientation !== "none") {
			newOrientation = this.lockedOrientation;
		} else if (size === "stretch") {
			const isPortrait = containerRect.width <= containerRect.height;
			newOrientation = usePortrait && isPortrait ? "portrait" : "landscape";
		} else {
			const isPortrait = width <= height;
			newOrientation = usePortrait && isPortrait ? "portrait" : "landscape";
		}

		if (newOrientation !== previousOrientation) {
			this.currentOrientation = newOrientation;
			const event: OrientationChangeEvent = {
				orientation: newOrientation,
				previousOrientation,
				automatic: true,
				timestamp: Date.now(),
			};
			this.notifyListeners(event);
			return event;
		}

		return null;
	}
	/**
	 * Force orientation change (user-initiated)
	 *
	 * @param orientation - New orientation
	 * @returns OrientationChangeEvent
	 */
	forceOrientation(orientation: PageOrientation): OrientationChangeEvent {
		const previousOrientation = this.currentOrientation;
		this.currentOrientation = orientation;
		const event: OrientationChangeEvent = {
			orientation,
			previousOrientation,
			automatic: false,
			timestamp: Date.now(),
		};
		this.notifyListeners(event);
		return event;
	}
	/**
	 * Check if orientation is portrait
	 */
	isPortrait(): boolean {
		return this.currentOrientation === "portrait";
	}
	/**
	 * Check if orientation is landscape
	 */
	isLandscape(): boolean {
		return this.currentOrientation === "landscape";
	}
	/**
	 * Get effective page dimensions for current orientation
	 *
	 * @param config - PageFlip configuration
	 * @returns { width, height } for current orientation
	 */
	getEffectiveDimensions(config: PageFlipConfig): {
		width: number;
		height: number;
	} {
		const { width, height } = config;

		if (this.isPortrait()) {
			return {
				width: Math.min(width, height),
				height: Math.max(width, height),
			};
		}

		return {
			width: Math.max(width, height),
			height: Math.min(width, height),
		};
	}
	/**
	 * Subscribe to orientation changes
	 *
	 * @param listener - Callback function
	 * @returns Unsubscribe function
	 */
	onOrientationChange(
		listener: (event: OrientationChangeEvent) => void,
	): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}
	/**
	 * Notify all listeners
	 * @private
	 */
	private notifyListeners(event: OrientationChangeEvent): void {
		for (const listener of this.listeners) {
			try {
				listener(event);
			} catch (error) {
				console.error("[OrientationManager] Listener error:", error);
			}
		}
	}
}
