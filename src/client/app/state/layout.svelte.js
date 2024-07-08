function createLayout() {
	let COMPONENT_ID = 0;
	let layout = $state({});
	let editing = $state(false);
	let previewing = $state(false);

	function createComponent({
		id = COMPONENT_ID++,
		parent = null,
		root = parent === null,
		node = null,
		depth,
		size = 1,
		minimized = false,
		type,
		children = [],
	}) {
		const component = {
			id,
			root,
			node,
			depth,
			size,
			minimized,
			parent: parent ? parent.id : null,
			type,
			children,
			registerChild: (child) => {
				addChild(component, child);
			},
		};

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

		return newRoot;
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
				const index = c.children.findIndex(
					(k) => k.id === component.id,
				);

				const { size } = c.children[index];
				c.children[index].size = size * 0.5;
				sibling.size = size * 0.5;

				const newChildren = [...c.children];

				newChildren.splice(index + 1, 0, sibling);

				c.children.length = 0;
				c.children.push(...newChildren);
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
		resize,
		remove,
	};
}

export let layout = createLayout();
