import {
	usePageFlip,
	usePageFlipControls,
	usePageFlipState,
} from "@pageflip/react";
import BookControls from "../components/BookControls";
import type { DemoConfig, DemoEvent } from "../types";

interface BasicDemoProps {
	config: DemoConfig;
	onEvent: DemoEvent;
}

export default function BasicDemo({ config, onEvent }: BasicDemoProps) {
	const { instance, ref } = usePageFlip({
		...config,
		onFlip: (e) => onEvent("onFlip", { pageIndex: e.pageIndex }),
		onInit: () => onEvent("onInit", { timestamp: Date.now() }),
	});
	const controls = usePageFlipControls(instance);
	const state = usePageFlipState(instance);

	return (
		<div className="book-container">
			<div className="book-wrapper">
				<div ref={ref}>
					<div className="page page-cover">
						<div>
							<h1>Mi Libro</h1>
							<p>PageFlip Demo</p>
						</div>
					</div>
					<div className="page page-content">
						<div>
							<h2>Capitulo 1</h2>
							<p>Primera pagina con efecto de giro inmersivo.</p>
						</div>
					</div>
					<div className="page page-content">
						<div>
							<h2>Capitulo 2</h2>
							<p>Configuraciones ajustables en tiempo real.</p>
						</div>
					</div>
					<div className="page page-content">
						<div>
							<h2>Capitulo 3</h2>
							<p>Sombras, velocidad y comportamiento personalizables.</p>
						</div>
					</div>
					<div className="page page-content">
						<div>
							<h2>Capitulo 4</h2>
							<p>Ultimo capitulo del libro de demostracion.</p>
						</div>
					</div>
					<div className="page page-back">
						<div>
							<h1>Fin</h1>
							<p>PageFlip Demo</p>
						</div>
					</div>
				</div>
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
