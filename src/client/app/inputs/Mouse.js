import Input from './Input';

class Mouse extends Input {
	constructor() {
		super({
			type: 'Mouse',
		});
	}

	/**
	 *
	 * @param {string} event
	 * @param {string} context
	 */
	onMouseDown(event, context) {
		this.runTriggers(event, {
			context,
			eventName: 'onMouseDown',
		});
	}

	/**
	 *
	 * @param {string} event
	 * @param {string} context
	 */
	onMouseUp(event, context) {
		this.runTriggers(event, {
			context,
			eventName: 'onMouseUp',
		});
	}

	/**
	 *
	 * @param {string} event
	 * @param {string} context
	 */
	onMouseMove(event, context) {
		this.runTriggers(event, {
			context,
			eventName: 'onMouseMove',
		});
	}

	onClick(event, context) {
		this.runTriggers(event, {
			context,
			eventName: 'onClick',
		});
	}
}

export default new Mouse();
