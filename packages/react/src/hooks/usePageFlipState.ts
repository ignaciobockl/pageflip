/**
 * usePageFlipState Hook
 *
 * Subscribes to PageFlip instance state changes.
 * @packageDocumentation
 */
import type {
	FlipState,
	OrientationChangeEvent,
	PageFlipInstance,
	PageOrientation,
	Rect,
	StateChangeEvent,
} from "@pageflip/core";
import { useEffect, useState } from "react";

type EventfulPageFlipInstance = PageFlipInstance & EventTarget;

/**
 * State returned by usePageFlipState
 */
export interface PageFlipState {
	/** Current page index */
	currentPage: number;
	/** Total page count */
	pageCount: number;
	/** Current orientation */
	orientation: PageOrientation;
	/** Current flip state */
	state: FlipState;
	/** Whether flip is in progress */
	isFlipping: boolean;
	/** Bounds rectangle */
	bounds: Rect | null;
}

/**
 * usePageFlipState - Reactive state from PageFlip instance
 *
 * @example
 * ```tsx
 * const { currentPage, pageCount, isFlipping } = usePageFlipState(instance);
 *
 * return <span>{currentPage + 1} / {pageCount}</span>;
 * ```
 */
export function usePageFlipState(
	instance: PageFlipInstance | null,
): PageFlipState {
	const [state, setState] = useState<PageFlipState>({
		currentPage: instance?.currentPageIndex ?? 0,
		pageCount: instance?.pageCount ?? 0,
		orientation: instance?.orientation ?? "portrait",
		state: instance?.state ?? "idle",
		isFlipping: false,
		bounds: instance?.bounds ?? null,
	});

	useEffect(() => {
		if (!instance) {
			setState({
				currentPage: 0,
				pageCount: 0,
				orientation: "portrait",
				state: "idle",
				isFlipping: false,
				bounds: null,
			});
			return;
		}

		const eventfulInstance = instance as EventfulPageFlipInstance;

		const updateState = () => {
			setState({
				currentPage: instance.currentPageIndex,
				pageCount: instance.pageCount,
				orientation: instance.orientation,
				state: instance.state,
				isFlipping: instance.state === "flipping",
				bounds: instance.bounds,
			});
		};

		updateState();

		const handleFlip = () => {
			updateState();
		};
		const handleStateChange = (event: Event) => {
			const detail = (event as CustomEvent<StateChangeEvent>).detail;
			setState((previousState) => ({
				...previousState,
				state: detail.state,
				isFlipping: detail.state === "flipping",
			}));
		};
		const handleOrientationChange = (event: Event) => {
			const detail = (event as CustomEvent<OrientationChangeEvent>).detail;
			setState((previousState) => ({
				...previousState,
				orientation: detail.orientation,
			}));
		};
		const handleUpdate = () => {
			updateState();
		};

		eventfulInstance.addEventListener("flip", handleFlip as EventListener);
		eventfulInstance.addEventListener(
			"statechange",
			handleStateChange as EventListener,
		);
		eventfulInstance.addEventListener(
			"orientationchange",
			handleOrientationChange as EventListener,
		);
		eventfulInstance.addEventListener("update", handleUpdate as EventListener);

		return () => {
			eventfulInstance.removeEventListener("flip", handleFlip as EventListener);
			eventfulInstance.removeEventListener(
				"statechange",
				handleStateChange as EventListener,
			);
			eventfulInstance.removeEventListener(
				"orientationchange",
				handleOrientationChange as EventListener,
			);
			eventfulInstance.removeEventListener(
				"update",
				handleUpdate as EventListener,
			);
		};
	}, [instance]);

	return state;
}
