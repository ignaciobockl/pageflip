import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
	type Root,
	createRoot,
} from "../../react/node_modules/react-dom/client.js";
import { act } from "../../react/node_modules/react-dom/test-utils.js";
import { createElement } from "../../react/node_modules/react/index.js";

mock.module("react", () => import("../../react/node_modules/react/index.js"));
mock.module(
	"react/jsx-runtime",
	() => import("../../react/node_modules/react/jsx-runtime.js"),
);

const { PageIndicator } = await import("../src/components/PageIndicator");

describe("PageIndicator", () => {
	let container: HTMLDivElement;
	let root: Root | null;

	beforeEach(() => {
		root = null;
		container = document.createElement("div");
		document.body.append(container);
		root = createRoot(container);
	});

	afterEach(() => {
		root?.unmount();
		container.remove();
	});

	test("renders dots and marks the active page", async () => {
		const onPageClick = mock(() => {});

		await act(async () => {
			root?.render(
				createElement(PageIndicator, {
					current: 2,
					total: 5,
					onPageClick,
				}),
			);
		});

		expect(container.querySelectorAll("button")).toHaveLength(5);
		expect(
			container
				.querySelector('[data-testid="pageflip-page-indicator-2"]')
				?.getAttribute("aria-current"),
		).toBe("page");
	});

	test("renders first and last shortcuts with ellipsis for large page sets", async () => {
		const onPageClick = mock(() => {});

		await act(async () => {
			root?.render(
				createElement(PageIndicator, {
					current: 8,
					total: 20,
					maxDots: 5,
					onPageClick,
				}),
			);
		});

		expect(container.textContent).toContain("…");
		expect(
			container.querySelector('[data-testid="pageflip-page-indicator-first"]'),
		).not.toBeNull();
		expect(
			container.querySelector('[data-testid="pageflip-page-indicator-last"]'),
		).not.toBeNull();
	});

	test("navigates when a dot is clicked", async () => {
		const onPageClick = mock(() => {});

		await act(async () => {
			root?.render(
				createElement(PageIndicator, {
					current: 1,
					total: 5,
					onPageClick,
				}),
			);
		});

		const button = container.querySelector(
			'[data-testid="pageflip-page-indicator-3"]',
		) as HTMLButtonElement | null;

		await act(async () => {
			button?.click();
		});

		expect(onPageClick).toHaveBeenCalledWith(3);
	});

	test("renders page numbers in select mode", async () => {
		const onPageClick = mock(() => {});

		await act(async () => {
			root?.render(
				createElement(PageIndicator, {
					current: 1,
					total: 4,
					showNumbers: true,
					onPageClick,
				}),
			);
		});

		const select = container.querySelector(
			'[data-testid="pageflip-page-indicator-select"]',
		) as HTMLSelectElement | null;

		expect(select?.value).toBe("1");
		expect(select?.options).toHaveLength(4);

		await act(async () => {
			if (!select) {
				return;
			}

			select.value = "3";
			select.dispatchEvent(new Event("change", { bubbles: true }));
		});

		expect(onPageClick).toHaveBeenCalledWith(3);
	});
});
