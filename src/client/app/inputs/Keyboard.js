import Input from './Input';

class Keyboard extends Input {
	constructor() {
		super({
			type: 'Keyboard',
		});

		window.addEventListener('keypress', (event) => {
			this.runTriggers(event, {
				eventName: 'onKeyPress',
				params: {
					key: event.key,
				},
			});
		});
		window.addEventListener('keyup', (event) => {
			this.runTriggers(event, {
				eventName: 'onKeyUp',
				params: {
					key: event.key,
				},
			});
		});
		window.addEventListener('keydown', (event) => {
			this.runTriggers(event, {
				eventName: 'onKeyDown',
				params: {
					key: event.key,
				},
			});
		});
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
