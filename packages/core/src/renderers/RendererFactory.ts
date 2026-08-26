import { MAX_TEXTURE_SIZE_FALLBACK } from "../constants";
import type {
	IRenderer,
	RenderFrame,
	RendererCapabilities,
	RendererOptions,
} from "../types";

/**
 * Basic Canvas2D renderer used as the default runtime renderer.
 */
class Canvas2DRenderer implements IRenderer {
	/** Renderer capabilities. */
	public readonly capabilities: RendererCapabilities = {
		zoom: false,
		pan: false,
		hiDPI: true,
		maxTextureSize: MAX_TEXTURE_SIZE_FALLBACK,
		supportsVideo: false,
		supportsPDF: false,
		supportsPBR: false,
	};

	/** Rendering context. */
	private context: CanvasRenderingContext2D | null = null;

	/** Renderer identifier. */
	public readonly name = "canvas2d" as const;

	/** Initialize renderer. */
	public async init(
		canvas: HTMLCanvasElement,
		options: RendererOptions,
	): Promise<void> {
		this.context = canvas.getContext(
			"2d",
			options.contextAttributes ?? undefined,
		);
	}

	/** Render frame. */
	public render(frame: RenderFrame): void {
		if (!this.context) {
			return;
		}

		this.context.clearRect(
			0,
			0,
			frame.viewport.width * frame.dpr,
			frame.viewport.height * frame.dpr,
		);
	}

	/** Resize renderer. */
	public resize(_width: number, _height: number, dpr: number): void {
		this.context?.setTransform(dpr, 0, 0, dpr, 0, 0);
	}

	/** Destroy renderer. */
	public destroy(): void {
		this.context = null;
	}
}

/**
 * Renderer factory.
 */
export const RendererFactory = {
	/**
	 * Create a renderer instance.
	 */
	async create(
		_rendererId: "auto" | "canvas2d" | "webgl",
		canvas: HTMLCanvasElement,
		options: RendererOptions = {},
	): Promise<IRenderer> {
		const renderer = new Canvas2DRenderer();
		await renderer.init(canvas, options);
		return renderer;
	},
};
