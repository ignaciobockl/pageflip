import {
	DEFAULT_PAGE_CORNER_SIZE,
	MAX_HEIGHT,
	MAX_WIDTH,
	MIN_HEIGHT,
	MIN_WIDTH,
} from "../constants";
/**
 * Layout Calculator
 *
 * Calculates page layout for fixed, stretch, and responsive modes.
 * Handles orientation, constraints, and device pixel ratio.
 * @packageDocumentation
 */
import type { PageFlipConfig, PageOrientation, Rect, Size } from "../types";

/**
 * Layout calculation result
 */
export interface LayoutResult {
	/** Page width in CSS pixels */
	pageWidth: number;
	/** Page height in CSS pixels */
	pageHeight: number;
	/** Scale factor applied */
	scale: number;
	/** Horizontal offset from container left */
	offsetX: number;
	/** Vertical offset from container top */
	offsetY: number;
	/** Calculated orientation */
	orientation: PageOrientation;
	/** Whether cover page is visible */
	isCoverVisible: boolean;
	/** Container bounds */
	containerRect: Rect;
	/** Page bounds in container coordinates */
	pageRect: Rect;
}

/**
 * Layout constraints
 */
export interface LayoutConstraints {
	/** Minimum page width */
	minWidth: number;
	/** Maximum page width */
	maxWidth: number;
	/** Minimum page height */
	minHeight: number;
	/** Maximum page height */
	maxHeight: number;
}

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
 * LayoutCalculator - Pure layout calculations
 *
 * No side effects, fully testable, no DOM dependencies.
 */
export class LayoutCalculator {
	private constraints: LayoutConstraints;

	/**
	 * Create layout calculator
	 * @param constraints - Optional custom constraints
	 */
	constructor(constraints: Partial<LayoutConstraints> = {}) {
		this.constraints = { ...DEFAULT_CONSTRAINTS, ...constraints };
	}

	/**
	 * Update constraints
	 * @param constraints - New constraints
	 */
	setConstraints(constraints: Partial<LayoutConstraints>): void {
		this.constraints = { ...this.constraints, ...constraints };
	}

	/**
	 * Calculate layout for given container and config
	 *
	 * @param containerRect - Container bounding rectangle
	 * @param config - PageFlip configuration
	 * @returns Complete layout result
	 */
	calculate(containerRect: Rect, config: PageFlipConfig): LayoutResult {
		const {
			width,
			height,
			size = "fixed",
			minWidth,
			maxWidth,
			minHeight,
			maxHeight,
			usePortrait = true,
			showCover = false,
		} = config;

		const effectiveConstraints: LayoutConstraints = {
			minWidth: minWidth ?? this.constraints.minWidth,
			maxWidth: maxWidth ?? this.constraints.maxWidth,
			minHeight: minHeight ?? this.constraints.minHeight,
			maxHeight: maxHeight ?? this.constraints.maxHeight,
		};

		let targetWidth = width;
		let targetHeight = height;

		if (size === "stretch") {
			targetWidth = this.clamp(
				containerRect.width,
				effectiveConstraints.minWidth,
				effectiveConstraints.maxWidth,
			);
			targetHeight = this.clamp(
				containerRect.height,
				effectiveConstraints.minHeight,
				effectiveConstraints.maxHeight,
			);
		}

		const isPortrait = targetWidth <= targetHeight;
		const orientation: PageOrientation =
			usePortrait && isPortrait ? "portrait" : "landscape";

		const scaleX = containerRect.width / targetWidth;
		const scaleY = containerRect.height / targetHeight;
		const scale = Math.min(scaleX, scaleY);

		const scaledWidth = targetWidth * scale;
		const scaledHeight = targetHeight * scale;
		const offsetX = (containerRect.width - scaledWidth) / 2;
		const offsetY = (containerRect.height - scaledHeight) / 2;

		const pageRect: Rect = {
			x: offsetX,
			y: offsetY,
			width: scaledWidth,
			height: scaledHeight,
		};

		return {
			pageWidth: targetWidth,
			pageHeight: targetHeight,
			scale,
			offsetX,
			offsetY,
			orientation,
			isCoverVisible: showCover,
			containerRect,
			pageRect,
		};
	}

	/**
	 * Calculate layout for fixed size mode
	 *
	 * @param containerRect - Container bounds
	 * @param pageSize - Fixed page size
	 * @param usePortrait - Whether to prefer portrait
	 * @returns Layout result
	 */
	calculateFixed(
		containerRect: Rect,
		pageSize: Size,
		usePortrait = true,
	): LayoutResult {
		const isPortrait = pageSize.width <= pageSize.height;
		const orientation: PageOrientation =
			usePortrait && isPortrait ? "portrait" : "landscape";

		const scaleX = containerRect.width / pageSize.width;
		const scaleY = containerRect.height / pageSize.height;
		const scale = Math.min(scaleX, scaleY);

		const scaledWidth = pageSize.width * scale;
		const scaledHeight = pageSize.height * scale;
		const offsetX = (containerRect.width - scaledWidth) / 2;
		const offsetY = (containerRect.height - scaledHeight) / 2;

		return {
			pageWidth: pageSize.width,
			pageHeight: pageSize.height,
			scale,
			offsetX,
			offsetY,
			orientation,
			isCoverVisible: false,
			containerRect,
			pageRect: {
				x: offsetX,
				y: offsetY,
				width: scaledWidth,
				height: scaledHeight,
			},
		};
	}

