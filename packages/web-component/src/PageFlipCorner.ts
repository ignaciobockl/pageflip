/**
 * PageFlipCorner Custom Element
 *
 * Draggable corner indicator for page flip interaction.
 * @packageDocumentation
 */

type PageFlipCornerPosition =
	| "top-left"
	| "top-right"
	| "bottom-left"
	| "bottom-right";

type PageFlipCornerSide = "top" | "bottom";

type DragPoint = {
	x: number;
	y: number;
};

type PageFlipBookElement = HTMLElement & {
	flipNext?: () => Promise<void> | void;
	flipPrev?: () => Promise<void> | void;
	dispatchEvent(event: Event): boolean;
};

/**
 * PageFlipCorner - Draggable corner for page flip
 *
 * @example
 * ```html
 * <page-flip-corner corner="top-right" slot="page-corner-top-right"></page-flip-corner>
 * ```
 */
export class PageFlipCorner extends HTMLElement {
	#shadow: ShadowRoot;
	#book: PageFlipBookElement | null = null;
	#corner: PageFlipCornerPosition = "top-right";
	#isDragging = false;
	#flipCorner: PageFlipCornerSide = "top";

	readonly #onDocumentMouseMove = (event: MouseEvent): void => {
		if (!this.#isDragging) {
			return;
		}

		const rect = this.#visualElement?.getBoundingClientRect();
		if (!rect) {
			return;
		}

