/**
 * PageCorner Component
 *
 * Draggable corner indicator for page flip interaction.
 * @packageDocumentation
 */
import type React from "react";
import { forwardRef } from "react";
import { CornerFold } from "./icons";
import { usePageCornerDrag } from "./usePageCornerDrag";

/**
 * PageCorner props
 */
export interface PageCornerProps {
	/** Corner position */
	corner: "top-left" | "top-right" | "bottom-left" | "bottom-right";
	/** Whether corner is visible */
	visible?: boolean;
	/** Drag start handler */
	onDragStart?: (
		corner: "top" | "bottom",
		point: { x: number; y: number },
	) => void;
	/** Drag move handler */
	onDragMove?: (point: { x: number; y: number }) => void;
	/** Drag end handler */
	onDragEnd?: (corner: "top" | "bottom") => void;
	/** Additional CSS class */
	className?: string;
	/** Inline styles */
	style?: React.CSSProperties;
	/** Test ID */
	testId?: string;
}

/**
 * PageCorner - Draggable corner for page flip
 *
 * @example
 * ```tsx
 * <PageCorner
 *   corner="top-right"
 *   onDragStart={handleDragStart}
 *   onDragMove={handleDragMove}
 *   onDragEnd={handleDragEnd}
 * />
 * ```
 */
export const PageCorner = forwardRef<HTMLDivElement, PageCornerProps>(
	(
		{
			corner,
			visible = true,
			onDragStart,
			onDragMove,
			onDragEnd,
			className,
			style,
			testId = `pageflip-corner-${corner}`,
		},
		ref,
	) => {
		const flipCorner = corner.startsWith("top") ? "top" : "bottom";
		const { isDragging, setCornerRef, handleMouseDown, handleTouchStart } =
			usePageCornerDrag({
				enabled: visible,
				corner: flipCorner,
				onDragStart,
				onDragMove,
				onDragEnd,
			});

		if (!visible) return null;

		const positionStyles: React.CSSProperties = {
			position: "absolute",
			width: "var(--pf-page-corner-size)",
			height: "var(--pf-page-corner-size)",
			[corner.startsWith("top") ? "top" : "bottom"]: 0,
			[corner.endsWith("left") ? "left" : "right"]: 0,
			cursor: "grab",
			zIndex: 10,
			touchAction: "none",
		};

		const activeStyles: React.CSSProperties = isDragging
			? {
					cursor: "grabbing",
					transform: "scale(1.08)",
					transition: "none",
				}
			: {
					transition: "transform var(--pf-transition-base)",
				};

		const borderRadius =
			corner === "top-left"
				? "var(--pf-radius-full) 0 0 var(--pf-radius-full)"
				: corner === "top-right"
					? "0 var(--pf-radius-full) var(--pf-radius-full) 0"
					: corner === "bottom-left"
						? "0 var(--pf-radius-full) var(--pf-radius-full) 0"
						: "var(--pf-radius-full) 0 0 var(--pf-radius-full)";

		return (
			<div
				ref={(element) => {
					setCornerRef(element);

					if (typeof ref === "function") {
						ref(element);
					} else if (ref) {
						ref.current = element;
					}
				}}
				data-testid={testId}
				className={`pf-corner pf-corner--${corner} ${isDragging ? "pf-corner--dragging" : ""} ${className || ""}`}
				style={{
					...positionStyles,
					...activeStyles,
					...style,
				}}
				onMouseDown={handleMouseDown}
				onTouchStart={handleTouchStart}
				aria-label={`Drag to turn page ${corner.startsWith("top") ? "forward" : "backward"}`}
				aria-grabbed={isDragging}
			>
				<div
					className="pf-corner__visual"
					style={{
						width: "100%",
						height: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: "var(--pf-page-corner-bg)",
						border: "1px solid var(--pf-page-corner-border)",
						borderRadius,
						boxShadow: "var(--pf-page-corner-shadow)",
						transition:
							"transform var(--pf-transition-fast), box-shadow var(--pf-transition-fast)",
					}}
					aria-hidden="true"
				>
					<CornerFold
						color="var(--pf-page-corner-color)"
						style={{
							transform: corner.startsWith("bottom")
								? "rotate(180deg)"
								: "none",
						}}
					/>
				</div>
			</div>
		);
	},
);

PageCorner.displayName = "PageCorner";
