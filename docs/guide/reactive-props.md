# Reactive props

Fragment can expose configuration controllers to the interface by exporting a plain JavaScript Object named `props`. The following example demonstrates a basic setup that declares a single property with a default value and parameter constraints. The interface automatically creates a controller for this property.

```js
export let props = {
    radius: {
        value: 20,
        params: {
            min: 0,
            max: 1
        }
    }
};
```

Read more about `props` [here](../api/props.md).

Often, a sketch needs to update a property's value in code while ensuring that the interface reflects the change immediately. Fragment automatically tracks internal value updates, allowing the interface to stay synchronized without requiring additional logic. The next example shows a property that can be mutated programmatically, alongside another property that triggers those changes.

```js
export let props = {
    radius: {
        value: 20,
        params: {
            min: 10,
            max: 50
        }
    },
    randomRadius: {
        value: () => {
            const { min, max } = props.radius.params;
            props.radius.value = random(min, max); // <- this will update the controller for radius too!
        }
    }
};
```

## Adding props

In many situations, a sketch may need to introduce new properties dynamically at runtime. The example below demonstrates how a new controller can be generated based on an object created in the sketch. Each new object creates its own associated color controller that remains linked to the object's actual value.

```js
export let props = {
    radius: {
        value: 20,
        params: {
            min: 10,
            max: 50
        }
    },
    addObject: {
        value: () => {
            const object = createObject();

            props[`color${object.name}`] = { // <- this will create a new color picker in the interface!
                value: object.color,
                onChange: ({ value }) => {
                    object.color = value;
                }
            };
        }
    }
};
```

## Updating `params`

Parameter definitions may also need to change at runtime. The next example shows how a selectable list of modes is generated dynamically and refreshed as new modes are added.

```js

let modes = ['mode1', 'mode2'];

function createModeOptions() {
    return modes.map((mode, index) => ({ value: mode, label: `Mode ${index}`}));
}

export let props = {
    mode: {
        value: modes[0],
        params: {
            options: createModeOptions(),
        }
    },
    addNewMode: {
        value: () => {
            modes.push(`mode${modes.length+1}`);
            mode.params.options = createModeOptions();
        }
    }
};
```

## Monitoring changes

Some properties may need to be controlled entirely from code while still exposing their current state in the interface. The following example shows a seed value that cannot be changed directly from the interface but updates whenever another property is triggered.

```js
export let props = {
	seed: {
		value: generateSeed(), // A seed displayed but not user-editable
		disabled: true,
	},
	generate: {
		value: () => {
			props.seed.value = generateSeed();
		}
	}
};
```
