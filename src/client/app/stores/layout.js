import { writable, get } from "svelte/store";
import { sketchesCount } from "@fragment/props";
import { defaultLayouts } from "../data/LayoutData";
import { getPersistentStore, keepInSync, rehydrate } from "./utils";
import { afterUpdate, beforeUpdate, onDestroy, onMount, tick } from "svelte";

const isMany = sketchesCount > 1;
const key = `fragment.layout.current.${isMany ? 'multiple' : 'single'}`;

export const outputLayout = defaultLayouts.find((layout) => layout.name === "Output");
export const singleLayout = defaultLayouts.find((layout) => layout.name === "Single");
export const sketchLayout = defaultLayouts.find((layout) => layout.name === "Sketching");

let defaultLayout = sketchLayout;

if (__PRODUCTION__) {
    defaultLayout = singleLayout;
}

let override = !window.location.search.includes('?output');
override = __PRODUCTION__ ? false : true;

if (window.location.search.includes('?output')) {
    defaultLayout = outputLayout;
}

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

tree.subscribe((value) => {
    // console.log("Tree was updated");
    // console.log(value);
});

let data = [];

let root;
export const current = writable({
    editing: false,
    registerChild: (component, children) => {
        onMount(() => {
            data = [...data, component];

            component.children = children();

            if (component.root) {
                root = component;
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
}

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
