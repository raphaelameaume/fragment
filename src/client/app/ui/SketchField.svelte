<script>
	import Field from './Field.svelte';
	import { props as all } from '../stores';
	import { updateProp } from '../stores/props';

	export let context;
	export let key;
	export let props;

	$: prop = props[key];
	$: isDisabled =
		typeof prop.disabled === 'function' ? prop.disabled() : prop.disabled;
</script>

{#if typeof prop.hidden === 'function' ? !prop.hidden() : !prop.hidden}
	<Field
		{context}
		{key}
		value={prop.value}
		type={prop.type}
		disabled={isDisabled}
		bind:params={prop.params}
		on:click={() => {
			$all[context][key].value._refresh = true;
		}}
		on:change={(event) => {
			updateProp(context, key, event.detail);
		}}
	/>
{/if}
