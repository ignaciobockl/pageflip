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

const { KeyboardShortcuts } = await import(
	"../src/components/KeyboardShortcuts"
);

const createControls = (): PageFlipControls => ({
	flipNext: mock(async () => {}),
	flipPrev: mock(async () => {}),
	flipTo: mock(async () => {}),
	next: mock(async () => {}),
	prev: mock(async () => {}),
	goTo: mock(async () => {}),
	getCurrentPage: mock(() => 0),
	getPageCount: mock(() => 8),
	getOrientation: mock(() => "portrait"),
	getState: mock(() => "idle"),
});

describe("KeyboardShortcuts", () => {
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

	test("handles default navigation shortcuts", async () => {
		const controls = createControls();

		await act(async () => {
			root?.render(createElement(KeyboardShortcuts, { controls }));
		});

		const dispatch = async (key: string, options: KeyboardEventInit = {}) => {
			await act(async () => {
				document.dispatchEvent(
					new KeyboardEvent("keydown", {
						bubbles: true,
						key,
						...options,
					}),
				);
			});
		};

		await dispatch("ArrowRight");
		await dispatch("ArrowLeft");
		await dispatch(" ");
		await dispatch(" ", { shiftKey: true });
		await dispatch("Home");
		await dispatch("End");

		expect(controls.next).toHaveBeenCalledTimes(2);
		expect(controls.prev).toHaveBeenCalledTimes(2);
		expect(controls.goTo).toHaveBeenNthCalledWith(1, 0);
		expect(controls.goTo).toHaveBeenNthCalledWith(2, 7);
	});

	test("supports custom key handlers", async () => {
		const controls = createControls();
		const onCustom = mock(() => {});

		await act(async () => {
			root?.render(
				createElement(KeyboardShortcuts, {
					controls,
					customKeys: { z: onCustom },
				}),
			);
		});

		await act(async () => {
			document.dispatchEvent(
				new KeyboardEvent("keydown", {
					bubbles: true,
					key: "z",
				}),
			);
		});

		expect(onCustom).toHaveBeenCalledTimes(1);
	});

	test("ignores shortcuts while typing in inputs", async () => {
		const controls = createControls();

		await act(async () => {
			root?.render(createElement(KeyboardShortcuts, { controls }));
		});

		const input = document.createElement("input");
		document.body.append(input);

		await act(async () => {
			input.dispatchEvent(
				new KeyboardEvent("keydown", {
					bubbles: true,
					key: "ArrowRight",
				}),
			);
		});

		expect(controls.next).not.toHaveBeenCalled();
		input.remove();
	});
});
