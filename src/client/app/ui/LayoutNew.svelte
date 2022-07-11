<script>
import { setContext } from "svelte";

import { writable } from "svelte/store";
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


all.subscribe(() => {
	console.log('layout has changed', $all);
})
// {
	// registerCol: ({ index, depth, size, children }) => {
	// 	console.log('----');
	// 	console.log('registerCol', { index, depth, size });
	// 	const i = $layout.findIndex((v) => v.type === "col" && index === v.index && depth === v.depth);

	// 	if (i < 0) {
	// 		console.log('add col', { index, depth, size, children });
	// 		$layout = [...$layout, {
	// 			index,
	// 			depth,
	// 			size,
	// 			type: "col"
	// 		}]
	// 	} else {
	// 		console.log("col already exists", i, $layout[i]);

	// 		$layout = $layout.map((item, i) => i !== index ? item : {
	// 			...item,
	// 			size,
	// 			depth,
	// 			children,
	// 		});
	// 	}
	// },
	// registerRow: ({ index, depth, size, children }) => {
	// 	const i = $layout.findIndex((v) => v.type === "row" && index === v.index && depth === v.depth); 

	// 	if (i < 0) {
	// 		console.log('add row', { index, depth, size, children });
	// 		$layout = [...$layout, {
	// 			index,
	// 			depth,
	// 			size,
	// 			type: "row",
	// 			children,
	// 		}]
	// 	} else {
	// 		console.log("row already exists", $layout[i]);
	// 		$layout = $layout.map((item, i) => i !== index ? item : {
	// 			...item,
	// 			depth,
	// 			children,
	// 			size
	// 		});
	// 	}
	// }
// });

// layout.subscribe(() => {
// 	console.log("layout has changed");
// });

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
