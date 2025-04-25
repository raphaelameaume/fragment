import Input from './Input';

class Mouse extends Input {
	constructor() {
		super({
			type: 'Mouse',
		});

		this.triggersDown = [];
		this.triggersUp = [];
		this.triggersMove = [];
		this.triggersClick = [];

		this.eventCollectionMap = new Map();
		this.eventCollectionMap.set('onMouseDown', this.triggersDown);
		this.eventCollectionMap.set('onMouseUp', this.triggersUp);
		this.eventCollectionMap.set('onMouseMove', this.triggersMove);
		this.eventCollectionMap.set('onClick', this.triggersClick);
	}

	register(trigger) {
		if (trigger.inputType !== this.type) return;

		const collection = this.getCollection(trigger.eventName);

		collection?.push(trigger);

		console.log(this);
	}

	getCollection(eventName) {
		if (this.eventCollectionMap.has(eventName)) {
			return this.eventCollectionMap.get(eventName);
		} else {
			console.error(
				`Cannot get triggers from Mouse input for eventName`,
				eventName,
			);
		}
	}

	getTriggers(eventName) {
		return this.getCollection(eventName);
	}

	runTriggers(event, context, collection) {
		if (!this.enabled) return;

		console.log(`run triggers`, event, context, collection);

		const triggers = collection.filter(
			(trigger) =>
				trigger.context === context || trigger.context === wildcard,
		);

		console.log(`triggers`, triggers);

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
