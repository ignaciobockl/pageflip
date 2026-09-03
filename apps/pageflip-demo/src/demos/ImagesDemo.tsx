import {
	usePageFlip,
	usePageFlipControls,
	usePageFlipState,
} from "@pageflip/react";
import BookControls from "../components/BookControls";
import { sampleImages } from "../data/samplePages";
import type { DemoConfig, DemoEvent } from "../types";

interface ImagesDemoProps {
	config: DemoConfig;
	onEvent: DemoEvent;
}

export default function ImagesDemo({ config, onEvent }: ImagesDemoProps) {
	const { instance, ref } = usePageFlip({
		...config,
		images: sampleImages,
		onFlip: (e) => onEvent("onFlip", { pageIndex: e.pageIndex }),
	});
	const controls = usePageFlipControls(instance);
	const state = usePageFlipState(instance);

	return (
		<div className="book-container">
			<div className="book-wrapper">
				<div ref={ref} />
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
