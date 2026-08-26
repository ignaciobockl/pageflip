/**
 * FullscreenToggle Component
 *
 * Button to enter/exit fullscreen mode.
 * @packageDocumentation
 */
import type React from "react";
import { forwardRef, useEffect, useRef, useState } from "react";

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
		const buttonRef = useRef<HTMLButtonElement>(null);
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
					buttonRef.current = el;
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
						"opacity var(--pf-transition-fast), background-color var(--pf-transition-fast)",
					...style,
				}}
				aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
				aria-pressed={isFullscreen}
				data-testid={testId}
			>
				{isFullscreen ? (
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						aria-hidden="true"
					>
						<path d="M8 3v3a2 2 0 0 1-2 2H3m0 0h3v3m0-3h3v3" />
						<path d="M16 21v-3a2 2 0 0 1 2-2h3m0 0h-3v-3m0 3h-3v-3" />
						<path d="M3 16v-3a2 2 0 0 1 2-2h3" />
						<path d="M21 8v3a2 2 0 0 1-2 2h-3" />
					</svg>
				) : (
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						aria-hidden="true"
					>
						<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
					</svg>
				)}
			</button>
		);
	},
);

FullscreenToggle.displayName = "FullscreenToggle";
