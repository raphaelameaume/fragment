/// <reference types="vite/client" />

declare const __DEV__: boolean;
declare const __CWD__: string;
declare const __FRAGMENT_PORT__: number | undefined;
declare const __START_TIME__: number;
declare const __SEED__: number;
declare const __BUILD__: boolean;

declare module 'virtual:sketches' {
	/**
	 * Collection of sketch modules
	 */
	export const sketches: Record<string, () => Promise<any>>;
}

declare module 'changedpi' {
	/**
	 * Collection of sketch modules
	 */
	export function changeDpiDataUrl(data: string, ppi: number);
}

declare module 'gifenc' {
	/**
	 * RGB color palette entry
	 */
	export type PaletteEntry = [number, number, number];

	/**
	 * RGBA color
	 */
	export type RGBAColor = [number, number, number, number];

	/**
	 * Quantization options
	 */
	export interface QuantizeOptions {
		/**
		 * Enable oneBitTransparency
		 */
		oneBitTransparency?: boolean;
		/**
		 * Format of input data
		 */
		format?: 'rgb565' | 'rgba4444' | 'rgba5551';
		/**
		 * Clear hash between frames
		 */
		clearHash?: boolean;
		/**
		 * Clear hash modulo
		 */
		clearHashModulo?: number;
	}

	/**
	 * Frame write options
	 */
	export interface WriteFrameOptions {
		/**
		 * Color palette for the frame
		 */
		palette?: PaletteEntry[];
		/**
		 * Delay in milliseconds
		 */
		delay?: number;
		/**
		 * Transparent color index
		 */
		transparent?: number;
		/**
		 * Disposal method
		 */
		dispose?: number;
		/**
		 * Enable repeat
		 */
		repeat?: number;
	}

	/**
	 * GIF Encoder instance
	 */
	export interface GIFEncoderInstance {
		/**
		 * Write a frame to the GIF
		 */
		writeFrame(
			index: Uint8Array,
			width: number,
			height: number,
			options?: WriteFrameOptions,
		): void;
		/**
		 * Finish encoding and finalize the GIF
		 */
		finish(): void;
		/**
		 * Get the encoded bytes
		 */
		bytes(): Uint8Array<ArrayBuffer>;
		/**
		 * Get the byte length
		 */
		bytesView(): Uint8Array;
	}

	/**
	 * Create a new GIF encoder
	 */
	export function GIFEncoder(): GIFEncoderInstance;

	/**
	 * Quantize RGBA pixel data to a color palette
	 */
	export function quantize(
		rgba: Uint8Array | Uint8ClampedArray,
		maxColors: number,
		options?: QuantizeOptions,
	): PaletteEntry[];

	/**
	 * Apply a palette to RGBA pixel data
	 */
	export function applyPalette(
		rgba: Uint8Array | Uint8ClampedArray,
		palette: PaletteEntry[],
		format?: 'rgb565' | 'rgba4444' | 'rgba5551',
	): Uint8Array;

	/**
	 * Prequantize RGBA data
	 */
	export function prequantize(
		rgba: Uint8Array | Uint8ClampedArray,
		options?: QuantizeOptions,
	): {
		rgba: Uint8Array;
		palette: PaletteEntry[];
	};
}
