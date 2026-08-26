import { afterEach, describe, expect, test } from "bun:test";

import { LayoutCalculator } from "../../src/layout/LayoutCalculator";
import { OrientationManager } from "../../src/layout/OrientationManager";
import type { PageFlipConfig, PageOrientation, Rect } from "../../src/types";

const originalDateNow = Date.now;
const originalConsoleError = console.error;

const portraitContainer: Rect = { x: 0, y: 0, width: 400, height: 700 };
const landscapeContainer: Rect = { x: 0, y: 0, width: 700, height: 400 };

const portraitConfig: PageFlipConfig = {
	width: 400,
	height: 700,
	usePortrait: true,
};

afterEach(() => {
	Date.now = originalDateNow;
	console.error = originalConsoleError;
});

describe("OrientationManager", () => {
	test("updates orientation automatically for fixed and stretch configs", () => {
		Date.now = () => 101;
		const manager = new OrientationManager(new LayoutCalculator());

		expect(manager.getOrientation()).toBe("portrait");
		expect(manager.isPortrait()).toBe(true);
		expect(manager.isLandscape()).toBe(false);
		expect(
			manager.updateOrientation(portraitContainer, portraitConfig),
		).toBeNull();

		const fixedEvent = manager.updateOrientation(landscapeContainer, {
			width: 700,
			height: 400,
			usePortrait: true,
		});

		expect(fixedEvent).toEqual({
			orientation: "landscape",
			previousOrientation: "portrait",
			automatic: true,
			timestamp: 101,
		});
		expect(manager.getOrientation()).toBe("landscape");
		expect(manager.isPortrait()).toBe(false);
		expect(manager.isLandscape()).toBe(true);

		Date.now = () => 202;
		const stretchEvent = manager.updateOrientation(portraitContainer, {
			width: 900,
			height: 200,
			size: "stretch",
			usePortrait: true,
		});

		expect(stretchEvent).toEqual({
			orientation: "portrait",
			previousOrientation: "landscape",
			automatic: true,
			timestamp: 202,
		});
	});

	test("respects orientation lock and portrait preference accessors", () => {
		const manager = new OrientationManager(new LayoutCalculator());

		manager.setPortraitPreference(false);
		expect(manager.getPortraitPreference()).toBe(false);

		manager.setOrientationLock("landscape");
		expect(manager.getOrientationLock()).toBe("landscape");

		Date.now = () => 303;
		expect(
			manager.updateOrientation(portraitContainer, portraitConfig),
		).toEqual({
			orientation: "landscape",
			previousOrientation: "portrait",
			automatic: true,
			timestamp: 303,
		});

		manager.setOrientationLock("portrait");
		expect(manager.getOrientationLock()).toBe("portrait");

		Date.now = () => 404;
		expect(
			manager.updateOrientation(landscapeContainer, {
				width: 700,
				height: 400,
				usePortrait: false,
			}),
		).toEqual({
			orientation: "portrait",
			previousOrientation: "landscape",
			automatic: true,
			timestamp: 404,
		});

		manager.setOrientationLock("none");
		expect(manager.getOrientationLock()).toBe("none");
	});

	test("forces orientation and calculates effective dimensions", () => {
		const manager = new OrientationManager(new LayoutCalculator());

		Date.now = () => 505;
		expect(manager.forceOrientation("landscape")).toEqual({
			orientation: "landscape",
			previousOrientation: "portrait",
			automatic: false,
			timestamp: 505,
		});

		expect(manager.getEffectiveDimensions({ width: 300, height: 500 })).toEqual(
			{
				width: 500,
				height: 300,
			},
		);

		manager.forceOrientation("portrait");
		expect(manager.getEffectiveDimensions({ width: 500, height: 300 })).toEqual(
			{
				width: 300,
				height: 500,
			},
		);
	});

	test("notifies listeners, supports unsubscribe, and isolates listener errors", () => {
		Date.now = () => 606;
		const manager = new OrientationManager(new LayoutCalculator());
		const received: PageOrientation[] = [];
		const errors: unknown[][] = [];

		console.error = (...args: unknown[]) => {
			errors.push(args);
		};

		const unsubscribe = manager.onOrientationChange((event) => {
			received.push(event.orientation);
		});

		manager.onOrientationChange(() => {
			throw new Error("boom");
		});

		manager.forceOrientation("landscape");
		unsubscribe();
		manager.forceOrientation("portrait");

		expect(received).toEqual(["landscape"]);
		expect(errors).toHaveLength(2);
		expect(errors[0]?.[0]).toBe("[OrientationManager] Listener error:");
		expect(errors[1]?.[0]).toBe("[OrientationManager] Listener error:");
	});
});
