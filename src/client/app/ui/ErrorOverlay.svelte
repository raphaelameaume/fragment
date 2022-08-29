<script>
import { names } from "../stores/sketches";


export let error;

export function getLineAndColNumber(stack) {
	const match = stack.match(/(:([0-9]+)\:([0-9]+))/);

	console.log(match);

	let lineNumber, colNumber;

	if (match && match[2] && match[3]) {
		lineNumber = match[2];
		colNumber = match[3];
	}

	return { lineNumber, colNumber };
}

$: stackLines = error.stack.split('\n')
	.filter((line, i) => i !== 0)
	.filter((line) => !line.includes('/app'))
	.map((line) => {
		let source;
		for (let i = 0; i < names.length; i++) {
			const name = names[i];

			if (line.includes(name)) {
				source = name;
				break;
			}
		}

		if (source) {
			const { lineNumber, colNumber} = getLineAndColNumber(line);

			console.log(lineNumber && colNumber);

			const suffix = (isFinite(lineNumber) && isFinite(colNumber)) ? `:${lineNumber}:${colNumber}` : "";

			return `${line.split('(')[0]} (${source}${suffix})`;
		}

		return line;
	});

const extract = [
	{ text: "  99: ", },
	{ text: "  100: in vec2 vUv;", },
	{ text: "  101: out vec4 FragColor;", },
	{ text: "  102: ", },
	{ text: "  103: float aastep(float threshold, float value) ", },
	{ text: "> 104:     float afwidth = fwidth(value) * 0.5;", highlighted: true },
	{ text: "  105:     return smoothstep(threshold - afwidth, threshold + afwidth, value);", },
	{ text: "  106: }", },
	{ text: "  107: ", },
	{ text: "  108: float rand(vec2 co){ ", },
	{ text: "  109:     return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);", },
	{ text: "  110: }", },
]
</script>

<div class="error-overlay">
	<div class="display">
		<h2>{error.name}: {error.message}</h2>
		<p class="stack">
			{#each stackLines as stackLine}
				<span>{stackLine}</span>
			{/each}
		</p>
		<div class="extract">
			{#each extract as line}
				<span class="extract-line" class:highlighted={line.highlighted}>{line.text}</span>
			{/each}
		</div>
	</div>
	<span class="console">Open your browser's console to further inspect this error.</span>
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
	color: #2A0000;
	padding: 12px 0;
	font-size: var(--font-size-input);
	background-color: #FF8081;
	border-radius: var(--border-radius-input);
}

.extract-line {
	display: block;
	white-space: pre;
	padding: 0 12px;
}

.extract-line.highlighted {
	background-color: rgba(0, 0, 0, 0.1);
	border-radius: 1px;
}

.console {
	font-size: var(--font-size-input);
}
</style>
