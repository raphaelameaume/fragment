<script>

const rows = [
	'',
	'',
	'',
	'',
	'',
	'',
	'',
	'',
	'',
	'',
	'',
	'',
	'',
	'',
	'',
];

</script>

<div class="range" style={`grid-template-rows: repeat(${rows.length}, 1fr)`}>
	{#each rows as row, index }
		<div class="row"></div>
	{/each}
</div>

<style>
.range {
	position: relative;

	display: grid;
	row-gap: 2px;
	padding: 3px 0;
}

.range:not(:last-child):after {
	content: '';

	position: absolute;
	top: 0;
	right: -2px;
	bottom: 0;
	width: 1px;

	background-color: var(--color-border-input);
}

.row {
	background: rgba(0, 0, 0, 0.3);
	border-radius: 2px;
}

.row:last-child {
	background-color: var(--color-active);
}
</style>
