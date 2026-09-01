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
	StateChangeEvent,
} from "@pageflip/core";
import { forwardRef, useImperativeHandle, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { usePageFlipEngine } from "../hooks/usePageFlipEngine";

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
			...configFields
		},
		forwardedRef,
	) => {
		const contentRef = useRef<HTMLDivElement>(null);

		const { containerRef, state } = usePageFlipEngine({
			config: {
				...configFields,
				width,
				height,
			},
			pages,
			images,
			contentRef,
			onInit,
			onUpdate,
			onFlip,
			onChangeState,
			onChangeOrientation,
			onError,
		});

		useImperativeHandle(
			forwardedRef,
			() => state.instance as PageFlipInstance,
			[state.instance],
		);

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
				// biome-ignore lint/a11y/useSemanticElements: no native element represents a "book"; role=region with aria-roledescription is the correct ARIA mapping
				role="region"
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
