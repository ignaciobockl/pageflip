import { expect, test } from "@playwright/test";

test.describe("Playground - Main Demo", () => {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript(() => localStorage.clear());
		await page.goto("/");
		await page.waitForSelector('[data-testid="pageflip-book"]');
	});

	test("should load and display cover page", async ({ page }) => {
		const book = page.locator('[data-testid="pageflip-book"]');

		await expect(book).toBeVisible();
		await expect(book).toHaveAttribute("data-total-pages", /^[1-9]/);
		await expect(page.locator(".logo")).toBeVisible();
	});

	test("should flip to next page on button click", async ({ page }) => {
		const book = page.locator('[data-testid="pageflip-book"]');
		await expect(book).toHaveAttribute("data-total-pages", "6", {
			timeout: 10000,
		});
		const nextBtn = page.locator(
			'[data-testid="pageflip-book"] [data-testid="next-page-btn"]',
		);
		await expect(nextBtn).toBeEnabled();
		await nextBtn.scrollIntoViewIfNeeded();
		await nextBtn.click();
		await expect(book).toHaveAttribute("data-current-page", "1", {
			timeout: 10000,
		});
	});

	test("should flip to previous page", async ({ page }) => {
		const book = page.locator('[data-testid="pageflip-book"]');
		await expect(book).toHaveAttribute("data-total-pages", "6", {
			timeout: 10000,
		});
		const nextBtn = page.locator(
			'[data-testid="pageflip-book"] [data-testid="next-page-btn"]',
		);
		const prevBtn = page.locator(
			'[data-testid="pageflip-book"] [data-testid="prev-page-btn"]',
		);
		await expect(nextBtn).toBeEnabled();
		await nextBtn.scrollIntoViewIfNeeded();
		await nextBtn.click();
		await expect(book).toHaveAttribute("data-current-page", "1", {
			timeout: 10000,
		});
		await expect(prevBtn).toBeEnabled();
		await prevBtn.scrollIntoViewIfNeeded();
		await prevBtn.click();
		await expect(book).toHaveAttribute("data-current-page", "0", {
			timeout: 10000,
		});
	});

	test("should navigate via keyboard", async ({ page }) => {
		const book = page.locator('[data-testid="pageflip-book"]');
		await expect(book).toHaveAttribute("data-total-pages", "6", {
			timeout: 10000,
		});
		await expect(book).toHaveAttribute("data-current-page", "0");
		await page.keyboard.press("ArrowRight");
		await expect(book).toHaveAttribute("data-current-page", "1", {
			timeout: 10000,
		});

		await page.keyboard.press("ArrowLeft");
		await expect(book).toHaveAttribute("data-current-page", "0", {
			timeout: 10000,
		});
	});

	test("should toggle theme", async ({ page }) => {
		const themeBtn = page
			.locator('button[aria-label*="dark"], button[aria-label*="light"]')
			.first();
		const initialTheme =
			(await page.locator("html").getAttribute("data-theme")) ?? "light";

		await themeBtn.click();
		await expect(page.locator("html")).toHaveAttribute(
			"data-theme",
			initialTheme === "light" ? "dark" : "light",
		);
	});

	test("should toggle layout", async ({ page }) => {
		const layoutSelect = page.locator('select[aria-label="Layout mode"]');
		const book = page.locator(".book-container .pf-book");

		await expect(book).toHaveCSS("width", /^(100%|.*px)$/);
		await layoutSelect.selectOption("fixed");
		await expect(book).toHaveCSS("width", "800px");
		await layoutSelect.selectOption("stretch");
		await expect(book).toHaveCSS("width", /^(100%|.*px)$/);
	});
});

test.describe("Playground - External Controls", () => {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript(() => localStorage.clear());
		await page.goto("/");
		await page.waitForSelector('[data-testid="pageflip-book"]');
		await page.locator("text=External Controls").scrollIntoViewIfNeeded();
	});

	test("should navigate with external buttons", async ({ page }) => {
		const nextBtn = page.locator(
			"section.controls-section button:has-text('Next')",
		);
		const prevBtn = page.locator(
			"section.controls-section button:has-text('Prev')",
		);
		await expect(page.locator(".controls-panel .page-info")).toHaveText(
			/1 \/ 3/,
			{
				timeout: 10000,
			},
		);
		await expect(nextBtn.first()).toBeEnabled();
		await nextBtn.first().click();
		await expect(page.locator(".controls-panel .page-info")).toHaveText(
			/2 \/ 3/,
		);
		await expect(prevBtn.first()).toBeEnabled();
		await prevBtn.first().click();
		await expect(page.locator(".controls-panel .page-info")).toHaveText(
			/1 \/ 3/,
		);
	});

	test("should show current page and total", async ({ page }) => {
		await expect(page.locator(".controls-panel .page-info")).toHaveText(
			/1 \/ 3/,
			{
				timeout: 10000,
			},
		);
	});
});

test.describe("Playground - Responsive", () => {
	test("should work on mobile viewport", async ({ page }, testInfo) => {
		test.setTimeout(60000);
		// Firefox on Windows cannot resize the viewport at runtime in
		// headless mode; mobile coverage is provided by the dedicated
		// mobile-chrome and mobile-safari projects.
		test.skip(
			testInfo.project.name === "firefox",
			"Runtime viewport resize unsupported on Firefox",
		);
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto("/");
		await page.waitForSelector('[data-testid="pageflip-book"]');

		const book = page.locator('[data-testid="pageflip-book"]');

		await expect(book).toBeVisible();
	});

	test("should work on tablet viewport", async ({ page }, testInfo) => {
		test.setTimeout(60000);
		test.skip(
			testInfo.project.name === "firefox",
			"Runtime viewport resize unsupported on Firefox",
		);
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.goto("/");
		await page.waitForSelector('[data-testid="pageflip-book"]');

		const book = page.locator('[data-testid="pageflip-book"]');

		await expect(book).toBeVisible();
	});
});

test.describe("Playground - Dark Mode", () => {
	test("should apply dark theme correctly", async ({ page }) => {
		await page.goto("/");
		await page.waitForSelector('[data-testid="pageflip-book"]');

		const themeBtn = page
			.locator('button[aria-label*="dark"], button[aria-label*="light"]')
			.first();

		await themeBtn.click();

		await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

		const bgColor = await page
			.locator(".book-container")
			.evaluate((el) => window.getComputedStyle(el).backgroundColor);

		expect(bgColor).toBeTruthy();
	});
});

test.describe("Playground - Accessibility", () => {
	test("should have no accessibility violations", async ({ page }) => {
		await page.goto("/");
		await page.waitForSelector('[data-testid="pageflip-book"]');

		await page.addScriptTag({
			url: "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js",
		});
		await page.waitForFunction(
			() => (window as unknown as { axe?: unknown }).axe !== undefined,
		);

		const violations = await page.evaluate(async () => {
			const axe = (
				window as Window & {
					axe: {
						run: (
							documentRoot: Document,
							options: {
								runOnly: { type: string; values: string[] };
							},
						) => Promise<{ violations: unknown[] }>;
					};
				}
			).axe;

			const results = await axe.run(document, {
				runOnly: {
					type: "tag",
					values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
				},
			});

			return results.violations;
		});

		expect(violations).toEqual([]);
	});

	test("should be keyboard navigable", async ({ page }) => {
		await page.goto("/");
		await page.waitForSelector('[data-testid="pageflip-book"]');

		await page.keyboard.press("Tab");
		const focused = page.locator(":focus");

		await expect(focused).toBeVisible();
	});
});
