let ID = 0;

class Monitors {
	all = $state([]);

	constructor() {
		$effect.root(() => {
			$effect(() => {
				console.log(this.map);
			});
		});
	}

	register(id = ID++) {
		let monitor = {
			id,
		};

		this.all.push(monitor);
	}

	getById(id) {
		return this.all.find((m) => m.id === id);
	}

	getIndexById(id) {
		return this.all.findIndex((m) => m.id === id);
	}

	remove(id) {
		const index = this.getIndexById(id);
		this.all.splice(index, 1);
	}
}

export let monitors = new Monitors();
