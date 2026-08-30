/**
 * usePageCornerDrag
 *
 * Pointer/touch drag logic for the PageCorner component.
 * @packageDocumentation
 */
import type React from "react";
import { useEffect, useRef, useState } from "react";

type CornerRef = React.MutableRefObject<HTMLDivElement | null>;

/** Point in corner-local coordinates. */
export interface CornerPoint {
	x: number;
	y: number;
}

/** Drag callbacks provided to the hook. */
export interface UsePageCornerDragOptions {
	/** Whether dragging is allowed. */
	enabled: boolean;
	/** Corner side. */
	corner: "top" | "bottom";
	/** Drag start handler. */
	onDragStart?: (corner: "top" | "bottom", point: CornerPoint) => void;
	/** Drag move handler. */
	onDragMove?: (point: CornerPoint) => void;
	/** Drag end handler. */
	onDragEnd?: (corner: "top" | "bottom") => void;
}

/**
 * usePageCornerDrag - Manages drag state and document listeners.
 *
 * @example
 * ```tsx
 * const { isDragging, cornerRef, handleMouseDown, handleTouchStart } = usePageCornerDrag({
 *   enabled: visible,
 *   corner: flipCorner,
 *   onDragStart,
 *   onDragMove,
 *   onDragEnd,
 * });
 * ```
 */
export function usePageCornerDrag(options: UsePageCornerDragOptions): {
	isDragging: boolean;
	cornerRef: CornerRef;
	setCornerRef: (element: HTMLDivElement | null) => void;
	handleMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
	handleTouchStart: (event: React.TouchEvent<HTMLDivElement>) => void;
} {
	const { enabled, corner, onDragStart, onDragMove, onDragEnd } = options;
	const [isDragging, setIsDragging] = useState(false);
	const cornerRef: CornerRef = useRef<HTMLDivElement | null>(null);
	const isDraggingRef = useRef(false);
	const cleanupRef = useRef<(() => void) | null>(null);

	const getPoint = (clientX: number, clientY: number): CornerPoint | null => {
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
		onDragEnd?.(corner);

		cleanupRef.current?.();
		cleanupRef.current = null;
	};

	const startDragging = (point: CornerPoint) => {
		isDraggingRef.current = true;
		setIsDragging(true);
		onDragStart?.(corner, point);
	};

	const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
		if (!enabled) return;

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
		if (!enabled || isDraggingRef.current) return;

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

	const setCornerRef = (element: HTMLDivElement | null) => {
		cornerRef.current = element;
	};

	return {
		isDragging,
		cornerRef,
		setCornerRef,
		handleMouseDown,
		handleTouchStart,
	};
}
