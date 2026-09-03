export type DemoType =
	| "basic"
	| "images"
	| "config"
	| "events"
	| "hooks"
	| "theme";

export interface DemoConfig {
	width: number;
	height: number;
	showCover: boolean;
	size: "fixed" | "stretch";
	flippingTime: number;
	drawShadow: boolean;
	maxShadowOpacity: number;
	usePortrait: boolean;
	mobileScrollSupport: boolean;
	swipeDistance: number;
	clickEventForward: boolean;
	disableFlipByClick: boolean;
	showPageCorners: boolean;
	renderer: "auto" | "canvas2d" | "webgl";
}

export interface EventLogEntry {
	id: number;
	type: string;
	data: unknown;
	timestamp: Date;
}

export type DemoEvent = (type: string, data: unknown) => void;
