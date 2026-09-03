/**
 * usePageFlip Hook
 *
 * Creates and manages a PageFlip instance.
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";

type EventfulPageFlipInstance = PageFlipInstance & EventTarget;

/**
 * Return type for usePageFlip
 */
export interface UsePageFlipReturn<TPageData = unknown> {
	/** PageFlip instance (null on server) */
	instance: PageFlipInstance | null;
	/** Ref to attach to container element */
	ref: RefObject<HTMLDivElement>;
	/** Loading state */
	loading: boolean;
	/** Error if initialization failed */
	error: Error | null;
	/** Reload with new config */
	reload: (config?: Partial<PageFlipConfig>) => Promise<void>;
}

/**
 * Hook options
 */
export interface UsePageFlipOptions<TPageData = unknown>
	extends Omit<PageFlipConfig, "width" | "height"> {
	/** Page width (required) */
	width: number;
	/** Page height (required) */
	height: number;
	/** HTML elements as pages */
	children?: ReactNode;
	/** Structured page data */
	pages?: PageData<TPageData>[];
	/** Image URLs */
	images?: string[];
	/** Page sources */
	sources?: PageSource[];
	/** Auto-initialize on mount */
	autoInit?: boolean;
	/** Callback when instance ready */
	onInit?: (instance: PageFlipInstance) => void;
	/** Callback on page flip */
	onFlip?: (event: FlipEvent) => void;
	/** Callback on state change */
	onChangeState?: (event: StateChangeEvent) => void;
	/** Callback on orientation change */
	onChangeOrientation?: (event: OrientationChangeEvent) => void;
	/** Callback on update */
	onUpdate?: (instance: PageFlipInstance) => void;
	/** Callback on error */
	onError?: (error: Error) => void;
}

const toPageSource = <TPageData>(page: PageData<TPageData>): PageSource => {
	if (page.content.type === "html") {
		return {
			type: "html",
			content: page.content.element,
			density: page.density,
			metadata: page.metadata,
		};
	}

	if (page.content.type === "image") {
		return {
			type: "image",
			content: page.content.src,
			density: page.density,
			metadata: page.metadata,
		};
	}

	return {
		type: "renderer",
		content: page.content.source,
		density: page.density,
		rendererId: page.content.rendererId,
		metadata: page.metadata,
	};
};

/**
 * usePageFlip - Create and manage PageFlip instance
 *
 * @example
 * ```tsx
 * const { instance, ref, loading } = usePageFlip({
 *   width: 800,
 *   height: 600,
 *   onFlip: (e) => console.log(e.pageIndex),
 * });
 *
 * return <div ref={ref} />;
 * ```
 */
export function usePageFlip<TPageData = unknown>(
	options: UsePageFlipOptions<TPageData>,
): UsePageFlipReturn<TPageData> {
	const {
		width,
		height,
		pages,
		images,
		sources,
		size,
		minWidth,
		maxWidth,
		minHeight,
		maxHeight,
		flippingTime,
		drawShadow,
		maxShadowOpacity,
		showCover,
		usePortrait,
		mobileScrollSupport,
		swipeDistance,
		clickEventForward,
		disableFlipByClick,
		showPageCorners,
		renderer,
		rendererOptions,
		ariaLabel,
		ariaLabelPrev,
		ariaLabelNext,
		autoInit = true,
		onInit,
		onFlip,
		onChangeState,
		onChangeOrientation,
		onUpdate,
		onError,
	} = options;

	const containerRef = useRef<HTMLDivElement>(null);
	const [instance, setInstance] = useState<PageFlipInstance | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const initRef = useRef(false);
	const isMountedRef = useRef(false);
	const generationRef = useRef(0);
	const instanceRef = useRef<EventfulPageFlipInstance | null>(null);
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

	const memoizedConfig = useMemo<PageFlipConfig>(
		() => ({
			width,
			height,
			size,
			minWidth,
			maxWidth,
			minHeight,
			maxHeight,
			flippingTime,
			drawShadow,
			maxShadowOpacity,
			showCover,
			usePortrait,
			mobileScrollSupport,
			swipeDistance,
			clickEventForward,
			disableFlipByClick,
			showPageCorners,
			renderer,
			rendererOptions,
			ariaLabel,
			ariaLabelPrev,
			ariaLabelNext,
		}),
		[
			ariaLabel,
			ariaLabelNext,
			ariaLabelPrev,
			clickEventForward,
			disableFlipByClick,
			drawShadow,
			flippingTime,
			height,
			maxHeight,
			maxShadowOpacity,
			maxWidth,
			minHeight,
			minWidth,
			mobileScrollSupport,
			renderer,
			rendererOptions,
			showCover,
			showPageCorners,
			size,
			swipeDistance,
			usePortrait,
			width,
		],
	);

	const initialize = useCallback(async () => {
		if (!containerRef.current || initRef.current) {
			return;
		}

		initRef.current = true;
		setLoading(true);
		setError(null);
		generationRef.current += 1;
		const generation = generationRef.current;

		try {
			const { FlipEngine } = await import("@pageflip/core");

			if (
				generation !== generationRef.current ||
				!isMountedRef.current ||
				!containerRef.current
			) {
				return;
			}

			const htmlElements = containerRef.current
				? Array.from(containerRef.current.children).filter(
						(element): element is HTMLElement => element instanceof HTMLElement,
					)
				: [];
			const pageFlip = new FlipEngine(
				containerRef.current,
				memoizedConfig,
			) as EventfulPageFlipInstance;

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
				const nextError = (event as CustomEvent<Error>).detail;
				setError(nextError);
				handlersRef.current.onError?.(nextError);
			};

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

			instanceRef.current = pageFlip;
			setInstance(pageFlip);

			if (sources && sources.length > 0) {
				await pageFlip.loadFromSources(sources);
			} else if (images && images.length > 0) {
				await pageFlip.loadFromImages(images);
			} else if (pages && pages.length > 0) {
				await pageFlip.loadFromSources(pages.map((page) => toPageSource(page)));
			} else if (htmlElements.length > 0) {
				await pageFlip.loadFromHtml(htmlElements);
			}

			if (!isMountedRef.current) {
				pageFlip.destroy();
				return;
			}

			handlersRef.current.onInit?.(pageFlip);
		} catch (caughtError) {
			const nextError =
				caughtError instanceof Error
					? caughtError
					: new Error(String(caughtError));
			if (isMountedRef.current) {
				setError(nextError);
				handlersRef.current.onError?.(nextError);
			}
			instanceRef.current?.destroy();
			instanceRef.current = null;
			setInstance(null);
			initRef.current = false;
		} finally {
			if (isMountedRef.current) {
				setLoading(false);
			}
		}
	}, [images, memoizedConfig, pages, sources]);

	const reload = useCallback(
		async (newConfig?: Partial<PageFlipConfig>) => {
			if (instanceRef.current) {
				if (newConfig) {
					instanceRef.current.updateConfig(newConfig);
				}
				instanceRef.current.destroy();
				instanceRef.current = null;
				setInstance(null);
			}

			initRef.current = false;
			await initialize();
		},
		[initialize],
	);

	useEffect(() => {
		isMountedRef.current = true;

		if (autoInit) {
			void initialize();
		}

		return () => {
			isMountedRef.current = false;
			generationRef.current += 1;
			instanceRef.current?.destroy();
			instanceRef.current = null;
			initRef.current = false;
		};
	}, [autoInit, initialize]);

	return {
		instance,
		ref: containerRef,
		loading,
		error,
		reload,
	};
}
