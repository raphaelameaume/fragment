import { Trigger } from "./Trigger.js";

export const TRIGGER_KEY_PRESS = 'Keyboard-KeyPress';
export const TRIGGER_KEY_DOWN = 'Keyboard-KeyDown';
export const TRIGGER_KEY_UP = 'Keyboard-KeyUp';

const Keyboard = function() {
    let triggersKeyDown = [];
    let triggersKeyPress = [];
    let triggersKeyUp = [];

    window.addEventListener('keypress', onKeyPress);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    function onKeyPress(event) {
        
        checkTriggers(triggersKeyPress, event);
    }

    function onKeyDown(event) {
        checkTriggers(triggersKeyDown, event);
    }

    function onKeyUp(event) {
        checkTriggers(triggersKeyUp, event);
    }

    function checkTriggers(collection, event) {

        for (let i = 0; i < collection.length; i++) {
            if (collection[i].value.includes(event.key) && collection[i].enabled) {
                collection[i].trigger(event);
            }
        }
    }

    function key(value) {
        return keypress(value);
    }

    function keypress(value) {
        let trigger = new Trigger(TRIGGER_KEY_PRESS, value);

        addTrigger(trigger, triggersKeyPress);

        return trigger;
    }

    function keydown() {
        let trigger = new Trigger(TRIGGER_KEY_DOWN, value);

        addTrigger(trigger, triggersKeyDown);

        return trigger;
    }

    function keyup() {
        let trigger = new Trigger(TRIGGER_KEY_UP, value);

        addTrigger(trigger, triggersKeyUp);

        return trigger;
    }

    function addTrigger(trigger, collection) {
        if (collection === undefined) {
            collection = trigger.type === TRIGGER_KEY_UP ? triggersKeyUp :
                trigger.type === TRIGGER_KEY_DOWN ? triggersKeyDown : triggersKeyPress; 
        }

        
        collection.push(trigger);
        console.log('Keyboard :: addTrigger', trigger.type, collection);
        trigger.destroy = () => {
            for (let i = 0; i < collection.length; i++) {
                if (trigger.id === collection[i].id) {
                    collection.splice(i, 1);
                }
            }
        };
    }

    return {
        key,
        keydown,
        keyup,
        keypress,
        addTrigger,
        TRIGGER_KEY_DOWN,
        TRIGGER_KEY_PRESS,
        TRIGGER_KEY_UP,
    };
}();

export { Keyboard };