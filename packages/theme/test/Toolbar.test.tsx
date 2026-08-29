import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import type { PageFlipControls } from "@pageflip/react";
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

const { Toolbar } = await import("../src/components/Toolbar");

const createControls = (): PageFlipControls => ({
	flipNext: mock(async () => {}),
	flipPrev: mock(async () => {}),
	flipTo: mock(async () => {}),
	next: mock(async () => {}),
	prev: mock(async () => {}),
	goTo: mock(async () => {}),
	getCurrentPage: mock(() => 0),
	getPageCount: mock(() => 12),
	getOrientation: mock(() => "portrait"),
	getState: mock(() => "idle"),
});

describe("Toolbar", () => {
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

	test("renders navigation controls, page indicator, and aria attributes", async () => {
		const controls = createControls();

		await act(async () => {
			root?.render(
				createElement(Toolbar, {
					controls,
					currentPage: 1,
					pageCount: 5,
				}),
			);
		});

		const toolbar = container.querySelector('[data-testid="pageflip-toolbar"]');
		expect(toolbar?.getAttribute("role")).toBe("toolbar");
		expect(toolbar?.getAttribute("aria-label")).toBe("Page navigation");
		expect(container.textContent).toContain("2 / 5");
		expect(
			container
				.querySelector('[data-testid="page-indicator-1"]')
				?.getAttribute("aria-current"),
		).toBe("page");
	});

	test("navigates with first, previous, next, last, and page indicator buttons", async () => {
		const controls = createControls();

		await act(async () => {
			root?.render(
				createElement(Toolbar, {
					controls,
					currentPage: 2,
					pageCount: 5,
				}),
			);
		});

		const click = async (selector: string) => {
			const element = container.querySelector(
				selector,
			) as HTMLButtonElement | null;
			expect(element).not.toBeNull();
			await act(async () => {
				element?.click();
			});
		};

		await click('[data-testid="first-page-btn"]');
		await click('[data-testid="prev-page-btn"]');
		await click('[data-testid="next-page-btn"]');
		await click('[data-testid="last-page-btn"]');
		await click('[data-testid="page-indicator-3"]');

		expect(controls.goTo).toHaveBeenNthCalledWith(1, 0);
		expect(controls.prev).toHaveBeenCalledTimes(1);
		expect(controls.next).toHaveBeenCalledTimes(1);
		expect(controls.goTo).toHaveBeenNthCalledWith(2, 4);
		expect(controls.goTo).toHaveBeenNthCalledWith(3, 3);
	});

	test("disables boundary actions on the first and last pages", async () => {
		const controls = createControls();

		await act(async () => {
			root?.render(
				createElement(Toolbar, {
					controls,
					currentPage: 0,
					pageCount: 3,
				}),
			);
		});

		const firstButton = container.querySelector(
			'[data-testid="first-page-btn"]',
		) as HTMLButtonElement | null;
		const prevButton = container.querySelector(
			'[data-testid="prev-page-btn"]',
		) as HTMLButtonElement | null;

		expect(firstButton?.disabled).toBe(true);
		expect(prevButton?.disabled).toBe(true);

		await act(async () => {
			firstButton?.click();
			prevButton?.click();
		});

		expect(controls.goTo).not.toHaveBeenCalled();
		expect(controls.prev).not.toHaveBeenCalled();

		await act(async () => {
			root?.render(
				createElement(Toolbar, {
					controls,
					currentPage: 2,
					pageCount: 3,
				}),
			);
		});

		const nextButton = container.querySelector(
			'[data-testid="next-page-btn"]',
		) as HTMLButtonElement | null;
		const lastButton = container.querySelector(
			'[data-testid="last-page-btn"]',
		) as HTMLButtonElement | null;

		expect(nextButton?.disabled).toBe(true);
		expect(lastButton?.disabled).toBe(true);
	});
});
