let COMPONENT_ID = 0;

class Layout {
	tree = $state({});
	editing = $state(false);
	previewing = $state(false);

	createComponent({
		id = COMPONENT_ID++,
		origin = null,
		root = origin === null,
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

		const component = {
			id,
			root,
			node,
			size,
			minimized,
			name,
			type,
			children,
		};

		const isSibling = component.type === origin?.type;

		if (component.root) {
			component.depth = 0;
		} else if (isSibling) {
			if (origin.root) {
				origin.children.length = 0;
				// const intermediate = createComponent({
				// 	type: 'row',
				// 	size: 1,
				// 	origin,
				// });
				const col1 = this.createComponent({
					type: 'row',
					size: 0.5,
					origin,
				});

				const col2 = this.createComponent({
					type: 'row',
					size: 0.5,
					origin,
				});

				const col3 = this.createComponent({
					type: 'column',
					size: 0.5,
					origin: col1,
				});

				const col4 = this.createComponent({
					type: 'column',
					size: 1,
					origin: col1,
				});
			} else {
				// add sibling
				const { parent } = origin;

				const index = parent.children.findIndex(
					(k) => k.id === origin.id,
				);

				const { size } = origin;
				origin.size = size * 0.5;
				component.size = size * 0.5;
				component.depth = origin.depth;
				component.parent = parent;
				parent.children.splice(index + 1, 0, component);
			}
		} else if (
			origin.children.length === 1 &&
			origin.children[0].type === 'module'
		) {
			const childModule = origin.children[0];
			childModule.depth += 1;
			origin.children.length = 0;

			const replacement = this.createComponent({
				type: origin.type === 'column' ? 'row' : 'column',
				origin,
			});
			replacement.children.push(childModule);
			component.parent = origin;
			origin.children.splice(0, 1, replacement, component);
		} else {
			component.depth = origin.depth + 1;
			component.parent = origin;

			origin.children.push(component);
		}

		return component;
	}

	traverse(fn = () => {}, node = this.tree) {
		const { children = [] } = node;

		fn(node);

		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			this.traverse(fn, child);
		}
	}

	remove(component) {
		const { parent } = component;

		const componentIndex = parent.children.findIndex(
			(c) => c.id === component.id,
		);

		parent.children.splice(componentIndex, 1);
		const newSize = 1 / (parent.children.length - 1);
		parent.children.forEach((child) => {
			child.size = newSize;
		});

		if (parent.children.length === 0) {
			// remove(parent);
		}
	}

	resize(nodes = []) {
		this.traverse((c) => {
			nodes.forEach((n) => {
				if (n.id === c.id) {
					c.size = n.size;
				}
			});
		});
	}

	getComponent(id) {
		let component;

		this.traverse((c) => {
			if (c.id === id) {
				component = c;
			}
		});

		return component;
	}
}

export let layout = new Layout();
