import { defaultConfig } from "../data/samplePages";
import type { DemoConfig } from "../types";
import "../styles/config.css";

interface ConfigPanelProps {
	config: DemoConfig;
	onChange: (patch: Partial<DemoConfig>) => void;
}

export default function ConfigPanel({ config, onChange }: ConfigPanelProps) {
	const patch = (key: keyof DemoConfig, value: unknown) => {
		onChange({ [key]: value });
	};

	return (
		<div className="config-panel">
			<h3>Configuracion del Libro</h3>
			<div className="config-row">
				<label htmlFor="cfg-width">Ancho (px):</label>
				<input
					id="cfg-width"
					type="number"
					value={config.width}
					onChange={(e) => patch("width", Number(e.target.value))}
					min={200}
					max={4000}
				/>
			</div>
			<div className="config-row">
				<label htmlFor="cfg-height">Alto (px):</label>
				<input
					id="cfg-height"
					type="number"
					value={config.height}
					onChange={(e) => patch("height", Number(e.target.value))}
					min={200}
					max={4000}
				/>
			</div>
			<div className="config-row">
				<label htmlFor="cfg-showcover">showCover:</label>
				<label className="toggle">
					<input
						id="cfg-showcover"
						type="checkbox"
						checked={config.showCover}
						onChange={(e) => patch("showCover", e.target.checked)}
					/>
					<span className="slider" />
				</label>
			</div>
			<div className="config-row">
				<label htmlFor="cfg-size">size:</label>
				<select
					id="cfg-size"
					value={config.size}
					onChange={(e) => patch("size", e.target.value)}
				>
					<option value="fixed">fixed</option>
					<option value="stretch">stretch</option>
				</select>
			</div>
			<div className="config-row">
				<label htmlFor="cfg-flippingtime">flippingTime (ms):</label>
				<input
					id="cfg-flippingtime"
					type="range"
					value={config.flippingTime}
					onChange={(e) => patch("flippingTime", Number(e.target.value))}
					min={200}
					max={3000}
					step={100}
				/>
				<span>{config.flippingTime}</span>
			</div>
			<div className="config-row">
				<label htmlFor="cfg-drawshadow">drawShadow:</label>
				<label className="toggle">
					<input
						id="cfg-drawshadow"
						type="checkbox"
						checked={config.drawShadow}
						onChange={(e) => patch("drawShadow", e.target.checked)}
					/>
					<span className="slider" />
				</label>
			</div>
			<div className="config-row">
				<label htmlFor="cfg-maxshadow">maxShadowOpacity:</label>
				<input
					id="cfg-maxshadow"
					type="range"
					value={config.maxShadowOpacity}
					onChange={(e) => patch("maxShadowOpacity", Number(e.target.value))}
					min={0}
					max={1}
					step={0.1}
				/>
				<span>{config.maxShadowOpacity}</span>
			</div>
			<div className="config-row">
				<label htmlFor="cfg-useportrait">usePortrait:</label>
				<label className="toggle">
					<input
						id="cfg-useportrait"
						type="checkbox"
						checked={config.usePortrait}
						onChange={(e) => patch("usePortrait", e.target.checked)}
					/>
					<span className="slider" />
				</label>
			</div>
			<div className="config-row">
				<label htmlFor="cfg-disableclick">disableFlipByClick:</label>
				<label className="toggle">
					<input
						id="cfg-disableclick"
						type="checkbox"
						checked={config.disableFlipByClick}
						onChange={(e) => patch("disableFlipByClick", e.target.checked)}
					/>
					<span className="slider" />
				</label>
			</div>
			<div className="config-row">
				<label htmlFor="cfg-showcorners">showPageCorners:</label>
				<label className="toggle">
					<input
						id="cfg-showcorners"
						type="checkbox"
						checked={config.showPageCorners}
						onChange={(e) => patch("showPageCorners", e.target.checked)}
					/>
					<span className="slider" />
				</label>
			</div>
			<div className="config-row">
				<label htmlFor="cfg-renderer">renderer:</label>
				<select
					id="cfg-renderer"
					value={config.renderer}
					onChange={(e) => patch("renderer", e.target.value)}
				>
					<option value="canvas2d">canvas2d</option>
					<option value="webgl">webgl</option>
				</select>
			</div>
			<div className="config-row">
				<button
					className="btn btn-secondary"
					onClick={() => onChange(defaultConfig)}
					type="button"
				>
					Restaurar Defaults
				</button>
			</div>
		</div>
	);
}
