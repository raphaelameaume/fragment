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
			Object.assign(layout, component);

			console.log('create root', component);

			// if (isSibling) {
			// 	const newSibling = createComponent({
			// 		type: component.type,
			// 		children: [...parent.children],
			// 		parent: parent,
			// 		root: false,
			// 	});

			// 	// switch type
			// 	parent.children = [newSibling, component];
			// 	parent.type = current.type === 'column' ? 'row' : 'column';

			// 	swapRoot(parent);
			// }
		} else {
			if (isSibling) {
				// add sibling
				console.log('add sibling to origin', component.type);
				console.log(origin);
				const { parent } = origin;

				// console.log({ origin, component });
				// // retrieve origin index
				const index = parent.children.findIndex(
					(k) => k.id === origin.id,
				);

				console.log(`origin is index`, index);
				const { size } = origin;
				origin.size = size * 0.5;
				component.size = size * 0.5;
				component.depth = origin.depth;

				const newChildren = [...parent.children];
				newChildren.splice(index + 1, 0, component);
				parent.children.length = 0;
				parent.children.push(...newChildren);

				console.log(parent.children);
			} else if (
				origin.children.length === 1 &&
				origin.children[0].type === 'module'
			) {
				const childModule = origin.children[0];
				console.log('replace children', component, childModule);

				origin.children = [component];

				// origin.children = [
				// 	createComponent({
				// 		type: component.type === 'row' ? 'column' : 'row',
				// 		children: [childModule],
				// 		root: false,
				// 		origin,
				// 	}),
				// 	component,
				// ];
			} else {
				component.depth = origin.depth + 1;
				component.parent = origin;

				origin.children.push(component);
			}
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

	function remove(node) {
		traverse((c) => {
			const { children = [] } = c;
			const childIndex = children.findIndex((k) => k.id === node.id);

			if (childIndex >= 0) {
				const newChildren = [...children];
				newChildren.splice(childIndex, 1);

				newChildren.forEach((k) => {
					k.size = 1 / newChildren.length;
				});

				if (newChildren.length === 0) {
					remove(c);
				}

				c.children = newChildren;
			}
		});
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
			layout = v;
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
