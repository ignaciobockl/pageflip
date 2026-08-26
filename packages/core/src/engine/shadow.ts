/**
 * Shadow Mathematics.
 *
 * Dynamic shadow calculations for realistic page flip shadows.
 * @packageDocumentation
 */
import {
	DEFAULT_MAX_SHADOW_OPACITY,
	SHADOW_BLUR_BASE,
	SHADOW_BLUR_MAX,
	SHADOW_OFFSET_BASE,
} from "../constants";
import type { Rect, ShadowParams } from "../types";

/**
 * Default light source angle in degrees (top-left).
 */
export const DEFAULT_LIGHT_ANGLE = 135;

/**
 * Calculate shadow parameters for a fold.
 */
export function calculateShadowParams(
	foldProgress: number,
	_pageRect: Rect,
	lightAngle: number = DEFAULT_LIGHT_ANGLE,
	maxOpacity: number = DEFAULT_MAX_SHADOW_OPACITY,
): ShadowParams {
	const intensity = Math.sin(foldProgress * Math.PI) * maxOpacity;
	const angleRad = (lightAngle * Math.PI) / 180;
	const maxOffset = SHADOW_OFFSET_BASE * foldProgress;
	return {
		color: `rgba(0, 0, 0, ${intensity})`,
		offsetX: Math.cos(angleRad) * maxOffset,
		offsetY: Math.sin(angleRad) * maxOffset,
		blur:
			SHADOW_BLUR_BASE + (SHADOW_BLUR_MAX - SHADOW_BLUR_BASE) * foldProgress,
	};
}

/**
 * Calculate page edge shadow (for hard pages).
 */
export function calculatePageEdgeShadow(
	_pageRect: Rect,
	isFolded: boolean,
	foldProgress: number,
): ShadowParams {
	if (!isFolded) {
		return { color: "rgba(0, 0, 0, 0)", offsetX: 0, offsetY: 0, blur: 0 };
	}

	return {
		color: `rgba(0, 0, 0, ${foldProgress * 0.3})`,
		offsetX: 2 * foldProgress,
		offsetY: 4 * foldProgress,
		blur: 4 + 8 * foldProgress,
	};
}

/**
 * Calculate inner fold shadow (crease).
 */
export function calculateCreaseShadow(
	foldProgress: number,
	pageRect: Rect,
): ShadowParams {
	return {
		color: `rgba(0, 0, 0, ${Math.sin(foldProgress * Math.PI) * 0.4})`,
		offsetX: 0,
		offsetY: 0,
		blur: pageRect.width * foldProgress * 0.5,
	};
}

/**
 * Calculate shadow for page stack (multiple pages).
 */
export function calculateStackShadow(
	pageIndex: number,
	totalPages: number,
	baseShadow: ShadowParams,
): ShadowParams {
	const depthFactor = 1 - pageIndex / Math.max(totalPages, 1);
	const opacityMatch = /rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*([\d.]+)\s*\)/.exec(
		baseShadow.color,
	);
	const opacity = Number(opacityMatch?.[1] ?? "0");
	return {
		...baseShadow,
		color: `rgba(0, 0, 0, ${opacity * depthFactor * 0.5})`,
		blur: baseShadow.blur * (1 + pageIndex * 0.2),
	};
}
