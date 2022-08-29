#### <sup>[fragment](../../README.md) → [Documentation](../README.md) → [Guide](../README.md#guide) → External dependencies</sup>
<br>

# External dependencies

You can manage dependencies of your project like you would do on a traditional `npm` project, [vite](https://vitejs.dev/) will bundle them on the fly on the first render of your sketch.

## Example 

```
# Install a package from npmjs.com
npm install my-project-dependency
```

```js
// sketch.js
import dependency from "my-project-dependency";

export let init = () => {
	// use `dependency` here
};
```
