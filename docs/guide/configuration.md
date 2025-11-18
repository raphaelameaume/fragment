# Configuration

Fragment will automatically try to resolve a config file named `fragment.config.js` at the root. This configuration file is optional.

```js
export default {

}
```

You can specify another filepath for configuration with the `--config` flag on the command line such as:

```bash
fragment sketch.js --config custom/path/to/config.js
```

## Extending Vite

You might want to extend Vite's configuration. You can do so by adding Vite config options under the `vite` property.

```js
export default {
	vite: {
		// vite config options
	}
}
```

You can refer to [Vite's documentation](https://vitejs.dev/config/) to see the available options. The resolved configuration is merged with Fragment's own Vite configuration following the `mergeConfig` [strategy](https://vitejs.dev/guide/api-javascript.html#mergeconfig).

## Config Intellisense

Fragment ships with Typescript typings so you can leverage your IDE's intellisense with JSDoc type hints:

```js
/**
 * @type {import('fragment-tools').Config}
 */
 export default {
 
 }
 ```
 
 You can also use the `defineConfig` helper which will provide intellisense without the need for JSDoc annotations:
 
 ```js
 import { defineConfig } from 'fragment-tools';
 
 export default defineConfig({
   // ...
 })
 ```
 
 Fragment also supports TypeScript config files with `fragment.config.ts`.
