import {
	usePageFlip,
	usePageFlipControls,
	usePageFlipState,
} from "@pageflip/react";
import {
	FullscreenToggle,
	KeyboardShortcuts,
	LoadingSpinner,
	PageFlipProvider,
	PageIndicator,
	Toolbar,
	ZoomControls,
} from "@pageflip/theme";
import { useState } from "react";
import type { DemoConfig } from "../types";

interface ThemeDemoProps {
	config: DemoConfig;
}

export default function ThemeDemo({ config }: ThemeDemoProps) {
	const { instance, ref, loading } = usePageFlip({ ...config });
	const controls = usePageFlipControls(instance);
	const state = usePageFlipState(instance);

	const [zoomLevel, setZoomLevel] = useState(1);
	const [isFullscreen, setIsFullscreen] = useState(false);

	const ready = state.pageCount > 0 || loading;

	return (
		<div className="book-container" data-testid="theme-demo">
			{loading ? (
				<div data-testid="theme-loading">
					<LoadingSpinner size="lg" />
				</div>
			) : null}

			<div className="book-wrapper">
				<div ref={ref}>
					<div className="page page-cover">
						<div>
							<h1>Theme</h1>
							<p>Componentes de @pageflip/theme</p>
						</div>
					</div>
					<div className="page page-content">
						<div>
							<h2>Toolbar</h2>
							<p>Barra de navegacion completa.</p>
						</div>
					</div>
					<div className="page page-content">
						<div>
							<h2>PageIndicator</h2>
							<p>Dots o select para saltar de pagina.</p>
						</div>
					</div>
					<div className="page page-back">
						<div>
							<h1>Fin Theme</h1>
							<p>Theme de PageFlip</p>
						</div>
					</div>
				</div>
			</div>

			<PageFlipProvider instance={instance}>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "16px",
						alignItems: "center",
					}}
				>
					{ready ? (
						<Toolbar
							controls={controls}
							currentPage={state.currentPage}
							pageCount={state.pageCount}
							position="bottom"
						/>
					) : null}
					{ready ? (
						<PageIndicator
							current={state.currentPage}
							total={state.pageCount}
							onPageClick={(pageIndex) => void controls.goTo(pageIndex)}
						/>
					) : null}
					<div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
						<ZoomControls
							level={zoomLevel}
							onZoomIn={() =>
								setZoomLevel((current) => Math.min(current + 0.25, 5))
							}
							onZoomOut={() =>
								setZoomLevel((current) => Math.max(current - 0.25, 0.25))
							}
							onReset={() => setZoomLevel(1)}
						/>
						<FullscreenToggle
							isFullscreen={isFullscreen}
							onToggle={() => setIsFullscreen((current) => !current)}
						/>
					</div>
					<KeyboardShortcuts controls={controls} />
				</div>
			</PageFlipProvider>
		</div>
	);
}
