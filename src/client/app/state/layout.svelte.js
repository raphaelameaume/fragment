import { hydrate, persist } from './utils.svelte';

let COMPONENT_ID = 0;

class Layout {
	tree = $state({});
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
					this.persist(this.tree);
				}
			});
		});

		this.tree = hydrate(this.key);
	}

	createComponent({
		id = this.getID(),
		origin,
		node = null,
		size = 1,
		minimized = false,
		type,
		name,
		children = [],
	}) {
		let existingComponent = this.getComponent(id);
		if (existingComponent) {
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
						child.depth += 2;
						child.parent = col1.id;
					});
					col1.children.push(...originChildren.map((c) => c.id));

					this.createComponent({
						type: intermediate.type === 'column' ? 'row' : 'column',
						size: 0.5,
						origin: intermediate.id,
					});

					component = null;
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
					component.depth = sibling.depth;
					component.parent = sibling.parent;
					parent.children.splice(index + 1, 0, component.id);
				}
			} else if (
				originComponent.children.length === 1 &&
				this.getComponent(originComponent.children[0]).type === 'module'
			) {
				const child = this.getComponent(originComponent.children[0]);

				child.depth += 1;
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
				component.depth = originComponent.depth + 1;
				component.parent = originComponent.id;

				originComponent.children.push(component.id);
			}
		} else {
			component.root = true;
			component.depth = 0;
		}

		if (component) {
			this.components.push(component);
		}

		return component;
	}

	getChildrenOf(id) {
		return this.components.filter((c) => c.parent === id);
	}

	traverse(fn = () => {}, node = this.tree) {
		const { children = [] } = node;

		fn(node);

		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			this.traverse(fn, child);
		}
	}

	persist(tree) {
		const createTree = (source, target) => {
			target.id = source.id;
			target.depth = source.depth;
			target.size = source.size;
			target.root = source.root;
			target.type = source.type;
			target.name = source.name;
			target.minimized = source.minimized;
			target.children = [];

			source.children?.forEach((child, index) => {
				target.children[index] = {};
				createTree(child, target.children[index]);
			});

			return target;
		};

		const mirrored = createTree(tree, {});

		persist(this.key, mirrored);
	}

	remove(component) {
		const parent = this.getComponent(component.parent);

		const componentIndex = parent.children.findIndex(
			(id) => id === component.id,
		);

		parent.children.splice(componentIndex, 1);
		const newSize = 1 / Math.max(1, parent.children.length - 1);
		parent.children.forEach((childID) => {
			const child = this.getComponent(childID);
			child.size = newSize;
		});

		this.components.splice(
			this.components.findIndex((c) => c.id === component.id),
			1,
		);

		if (parent.children.length === 0) {
			parent.size = 1;
			this.remove(parent);
		}
	}

	getComponent(id) {
		return this.components.find((c) => c.id === id);
	}
}

export let layout = new Layout();
