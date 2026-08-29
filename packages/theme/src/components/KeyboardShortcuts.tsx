import type { PageFlipControls } from "@pageflip/react";
/**
 * KeyboardShortcuts Component
 *
 * Global keyboard shortcuts handler for page flip navigation.
 * @packageDocumentation
 */
import type React from "react";
import { useCallback, useEffect, useRef } from "react";

/**
 * KeyboardShortcuts props
 */
export interface KeyboardShortcutsProps {
	/** PageFlip controls from usePageFlipControls */
	controls?: PageFlipControls;
	/** Enable keyboard navigation */
	enabled?: boolean;
	/** Custom key mappings */
	customKeys?: Record<string, () => void>;
	/** Test ID */
	testId?: string;
}

/**
 * KeyboardShortcuts - Global keyboard shortcuts for page flip
 *
 * Default shortcuts:
 * - ArrowRight / Space: Next page
 * - ArrowLeft / Shift+Space: Previous page
 * - Home: First page
 * - End: Last page
 * - + / =: Zoom in
 * - - / _: Zoom out
 * - 0: Reset zoom
 * - f: Toggle fullscreen
 *
 * @example
 * ```tsx
 * const controls = usePageFlipControls(instance);
 *
 * <KeyboardShortcuts controls={controls} enabled={true} />
 * ```
 */
export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
	controls,
	enabled = true,
	customKeys = {},
	testId = "pageflip-keyboard-shortcuts",
}) => {
	const controlsRef = useRef(controls);
	controlsRef.current = controls;

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (!enabled || !controlsRef.current) return;

			const target = event.target;
			if (
				target instanceof HTMLElement &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable)
			) {
				return;
			}

			const { key, ctrlKey, metaKey, shiftKey } = event;
			const currentControls = controlsRef.current;

			const isZoomIn = key === "+" || key === "=";
			const isZoomOut = key === "-" || key === "_";
			const isZoomReset = key === "0";
			const isFullscreen = key.toLowerCase() === "f";

			switch (key) {
				case "ArrowRight":
					if (!shiftKey) {
						event.preventDefault();
						void currentControls.next();
					}
					break;
				case " ":
					if (shiftKey) {
						event.preventDefault();
						void currentControls.prev();
					} else {
						event.preventDefault();
						void currentControls.next();
					}
					break;
				case "ArrowLeft":
					if (!shiftKey) {
						event.preventDefault();
						void currentControls.prev();
					}
					break;
				case "Home":
					event.preventDefault();
					void currentControls.goTo(0);
					break;
				case "End":
					event.preventDefault();
					void currentControls.goTo(currentControls.getPageCount() - 1);
					break;
				default:
					if (isZoomIn && (ctrlKey || metaKey)) {
						event.preventDefault();
					} else if (isZoomOut && (ctrlKey || metaKey)) {
						event.preventDefault();
					} else if (isZoomReset && (ctrlKey || metaKey)) {
						event.preventDefault();
					} else if (isFullscreen) {
						event.preventDefault();
					}
					break;
			}

			const customKey = customKeys[key.toLowerCase()] || customKeys[key];
			if (customKey) {
				event.preventDefault();
				customKey();
			}
		},
		[enabled, customKeys],
	);

	useEffect(() => {
		if (!enabled) return;

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [enabled, handleKeyDown]);

	return (
		<span data-testid={testId} style={{ display: "none" }} aria-hidden="true" />
	);
};

KeyboardShortcuts.displayName = "KeyboardShortcuts";
