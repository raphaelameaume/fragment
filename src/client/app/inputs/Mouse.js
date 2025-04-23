import Input from './Input';

class Mouse extends Input {
	constructor() {
		super({
			type: 'Mouse',
		});

		this.triggersDown = [];
		this.triggersUp = [];
		this.triggersClick = [];
		this.triggersMove = [];
	}

	getTriggers(eventName) {
		if (eventName === 'onMouseDown') {
			return this.triggersDown;
		} else if (eventName === 'onMouseUp') {
			return this.triggersUp;
		} else if (eventName === 'onMouseMove') {
			return this.triggersMove;
		} else if (eventName === 'onClick') {
			return this.triggersClick;
		}
	}

	runTriggers(event, context, collection) {
		if (!this.enabled) return;

		const triggers = collection.filter(
			(trigger) =>
				trigger.context === context || trigger.context === wildcard,
		);

		triggers.forEach((trigger) => {
			trigger.run(event);
		});
	}

	onMouseDown(event, context) {
		this.runTriggers(event, context, this.triggersDown);
	}

	onMouseUp(event, context) {
		this.runTriggers(event, context, this.triggersUp);
	}

	onMouseMove(event, context) {
		this.runTriggers(event, context, this.triggersMove);
	}

	onClick() {}
}

export default new Mouse();
