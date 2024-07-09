function createLayout() {
	let COMPONENT_ID = 0;
	let layout = $state({});
	let editing = $state(false);
	let previewing = $state(false);

	function createComponent({
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
		let existingComponent = getComponent(id);
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
				const prevRoot = origin;

				const newRoot = createComponent({
					root: true,
					type: prevRoot.type === 'column' ? 'row' : 'column',
				});

				console.log(newRoot);

				prevRoot.root = false;
				component.parent = newRoot;
				prevRoot.parent = newRoot;
				prevRoot.size = 0.5;
				component.size = 0.5;

				newRoot.children.push(prevRoot);
				newRoot.children.push(component);

				layout = newRoot;
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

			const replacement = createComponent({
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

	function traverse(fn = () => {}, node = layout) {
		const { children = [] } = node;

		fn(node);

		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			traverse(fn, child);
		}
	}

	function replaceChildren(component, newChildren) {
		traverse((c) => {
			if (c.id === component.id) {
				c.children = newChildren;
			}
		});
	}

	function swapRoot(newRoot) {
		traverse((c) => {
			if (!c.root && c.type !== 'module') {
				c.depth = c.depth + 1;
			}
		}, newRoot);
	}

	function updateComponent(component, newProperties = {}) {
		let updated = false;

		traverse((c) => {
			if (c.id === component.id) {
				updated = true;
				if (typeof newProperties === 'object') {
					Object.assign(c, newProperties);
				} else if (typeof newProperties === 'function') {
					Object.assign(c, newProperties(c));
				}
			}
		}, t);

		if (!updated) {
			console.warn(
				`Cannot find component to update with id ${component.id}`,
			);
		}
	}

	function addSibling(component, sibling) {
		traverse((c) => {
			if (c.id === component.parent) {
			}
		});
	}

	function addChild(component, newChild) {
		traverse((c) => {
			if (c.id === component.id) {
				c.children.push(newChild);
			}
		});
	}

	function resize(nodes = []) {
		traverse((c) => {
			nodes.forEach((n) => {
				if (n.id === c.id) {
					c.size = n.size;
				}
			});
		});
	}

	function remove(component) {
		console.log(`Layout :: remove`, component);

		const { parent } = component;

		const componentIndex = parent.children.findIndex(
			(c) => c.id === component.id,
		);

		console.log({ componentIndex });

		// parent.children = parent.children.filter(
		// 	(c, i) => c.id !== component.id,
		// );

		parent.children.splice(componentIndex, 1);
		const newSize = 1 / (parent.children.length - 1);
		parent.children.forEach((child) => {
			child.size = newSize;
		});

		if (parent.children.length === 0) {
			// remove(parent);
		}
	}

	function getComponent(id) {
		let component;

		traverse((c) => {
			if (c.id === id) {
				component = c;
			}
		});

		return component;
	}

	return {
		get current() {
			return layout;
		},
		set current(v) {
			Object.assign(layout, v);
		},
		get editing() {
			return editing;
		},
		set editing(v) {
			editing = v;
		},
		get previewing() {
			return previewing;
		},
		set previewing(v) {
			previewing = v;
		},
		traverse,
		replaceChildren,
		swapRoot,
		updateComponent,
		addSibling,
		addChild,
		createComponent,
		getComponent,
		resize,
		remove,
	};
}

export let layout = createLayout();
