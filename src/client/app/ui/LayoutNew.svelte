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

const data = writable([]);

function registerComponent(component) {
	$data = [...$data, component];
}

function deleteComponent(id) {
	$data = $data.filter((c) => c.id !== id);
}

data.subscribe((value) => {
	const root = value.find((v) => v.parent === undefined);


})

const layout = {
	registerComponent,
	deleteComponent,
};
setContext('depth', -1);
setContext('layout', layout);
setContext('parent', {
	children,
	registerChild: () => {}
});

/**
WHAT ARE THE PROBLEMS WE'RE FACING

- How to know if a component is the last one
- Get a description of the current layout with prev parent and children

WHAT IF
- Resizer access prev nodes from node.parentNode.children
- Resizer retrieve prev and next size from store in parent context with children by comparing nodes

*/

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
					<ModuleRenderer module={{ name: "params"}} />
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
