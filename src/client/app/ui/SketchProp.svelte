<script>
import Field from "./Field.svelte";
import { props as all } from "../stores";

export let context;
export let key;
export let props;

</script> 
 
 {#if typeof !props[key].hidden === "function" ? props[key].hidden() : !props[key].hidden}
	<Field
		{context}
		{key}
		value={props[key].value}
		type={props[key].type}
		bind:params={props[key].params}
		on:click={() => {
			$all[context][key].value._refresh = true;
		}}
		on:change={(event) => {
			$all[context][key].value = event.detail;

			if (typeof $all[context][key].onChange === 'function') {
				$all[context][key].onChange($all[context][key]);
			}
		}}
	/>
{/if}
