import { useState } from "react";
import type { JSX } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { defaultConfig } from "./data/samplePages";
import BasicDemo from "./demos/BasicDemo";
import ConfigDemo from "./demos/ConfigDemo";
import EventsDemo from "./demos/EventsDemo";
import HooksDemo from "./demos/HooksDemo";
import ImagesDemo from "./demos/ImagesDemo";
import ThemeDemo from "./demos/ThemeDemo";
import type { DemoEvent, DemoType } from "./types";
import "./App.css";
import "./styles/book.css";
import "./styles/controls.css";
import "./styles/config.css";
import "./styles/events.css";
import "./styles/tabs.css";

const config = defaultConfig;

const onEvent: DemoEvent = (type, data) => {
	console.debug("[pageflip-demo]", type, data);
};

function App(): JSX.Element {
	const [activeDemo, setActiveDemo] = useState<DemoType>("basic");

	const demos: { id: DemoType; label: string; component: JSX.Element }[] = [
		{
			id: "basic",
			label: "Basico",
			component: <BasicDemo config={config} onEvent={onEvent} />,
		},
		{
			id: "images",
			label: "Imagenes",
			component: <ImagesDemo config={config} onEvent={onEvent} />,
		},
		{
			id: "config",
			label: "Configuracion",
			component: <ConfigDemo onEvent={onEvent} />,
		},
		{
			id: "events",
			label: "Eventos",
			component: <EventsDemo config={config} />,
		},
		{
			id: "hooks",
			label: "Hooks",
			component: <HooksDemo config={config} onEvent={onEvent} />,
		},
		{ id: "theme", label: "Theme", component: <ThemeDemo config={config} /> },
	];

	const activeDemoData = demos.find((demo) => demo.id === activeDemo);

	return (
		<div className="app">
			<header className="app-header">
				<h1>PageFlip - Demo Completa</h1>
				<p>Todas las funcionalidades de @pageflip/react</p>
			</header>

			<nav className="tabs" role="tablist" aria-label="Demos">
				{demos.map((demo) => (
					<button
						key={demo.id}
						className={`tab ${activeDemo === demo.id ? "active" : ""}`}
						onClick={() => setActiveDemo(demo.id)}
						type="button"
						role="tab"
						aria-selected={activeDemo === demo.id}
						data-testid={`tab-${demo.id}`}
					>
						{demo.label}
					</button>
				))}
			</nav>

			<main className="app-main">
				<ErrorBoundary>
					<div data-testid="demo-content">{activeDemoData?.component}</div>
				</ErrorBoundary>
			</main>

			<footer className="app-footer">
				<p>PageFlip v0.1.1 | React 18 | TypeScript | Vite | Bun</p>
			</footer>
		</div>
	);
}

export default App;
