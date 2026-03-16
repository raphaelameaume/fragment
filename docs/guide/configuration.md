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

## Config options

### server.port

- Type: `number`
- Default: `3000`

Specify the server port.

### server.open

- Type: `boolean`
- Default: `false`

Flag to open the application in the browser when the server starts.

### exportDir

- Type: `string`
- Default: `undefined`

Override directory used for exports.

### create.template

- Type: `'blank' | 'default' | 'fragment-gl' | 'p5' | 'p5-gl' | 'three-fragment' | 'three-orthographic' | 'three-perspective'`
- Default: `'default'`

Pre-populate template choice in create prompts.

### create.typescript

- Type: `boolean`
- Default: `false`

Pre-populate TypeScript support choice in create prompts.

### build.outDir

- Type: `string`
- Default: `undefined`

Pre-populate out directory in build prompts.

### build.emptyOutDir

- Type: `boolean`
- Default: `true`

Pre-populate flag to empty outDir before static build in build prompts.

### build.base

- Type: `string`
- Default: `undefined`

Pre-populate base public path in build prompts.

### build.prompts

- Type: `boolean`
- Default: `true`

Toggle interactive prompts in build prompts.

### preview.port

- Type: `number`
- Default: `3000`

Specify the preview server port.

### preview.open

- Type: `boolean`
- Default: `false`

Flag to open the application in the browser when the preview server starts.

### vite

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
