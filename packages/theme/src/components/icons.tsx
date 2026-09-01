/**
 * Shared SVG icons for theme components.
 * @packageDocumentation
 */
import type React from "react";

const baseProps = {
	width: 20,
	height: 20,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
} as const;

/** Double-left chevron icon (first page). */
export const ChevronsLeft: React.FC = () => (
	<svg {...baseProps} aria-hidden="true">
		<polygon points="11 17 6 12 11 7" />
		<polygon points="18 17 13 12 18 7" />
	</svg>
);

/** Double-right chevron icon (last page). */
export const ChevronsRight: React.FC = () => (
	<svg {...baseProps} aria-hidden="true">
		<polygon points="13 17 18 12 13 7" />
		<polygon points="6 17 11 12 6 7" />
	</svg>
);

/** Left chevron icon (previous page). */
export const ChevronLeft: React.FC = () => (
	<svg {...baseProps} aria-hidden="true">
		<polyline points="15 18 9 12 15 6" />
	</svg>
);

/** Right chevron icon (next page). */
export const ChevronRight: React.FC = () => (
	<svg {...baseProps} aria-hidden="true">
		<polyline points="9 18 15 12 9 6" />
	</svg>
);

/** Zoom out icon (minus). */
export const ZoomOut: React.FC = () => (
	<svg {...baseProps} aria-hidden="true">
		<circle cx="11" cy="11" r="8" />
		<line x1="21" y1="21" x2="16.65" y2="16.65" />
		<line x1="8" y1="11" x2="14" y2="11" />
	</svg>
);

/** Zoom in icon (plus). */
export const ZoomIn: React.FC = () => (
	<svg {...baseProps} aria-hidden="true">
		<circle cx="11" cy="11" r="8" />
		<line x1="21" y1="21" x2="16.65" y2="16.65" />
		<line x1="11" y1="8" x2="11" y2="14" />
		<line x1="8" y1="11" x2="14" y2="11" />
	</svg>
);

/** Reset zoom icon (maximize). */
export const ZoomReset: React.FC = () => (
	<svg {...baseProps} aria-hidden="true">
		<path d="M3 9v7h7" />
		<path d="M21 15v-7h-7" />
		<path d="M15 3a6 6 0 0 1 6 6" />
		<path d="M9 21a6 6 0 0 1-6-6" />
	</svg>
);

/** Enter fullscreen icon. */
export const FullscreenEnter: React.FC = () => (
	<svg {...baseProps} aria-hidden="true">
		<path d="M8 3v3a2 2 0 0 1-2 2H3m0 0h3v3m0-3h3v3" />
		<path d="M16 21v-3a2 2 0 0 1 2-2h3m0 0h-3v-3m0 3h-3v-3" />
		<path d="M3 16v-3a2 2 0 0 1 2-2h3" />
		<path d="M21 8v3a2 2 0 0 1-2 2h-3" />
	</svg>
);

/** Exit fullscreen icon. */
export const FullscreenExit: React.FC = () => (
	<svg {...baseProps} aria-hidden="true">
		<path d="M8 3v3a2 2 0 0 1-2 2H3" />
		<path d="M16 21v-3a2 2 0 0 1 2-2h3" />
		<path d="M3 8h3a2 2 0 0 0 2-2V3" />
		<path d="M21 16h-3a2 2 0 0 0-2 2v3" />
		<path d="M3 16h3a2 2 0 0 1 2 2v3" />
		<path d="M21 8h-3a2 2 0 0 1-2-2V3" />
	</svg>
);

/** Page corner fold icon. */
export const CornerFold: React.FC<{
	color?: string;
	style?: React.CSSProperties;
}> = ({ color = "currentColor", style }) => (
	<svg
		{...baseProps}
		width={24}
		height={24}
		stroke={color}
		strokeWidth={2.5}
		style={style}
		aria-hidden="true"
	>
		<path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
	</svg>
);
