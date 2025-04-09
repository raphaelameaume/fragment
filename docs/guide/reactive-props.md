# Reactive props

In order to create controllers in the interface, your sketch can export a plain JavaScript Object named `props` like this:

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

However, you might want to update the value from your code and the interface to update accordingly. Fragment tracks value changes internally so you don't have to do anything and it works out-of-the-box.

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

With reactive props, you can enable complex behaviours such as:
- Adding props

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

- Change prop `params`

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

- Monitor value changes

```js
export let props = {
	seed: {
		value: generateSeed(), // seed cannot be changed from the interface but will reflect new values on click on `generate`
		disabled: true,
	},
	generate: {
		value: () => {
			props.seed.value = generateSeed();
		}
	}
};
```
