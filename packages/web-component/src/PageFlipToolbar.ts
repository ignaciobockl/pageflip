/**
 * PageFlipToolbar Custom Element
 *
 * Toolbar component for PageFlipBook with navigation controls.
 * @packageDocumentation
 */

const PAGE_FLIP_TOOLBAR_TAG = "page-flip-toolbar";

type ToolbarPosition = "top" | "bottom";

type PageFlipBookElement = HTMLElement & {
	pageCount?: number;
	currentPageIndex?: number;
	turnToPage?: (pageIndex: number) => Promise<void> | void;
	flipPrev?: () => Promise<void> | void;
	flipNext?: () => Promise<void> | void;
};

type FlipEventDetail = {
	pageIndex?: number;
	currentPageIndex?: number;
	pageCount?: number;
};

/**
 * PageFlipToolbar - Toolbar with navigation buttons and page indicator
 *
 * @example
 * ```html
 * <page-flip-toolbar position="bottom" slot="toolbar">
 *   <page-flip-prev-btn></page-flip-prev-btn>
 *   <page-flip-page-indicator></page-flip-page-indicator>
 *   <page-flip-next-btn></page-flip-next-btn>
 * </page-flip-toolbar>
 * ```
 */
export class PageFlipToolbar extends HTMLElement {
	#shadow: ShadowRoot;
	#book: PageFlipBookElement | null = null;
	#position: ToolbarPosition = "bottom";
	#firstBtn: HTMLButtonElement | null = null;
	#prevBtn: HTMLButtonElement | null = null;
	#nextBtn: HTMLButtonElement | null = null;
	#lastBtn: HTMLButtonElement | null = null;
	#dotsContainer: HTMLElement | null = null;
	#currentText: HTMLElement | null = null;
	#totalText: HTMLElement | null = null;
	#mutationObserver: MutationObserver | null = null;
	#pageCount = 0;
	#currentPage = 0;

	readonly #onFlip = (event: Event): void => {
		const customEvent = event as CustomEvent<FlipEventDetail>;
		const nextPage =
			customEvent.detail?.pageIndex ?? customEvent.detail?.currentPageIndex;

		if (typeof nextPage === "number") {
			this.#currentPage = nextPage;
		}

		const pageCount = this.#book?.pageCount;
		if (typeof pageCount === "number") {
			this.#pageCount = pageCount;
		}

