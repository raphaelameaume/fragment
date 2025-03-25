# Organizing props

As your props count grow with your project, it eventually becomes a really long list of controllers that might be hard to navigate.

There's two ways in Fragment to organize props, [folders](#folders) and [groups](#groups).

## Folders

Props can be organized in folders and subfolders, like many other GUIs library.

To put a prop in a folder, you can just do this:

```js
export let props = {
	count: {
		value: 12,
		params: {
			min: 1,
			max: 30,
		},
		folder: 'cubes', // <- Fragment will put the count controller in a folder named "cubes"
	}
};
```

If multiple props share the same folder name, they will be put in the same folder based on the order of props.

```js
export let props = {
	count: {
		value: 12,
		params: {
			min: 1,
			max: 30,
		},
		folder: 'cubes', // <- Fragment will put the count controller in a folder named "cubes"
	},
	speed: {
		value: 1,
		folder: 'physics', // <- Fragment will create a second folder 'physics'
	},
	scale: {
		value: 1,
		folder: 'cubes', // <- Fragment will put the "scale" controller in the first folder "cubes"
	}
};
```

You can create subfolder by joining folder names with a `.` such as:

```js
export let props = {
	count: {
		value: 12,
		params: {
			min: 1,
			max: 30,
		},
		folder: 'scene.objects.cubes', // <- Fragment will put the count controller in a subfolder named "cubes", child of another folder named "objects", itself child of a folder named "scene"
	}
};
```

By default, a folder is not collapsed. During development, Fragment will preserve the state of the folder (collapsed or not) between hot reloads. It is possible to specify the state of the folder by using attributes in the folder string.

```js
export let props = {
	count: {
		value: 12,
		params: {
			min: 1,
			max: 30,
		},
		folder: 'cubes[collapsed=true]', // <- Fragment will put the count controller in a folder named "cubes" and set the initial state to collapsed
	}
};
```

## Groups

Props can also be organized in **groups**. Groups can be used to filter props display in the Params module.
If one prop has a group specified, Fragment will create a <select> at the top of the Params module so you can filter the group to be displayed.
This behaviour allows to have one or multiple Params modules in the layout and arrange props in very different ways.

```js

export let props = {
	color: {
		value: '#ff0000',
		group: 'materials',
	},
};
```

By default, Fragment will create 3 filters if 1 group is specified:
- "all" (self-explanatory)
- "output" (canvas dimensions)
- "materials" (custom group)

Fragment will preserve the choice of the group between hot reloads and hard refreshes.
