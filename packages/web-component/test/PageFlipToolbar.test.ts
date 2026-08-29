import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

const { PageFlipToolbar } = await import("../src/PageFlipToolbar");

type MockBookElement = HTMLElement & {
	pageCount: number;
	currentPageIndex: number;
	turnToPage: ReturnType<typeof mock>;
	flipPrev: ReturnType<typeof mock>;
	flipNext: ReturnType<typeof mock>;
};

describe("PageFlipToolbar", () => {
	let host: HTMLDivElement;
	let book: MockBookElement;
	let toolbar: PageFlipToolbar;

	beforeEach(() => {
		host = document.createElement("div");
		document.body.append(host);
		book = document.createElement("page-flip-book") as MockBookElement;
		book.pageCount = 5;
		book.currentPageIndex = 0;
		book.turnToPage = mock(() => {});
		book.flipPrev = mock(() => {});
		book.flipNext = mock(() => {});
		toolbar = document.createElement("page-flip-toolbar") as PageFlipToolbar;
		book.append(toolbar);
		host.append(book);
	});

	afterEach(() => {
		host.remove();
	});

	test("registers the custom element and applies position", () => {
		expect(customElements.get("page-flip-toolbar")).toBe(PageFlipToolbar);
		expect(toolbar.getAttribute("data-position")).toBe("bottom");

		toolbar.setAttribute("position", "top");

		expect(toolbar.getAttribute("data-position")).toBe("top");
	});

	test("syncs buttons and indicator from book events", () => {
		const shadow = toolbar.shadowRoot;
		const first = shadow?.querySelector(
			'[data-action="first"]',
		) as HTMLButtonElement;
		const prev = shadow?.querySelector(
			'[data-action="prev"]',
		) as HTMLButtonElement;
		const next = shadow?.querySelector(
			'[data-action="next"]',
		) as HTMLButtonElement;
		const last = shadow?.querySelector(
			'[data-action="last"]',
		) as HTMLButtonElement;

		expect(first.disabled).toBe(true);
		expect(prev.disabled).toBe(true);
		expect(next.disabled).toBe(false);
		expect(last.disabled).toBe(false);

		book.pageCount = 12;
		book.currentPageIndex = 6;
		book.dispatchEvent(
			new CustomEvent("update", {
				detail: { currentPageIndex: 6, pageCount: 12 },
			}),
		);

		expect(shadow?.querySelector("[data-current]")?.textContent).toBe("7");
		expect(shadow?.querySelector("[data-total]")?.textContent).toBe("12");
		expect(
			Array.from(
				shadow?.querySelectorAll(".pf-page-indicator__ellipsis") ?? [],
			),
		).toHaveLength(2);
		expect(first.disabled).toBe(false);
		expect(prev.disabled).toBe(false);
		expect(next.disabled).toBe(false);
		expect(last.disabled).toBe(false);
	});

	test("handles navigation button and dot clicks", () => {
		const shadow = toolbar.shadowRoot;
		const first = shadow?.querySelector(
			'[data-action="first"]',
		) as HTMLButtonElement;
		const prev = shadow?.querySelector(
			'[data-action="prev"]',
		) as HTMLButtonElement;
		const next = shadow?.querySelector(
			'[data-action="next"]',
		) as HTMLButtonElement;
		const last = shadow?.querySelector(
			'[data-action="last"]',
		) as HTMLButtonElement;

		book.pageCount = 4;
		book.currentPageIndex = 1;
		book.dispatchEvent(
			new CustomEvent("flip", {
				detail: { pageIndex: 1 },
			}),
		);

		first.click();
		prev.click();
		next.click();
		last.click();

		const dot = Array.from(
			shadow?.querySelectorAll(".pf-page-indicator__dot") ?? [],
		)[2] as HTMLButtonElement | undefined;
		dot?.click();

		expect(book.turnToPage.mock.calls.map(([pageIndex]) => pageIndex)).toEqual([
			0, 3, 2,
		]);
		expect(book.flipPrev).toHaveBeenCalledTimes(1);
		expect(book.flipNext).toHaveBeenCalledTimes(1);
		expect(
			shadow
				?.querySelector('[aria-current="page"]')
				?.getAttribute("aria-label"),
		).toBe("Page 2");
	});
});
