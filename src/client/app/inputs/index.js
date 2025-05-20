import Keyboard from './Keyboard';
import Mouse from './Mouse';
import MIDI from './MIDI';
import { configInputsList } from 'virtual:config-inputs';

export const Inputs = [
	Mouse,
	MIDI,
	Keyboard,
	...Object.values(configInputsList),
];
