/**
 * usePageFlipControls Hook
 *
 * Provides navigation controls for PageFlip instance.
 * @packageDocumentation
 */
import type {
	FlipCorner,
	FlipState,
	PageFlipInstance,
	PageOrientation,
} from "@pageflip/core";
import { useCallback } from "react";

/**
 * Controls returned by usePageFlipControls
 */
export interface PageFlipControls {
	/** Flip to next page with animation */
	flipNext: (corner?: FlipCorner) => Promise<void>;
	/** Flip to previous page with animation */
	flipPrev: (corner?: FlipCorner) => Promise<void>;
	/** Flip to specific page with animation */
	flipTo: (pageIndex: number, corner?: FlipCorner) => Promise<void>;
	/** Jump to page without animation */
	goTo: (pageIndex: number) => Promise<void>;
	/** Jump to next page without animation */
	next: () => Promise<void>;
	/** Jump to previous page without animation */
	prev: () => Promise<void>;
	/** Get current page index */
	getCurrentPage: () => number;
	/** Get total page count */
	getPageCount: () => number;
	/** Get current orientation */
	getOrientation: () => PageOrientation;
	/** Get current flip state */
	getState: () => FlipState;
}

/**
 * usePageFlipControls - Navigation controls for PageFlip
 *
 * @example
 * ```tsx
 * const { next, prev, goTo, flipTo } = usePageFlipControls(instance);
 *
 * return (
 *   <button onClick={next}>Next</button>
 * );
 * ```
 */
export function usePageFlipControls(
	instance: PageFlipInstance | null,
): PageFlipControls {
	const flipNext = useCallback(
		async (corner?: FlipCorner) => {
			await instance?.flipNext(corner);
		},
		[instance],
	);

	const flipPrev = useCallback(
		async (corner?: FlipCorner) => {
			await instance?.flipPrev(corner);
		},
		[instance],
	);

	const flipTo = useCallback(
		async (pageIndex: number, corner?: FlipCorner) => {
			await instance?.flip(pageIndex, corner);
		},
		[instance],
	);

	const goTo = useCallback(
		async (pageIndex: number) => {
			await instance?.turnToPage(pageIndex);
		},
		[instance],
	);

	const next = useCallback(async () => {
		await instance?.turnToNextPage();
	}, [instance]);

	const prev = useCallback(async () => {
		await instance?.turnToPrevPage();
	}, [instance]);

	const getCurrentPage = useCallback(
		() => instance?.currentPageIndex ?? -1,
		[instance],
	);
	const getPageCount = useCallback(() => instance?.pageCount ?? 0, [instance]);
	const getOrientation = useCallback(
		() => instance?.orientation ?? "portrait",
		[instance],
	);
	const getState = useCallback(() => instance?.state ?? "idle", [instance]);

	return {
		flipNext,
		flipPrev,
		flipTo,
		goTo,
		next,
		prev,
		getCurrentPage,
		getPageCount,
		getOrientation,
		getState,
	};
}
