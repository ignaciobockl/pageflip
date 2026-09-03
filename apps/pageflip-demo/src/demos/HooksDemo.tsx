import {
	usePageFlip,
	usePageFlipControls,
	usePageFlipEvents,
	usePageFlipState,
} from "@pageflip/react";
import { useState } from "react";
import BookControls from "../components/BookControls";
import type { DemoConfig, DemoEvent } from "../types";

interface HooksDemoProps {
	config: DemoConfig;
	onEvent: DemoEvent;
}

export default function HooksDemo({ config, onEvent }: HooksDemoProps) {
	const [showBook, setShowBook] = useState(false);

	return (
		<div className="book-container">
			<div style={{ marginBottom: "20px", textAlign: "center" }}>
				<p style={{ marginBottom: "10px", color: "#666" }}>
					Esta demo usa directamente los hooks de PageFlip.
				</p>
				<button
					className="btn btn-primary"
					onClick={() => setShowBook((current) => !current)}
					type="button"
					data-testid="toggle-hooks-book"
				>
					{showBook ? "Ocultar Libro" : "Mostrar Libro"}
				</button>
			</div>
			{showBook ? <HooksBook config={config} onEvent={onEvent} /> : null}
		</div>
	);
}

function HooksBook({
	config,
	onEvent,
}: {
	config: DemoConfig;
	onEvent: DemoEvent;
}) {
	const { instance, ref, loading, error } = usePageFlip({
		...config,
		onFlip: (e) => onEvent("usePageFlip.onFlip", { pageIndex: e.pageIndex }),
	});
	const controls = usePageFlipControls(instance);
	const state = usePageFlipState(instance);

	usePageFlipEvents(instance, {
		onChangeState: (e) =>
			onEvent("usePageFlipEvents.onChangeState", { state: e.state }),
	});

	return (
		<>
			<div className="book-wrapper">
				<div ref={ref}>
					<div className="page page-cover">
						<div>
							<h1>Hooks</h1>
							<p>usePageFlip, usePageFlipControls, usePageFlipState</p>
						</div>
					</div>
					<div className="page page-content">
						<div>
							<h2>usePageFlipControls</h2>
							<p>next, prev, goTo, flipNext, flipPrev, getPageCount.</p>
						</div>
					</div>
					<div className="page page-content">
						<div>
							<h2>usePageFlipState</h2>
							<p>currentPage, pageCount, orientation, state, isFlipping.</p>
						</div>
					</div>
					<div className="page page-back">
						<div>
							<h1>Fin Hooks</h1>
							<p>Hooks de PageFlip</p>
						</div>
					</div>
				</div>
				{loading ? <span data-testid="hooks-loading">Cargando...</span> : null}
				{error ? (
					<span data-testid="hooks-error">Error: {error.message}</span>
				) : null}
			</div>
			<div style={{ margin: "10px 0", textAlign: "center", color: "#555" }}>
				<code>
					usePageFlipState → pageCount={state.pageCount}, isFlipping=
					{String(state.isFlipping)}, orientation={state.orientation}
				</code>
			</div>
			<BookControls
				currentPage={state.currentPage}
				totalPages={state.pageCount}
				isFlipping={state.isFlipping}
				controls={controls}
				onEvent={onEvent}
			/>
		</>
	);
}
