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

const {
	PageFlipProvider,
	usePageFlipContext,
	usePageFlipControls,
	usePageFlipInstance,
	usePageFlipState,
} = await import("../src/context/PageFlipProvider");

const flush = async () => {
	await Promise.resolve();
	await Promise.resolve();
};

class MockPageFlipInstance extends EventTarget {
	public pageCount = 6;
	public currentPageIndex = 1;
	public orientation = "portrait" as const;
	public state = "idle" as const;
	public bounds = {
		x: 0,
		y: 0,
		left: 0,
		top: 0,
		width: 800,
		height: 600,
		right: 800,
		bottom: 600,
	};
	public calls: unknown[][] = [];

	public async flipNext(): Promise<void> {
		this.calls.push(["flipNext"]);
	}

	public async flipPrev(): Promise<void> {
		this.calls.push(["flipPrev"]);
	}

	public async flip(page: number, corner?: "top" | "bottom"): Promise<void> {
		this.calls.push(["flip", page, corner]);
	}

	public async turnToPage(page: number): Promise<void> {
		this.calls.push(["turnToPage", page]);
	}

	public async turnToNextPage(): Promise<void> {
		this.calls.push(["turnToNextPage"]);
	}

	public async turnToPrevPage(): Promise<void> {
		this.calls.push(["turnToPrevPage"]);
	}
}

describe("PageFlipProvider", () => {
	let container: HTMLDivElement;
	let root: Root | null;

	beforeEach(() => {
		root = null;
		container = document.createElement("div");
		document.body.append(container);
		root = createRoot(container);
	});

	afterEach(async () => {
		await act(async () => {
			root?.unmount();
			await flush();
		});
		container.remove();
	});

	test("provides context, hooks, and mapped controls", async () => {
		const instance = new MockPageFlipInstance();
		const snapshot: {
			context?: ReturnType<typeof usePageFlipContext>;
			instance?: ReturnType<typeof usePageFlipInstance>;
			controls?: ReturnType<typeof usePageFlipControls>;
			state?: ReturnType<typeof usePageFlipState>;
		} = {};

		function Harness() {
			snapshot.context = usePageFlipContext();
			snapshot.instance = usePageFlipInstance();
			snapshot.controls = usePageFlipControls();
			snapshot.state = usePageFlipState();

			return createElement("div", {
				"data-page": snapshot.state?.currentPage ?? -1,
			});
		}

		await act(async () => {
			root?.render(
				createElement(
					PageFlipProvider,
					{ instance: instance as never },
					createElement(Harness),
				),
			);
			await flush();
		});

		expect(snapshot.context?.instance).toBe(instance);
		expect(snapshot.instance).toBe(instance);
		expect(snapshot.controls?.getCurrentPage()).toBe(1);
		expect(snapshot.controls?.getPageCount()).toBe(6);
		expect(snapshot.state?.currentPage).toBe(1);
		expect(snapshot.state?.pageCount).toBe(6);

		await snapshot.controls?.next();
		await snapshot.controls?.prev();
		await snapshot.controls?.goTo(4);
		await snapshot.controls?.flipTo(3, "bottom");

		expect(instance.calls).toEqual([
			["turnToNextPage"],
			["turnToPrevPage"],
			["turnToPage", 4],
			["flip", 3, "bottom"],
		]);
	});

	test("updates subscribed state from instance events", async () => {
		const instance = new MockPageFlipInstance();
		const snapshot: { state?: ReturnType<typeof usePageFlipState> } = {};

		function Harness() {
			snapshot.state = usePageFlipState();
			return createElement("div", {
				"data-page": snapshot.state?.currentPage ?? -1,
			});
		}

		await act(async () => {
			root?.render(
				createElement(
					PageFlipProvider,
					{ instance: instance as never },
					createElement(Harness),
				),
			);
			await flush();
		});

		await act(async () => {
			instance.currentPageIndex = 4;
			instance.pageCount = 10;
			instance.orientation = "landscape" as never;
			instance.state = "flipping" as never;
			instance.dispatchEvent(new Event("flip"));
			await flush();
		});

		expect(snapshot.state?.currentPage).toBe(4);
		expect(snapshot.state?.pageCount).toBe(10);
		expect(snapshot.state?.orientation).toBe("landscape");
		expect(snapshot.state?.state).toBe("flipping");
		expect(snapshot.state?.isFlipping).toBe(true);

		await act(async () => {
			instance.currentPageIndex = 5;
			instance.dispatchEvent(new Event("update"));
			await flush();
		});

		expect(snapshot.state?.currentPage).toBe(5);
	});
});
