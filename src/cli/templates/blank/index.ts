import { Init, Resize, Update } from '@fragment/types';
import { defineProps } from '@fragment/types/utils';

export const props = defineProps({});

export const init: Init<any> = ({}) => {};

export const update: Update<any> = ({}) => {};

export const resize: Resize<any> = ({ canvas, width, height, pixelRatio }) => {
	canvas.width = width * pixelRatio;
	canvas.height = height * pixelRatio;
	canvas.style.width = `${width}px`;
	canvas.style.height = `${height}px`;
};
