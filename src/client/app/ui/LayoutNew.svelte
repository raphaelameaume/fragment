<script>
import { setContext } from "svelte";

import { get, writable } from "svelte/store";
import { map } from "../utils/math.utils";

import Column from "./ColumnNew.svelte"; 
import ModuleRenderer from "./ModuleRendererNew.svelte";
import Row from "./RowNew.svelte"; 


const all = writable([]);
const children = writable([]);

function addChild(child) {
	$all = [
		...$all,
		child,
	];
}

function getSiblings({ index, depth }) {
	return $all.filter(c => c.depth === depth);
}

function getChildren({ index, depth, parent } = {}) {
}

function removeChild({ index, depth } = {}) {
}

const layout = {
	children,
	all,
	addChild,
	removeChild,
	getSiblings,
	getChildren,
};
setContext('depth', -1);
setContext('layout', layout);
setContext('parent', children);

const data = writable([]);
setContext('data', data);

data.subscribe(() => {
	console.log($data);
});


// all.subscribe(() => {
// 	console.log('layout has changed', $all);

// 	$all.forEach((c) => {
// 		c.children.subscribe(() => {
// 			console.log("children changed");
// 		})
// 		// const test = get(c.children);
// 		// console.log(test);
// 	})
// });

// $: {
// 	console.log('layout has changed', $all);

// 	$all.forEach(c => {
// 		const test = c.children;

// 		console.log(test.$children);
// 	})
// }

</script>

<div class="layout">
	<Column>
		<Row size={0.8}>
			<Column>
				<ModuleRenderer module={{ name: "monitor"}} />
			</Column>
			<Column>
				<Row size={0.5}>
					<ModuleRenderer module={{ name: "exports"}} />
				</Row>
				<Row size={0.5}>
					<Column>
						<ModuleRenderer module={{ name: "params"}} />
					</Column>
				</Row>
			</Column>
		</Row>
		<Row size={0.2}>
			<ModuleRenderer module={{ name: "midi"}} />
		</Row>
	</Column>
</div>

<style>
.layout {
	position: relative;
    display: grid;
    width: 100%;
    height: 100%;
    align-content: stretch;
}
</style>
