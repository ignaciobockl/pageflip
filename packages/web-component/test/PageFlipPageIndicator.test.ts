import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

const { PageFlipPageIndicator } = await import("../src/PageFlipPageIndicator");

type MockBookElement = HTMLElement & {
	pageCount: number;
	currentPageIndex: number;
	turnToPage: ReturnType<typeof mock>;
};

describe("PageFlipPageIndicator", () => {
	let host: HTMLDivElement;

	beforeEach(() => {
		host = document.createElement("div");
		document.body.append(host);
	});

	afterEach(() => {
		host.remove();
	});

	test("registers and renders dots with active state", () => {
		expect(customElements.get("page-flip-page-indicator")).toBe(
			PageFlipPageIndicator,
		);

		const indicator = document.createElement(
			"page-flip-page-indicator",
		) as PageFlipPageIndicator;
		indicator.setAttribute("current", "2");
		indicator.setAttribute("total", "5");
		host.append(indicator);

		expect(
			indicator.shadowRoot?.querySelectorAll(".pf-page-indicator__dot"),
		).toHaveLength(5);
		expect(
			indicator.shadowRoot
				?.querySelector('[aria-current="page"]')
				?.getAttribute("aria-label"),
		).toBe("Page 3");
		expect(
			indicator.shadowRoot?.querySelector(".pf-page-indicator__status")
				?.textContent,
		).toBe("Page 3 of 5");
	});

	test("supports select mode and navigates on change", () => {
		const book = document.createElement("page-flip-book") as MockBookElement;
		book.pageCount = 4;
		book.currentPageIndex = 1;
		book.turnToPage = mock(() => {});

		const indicator = document.createElement(
			"page-flip-page-indicator",
		) as PageFlipPageIndicator;
		indicator.setAttribute("show-numbers", "true");
		book.append(indicator);
		host.append(book);

		const select = indicator.shadowRoot?.querySelector(
			".pf-page-indicator__select",
		) as HTMLSelectElement;

		expect(select.style.display).toBe("block");
		expect(select.options).toHaveLength(4);
		expect(select.value).toBe("1");

		select.value = "3";
		select.dispatchEvent(new Event("change", { bubbles: true }));

		expect(book.turnToPage).toHaveBeenCalledWith(3);
	});

	test("renders navigation window with ellipsis and dot selection", () => {
		const book = document.createElement("page-flip-book") as MockBookElement;
		book.pageCount = 20;
		book.currentPageIndex = 8;
		book.turnToPage = mock(() => {});

		const indicator = document.createElement(
			"page-flip-page-indicator",
		) as PageFlipPageIndicator;
		indicator.setAttribute("max-dots", "5");
		book.append(indicator);
		host.append(book);

		const dots = Array.from(
			indicator.shadowRoot?.querySelectorAll(".pf-page-indicator__dot") ?? [],
		) as HTMLButtonElement[];

		expect(
			indicator.shadowRoot?.querySelectorAll(".pf-page-indicator__ellipsis"),
		).toHaveLength(2);
		expect(dots[0]?.getAttribute("aria-label")).toBe("Page 1");
		expect(dots.at(-1)?.getAttribute("aria-label")).toBe("Page 20");

		dots[2]?.click();

		expect(book.turnToPage).toHaveBeenCalledWith(6);
	});

	test("stays in sync with book flip and update events", () => {
		const book = document.createElement("page-flip-book") as MockBookElement;
		book.pageCount = 3;
		book.currentPageIndex = 0;
		book.turnToPage = mock(() => {});

		const indicator = document.createElement(
			"page-flip-page-indicator",
		) as PageFlipPageIndicator;
		book.append(indicator);
		host.append(book);

		book.pageCount = 6;
		book.currentPageIndex = 4;
		book.dispatchEvent(
			new CustomEvent("flip", {
				detail: { pageIndex: 4 },
			}),
		);

		expect(
			indicator.shadowRoot
				?.querySelector('[aria-current="page"]')
				?.getAttribute("aria-label"),
		).toBe("Page 5");

		book.dispatchEvent(
			new CustomEvent("update", {
				detail: { currentPageIndex: 2, pageCount: 7 },
			}),
		);

		expect(
			indicator.shadowRoot?.querySelector(".pf-page-indicator__status")
				?.textContent,
		).toBe("Page 3 of 7");
	});
});
