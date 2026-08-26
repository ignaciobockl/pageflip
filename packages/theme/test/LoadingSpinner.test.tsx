import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
	type Root,
	createRoot,
} from "../../react/node_modules/react-dom/client.js";
import { act } from "../../react/node_modules/react-dom/test-utils.js";
import { createElement } from "../../react/node_modules/react/index.js";

import { mock } from "bun:test";

mock.module("react", () => import("../../react/node_modules/react/index.js"));
mock.module(
	"react/jsx-runtime",
	() => import("../../react/node_modules/react/jsx-runtime.js"),
);

const { LoadingSpinner } = await import("../src/components/LoadingSpinner");

describe("LoadingSpinner", () => {
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

	test("renders supported sizes", async () => {
		for (const [size, expectedWidth] of [
			["sm", "16px"],
			["md", "24px"],
			["lg", "32px"],
		] as const) {
			await act(async () => {
				root?.render(createElement(LoadingSpinner, { size }));
			});

			const spinner = container.querySelector(
				'[data-testid="pageflip-loading-spinner"]',
			) as HTMLOutputElement | null;

			expect(spinner?.style.width).toBe(expectedWidth);
		}
	});

	test("applies custom color, animation, and aria attributes", async () => {
		await act(async () => {
			root?.render(
				createElement(LoadingSpinner, { color: "#ff00aa", size: "lg" }),
			);
		});

		const spinner = container.querySelector(
			'[data-testid="pageflip-loading-spinner"]',
		) as HTMLOutputElement | null;

		expect(spinner?.style.borderTopColor).toBe("rgb(255, 0, 170)");
		expect(spinner?.style.animation).toContain("pf-spin");
		expect(spinner?.getAttribute("aria-label")).toBe("Loading");
		expect(spinner?.getAttribute("aria-live")).toBe("polite");
		expect(spinner?.getAttribute("aria-busy")).toBe("true");
		expect(spinner?.textContent).toContain("Loading...");
	});
});
