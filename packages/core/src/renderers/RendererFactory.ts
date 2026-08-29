/**
 * Renderer Factory
 *
 * Creates and manages renderer instances with fallback support.
 * @packageDocumentation
 */
import type {
	IRenderer,
	RendererCapabilities,
	RendererOptions,
} from "../types";
import { Canvas2DRenderer } from "./Canvas2DRenderer";

/**
 * Renderer loader function
 */
type RendererLoader = () => Promise<IRenderer>;

const loaders: Map<string, RendererLoader> = new Map();
const instances: Map<string, IRenderer> = new Map();
const capabilitiesCache: Map<string, RendererCapabilities> = new Map();

/**
 * RendererFactory - Creates renderers with capability detection
 */
export const RendererFactory = {
	/**
	 * Register a renderer loader
	 * @param name - Renderer name
	 * @param loader - Async function that returns renderer instance
	 */
	register(name: string, loader: RendererLoader): void {
		if (loaders.has(name)) {
			throw new Error(`Renderer ${name} already registered`);
		}
		loaders.set(name, loader);
	},

	/**
	 * Create renderer instance
	 *
	 * @param preferred - Preferred renderer ('auto' | 'canvas2d' | 'webgl' | 'webgpu')
	 * @param canvas - Canvas element
	 * @param options - Renderer options
	 * @returns Initialized renderer instance
	 */
	create: async (
		preferred: "auto" | "canvas2d" | "webgl" | "webgpu" | undefined,
		canvas: HTMLCanvasElement,
		options: RendererOptions = {},
	): Promise<IRenderer> => {
		const candidates = getCandidates(preferred ?? "auto");

		for (const name of candidates) {
			try {
				const renderer = await loadRenderer(name);
				await renderer.init(canvas, options);
				return renderer;
			} catch (error) {
				console.warn(
					`[RendererFactory] Renderer ${name} failed, trying next:`,
					error,
				);
			}
		}

		throw new Error("No suitable renderer found");
	},

	/**
	 * Get renderer capabilities
	 * @param name - Renderer name
	 * @returns Capabilities or null if not registered
	 */
	getCapabilities: async (
		name: string,
	): Promise<RendererCapabilities | null> => {
		if (capabilitiesCache.has(name)) {
			return capabilitiesCache.get(name) ?? null;
		}

		const loader = loaders.get(name);
		if (!loader) {
			return null;
		}

		try {
			const renderer = await loader();
			const caps = renderer.capabilities;
			capabilitiesCache.set(name, caps);
			return caps;
		} catch {
			return null;
		}
	},

	/**
	 * Clear all cached instances
	 */
	clearCache(): void {
		instances.clear();
		capabilitiesCache.clear();
	},
};

/**
 * Get candidate renderers in priority order
 * @private
 */
function getCandidates(preferred: string): string[] {
	if (preferred !== "auto") {
		return [preferred];
	}

	const candidates: string[] = [];

	if (typeof navigator !== "undefined" && "gpu" in navigator) {
		candidates.push("webgpu");
	}

	if (typeof document !== "undefined") {
		const canvas = document.createElement("canvas");
		const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
		if (gl) {
			candidates.push("webgl");
		}
	}

	candidates.push("canvas2d");

	return candidates;
}

/**
 * Load renderer instance (singleton per name)
 * @private
 */
async function loadRenderer(name: string): Promise<IRenderer> {
	const instance = instances.get(name);
	if (instance) {
		return instance;
	}

	const loader = loaders.get(name);
	if (!loader) {
		throw new Error(`Renderer ${name} not registered`);
	}

	const renderer = await loader();
	instances.set(name, renderer);
	return renderer;
}

RendererFactory.register("canvas2d", () =>
	Promise.resolve(new Canvas2DRenderer()),
);
