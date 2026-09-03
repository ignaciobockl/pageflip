import type { DemoConfig } from "../types";

export const sampleImages = [
	"https://picsum.photos/seed/page1/800/600",
	"https://picsum.photos/seed/page2/800/600",
	"https://picsum.photos/seed/page3/800/600",
	"https://picsum.photos/seed/page4/800/600",
	"https://picsum.photos/seed/page5/800/600",
	"https://picsum.photos/seed/page6/800/600",
];

export const defaultConfig: DemoConfig = {
	width: 600,
	height: 500,
	showCover: true,
	size: "stretch",
	flippingTime: 1000,
	drawShadow: true,
	maxShadowOpacity: 0.5,
	usePortrait: true,
	mobileScrollSupport: true,
	swipeDistance: 30,
	clickEventForward: true,
	disableFlipByClick: false,
	showPageCorners: true,
	renderer: "canvas2d",
};
