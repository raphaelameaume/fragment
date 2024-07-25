<script>
	import JSONObjectNode from './JSONObjectNode.svelte';
	import JSONArrayNode from './JSONArrayNode.svelte';
	import JSONIterableArrayNode from './JSONIterableArrayNode.svelte';
	import JSONIterableMapNode from './JSONIterableMapNode.svelte';
	import JSONValueNode from './JSONValueNode.svelte';
	import ErrorNode from './ErrorNode.svelte';
	import JsonStringNode from './JSONStringNode.svelte';
	import JsonFunctionNode from './JSONFunctionNode.svelte';
	import TypedArrayNode from './TypedArrayNode.svelte';
	import RegExpNode from './RegExpNode.svelte';
	import { useState, objType } from './utils.js';

	let { value, ...restProps } = $props();
	const { shouldTreatIterableAsObject } = useState();

	let nodeType = $derived(objType(value, shouldTreatIterableAsObject));
	let [componentType, props] = $derived.by(() =>
		getComponentAndProps(nodeType, value),
	);

	function getComponentAndProps(nodeType, value) {
		switch (nodeType) {
			case 'Object':
				return [JSONObjectNode];
			case 'Error':
				return [ErrorNode];
			case 'Array':
				return [JSONArrayNode];
			case 'Map':
				return [JSONIterableMapNode];
			case 'Iterable':
			case 'Set':
				return [JSONIterableArrayNode, { nodeType }];
			case 'Number':
				return [JSONValueNode, { nodeType }];
			case 'String':
				return [JsonStringNode];
			case 'Boolean':
				return [
					JSONValueNode,
					{ nodeType, value: value ? 'true' : 'false' },
				];
			case 'Date':
				return [
					JSONValueNode,
					{ nodeType, value: value.toISOString() },
				];
			case 'Null':
				return [JSONValueNode, { nodeType, value: 'null' }];
			case 'Undefined':
				return [JSONValueNode, { nodeType, value: 'undefined' }];
			case 'Function':
			case 'AsyncFunction':
			case 'AsyncGeneratorFunction':
			case 'GeneratorFunction':
				return [JsonFunctionNode];
			case 'Symbol':
				return [JSONValueNode, { nodeType, value: value.toString() }];
			case 'BigInt':
				return [
					JSONValueNode,
					{ nodeType, value: String(value) + 'n' },
				];
			case 'ArrayBuffer':
				return [
					JSONValueNode,
					{ nodeType, value: `ArrayBuffer(${value.byteLength})` },
				];
			case 'BigInt64Array':
			case 'BigUint64Array':
			case 'Float32Array':
			case 'Float64Array':
			case 'Int8Array':
			case 'Int16Array':
			case 'Int32Array':
			case 'Uint8Array':
			case 'Uint8ClampedArray':
			case 'Uint16Array':
			case 'Uint32Array':
				return [TypedArrayNode, { nodeType }];
			case 'RegExp':
				return [RegExpNode];
			default:
				return [JSONObjectNode, { summary: nodeType }];
		}
	}
</script>

<svelte:component this={componentType} {value} {...restProps} />
