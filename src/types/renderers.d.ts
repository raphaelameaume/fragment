import type p5 from 'p5';
import type * as THREE from 'three';
import type { Frag } from '@fragment/types/gl';

export type Rendering = '2d' | 'fragment' | 'p5' | 'p5-webgl' | 'three';

export type RendererParams = {
	id: number;
	canvas: HTMLCanvasElement;
	container: HTMLElement;
	width: number;
	height: number;
	pixelRatio: number;
};

export type InitParams = any;

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

export type MountParams<R extends Rendering | object> =
	R extends keyof RenderingsMountParams ? RenderingsMountParams[R] : R;

export type MountParams2DRenderer = MountParams<'2d'>;
export type MountParamsFragmentRenderer = MountParams<'fragment'>;
export type MountParamsP5Renderer = MountParams<'p5'>;
export type MountParamsP5GLRenderer = MountParams<'p5-webgl'>;
export type MountParamsThreeRenderer = MountParams<'three'>;

export type RendererInit<Params = InitParams> = (
	params: Pick<RendererParams, 'canvas' | 'width' | 'height' | 'pixelRatio'>,
) => Params;

export type RendererOnMountPreview<
	Params = InitParams,
	R extends Rendering | object = any,
> = (
	params: Pick<
		RendererParams,
		'id' | 'canvas' | 'container' | 'width' | 'height' | 'pixelRatio'
	> &
		Params,
) => MountParams<R>;

export type RendererOnResizePreview<
	Params = InitParams,
	R extends Rendering | object = any,
> = (
	params: Pick<
		RendererParams,
		'id' | 'canvas' | 'width' | 'height' | 'pixelRatio'
	> &
		Params &
		MountParams<R>,
) => void;

export type RendererOnBeforeUpdatePrevie<
	Params = InitParams,
	R extends Rendering | object = any,
> = (
	params: Pick<RendererParams, 'id' | 'canvas' | 'container'> &
		Params &
		MountParams<R>,
) => void;

export type RendererOnAfterUpdatePreview<
	Params = InitParams,
	R extends Rendering | object = any,
> = (
	params: Pick<RendererParams, 'id' | 'canvas' | 'container'> &
		Params &
		MountParams<R>,
) => void;

export type RendererOnDestroyPreview<
	Params = InitParams,
	R extends Rendering | object = any,
> = (params: Params & MountParams<R> & Pick<RendererParams, 'id'>) => void;

export type RendererResize<
	Params = InitParams,
	R extends Rendering | object = any,
> = (
	params: Pick<RendererParams, 'width' | 'height' | 'pixelRatio'> &
		Params &
		MountParams<R>,
) => void;
