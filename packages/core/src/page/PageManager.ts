/**
 * Page Manager
 *
 * Manages page lifecycle: loading, caching, updating, and destruction.
 * Handles HTML, image, and renderer-based content.
 * @packageDocumentation
 */
import type { PageContent, PageData, PageDensity, PageSource } from "../types";

/**
 * Page manager configuration
 */
export interface PageManagerConfig {
	/** Maximum pages to keep in cache */
	maxCacheSize: number;
	/** Enable lazy loading for off-screen pages */
	lazyLoad: boolean;
	/** Preload adjacent pages */
	preloadAdjacent: boolean;
	/** Image loading timeout (ms) */
	imageLoadTimeout: number;
	/** Enable memory pressure monitoring */
	monitorMemory: boolean;
}

/**
 * Default configuration
 */
export const DEFAULT_PAGE_MANAGER_CONFIG: PageManagerConfig = {
	maxCacheSize: 50,
	lazyLoad: true,
	preloadAdjacent: true,
	imageLoadTimeout: 10000,
	monitorMemory: true,
};

/**
 * Loaded page with metadata
 */
export interface LoadedPage {
	/** Page data */
	data: PageData;
	/** Whether content is fully loaded */
	loaded: boolean;
	/** Loading promise */
	loadPromise: Promise<void> | null;
	/** Last access timestamp */
	lastAccessed: number;
	/** Memory size estimate (bytes) */
	memorySize: number;
	/** Error if loading failed */
	error: Error | null;
}

/**
 * PageManager - Page lifecycle management
 *
 * Handles loading, caching, updating, and memory management for pages.
 * Supports HTML elements, images, and renderer-based content.
 */
export class PageManager {
	private config: PageManagerConfig;
	private pages: Map<string, LoadedPage> = new Map();
	private loadOrder: string[] = [];
	private currentPageIndex = 0;
	private totalPages = 0;
	private memoryPressureCallback: (() => void) | null = null;

	/**
	 * Create page manager
	 * @param config - Manager configuration
	 */
	constructor(config: Partial<PageManagerConfig> = {}) {
		this.config = { ...DEFAULT_PAGE_MANAGER_CONFIG, ...config };
	}

	/**
	 * Update configuration
	 * @param config - New configuration
	 */
	setConfig(config: Partial<PageManagerConfig>): void {
		this.config = { ...this.config, ...config };
		this.enforceCacheLimit();
	}

	/**
	 * Set memory pressure callback
	 * @param callback - Called when memory pressure detected
	 */
	onMemoryPressure(callback: () => void): void {
		this.memoryPressureCallback = callback;
	}

	/**
	 * Load pages from HTML elements
	 *
	 * @param elements - Array of HTML elements
	 * @param densities - Optional densities for each page
	 * @returns Array of loaded page data
	 */
	async loadFromHtml(
		elements: HTMLElement[],
		densities?: PageDensity[],
	): Promise<PageData[]> {
		this.clear();
		this.totalPages = elements.length;

		const pages: PageData[] = elements.map((element, index) => ({
			id: `page-${index}`,
			index,
			density: densities?.[index] ?? "soft",
			content: { type: "html", element },
			metadata: { sourceIndex: index },
		}));

		return this.initializePages(pages);
	}

	/**
	 * Load pages from image URLs
	 *
	 * @param urls - Array of image URLs
	 * @param densities - Optional densities for each page
	 * @returns Array of loaded page data
	 */
	async loadFromImages(
		urls: string[],
		densities?: PageDensity[],
	): Promise<PageData[]> {
		this.clear();
		this.totalPages = urls.length;

		const pages: PageData[] = urls.map((src, index) => ({
			id: `page-${index}`,
			index,
			density: densities?.[index] ?? "soft",
			content: { type: "image", src, alt: `Page ${index + 1}` },
			metadata: { sourceIndex: index },
		}));

		return this.initializePages(pages);
	}

