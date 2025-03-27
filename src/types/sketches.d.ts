import type { Frag } from './gl';
import type { Props } from './props';
import type { Rendering, MountParams } from './renderers';

type SharedParams = {
	canvas: HTMLCanvasElement;
	width: number;
	height: number;
	pixelRatio: number;
};

export type Init<R extends Rendering> = (
	params: SharedParams & MountParams[R],
) => void;

export type Update<R extends Rendering> = (
	params: {
		time: number;
		deltaTime: number;
		playhead?: number;
		playcount?: number;
	} & SharedParams &
		MountParams[R],
) => void;

export type Resize<R extends Rendering> = (
	params: SharedParams & MountParams[R],
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
