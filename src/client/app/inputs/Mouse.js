import Trigger from "../core/Trigger";

window.mouseIsPressed = false;
window.mouseX = 0;
window.mouseY = 0;

const wildcard = "*";

const downs = new Map();
const ups = new Map();
const moves = new Map();
const clicks = new Map();

const checkForTriggers = (collection, event, scope = null) => {
    const triggers = [
        ...(collection.has(scope) ? collection.get(scope) : []),
        ...(collection.has(wildcard) ? collection.get(wildcard) : []),
    ];

    triggers.forEach(trigger => trigger.run(event));
}

const createTrigger = (collection) => {
    return (fn, { scope = wildcard }) => {
        const trigger = new Trigger(fn, { scope });

        collection.push(trigger);

        return trigger;
    }
};

const findScope = (event) => {
    return [null, null, null];
};

window.addEventListener("mousedown", (event) => {
    window.mouseIsPressed = true;

    const [scope] = findScope(event);

    checkForTriggers(downs, event, scope);
});

window.addEventListener("mouseup", (event) => {
    window.mouseIsPressed = true;

    const [scope] = findScope(event);

    checkForTriggers(ups, event, scope);
});

window.addEventListener("mousemove", (event) => {
    // find scope
    const [name, $element, rect] = findScope(event);
    // compute x and y from $element, rect and current event pos
    // assign window.mouseX and window.mouseY
    checkForTriggers(moves, event, name);
});

window.addEventListener("click", (event) => {
    const [scope] = findScope(event);

    checkForTriggers(clicks, event, scope);
});

export const onMouseDown = createTrigger(downs);
export const onMouseUp = createTrigger(ups);
export const onMouseMove = createTrigger(moves);
export const onClick = createTrigger(clicks);