	/**
	 * Load pages from mixed sources
	 *
	 * @param sources - Array of page sources
	 * @returns Array of loaded page data
	 */
	async loadFromSources(sources: PageSource[]): Promise<PageData[]> {
		this.clear();
		this.totalPages = sources.length;

		const pages: PageData[] = sources.map((source, index) => {
			let content: PageContent;
			const metadata =
				source.metadata && typeof source.metadata === "object"
					? {
							...(source.metadata as Record<string, unknown>),
							sourceIndex: index,
						}
					: { sourceIndex: index, value: source.metadata };

			switch (source.type) {
				case "html":
					content = { type: "html", element: source.content as HTMLElement };
					break;
				case "image":
					content = { type: "image", src: source.content as string };
					break;
				case "renderer":
					content = {
						type: "renderer",
						rendererId: source.rendererId as string,
						source: source.content,
					};
					break;
				default:
					throw new Error(
						`Unknown source type: ${(source as { type: string }).type}`,
					);
			}

			return {
				id: `page-${index}`,
				index,
				density: source.density ?? "soft",
				content,
				metadata,
			};
		});

		return this.initializePages(pages);
	}

	/**
	 * Initialize pages and start loading
	 * @private
	 */
	private async initializePages(pages: PageData[]): Promise<PageData[]> {
		const loadedPages: PageData[] = [];

		for (const page of pages) {
			const loadedPage: LoadedPage = {
				data: page,
				loaded: false,
				loadPromise: null,
				lastAccessed: Date.now(),
				memorySize: this.estimateMemorySize(page),
				error: null,
			};

			this.pages.set(page.id, loadedPage);
			loadedPage.loadPromise = this.loadPageContent(page);
			this.loadOrder.push(page.id);
			loadedPages.push(page);
		}

		await Promise.all(
			loadedPages.map((page) => this.pages.get(page.id)?.loadPromise),
		);

		this.enforceCacheLimit();

		return loadedPages;
	}

	/**
	 * Load content for a single page
	 * @private
	 */
	private async loadPageContent(page: PageData): Promise<void> {
		const loadedPage = this.pages.get(page.id);
		if (!loadedPage) {
			return;
		}

		try {
			switch (page.content.type) {
				case "image":
					await this.loadImage(page.content.src);
					break;
				case "html":
					if (!(page.content.element instanceof HTMLElement)) {
						throw new Error("Invalid HTML element");
					}
					break;
				case "renderer":
					break;
			}

			loadedPage.loaded = true;
			loadedPage.error = null;
		} catch (error) {
			loadedPage.error =
				error instanceof Error ? error : new Error(String(error));
			loadedPage.loaded = false;
			console.error(`[PageManager] Failed to load page ${page.id}:`, error);
		}
	}

