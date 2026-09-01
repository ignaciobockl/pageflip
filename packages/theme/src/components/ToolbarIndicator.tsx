/**
 * ToolbarIndicator
 *
 * Default page indicator dots/numbers used by the toolbar.
 * @packageDocumentation
 */
import type { PageFlipControls } from "@pageflip/react";
import type React from "react";
import { toolbarIndicatorDotVariants } from "./toolbar.variants";

/**
 * ToolbarIndicator props
 */
export interface ToolbarIndicatorProps {
	/** PageFlip controls */
	controls: PageFlipControls;
	/** Current page index */
	currentPage: number;
	/** Total page count */
	pageCount: number;
}

/**
 * ToolbarIndicator - Default page indicator for the toolbar
 *
 * @example
 * ```tsx
 * <ToolbarIndicator controls={controls} currentPage={0} pageCount={5} />
 * ```
 */
export const ToolbarIndicator: React.FC<ToolbarIndicatorProps> = ({
	controls,
	currentPage,
	pageCount,
}) => (
	<>
		<span className="pf-toolbar__page-text">
			{currentPage + 1} / {pageCount}
		</span>
		<div className="pf-toolbar__page-dots" aria-label="Pages">
			{Array.from(
				{ length: Math.min(pageCount, 10) },
				(_, index) => index + 1,
			).map((pageNumber) => (
				<button
					key={pageNumber}
					type="button"
					onClick={() => controls.goTo(pageNumber - 1)}
					className={toolbarIndicatorDotVariants({
						state:
							pageNumber - 1 === currentPage
								? "active"
								: pageCount > 10 && pageNumber >= 9
									? "muted"
									: undefined,
					})}
					aria-label={`Go to page ${pageNumber}`}
					aria-current={pageNumber - 1 === currentPage ? "page" : undefined}
					data-testid={`page-indicator-${pageNumber - 1}`}
				/>
			))}
			{pageCount > 10 && <span className="pf-toolbar__ellipsis">...</span>}
		</div>
	</>
);
