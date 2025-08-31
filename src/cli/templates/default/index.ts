import { Init, Rendering, Resize, Update } from '@fragment/types';
import { defineProps } from '@fragment/types/utils';

export const props = defineProps({});

export const init: Init<'2d'> = ({}) => {};

export const update: Update<'2d'> = ({
	context,
	width,
	height,
	pixelRatio,
}) => {
	context.fillStyle = 'rgb(0, 255, 0)';
	context.fillRect(0, 0, width * pixelRatio, height * pixelRatio);
};

export const resize: Resize<'2d'> = ({}) => {};

export const rendering: Rendering = '2d';
