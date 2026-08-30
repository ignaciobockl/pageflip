import type { PageFlipControls } from "@pageflip/react";
/**
 * Toolbar Component
 *
 * Navigation toolbar with prev/next buttons and page indicator.
 * @packageDocumentation
 */
import type React from "react";
import { forwardRef } from "react";
import { ToolbarIndicator } from "./ToolbarIndicator";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "./icons";
import {
	toolbarButtonVariants,
	toolbarSectionVariants,
	toolbarVariants,
} from "./toolbar.variants";

/**
 * Toolbar props
 */
export interface ToolbarProps {
	/** Position of toolbar */
	position?: "top" | "bottom";
	/** PageFlip controls from usePageFlipControls */
	controls: PageFlipControls;
	/** Current page index */
	currentPage: number;
	/** Total page count */
	pageCount: number;
	/** Show page indicator */
	showPageIndicator?: boolean;
	/** Explicit indicator content. Pass `null` to hide it. */
	indicator?: React.ReactNode | null;
	/** Custom page indicator render */
	renderPageIndicator?: (current: number, total: number) => React.ReactNode;
	/** Additional CSS class */
	className?: string;
	/** Inline styles */
	style?: React.CSSProperties;
	/** Test ID */
	testId?: string;
}

/**
 * Toolbar - Navigation toolbar for page flip
 *
 * @example
 * ```tsx
 * const controls = usePageFlipControls(instance);
 * const state = usePageFlipState(instance);
 *
 * <Toolbar
 *   position="bottom"
 *   controls={controls}
 *   currentPage={state.currentPage}
 *   pageCount={state.pageCount}
 * />
 * ```
 */
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
	(
		{
			position = "bottom",
			controls,
			currentPage,
			pageCount,
			showPageIndicator = true,
			indicator,
			renderPageIndicator,
			className,
			style,
			testId = "pageflip-toolbar",
		},
		ref,
	) => {
		const isFirstPage = currentPage === 0;
		const isLastPage = currentPage >= pageCount - 1;

		const handlePrev = async () => {
			if (!isFirstPage) await controls.prev();
		};

		const handleNext = async () => {
			if (!isLastPage) await controls.next();
		};

		const handleFirst = async () => {
			await controls.goTo(0);
		};

		const handleLast = async () => {
			await controls.goTo(pageCount - 1);
		};

		const defaultIndicator = renderPageIndicator ? (
			renderPageIndicator(currentPage, pageCount)
		) : (
			<ToolbarIndicator
				controls={controls}
				currentPage={currentPage}
				pageCount={pageCount}
			/>
		);

		const resolvedIndicator =
			indicator !== undefined
				? indicator
				: showPageIndicator
					? defaultIndicator
					: null;

		return (
			<div
				ref={ref}
				data-testid={testId}
				className={`${toolbarVariants({ position })} ${className || ""}`}
				style={style}
				role="toolbar"
				aria-label="Page navigation"
			>
				{/* Left: First/Prev */}
				<div className={toolbarSectionVariants({ align: "start" })}>
					<button
						type="button"
						onClick={handleFirst}
						disabled={isFirstPage}
						className={toolbarButtonVariants({
							state: isFirstPage ? "disabled" : undefined,
						})}
						aria-label="First page"
						aria-disabled={isFirstPage}
						data-testid="first-page-btn"
					>
						<ChevronsLeft />
					</button>
					<button
						type="button"
						onClick={handlePrev}
						disabled={isFirstPage}
						className={toolbarButtonVariants({
							state: isFirstPage ? "disabled" : undefined,
						})}
						aria-label="Previous page"
						aria-disabled={isFirstPage}
						data-testid="prev-page-btn"
					>
						<ChevronLeft />
					</button>
				</div>

				{/* Center: Page Indicator */}
				{resolvedIndicator !== null && (
					<div
						className={`${toolbarSectionVariants({ align: "center" })} pf-page-indicator`}
						aria-label="Page indicator"
						data-testid="page-indicator"
					>
						{resolvedIndicator}
					</div>
				)}

				{/* Right: Next/Last */}
				<div className={toolbarSectionVariants({ align: "end" })}>
					<button
						type="button"
						onClick={handleNext}
						disabled={isLastPage}
						className={toolbarButtonVariants({
							state: isLastPage ? "disabled" : undefined,
						})}
						aria-label="Next page"
						aria-disabled={isLastPage}
						data-testid="next-page-btn"
					>
						<ChevronRight />
					</button>
					<button
						type="button"
						onClick={handleLast}
						disabled={isLastPage}
						className={toolbarButtonVariants({
							state: isLastPage ? "disabled" : undefined,
						})}
						aria-label="Last page"
						aria-disabled={isLastPage}
						data-testid="last-page-btn"
					>
						<ChevronsRight />
					</button>
				</div>
			</div>
		);
	},
);

Toolbar.displayName = "Toolbar";
