/**
 * PageFlip React Component
 *
 * React 18+ wrapper for PageFlip core engine.
 * SSR-safe, forwards ref to PageFlipInstance, supports hooks.
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
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import type { CSSProperties, ReactNode } from "react";

/**
 * PageFlip component props
 */
export interface PageFlipProps<TPageData = unknown>
	extends Omit<PageFlipConfig, "width" | "height"> {
	/** Page width in pixels (required) */
	width: number;
	/** Page height in pixels (required) */
	height: number;
	/** HTML page elements as children */
	children?: ReactNode;
	/** Structured page data */
	pages?: PageData<TPageData>[];
	/** Image URLs for pages */
	images?: string[];
	/** Called when engine initializes */
	onInit?: (instance: PageFlipInstance) => void;
	/** Called when pages/layout update */
	onUpdate?: (instance: PageFlipInstance) => void;
	/** Called when page flips */
	onFlip?: (event: FlipEvent) => void;
	/** Called when flip state changes */
	onChangeState?: (event: StateChangeEvent) => void;
	/** Called when orientation changes */
	onChangeOrientation?: (event: OrientationChangeEvent) => void;
	/** Called when error occurs */
	onError?: (error: Error) => void;
	/** Additional CSS class */
	className?: string;
	/** Inline styles */
	style?: CSSProperties;
}

/**
 * Internal state for SSR safety
 */
interface PageFlipState {
	isClient: boolean;
	instance: PageFlipInstance | null;
	error: Error | null;
}

const baseStyle = {
	position: "relative",
	overflow: "hidden",
} satisfies CSSProperties;

const loadingContainerStyle = {
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	width: "100%",
	height: "100%",
} satisfies CSSProperties;

const errorContainerStyle = {
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	width: "100%",
	height: "100%",
	padding: "1rem",
	color: "var(--pf-color-error, #ef4444)",
} satisfies CSSProperties;

/**
 * PageFlip - Main React component for page flip book
 *
 * @example
 * ```tsx
 * <PageFlip width={800} height={600} onFlip={handleFlip}>
 *   <div>Page 1</div>
 *   <div>Page 2</div>
 * </PageFlip>
 * ```
 *
 * @example
 * ```tsx
 * <PageFlip
 *   width={800}
 *   height={600}
 *   pages={[
 *     { id: '1', index: 0, density: 'soft', content: { type: 'html', element: page1Element } },
 *     { id: '2', index: 1, density: 'soft', content: { type: 'image', src: '/page2.jpg' } }
 *   ]}
 * />
 * ```
 */
export const PageFlip = forwardRef<PageFlipInstance | null, PageFlipProps>(
	(
		{
			width,
			height,
			children,
			pages,
			images,
			onInit,
			onUpdate,
			onFlip,
			onChangeState,
			onChangeOrientation,
			onError,
			className,
			style,
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
		},
		forwardedRef,
	) => {
		const containerRef = useRef<HTMLDivElement>(null);
		const contentRef = useRef<HTMLDivElement>(null);
		const isMountedRef = useRef(false);
		const [state, setState] = useState<PageFlipState>({
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

		useEffect(() => {
			if (!state.isClient || !containerRef.current) {
				return;
			}

			let cancelled = false;
			let pageFlip: PageFlipInstance | null = null;

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

			const handleUpdate = (event: Event) => {
				onUpdate?.((event as CustomEvent<PageFlipInstance>).detail);
			};

			const handleError = (event: Event) => {
				const error = (event as CustomEvent<Error>).detail;
				onError?.(error);
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

					pageFlip = new FlipEngine(containerRef.current, memoizedConfig);
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
						onInit?.(pageFlip);
					}
				} catch (error) {
					if (!cancelled && isMountedRef.current) {
						const normalizedError =
							error instanceof Error ? error : new Error(String(error));
						setState((previousState) => ({
							...previousState,
							error: normalizedError,
						}));
						onError?.(normalizedError);
					}
				}
			};

			void initialize();

			return () => {
				cancelled = true;
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
		}, [
			images,
			memoizedConfig,
			onChangeOrientation,
			onChangeState,
			onError,
			onFlip,
			onInit,
			onUpdate,
			pages,
			state.isClient,
		]);

		useImperativeHandle(forwardedRef, () => state.instance, [state.instance]);

		const rootClassName = `pf-book${className ? ` ${className}` : ""}`;
		const rootStyle: CSSProperties = {
			width,
			height,
			...baseStyle,
			...style,
		};

		if (!state.isClient) {
			return (
				<div
					ref={containerRef}
					className={rootClassName}
					style={rootStyle}
					aria-busy="true"
					aria-label="Loading flip book..."
				>
					<div style={loadingContainerStyle}>
						<div className="pf-loading" aria-hidden="true" />
					</div>
				</div>
			);
		}

		if (state.error) {
			return (
				<div
					ref={containerRef}
					className={`${rootClassName} pf--error`}
					style={rootStyle}
					role="alert"
					aria-live="polite"
				>
					<div style={errorContainerStyle}>
						<p>Failed to load flip book: {state.error.message}</p>
					</div>
				</div>
			);
		}

		return (
			<div
				ref={containerRef}
				className={rootClassName}
				style={rootStyle}
				aria-roledescription="book"
				aria-label="Interactive flip book"
				data-current-page={state.instance?.currentPageIndex ?? 0}
				data-total-pages={state.instance?.pageCount ?? 0}
			>
				{children ? (
					<div ref={contentRef} style={{ display: "none" }} aria-hidden="true">
						{children}
					</div>
				) : null}
			</div>
		);
	},
);

PageFlip.displayName = "PageFlip";
