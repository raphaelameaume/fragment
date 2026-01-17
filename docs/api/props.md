# Props

Props are interactive parameters defined in a sketch to create GUI controls and dynamically update sketch values.
Fragment automatically infers the appropriate control type from the provided value and parameters.

## Prop

### `value`

- Type: `number | number[] | string | function | boolean | object | undefined`

```js
export let props = {
	text: {
		value: "hello world",
	},
	count: {
		value: 12,
	}
};
```

### `params`

- Type: `{ min?: number | number[], max: number | number[], options?: []}, step?: number`

```js
export let props = {
	text: {
		value: "hello world",
		params: {
			// create a select with different options
			options: ["hello world", "foo", "bar"]
		}
	},
	mode: {
		value: 0,
		params: {
			// create a select with custom labels
			options: [{
				value: 0,
				label: 'Mode 1',
			}, {
				value: 1,
				label: 'Mode 2',
			}]
		}
	},
	interval: {
		value: [1, 2],
		params: {
			// create an range input
			min: 0,
			max: 4,
		}
	}
}
```

### `onChange`

- Type: `(props: Prop, dimensions: { width: number, height: number, pixelRatio: number })`

Callback fired whenever the prop's `value` changes.

```js
function createTexture(text) {/*... */};

export let props = {
	text: {
		value: "hello world",
		onChange: ({ value }) => {
			createTexture(value);
		}
	}
}
```

The callback receives two arguments:

1. The changed prop object.
2. A context object with `width`, `height`, and `pixelRatio`.

### `displayName`

- Type: `string | null`

Overrides the visible label in the interface.
Set to `null` to hide the label and let the control take full width.

```js
export let props = {
	countX: {
		value: 10,
		displayName: "Columns"
	},
	countY: {
		value: 10,
		displayName: "Rows"
	},
}
```

### `disabled`

- Type: `boolean | () => boolean`

Disables the control.
Can be static or reactive to other props.

```js
export let props = {
	enableText: {
		value: false,
	},
	text: {
		value: "hello world",
		disabled: () => !props.enableText.value
	}
}
```

### `hidden`

- Type: `boolean | () => boolean`

Hides the control from the interface.
Can be static or reactive to other props.

```js
export let props = {
	displayText: {
		value: false,
	},
	text: {
		value: "hello world",
		hidden: () => !props.displayText.value
	}
}
```

### `folder`

- Type: `string`

Set the group of the prop. Check out [Organizing props - Folders](/docs/guide/organizing-props#folders) for details.

### `group`

- Type: `string`

Set the group of the prop. Check out [Organizing props](/docs/guide/organizing-props#groups) for details.

### `type`

- Type: `"select" | "number" | "vec" | "checkbox" | "text" | "textarea" | "list" | "color" | "button" | "download" | "import" | "image" | "interval"`

Forces the GUI control type, overriding automatic inference.

## Inference Table

Fragment will automatically choose the correct control type based on `value` and `params`.

| value type | params | control |
|---|---|---|
| `number` | `{ step?: number; suffix?: string }` | `<NumberInput>` |
| `number` | `{ min: number, max: number, step?: number }` | `<ProgressInput>` + `<NumberInput>` |
| `number` | `{ options: number[] \| { label?: string, value: number }[] }` | `<SelectInput>`|
| `string` | `{ label?: string }` | `<TextInput>`|
| `string` | `{ type: "textarea", height?: string }` | `<TextareaInput>`|
| `string` | `{ options: string[] \| { label?: string, value: string }[] }` | `<SelectInput>`|
| `function` | `{ label?: string }` | `<ButtonInput>`|
| `function` | `{ label?: string, type: "import", accept?: string }` | `<ImportInput>`|
| `number[]` | `{ locked?: boolean; suffix?: string }` | `<VectorInput>`|
| `number[2]` | `{ min: number, max: number, step?: number }` | `<IntervalInput>`|
| `boolean` | `none` | `<CheckboxInput>`|
| `{ x: number, y: number, z?: number, w?: number }` | `{ min: { x: number, y: number, z?: number, w?: number }, max: { x: number, y: number, z?: number, w?: number }, step?: { x: number, y: number, z?: number, w?: number } }` | `<VectorInput>`|
