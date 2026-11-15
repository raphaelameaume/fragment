import { Input } from './Input';

export class Mouse extends Input {
	constructor() {
		super({
			name: 'Mouse',
			events: [
				{ name: 'onMouseDown', triggerable: true },
				{ name: 'onMouseUp', triggerable: true },
				{ name: 'onMouseMove', triggerable: true },
				{ name: 'onClick', triggerable: true },
			],
		});
	}

	/**
	 * @param {MouseEvent} event
	 * @param {string} context
	 */
	onMouseDown(event, context) {
		this.runTriggers(event, {
			context,
			eventName: 'onMouseDown',
		});
	}

	/**
	 * @param {MouseEvent} event
	 * @param {string} context
	 */
	onMouseUp(event, context) {
		this.runTriggers(event, {
			context,
			eventName: 'onMouseUp',
		});
	}

	/**
	 * @param {MouseEvent} event
	 * @param {string} context
	 */
	onMouseMove(event, context) {
		this.runTriggers(event, {
			context,
			eventName: 'onMouseMove',
		});
	}

	/**
	 * @param {MouseEvent} event
	 * @param {string} context
	 */
	onClick(event, context) {
		this.runTriggers(event, {
			context,
			eventName: 'onClick',
		});
	}
}

export default new Mouse();
