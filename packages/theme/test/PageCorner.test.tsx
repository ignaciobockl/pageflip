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

const { PageCorner } = await import("../src/components/PageCorner");

describe("PageCorner", () => {
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

	test("handles mouse dragging and updates grab state", async () => {
		const onDragStart = mock(() => {});
		const onDragMove = mock(() => {});
		const onDragEnd = mock(() => {});

		await act(async () => {
			root?.render(
				createElement(PageCorner, {
					corner: "top-right",
					onDragStart,
					onDragMove,
					onDragEnd,
				}),
			);
		});

		const corner = container.querySelector(
			'[data-testid="pageflip-corner-top-right"]',
		) as HTMLDivElement | null;
		expect(corner).not.toBeNull();

		if (corner) {
			corner.getBoundingClientRect = () =>
				({
					left: 20,
					top: 30,
					width: 40,
					height: 40,
					right: 60,
					bottom: 70,
					x: 20,
					y: 30,
					toJSON: () => ({}),
				}) as DOMRect;
		}

		await act(async () => {
			corner?.dispatchEvent(
				new MouseEvent("mousedown", {
					bubbles: true,
					cancelable: true,
					clientX: 40,
					clientY: 55,
				}),
			);
		});

		expect(onDragStart).toHaveBeenCalledWith("top", { x: 20, y: 25 });
		expect(corner?.getAttribute("aria-grabbed")).toBe("true");

		await act(async () => {
			document.dispatchEvent(
				new MouseEvent("mousemove", {
					bubbles: true,
					clientX: 50,
					clientY: 65,
				}),
			);
		});

		expect(onDragMove).toHaveBeenCalledWith({ x: 30, y: 35 });

		await act(async () => {
			document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
		});

		expect(onDragEnd).toHaveBeenCalledWith("top");
		expect(corner?.getAttribute("aria-grabbed")).toBe("false");
	});

	test("handles touch dragging callbacks", async () => {
		const onDragStart = mock(() => {});
		const onDragMove = mock(() => {});
		const onDragEnd = mock(() => {});

		await act(async () => {
			root?.render(
				createElement(PageCorner, {
					corner: "bottom-left",
					onDragStart,
					onDragMove,
					onDragEnd,
				}),
			);
		});

		const corner = container.querySelector(
			'[data-testid="pageflip-corner-bottom-left"]',
		) as HTMLDivElement | null;

		if (corner) {
			corner.getBoundingClientRect = () =>
				({
					left: 10,
					top: 15,
					width: 40,
					height: 40,
					right: 50,
					bottom: 55,
					x: 10,
					y: 15,
					toJSON: () => ({}),
				}) as DOMRect;
		}

		const touchStart = new Event("touchstart", {
			bubbles: true,
			cancelable: true,
		});
		Object.defineProperty(touchStart, "touches", {
			value: [{ clientX: 18, clientY: 26 }],
		});

		await act(async () => {
			corner?.dispatchEvent(touchStart);
		});

		expect(onDragStart).toHaveBeenCalledWith("bottom", { x: 8, y: 11 });

		const touchMove = new Event("touchmove", {
			bubbles: true,
			cancelable: true,
		});
		Object.defineProperty(touchMove, "touches", {
			value: [{ clientX: 24, clientY: 30 }],
		});

		await act(async () => {
			document.dispatchEvent(touchMove);
		});

		expect(onDragMove).toHaveBeenCalledWith({ x: 14, y: 15 });

		await act(async () => {
			document.dispatchEvent(new Event("touchend", { bubbles: true }));
		});

		expect(onDragEnd).toHaveBeenCalledWith("bottom");
	});

	test("does not render when hidden", async () => {
		await act(async () => {
			root?.render(
				createElement(PageCorner, { corner: "top-left", visible: false }),
			);
		});

		expect(container.innerHTML).toBe("");
	});
});
