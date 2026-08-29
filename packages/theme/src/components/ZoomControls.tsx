/**
 * ZoomControls Component
 *
 * Zoom in/out/reset buttons with current level display.
 * @packageDocumentation
 */
import type React from "react";
import { forwardRef } from "react";

/**
 * ZoomControls props
 */
export interface ZoomControlsProps {
	/** Current zoom level (1 = 100%) */
	level: number;
	/** Minimum zoom level */
	minZoom?: number;
	/** Maximum zoom level */
	maxZoom?: number;
	/** Zoom step per click */
	step?: number;
	/** Callback when zoom in clicked */
	onZoomIn: () => void;
	/** Callback when zoom out clicked */
	onZoomOut: () => void;
	/** Callback when reset clicked */
	onReset: () => void;
	/** Show zoom level text */
	showLevel?: boolean;
	/** Explicit level content. Pass `null` to hide it. */
	levelIndicator?: React.ReactNode | null;
	/** Additional CSS class */
	className?: string;
	/** Inline styles */
	style?: React.CSSProperties;
	/** Test ID */
	testId?: string;
}

/**
 * ZoomControls - Zoom in/out/reset with level display
 *
 * @example
 * ```tsx
 * <ZoomControls
 *   level={1.5}
 *   onZoomIn={zoomIn}
 *   onZoomOut={zoomOut}
 *   onReset={resetZoom}
 * />
 * ```
 */
export const ZoomControls = forwardRef<HTMLDivElement, ZoomControlsProps>(
	(
		{
			level,
			minZoom = 0.25,
			maxZoom = 5,
			step = 0.25,
			onZoomIn,
			onZoomOut,
			onReset,
			showLevel = true,
			levelIndicator,
			className,
			style,
			testId = "pageflip-zoom-controls",
		},
		ref,
	) => {
		const isMin = level <= minZoom;
		const isMax = level >= maxZoom;
		const defaultLevelIndicator = showLevel ? (
			<span
				style={{
					minWidth: "3.5rem",
					textAlign: "center",
					fontSize: "var(--pf-text-sm)",
					fontVariantNumeric: "tabular-nums",
					color: "var(--pf-color-text)",
					fontFamily: "var(--pf-font-mono)",
					userSelect: "none",
				}}
				aria-live="polite"
				aria-label={`${Math.round(level * 100)}% zoom`}
				data-testid={`${testId}-level`}
			>
				{Math.round(level * 100)}%
			</span>
		) : null;

		return (
			<div
				ref={ref}
				data-testid={testId}
				data-step={step}
				className={`pf-zoom-controls ${className || ""}`}
				style={{
					display: "flex",
					alignItems: "center",
					gap: "var(--pf-space-xs)",
					padding: "var(--pf-space-xs) var(--pf-space-sm)",
					backgroundColor: "var(--pf-color-bg)",
					border: "1px solid var(--pf-color-border)",
					borderRadius: "var(--pf-radius-md)",
					...style,
				}}
				aria-label="Zoom controls"
			>
				<button
					type="button"
					onClick={onZoomOut}
					disabled={isMin}
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
						borderRadius: "var(--pf-radius-sm)",
						cursor: isMin ? "not-allowed" : "pointer",
						opacity: isMin ? 0.4 : 1,
						transition:
							"opacity var(--pf-transition-fast), background-color var(--pf-transition-fast)",
					}}
					aria-label="Zoom out"
					aria-disabled={isMin}
					data-testid={`${testId}-out`}
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
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
						<line x1="8" y1="11" x2="14" y2="11" />
					</svg>
				</button>

				{levelIndicator !== undefined ? levelIndicator : defaultLevelIndicator}

				<button
					type="button"
					onClick={onZoomIn}
					disabled={isMax}
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
						borderRadius: "var(--pf-radius-sm)",
						cursor: isMax ? "not-allowed" : "pointer",
						opacity: isMax ? 0.4 : 1,
						transition:
							"opacity var(--pf-transition-fast), background-color var(--pf-transition-fast)",
					}}
					aria-label="Zoom in"
					aria-disabled={isMax}
					data-testid={`${testId}-in`}
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
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
						<line x1="11" y1="8" x2="11" y2="14" />
						<line x1="8" y1="11" x2="14" y2="11" />
					</svg>
				</button>

				<button
					type="button"
					onClick={onReset}
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
						borderRadius: "var(--pf-radius-sm)",
						cursor: "pointer",
						transition:
							"opacity var(--pf-transition-fast), background-color var(--pf-transition-fast)",
						opacity: level === 1 ? 0.5 : 1,
					}}
					aria-label="Reset zoom"
					data-testid={`${testId}-reset`}
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
						<path d="M3 9v7h7" />
						<path d="M21 15v-7h-7" />
						<path d="M15 3a6 6 0 0 1 6 6" />
						<path d="M9 21a6 6 0 0 1-6-6" />
					</svg>
				</button>
			</div>
		);
	},
);

ZoomControls.displayName = "ZoomControls";
