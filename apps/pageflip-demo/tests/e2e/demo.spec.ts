import { expect, test } from "@playwright/test";

test.describe("PageFlip Demo - Navegacion", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.waitForSelector('[data-testid="demo-content"]');
	});

	test("muestra las 6 pestañas de demos", async ({ page }) => {
		for (const id of [
			"basic",
			"images",
			"config",
			"events",
			"hooks",
			"theme",
		]) {
			await expect(page.locator(`[data-testid="tab-${id}"]`)).toBeVisible();
		}
	});

	test("cambia entre demos", async ({ page }) => {
		await page.locator('[data-testid="tab-events"]').click();
		await expect(page.locator('[data-testid="event-log"]')).toBeVisible();

		await page.locator('[data-testid="tab-hooks"]').click();
		await expect(
			page.locator('[data-testid="toggle-hooks-book"]'),
		).toBeVisible();
	});
});

test.describe("PageFlip Demo - Demo Basico", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.waitForSelector('[data-testid="demo-content"]');
	});

	test("inicializa el libro y muestra total de paginas", async ({ page }) => {
		const pageInfo = page.locator('[data-testid="page-info"]');
		await expect(pageInfo).toHaveAttribute("data-total-pages", /^[1-9]/);
	});

	test("navega a la pagina siguiente", async ({ page }) => {
		const pageInfo = page.locator('[data-testid="page-info"]');
		await page.locator('[data-testid="next-page-btn"]').click();
		await expect(pageInfo).toHaveAttribute("data-current-page", "1");
	});

	test("botones deshabilitados en los limites", async ({ page }) => {
		const prev = page.locator('[data-testid="prev-page-btn"]');
		await expect(prev).toHaveAttribute("disabled", "");
	});
});

test.describe("PageFlip Demo - Imagenes", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.locator('[data-testid="tab-images"]').click();
		await page.waitForSelector('[data-testid="page-info"]');
	});

	test("carga 6 paginas de imagenes", async ({ page }) => {
		const pageInfo = page.locator('[data-testid="page-info"]');
		await expect(pageInfo).toHaveAttribute("data-total-pages", "6");
	});
});

test.describe("PageFlip Demo - Configuracion", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.locator('[data-testid="tab-config"]').click();
		await page.waitForSelector('[data-testid="page-info"]');
	});

	test("cambia flippingTime en vivo sin remount", async ({ page }) => {
		const slider = page.locator("#cfg-flippingtime");
		await slider.fill("1500");
		await expect(slider).toHaveValue("1500");
		await expect(page.locator('[data-testid="page-info"]')).toBeVisible();
	});
});

test.describe("PageFlip Demo - Eventos", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.locator('[data-testid="tab-events"]').click();
		await page.waitForSelector('[data-testid="event-log"]');
	});

	test("registra onInit al montar", async ({ page }) => {
		await expect(page.locator('[data-testid="event-log"]')).toContainText(
			"onInit",
		);
	});

	test("registra onFlip al navegar", async ({ page }) => {
		await page.locator('[data-testid="next-page-btn"]').click();
		await expect(page.locator('[data-testid="event-log"]')).toContainText(
			"onFlip",
		);
	});
});

test.describe("PageFlip Demo - Hooks", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.locator('[data-testid="tab-hooks"]').click();
	});

	test("muestra el libro al pulsar el boton", async ({ page }) => {
		await page.locator('[data-testid="toggle-hooks-book"]').click();
		await expect(page.locator('[data-testid="page-info"]')).toBeVisible();
	});
});

test.describe("PageFlip Demo - Theme", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.locator('[data-testid="tab-theme"]').click();
	});

	test("renderiza Toolbar y PageIndicator", async ({ page }) => {
		await expect(
			page.locator('[data-testid="pageflip-toolbar"]'),
		).toBeVisible();
		await expect(
			page.locator('[data-testid="pageflip-page-indicator"]'),
		).toBeVisible();
	});
});
