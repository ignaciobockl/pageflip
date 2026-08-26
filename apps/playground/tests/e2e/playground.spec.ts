import { expect, test } from "@playwright/test";

test.describe("Playground - Main Demo", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.waitForSelector('[data-testid="pageflip-book"]');
	});

	test("should load and display cover page", async ({ page }) => {
		const book = page.locator('[data-testid="pageflip-book"]');

		await expect(book).toBeVisible();
		await expect(page.locator("text=PageFlip™")).toBeVisible();
	});

	test("should flip to next page on button click", async ({ page }) => {
		await page.click('[data-testid="next-page-btn"]');
		await expect(page.locator('[data-testid="pageflip-book"]')).toHaveAttribute(
			"data-current-page",
			"1",
		);
	});

	test("should flip to previous page", async ({ page }) => {
		await page.click('[data-testid="next-page-btn"]');
		await page.click('[data-testid="prev-page-btn"]');
		await expect(page.locator('[data-testid="pageflip-book"]')).toHaveAttribute(
			"data-current-page",
			"0",
		);
	});

	test("should navigate via keyboard", async ({ page }) => {
		await page.keyboard.press("ArrowRight");
		await expect(page.locator('[data-testid="pageflip-book"]')).toHaveAttribute(
			"data-current-page",
			"1",
		);

		await page.keyboard.press("ArrowLeft");
		await expect(page.locator('[data-testid="pageflip-book"]')).toHaveAttribute(
			"data-current-page",
			"0",
		);
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
		const layoutSelect = page.locator("select");

		await layoutSelect.selectOption("fixed");
		await expect(page.locator(".book-container")).toHaveCSS("width", "800px");
	});
});

test.describe("Playground - External Controls", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.waitForSelector('[data-testid="pageflip-book"]');
		await page.locator("text=External Controls").scrollIntoViewIfNeeded();
	});

	test("should navigate with external buttons", async ({ page }) => {
		const nextBtn = page.locator('button:has-text("Next")').first();
		const prevBtn = page.locator('button:has-text("Prev")').first();

		await nextBtn.click();
		await expect(page.locator("text=/2 \\/ 3/").first()).toBeVisible();

		await prevBtn.click();
		await expect(page.locator("text=/1 \\/ 3/").first()).toBeVisible();
	});

	test("should show current page and total", async ({ page }) => {
		await expect(page.locator("text=/1 \\/ 3/").first()).toBeVisible();
	});
});

test.describe("Playground - Responsive", () => {
	test("should work on mobile viewport", async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto("/");
		await page.waitForSelector('[data-testid="pageflip-book"]');

		const book = page.locator('[data-testid="pageflip-book"]');

		await expect(book).toBeVisible();
	});

	test("should work on tablet viewport", async ({ page }) => {
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
