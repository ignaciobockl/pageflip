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
	/** Explicit mode for indicator rendering. */
	mode?: "dots" | "numbers";
	/** Additional CSS class */
	className?: string;
	/** Inline styles */
	style?: React.CSSProperties;
	/** Test ID */
	testId?: string;
}

interface IndicatorDotProps {
	/** Page index this dot navigates to */
	pageIndex: number;
	/** Whether this dot is active */
	isActive: boolean;
	/** Click handler */
	onPageClick: (pageIndex: number) => void;
	/** Label */
	label: string;
	/** Test ID */
	testId: string;
}

const IndicatorDot: React.FC<IndicatorDotProps> = ({
	pageIndex,
	isActive,
	onPageClick,
	label,
	testId,
}) => (
	<button
		type="button"
		onClick={() => onPageClick(pageIndex)}
		className={`pf-page-indicator__dot ${isActive ? "pf-page-indicator__dot--active" : ""}`}
		style={{
			width: "var(--pf-page-indicator-hit-area)",
			height: "var(--pf-page-indicator-hit-area)",
			padding: "8px",
			boxSizing: "border-box",
			backgroundClip: "content-box",
			borderRadius: "var(--pf-radius-full)",
			border: "none",
			backgroundColor: isActive
				? "var(--pf-page-indicator-active-color)"
				: "var(--pf-page-indicator-color)",
			cursor: "pointer",
			transition:
				"background-color var(--pf-transition-fast), transform var(--pf-transition-fast)",
		}}
		aria-label={label}
		aria-current={isActive ? "page" : undefined}
		data-testid={testId}
	/>
);

const Ellipsis: React.FC = () => (
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
);

/**
 * PageIndicator - Standalone page navigation dots/numbers
 */
export const PageIndicator: React.FC<PageIndicatorProps> = ({
	current,
	total,
	onPageClick,
	maxDots = 10,
	showNumbers = false,
	mode,
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
	const resolvedMode = mode ?? (showNumbers ? "numbers" : "dots");

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
			{resolvedMode === "numbers" ? (
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
						<IndicatorDot
							pageIndex={0}
							isActive={current === 0}
							onPageClick={onPageClick}
							label="First page"
							testId={`${testId}-first`}
						/>
					)}
					{startIndex > 1 && <Ellipsis />}
					{pages.map((pageIndex) => (
						<IndicatorDot
							key={pageIndex}
							pageIndex={pageIndex}
							isActive={pageIndex === current}
							onPageClick={onPageClick}
							label={`Page ${pageIndex + 1}`}
							testId={`${testId}-${pageIndex}`}
						/>
					))}
					{endIndex < total && (
						<>
							{endIndex < total - 1 && <Ellipsis />}
							<IndicatorDot
								pageIndex={total - 1}
								isActive={current === total - 1}
								onPageClick={onPageClick}
								label="Last page"
								testId={`${testId}-last`}
							/>
						</>
					)}
				</>
			)}
		</nav>
	);
};

PageIndicator.displayName = "PageIndicator";
