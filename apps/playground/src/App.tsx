/**
 * PageFlip Playground
 *
 * Interactive demo showcasing all PageFlip features.
 * @packageDocumentation
 */
import type { PageFlipInstance } from "@pageflip/core";
import {
	PageFlip,
	usePageFlip,
	usePageFlipControls,
	usePageFlipState,
} from "@pageflip/react";
import {
	FullscreenToggle,
	KeyboardShortcuts,
	LoadingSpinner,
	PageIndicator,
	Toolbar,
	ZoomControls,
} from "@pageflip/theme";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

const DEMO_PAGES = [
	{
		id: "cover",
		content: (
			<div className="page page--cover">
				<div className="page__content">
					<h1>PageFlip™</h1>
					<p className="subtitle">Modern flip book library</p>
					<div className="badges">
						<span className="badge">React 18+</span>
						<span className="badge">TypeScript</span>
						<span className="badge">WCAG 2.1 AA</span>
						<span className="badge">Zero Deps</span>
					</div>
				</div>
			</div>
		),
	},
	{
		id: "page-1",
		content: (
			<div className="page">
				<div className="page__content">
					<h2>Getting Started</h2>
					<pre className="code-block">{`bun add @pageflip/react @pageflip/theme

import { PageFlip } from '@pageflip/react';
import '@pageflip/theme';

<PageFlip width={800} height={600}>
  <div>Page 1</div>
  <div>Page 2</div>
</PageFlip>`}</pre>
				</div>
			</div>
		),
	},
	{
		id: "page-2",
		content: (
			<div className="page">
				<div className="page__content">
					<h2>Hooks API</h2>
					<pre className="code-block">{`const { instance, ref } = usePageFlip({
  width: 800,
  height: 600,
});

const { next, prev, goTo } = usePageFlipControls(instance);
const { currentPage, pageCount } = usePageFlipState(instance);`}</pre>
				</div>
			</div>
		),
	},
	{
		id: "page-3",
		content: (
			<div className="page">
				<div className="page__content">
					<h2>Web Components</h2>
					<pre className="code-block">{`bun add @pageflip/web-component

import '@pageflip/web-component';

<page-flip-book width="800" height="600">
  <div slot="pages">
    <div slot="page-0">Page 1</div>
    <div slot="page-1">Page 2</div>
  </div>
</page-flip-book>`}</pre>
				</div>
			</div>
		),
	},
	{
		id: "page-4",
		content: (
			<div className="page">
				<div className="page__content">
					<h2>Features</h2>
					<ul className="feature-list">
						<li>✅ Canvas 2D rendering (60fps)</li>
						<li>✅ Responsive (fixed/stretch)</li>
						<li>✅ Dark/Light mode</li>
						<li>✅ Keyboard navigation</li>
						<li>✅ Touch/swipe support</li>
						<li>✅ SSR-safe (Next.js ready)</li>
						<li>✅ Zero runtime dependencies</li>
						<li>✅ WCAG 2.1 AA accessible</li>
					</ul>
				</div>
			</div>
		),
	},
	{
		id: "back-cover",
		content: (
			<div className="page page--cover page--back">
				<div className="page__content">
					<h1>Ready to flip?</h1>
					<p className="subtitle">npm install @pageflip/react</p>
					<a
						className="link"
						href="https://github.com/ignaciobockl/pageflip"
						target="_blank"
						rel="noreferrer noopener"
					>
						GitHub Repository
					</a>
				</div>
			</div>
		),
	},
];

const COMPONENT_DEMO_PAGES = [
	"Toolbar Demo",
	"Indicator Demo",
	"Shared Controls",
];

