import type { Props } from './props';
import type { Rendering, MountParams, RendererParams } from './renderers';
import type { Frag } from './gl';

export type Load<R extends Rendering> = (
	params: RendererParams &
		MountParams<R> & {
			publicPath: string;
		},
) => Promise<void> | void;

export type Init<R extends Rendering> = (
	params: RendererParams &
		MountParams<R> & {
			publicPath: string;
		},
) => Promise<void> | void;

export type Update<R extends Rendering> = (
	params: RendererParams &
		MountParams<R> & {
			time: number;
			deltaTime: number;
			playhead?: number;
			playcount?: number;
		},
) => void;

export type Resize<R extends Rendering> = (
	params: RendererParams & MountParams<R>,
) => void;

export type Dispose<R extends Rendering> = () => void;

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
