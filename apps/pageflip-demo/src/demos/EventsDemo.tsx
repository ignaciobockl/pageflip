import {
	usePageFlip,
	usePageFlipControls,
	usePageFlipEvents,
	usePageFlipState,
} from "@pageflip/react";
import { useRef, useState } from "react";
import BookControls from "../components/BookControls";
import EventLog from "../components/EventLog";
import type { DemoConfig, EventLogEntry } from "../types";

interface EventsDemoProps {
	config: DemoConfig;
}

export default function EventsDemo({ config }: EventsDemoProps) {
	const [events, setEvents] = useState<EventLogEntry[]>([]);
	const idCounter = useRef(0);

	const addEvent = (type: string, data: unknown) => {
		idCounter.current += 1;
		setEvents((previous) => [
			...previous.slice(-49),
			{ id: idCounter.current, type, data, timestamp: new Date() },
		]);
	};

	const { instance, ref } = usePageFlip({
		...config,
		onInit: () => addEvent("onInit", { timestamp: Date.now() }),
	});
	const controls = usePageFlipControls(instance);
	const state = usePageFlipState(instance);

	usePageFlipEvents(instance, {
		onFlip: (e) => addEvent("onFlip", { pageIndex: e.pageIndex }),
		onChangeState: (e) => addEvent("onChangeState", { state: e.state }),
		onChangeOrientation: (e) =>
			addEvent("onChangeOrientation", { orientation: e.orientation }),
		onUpdate: () => addEvent("onUpdate", { timestamp: Date.now() }),
		onError: (error) => addEvent("onError", { message: error.message }),
	});

	return (
		<div className="book-container">
			<div className="book-wrapper">
				<div ref={ref}>
					<div className="page page-cover">
						<div>
							<h1>Eventos</h1>
							<p>Interactua para ver los eventos</p>
						</div>
					</div>
					<div className="page page-content">
						<div>
							<h2>Pagina 1</h2>
							<p>Haz clic en las esquinas o usa los botones.</p>
						</div>
					</div>
					<div className="page page-content">
						<div>
							<h2>Pagina 2</h2>
							<p>Los eventos: onFlip, onChangeState, onChangeOrientation.</p>
						</div>
					</div>
					<div className="page page-content">
						<div>
							<h2>Pagina 3</h2>
							<p>Limpiar el log con el boton Limpiar.</p>
						</div>
					</div>
					<div className="page page-back">
						<div>
							<h1>Fin Eventos</h1>
							<p>Revisa el log de eventos</p>
						</div>
					</div>
				</div>
			</div>
			<BookControls
				currentPage={state.currentPage}
				totalPages={state.pageCount}
				isFlipping={state.isFlipping}
				controls={controls}
			/>
			<EventLog events={events} onClear={() => setEvents([])} />
		</div>
	);
}
