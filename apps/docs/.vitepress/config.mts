import { fileURLToPath } from "node:url";

import { defineConfig } from "vitepress";

export default defineConfig({
	lang: "en-US",
	title: "PageFlip",
	description:
		"Renderer-agnostic page flip engine, React bindings, and design system.",
	cleanUrls: true,
	ignoreDeadLinks: true,
	lastUpdated: true,
	head: [
		["meta", { name: "theme-color", content: "#3b82f6" }],
		["meta", { property: "og:type", content: "website" }],
		["meta", { property: "og:title", content: "PageFlip Docs" }],
		[
			"meta",
			{
				property: "og:description",
				content:
					"Documentation for the PageFlip monorepo, APIs, components, and examples.",
			},
		],
	],
	themeConfig: {
		nav: [
			{ text: "Guide", link: "/guide/" },
			{ text: "API", link: "/api/" },
			{ text: "Components", link: "/components/" },
			{ text: "Examples", link: "/examples/" },
			{ text: "Migration", link: "/migration/" },
		],
		sidebar: {
			"/guide/": [
				{
					text: "Guide",
					items: [
						{ text: "Overview", link: "/guide/" },
						{ text: "Getting Started", link: "/guide/getting-started" },
						{ text: "Installation", link: "/guide/installation" },
						{ text: "Core Concepts", link: "/guide/core-concepts" },
						{ text: "Theming", link: "/guide/theming" },
					],
				},
			],
			"/api/": [
				{
					text: "API Reference",
					items: [
						{ text: "Overview", link: "/api/" },
						{ text: "Core", link: "/api/core" },
						{ text: "React", link: "/api/react" },
						{ text: "Theme", link: "/api/theme" },
						{ text: "Web Components", link: "/api/web-components" },
						{ text: "Renderers", link: "/api/renderers" },
					],
				},
			],
			"/components/": [
				{
					text: "Components",
					items: [
						{ text: "Overview", link: "/components/" },
						{ text: "Toolbar", link: "/components/toolbar" },
						{ text: "Page Indicator", link: "/components/page-indicator" },
						{ text: "Zoom Controls", link: "/components/zoom-controls" },
						{
							text: "Fullscreen Toggle",
							link: "/components/fullscreen-toggle",
						},
						{ text: "Page Corner", link: "/components/page-corner" },
						{ text: "Loading Spinner", link: "/components/loading-spinner" },
						{
							text: "Keyboard Shortcuts",
							link: "/components/keyboard-shortcuts",
						},
					],
				},
			],
			"/examples/": [
				{
					text: "Examples",
					items: [
						{ text: "Overview", link: "/examples/" },
						{ text: "Basic Book", link: "/examples/basic-book" },
						{
							text: "Controlled Navigation",
							link: "/examples/controlled-navigation",
						},
						{ text: "Media Catalog", link: "/examples/media-catalog" },
						{ text: "SSR Integration", link: "/examples/ssr-integration" },
						{
							text: "Performance Tuning",
							link: "/examples/performance-tuning",
						},
					],
				},
			],
			"/migration/": [
				{
					text: "Migration",
					items: [
						{ text: "Overview", link: "/migration/" },
						{ text: "From StPageFlip", link: "/migration/from-stpageflip" },
						{ text: "Upgrade Guide", link: "/migration/upgrade-guide" },
						{
							text: "Adoption Checklist",
							link: "/migration/adoption-checklist",
						},
					],
				},
			],
		},
		socialLinks: [
			{ icon: "github", link: "https://github.com/ignaciobockl/pageflip" },
		],
		search: {
			provider: "local",
		},
		outline: {
			label: "On this page",
			level: [2, 3],
		},
		docFooter: {
			prev: "Previous page",
			next: "Next page",
		},
		editLink: {
			pattern:
				"https://github.com/ignaciobockl/pageflip/edit/main/apps/docs/:path",
			text: "Edit this page on GitHub",
		},
		footer: {
			message: "Released under the MIT License.",
			copyright: "Copyright © 2026 PageFlip",
		},
	},
	vite: {
		resolve: {
			alias: {
				"@pageflip/core": fileURLToPath(
					new URL("../../../packages/core/src", import.meta.url),
				),
				"@pageflip/react": fileURLToPath(
					new URL("../../../packages/react/src", import.meta.url),
				),
				"@pageflip/theme": fileURLToPath(
					new URL("../../../packages/theme/src", import.meta.url),
				),
			},
			dedupe: ["react", "react-dom"],
		},
		server: {
			port: 4173,
		},
	},
	markdown: {
		lineNumbers: true,
	},
});
