class Trigger {
    constructor(type, value, enabled = true) {
        this.type = type;
        this.enabled = enabled;
        this.value = [value];

        this.triggersFn = [];
    }

    enable(value) {
        this.enabled = value;

        return this;
    }
    
    trigger(params) {
        console.log('trigger', this);

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