	/**
	 * Load image with timeout
	 * @private
	 */
	private loadImage(src: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			const timeout = setTimeout(() => {
				reject(new Error(`Image load timeout: ${src}`));
			}, this.config.imageLoadTimeout);

			img.onload = () => {
				clearTimeout(timeout);
				resolve(img);
			};

			img.onerror = () => {
				clearTimeout(timeout);
				reject(new Error(`Failed to load image: ${src}`));
			};

			img.src = src;
		});
	}

	/**
	 * Update pages from HTML elements
	 *
	 * @param elements - New HTML elements
	 * @returns Updated page data
	 */
	async updateFromHtml(elements: HTMLElement[]): Promise<PageData[]> {
		const newTotal = elements.length;
		const pages: PageData[] = [];

		for (let index = 0; index < newTotal; index += 1) {
			const existing = this.pages.get(`page-${index}`);

			if (existing) {
				existing.data.content = { type: "html", element: elements[index] };
				existing.data.density = "soft";
				existing.loaded = false;
				existing.loadPromise = this.loadPageContent(existing.data);
				existing.lastAccessed = Date.now();
				existing.memorySize = this.estimateMemorySize(existing.data);
				pages.push(existing.data);
				continue;
			}

			const page: PageData = {
				id: `page-${index}`,
				index,
				density: "soft",
				content: { type: "html", element: elements[index] },
			};

			const loadedPage: LoadedPage = {
				data: page,
				loaded: false,
				loadPromise: null,
				lastAccessed: Date.now(),
				memorySize: this.estimateMemorySize(page),
				error: null,
			};

			this.pages.set(page.id, loadedPage);
			loadedPage.loadPromise = this.loadPageContent(page);
			this.loadOrder.push(page.id);
			pages.push(page);
		}

		while (this.loadOrder.length > newTotal) {
			const removedId = this.loadOrder.at(-1);
			if (!removedId) {
				break;
			}

			this.destroyPage(removedId);
		}

		this.totalPages = newTotal;
		await Promise.all(
			pages.map((page) => this.pages.get(page.id)?.loadPromise),
		);
		this.enforceCacheLimit();

		return pages;
	}

	/**
	 * Update pages from image URLs
	 *
	 * @param urls - New image URLs
	 * @returns Updated page data
	 */
	async updateFromImages(urls: string[]): Promise<PageData[]> {
		const newTotal = urls.length;
		const pages: PageData[] = [];

		for (let index = 0; index < newTotal; index += 1) {
			const existing = this.pages.get(`page-${index}`);

			if (existing) {
				existing.data.content = {
					type: "image",
					src: urls[index],
					alt: `Page ${index + 1}`,
				};
				existing.loaded = false;
				existing.loadPromise = this.loadPageContent(existing.data);
				existing.lastAccessed = Date.now();
				existing.memorySize = this.estimateMemorySize(existing.data);
				pages.push(existing.data);
				continue;
			}

			const page: PageData = {
				id: `page-${index}`,
				index,
				density: "soft",
				content: { type: "image", src: urls[index], alt: `Page ${index + 1}` },
			};

			const loadedPage: LoadedPage = {
				data: page,
				loaded: false,
				loadPromise: null,
				lastAccessed: Date.now(),
				memorySize: this.estimateMemorySize(page),
				error: null,
			};

			this.pages.set(page.id, loadedPage);
			loadedPage.loadPromise = this.loadPageContent(page);
			this.loadOrder.push(page.id);
			pages.push(page);
		}

		while (this.loadOrder.length > newTotal) {
			const removedId = this.loadOrder.at(-1);
			if (!removedId) {
				break;
			}

			this.destroyPage(removedId);
		}

		this.totalPages = newTotal;
		await Promise.all(
			pages.map((page) => this.pages.get(page.id)?.loadPromise),
		);
		this.enforceCacheLimit();

		return pages;
	}

	/**
	 * Get page by index
	 *
	 * @param index - Page index
	 * @returns Page data or null
	 */
	getPage(index: number): PageData | null {
		const id = `page-${index}`;
		const loadedPage = this.pages.get(id);

		if (!loadedPage) {
			return null;
		}

		loadedPage.lastAccessed = Date.now();
		return loadedPage.data;
	}

	/**
	 * Get all pages
	 *
	 * @returns Array of page data
	 */
	getAllPages(): PageData[] {
		return this.loadOrder
			.map((id) => this.pages.get(id)?.data)
			.filter((page): page is PageData => page !== undefined);
	}

	/**
	 * Get page count
	 */
	getPageCount(): number {
		return this.totalPages;
	}

	/**
	 * Set current page index (for preloading)
	 *
	 * @param index - Current page index
	 */
	setCurrentPage(index: number): void {
		this.currentPageIndex = index;

		if (this.config.preloadAdjacent) {
			void this.preloadAdjacentPages(index);
		}
	}

	/**
	 * Preload adjacent pages
	 * @private
	 */
	private async preloadAdjacentPages(index: number): Promise<void> {
		const indices = [index - 1, index + 1].filter(
			(pageIndex) => pageIndex >= 0 && pageIndex < this.totalPages,
		);

		await Promise.all(
			indices.map((pageIndex) => this.ensurePageLoaded(pageIndex)),
		);
	}

	/**
	 * Ensure page is loaded
	 *
	 * @param index - Page index
	 * @returns Page data
	 */
	async ensurePageLoaded(index: number): Promise<PageData | null> {
		const page = this.getPage(index);
		if (!page) {
			return null;
		}

		const loadedPage = this.pages.get(page.id);
		if (loadedPage && !loadedPage.loaded && loadedPage.loadPromise) {
			await loadedPage.loadPromise;
		}

		return page;
	}

	/**
	 * Check if page is loaded
	 *
	 * @param index - Page index
	 * @returns True if loaded
	 */
	isPageLoaded(index: number): boolean {
		const loadedPage = this.pages.get(`page-${index}`);
		return loadedPage?.loaded ?? false;
	}

	/**
	 * Get page load status
	 *
	 * @param index - Page index
	 * @returns Load status
	 */
	getPageLoadStatus(
		index: number,
	): { loaded: boolean; error: Error | null } | null {
		const loadedPage = this.pages.get(`page-${index}`);
		if (!loadedPage) {
			return null;
		}

		return { loaded: loadedPage.loaded, error: loadedPage.error };
	}

	/**
	 * Enforce cache size limit (LRU eviction)
	 * @private
	 */
	private enforceCacheLimit(): void {
		if (this.pages.size <= this.config.maxCacheSize) {
			return;
		}

		const sortedPages = [...this.pages.entries()].sort(
			(left, right) => left[1].lastAccessed - right[1].lastAccessed,
		);
		const pagesToRemove = sortedPages.slice(
			0,
			this.pages.size - this.config.maxCacheSize,
		);

		for (const [id] of pagesToRemove) {
			this.destroyPage(id);
		}

		if (this.memoryPressureCallback) {
			this.memoryPressureCallback();
		}
	}

	/**
	 * Destroy a specific page
	 * @private
	 */
	private destroyPage(id: string): void {
		const page = this.pages.get(id);
		if (!page) {
			return;
		}

		this.pages.delete(id);
		const orderIndex = this.loadOrder.indexOf(id);
		if (orderIndex !== -1) {
			this.loadOrder.splice(orderIndex, 1);
		}
	}

	/**
	 * Estimate memory size of a page
	 * @private
	 */
	private estimateMemorySize(page: PageData): number {
		let size = 1024;

		switch (page.content.type) {
			case "html":
				size += 50 * 1024;
				break;
			case "image":
				size += 100 * 1024;
				break;
			case "renderer":
				size += 200 * 1024;
				break;
		}

		return size;
	}

	/**
	 * Get total estimated memory usage
	 *
	 * @returns Memory in bytes
	 */
	getMemoryUsage(): number {
		let total = 0;

		for (const page of this.pages.values()) {
			total += page.memorySize;
		}

		return total;
	}

	/**
	 * Get cache statistics
	 *
	 * @returns Cache stats
	 */
	getCacheStats(): {
		size: number;
		maxSize: number;
		hitRate: number;
		memoryUsage: number;
	} {
		return {
			size: this.pages.size,
			maxSize: this.config.maxCacheSize,
			hitRate: 0,
			memoryUsage: this.getMemoryUsage(),
		};
	}

	/**
	 * Clear all pages
	 */
	clear(): void {
		for (const id of [...this.loadOrder]) {
			this.destroyPage(id);
		}

		this.loadOrder = [];
		this.totalPages = 0;
		this.currentPageIndex = 0;
	}

	/**
	 * Destroy page manager
	 */
	destroy(): void {
		this.clear();
		this.memoryPressureCallback = null;
	}
}