export const App: React.FC = () => {
	const [theme, setTheme] = useState<"light" | "dark">("light");
	const [layout, setLayout] = useState<"fixed" | "stretch">("stretch");
	const [mainInstance, setMainInstance] = useState<PageFlipInstance | null>(
		null,
	);
	const mainControls = usePageFlipControls(mainInstance);
	const mainState = usePageFlipState(mainInstance);

	const toggleTheme = useCallback(() => {
		setTheme((currentTheme) => {
			const nextTheme = currentTheme === "light" ? "dark" : "light";
			document.documentElement.setAttribute("data-theme", nextTheme);
			localStorage.setItem("theme", nextTheme);
			return nextTheme;
		});
	}, []);

	useEffect(() => {
		const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
		const prefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)",
		).matches;
		const initialTheme = savedTheme ?? (prefersDark ? "dark" : "light");

		setTheme(initialTheme);
		document.documentElement.setAttribute("data-theme", initialTheme);
	}, []);

	return (
		<div className="app" data-theme={theme}>
			<header className="header">
				<h1 className="logo">PageFlip™ Playground</h1>
				<div className="header-controls">
					<select
						aria-label="Layout mode"
						className="select"
						onChange={(event) =>
							setLayout(event.target.value as "fixed" | "stretch")
						}
						value={layout}
					>
						<option value="stretch">Stretch (Responsive)</option>
						<option value="fixed">Fixed (800x600)</option>
					</select>
					<button
						aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
						className="btn btn--ghost"
						onClick={toggleTheme}
						type="button"
					>
						{theme === "light" ? "🌙" : "☀️"}
					</button>
				</div>
			</header>

			<main className="main">
				<section aria-labelledby="demo-title" className="demo-section">
					<h2 className="section-title" id="demo-title">
						Interactive Demo
					</h2>

					<div
						data-testid="pageflip-book"
						data-current-page={mainState.currentPage}
						data-total-pages={mainState.pageCount}
					>
						<div
							className="book-container"
							style={{
								height: "600px",
								maxWidth: "100%",
								width: layout === "stretch" ? "100%" : "800px",
							}}
						>
							<PageFlip
								drawShadow
								flippingTime={1000}
								height={600}
								maxShadowOpacity={0.5}
								onFlip={(event) =>
									console.log("Flipped to page", event.pageIndex)
								}
								onInit={(instance) => {
									console.log("PageFlip initialized", instance);
									setMainInstance(instance);
								}}
								ref={setMainInstance}
								showCover
								showPageCorners
								size={layout}
								width={800}
							>
								{DEMO_PAGES.map((page) => (
									<div className="page-wrapper" key={page.id}>
										{page.content}
									</div>
								))}
							</PageFlip>
						</div>
						<div className="controls-row" style={{ marginTop: "1rem" }}>
							<button
								className="btn"
								data-testid="prev-page-btn"
								disabled={mainState.currentPage === 0}
								onClick={() => void mainControls.prev()}
								type="button"
							>
								Prev
							</button>
							<span className="page-info">
								{mainState.currentPage + 1} / {Math.max(mainState.pageCount, 1)}
							</span>
							<button
								className="btn"
								data-testid="next-page-btn"
								disabled={mainState.currentPage >= mainState.pageCount - 1}
								onClick={() => void mainControls.next()}
								type="button"
							>
								Next
							</button>
						</div>
					</div>
				</section>

				<section aria-labelledby="controls-title" className="controls-section">
					<h2 className="section-title" id="controls-title">
						External Controls
					</h2>
					<ExternalControlsDemo />
				</section>

				<section aria-labelledby="features-title" className="features-section">
					<h2 className="section-title" id="features-title">
						Component Library
					</h2>
					<ComponentsDemo />
				</section>
			</main>

			<footer className="footer">
				<p>PageFlip™ v1.0.0 &copy; 2025 Ignacio Bockl</p>
				<a
					href="https://github.com/ignaciobockl/pageflip"
					rel="noreferrer noopener"
					target="_blank"
				>
					View on GitHub
				</a>
			</footer>

			<KeyboardShortcuts controls={mainControls} />
		</div>
	);
};

