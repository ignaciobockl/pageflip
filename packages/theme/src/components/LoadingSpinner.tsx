import type React from "react";
import { forwardRef } from "react";

export interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg";
	color?: string;
	className?: string;
	style?: React.CSSProperties;
	testId?: string;
}

const sizeStyles: Record<
	NonNullable<LoadingSpinnerProps["size"]>,
	React.CSSProperties
> = {
	sm: { width: "16px", height: "16px", borderWidth: "2px" },
	md: { width: "24px", height: "24px", borderWidth: "3px" },
	lg: { width: "32px", height: "32px", borderWidth: "4px" },
};

const srOnlyStyles: React.CSSProperties = {
	position: "absolute",
	width: "1px",
	height: "1px",
	padding: 0,
	margin: "-1px",
	overflow: "hidden",
	clip: "rect(0, 0, 0, 0)",
	whiteSpace: "nowrap",
	border: 0,
};

export const LoadingSpinner = forwardRef<
	HTMLOutputElement,
	LoadingSpinnerProps
>(
	(
		{
			size = "md",
			color = "var(--pf-color-primary)",
			className,
			style,
			testId = "pageflip-loading-spinner",
		},
		ref,
	) => (
		<>
			<output
				ref={ref}
				data-testid={testId}
				className={`pf-loading-spinner ${className || ""}`}
				style={{
					display: "inline-block",
					position: "relative",
					boxSizing: "border-box",
					...sizeStyles[size],
					borderRadius: "50%",
					borderStyle: "solid",
					borderColor: "var(--pf-color-border)",
					borderTopColor: color,
					animation: "pf-spin 1s linear infinite",
					...style,
				}}
				aria-label="Loading"
				aria-live="polite"
				aria-busy="true"
			>
				<span style={srOnlyStyles}>Loading...</span>
			</output>
			<style>{`
				@keyframes pf-spin {
					from {
						transform: rotate(0deg);
					}
					to {
						transform: rotate(360deg);
					}
				}
			`}</style>
		</>
	),
);

LoadingSpinner.displayName = "LoadingSpinner";
