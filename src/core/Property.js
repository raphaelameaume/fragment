class Property {

    constructor({ name, value, min, max, type, step = 0.1, triggers = [] }) {
        this.name = name;
        this.value = value;
        this.min = min;
        this.max = max;
        this.type = type ? type : typeof value;
        this.triggers = triggers;

        this.triggersFn = [];
        this.changesFn = [];
    }

    onTrigger(fn) {
        this.triggersFn.push(fn);
    }

    onChange(fn) {
        this.changesFn.push(fn);
    }

    update() {
        for (let i = 0; i < this.changesFn.length; i++) {
            this.changesFn[i]();
        }
    }

}

export { Property };