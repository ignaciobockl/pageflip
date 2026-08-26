import type { PageFlipControls } from "@pageflip/react";
/**
 * Toolbar Component
 *
 * Navigation toolbar with prev/next buttons and page indicator.
 * @packageDocumentation
 */
import type React from "react";
import { forwardRef } from "react";

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
				className={`pf-toolbar pf-toolbar--${position} ${className || ""}`}
				style={{
					position: "absolute",
					[position]: 0,
					left: 0,
					right: 0,
					height: "var(--pf-toolbar-height)",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "0 var(--pf-space-md)",
					backgroundColor: "var(--pf-toolbar-bg)",
					borderTop:
						position === "bottom"
							? "1px solid var(--pf-toolbar-border)"
							: "none",
					borderBottom:
						position === "top" ? "1px solid var(--pf-toolbar-border)" : "none",
					zIndex: "var(--pf-z-dropdown)",
					...style,
				}}
				role="toolbar"
				aria-label="Page navigation"
			>
				{/* Left: First/Prev */}
				<div
					className="pf-toolbar__start"
					style={{
						display: "flex",
						alignItems: "center",
						gap: "var(--pf-space-xs)",
					}}
				>
					<button
						type="button"
						onClick={handleFirst}
						disabled={isFirstPage}
						className="pf-btn pf-btn--icon pf-btn--ghost"
						style={{
							width: "var(--pf-zoom-btn-size)",
							height: "var(--pf-zoom-btn-size)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							border: "none",
							background: "transparent",
							color: "var(--pf-color-text)",
							borderRadius: "var(--pf-radius-md)",
							cursor: isFirstPage ? "not-allowed" : "pointer",
							opacity: isFirstPage ? 0.4 : 1,
							transition: "opacity var(--pf-transition-fast)",
						}}
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
						className="pf-btn pf-btn--icon pf-btn--ghost"
						style={{
							width: "var(--pf-zoom-btn-size)",
							height: "var(--pf-zoom-btn-size)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							border: "none",
							background: "transparent",
							color: "var(--pf-color-text)",
							borderRadius: "var(--pf-radius-md)",
							cursor: isFirstPage ? "not-allowed" : "pointer",
							opacity: isFirstPage ? 0.4 : 1,
							transition: "opacity var(--pf-transition-fast)",
						}}
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
						className="pf-toolbar__center pf-page-indicator"
						style={{
							display: "flex",
							alignItems: "center",
							gap: "var(--pf-page-indicator-gap)",
							flex: 1,
							justifyContent: "center",
						}}
						aria-label="Page indicator"
						data-testid="page-indicator"
					>
						{renderPageIndicator ? (
							renderPageIndicator(currentPage, pageCount)
						) : (
							<>
								<span
									style={{
										fontSize: "var(--pf-text-sm)",
										color: "var(--pf-color-text-muted)",
										minWidth: "4rem",
										textAlign: "center",
									}}
								>
									{currentPage + 1} / {pageCount}
								</span>
								<div
									style={{
										display: "flex",
										gap: "var(--pf-page-indicator-gap)",
									}}
									aria-label="Pages"
								>
									{Array.from(
										{ length: Math.min(pageCount, 10) },
										(_, index) => index + 1,
									).map((pageNumber) => (
										<button
											key={pageNumber}
											type="button"
											onClick={() => controls.goTo(pageNumber - 1)}
											className={`pf-page-indicator__dot ${pageNumber - 1 === currentPage ? "pf-page-indicator__dot--active" : ""}`}
											style={{
												width: "var(--pf-page-indicator-size)",
												height: "var(--pf-page-indicator-size)",
												borderRadius: "var(--pf-radius-full)",
												border: "none",
												backgroundColor:
													pageNumber - 1 === currentPage
														? "var(--pf-page-indicator-active-color)"
														: "var(--pf-page-indicator-color)",
												cursor: "pointer",
												transition:
													"background-color var(--pf-transition-fast), transform var(--pf-transition-fast)",
												opacity: pageCount > 10 && pageNumber >= 9 ? 0.5 : 1,
											}}
											aria-label={`Go to page ${pageNumber}`}
											aria-current={
												pageNumber - 1 === currentPage ? "page" : undefined
											}
											data-testid={`page-indicator-${pageNumber - 1}`}
										/>
									))}
									{pageCount > 10 && (
										<span
											style={{
												fontSize: "var(--pf-text-xs)",
												color: "var(--pf-color-text-muted)",
												alignSelf: "center",
											}}
										>
											…
										</span>
									)}
								</div>
							</>
						)}
					</div>
				)}

				{/* Right: Next/Last */}
				<div
					className="pf-toolbar__end"
					style={{
						display: "flex",
						alignItems: "center",
						gap: "var(--pf-space-xs)",
					}}
				>
					<button
						type="button"
						onClick={handleNext}
						disabled={isLastPage}
						className="pf-btn pf-btn--icon pf-btn--ghost"
						style={{
							width: "var(--pf-zoom-btn-size)",
							height: "var(--pf-zoom-btn-size)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							border: "none",
							background: "transparent",
							color: "var(--pf-color-text)",
							borderRadius: "var(--pf-radius-md)",
							cursor: isLastPage ? "not-allowed" : "pointer",
							opacity: isLastPage ? 0.4 : 1,
							transition: "opacity var(--pf-transition-fast)",
						}}
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
						className="pf-btn pf-btn--icon pf-btn--ghost"
						style={{
							width: "var(--pf-zoom-btn-size)",
							height: "var(--pf-zoom-btn-size)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							border: "none",
							background: "transparent",
							color: "var(--pf-color-text)",
							borderRadius: "var(--pf-radius-md)",
							cursor: isLastPage ? "not-allowed" : "pointer",
							opacity: isLastPage ? 0.4 : 1,
							transition: "opacity var(--pf-transition-fast)",
						}}
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