		this.#updateDrag({
			x: event.clientX - rect.left,
			y: event.clientY - rect.top,
		});
	};

	readonly #onDocumentMouseUp = (): void => {
		this.#endDrag();
		this.#removeDocumentListeners();
	};

	readonly #onDocumentTouchMove = (event: TouchEvent): void => {
		if (!this.#isDragging) {
			return;
		}

		event.preventDefault();

		const touch = event.touches[0];
		const rect = this.#visualElement?.getBoundingClientRect();

		if (!touch || !rect) {
			return;
		}

		this.#updateDrag({
			x: touch.clientX - rect.left,
			y: touch.clientY - rect.top,
		});
	};

	readonly #onDocumentTouchEnd = (): void => {
		this.#endDrag();
		this.#removeDocumentListeners();
	};

	static get observedAttributes(): string[] {
		return ["corner", "visible"];
	}

	constructor() {
		super();
		this.#shadow = this.attachShadow({ mode: "open" });
		this.#render();
	}

	connectedCallback(): void {
		this.#book = this.closest("page-flip-book") as PageFlipBookElement | null;
		this.#corner = this.#parseCornerAttribute(this.getAttribute("corner"));
		this.#flipCorner = this.#corner.startsWith("top") ? "top" : "bottom";
		this.#updatePosition();
		this.#updateArrow();
		this.#updateVisibility();

		if (this.#book) {
			this.#setupDrag();
		}
	}

	disconnectedCallback(): void {
		this.#cleanupDrag();
		this.#removeDocumentListeners();
		this.#book = null;
	}

	attributeChangedCallback(
		name: string,
		oldValue: string | null,
		newValue: string | null,
	): void {
		if (oldValue === newValue) {
			return;
		}

		if (name === "corner") {
			this.#corner = this.#parseCornerAttribute(newValue);
			this.#flipCorner = this.#corner.startsWith("top") ? "top" : "bottom";
			this.#updatePosition();
			this.#updateArrow();
		}

		if (name === "visible") {
			this.#updateVisibility();
		}
	}

	#render(): void {
		this.#shadow.innerHTML = `
			<style>
				:host {
					position: absolute;
					width: var(--pf-page-corner-size, 48px);
					height: var(--pf-page-corner-size, 48px);
					cursor: grab;
					z-index: 10;
					touch-action: none;
					transition: transform var(--pf-transition-fast, 150ms),
						box-shadow var(--pf-transition-fast, 150ms);
				}

				:host([hidden]) {
					display: none;
				}

				:host([data-dragging="true"]) {
					cursor: grabbing;
					transform: scale(1.1);
				}

				.pf-corner__visual {
					width: 100%;
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
					background-color: var(--pf-page-corner-bg, #ffffff);
					border: 1px solid var(--pf-page-corner-border, #e2e8f0);
					border-radius: var(--pf-corner-radius);
					box-shadow: var(--pf-page-corner-shadow, 0 4px 12px rgba(0, 0, 0, 0.15));
					transition: transform var(--pf-transition-fast, 150ms),
						box-shadow var(--pf-transition-fast, 150ms);
					box-sizing: border-box;
				}

				.pf-corner__visual svg {
					width: 24px;
					height: 24px;
					fill: none;
					stroke: var(--pf-page-corner-color, #3b82f6);
					stroke-width: 2.5;
					transform: var(--pf-corner-arrow-transform);
				}

				@media (prefers-reduced-motion: reduce) {
					:host,
					.pf-corner__visual,
					.pf-corner__visual svg {
						transition: none;
					}
				}
			</style>

			<div
				class="pf-corner__visual"
				part="corner"
				role="button"
				tabindex="0"
				aria-label="Drag to turn page"
				aria-grabbed="false"
			>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
				</svg>
			</div>
		`;
	}

	#setupDrag(): void {
		this.#cleanupDrag();
		this.#visualElement?.addEventListener("mousedown", this.#onMouseDown);
		this.#visualElement?.addEventListener("touchstart", this.#onTouchStart, {
			passive: false,
		});
		this.#visualElement?.addEventListener("keydown", this.#onKeyDown);
	}

	#cleanupDrag(): void {
		this.#visualElement?.removeEventListener("mousedown", this.#onMouseDown);
		this.#visualElement?.removeEventListener("touchstart", this.#onTouchStart);
		this.#visualElement?.removeEventListener("keydown", this.#onKeyDown);
	}

	#removeDocumentListeners(): void {
		document.removeEventListener("mousemove", this.#onDocumentMouseMove);
		document.removeEventListener("mouseup", this.#onDocumentMouseUp);
		document.removeEventListener("touchmove", this.#onDocumentTouchMove);
		document.removeEventListener("touchend", this.#onDocumentTouchEnd);
		document.removeEventListener("touchcancel", this.#onDocumentTouchEnd);
	}

	#onMouseDown = (event: MouseEvent): void => {
		if (!this.#book) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		const rect = this.#visualElement?.getBoundingClientRect();
		if (!rect) {
			return;
		}

		this.#startDrag({
			x: event.clientX - rect.left,
			y: event.clientY - rect.top,
		});

		document.addEventListener("mousemove", this.#onDocumentMouseMove);
		document.addEventListener("mouseup", this.#onDocumentMouseUp);
	};

	#onTouchStart = (event: TouchEvent): void => {
		if (!this.#book) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		const touch = event.touches[0];
		const rect = this.#visualElement?.getBoundingClientRect();

		if (!touch || !rect) {
			return;
		}

		this.#startDrag({
			x: touch.clientX - rect.left,
			y: touch.clientY - rect.top,
		});

		document.addEventListener("touchmove", this.#onDocumentTouchMove, {
			passive: false,
		});
		document.addEventListener("touchend", this.#onDocumentTouchEnd);
		document.addEventListener("touchcancel", this.#onDocumentTouchEnd);
	};

	#onKeyDown = (event: KeyboardEvent): void => {
		if (event.key !== "Enter" && event.key !== " ") {
			return;
		}

		event.preventDefault();

		if (!this.#book) {
			return;
		}

		if (this.#corner.endsWith("left")) {
			void this.#book.flipPrev?.();
			return;
		}

		void this.#book.flipNext?.();
	};

	#startDrag(point: DragPoint): void {
		if (!this.#book) {
			return;
		}

		this.#isDragging = true;
		this.setAttribute("data-dragging", "true");
		this.#visualElement?.setAttribute("aria-grabbed", "true");

		this.#book.dispatchEvent(
			new CustomEvent("dragStart", {
				detail: { corner: this.#flipCorner, point },
				bubbles: true,
				composed: true,
			}),
		);
	}

	#updateDrag(point: DragPoint): void {
		if (!this.#isDragging || !this.#book) {
			return;
		}

		this.#book.dispatchEvent(
			new CustomEvent("dragMove", {
				detail: { corner: this.#flipCorner, point },
				bubbles: true,
				composed: true,
			}),
		);
	}

	#endDrag(): void {
		if (!this.#isDragging) {
			return;
		}

		this.#isDragging = false;
		this.removeAttribute("data-dragging");
		this.#visualElement?.setAttribute("aria-grabbed", "false");

		if (!this.#book) {
			return;
		}

		this.#book.dispatchEvent(
			new CustomEvent("dragEnd", {
				detail: { corner: this.#flipCorner },
				bubbles: true,
				composed: true,
			}),
		);
	}

	#updatePosition(): void {
		this.style.top = "";
		this.style.right = "";
		this.style.bottom = "";
		this.style.left = "";

		this.style[this.#corner.startsWith("top") ? "top" : "bottom"] = "0";
		this.style[this.#corner.endsWith("left") ? "left" : "right"] = "0";
	}

	#updateArrow(): void {
		if (!this.#visualElement) {
			return;
		}

		let radius = "";
		let transform = "";

		if (this.#corner === "top-left") {
			radius =
				"var(--pf-radius-full, 9999px) 0 0 var(--pf-radius-full, 9999px)";
			transform = "none";
		} else if (this.#corner === "top-right") {
			radius =
				"0 var(--pf-radius-full, 9999px) var(--pf-radius-full, 9999px) 0";
			transform = "none";
		} else if (this.#corner === "bottom-left") {
			radius =
				"0 var(--pf-radius-full, 9999px) var(--pf-radius-full, 9999px) 0";
			transform = "rotate(180deg)";
		} else {
			radius =
				"var(--pf-radius-full, 9999px) 0 0 var(--pf-radius-full, 9999px)";
			transform = "rotate(180deg)";
		}

		this.#visualElement.style.setProperty("--pf-corner-radius", radius);
		this.#visualElement.style.setProperty(
			"--pf-corner-arrow-transform",
			transform,
		);
	}

	#updateVisibility(): void {
		const visibleAttribute = this.getAttribute("visible");
		const isVisible = visibleAttribute === null || visibleAttribute !== "false";
		this.toggleAttribute("hidden", !isVisible);
	}

	#parseCornerAttribute(value: string | null): PageFlipCornerPosition {
		switch (value) {
			case "top-left":
			case "top-right":
			case "bottom-left":
			case "bottom-right":
				return value;
			default:
				return "top-right";
		}
	}

	get #visualElement(): HTMLElement | null {
		return this.#shadow.querySelector(".pf-corner__visual");
	}
}

if (!customElements.get("page-flip-corner")) {
	customElements.define("page-flip-corner", PageFlipCorner);
}

declare global {
	interface HTMLElementTagNameMap {
		"page-flip-corner": PageFlipCorner;
	}
}
