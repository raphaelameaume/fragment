class Trigger {
    constructor(type, value, enabled = true) {
        this.enabled = enabled;
        this.value = [value];
        this.onTriggerFn = () => {};
    }

    enable(value) {
        this.enabled = value;

        return this;
    }
    
    trigger() {
        this.onTriggerFn();
    }

    onTrigger(fn) {
        this.onTriggerFn = fn;

        return this;
    }
}

export { Trigger };