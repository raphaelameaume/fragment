import { client } from "../client";

export function inferFromParams(params) {
    if (params.options && Array.isArray(params.options)) {
        return "select";
    }

    return null;
}

export function inferFromValue(value) {
    if (typeof value === "number") {
        return "number";
    } else if (typeof value === "function") {
        return "button";
    } else if (typeof value === "boolean") {
        return "checkbox";
    } else if (typeof value === "string") {
        if (colord(value).parsed) return "color";
        return "text";
    } else if (Array.isArray(value) && value.length === 2) {
        return "vec2";
    } else if (Array.isArray(value) && value.length === 3) {
        return "vec3";
    } else if (typeof value === "object" && Object.keys(value).length === 3) {
        return "vec3";
    } else if (typeof value === "object" && Object.keys(value).length === 2) {
        return "vec2";
    }
}

class Prop {

	constructor(key, { value, ...params } = {}) {
		this.key = key;
		this.value = value;
		this.type = inferFromParams(params) || inferFromValue(value);
		this.params = params;
		this.triggers = [];
	}

	set value(v) {
		this._value = v;
	}

	get value() {
		return this._value;
	}

	onTrigger(fn) {}

	onChange(fn) {}

	toJSON() {
		return {
			key: this.key,
			type: this.type,
			value: this.value,
			params: this.params,
			triggers: this.triggers,
		}
	}
}

export default Prop;
