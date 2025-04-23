class Input {
	constructor({ type } = {}) {
		this.type = type;
		this.enabled = true;
	}

	createTrigger(
		fn,
		{
			eventName,
			collection,
			context = getContext(),
			hot,
			enabled,
			...params
		},
	) {
		const trigger = new Trigger({
			inputType: this.type,
			eventName,
			context,
			hot,
			fn,
			enabled,
			params,
			destroy: () => {
				const index = collection.findIndex((t) => t === trigger);

				collection.splice(index, 1);
			},
		});

		return trigger;
	}

	enable() {
		this.enabled = true;
	}

	disable() {
		this.enabled = false;
	}
}

export default Input;
