import { writable, get } from "svelte/store";
import { sketchesCount } from "@fragment/props";
import { getPersistentStore } from "./utils";
import { onDestroy, onMount } from "svelte";

export let tree = getPersistentStore("fragment.layout.current", false, {});

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

let data = [];

export const current = writable({
    editing: false,
    registerChild: (component, children) => {
        onMount(() => {
            data = [...data, component];

            component.children = children();

            if (component.root) {
                tree.set(cleanNodes(component));
            }
        });

        onDestroy(() => {
            const index = data.findIndex((c) => c === component);

            data = data.filter((c, i) => i !== index);
        })
    },
    removeChild: (child) => {
        const index = data.findIndex((c) => c === child);

        data = data.filter((c, i) => i !== index);
    }
});

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

export const updateModule = (m, { name } = {}) => {
    tree.update((t) => {
        traverse((c) => {
            if (c.mID === m.mID) {
                c.name = name;
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
