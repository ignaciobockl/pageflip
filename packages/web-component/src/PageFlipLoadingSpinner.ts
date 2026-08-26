/**
 * PageFlipLoadingSpinner Custom Element
 *
 * Animated loading spinner with size variants.
 * @packageDocumentation
 */

const PAGE_FLIP_LOADING_SPINNER_TAG = "page-flip-loading-spinner";

type SpinnerSize = "sm" | "md" | "lg";

const SPINNER_SIZE_MAP: Record<SpinnerSize, { size: string; border: string }> =
	{
		lg: { size: "32px", border: "4px" },
		md: { size: "24px", border: "3px" },
		sm: { size: "16px", border: "2px" },
	};

/**
 * PageFlipLoadingSpinner - Animated loading indicator
 *
 * @example
 * ```html
 * <page-flip-loading-spinner size="lg" color="var(--pf-color-primary)"></page-flip-loading-spinner>
 * ```
 */
export class PageFlipLoadingSpinner extends HTMLElement {
	#shadow: ShadowRoot;

	static get observedAttributes(): string[] {
		return ["size", "color"];
	}

	constructor() {
		super();
		this.#shadow = this.attachShadow({ mode: "open" });
		this.#render();
	}

	connectedCallback(): void {
		this.#updateSize(this.getAttribute("size"));
		this.#updateColor(this.getAttribute("color"));
	}

	attributeChangedCallback(
		name: string,
		oldValue: string | null,
		newValue: string | null,
	): void {
		if (oldValue === newValue) {
			return;
		}

		if (name === "size") {
			this.#updateSize(newValue);
			return;
		}

		if (name === "color") {
			this.#updateColor(newValue);
		}
	}

	#render(): void {
		this.#shadow.innerHTML = `
			<style>
				:host {
					display: inline-block;
					--pf-spinner-size: var(--pf-spinner-size, 24px);
					--pf-spinner-border-width: var(--pf-spinner-border-width, 3px);
					--pf-spinner-color: var(--pf-spinner-color, var(--pf-color-primary, #3b82f6));
					--pf-spinner-track-color: var(--pf-spinner-track-color, var(--pf-color-border, #e2e8f0));
				}

				.pf-loading-spinner {
					position: relative;
					width: var(--pf-spinner-size);
					height: var(--pf-spinner-size);
					border: var(--pf-spinner-border-width) solid var(--pf-spinner-track-color);
					border-top-color: var(--pf-spinner-color);
					border-radius: 50%;
					animation: pf-spin 1s linear infinite;
					box-sizing: border-box;
				}

				.pf-loading-spinner__label {
					position: absolute;
					width: 1px;
					height: 1px;
					padding: 0;
					margin: -1px;
					overflow: hidden;
					clip: rect(0, 0, 0, 0);
					white-space: nowrap;
					border: 0;
				}

				@keyframes pf-spin {
					from {
						transform: rotate(0deg);
					}

					to {
						transform: rotate(360deg);
					}
				}

				@media (prefers-reduced-motion: reduce) {
					.pf-loading-spinner {
						animation: none;
						border-top-color: var(--pf-spinner-track-color);
					}
				}
			</style>

			<div class="pf-loading-spinner" part="spinner" role="status" aria-label="Loading" aria-busy="true">
				<span class="pf-loading-spinner__label">Loading...</span>
			</div>
		`;
	}

	#updateSize(size: string | null): void {
		const normalizedSize: SpinnerSize =
			size === "sm" || size === "lg" ? size : "md";
		const spinnerSize = SPINNER_SIZE_MAP[normalizedSize];

		this.style.setProperty("--pf-spinner-size", spinnerSize.size);
		this.style.setProperty("--pf-spinner-border-width", spinnerSize.border);
	}

	#updateColor(color: string | null): void {
		if (color === null || color.length === 0) {
			this.style.removeProperty("--pf-spinner-color");
			return;
		}

		this.style.setProperty("--pf-spinner-color", color);
	}
}

if (!customElements.get(PAGE_FLIP_LOADING_SPINNER_TAG)) {
	customElements.define(PAGE_FLIP_LOADING_SPINNER_TAG, PageFlipLoadingSpinner);
}

declare global {
	interface HTMLElementTagNameMap {
		"page-flip-loading-spinner": PageFlipLoadingSpinner;
	}
}
