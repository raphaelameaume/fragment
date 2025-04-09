# Configuration

Fragment will automatically try to resolve a config file named `fragment.config.js` at the root.

This configuration file is optional and for now can only be used to specify Vite configuration options inside a `vite` object in the config.

```js
export default {
	vite: {

	}
}
```

You can refer to [Vite's documentation](https://vitejs.dev/config/) to see the available options. The resolved configuration is merged with Fragment's own Vite configuration following the `mergeConfig` [strategy](https://vitejs.dev/guide/api-javascript.html#mergeconfig).

You can specify another filepath for configuration with the `--config` flag on the command line such as:

```bash
fragment sketch.js --config custom/path/to/config.js
```
