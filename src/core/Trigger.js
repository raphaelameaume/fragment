let TRIGGER_ID = 0;

class Trigger {
    constructor(type, value, enabled = true) {
        this.id = TRIGGER_ID++;
        this.type = type;
        this.enabled = enabled;
        this.value = Array.isArray(value) ? value : [value];

        this.triggersFn = [];
    }

    enable(value) {
        this.enabled = value;

        return this;
    }
    
    trigger(params) {
        for (let i = 0; i < this.triggersFn.length; i++) {
            this.triggersFn[i](params);
        }
    }

    onTrigger(fn) {
        this.triggersFn.push(fn);

        return this;
    }
}

export { Trigger };