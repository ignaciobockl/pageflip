/**
 * Tailwind v4 Configuration for PageFlip
 *
 * Provides utility classes mapped to design tokens.
 * @packageDocumentation
 */
import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class", '[data-theme="dark"]'],
	content: [
		"../../packages/react/src/**/*.{ts,tsx}",
		"../../packages/web-component/src/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx,css}",
	],
	theme: {
		extend: {
			colors: {
				pf: {
					bg: "var(--pf-color-bg)",
					"bg-secondary": "var(--pf-color-bg-secondary)",
					"bg-tertiary": "var(--pf-color-bg-tertiary)",
					"bg-hover": "var(--pf-color-bg-hover)",
					"bg-active": "var(--pf-color-bg-active)",
					text: "var(--pf-color-text)",
					"text-secondary": "var(--pf-color-text-secondary)",
					"text-muted": "var(--pf-color-text-muted)",
					"text-inverse": "var(--pf-color-text-inverse)",
					"text-link": "var(--pf-color-text-link)",
					"text-link-hover": "var(--pf-color-text-link-hover)",
					primary: "var(--pf-color-primary)",
					"primary-hover": "var(--pf-color-primary-hover)",
					"primary-active": "var(--pf-color-primary-active)",
					"primary-light": "var(--pf-color-primary-light)",
					border: "var(--pf-color-border)",
					"border-strong": "var(--pf-color-border-strong)",
					"border-focus": "var(--pf-color-border-focus)",
					shadow: "var(--pf-color-shadow)",
					"shadow-strong": "var(--pf-color-shadow-strong)",
					"shadow-focus": "var(--pf-color-shadow-focus)",
					overlay: "var(--pf-color-overlay)",
					"overlay-strong": "var(--pf-color-overlay-strong)",
					success: "var(--pf-color-success)",
					"success-light": "var(--pf-color-success-light)",
					warning: "var(--pf-color-warning)",
					"warning-light": "var(--pf-color-warning-light)",
					error: "var(--pf-color-error)",
					"error-light": "var(--pf-color-error-light)",
					info: "var(--pf-color-info)",
					"info-light": "var(--pf-color-info-light)",
				},
			},
			spacing: {
				0: "var(--pf-space-0)",
				xs: "var(--pf-space-xs)",
				sm: "var(--pf-space-sm)",
				md: "var(--pf-space-md)",
				lg: "var(--pf-space-lg)",
				xl: "var(--pf-space-xl)",
				"2xl": "var(--pf-space-2xl)",
				"3xl": "var(--pf-space-3xl)",
			},
			borderRadius: {
				none: "var(--pf-radius-none)",
				sm: "var(--pf-radius-sm)",
				md: "var(--pf-radius-md)",
				lg: "var(--pf-radius-lg)",
				xl: "var(--pf-radius-xl)",
				"2xl": "var(--pf-radius-2xl)",
				full: "var(--pf-radius-full)",
			},
			boxShadow: {
				xs: "var(--pf-shadow-xs)",
				sm: "var(--pf-shadow-sm)",
				md: "var(--pf-shadow-md)",
				lg: "var(--pf-shadow-lg)",
				xl: "var(--pf-shadow-xl)",
				"2xl": "var(--pf-shadow-2xl)",
				flip: "var(--pf-shadow-flip)",
				focus: "var(--pf-shadow-focus)",
				inset: "var(--pf-shadow-inset)",
			},
			transitionDuration: {
				fast: "var(--pf-transition-fast)",
				base: "var(--pf-transition-base)",
				slow: "var(--pf-transition-slow)",
				flip: "var(--pf-transition-flip)",
			},
			transitionTimingFunction: {
				default: "var(--pf-animation-easing)",
			},
			zIndex: {
				base: "var(--pf-z-base)",
				dropdown: "var(--pf-z-dropdown)",
				sticky: "var(--pf-z-sticky)",
				"modal-backdrop": "var(--pf-z-modal-backdrop)",
				modal: "var(--pf-z-modal)",
				popover: "var(--pf-z-popover)",
				tooltip: "var(--pf-z-tooltip)",
				toast: "var(--pf-z-toast)",
				"page-flip": "var(--pf-z-page-flip)",
			},
			fontFamily: {
				sans: "var(--pf-font-sans)",
				mono: "var(--pf-font-mono)",
			},
			fontSize: {
				xs: ["var(--pf-text-xs)", { lineHeight: "var(--pf-leading-normal)" }],
				sm: ["var(--pf-text-sm)", { lineHeight: "var(--pf-leading-normal)" }],
				base: [
					"var(--pf-text-base)",
					{ lineHeight: "var(--pf-leading-normal)" },
				],
				lg: ["var(--pf-text-lg)", { lineHeight: "var(--pf-leading-normal)" }],
				xl: ["var(--pf-text-xl)", { lineHeight: "var(--pf-leading-normal)" }],
				"2xl": [
					"var(--pf-text-2xl)",
					{ lineHeight: "var(--pf-leading-tight)" },
				],
				"3xl": [
					"var(--pf-text-3xl)",
					{ lineHeight: "var(--pf-leading-tight)" },
				],
			},
			fontWeight: {
				normal: "var(--pf-font-normal)",
				medium: "var(--pf-font-medium)",
				semibold: "var(--pf-font-semibold)",
				bold: "var(--pf-font-bold)",
			},
			lineHeight: {
				tight: "var(--pf-leading-tight)",
				normal: "var(--pf-leading-normal)",
				relaxed: "var(--pf-leading-relaxed)",
			},
			animation: {
				flip: "flip var(--pf-transition-flip) var(--pf-animation-easing)",
				"fade-in":
					"fadeIn var(--pf-transition-base) var(--pf-animation-easing)",
				"fade-out":
					"fadeOut var(--pf-transition-base) var(--pf-animation-easing)",
				"slide-up":
					"slideUp var(--pf-transition-slow) var(--pf-animation-easing)",
				"slide-down":
					"slideDown var(--pf-transition-slow) var(--pf-animation-easing)",
				"scale-in":
					"scaleIn var(--pf-transition-fast) var(--pf-animation-easing)",
				"scale-out":
					"scaleOut var(--pf-transition-fast) var(--pf-animation-easing)",
				spin: "spin 1s linear infinite",
				pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
				bounce: "bounce 1s infinite",
			},
			keyframes: {
				flip: {
					"0%": { transform: "rotateY(0deg)" },
					"100%": { transform: "rotateY(180deg)" },
				},
				fadeIn: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
				fadeOut: {
					"0%": { opacity: "1" },
					"100%": { opacity: "0" },
				},
				slideUp: {
					"0%": { transform: "translateY(10px)", opacity: "0" },
					"100%": { transform: "translateY(0)", opacity: "1" },
				},
				slideDown: {
					"0%": { transform: "translateY(-10px)", opacity: "0" },
					"100%": { transform: "translateY(0)", opacity: "1" },
				},
				scaleIn: {
					"0%": { transform: "scale(0.95)", opacity: "0" },
					"100%": { transform: "scale(1)", opacity: "1" },
				},
				scaleOut: {
					"0%": { transform: "scale(1)", opacity: "1" },
					"100%": { transform: "scale(0.95)", opacity: "0" },
				},
			},
		},
	},
	plugins: [],
} satisfies Config;

export default config;
