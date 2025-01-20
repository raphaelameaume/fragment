<script>
	import JSONNested from './JSONNested.svelte';
	import JSONNode from './JSONNode.svelte';
	import JsonObjectNode from './JSONObjectNode.svelte';

	let { value = () => {} } = $props();

	let str = $derived(toString(value));
	let ctx = $derived(parseFunction(str));

	function parseFunction(str) {
		const match = str.match(
			/^(?:(async)\s+)?(?:function)?(\*)?\s*([^(]+)?(\([^)]*\))\s*(=>)?/,
		);
		const isAsync = match?.[1];
		const isGenerator = match?.[2];
		const fnName = match?.[3];
		const args = match?.[4];
		const isArrow = match?.[5];
		const classMatch = str.match(/^class\s+([^\s]+)/);
		const isClass = classMatch?.[1];

		return {
			args,
			isAsync,
			isGenerator,
			fnName,
			isArrow,
			isClass,
		};
	}

	function getPreview1({ isGenerator, isAsync, isClass }) {
		if (isClass) return `class ${isClass}`;
		return (isAsync ? 'async ' : '') + 'ƒ' + (isGenerator ? '*' : '');
	}

	function getPreview2({ isAsync, isArrow, fnName, args }) {
		return (
			(isArrow && isAsync ? 'async' : '') +
			' ' +
			(fnName ?? '') +
			args +
			(isArrow ? ' => …' : '')
		);
	}

	const FUNCTION = '[[Function]]';
	const PROTO = '[[Prototype]]';

	function getValue(key) {
		if (key === PROTO) return value.__proto__;
		return value[key];
	}

	function filterKeys(key) {
		if (key === FUNCTION) return true;
		return getValue(key);
	}

	function toString(value = () => {}) {
		try {
			return value.toString();
		} catch {
			switch (value.constructor.name) {
				case 'AsyncFunction':
					return 'async function () {}';
				case 'AsyncGeneratorFunction':
					return 'async function * () {}';
				case 'GeneratorFunction:':
					return 'function * () {}';
				default:
					return 'function () {}';
			}
		}
	}

	let keys = $derived(
		['length', 'name', 'prototype', FUNCTION, PROTO].filter(filterKeys),
	);
</script>

<JSONNested {keys}>
	{#snippet summary()}
		<span class="i">ƒ</span>
	{/snippet}
	{#snippet preview()}
		{#if !ctx.isArrow}<span class="fn i">{getPreview1(ctx)}</span
			>{/if}{#if !ctx.isClass}<span class="i">{getPreview2(ctx)}</span
			>{/if}
	{/snippet}
	{#snippet itemKey(key)}
		<span
			class={key === FUNCTION || key === PROTO ? 'internal' : 'property'}
			>{key}</span
		>
	{/snippet}
	{#snippet itemValue(key)}
		{#if key === FUNCTION}<span class="i">{str}</span
			>{:else if key === 'prototype'}<JsonObjectNode
				value={getValue(key)}
			/>{:else}<JSONNode value={getValue(key)} />{/if}
	{/snippet}
</JSONNested>

<style>
	.i {
		font-style: italic;
	}
	.fn,
	.i {
		color: var(--function-color);
	}
</style>
