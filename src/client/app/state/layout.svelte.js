import { hydrate, persist } from './utils.svelte';

let COMPONENT_ID = 0;

class Layout {
	components = $state([]);
	editing = $state(false);
	previewing = $state(false);

	getID() {
		return COMPONENT_ID++;
	}

	constructor() {
		this.key = 'layout';

		$effect.root(() => {
			$effect(() => {
				if (!this.previewing && !__BUILD__) {
					this.persist($state.snapshot(this.components));
				}
			});
		});

		this.components.push(...hydrate(this.key, null, []));
	}

	createComponent({
		id = this.getID(),
		origin,
		node = null,
		size = 1,
		minimized = false,
		headless = false,
		type,
		name,
		children = [],
		params = {},
	}) {
		let existingComponent = this.getComponent(id);

		if (existingComponent) {
			COMPONENT_ID = Math.max(existingComponent.id + 1, COMPONENT_ID);
			return existingComponent;
		}

		let component = {
			id,
			node,
			size,
			minimized,
			name,
			type,
			children,
			headless,
			params,
		};

		const originComponent = this.getComponent(origin);
		const isSibling = component.type === originComponent?.type;

		if (originComponent) {
			component.root = false;

			if (isSibling) {
				if (originComponent.root) {
					const originChildren = originComponent.children.map(
						(childID) =>
							this.components.find((c) => c.id === childID),
					);

					originComponent.children.length = 0;

					const intermediate = this.createComponent({
						type:
							originComponent.type === 'column'
								? 'row'
								: 'column',
						size: 1,
						origin,
					});

					const col1 = this.createComponent({
						type: intermediate.type === 'column' ? 'row' : 'column',
						size: 0.5,
						origin: intermediate.id,
					});

					originChildren.forEach((child) => {
						child.parent = col1.id;
					});
					col1.children.push(...originChildren.map((c) => c.id));

					component = this.createComponent({
						type: intermediate.type === 'column' ? 'row' : 'column',
						size: 0.5,
						origin: intermediate.id,
					});
				} else {
					// add sibling
					const sibling = originComponent;
					const parent = this.getComponent(sibling.parent);
					const index = parent.children.findIndex(
						(id) => id === sibling.id,
					);

					const { size } = sibling;
					sibling.size = size * 0.5;
					component.size = size * 0.5;
					component.parent = sibling.parent;
					parent.children.splice(index + 1, 0, component.id);
				}
			} else if (
				originComponent.children.length === 1 &&
				this.getComponent(originComponent.children[0]).type === 'module'
			) {
				const child = this.getComponent(originComponent.children[0]);

				originComponent.children.length = 0;

				const replacement = this.createComponent({
					type: originComponent.type === 'column' ? 'row' : 'column',
					origin,
				});

				replacement.children.push(child.id);
				component.parent = origin;
				originComponent.children.splice(
					0,
					1,
					replacement.id,
					component.id,
				);
			} else {
				component.parent = originComponent.id;

				originComponent.children.push(component.id);
			}
		} else {
			component.root = true;
		}

		if (component) {
			this.components.push(component);
		}

		return component;
	}

	persist(components) {
		const mirrored = components.map((source) => ({
			id: source.id,
			parent: source.parent,
			size: source.size,
			root: source.root,
			type: source.type,
			name: source.name,
			minimized: source.minimized,
			params: source.params,
			children: [...source.children],
		}));

		persist(this.key, mirrored);
	}

	remove(component) {
		component.children.forEach((child) => {
			this.components.splice(
				this.components.findIndex((c) => c.id === child),
				1,
			);
		});

		this.components.splice(
			this.components.findIndex((c) => c.id === component.id),
			1,
		);

		const parent = this.getComponent(component.parent);

		if (parent) {
			const componentIndex = parent.children.findIndex(
				(id) => id === component.id,
			);

			parent.children.splice(componentIndex, 1);
			const newSize = 1 / Math.max(1, parent.children.length - 1);
			parent.children.forEach((childID) => {
				const child = this.getComponent(childID);
				child.size = newSize;
			});

			if (parent.children.length === 0 && !parent.root) {
				parent.size = 1;
				this.remove(parent);
			}
		}
	}

	getComponent(id) {
		return this.components.find((c) => c.id === id);
	}
}

export let layout = new Layout();
