#### <sup>[fragment](../../README.md) → [Documentation](../README.md) → [Guide](../README.md#guide) → Reactive props</sup>
<br>

# Reactive props

By default, `fragment` recommends declaring props as a plain JavaScript Object like this:

```js
export let props = {
  radius: {
    value: 20,
  }
};
```

However, using a plain object prevents the interface to be synchronized with changes you might apply to values directly from code. 

```js
export let init = () => {
	let shouldChangeRadius = /*...*/;
	
	if (shouldChangeRadius) {
		props.radius.value = 40; // prop.radius in the interface will still display 20, e.g the initial value of the prop
	}
};
```

If you need the interface to change when updating prop values, you can make the interface reacts to value changes by wrapping your props in a helper function called `reactiveProps()` available on `@fragment/helpers` namespace.

```js
import { reactiveProps } from '@fragment/helpers';

export let props = reactiveProps({
  radius: {
    value: 20,
  }
});

export let init = () => {
	let shouldChangeRadius = /*...*/;
	
	if (shouldChangeRadius) {
		props.radius.value = 40; // prop.radius in the interface will be updated
	}
};
```

By making the props *reactive* to code changes, you can enable complex behaviours such as:
- Adding props on the fly

```js
export let init = () => {
	onClick((event) => {
		const sphere = retrieveSelectedObject(event);

		// create new color controller
		props.objectColor = {
			value: sphere.color,
		};

		// create new number controller
		props.radius = {
			value: sphere.radius,
			params: {
				min: 0,
				max: sphere.radius * 4,
				step: 0.01,
			}
		};
	});
};
```

- Change prop params on the fly

```js
export let props = {
	mode: {
		value: 'mode1',
		params: {
			options: ['mode1', 'mode2']
		}
	}
};

export let init = () => {
	onClick((event) => {
		let shouldUpdateMode = /*...*/
		if (shouldUpdateMode) {
			props.mode.params.options = ['mode3', 'mode4'];
			props.mode.value = props.mode.params.options[0];
		}
	});
};
```

- Log values

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

## Why isn't it the recommended way of declaring props?

See [`Principles → Freedom`](./about.md#freedom).
