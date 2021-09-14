<script>
import Select from "./fields/Select.svelte";
import NumberInput from "./fields/NumberInput.svelte";
import Vec2Input from "./fields/Vec2Input.svelte";
import Vec3Input from "./fields/Vec3Input.svelte";

export let value;
export let name;
export let onChange = () => {};
export let params = {};

const fields = {
    "select": Select,
    "number": NumberInput,
    "vec2": Vec2Input,
    "vec3": Vec3Input,
};

function inferFromParams() {
    if (params.options && Array.isArray(params.options)) {
        return "select";
    }

    return null;
}

function inferFromValue() {
    if (typeof value === "number") {
        return "number";
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

function sanitize(value, type) {
    if (type === "vec2" || type === "vec3") {
        if (Array.isArray(value)) {
            return value.reduce((all, v, index) => {
                if (typeof v === "number") {
                    all[index] = {
                        value: v,
                        label: ""
                    }
                } else {
                    all[index] = v;
                }

                return all;
            }, []);
        } else if (typeof value === "object") {
            return Object.keys(value).map((key) => {
                return { label: key, value: value[key] }
            });
        }
    }

    return value;
}

let type = inferFromParams() || inferFromValue();
let input = fields[type];
let sanitizedValue = sanitize(value, type);

console.log(params);

</script>

<div class="field">
    <div class="field__name">
        <span class="field__text">{name}</span>
    </div>
    <div class="field__input">
        <svelte:component this={input} value={sanitizedValue} on:change={onChange} {...params} />
    </div>
</div>

<style>
.field {
    display: flex;
    width: 100%;
    justify-content: space-around;
    align-items: center;
}

.field__name {
    flex: 0.75;
}

.field__text {
    color: #f0f0f0;
    font-size: 12px;
}

.field__input {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    flex: 1;
    padding-right: 4px;
}
</style>
