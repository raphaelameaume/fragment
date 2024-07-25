<script>
	import { useState } from './utils.js';

	let { key, children } = $props();

	// const expandable = $state(false);
	// useState(({ keyPath, level }) => {
	// 	if (key !== '[[Entries]]') {
	// 		keyPath = [...keyPath, key];
	// 		level = level + 1;
	// 	}
	// 	return {
	// 		keyPath,
	// 		level,
	// 		expanded,
	// 		expandable,
	// 		toggle: () => {
	// 			expanded = !expanded;
	// 		},
	// 	};
	// });
</script>

{@render children()}
