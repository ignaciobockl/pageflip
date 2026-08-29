import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

const { PageFlipCorner } = await import("../src/PageFlipCorner");

type MockBookElement = HTMLElement & {
	flipPrev: ReturnType<typeof mock>;
	flipNext: ReturnType<typeof mock>;
};

describe("PageFlipCorner", () => {
	let host: HTMLDivElement;
	let book: MockBookElement;

	beforeEach(() => {
		host = document.createElement("div");
		document.body.append(host);
		book = document.createElement("page-flip-book") as MockBookElement;
		book.flipPrev = mock(() => {});
		book.flipNext = mock(() => {});
		host.append(book);
	});

	afterEach(() => {
		host.remove();
	});

	test("registers, positions itself, and toggles visibility", () => {
		expect(customElements.get("page-flip-corner")).toBe(PageFlipCorner);

		const corner = document.createElement("page-flip-corner") as PageFlipCorner;
		corner.setAttribute("corner", "bottom-left");
		corner.setAttribute("visible", "false");
		book.append(corner);

		expect(corner.style.bottom).toBe("0px");
		expect(corner.style.left).toBe("0px");
		expect(corner.hasAttribute("hidden")).toBe(true);
	});

	test("dispatches drag events for mouse interaction", () => {
		const corner = document.createElement("page-flip-corner") as PageFlipCorner;
		corner.setAttribute("corner", "top-right");
		book.append(corner);

		const visual = corner.shadowRoot?.querySelector(
			".pf-corner__visual",
		) as HTMLElement;
		visual.getBoundingClientRect = () =>
			({
				left: 20,
				top: 30,
				width: 48,
				height: 48,
				right: 68,
				bottom: 78,
				x: 20,
				y: 30,
				toJSON: () => ({}),
			}) as DOMRect;

		const onDragStart = mock(() => {});
		const onDragMove = mock(() => {});
		const onDragEnd = mock(() => {});
		book.addEventListener("dragStart", onDragStart as EventListener);
		book.addEventListener("dragMove", onDragMove as EventListener);
		book.addEventListener("dragEnd", onDragEnd as EventListener);

		visual.dispatchEvent(
			new MouseEvent("mousedown", {
				bubbles: true,
				cancelable: true,
				clientX: 38,
				clientY: 50,
			}),
		);

		expect(corner.getAttribute("data-dragging")).toBe("true");
		expect(visual.getAttribute("aria-grabbed")).toBe("true");
		expect((onDragStart.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
			corner: "top",
			point: { x: 18, y: 20 },
		});

		document.dispatchEvent(
			new MouseEvent("mousemove", {
				bubbles: true,
				clientX: 44,
				clientY: 58,
			}),
		);

		expect((onDragMove.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
			corner: "top",
			point: { x: 24, y: 28 },
		});

		document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));

		expect(corner.hasAttribute("data-dragging")).toBe(false);
		expect(visual.getAttribute("aria-grabbed")).toBe("false");
		expect((onDragEnd.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
			corner: "top",
		});
	});

	test("dispatches drag events for touch interaction and supports keyboard", () => {
		const corner = document.createElement("page-flip-corner") as PageFlipCorner;
		corner.setAttribute("corner", "bottom-left");
		book.append(corner);

		const visual = corner.shadowRoot?.querySelector(
			".pf-corner__visual",
		) as HTMLElement;
		visual.getBoundingClientRect = () =>
			({
				left: 10,
				top: 15,
				width: 48,
				height: 48,
				right: 58,
				bottom: 63,
				x: 10,
				y: 15,
				toJSON: () => ({}),
			}) as DOMRect;

		const onDragStart = mock(() => {});
		const onDragMove = mock(() => {});
		book.addEventListener("dragStart", onDragStart as EventListener);
		book.addEventListener("dragMove", onDragMove as EventListener);

		const touchStart = new Event("touchstart", {
			bubbles: true,
			cancelable: true,
		});
		Object.defineProperty(touchStart, "touches", {
			value: [{ clientX: 22, clientY: 30 }],
		});
		visual.dispatchEvent(touchStart);

		const touchMove = new Event("touchmove", {
			bubbles: true,
			cancelable: true,
		});
		Object.defineProperty(touchMove, "touches", {
			value: [{ clientX: 28, clientY: 34 }],
		});
		document.dispatchEvent(touchMove);

		expect((onDragStart.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
			corner: "bottom",
			point: { x: 12, y: 15 },
		});
		expect((onDragMove.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
			corner: "bottom",
			point: { x: 18, y: 19 },
		});

		visual.dispatchEvent(
			new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }),
		);
		visual.dispatchEvent(
			new KeyboardEvent("keydown", { bubbles: true, key: " " }),
		);

		expect(book.flipPrev).toHaveBeenCalledTimes(2);
		expect(book.flipNext).toHaveBeenCalledTimes(0);
	});
});
