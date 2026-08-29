import type { PageFlipInstance, PageFlipPlugin } from "../types";

const plugins = new Map<string, PageFlipPlugin>();

/**
 * Plugin registry and installer.
 */
export const PluginManager = {
	/**
	 * Register a plugin globally.
	 */
	register(plugin: PageFlipPlugin): void {
		plugins.set(plugin.name, plugin);
	},

	/**
	 * Apply all registered plugins to an instance.
	 */
	async applyAll(instance: PageFlipInstance): Promise<void> {
		for (const plugin of plugins.values()) {
			await plugin.install(instance);
		}
	},

	/**
	 * Remove a plugin globally.
	 */
	unregister(name: string): void {
		plugins.delete(name);
	},
};
