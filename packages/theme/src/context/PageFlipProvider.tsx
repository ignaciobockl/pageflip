import type {
	PageFlipControls,
	PageFlipInstance,
	PageFlipState,
} from "@pageflip/react";
/**
 * PageFlip Context Provider
 *
 * Provides PageFlip instance and controls to nested components.
 * @packageDocumentation
 */
import type React from "react";
import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from "react";

/**
 * Context value type
 */
export interface PageFlipContextValue {
	/** PageFlip instance */
	instance: PageFlipInstance | null;
	/** Navigation controls */
	controls: PageFlipControls | null;
	/** Reactive state */
	state: PageFlipState | null;
	/** Register child component */
	registerChild: (id: string, child: ReactNode) => void;
	/** Unregister child component */
	unregisterChild: (id: string) => void;
}

/**
 * PageFlip context (internal)
 */
const PageFlipContext = createContext<PageFlipContextValue | null>(null);

/**
 * PageFlipProvider props
 */
export interface PageFlipProviderProps {
	/** PageFlip instance */
	instance: PageFlipInstance | null;
	/** Children components */
	children: ReactNode;
}

/**
 * PageFlipProvider - Context provider for PageFlip instance and controls
 *
 * @example
 * ```tsx
 * const { instance, ref } = usePageFlip({ width: 800, height: 600 });
 *
 * return (
 *   <PageFlipProvider instance={instance}>
 *     <Toolbar controls={controls} currentPage={state.currentPage} pageCount={state.pageCount} />
 *     <div ref={ref} />
 *   </PageFlipProvider>
 * );
 * ```
 */
export const PageFlipProvider: React.FC<PageFlipProviderProps> = ({
	instance,
	children,
}) => {
	const controlsRef = useRef<PageFlipControls | null>(null);
	const stateRef = useRef<PageFlipState | null>(null);
	const childrenRef = useRef<Map<string, ReactNode>>(new Map());

	// Subscribe to instance events
	useEffect(() => {
		if (!instance) {
			controlsRef.current = null;
			stateRef.current = null;
			return;
		}

		// Update controls
		controlsRef.current = {
			next: () => instance.flipNext(),
			prev: () => instance.flipPrev(),
			goTo: (page: number) => instance.turnToPage(page),
			flipTo: (page: number, corner?: "top" | "bottom") =>
				instance.flip(page, corner),
			getCurrentPage: () => instance.currentPageIndex,
			getPageCount: () => instance.pageCount,
			getOrientation: () => instance.orientation,
			getState: () => instance.state,
		};

		// Update state
		const updateState = () => {
			stateRef.current = {
				currentPage: instance.currentPageIndex,
				pageCount: instance.pageCount,
				orientation: instance.orientation,
				state: instance.state,
				isFlipping: instance.state === "flipping",
				bounds: instance.bounds,
			};
		};

		updateState();

		const handleFlip = () => updateState();
		const handleStateChange = (
			_event: CustomEvent<import("@pageflip/react").StateChangeEvent>,
		) => updateState();
		const handleOrientationChange = (
			_event: CustomEvent<import("@pageflip/react").OrientationChangeEvent>,
		) => updateState();
		const handleUpdate = () => updateState();

		instance.addEventListener("flip", handleFlip as EventListener);
		instance.addEventListener(
			"statechange",
			handleStateChange as EventListener,
		);
		instance.addEventListener(
			"orientationchange",
			handleOrientationChange as EventListener,
		);
		instance.addEventListener("update", handleUpdate as EventListener);

		return () => {
			instance.removeEventListener("flip", handleFlip as EventListener);
			instance.removeEventListener(
				"statechange",
				handleStateChange as EventListener,
			);
			instance.removeEventListener(
				"orientationchange",
				handleOrientationChange as EventListener,
			);
			instance.removeEventListener("update", handleUpdate as EventListener);
		};
	}, [instance]);

	const value = useMemo<PageFlipContextValue>(
		() => ({
			instance,
			controls: controlsRef.current,
			state: stateRef.current,
			registerChild: (id: string, child: ReactNode) => {
				childrenRef.current.set(id, child);
			},
			unregisterChild: (id: string) => {
				childrenRef.current.delete(id);
			},
		}),
		[instance],
	);

	return (
		<PageFlipContext.Provider value={value}>
			{children}
		</PageFlipContext.Provider>
	);
};

/**
 * usePageFlipContext - Access PageFlip context
 *
 * @throws Error if used outside PageFlipProvider
 */
export const usePageFlipContext = (): PageFlipContextValue => {
	const context = useContext(PageFlipContext);
	if (!context) {
		throw new Error(
			"usePageFlipContext must be used within a PageFlipProvider",
		);
	}
	return context;
};

/**
 * usePageFlipInstance - Get PageFlip instance from context
 */
export const usePageFlipInstance = (): PageFlipInstance | null => {
	return usePageFlipContext().instance;
};

/**
 * usePageFlipControls - Get navigation controls from context
 */
export const usePageFlipControls = (): PageFlipControls | null => {
	return usePageFlipContext().controls;
};

/**
 * usePageFlipState - Get reactive state from context
 */
export const usePageFlipState = (): PageFlipState | null => {
	return usePageFlipContext().state;
};
