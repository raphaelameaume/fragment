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

export let tree = getPersistentStore("fragment.layout.current", true, {});

function cleanNodes(value) {
    return JSON.parse(JSON.stringify(value, (key, value) => {
        if (!(value instanceof HTMLElement)) {
            return value;
        }
    }));
}

export function traverse(fn = () => {}, node = get(tree)) {
    console.log("traverse", node);
    const { children = [] } = node;

    fn(node);

    

    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        traverse(fn, child);
    }
};

tree.subscribe((value) => {
    console.log("Tree was updated");
    console.log(value);
});

let data = [];


let root;
export const current = writable({
    editing: false,
    registerChild: (component, children) => {
        onMount(() => {
            data = [...data, component];

            console.log("onMount", component);

            component.children = children();

            if (component.root) {
                root = component;
                tree.set(cleanNodes(component));
            }
        });

        onDestroy(() => {
            console.log("onDestroy", component);
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

export const addChild = (child, parent) => {
    tree.update((t) => {
        
    })
};

export const addSibling = (component, sibling) => {
    tree.update((t) => {
        traverse((c) => {
            if (c.id === component.parent) {
                c.children = [
                    ...c.children,
                    sibling,
                ]
            }
        })

        return t;
    })
};
