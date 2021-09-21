let ID = 0;

class Trigger {
    constructor(fn, params) {
        this.id = ID++;
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
