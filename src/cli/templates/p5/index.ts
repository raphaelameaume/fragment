import p5 from 'p5';

import { Init, Rendering, Update } from '@fragment/types';
import { defineProps } from '@fragment/types/utils';

export const props = defineProps({});

export const setup: Init<'p5'> = ({}) => {};

export const draw: Update<'p5'> = ({ p }) => {
	p.background(0, 255, 0);
};

export const rendering: Rendering = 'p5';
