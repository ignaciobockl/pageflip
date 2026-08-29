import type { PageFlipControls } from "@pageflip/react";
/**
 * Toolbar Component
 *
 * Navigation toolbar with prev/next buttons and page indicator.
 * @packageDocumentation
 */
import type React from "react";
import { forwardRef } from "react";
import {
	toolbarButtonVariants,
	toolbarIndicatorDotVariants,
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
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							aria-hidden="true"
						>
							<polygon points="11 17 6 12 11 7" />
							<polygon points="18 17 13 12 18 7" />
						</svg>
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
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							aria-hidden="true"
						>
							<polyline points="15 18 9 12 15 6" />
						</svg>
					</button>
				</div>

				{/* Center: Page Indicator */}
				{showPageIndicator && (
					<div
						className={`${toolbarSectionVariants({ align: "center" })} pf-page-indicator`}
						aria-label="Page indicator"
						data-testid="page-indicator"
					>
						{renderPageIndicator ? (
							renderPageIndicator(currentPage, pageCount)
						) : (
							<>
								<span className="pf-toolbar__page-text">
									{currentPage + 1} / {pageCount}
								</span>
								<div className="pf-toolbar__page-dots" aria-label="Pages">
									{Array.from(
										{ length: Math.min(pageCount, 10) },
										(_, index) => index + 1,
									).map((pageNumber) => (
										<button
											key={pageNumber}
											type="button"
											onClick={() => controls.goTo(pageNumber - 1)}
											className={toolbarIndicatorDotVariants({
												state:
													pageNumber - 1 === currentPage
														? "active"
														: pageCount > 10 && pageNumber >= 9
															? "muted"
															: undefined,
											})}
											aria-label={`Go to page ${pageNumber}`}
											aria-current={
												pageNumber - 1 === currentPage ? "page" : undefined
											}
											data-testid={`page-indicator-${pageNumber - 1}`}
										/>
									))}
									{pageCount > 10 && (
										<span className="pf-toolbar__ellipsis">…</span>
									)}
								</div>
							</>
						)}
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
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							aria-hidden="true"
						>
							<polyline points="9 18 15 12 9 6" />
						</svg>
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
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							aria-hidden="true"
						>
							<polygon points="13 17 18 12 13 7" />
							<polygon points="6 17 11 12 6 7" />
						</svg>
					</button>
				</div>
			</div>
		);
	},
);

Toolbar.displayName = "Toolbar";
