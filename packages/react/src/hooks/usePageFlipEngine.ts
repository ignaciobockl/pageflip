/**
 * usePageFlipEngine Hook
 *
 * Manages the PageFlip engine lifecycle for the PageFlip component.
 * @packageDocumentation
 */
import type {
	FlipEvent,
	OrientationChangeEvent,
	PageData,
	PageFlipConfig,
	PageFlipInstance,
	PageSource,
	StateChangeEvent,
} from "@pageflip/core";
import type { RefObject } from "react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

/**
 * Internal state for SSR safety
 */
export interface PageFlipEngineState {
	isClient: boolean;
	instance: PageFlipInstance | null;
	error: Error | null;
}

/**
 * Options for usePageFlipEngine
 */
export interface UsePageFlipEngineOptions {
	/** Flip engine config */
	config: PageFlipConfig;
	/** Structured page data */
	pages?: PageData<unknown>[];
	/** Image URLs */
	images?: string[];
	/** Content ref for HTML children */
	contentRef: RefObject<HTMLDivElement>;
	/** Called when engine initializes */
	onInit?: (instance: PageFlipInstance) => void;
	/** Called on page flip */
	onFlip?: (event: FlipEvent) => void;
	/** Called on state change */
	onChangeState?: (event: StateChangeEvent) => void;
	/** Called on orientation change */
	onChangeOrientation?: (event: OrientationChangeEvent) => void;
	/** Called on update */
	onUpdate?: (instance: PageFlipInstance) => void;
	/** Called on error */
	onError?: (error: Error) => void;
}

/**
 * usePageFlipEngine - Creates and manages the engine instance.
 */
export function usePageFlipEngine(options: UsePageFlipEngineOptions): {
	containerRef: RefObject<HTMLDivElement>;
	instanceRef: RefObject<PageFlipInstance | null>;
	state: PageFlipEngineState;
} {
	const {
		pages,
		images,
		config,
		contentRef,
		onInit,
		onFlip,
		onChangeState,
		onChangeOrientation,
		onUpdate,
		onError,
	} = options;

	const containerRef = useRef<HTMLDivElement>(null);
	const isMountedRef = useRef(false);
	const initRef = useRef(false);
	const instanceRef = useRef<PageFlipInstance | null>(null);
	const handlersRef = useRef({
		onInit,
		onFlip,
		onChangeState,
		onChangeOrientation,
		onUpdate,
		onError,
	});
	handlersRef.current = {
		onInit,
		onFlip,
		onChangeState,
		onChangeOrientation,
		onUpdate,
		onError,
	};
	const [state, setState] = useState<PageFlipEngineState>({
		isClient: false,
		instance: null,
		error: null,
	});

	useEffect(() => {
		isMountedRef.current = true;
		setState((previousState) => ({
			...previousState,
			isClient: true,
		}));

		return () => {
			isMountedRef.current = false;
		};
	}, []);

	const configRef = useRef(config);
	configRef.current = config;

	useLayoutEffect(() => {
		if (!state.isClient || !containerRef.current || initRef.current) {
			return;
		}
		initRef.current = true;
		let cancelled = false;
		let pageFlip: PageFlipInstance | null = null;
		instanceRef.current = pageFlip;

		const handleFlip = (event: Event) => {
			handlersRef.current.onFlip?.((event as CustomEvent<FlipEvent>).detail);
		};

		const handleStateChange = (event: Event) => {
			handlersRef.current.onChangeState?.(
				(event as CustomEvent<StateChangeEvent>).detail,
			);
		};

		const handleOrientationChange = (event: Event) => {
			handlersRef.current.onChangeOrientation?.(
				(event as CustomEvent<OrientationChangeEvent>).detail,
			);
		};

		const handleUpdate = (event: Event) => {
			handlersRef.current.onUpdate?.(
				(event as CustomEvent<PageFlipInstance>).detail,
			);
		};

		const handleError = (event: Event) => {
			const error = (event as CustomEvent<Error>).detail;
			handlersRef.current.onError?.(error);
			if (isMountedRef.current) {
				setState((previousState) => ({
					...previousState,
					error,
				}));
			}
		};

		const toPageSource = ({
			content,
			density,
			metadata,
		}: PageData): PageSource => {
			if (content.type === "html") {
				return {
					type: content.type,
					content: content.element,
					density,
					metadata,
				};
			}

			if (content.type === "image") {
				return {
					type: content.type,
					content: content.src,
					density,
					metadata,
				};
			}

			return {
				type: content.type,
				content: content.source,
				density,
				rendererId: content.rendererId,
				metadata,
			};
		};

		const initialize = async () => {
			try {
				const { FlipEngine } = await import("@pageflip/core");

				if (cancelled || !containerRef.current) {
					return;
				}

				pageFlip = new FlipEngine(containerRef.current, configRef.current);
				instanceRef.current = pageFlip;
				pageFlip.addEventListener("flip", handleFlip as EventListener);
				pageFlip.addEventListener(
					"statechange",
					handleStateChange as EventListener,
				);
				pageFlip.addEventListener(
					"orientationchange",
					handleOrientationChange as EventListener,
				);
				pageFlip.addEventListener("update", handleUpdate as EventListener);
				pageFlip.addEventListener("error", handleError as EventListener);

				if (images && images.length > 0) {
					await pageFlip.loadFromImages(images);
				} else if (pages && pages.length > 0) {
					await pageFlip.loadFromSources(pages.map(toPageSource));
				} else if (contentRef.current) {
					const childElements = Array.from(
						contentRef.current.children,
					) as HTMLElement[];
					if (childElements.length > 0) {
						await pageFlip.loadFromHtml(childElements);
					}
				}

				if (!cancelled && isMountedRef.current) {
					setState((previousState) => ({
						...previousState,
						instance: pageFlip,
						error: null,
					}));
					handlersRef.current.onInit?.(pageFlip);
				}
			} catch (error) {
				if (!cancelled && isMountedRef.current) {
					const normalizedError =
						error instanceof Error ? error : new Error(String(error));
					setState((previousState) => ({
						...previousState,
						error: normalizedError,
					}));
					handlersRef.current.onError?.(normalizedError);
				}
			}
		};

		void initialize();

		return () => {
			initRef.current = false;
			cancelled = true;
			instanceRef.current = null;
			pageFlip?.removeEventListener("flip", handleFlip as EventListener);
			pageFlip?.removeEventListener(
				"statechange",
				handleStateChange as EventListener,
			);
			pageFlip?.removeEventListener(
				"orientationchange",
				handleOrientationChange as EventListener,
			);
			pageFlip?.removeEventListener("update", handleUpdate as EventListener);
			pageFlip?.removeEventListener("error", handleError as EventListener);
			pageFlip?.destroy();

			if (isMountedRef.current) {
				setState((previousState) => ({
					...previousState,
					instance: null,
				}));
			}
		};
	}, [contentRef, images, pages, state.isClient]);

	useEffect(() => {
		instanceRef.current?.updateConfig(config);
	}, [config]);
	return {
		containerRef,
		instanceRef,
		state,
	};
}
