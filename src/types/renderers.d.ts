import type p5 from 'p5';
import type * as THREE from 'three';
import type { Frag } from '@fragment/types/gl';

export type Rendering = '2d' | 'fragment' | 'p5' | 'p5-webgl' | 'three';

export type InitParams = {
	id: number;
	canvas: HTMLCanvasElement;
	container: HTMLElement;
	width: number;
	height: number;
	pixelRatio: number;
};

type RenderingsMountParams = {
	'2d': { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D };
	fragment: { canvas: HTMLCanvasElement; frag: Frag };
	p5: { canvas: HTMLCanvasElement; p: p5 };
	'p5-webgl': { canvas: HTMLCanvasElement; p: p5 };
	three: {
		canvas: HTMLCanvasElement;
		scene: THREE['Scene'];
		renderer: THREE['WebGLRenderer'];
	};
};

export type MountParams<R extends Rendering> = RenderingsMountParams[R];

export type MountParams2DRenderer = MountParams<'2d'>;
export type MountParamsFragmentRenderer = MountParams<'fragment'>;
export type MountParamsP5Renderer = MountParams<'p5'>;
export type MountParamsP5GLRenderer = MountParams<'p5-webgl'>;
export type MountParamsThreeRenderer = MountParams<'three'>;
