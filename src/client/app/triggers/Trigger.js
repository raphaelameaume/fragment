let ID = 0;

class Trigger {
    /**
     * 
     * @param {string} inputType 
     * @param {string} eventName 
     * @param {function} fn 
     * @param {object} params 
     */
    constructor(inputType, eventName, fn, params) {
        this.id = ID++;
        this.inputType = inputType;
        this.eventName = eventName;
        this.fn = fn;
        this.params = params;
        this.enabled = true;
    }

    assign(fn) {
        this.fn = fn;
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    run(...args) {
        if (this.enabled) {
            this.fn(...args);
        }
    }
}

export default Trigger;
