# Configuration

Fragment will automatically try to resolve a config file named `fragment.config.js` at the root of the current working directory. This configuration file is optional.

```js
// fragment.config.js
export default {

}
```

A different configuration file path can be provided using the `--config` flag on the command line:

```bash
fragment sketch.js --config custom/path/to/config.js
```

## Extending Vite

Vite's configuration can be extended by adding Vite options under the `vite` property in the config file.

```js
export default {
	vite: {
		// vite config options
	}
}
```

Refer to [Vite's documentation](https://vitejs.dev/config/) for available configuration options. The final configuration is merged with Fragment's Vite setup using the `mergeConfig` [strategy](https://vitejs.dev/guide/api-javascript.html#mergeconfig).

## Config Intellisense

Fragment includes TypeScript typings, allowing IDEs to provide Intellisense when using JSDoc type annotations:

```js
/**
 * @type {import('fragment-tools').Config}
 */
 export default {

 }
 ```

 The `defineConfig` helper can also be used to enable Intellisense support without JSDoc annotations:

 ```js
 import { defineConfig } from 'fragment-tools';

 export default defineConfig({
   // ...
 })
 ```

 ## TypeScript support

 Fragment also supports TypeScript config files with `fragment.config.ts`.