const ExternalControlsDemo: React.FC = () => {
	const { error, instance, loading, ref } = usePageFlip({
		height: 300,
		size: "stretch",
		showCover: false,
		width: 400,
	});
	const controls = usePageFlipControls(instance);
	const state = usePageFlipState(instance);

	return (
		<div className="external-controls">
			<div className="book-preview">
				<div className="hook-book" ref={ref}>
					<div className="page">Page 1</div>
					<div className="page">Page 2</div>
					<div className="page">Page 3</div>
				</div>
				{loading ? (
					<div className="loading-spinner">
						<LoadingSpinner size="md" />
					</div>
				) : null}
				{error ? <div className="error">Error: {error.message}</div> : null}
			</div>
			<div className="controls-panel">
				<div className="controls-row">
					<button
						className="btn"
						disabled={state.currentPage === 0}
						onClick={() => void controls.prev()}
						type="button"
					>
						← Prev
					</button>
					<span className="page-info">
						{state.currentPage + 1} / {Math.max(state.pageCount, 1)}
					</span>
					<button
						className="btn"
						disabled={state.currentPage >= state.pageCount - 1}
						onClick={() => void controls.next()}
						type="button"
					>
						Next →
					</button>
				</div>
				<div className="controls-row">
					<button
						className="btn btn--sm"
						onClick={() => void controls.goTo(0)}
						type="button"
					>
						First
					</button>
					<button
						className="btn btn--sm"
						disabled={state.pageCount === 0}
						onClick={() => void controls.goTo(Math.max(state.pageCount - 1, 0))}
						type="button"
					>
						Last
					</button>
				</div>
				<div className="state-info">
					<span>Orientation: {state.orientation}</span>
					<span>State: {state.state}</span>
				</div>
			</div>
		</div>
	);
};

const ComponentsDemo: React.FC = () => {
	const { instance, ref } = usePageFlip({
		height: 300,
		size: "stretch",
		showCover: false,
		width: 400,
	});
	const controls = usePageFlipControls(instance);
	const state = usePageFlipState(instance);
	const [zoomLevel, setZoomLevel] = useState(1);
	const [isFullscreen, setIsFullscreen] = useState(false);

	const canRenderControls = state.pageCount > 0;
	const previewStyle = useMemo(
		() => ({ transform: `scale(${zoomLevel})` }),
		[zoomLevel],
	);

	const handleZoomIn = useCallback(() => {
		setZoomLevel((currentLevel) => Math.min(currentLevel + 0.25, 2));
	}, []);

	const handleZoomOut = useCallback(() => {
		setZoomLevel((currentLevel) => Math.max(currentLevel - 0.25, 0.5));
	}, []);

	const handleResetZoom = useCallback(() => {
		setZoomLevel(1);
	}, []);

	const handleToggleFullscreen = useCallback(() => {
		setIsFullscreen((currentValue) => !currentValue);
	}, []);

	return (
		<div className="components-demo">
			<div className="component-preview-shell">
				<div className="component-preview-scale" style={previewStyle}>
					<div className="book-preview component-preview-book" ref={ref}>
						{COMPONENT_DEMO_PAGES.map((label) => (
							<div className="page" key={label}>
								<div className="page__content">
									<h2>{label}</h2>
									<p>Reusable theme components wired to a live instance.</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
			<div className="components-grid">
				<div className="component-card component-card--toolbar">
					<h3>Toolbar</h3>
					{canRenderControls ? (
						<Toolbar
							controls={controls}
							currentPage={state.currentPage}
							pageCount={state.pageCount}
							position="bottom"
						/>
					) : (
						<LoadingSpinner size="sm" />
					)}
				</div>
				<div className="component-card">
					<h3>PageIndicator</h3>
					{canRenderControls ? (
						<PageIndicator
							current={state.currentPage}
							onPageClick={(pageIndex) => void controls.goTo(pageIndex)}
							total={state.pageCount}
						/>
					) : (
						<LoadingSpinner size="sm" />
					)}
				</div>
				<div className="component-card">
					<h3>ZoomControls</h3>
					<ZoomControls
						level={zoomLevel}
						onReset={handleResetZoom}
						onZoomIn={handleZoomIn}
						onZoomOut={handleZoomOut}
					/>
				</div>
				<div className="component-card">
					<h3>FullscreenToggle</h3>
					<FullscreenToggle
						isFullscreen={isFullscreen}
						onToggle={handleToggleFullscreen}
					/>
				</div>
			</div>
		</div>
	);
};

export default App;
