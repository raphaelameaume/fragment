import type p5 from 'p5';
import type { Scene, WebGLRenderer } from 'three';

import { fragment, Program } from '../lib/gl';
import type { Props } from './props';

export type Rendering = '2d' | 'fragment' | 'p5' | 'p5-webgl' | 'three';

type RenderingParams = {
	'2d': { context: CanvasRenderingContext2D };
	fragment: {
		frag: ReturnType<typeof fragment> &
			Pick<
				Program,
				'shader' | 'fragmentShader' | 'vertexShader' | 'uniforms'
			>;
	};
	p5: { p: p5 };
	'p5-webgl': { p: p5 };
	three: { renderer: WebGLRenderer; scene: Scene };
};

type SharedParams = {
	canvas: HTMLCanvasElement;
	width: number;
	height: number;
	pixelRatio: number;
};

export type Init<Rendering extends Rendering> = (
	params: SharedParams & RenderingParams[Rendering],
) => void;

export type Update<Rendering extends Rendering> = (
	params: {
		time: number;
		deltaTime: number;
		playhead?: number;
		playcount?: number;
	} & SharedParams &
		RenderingParams[Rendering],
) => void;

export type Resize<Rendering extends Rendering> = (
	params: SharedParams & RenderingParams[Rendering],
) => void;

export type FilenamePattern = (params: {
	filename: string;
	year: string;
	month: string;
	day: string;
	hours: string;
	minutes: string;
	seconds: string;
	timestamp: string;
	props: Props;
}) => string;
