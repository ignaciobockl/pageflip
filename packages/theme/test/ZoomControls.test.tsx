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

const { ZoomControls } = await import("../src/components/ZoomControls");

describe("ZoomControls", () => {
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

	test("renders zoom level and handles zoom actions", async () => {
		const onZoomIn = mock(() => {});
		const onZoomOut = mock(() => {});
		const onReset = mock(() => {});

		await act(async () => {
			root?.render(
				createElement(ZoomControls, {
					level: 1.5,
					onZoomIn,
					onZoomOut,
					onReset,
				}),
			);
		});

		expect(
			container.querySelector('[data-testid="pageflip-zoom-controls-level"]')
				?.textContent,
		).toBe("150%");

		for (const selector of [
			'[data-testid="pageflip-zoom-controls-out"]',
			'[data-testid="pageflip-zoom-controls-in"]',
			'[data-testid="pageflip-zoom-controls-reset"]',
		]) {
			const button = container.querySelector(
				selector,
			) as HTMLButtonElement | null;
			await act(async () => {
				button?.click();
			});
		}

		expect(onZoomOut).toHaveBeenCalledTimes(1);
		expect(onZoomIn).toHaveBeenCalledTimes(1);
		expect(onReset).toHaveBeenCalledTimes(1);
	});

	test("disables zoom out and zoom in at min and max levels", async () => {
		const onZoomIn = mock(() => {});
		const onZoomOut = mock(() => {});
		const onReset = mock(() => {});

		await act(async () => {
			root?.render(
				createElement(ZoomControls, {
					level: 0.5,
					minZoom: 0.5,
					maxZoom: 2,
					onZoomIn,
					onZoomOut,
					onReset,
				}),
			);
		});

		const zoomOutButton = container.querySelector(
			'[data-testid="pageflip-zoom-controls-out"]',
		) as HTMLButtonElement | null;
		expect(zoomOutButton?.disabled).toBe(true);

		await act(async () => {
			root?.render(
				createElement(ZoomControls, {
					level: 2,
					minZoom: 0.5,
					maxZoom: 2,
					onZoomIn,
					onZoomOut,
					onReset,
				}),
			);
		});

		const zoomInButton = container.querySelector(
			'[data-testid="pageflip-zoom-controls-in"]',
		) as HTMLButtonElement | null;
		expect(zoomInButton?.disabled).toBe(true);
	});

	test("hides the level display when requested", async () => {
		await act(async () => {
			root?.render(
				createElement(ZoomControls, {
					level: 1,
					onZoomIn: () => {},
					onZoomOut: () => {},
					onReset: () => {},
					showLevel: false,
				}),
			);
		});

		expect(
			container.querySelector('[data-testid="pageflip-zoom-controls-level"]'),
		).toBeNull();
	});
});
