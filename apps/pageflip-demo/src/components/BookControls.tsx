import type { PageFlipControls } from "@pageflip/react";
import "../styles/controls.css";

interface BookControlsProps {
	currentPage: number;
	totalPages: number;
	isFlipping: boolean;
	controls: PageFlipControls;
	onEvent?: (type: string, data: unknown) => void;
}

export default function BookControls({
	currentPage,
	totalPages,
	isFlipping,
	controls,
	onEvent,
}: BookControlsProps) {
	const isFirst = currentPage <= 0;
	const isLast = totalPages > 0 && currentPage >= totalPages - 1;
	const disabled = isFlipping || totalPages === 0;

	const goTo = (page: number) => {
		void controls.goTo(page);
		onEvent?.("goTo", { pageIndex: page });
	};

	return (
		<div className="controls" data-testid="book-controls">
			<button
				className="btn btn-secondary"
				onClick={() => {
					void controls.flipPrev();
					onEvent?.("flipPrev", {});
				}}
				disabled={isFirst || disabled}
				type="button"
				data-testid="prev-page-btn"
			>
				Anterior
			</button>
			<button
				className="btn btn-secondary"
				onClick={() => goTo(0)}
				disabled={isFirst || disabled}
				type="button"
				data-testid="first-page-btn"
			>
				Inicio
			</button>
			<span
				className="page-indicator"
				data-testid="page-info"
				data-current-page={currentPage}
				data-total-pages={totalPages}
			>
				Pagina {currentPage + 1} de {totalPages}
			</span>
			<button
				className="btn btn-secondary"
				onClick={() => goTo(Math.max(totalPages - 1, 0))}
				disabled={isLast || disabled}
				type="button"
				data-testid="last-page-btn"
			>
				Fin
			</button>
			<button
				className="btn btn-primary"
				onClick={() => {
					void controls.flipNext();
					onEvent?.("flipNext", {});
				}}
				disabled={isLast || disabled}
				type="button"
				data-testid="next-page-btn"
			>
				Siguiente
			</button>
		</div>
	);
}
