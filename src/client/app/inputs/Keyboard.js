import { Input } from './Input';

export class Keyboard extends Input {
	constructor() {
		super({ name: 'Keyboard' });
	}

	/**
	 *
	 * @param {KeyboardEvent} event
	 */
	getStepFromEvent(event) {
		if (event.shiftKey) {
			return 10;
		} else if (event.altKey) {
			return 0.1;
		}

		return 1;
	}
}

export default new Keyboard();
