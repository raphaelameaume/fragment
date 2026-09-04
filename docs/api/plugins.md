# Plugins

Fragment **plugins** extend the toolkit with additional [modules](#modules) and [inputs](#inputs). A plugin is a small factory function, published as a package or kept local to a project that Fragment loads at startup.

## Configuration

Plugins are added in `fragment.config.js`:

```js
import audioPlugin from 'fragment-plugin-audio';

export default {
  plugins: [audioPlugin()],
};
```

Plugins are just functions, so they can accept options:

```js
export default {
  plugins: [audioPlugin({ sampleRate: 48000 })],
};
```

## Authoring

A plugin is a function that returns an object with a `name` and, optionally, [`modules()`](#modules) and [`inputs()`](#inputs).

| name | type | description |
|---|---|---|
| `name` | `string` | Unique identifier for the plugin. |
| `modules` | `() => ModuleRegistration[]` | Returns the modules this plugin adds. |
| `inputs` | `() => InputRegistration[]` | Returns the input types this plugin adds. |

```js
export default function audio() {
  return {
    name: 'fragment-plugin-audio',
    modules() {
      /* ... */
    },
    inputs() {
      /* ... */
    },
  };
}
```

A plugin might only add a single module or a single input, it doesn't need to add both.

### `modules`
- Type: `() => { name: string, component: string }[]`

Registers modules that will show up in the module selector when editing Fragment's layout.

| name | type | description |
|---|---|---|
| `name` | `string` | Unique key the module is listed under. |
| `component` | `string` | Absolute filesystem path to the module's Svelte component. |

```js
modules() {
  return [
    {
      name: 'audio',
      component: path.join(dir, 'client/Audio.svelte'),
    },
  ];
}
```

### `inputs`
- Type: `() => { type: string, input: string, triggers?: string }[]`

Registers new input types.

| name | type | description |
|---|---|---|
| `type` | `string` | Unique key the input is listed under. |
| `input` | `string` | Absolute filesystem path to the JS module exporting the input definition. |
| `triggers` | `string` | Optional. Absolute filesystem path to a companion Svelte component used to trigger this input. |

```js
inputs() {
  return [
    {
      type: 'Audio',
      input: path.join(dir, 'client/inputs/Audio.js'),
      triggers: path.join(dir, 'client/Triggers.svelte'),
    },
  ];
}
```

> `input` points to a plain JS module (not a Svelte component) and `triggers` should be a Svelte component that will be rendered when selecting this input type in the triggers input type list.

### Resolving paths

`component`, `input`, and `triggers` must be **absolute paths**. A plugin knows where its own files live, so it should resolve them itself using `import.meta.url`:

```js
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = fileURLToPath(new URL('.', import.meta.url));
```

`dir` can then be combined with `path.join()` to build each path, regardless of where the plugin package sits on disk or which directory Fragment was started from.

## Writing a module component

A module's `component` is a plain Svelte component, rendered by Fragment's module renderer. It receives whatever props the renderer forwards, and is expected to wrap its content in `@fragment/ui/Module.svelte`.

| prop | type | description |
|---|---|---|
| `headless` | `boolean` | `true` when the module is rendered without its surrounding chrome (e.g. embedded elsewhere). Forward it to `<Module>` rather than branching on it yourself. |
| `...restProps` | `object` | Any remaining props the renderer passes down. Spread these onto `<Module>` as well, since Fragment may add more over time. |

```svelte
<script>
  import Module from '@fragment/ui/Module.svelte';
  import Field from '@fragment/ui/Field.svelte';

  let { headless = false, ...restProps } = $props();
</script>

<Module name="Audio" {headless} {...restProps}>
  <Field key="bpm" value={/* ... */} onchange={(value) => {/* ... */}} />
</Module>
```

Fields inside a module are built from `@fragment/ui/Field.svelte` (plus layout helpers like `FieldInputRow` and `FieldSpace`). A field can be made triggerable by binding a `triggers` array to it:

```svelte
<Field
  key="tap"
  value={onTap}
  bind:triggers={AudioState.triggersTap}
/>
```

To react when a bound trigger fires inside the module itself, use `registerTriggers` from `@fragment/state/registerTriggers.svelte`:

```js
import { registerTriggers } from '@fragment/state/registerTriggers.svelte';

registerTriggers(AudioState.triggersTap, () => onTap());
registerTriggers(
  AudioState.triggersGain,
  (value) => { AudioState.gain = value; },
  { min: 0, max: 1, step: 0.001 },
);
```

## Writing an input

`input` points to a JS module whose **default export is a singleton instance** of a class extending `Input` from `@fragment/inputs/Input`:

```js
import Input from '@fragment/inputs/Input';

class Audio extends Input {
  constructor() {
    super({ type: 'Audio' });
    // set up whatever state/resources this input needs
  }

  update(time, deltaTime) {
    // called every frame; compute values and notify bound triggers
    this.runTriggers(
      { value: /* ... */ },
      { eventName: 'onFFT' },
    );
  }
}

export default new Audio();
```

| piece | description |
|---|---|
| `super({ type })` | `type` must match the `type` string this input was registered under in [`inputs()`](#inputs). |
| `runTriggers(payload, options)` | Inherited from `Input`. Call it to push values out to any field currently bound to this input via `bind:triggers`, tagged with an `eventName` so the corresponding [`triggers`](#writing-a-triggers-component) component can offer it as an option. `options.filter` and `options.onRun` can be used to gate or transform the payload per-trigger. |

An input can expose whatever additional methods and state make sense for it (`Audio` above adds `listDevices()`, `tap()`, `resync()`, etc.) — module and triggers components import it directly and call into it like any other object.

## Writing a triggers component

`triggers`, if provided, is a Svelte component used to configure how a field reacts to this input's events — for example, picking which of an input's `eventName`s drives the field, and setting per-trigger parameters.

| prop | type | description |
|---|---|---|
| `trigger` | `{ eventName: string, params: object }` | The trigger being edited. Read `trigger.eventName`/`trigger.params.*` to drive the UI, and write back to them in `onchange` handlers to persist changes. |
| `controllable` | `boolean` | Distinguishes fields that expect a continuous/controllable value (e.g. exposing `onFFT`/`onBPMProgress`) from those that just expect a discrete event (e.g. `onBPM`). Use it to decide which `eventName` options to offer. |

```svelte
<script>
  import Field from '@fragment/ui/Field.svelte';

  let { trigger, controllable } = $props();
  let eventName = $derived(trigger.eventName);
</script>

<Field
  key="event"
  value={eventName}
  params={{ options: controllable ? [{ value: 'onFFT' }] : [{ value: 'onBPM' }] }}
  onchange={(value) => { trigger.eventName = value; }}
/>
```

The rest of the trigger's UI is just conditional `Field`s reading and writing `trigger.params.*` based on the selected `eventName` — see the [`inputs`](#inputs) example above for how `eventName`/`params` map onto what the input's `runTriggers()` call emits.

## Example

```js
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = fileURLToPath(new URL('.', import.meta.url));

export default function audio() {
  return {
    name: 'fragment-plugin-audio',
    modules() {
      return [
        {
          name: 'audio',
          component: path.join(dir, 'client/Audio.svelte'),
        },
      ];
    },
    inputs() {
      return [
        {
          type: 'Audio',
          input: path.join(dir, 'client/inputs/Audio.js'),
          triggers: path.join(dir, 'client/Triggers.svelte'),
        },
      ];
    },
  };
}
```
