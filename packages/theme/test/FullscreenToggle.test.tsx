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

const { FullscreenToggle } = await import("../src/components/FullscreenToggle");

const flush = async () => {
	await Promise.resolve();
	await Promise.resolve();
};

describe("FullscreenToggle", () => {
	let container: HTMLDivElement;
	let root: Root | null;
	let fullscreenDescriptor: PropertyDescriptor | undefined;

	beforeEach(() => {
		root = null;
		container = document.createElement("div");
		document.body.append(container);
		root = createRoot(container);
		fullscreenDescriptor = Object.getOwnPropertyDescriptor(
			document,
			"fullscreenEnabled",
		);
	});

	afterEach(async () => {
		if (fullscreenDescriptor) {
			Object.defineProperty(
				document,
				"fullscreenEnabled",
				fullscreenDescriptor,
			);
		} else {
			Reflect.deleteProperty(document, "fullscreenEnabled");
		}

		await act(async () => {
			root?.unmount();
			await flush();
		});
		container.remove();
	});

	test("uses the fullscreen API support check and toggles entry state", async () => {
		Object.defineProperty(document, "fullscreenEnabled", {
			configurable: true,
			value: true,
		});
		const onToggle = mock(() => {});

		await act(async () => {
			root?.render(
				createElement(FullscreenToggle, {
					isFullscreen: false,
					onToggle,
				}),
			);
			await flush();
		});

		const button = container.querySelector(
			'[data-testid="pageflip-fullscreen-toggle"]',
		) as HTMLButtonElement | null;

		expect(button?.getAttribute("aria-label")).toBe("Enter fullscreen");
		expect(button?.getAttribute("aria-pressed")).toBe("false");
		expect(button?.querySelectorAll("path")).toHaveLength(1);

		await act(async () => {
			button?.click();
		});

		expect(onToggle).toHaveBeenCalledTimes(1);
	});

	test("swaps to the exit icon and label while fullscreen is active", async () => {
		Object.defineProperty(document, "fullscreenEnabled", {
			configurable: true,
			value: true,
		});

		await act(async () => {
			root?.render(
				createElement(FullscreenToggle, {
					isFullscreen: true,
					onToggle: () => {},
				}),
			);
			await flush();
		});

		const button = container.querySelector(
			'[data-testid="pageflip-fullscreen-toggle"]',
		) as HTMLButtonElement | null;

		expect(button?.getAttribute("aria-label")).toBe("Exit fullscreen");
		expect(button?.getAttribute("aria-pressed")).toBe("true");
		expect(button?.querySelectorAll("path")).toHaveLength(4);
	});

	test("does not render when fullscreen is unsupported", async () => {
		Object.defineProperty(document, "fullscreenEnabled", {
			configurable: true,
			value: false,
		});

		await act(async () => {
			root?.render(
				createElement(FullscreenToggle, {
					isFullscreen: false,
					onToggle: () => {},
				}),
			);
			await flush();
		});

		expect(
			container.querySelector('[data-testid="pageflip-fullscreen-toggle"]'),
		).toBeNull();
	});
});
