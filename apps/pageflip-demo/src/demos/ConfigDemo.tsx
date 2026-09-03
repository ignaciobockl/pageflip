import {
	usePageFlip,
	usePageFlipControls,
	usePageFlipState,
} from "@pageflip/react";
import { useEffect, useState } from "react";
import BookControls from "../components/BookControls";
import ConfigPanel from "../components/ConfigPanel";
import { defaultConfig } from "../data/samplePages";
import type { DemoConfig, DemoEvent } from "../types";

interface ConfigDemoProps {
	onEvent: DemoEvent;
}

export default function ConfigDemo({ onEvent }: ConfigDemoProps) {
	const [config, setConfig] = useState<DemoConfig>(defaultConfig);

	const { instance, ref } = usePageFlip({
		...config,
		onFlip: (e) => onEvent("onFlip", { pageIndex: e.pageIndex }),
	});
	const controls = usePageFlipControls(instance);
	const state = usePageFlipState(instance);

	useEffect(() => {
		instance?.updateConfig(config);
		onEvent("configChange", config);
	}, [instance, config, onEvent]);

	const handleConfigChange = (patch: Partial<DemoConfig>) => {
		setConfig((previous) => ({ ...previous, ...patch }));
	};

	return (
		<div className="book-container">
			<div
				style={{
					display: "flex",
					gap: "20px",
					flexWrap: "wrap",
					justifyContent: "center",
				}}
			>
				<div className="book-wrapper">
					<div ref={ref} style={{ width: config.width, height: config.height }}>
						<div className="page page-cover">
							<div>
								<h1>Configuracion</h1>
								<p>Cambia las opciones en vivo</p>
							</div>
						</div>
						<div className="page page-content">
							<div>
								<h2>Pagina 1</h2>
								<p>Modifica el panel de configuracion.</p>
							</div>
						</div>
						<div className="page page-content">
							<div>
								<h2>Pagina 2</h2>
								<p>Propiedades se actualizan en tiempo real.</p>
							</div>
						</div>
						<div className="page page-content">
							<div>
								<h2>Pagina 3</h2>
								<p>flippingTime controla la velocidad del giro.</p>
							</div>
						</div>
						<div className="page page-back">
							<div>
								<h1>Fin Config</h1>
								<p>Configuracion en vivo</p>
							</div>
						</div>
					</div>
				</div>
				<ConfigPanel config={config} onChange={handleConfigChange} />
			</div>
			<BookControls
				currentPage={state.currentPage}
				totalPages={state.pageCount}
				isFlipping={state.isFlipping}
				controls={controls}
				onEvent={onEvent}
			/>
		</div>
	);
}
