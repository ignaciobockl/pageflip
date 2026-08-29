/**
 * PageFlipPageIndicator Custom Element
 *
 * Standalone page indicator with dots or select dropdown.
 * @packageDocumentation
 */

const PAGE_FLIP_PAGE_INDICATOR_TAG = "page-flip-page-indicator";

type PageFlipBookElement = HTMLElement & {
	pageCount?: number;
	currentPageIndex?: number;
	turnToPage?: (pageIndex: number) => Promise<void> | void;
};

type FlipEventDetail = {
	pageIndex?: number;
	currentPageIndex?: number;
	pageCount?: number;
};

/**
 * PageFlipPageIndicator - Standalone page indicator
 *
 * @example
 * ```html
 * <page-flip-page-indicator
 *   current="0"
 *   total="10"
 *   max-dots="10"
 *   show-numbers="false"
 * ></page-flip-page-indicator>
 * ```
 */
export class PageFlipPageIndicator extends HTMLElement {
	#shadow: ShadowRoot;
	#book: PageFlipBookElement | null = null;
	#current = 0;
	#total = 1;
	#maxDots = 10;
	#showNumbers = false;
	#dotsContainer: HTMLElement | null = null;
	#select: HTMLSelectElement | null = null;

	readonly #onFlip = (event: Event): void => {
		const customEvent = event as CustomEvent<FlipEventDetail>;
		const nextPage =
			customEvent.detail?.pageIndex ?? customEvent.detail?.currentPageIndex;

		if (typeof nextPage === "number") {
			this.#current = nextPage;
		}

		const pageCount = this.#book?.pageCount;
		if (typeof pageCount === "number") {
			this.#total = pageCount;
		}

