// virtual-sketches.d.ts

declare module 'virtual:sketches' {
	/**
	 * The module namespace returned by a sketch's dynamic `import()`.
	 * Replace `unknown` with your sketch module's real shape,
	 * e.g. `{ init: Function; update?: Function; props?: Record<string, unknown> }`.
	 */
	export type SketchModule = {
		[key: string]: unknown;
	};

	/**
	 * Map of sketch file paths (as listed in the plugin's `entries`) to lazy loaders.
	 */
	export const sketches: Record<string, () => Promise<SketchModule>>;

	/**
	 * Registers a callback that runs when a sketch module is hot-reloaded.
	 * Only has an effect in dev, when `import.meta.hot` is available.
	 * The callback receives the updated module, which can be `undefined`
	 * if the update failed.
	 */
	export const onSketchReload: (
		fn: (module: SketchModule | undefined) => void,
	) => void;
}
