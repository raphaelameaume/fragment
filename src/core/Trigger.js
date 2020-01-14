class Trigger {
    constructor(type, value, enabled = true) {
        this.type = type;
        this.enabled = enabled;
        this.value = [value];
        this.onTriggerFn = () => {};
    }

    enable(value) {
        this.enabled = value;

        return this;
    }
    
    trigger(params) {
        this.onTriggerFn(params);
    }

    onTrigger(fn) {
        this.onTriggerFn = fn;

        return this;
    }
}

export { Trigger };