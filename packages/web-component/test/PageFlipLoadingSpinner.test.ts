import { afterEach, beforeEach, describe, expect, test } from "bun:test";

const { PageFlipLoadingSpinner } = await import(
	"../src/PageFlipLoadingSpinner"
);

describe("PageFlipLoadingSpinner", () => {
	let host: HTMLDivElement;

	beforeEach(() => {
		host = document.createElement("div");
		document.body.append(host);
	});

	afterEach(() => {
		host.remove();
	});

	test("registers and applies supported sizes", () => {
		expect(customElements.get("page-flip-loading-spinner")).toBe(
			PageFlipLoadingSpinner,
		);

		for (const [size, expectedSize, expectedBorder] of [
			["sm", "16px", "2px"],
			["md", "24px", "3px"],
			["lg", "32px", "4px"],
		] as const) {
			const spinner = document.createElement(
				"page-flip-loading-spinner",
			) as PageFlipLoadingSpinner;
			spinner.setAttribute("size", size);
			host.append(spinner);

			expect(spinner.style.getPropertyValue("--pf-spinner-size")).toBe(
				expectedSize,
			);
			expect(spinner.style.getPropertyValue("--pf-spinner-border-width")).toBe(
				expectedBorder,
			);

			spinner.remove();
		}
	});

	test("applies color and exposes animation and ARIA state", () => {
		const spinner = document.createElement(
			"page-flip-loading-spinner",
		) as PageFlipLoadingSpinner;
		spinner.setAttribute("color", "#ff00aa");
		host.append(spinner);

		const visual = spinner.shadowRoot?.querySelector(
			".pf-loading-spinner",
		) as HTMLElement;

		expect(spinner.style.getPropertyValue("--pf-spinner-color")).toBe(
			"#ff00aa",
		);
		expect(spinner.shadowRoot?.innerHTML).toContain(
			"animation: pf-spin 1s linear infinite",
		);
		expect(visual.getAttribute("role")).toBe("status");
		expect(visual.getAttribute("aria-label")).toBe("Loading");
		expect(visual.getAttribute("aria-busy")).toBe("true");
		expect(visual.textContent).toContain("Loading...");
	});
});
