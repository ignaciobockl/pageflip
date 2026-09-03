import type { EventLogEntry } from "../types";
import "../styles/events.css";

interface EventLogProps {
	events: EventLogEntry[];
	onClear: () => void;
}

export default function EventLog({ events, onClear }: EventLogProps) {
	return (
		<div className="event-log" data-testid="event-log">
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<h3>Event Log</h3>
				<button
					className="btn btn-secondary"
					onClick={onClear}
					style={{ padding: "5px 10px", fontSize: "12px" }}
					type="button"
				>
					Limpiar
				</button>
			</div>
			{events.length === 0 ? (
				<div style={{ color: "#808080", textAlign: "center", padding: "20px" }}>
					No hay eventos. Interactua con el libro para verlos.
				</div>
			) : (
				events.map((event) => (
					<div key={event.id} className="event-entry">
						<div>
							<span className="event-type">{event.type}</span>
							<span className="event-time">
								{" "}
								- {event.timestamp.toLocaleTimeString()}
							</span>
						</div>
						<div className="event-data">
							{JSON.stringify(event.data, null, 2)}
						</div>
					</div>
				))
			)}
		</div>
	);
}
