import type {
	OrientationChangeEvent,
	PageFlipInstance,
	StateChangeEvent,
} from "@pageflip/core";
import type { PageFlipControls, PageFlipState } from "@pageflip/react";
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
	useState,
} from "react";

type EventfulPageFlipInstance = PageFlipInstance & EventTarget;

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
 */
export const PageFlipProvider: React.FC<PageFlipProviderProps> = ({
	instance,
	children,
}) => {
	const [controls, setControls] = useState<PageFlipControls | null>(null);
	const [state, setState] = useState<PageFlipState | null>(null);
	const childrenRef = useRef<Map<string, ReactNode>>(new Map());

	// Subscribe to instance events
	useEffect(() => {
		if (!instance) {
			setControls(null);
			setState(null);
			return;
		}

		const eventfulInstance = instance as EventfulPageFlipInstance;

		const nextControls: PageFlipControls = {
			next: () => instance.flipNext(),
			prev: () => instance.flipPrev(),
			flipNext: (corner?: "top" | "bottom") => instance.flipNext(corner),
			flipPrev: (corner?: "top" | "bottom") => instance.flipPrev(corner),
			goTo: (page: number) => instance.turnToPage(page),
			flipTo: (page: number, corner?: "top" | "bottom") =>
				instance.flip(page, corner),
			getCurrentPage: () => instance.currentPageIndex,
			getPageCount: () => instance.pageCount,
			getOrientation: () => instance.orientation,
			getState: () => instance.state,
		};

		setControls(nextControls);

		const updateState = () => {
			setState({
				currentPage: instance.currentPageIndex,
				pageCount: instance.pageCount,
				orientation: instance.orientation,
				state: instance.state,
				isFlipping: instance.state === "flipping",
				bounds: instance.bounds,
			});
		};

		updateState();

		const handleFlip = () => updateState();
		const handleStateChange = (_event: CustomEvent<StateChangeEvent>) =>
			updateState();
		const handleOrientationChange = (
			_event: CustomEvent<OrientationChangeEvent>,
		) => updateState();
		const handleUpdate = () => updateState();

		eventfulInstance.addEventListener("flip", handleFlip as EventListener);
		eventfulInstance.addEventListener(
			"statechange",
			handleStateChange as EventListener,
		);
		eventfulInstance.addEventListener(
			"orientationchange",
			handleOrientationChange as EventListener,
		);
		eventfulInstance.addEventListener("update", handleUpdate as EventListener);

		return () => {
			eventfulInstance.removeEventListener("flip", handleFlip as EventListener);
			eventfulInstance.removeEventListener(
				"statechange",
				handleStateChange as EventListener,
			);
			eventfulInstance.removeEventListener(
				"orientationchange",
				handleOrientationChange as EventListener,
			);
			eventfulInstance.removeEventListener(
				"update",
				handleUpdate as EventListener,
			);
		};
	}, [instance]);

	const value = useMemo<PageFlipContextValue>(
		() => ({
			instance,
			controls,
			state,
			registerChild: (id: string, child: ReactNode) => {
				childrenRef.current.set(id, child);
			},
			unregisterChild: (id: string) => {
				childrenRef.current.delete(id);
			},
		}),
		[controls, instance, state],
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
