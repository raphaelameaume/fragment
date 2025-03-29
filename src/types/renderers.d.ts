import type p5 from 'p5';
import type * as THREE from 'three';
import type { Frag } from '@fragment/types/gl';

export type Rendering = '2d' | 'fragment' | 'p5' | 'p5-webgl' | 'three';

type Params = Record<string, any>;

export type RendererParams = {
	id: number;
	canvas: HTMLCanvasElement;
	container: HTMLElement;
	width: number;
	height: number;
	pixelRatio: number;
};

export type InitParams<P extends Params = Params> = P;

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

export type MountParams<R extends Rendering | Params> =
	R extends keyof RenderingsMountParams ? RenderingsMountParams[R] : R;

export type MountParams2DRenderer = MountParams<'2d'>;
export type MountParamsFragmentRenderer = MountParams<'fragment'>;
export type MountParamsP5Renderer = MountParams<'p5'>;
export type MountParamsP5GLRenderer = MountParams<'p5-webgl'>;
export type MountParamsThreeRenderer = MountParams<'three'>;

export type RendererInit<P extends Params = InitParams> = (
	params: Pick<RendererParams, 'canvas' | 'width' | 'height' | 'pixelRatio'>,
) => InitParams<P>;

export type RendererOnMountPreview<
	P extends Params = InitParams,
	R extends Rendering | Params = Params,
> = (
	params: Pick<
		RendererParams,
		'id' | 'canvas' | 'container' | 'width' | 'height' | 'pixelRatio'
	> &
		InitParams<P>,
) => MountParams<R>;

export type RendererOnResizePreview<
	P extends Params = InitParams,
	R extends Rendering | Params = Params,
> = (
	params: Pick<
		RendererParams,
		'id' | 'canvas' | 'width' | 'height' | 'pixelRatio'
	> &
		InitParams<P> &
		MountParams<R>,
) => void;

export type RendererOnBeforeUpdatePreview<
	P extends Params = InitParams,
	R extends Rendering | Params = Params,
> = (
	params: Pick<RendererParams, 'id' | 'canvas' | 'container'> &
		InitParams<P> &
		MountParams<R>,
) => void;

export type RendererOnAfterUpdatePreview<
	P extends Params = InitParams,
	R extends Rendering | Params = Params,
> = (
	params: Pick<RendererParams, 'id' | 'canvas' | 'container'> &
		InitParams<P> &
		MountParams<R>,
) => void;

export type RendererOnDestroyPreview<
	P extends Params = InitParams,
	R extends Rendering | Params = Params,
> = (
	params: Pick<RendererParams, 'id'> & InitParams<P> & MountParams<R>,
) => void;

export type RendererResize<
	P extends Params = InitParams,
	R extends Rendering | Params = Params,
> = (
	params: Pick<RendererParams, 'width' | 'height' | 'pixelRatio'> &
		InitParams<P> &
		MountParams<R>,
) => void;
