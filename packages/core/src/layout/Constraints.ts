import { MAX_HEIGHT, MAX_WIDTH, MIN_HEIGHT, MIN_WIDTH } from "../constants";
/**
 * Layout Constraints
 *
 * Validation and utilities for layout constraints (min/max bounds).
 * @packageDocumentation
 */
import type { Rect, Size } from "../types";
import type { LayoutConstraints } from "./LayoutCalculator";

/**
 * Default layout constraints
 */
export const DEFAULT_CONSTRAINTS: LayoutConstraints = {
	minWidth: MIN_WIDTH,
	maxWidth: MAX_WIDTH,
	minHeight: MIN_HEIGHT,
	maxHeight: MAX_HEIGHT,
};

/**
 * Validate constraints object
 *
 * @param constraints - Constraints to validate
 * @returns Validated constraints with defaults
 */
export function validateConstraints(
	constraints: Partial<LayoutConstraints>,
): LayoutConstraints {
	const validated: LayoutConstraints = { ...DEFAULT_CONSTRAINTS };

	if (constraints.minWidth !== undefined) {
		validated.minWidth = Math.max(
			MIN_WIDTH,
			Math.min(constraints.minWidth, MAX_WIDTH),
		);
	}
	if (constraints.maxWidth !== undefined) {
		validated.maxWidth = Math.max(
			MIN_WIDTH,
			Math.min(constraints.maxWidth, MAX_WIDTH),
		);
	}
	if (constraints.minHeight !== undefined) {
		validated.minHeight = Math.max(
			MIN_HEIGHT,
			Math.min(constraints.minHeight, MAX_HEIGHT),
		);
	}
	if (constraints.maxHeight !== undefined) {
		validated.maxHeight = Math.max(
			MIN_HEIGHT,
			Math.min(constraints.maxHeight, MAX_HEIGHT),
		);
	}

	if (validated.minWidth > validated.maxWidth) {
		validated.minWidth = validated.maxWidth;
	}
	if (validated.minHeight > validated.maxHeight) {
		validated.minHeight = validated.maxHeight;
	}

	return validated;
}

/**
 * Check if size fits within constraints
 *
 * @param size - Size to check
 * @param constraints - Constraints to check against
 * @returns True if size fits
 */
export function sizeFitsConstraints(
	size: Size,
	constraints: LayoutConstraints,
): boolean {
	return (
		size.width >= constraints.minWidth &&
		size.width <= constraints.maxWidth &&
		size.height >= constraints.minHeight &&
		size.height <= constraints.maxHeight
	);
}

/**
 * Clamp size to constraints
 *
 * @param size - Size to clamp
 * @param constraints - Constraints
 * @returns Clamped size
 */
export function clampSizeToConstraints(
	size: Size,
	constraints: LayoutConstraints,
): Size {
	return {
		width: Math.min(
			Math.max(size.width, constraints.minWidth),
			constraints.maxWidth,
		),
		height: Math.min(
			Math.max(size.height, constraints.minHeight),
			constraints.maxHeight,
		),
	};
}

/**
 * Check if rectangle fits within constraints
 *
 * @param rect - Rectangle to check
 * @param constraints - Constraints
 * @returns True if rect fits
 */
export function rectFitsConstraints(
	rect: Rect,
	constraints: LayoutConstraints,
): boolean {
	return (
		rect.width >= constraints.minWidth &&
		rect.width <= constraints.maxWidth &&
		rect.height >= constraints.minHeight &&
		rect.height <= constraints.maxHeight
	);
}

/**
 * Clamp rectangle to constraints
 *
 * @param rect - Rectangle to clamp
 * @param constraints - Constraints
 * @returns Clamped rectangle (preserves position)
 */
export function clampRectToConstraints(
	rect: Rect,
	constraints: LayoutConstraints,
): Rect {
	return {
		...rect,
		width: Math.min(
			Math.max(rect.width, constraints.minWidth),
			constraints.maxWidth,
		),
		height: Math.min(
			Math.max(rect.height, constraints.minHeight),
			constraints.maxHeight,
		),
	};
}

/**
 * Merge multiple constraints (most restrictive wins)
 *
 * @param constraintsList - Array of constraints
 * @returns Merged constraints
 */
export function mergeConstraints(
	...constraintsList: Partial<LayoutConstraints>[]
): LayoutConstraints {
	const merged: LayoutConstraints = { ...DEFAULT_CONSTRAINTS };

	for (const constraints of constraintsList) {
		if (constraints.minWidth !== undefined) {
			merged.minWidth = Math.max(merged.minWidth, constraints.minWidth);
		}
		if (constraints.maxWidth !== undefined) {
			merged.maxWidth = Math.min(merged.maxWidth, constraints.maxWidth);
		}
		if (constraints.minHeight !== undefined) {
			merged.minHeight = Math.max(merged.minHeight, constraints.minHeight);
		}
		if (constraints.maxHeight !== undefined) {
			merged.maxHeight = Math.min(merged.maxHeight, constraints.maxHeight);
		}
	}

	merged.minWidth = Math.min(merged.minWidth, merged.maxWidth);
	merged.minHeight = Math.min(merged.minHeight, merged.maxHeight);

	return merged;
}

/**
 * Create constraints from config
 *
 * @param config - PageFlip config with optional constraints
 * @returns Validated constraints
 */
export function createConstraintsFromConfig(config: {
	minWidth?: number;
	maxWidth?: number;
	minHeight?: number;
	maxHeight?: number;
}): LayoutConstraints {
	return validateConstraints({
		minWidth: config.minWidth,
		maxWidth: config.maxWidth,
		minHeight: config.minHeight,
		maxHeight: config.maxHeight,
	});
}
