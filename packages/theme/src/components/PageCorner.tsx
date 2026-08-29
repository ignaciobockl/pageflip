/**
 * PageCorner Component
 *
 * Draggable corner indicator for page flip interaction.
 * @packageDocumentation
 */
import type React from "react";
import { forwardRef, useEffect, useRef, useState } from "react";

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
		const [isDragging, setIsDragging] = useState(false);
		const cornerRef = useRef<HTMLDivElement>(null);
		const isDraggingRef = useRef(false);
		const cleanupRef = useRef<(() => void) | null>(null);

		const flipCorner = corner.startsWith("top") ? "top" : "bottom";

		const getPoint = (clientX: number, clientY: number) => {
			const rect = cornerRef.current?.getBoundingClientRect();

			if (!rect) return null;

			return {
				x: clientX - rect.left,
				y: clientY - rect.top,
			};
		};

		const stopDragging = () => {
			if (!isDraggingRef.current) return;

			isDraggingRef.current = false;
			setIsDragging(false);
			onDragEnd?.(flipCorner);

			cleanupRef.current?.();
			cleanupRef.current = null;
		};

		const startDragging = (point: { x: number; y: number }) => {
			isDraggingRef.current = true;
			setIsDragging(true);
			onDragStart?.(flipCorner, point);
		};

		const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
			if (!visible) return;

			event.preventDefault();
			event.stopPropagation();

			const point = getPoint(event.clientX, event.clientY);

			if (!point) return;

			startDragging(point);

			const handleMouseMove = (moveEvent: MouseEvent) => {
				const movePoint = getPoint(moveEvent.clientX, moveEvent.clientY);

				if (!isDraggingRef.current || !movePoint) return;

				onDragMove?.(movePoint);
			};

			const handleMouseUp = () => {
				stopDragging();
			};

			cleanupRef.current?.();
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			cleanupRef.current = () => {
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
			};
		};

		const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
			if (!visible || isDraggingRef.current) return;

			event.preventDefault();
			event.stopPropagation();

			const touch = event.touches[0];
			const point = getPoint(touch.clientX, touch.clientY);

			if (!point) return;

			startDragging(point);

			const handleTouchMove = (moveEvent: TouchEvent) => {
				moveEvent.preventDefault();

				if (moveEvent.touches.length > 1) return;

				const touchMove = moveEvent.touches[0];

				if (!touchMove) return;

				const movePoint = getPoint(touchMove.clientX, touchMove.clientY);

				if (!isDraggingRef.current || !movePoint) return;

				onDragMove?.(movePoint);
			};

			const handleTouchEnd = () => {
				stopDragging();
			};

			cleanupRef.current?.();
			document.addEventListener("touchmove", handleTouchMove, {
				passive: false,
			});
			document.addEventListener("touchend", handleTouchEnd);
			document.addEventListener("touchcancel", handleTouchEnd);
			cleanupRef.current = () => {
				document.removeEventListener("touchmove", handleTouchMove);
				document.removeEventListener("touchend", handleTouchEnd);
				document.removeEventListener("touchcancel", handleTouchEnd);
			};
		};

		useEffect(() => {
			return () => {
				cleanupRef.current?.();
				cleanupRef.current = null;
				isDraggingRef.current = false;
			};
		}, []);

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
					cornerRef.current = element;

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
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="var(--pf-page-corner-color)"
						strokeWidth="2.5"
						aria-hidden="true"
						style={{
							transform: corner.startsWith("bottom")
								? "rotate(180deg)"
								: "none",
						}}
					>
						<path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
					</svg>
				</div>
			</div>
		);
	},
);

PageCorner.displayName = "PageCorner";
