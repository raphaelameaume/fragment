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

### typescript

- Type: `boolean`
- Default: `false`

Specify TypeScript support for new sketch creation.

### base

- Type: `string`
- Default: `undefined`

Base public path when served in production.

### outDir

- Type: `string`
- Default: `undefined`

Build output directory.

### emptyOutDir

- Type: `boolean`
- Default: `true`

Empty outDir before static build.

### exportDir

- Type: `string`
- Default: `undefined`

Directory used for exports.

### port

- Type: `number`
- Default: `3000`

Port to bind.

### open

- Type: `boolean`
- Default: `false`

Open in browser.

### prompts

- Type: `boolean`
- Default: `true`

Enable interactive prompts.

### Extending Vite

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