		this.#renderIndicator();
	};

	readonly #onUpdate = (event: Event): void => {
		const customEvent = event as CustomEvent<FlipEventDetail>;

		const nextPage =
			customEvent.detail?.currentPageIndex ?? customEvent.detail?.pageIndex;

		if (typeof nextPage === "number") {
			this.#current = nextPage;
		}

		if (typeof customEvent.detail?.pageCount === "number") {
			this.#total = customEvent.detail.pageCount;
		}

		this.#renderIndicator();
	};

	readonly #onInit = (): void => {
		this.#syncFromBook();
		this.#renderIndicator();
	};

	readonly #onSelectChange = (): void => {
		if (!this.#book || !this.#select) {
			return;
		}

		const newIndex = Number.parseInt(this.#select.value, 10);
		if (!Number.isNaN(newIndex)) {
			this.#book.turnToPage?.(newIndex);
		}
	};

	static get observedAttributes(): string[] {
		return ["current", "total", "max-dots", "show-numbers"];
	}

	constructor() {
		super();
		this.#shadow = this.attachShadow({ mode: "open" });
		this.#render();
		this.#cacheElements();
		this.#renderIndicator();
	}

	connectedCallback(): void {
		this.#book = this.closest("page-flip-book") as PageFlipBookElement | null;
		if (!this.#book) {
			this.#renderIndicator();
			return;
		}

		this.#syncFromBook();
		this.#book.addEventListener("flip", this.#onFlip as EventListener);
		this.#book.addEventListener("update", this.#onUpdate as EventListener);
		this.#book.addEventListener("init", this.#onInit as EventListener);
		this.#renderIndicator();
	}

	disconnectedCallback(): void {
		if (!this.#book) {
			return;
		}

		this.#book.removeEventListener("flip", this.#onFlip as EventListener);
		this.#book.removeEventListener("update", this.#onUpdate as EventListener);
		this.#book.removeEventListener("init", this.#onInit as EventListener);
		this.#book = null;
	}

	attributeChangedCallback(
		name: string,
		oldValue: string | null,
		newValue: string | null,
	): void {
		if (oldValue === newValue || newValue === null) {
			return;
		}

		switch (name) {
			case "current":
				this.#current = Math.max(0, Number.parseInt(newValue, 10) || 0);
				break;
			case "total":
				this.#total = Math.max(1, Number.parseInt(newValue, 10) || 1);
				break;
			case "max-dots":
				this.#maxDots = Math.max(1, Number.parseInt(newValue, 10) || 10);
				break;
			case "show-numbers":
				this.#showNumbers = newValue !== "false";
				break;
		}

		if (this.isConnected) {
			this.#renderIndicator();
		}
	}

	#render(): void {
		this.#shadow.innerHTML = `
			<style>
				:host {
					display: inline-flex;
					align-items: center;
					gap: var(--pf-page-indicator-gap, 8px);
					font-family: var(--pf-font-sans, system-ui, sans-serif);
				}

				.pf-page-indicator__select {
					padding: var(--pf-space-xs, 4px) var(--pf-space-sm, 8px);
					font-size: var(--pf-text-sm, 14px);
					border: 1px solid var(--pf-color-border, #e2e8f0);
					border-radius: var(--pf-radius-md, 8px);
					background-color: var(--pf-color-bg, #ffffff);
					color: var(--pf-color-text, #1a1a2e);
					cursor: pointer;
					font-family: inherit;
				}

				.pf-page-indicator__select:focus-visible {
					outline: none;
					box-shadow: var(--pf-focus-ring, 0 0 0 3px rgba(59, 130, 246, 0.4));
				}

				.pf-page-indicator__dots {
					display: flex;
					align-items: center;
					gap: var(--pf-page-indicator-gap, 8px);
				}

				.pf-page-indicator__dot {
					width: var(--pf-page-indicator-hit-area, 24px);
					height: var(--pf-page-indicator-hit-area, 24px);
					padding: 8px;
					box-sizing: border-box;
					background-clip: content-box;
					border-radius: 50%;
					border: none;
					background-color: var(--pf-page-indicator-color, #6c757d);
					cursor: pointer;
					transition: background-color var(--pf-transition-fast, 150ms),
						transform var(--pf-transition-fast, 150ms);
				}

				.pf-page-indicator__dot:hover {
					transform: scale(1.2);
				}

				.pf-page-indicator__dot--active {
					background-color: var(--pf-page-indicator-active-color, #3b82f6);
				}

				.pf-page-indicator__ellipsis {
					font-size: var(--pf-text-xs, 12px);
					color: var(--pf-color-text-muted, #94a3b8);
					padding: 0 var(--pf-space-xs, 4px);
					line-height: 1;
				}

				.pf-page-indicator__status {
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

				@media (prefers-reduced-motion: reduce) {
					.pf-page-indicator__dot {
						transition: none;
					}
				}
			</style>

			<div class="pf-page-indicator" part="indicator" role="group" aria-label="Page indicator">
				<div class="pf-page-indicator__dots" part="dots" style="display: none;"></div>
				<select class="pf-page-indicator__select" part="select" style="display: none;" aria-label="Select page"></select>
				<span class="pf-page-indicator__status" aria-live="polite"></span>
			</div>
		`;
	}

	#cacheElements(): void {
		this.#dotsContainer = this.#shadow.querySelector(
			".pf-page-indicator__dots",
		);
		this.#select = this.#shadow.querySelector(".pf-page-indicator__select");
	}

	#syncFromBook(): void {
		if (!this.#book) {
			return;
		}

		this.#current = this.#book.currentPageIndex ?? 0;
		this.#total = Math.max(1, this.#book.pageCount ?? 1);
	}

	#renderIndicator(): void {
		if (!this.#dotsContainer || !this.#select) {
			return;
		}

		const status = this.#shadow.querySelector(".pf-page-indicator__status");
		if (status) {
			status.textContent = `Page ${Math.min(this.#current + 1, this.#total)} of ${this.#total}`;
		}

		if (this.#showNumbers) {
			this.#dotsContainer.style.display = "none";
			this.#select.style.display = "block";
			this.#select.innerHTML = "";

			for (let index = 0; index < this.#total; index += 1) {
				const option = document.createElement("option");
				option.value = String(index);
				option.textContent = `Page ${index + 1}`;
				option.selected = index === this.#current;
				this.#select.appendChild(option);
			}

			this.#select.removeEventListener("change", this.#onSelectChange);
			this.#select.addEventListener("change", this.#onSelectChange);
			return;
		}

		this.#select.style.display = "none";
		this.#dotsContainer.style.display = "flex";
		this.#dotsContainer.innerHTML = "";

		const startIndex = Math.max(
			0,
			Math.min(
				this.#current - Math.floor(this.#maxDots / 2),
				this.#total - this.#maxDots,
			),
		);
		const endIndex = Math.min(startIndex + this.#maxDots, this.#total);

		if (startIndex > 0) {
			this.#createDot(0, this.#dotsContainer);

			if (startIndex > 1) {
				this.#appendEllipsis(this.#dotsContainer);
			}
		}

		for (let index = startIndex; index < endIndex; index += 1) {
			this.#createDot(index, this.#dotsContainer);
		}

		if (endIndex < this.#total) {
			if (endIndex < this.#total - 1) {
				this.#appendEllipsis(this.#dotsContainer);
			}

			this.#createDot(this.#total - 1, this.#dotsContainer);
		}
	}

	#appendEllipsis(container: HTMLElement): void {
		const ellipsis = document.createElement("span");
		ellipsis.className = "pf-page-indicator__ellipsis";
		ellipsis.textContent = "…";
		ellipsis.setAttribute("aria-hidden", "true");
		container.appendChild(ellipsis);
	}

	#createDot(pageIndex: number, container: HTMLElement): void {
		const dot = document.createElement("button");
		const isActive = pageIndex === this.#current;

		dot.type = "button";
		dot.className = `pf-page-indicator__dot${isActive ? " pf-page-indicator__dot--active" : ""}`;
		dot.setAttribute("aria-label", `Page ${pageIndex + 1}`);

		if (isActive) {
			dot.setAttribute("aria-current", "page");
		}

		dot.addEventListener("click", () => {
			this.#book?.turnToPage?.(pageIndex);
		});

		container.appendChild(dot);
	}
}

if (!customElements.get(PAGE_FLIP_PAGE_INDICATOR_TAG)) {
	customElements.define(PAGE_FLIP_PAGE_INDICATOR_TAG, PageFlipPageIndicator);
}

declare global {
	interface HTMLElementTagNameMap {
		"page-flip-page-indicator": PageFlipPageIndicator;
	}
}