	/**
	 * Calculate layout for stretch mode
	 *
	 * @param containerRect - Container bounds
	 * @param constraints - Size constraints
	 * @param usePortrait - Whether to prefer portrait
	 * @returns Layout result
	 */
	calculateStretch(
		containerRect: Rect,
		constraints: LayoutConstraints,
		usePortrait = true,
	): LayoutResult {
		const targetWidth = this.clamp(
			containerRect.width,
			constraints.minWidth,
			constraints.maxWidth,
		);
		const targetHeight = this.clamp(
			containerRect.height,
			constraints.minHeight,
			constraints.maxHeight,
		);

		const isPortrait = targetWidth <= targetHeight;
		const orientation: PageOrientation =
			usePortrait && isPortrait ? "portrait" : "landscape";

		const scaleX = containerRect.width / targetWidth;
		const scaleY = containerRect.height / targetHeight;
		const scale = Math.min(scaleX, scaleY);

		const scaledWidth = targetWidth * scale;
		const scaledHeight = targetHeight * scale;
		const offsetX = (containerRect.width - scaledWidth) / 2;
		const offsetY = (containerRect.height - scaledHeight) / 2;

		return {
			pageWidth: targetWidth,
			pageHeight: targetHeight,
			scale,
			offsetX,
			offsetY,
			orientation,
			isCoverVisible: false,
			containerRect,
			pageRect: {
				x: offsetX,
				y: offsetY,
				width: scaledWidth,
				height: scaledHeight,
			},
		};
	}

	/**
	 * Calculate page corner hit areas for all corners
	 *
	 * @param pageRect - Page rectangle in container coordinates
	 * @param cornerSize - Size of corner hit area
	 * @returns Map of corner to hit rectangle
	 */
	calculateCornerHitAreas(
		pageRect: Rect,
		cornerSize: number = DEFAULT_PAGE_CORNER_SIZE,
	): Map<"top-left" | "top-right" | "bottom-left" | "bottom-right", Rect> {
		const areas = new Map<
			"top-left" | "top-right" | "bottom-left" | "bottom-right",
			Rect
		>();

		areas.set("top-left", {
			x: pageRect.x,
			y: pageRect.y,
			width: cornerSize,
			height: cornerSize,
		});

		areas.set("top-right", {
			x: pageRect.x + pageRect.width - cornerSize,
			y: pageRect.y,
			width: cornerSize,
			height: cornerSize,
		});

		areas.set("bottom-left", {
			x: pageRect.x,
			y: pageRect.y + pageRect.height - cornerSize,
			width: cornerSize,
			height: cornerSize,
		});

		areas.set("bottom-right", {
			x: pageRect.x + pageRect.width - cornerSize,
			y: pageRect.y + pageRect.height - cornerSize,
			width: cornerSize,
			height: cornerSize,
		});

		return areas;
	}

	/**
	 * Check if point is in page corner
	 *
	 * @param point - Point to test
	 * @param pageRect - Page rectangle
	 * @param cornerSize - Corner hit area size
	 * @returns Corner name or null
	 */
	hitTestCorner(
		point: { x: number; y: number },
		pageRect: Rect,
		cornerSize: number = DEFAULT_PAGE_CORNER_SIZE,
	): "top-left" | "top-right" | "bottom-left" | "bottom-right" | null {
		const areas = this.calculateCornerHitAreas(pageRect, cornerSize);

		for (const [corner, area] of areas) {
			if (this.pointInRect(point, area)) {
				return corner;
			}
		}
		return null;
	}

	/**
	 * Get page bounds for a specific page index in a spread
	 *
	 * @param layout - Base layout result
	 * @param pageIndex - Page index
	 * @param totalPages - Total pages
	 * @returns Page bounds
	 */
	getPageBounds(
		layout: LayoutResult,
		pageIndex: number,
		totalPages: number,
	): Rect {
		return layout.pageRect;
	}

	/**
	 * Clamp value between min and max
	 * @private
	 */
	private clamp(value: number, min: number, max: number): number {
		return Math.min(Math.max(value, min), max);
	}

	/**
	 * Check if point is inside rectangle
	 * @private
	 */
	private pointInRect(point: { x: number; y: number }, rect: Rect): boolean {
		return (
			point.x >= rect.x &&
			point.x <= rect.x + rect.width &&
			point.y >= rect.y &&
			point.y <= rect.y + rect.height
		);
	}
}
