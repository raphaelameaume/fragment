<script>
import { clearErrors } from "../stores/errors";

export let error;

export function getLineAndColNumber(stack) {
	const match = stack.match(/(:([0-9]+)\:([0-9]+))/);

	let lineNumber, colNumber;

	if (match && match[2] && match[3]) {
		lineNumber = match[2];
		colNumber = match[3];
	}

	return { lineNumber, colNumber };
}

$: stackLines = error.stack ?
	error.stack.split('\n')
		.filter((line, i, s) => s.length === 1 ? true : i !== 0)
		.filter((line) => !line.includes('/app'))
		.map((line) => {
			// remove path to file in URL
			line = line.replace(`${window.location.origin}/@fs${__CWD__}/`, "");
			// remove vite injected params in URL
			line = line.replace(/\?.+?\:/g, ":");

			return line;
		}) :
	null;

$: extract = error.source ?
	error.source.split("\n").map((text, index) => ({ text, highlighted: text.includes(`> ${error.lineNumber}:`) })) : [];
</script>

<div class="error-overlay" on:click={() => clearErrors()}>
	<div class="display">
		<h2>{error.name}: {error.message}</h2>
		{#if error.stack}
			<p class="stack">
				{#each stackLines as stackLine}
					<span>{stackLine}</span>
				{/each}
			</p>
		{/if}
		{#if extract.length > 0}
		<div class="extract">
			{#each extract as line}
				<span class="extract-line" class:highlighted={line.highlighted}>{line.text}</span>
			{/each}
		</div>
		{/if}
	</div>
	<span class="console">Open your browser's console to further inspect this error. Click to dismiss.</span>
</div>

<style>
.error-overlay {
	position: absolute;
	top: 0;
	left: 0;

	display: flex;
	flex-direction: column;
	justify-content: space-between;
	width: 100%;
	height: 100%;
	padding: 12px 18px;

	color: #FF8081;

	background-color: #2A0000;
}

h2 {
	color: #FF8081;
	font-size: 1rem;
}

.stack {
	padding-left: 18px;
	font-size: 13px;
}

.stack span {
	display: block;
}

.extract {
	display: flex;
	flex-direction: column;
	justify-content: stretch;
	color: #2A0000;
	padding: 12px 0;
	font-size: var(--font-size-input);
	background-color: #FF8081;
	border-radius: var(--border-radius-input);
	overflow-x: auto;
}

.extract::-webkit-scrollbar {
    height: 5px;               /* width of the entire scrollbar */
}

.extract::-webkit-scrollbar-track {
    background-color: #5C0000;
}

.extract::-webkit-scrollbar-thumb {
    background-color: #f0f0f0;    /* color of the scroll thumb */
    border-radius: 20px;       /* roundness of the scroll thumb */
}

.extract-line {
	display: block;
	white-space: pre;
	padding: 0 12px;
	width: 100%;
}

.extract-line.highlighted {
	background-color: rgba(0, 0, 0, 0.1);
	border-radius: 1px;
}

.console {
	font-size: var(--font-size-input);
}
</style>
