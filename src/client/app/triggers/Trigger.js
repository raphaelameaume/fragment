let ID = 0;

class Trigger {
    /**
     * 
     * @param {string} inputType 
     * @param {string} eventName 
     * @param {function} fn 
     * @param {object} params 
     */
    constructor(inputType, eventName, fn, params, destroy = () => {}) {
        this.id = ID++;
        this.inputType = inputType;
        this.eventName = eventName;
        this.fn = fn;
        this.params = params;
        this.enabled = true;
        this._destroy = destroy;
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

    destroy() {
        this._destroy();

        this.inputType = null;
        this.eventName = null;
        this.fn = null;
        this.params = null;
        this.enabled = null;
        this._destroy = null;
    }
}

export default Trigger;
