/**
 * usePageFlipEvents Hook
 *
 * Subscribes to PageFlip events with typed handlers.
 * @packageDocumentation
 */
import type {
	FlipEvent,
	OrientationChangeEvent,
	PageFlipInstance,
	StateChangeEvent,
} from "@pageflip/core";
import { useEffect } from "react";

type EventfulPageFlipInstance = PageFlipInstance & EventTarget;

/**
 * Event handlers for usePageFlipEvents
 */
export interface PageFlipEventHandlers {
	onFlip?: (event: FlipEvent) => void;
	onChangeState?: (event: StateChangeEvent) => void;
	onChangeOrientation?: (event: OrientationChangeEvent) => void;
	onInit?: (instance: PageFlipInstance) => void;
	onUpdate?: (instance: PageFlipInstance) => void;
	onError?: (error: Error) => void;
}

/**
 * usePageFlipEvents - Subscribe to PageFlip events
 *
 * @example
 * ```tsx
 * usePageFlipEvents(instance, {
 *   onFlip: (e) => analytics.track('page_flip', { page: e.pageIndex }),
 *   onChangeState: (e) => console.log('State:', e.state),
 * });
 * ```
 */
export function usePageFlipEvents(
	instance: PageFlipInstance | null,
	handlers: PageFlipEventHandlers,
): void {
	const {
		onFlip,
		onChangeState,
		onChangeOrientation,
		onInit,
		onUpdate,
		onError,
	} = handlers;

	useEffect(() => {
		if (!instance) {
			return;
		}

		const eventfulInstance = instance as EventfulPageFlipInstance;

		const handleFlip = (event: Event) => {
			onFlip?.((event as CustomEvent<FlipEvent>).detail);
		};
		const handleStateChange = (event: Event) => {
			onChangeState?.((event as CustomEvent<StateChangeEvent>).detail);
		};
		const handleOrientationChange = (event: Event) => {
			onChangeOrientation?.(
				(event as CustomEvent<OrientationChangeEvent>).detail,
			);
		};
		const handleInit = (event: Event) => {
			onInit?.((event as CustomEvent<PageFlipInstance>).detail);
		};
		const handleUpdate = (event: Event) => {
			onUpdate?.((event as CustomEvent<PageFlipInstance>).detail);
		};
		const handleError = (event: Event) => {
			onError?.((event as CustomEvent<Error>).detail);
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
		eventfulInstance.addEventListener("init", handleInit as EventListener);
		eventfulInstance.addEventListener("update", handleUpdate as EventListener);
		eventfulInstance.addEventListener("error", handleError as EventListener);

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
			eventfulInstance.removeEventListener("init", handleInit as EventListener);
			eventfulInstance.removeEventListener(
				"update",
				handleUpdate as EventListener,
			);
			eventfulInstance.removeEventListener(
				"error",
				handleError as EventListener,
			);
		};
	}, [
		instance,
		onChangeOrientation,
		onChangeState,
		onError,
		onFlip,
		onInit,
		onUpdate,
	]);
}
