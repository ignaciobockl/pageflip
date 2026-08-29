/**
 * PageIndicator Component
 *
 * Standalone page indicator with dots/buttons for navigation.
 * @packageDocumentation
 */
import type React from "react";

/**
 * PageIndicator props
 */
export interface PageIndicatorProps {
	/** Current page index (0-based) */
	current: number;
	/** Total number of pages */
	total: number;
	/** Click handler for page navigation */
	onPageClick: (pageIndex: number) => void;
	/** Maximum dots to show before ellipsis */
	maxDots?: number;
	/** Show page numbers instead of dots */
	showNumbers?: boolean;
	/** Additional CSS class */
	className?: string;
	/** Inline styles */
	style?: React.CSSProperties;
	/** Test ID */
	testId?: string;
}

/**
 * PageIndicator - Standalone page navigation dots/numbers
 *
 * @example
 * ```tsx
 * <PageIndicator
 *   current={2}
 *   total={10}
 *   onPageClick={goTo}
 * />
 * ```
 */
export const PageIndicator: React.FC<PageIndicatorProps> = ({
	current,
	total,
	onPageClick,
	maxDots = 10,
	showNumbers = false,
	className,
	style,
	testId = "pageflip-page-indicator",
}) => {
	const startIndex = Math.max(
		0,
		Math.min(current - Math.floor(maxDots / 2), total - maxDots),
	);
	const endIndex = Math.min(startIndex + maxDots, total);

	const pages = Array.from(
		{ length: endIndex - startIndex },
		(_, i) => startIndex + i,
	);
	const allPages = Array.from({ length: total }, (_, pageIndex) => pageIndex);

	return (
		<nav
			data-testid={testId}
			className={`pf-page-indicator ${className || ""}`}
			style={{
				display: "flex",
				alignItems: "center",
				gap: "var(--pf-page-indicator-gap)",
				...style,
			}}
			aria-label={`Page ${current + 1} of ${total}`}
		>
			{showNumbers ? (
				<select
					value={current}
					onChange={(e) => onPageClick(Number(e.target.value))}
					aria-label="Select page"
					style={{
						padding: "var(--pf-space-xs) var(--pf-space-sm)",
						fontSize: "var(--pf-text-sm)",
						border: "1px solid var(--pf-color-border)",
						borderRadius: "var(--pf-radius-md)",
						backgroundColor: "var(--pf-color-bg)",
						color: "var(--pf-color-text)",
						cursor: "pointer",
					}}
					data-testid={`${testId}-select`}
				>
					{allPages.map((pageIndex) => (
						<option key={pageIndex} value={pageIndex}>
							Page {pageIndex + 1}
						</option>
					))}
				</select>
			) : (
				<>
					{startIndex > 0 && (
						<button
							type="button"
							onClick={() => onPageClick(0)}
							className="pf-page-indicator__dot"
							style={{
								width: "var(--pf-page-indicator-hit-area)",
								height: "var(--pf-page-indicator-hit-area)",
								padding: "8px",
								boxSizing: "border-box",
								backgroundClip: "content-box",
								borderRadius: "var(--pf-radius-full)",
								border: "none",
								backgroundColor:
									current === 0
										? "var(--pf-page-indicator-active-color)"
										: "var(--pf-page-indicator-color)",
								cursor: "pointer",
								transition: "background-color var(--pf-transition-fast)",
							}}
							aria-label="First page"
							aria-current={current === 0 ? "page" : undefined}
							data-testid={`${testId}-first`}
						/>
					)}
					{startIndex > 1 && (
						<span
							style={{
								fontSize: "var(--pf-text-xs)",
								color: "var(--pf-color-text-muted)",
								padding: "0 var(--pf-space-xs)",
							}}
							aria-hidden="true"
						>
							…
						</span>
					)}
					{pages.map((pageIndex) => (
						<button
							key={pageIndex}
							type="button"
							onClick={() => onPageClick(pageIndex)}
							className={`pf-page-indicator__dot ${pageIndex === current ? "pf-page-indicator__dot--active" : ""}`}
							style={{
								width: "var(--pf-page-indicator-hit-area)",
								height: "var(--pf-page-indicator-hit-area)",
								padding: "8px",
								boxSizing: "border-box",
								backgroundClip: "content-box",
								borderRadius: "var(--pf-radius-full)",
								border: "none",
								backgroundColor:
									pageIndex === current
										? "var(--pf-page-indicator-active-color)"
										: "var(--pf-page-indicator-color)",
								cursor: "pointer",
								transition:
									"background-color var(--pf-transition-fast), transform var(--pf-transition-fast)",
							}}
							aria-label={`Page ${pageIndex + 1}`}
							aria-current={pageIndex === current ? "page" : undefined}
							data-testid={`${testId}-${pageIndex}`}
						/>
					))}
					{endIndex < total && (
						<>
							<span
								style={{
									fontSize: "var(--pf-text-xs)",
									color: "var(--pf-color-text-muted)",
									padding: "0 var(--pf-space-xs)",
								}}
								aria-hidden="true"
							>
								…
							</span>
							<button
								type="button"
								onClick={() => onPageClick(total - 1)}
								className="pf-page-indicator__dot"
								style={{
									width: "var(--pf-page-indicator-hit-area)",
									height: "var(--pf-page-indicator-hit-area)",
									padding: "8px",
									boxSizing: "border-box",
									backgroundClip: "content-box",
									borderRadius: "var(--pf-radius-full)",
									border: "none",
									backgroundColor:
										current === total - 1
											? "var(--pf-page-indicator-active-color)"
											: "var(--pf-page-indicator-color)",
									cursor: "pointer",
									transition: "background-color var(--pf-transition-fast)",
								}}
								aria-label="Last page"
								aria-current={current === total - 1 ? "page" : undefined}
								data-testid={`${testId}-last`}
							/>
						</>
					)}
				</>
			)}
		</nav>
	);
};

PageIndicator.displayName = "PageIndicator";
