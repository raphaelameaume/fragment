import { writable, get } from "svelte/store";
import { getStore, createStore } from "./utils";
import { onMount } from "svelte";

export const tree = getStore("layout.current", {}, {
    persist: !__BUILD__
});

export const layout = createStore('layout', {
    editing: false,
    previewing: false,
    registerChild: (component, children) => {
        onMount(() => {
            component.children = children();

            if (component.root) {
                tree.set(cleanNodes(component));
            }
        });
    },
});

function cleanNodes(value) {
    return JSON.parse(JSON.stringify(value, (key, value) => {
        if (!(value instanceof HTMLElement)) {
            return value;
        }
    }));
}

export function traverse(fn = () => {}, node = get(tree)) {
    const { children = [] } = node;

    fn(node);

    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        traverse(fn, child);
    }
};

export const replaceChildren = (component, newChildren) => {
    tree.update((t) => {
        traverse((c) => {
            if (c.id === component.id) {
                c.children = newChildren;
            }
        }, t);

        return t;
    });
};

export const swapRoot = (newRoot) => {
    tree.update((t) => {
        traverse((c) => {
            if (!c.root && c.type !== "module") {
                c.depth = c.depth + 1;
            }
        }, newRoot);

        return newRoot;
    })
};

export const addSibling = (component, sibling) => {
    tree.update((t) => {
        traverse((c) => {
            if (c.id === component.parent) {
                const index = c.children.findIndex( k => k.id === component.id);

                const { size } = c.children[index];
                c.children[index].size = size * 0.5;
                sibling.size = size * 0.5;

                const newChildren = [
                    ...c.children,
                ];

                newChildren.splice(index + 1, 0, sibling);

                c.children = newChildren;
            }
        });

        return t;
    })
};

export const addChildren = (component, newChild) => {
    tree.update((t) => {
        traverse((c) => {
            if (c.id === component.id) {
                c.children = [
                    ...c.children,
                    newChild,
                ];
            }
        }, t);

        return t;
    })
};

export const remove = (node) => {
    tree.update((t) => {
        traverse((c) => {
            const { children = [] } = c;
            const childIndex = children.findIndex( k => k.id === node.id);

            if (childIndex >= 0) {
                const newChildren = [...children];
                newChildren.splice(childIndex, 1);

                newChildren.forEach((k) => {
                    k.size = 1. / newChildren.length;
                });

                if (newChildren.length === 0) {
                    remove(c);
                }

                c.children = newChildren;
            }
        }, t);

        return t;
    });
};

/**
 * Assign new or reassign existing properties to an exisiting component in the lauout
 * @param {Number} id - the id of the component to update
 * @param {object} newProperties - the new properties to assign to the component
 */
export const updateComponent = (component, newProperties = {}) => {
    tree.update((t) => {
        let updated = false;

        traverse((c) => {
            if (c.id === component.id) {
                updated = true;
                if (typeof newProperties === "object") {
                    Object.assign(c, newProperties);
                } else if (typeof newProperties === "function") {
                    Object.assign(c, newProperties(c));
                }
            }
        }, t);

        if (!updated) {
            console.warn(`Cannot find component to update with id ${component.id}`);
        }

        return t;
    });
};

export const updateModule = (m, newProperties = {}) => {
    tree.update((t) => {
        traverse((c) => {
            if (c.mID === m.mID) {
                if (typeof newProperties === "object") {
                    Object.assign(c, newProperties);
                } else if (typeof newProperties === "function") {
                    Object.assign(c, newProperties(c));
                }
            }
        }, t);

        return t;
    });
};

export const resize = (nodes = []) => {
    tree.update((t) => {
        traverse((c) => {
            nodes.forEach(n => {
                if (n.id === c.id) {
                    c.size = n.size;
                }
            });
        }, t);

        return t;
    });
};
