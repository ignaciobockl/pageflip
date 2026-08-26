/**
 * Keyboard Handler
 *
 * Handles keyboard events for page flip navigation and shortcuts.
 * Supports accessibility requirements (WCAG 2.1 AA).
 * @packageDocumentation
 */
import { KEYBOARD_SHORTCUTS } from "../constants";

/**
 * Keyboard handler configuration
 */
export interface KeyboardHandlerConfig {
	/** Enable keyboard navigation */
	enableNavigation: boolean;
	/** Enable zoom shortcuts */
	enableZoom: boolean;
	/** Enable fullscreen toggle */
	enableFullscreen: boolean;
	/** Enable first/last page shortcuts */
	enableFirstLast: boolean;
	/** Custom key mappings (overrides defaults) */
	customKeys?: Partial<Record<string, string[]>>;
}

/**
 * Keyboard action types
 */
export type KeyboardAction =
	| "next"
	| "prev"
	| "first"
	| "last"
	| "zoomIn"
	| "zoomOut"
	| "zoomReset"
	| "fullscreen"
	| "none";

/**
 * Keyboard handler result
 */
export interface KeyboardHandlerResult {
	/** Whether key was handled */
	handled: boolean;
	/** Action triggered */
	action: KeyboardAction;
	/** Original key pressed */
	key: string;
	/** Whether modifier keys were pressed */
	ctrlKey: boolean;
	shiftKey: boolean;
	altKey: boolean;
	metaKey: boolean;
}

/**
 * KeyboardHandler - Pure keyboard event handling
 *
 * No side effects, fully testable, WCAG 2.1 AA compliant.
 */
export class KeyboardHandler {
	private config: KeyboardHandlerConfig;
	private keyMap: Map<string, KeyboardAction>;

	/**
	 * Create keyboard handler
	 * @param config - Handler configuration
	 */
	constructor(config: Partial<KeyboardHandlerConfig> = {}) {
		this.config = {
			enableNavigation: true,
			enableZoom: true,
			enableFullscreen: true,
			enableFirstLast: true,
			...config,
		};

		this.keyMap = this.buildKeyMap();
	}

	/**
	 * Build key map from config and defaults
	 * @private
	 */
	private buildKeyMap(): Map<string, KeyboardAction> {
		const map = new Map<string, KeyboardAction>();

		if (this.config.enableNavigation) {
			for (const key of KEYBOARD_SHORTCUTS.NEXT) {
				map.set(key.toLowerCase(), "next");
			}

			for (const key of KEYBOARD_SHORTCUTS.PREV) {
				map.set(key.toLowerCase(), "prev");
			}
		}

		if (this.config.enableFirstLast) {
			for (const key of KEYBOARD_SHORTCUTS.FIRST) {
				map.set(key.toLowerCase(), "first");
			}

			for (const key of KEYBOARD_SHORTCUTS.LAST) {
				map.set(key.toLowerCase(), "last");
			}
		}

		if (this.config.enableZoom) {
			for (const key of KEYBOARD_SHORTCUTS.ZOOM_IN) {
				map.set(key.toLowerCase(), "zoomIn");
			}

			for (const key of KEYBOARD_SHORTCUTS.ZOOM_OUT) {
				map.set(key.toLowerCase(), "zoomOut");
			}

			for (const key of KEYBOARD_SHORTCUTS.ZOOM_RESET) {
				map.set(key.toLowerCase(), "zoomReset");
			}
		}

		if (this.config.enableFullscreen) {
			for (const key of KEYBOARD_SHORTCUTS.FULLSCREEN) {
				map.set(key.toLowerCase(), "fullscreen");
			}
		}

		if (this.config.customKeys) {
			for (const [key, actions] of Object.entries(this.config.customKeys)) {
				for (const action of actions ?? []) {
					map.set(key.toLowerCase(), action as KeyboardAction);
				}
			}
		}

		return map;
	}

	/**
	 * Update handler configuration
	 * @param config - New configuration
	 */
	setConfig(config: Partial<KeyboardHandlerConfig>): void {
		this.config = { ...this.config, ...config };
		this.keyMap = this.buildKeyMap();
	}

	/**
	 * Handle keydown event
	 *
	 * @param event - Keyboard event
	 * @returns Handler result
	 */
	onKeyDown(event: KeyboardEvent): KeyboardHandlerResult {
		const key = event.key.toLowerCase();
		const action = this.keyMap.get(key) ?? "none";

		const result: KeyboardHandlerResult = {
			handled: action !== "none",
			action,
			key: event.key,
			ctrlKey: event.ctrlKey,
			shiftKey: event.shiftKey,
			altKey: event.altKey,
			metaKey: event.metaKey,
		};

		if (result.handled) {
			event.preventDefault();
		}

		return result;
	}

	/**
	 * Check if key triggers an action
	 *
	 * @param key - Key to check
	 * @returns Action or 'none'
	 */
	getActionForKey(key: string): KeyboardAction {
		return this.keyMap.get(key.toLowerCase()) ?? "none";
	}

	/**
	 * Get all registered shortcuts
	 *
	 * @returns Map of key -> action
	 */
	getShortcuts(): Map<string, KeyboardAction> {
		return new Map(this.keyMap);
	}

	/**
	 * Enable/disable navigation shortcuts
	 * @param enable - Whether to enable
	 */
	setNavigationEnabled(enable: boolean): void {
		this.config.enableNavigation = enable;
		this.keyMap = this.buildKeyMap();
	}

	/**
	 * Enable/disable zoom shortcuts
	 * @param enable - Whether to enable
	 */
	setZoomEnabled(enable: boolean): void {
		this.config.enableZoom = enable;
		this.keyMap = this.buildKeyMap();
	}

	/**
	 * Enable/disable fullscreen shortcut
	 * @param enable - Whether to enable
	 */
	setFullscreenEnabled(enable: boolean): void {
		this.config.enableFullscreen = enable;
		this.keyMap = this.buildKeyMap();
	}

	/**
	 * Add custom key mapping
	 *
	 * @param key - Key (e.g., 'n', 'ArrowUp')
	 * @param action - Action to trigger
	 */
	addCustomKey(key: string, action: KeyboardAction): void {
		this.keyMap.set(key.toLowerCase(), action);
	}

	/**
	 * Remove custom key mapping
	 *
	 * @param key - Key to remove
	 */
	removeCustomKey(key: string): void {
		this.keyMap.delete(key.toLowerCase());
	}

	/**
	 * Reset to default key mappings
	 */
	resetToDefaults(): void {
		this.config.customKeys = undefined;
		this.keyMap = this.buildKeyMap();
	}
}
