import type {
	FlipCorner,
	FlipDirection,
	FlipState,
	PageOrientation,
} from "./index";

/**
 * Flip event payload.
 */
export type FlipEvent = {
	/** Page index that was flipped to. */
	pageIndex: number;
	/** Flip direction. */
	direction: FlipDirection;
	/** Corner used for flip. */
	corner: FlipCorner;
	/** Event timestamp. */
	timestamp: number;
};

/**
 * State change event payload.
 */
export type StateChangeEvent = {
	/** New state. */
	state: FlipState;
	/** Previous state. */
	previousState: FlipState;
	/** Event timestamp. */
	timestamp: number;
};

/**
 * Orientation change event payload.
 */
export type OrientationChangeEvent = {
	/** New orientation. */
	orientation: PageOrientation;
	/** Previous orientation. */
	previousOrientation: PageOrientation;
	/** Event timestamp. */
	timestamp: number;
};
