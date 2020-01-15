import { Trigger } from "./Trigger.js";

const Keyboard = function() {
    let triggers = [];

    window.addEventListener('keypress', onKeyPress);

    function onKeyPress(event) {
        for (let i = 0; i < triggers.length; i++) {
            if (triggers[i].value.includes(event.key) && triggers[i].enabled) {
                triggers[i].trigger();
            }
        }
    }

    function key(value) {
        let trigger = new Trigger('keyboard', value);

        addTrigger(trigger);
        
        return trigger;
    }

    function addTrigger(trigger) {
        console.log('Keyboard :: addTrigger', trigger.type, trigger.value);

        let index = triggers.length;
        triggers.push(trigger);
        trigger.destroy = () => {
            triggers.splice(index, 1);
        };
    }

    return {
        key,
        addTrigger,
    };
}();

export { Keyboard };