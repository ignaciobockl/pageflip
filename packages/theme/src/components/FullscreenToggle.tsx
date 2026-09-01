/**
 * FullscreenToggle Component
 *
 * Button to enter/exit fullscreen mode.
 * @packageDocumentation
 */
import type React from "react";
import { forwardRef, useEffect, useState } from "react";
import { FullscreenEnter, FullscreenExit } from "./icons";

/**
 * FullscreenToggle props
 */
export interface FullscreenToggleProps {
	/** Whether currently in fullscreen */
	isFullscreen: boolean;
	/** Callback to toggle fullscreen */
	onToggle: () => void;
	/** Target element for fullscreen (default: document.documentElement) */
	target?: HTMLElement | null;
	/** Additional CSS class */
	className?: string;
	/** Inline styles */
	style?: React.CSSProperties;
	/** Test ID */
	testId?: string;
}

type FullscreenDocument = Document & {
	webkitFullscreenEnabled?: boolean;
	mozFullScreenEnabled?: boolean;
	msFullscreenEnabled?: boolean;
};

/**
 * FullscreenToggle - Enter/exit fullscreen button
 *
 * @example
 * ```tsx
 * const [fullscreen, setFullscreen] = useState(false);
 *
 * <FullscreenToggle
 *   isFullscreen={fullscreen}
 *   onToggle={() => setFullscreen(!fullscreen)}
 * />
 * ```
 */
export const FullscreenToggle = forwardRef<
	HTMLButtonElement,
	FullscreenToggleProps
>(
	(
		{
			isFullscreen,
			onToggle,
			target = typeof document !== "undefined"
				? document.documentElement
				: null,
			className,
			style,
			testId = "pageflip-fullscreen-toggle",
		},
		ref,
	) => {
		const [fullscreenSupported, setFullscreenSupported] = useState(false);

		useEffect(() => {
			if (typeof document !== "undefined") {
				const fullscreenDocument = document as FullscreenDocument;

				setFullscreenSupported(
					!!(
						fullscreenDocument.fullscreenEnabled ||
						fullscreenDocument.webkitFullscreenEnabled ||
						fullscreenDocument.mozFullScreenEnabled ||
						fullscreenDocument.msFullscreenEnabled
					),
				);
			}
		}, []);

		useEffect(() => {
			if (!fullscreenSupported || typeof document === "undefined") return;

			const handleFullscreenChange = () => {
				void target;
			};

			document.addEventListener("fullscreenchange", handleFullscreenChange);
			document.addEventListener(
				"webkitfullscreenchange",
				handleFullscreenChange as EventListener,
			);
			document.addEventListener(
				"mozfullscreenchange",
				handleFullscreenChange as EventListener,
			);
			document.addEventListener(
				"MSFullscreenChange",
				handleFullscreenChange as EventListener,
			);

			return () => {
				document.removeEventListener(
					"fullscreenchange",
					handleFullscreenChange,
				);
				document.removeEventListener(
					"webkitfullscreenchange",
					handleFullscreenChange as EventListener,
				);
				document.removeEventListener(
					"mozfullscreenchange",
					handleFullscreenChange as EventListener,
				);
				document.removeEventListener(
					"MSFullscreenChange",
					handleFullscreenChange as EventListener,
				);
			};
		}, [fullscreenSupported, target]);

		const handleClick = async () => {
			await onToggle();
		};

		if (!fullscreenSupported) {
			return null;
		}

		return (
			<button
				ref={(el) => {
					if (ref) {
						if (typeof ref === "function") ref(el);
						else if ("current" in ref) ref.current = el;
					}
				}}
				type="button"
				onClick={handleClick}
				className={`pf-fullscreen-toggle ${className || ""}`}
				style={{
					width: "var(--pf-fullscreen-btn-size)",
					height: "var(--pf-fullscreen-btn-size)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					border: "none",
					background: "transparent",
					color: "var(--pf-color-text)",
					borderRadius: "var(--pf-radius-md)",
					cursor: "pointer",
					transition:
						"opacity var(--pf-transition-fast), background-color var(--pf-transition-fast), transform var(--pf-transition-fast)",
					...style,
				}}
				aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
				aria-pressed={isFullscreen}
				data-testid={testId}
			>
				{isFullscreen ? <FullscreenExit /> : <FullscreenEnter />}
			</button>
		);
	},
);

FullscreenToggle.displayName = "FullscreenToggle";
