let ID = 0;

class Trigger {
    constructor(fn, options) {
        this.id = ID++;
        this.fn = fn;
        this.options = options;
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

    run() {
        if (this.enabled) {
            this.fn();
        }
    }
}

export default Trigger;