		this.#updateButtons();
		this.#updateIndicator();
	};

	readonly #onUpdate = (event: Event): void => {
		const customEvent = event as CustomEvent<FlipEventDetail>;

		if (typeof customEvent.detail?.pageCount === "number") {
			this.#pageCount = customEvent.detail.pageCount;
		}

		const nextPage =
			customEvent.detail?.currentPageIndex ?? customEvent.detail?.pageIndex;

		if (typeof nextPage === "number") {
			this.#currentPage = nextPage;
		}

		this.#updateButtons();
		this.#updateIndicator();
	};

	readonly #onInit = (): void => {
		this.#syncStateFromBook();
		this.#updateButtons();
		this.#updateIndicator();
	};

	readonly #onFirstClick = (): void => {
		this.#book?.turnToPage?.(0);
	};

	readonly #onPrevClick = (): void => {
		this.#book?.flipPrev?.();
	};

	readonly #onNextClick = (): void => {
		this.#book?.flipNext?.();
	};

	readonly #onLastClick = (): void => {
		if (!this.#book || this.#pageCount <= 0) {
			return;
		}

		this.#book.turnToPage?.(this.#pageCount - 1);
	};

	static get observedAttributes(): string[] {
		return ["position", "slot"];
	}

	constructor() {
		super();
		this.#shadow = this.attachShadow({ mode: "open" });
		this.#render();
		this.#cacheElements();
	}

	connectedCallback(): void {
		this.#position = this.getAttribute("position") === "top" ? "top" : "bottom";
		this.#updatePosition();
		this.#connectToBook();
		this.#setupMutationObserver();
	}

	disconnectedCallback(): void {
		this.#mutationObserver?.disconnect();
		this.#mutationObserver = null;
		this.#detachFromBook();
	}

	attributeChangedCallback(
		name: string,
		oldValue: string | null,
		newValue: string | null,
	): void {
		if (oldValue === newValue) {
			return;
		}

		if (name === "position") {
			this.#position = newValue === "top" ? "top" : "bottom";
			this.#updatePosition();
		}
	}

	#render(): void {
		this.#shadow.innerHTML = `
			<style>
				:host {
					display: flex;
					align-items: center;
					justify-content: space-between;
					width: 100%;
					height: var(--pf-toolbar-height, 56px);
					padding: 0 var(--pf-space-md, 16px);
					background-color: var(--pf-toolbar-bg, #ffffff);
					border-top: 1px solid var(--pf-toolbar-border, #e2e8f0);
					box-sizing: border-box;
					font-family: var(--pf-font-sans, system-ui, sans-serif);
				}

				:host([data-position="top"]) {
					border-top: none;
					border-bottom: 1px solid var(--pf-toolbar-border, #e2e8f0);
				}

				.pf-toolbar__section {
					display: flex;
					align-items: center;
					gap: var(--pf-space-xs, 4px);
				}

				.pf-toolbar__center {
					flex: 1;
					display: flex;
					align-items: center;
					justify-content: center;
					gap: var(--pf-page-indicator-gap, 8px);
				}

				.pf-btn {
					display: inline-flex;
					align-items: center;
					justify-content: center;
					width: var(--pf-zoom-btn-size, 40px);
					height: var(--pf-zoom-btn-size, 40px);
					border: none;
					background: transparent;
					color: var(--pf-color-text, #1a1a2e);
					border-radius: var(--pf-radius-md, 8px);
					cursor: pointer;
					transition: opacity var(--pf-transition-fast, 150ms),
						background-color var(--pf-transition-fast, 150ms),
						transform var(--pf-transition-fast, 150ms);
				}

				@media (hover: hover) and (pointer: fine) {
					.pf-btn:hover:not(:disabled) {
						background-color: var(--pf-color-bg-hover, #e2e8f0);
					}

					.pf-page-indicator__dot:hover {
						transform: scale(1.08);
					}
				}

				.pf-btn:active:not(:disabled) {
					background-color: var(--pf-color-bg-active, #cbd5e1);
					transform: scale(0.97);
				}

				.pf-btn:disabled {
					opacity: 0.4;
					cursor: not-allowed;
				}

				.pf-btn:focus-visible {
					outline: none;
					box-shadow: var(--pf-focus-ring, 0 0 0 3px rgba(59, 130, 246, 0.4));
				}

				.pf-page-indicator {
					display: flex;
					align-items: center;
					gap: var(--pf-page-indicator-gap, 8px);
				}

				.pf-page-indicator__text {
					font-size: var(--pf-text-sm, 14px);
					color: var(--pf-color-text-muted, #6c757d);
					min-width: 4rem;
					text-align: center;
					font-variant-numeric: tabular-nums;
				}

				.pf-page-indicator__dots {
					display: flex;
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

				.pf-page-indicator__dot:active:not(:disabled) {
					transform: scale(0.97);
				}

				.pf-page-indicator__dot--active {
					background-color: var(--pf-page-indicator-active-color, #3b82f6);
				}

				.pf-page-indicator__ellipsis {
					font-size: var(--pf-text-xs, 12px);
					color: var(--pf-color-text-muted, #6c757d);
					padding: 0 var(--pf-space-xs, 4px);
				}

				@media (prefers-reduced-motion: reduce) {
					.pf-page-indicator__dot {
						transition: none;
					}
				}
			</style>

			<div class="pf-toolbar__section" part="start">
				<button
					type="button"
					part="first-btn"
					class="pf-btn"
					aria-label="First page"
					data-action="first"
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
						<polygon points="11 17 6 12 11 7" />
						<polygon points="18 17 13 12 18 7" />
					</svg>
				</button>
				<button
					type="button"
					part="prev-btn"
					class="pf-btn"
					aria-label="Previous page"
					data-action="prev"
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
						<polyline points="15 18 9 12 15 6" />
					</svg>
				</button>
			</div>

			<div class="pf-toolbar__center" part="center">
				<div class="pf-page-indicator" part="page-indicator">
					<span class="pf-page-indicator__text" part="page-text" aria-live="polite">
						<span data-current>1</span> / <span data-total>1</span>
					</span>
					<div class="pf-page-indicator__dots" part="dots" aria-label="Pages"></div>
				</div>
			</div>

			<div class="pf-toolbar__section" part="end">
				<button
					type="button"
					part="next-btn"
					class="pf-btn"
					aria-label="Next page"
					data-action="next"
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
						<polyline points="9 18 15 12 9 6" />
					</svg>
				</button>
				<button
					type="button"
					part="last-btn"
					class="pf-btn"
					aria-label="Last page"
					data-action="last"
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
						<polygon points="13 17 18 12 13 7" />
						<polygon points="6 17 11 12 6 7" />
					</svg>
				</button>
			</div>
		`;
	}

	#cacheElements(): void {
		this.#firstBtn = this.#shadow.querySelector('[data-action="first"]');
		this.#prevBtn = this.#shadow.querySelector('[data-action="prev"]');
		this.#nextBtn = this.#shadow.querySelector('[data-action="next"]');
		this.#lastBtn = this.#shadow.querySelector('[data-action="last"]');
		this.#dotsContainer = this.#shadow.querySelector(
			".pf-page-indicator__dots",
		);
		this.#currentText = this.#shadow.querySelector("[data-current]");
		this.#totalText = this.#shadow.querySelector("[data-total]");

		this.#firstBtn?.addEventListener("click", this.#onFirstClick);
		this.#prevBtn?.addEventListener("click", this.#onPrevClick);
		this.#nextBtn?.addEventListener("click", this.#onNextClick);
		this.#lastBtn?.addEventListener("click", this.#onLastClick);
	}

	#setupMutationObserver(): void {
		this.#mutationObserver?.disconnect();
		this.#mutationObserver = new MutationObserver(() => {
			const book = this.closest("page-flip-book") as PageFlipBookElement | null;

			if (book !== this.#book) {
				this.#connectToBook();
			}
		});

		this.#mutationObserver.observe(document, {
			childList: true,
			subtree: true,
		});
	}

	#connectToBook(): void {
		const nextBook = this.closest(
			"page-flip-book",
		) as PageFlipBookElement | null;

		if (nextBook === this.#book) {
			this.#syncStateFromBook();
			this.#updateButtons();
			this.#updateIndicator();
			return;
		}

		this.#detachFromBook();
		this.#book = nextBook;

		if (!this.#book) {
			this.#pageCount = 0;
			this.#currentPage = 0;
			this.#updateButtons();
			this.#updateIndicator();
			return;
		}

		this.#book.addEventListener("flip", this.#onFlip as EventListener);
		this.#book.addEventListener("update", this.#onUpdate as EventListener);
		this.#book.addEventListener("init", this.#onInit as EventListener);
		this.#syncStateFromBook();
		this.#updateButtons();
		this.#updateIndicator();
	}

	#detachFromBook(): void {
		if (!this.#book) {
			return;
		}

		this.#book.removeEventListener("flip", this.#onFlip as EventListener);
		this.#book.removeEventListener("update", this.#onUpdate as EventListener);
		this.#book.removeEventListener("init", this.#onInit as EventListener);
		this.#book = null;
	}

	#syncStateFromBook(): void {
		if (!this.#book) {
			return;
		}

		this.#pageCount = this.#book.pageCount ?? 0;
		this.#currentPage = this.#book.currentPageIndex ?? 0;
	}

	#updateButtons(): void {
		const hasPages = this.#pageCount > 0;
		const isFirst = !hasPages || this.#currentPage <= 0;
		const isLast = !hasPages || this.#currentPage >= this.#pageCount - 1;

		this.#firstBtn?.toggleAttribute("disabled", isFirst);
		this.#prevBtn?.toggleAttribute("disabled", isFirst);
		this.#nextBtn?.toggleAttribute("disabled", isLast);
		this.#lastBtn?.toggleAttribute("disabled", isLast);
	}

	#updateIndicator(): void {
		if (this.#currentText) {
			this.#currentText.textContent = String(
				this.#pageCount > 0 ? this.#currentPage + 1 : 0,
			);
		}

		if (this.#totalText) {
			this.#totalText.textContent = String(this.#pageCount);
		}

		if (!this.#dotsContainer) {
			return;
		}

		this.#dotsContainer.innerHTML = "";

		if (this.#pageCount <= 0) {
			return;
		}

		const maxDots = 10;
		const startIndex = Math.max(
			0,
			Math.min(
				this.#currentPage - Math.floor(maxDots / 2),
				this.#pageCount - maxDots,
			),
		);
		const endIndex = Math.min(startIndex + maxDots, this.#pageCount);

		if (startIndex > 0) {
			this.#createDot(0, this.#dotsContainer);

			if (startIndex > 1) {
				this.#appendEllipsis(this.#dotsContainer);
			}
		}

		for (let index = startIndex; index < endIndex; index += 1) {
			this.#createDot(index, this.#dotsContainer);
		}

		if (endIndex < this.#pageCount) {
			if (endIndex < this.#pageCount - 1) {
				this.#appendEllipsis(this.#dotsContainer);
			}

			this.#createDot(this.#pageCount - 1, this.#dotsContainer);
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
		const isActive = pageIndex === this.#currentPage;

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

	#updatePosition(): void {
		this.setAttribute("data-position", this.#position);
	}
}

if (!customElements.get(PAGE_FLIP_TOOLBAR_TAG)) {
	customElements.define(PAGE_FLIP_TOOLBAR_TAG, PageFlipToolbar);
}

declare global {
	interface HTMLElementTagNameMap {
		"page-flip-toolbar": PageFlipToolbar;
	}
}
