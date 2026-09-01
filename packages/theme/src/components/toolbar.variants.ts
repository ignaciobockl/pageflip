import { cva } from "class-variance-authority";

export const toolbarVariants = cva("pf-toolbar", {
	variants: {
		position: {
			top: "pf-toolbar--top",
			bottom: "pf-toolbar--bottom",
		},
	},
	defaultVariants: {
		position: "bottom",
	},
});

export const toolbarSectionVariants = cva("pf-toolbar__section", {
	variants: {
		align: {
			start: "pf-toolbar__start",
			center: "pf-toolbar__center",
			end: "pf-toolbar__end",
		},
	},
});

export const toolbarButtonVariants = cva("pf-btn pf-btn--icon pf-btn--ghost", {
	variants: {
		state: {
			active: "pf-btn--active",
			disabled: "pf-btn--disabled",
		},
	},
});

export const toolbarIndicatorDotVariants = cva("pf-page-indicator__dot", {
	variants: {
		state: {
			active: "pf-page-indicator__dot--active",
			muted: "pf-page-indicator__dot--muted",
		},
	},
});
