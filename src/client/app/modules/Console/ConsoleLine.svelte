<script>
	import JSONNode from 'svelte-json-tree';
	// import ConsoleTable from './ConsoleTable.svelte';

	export let log;
	export let level = 1;

	function toggleGroupCollapse() {
		log.collapsed = !log.collapsed;
	}
</script>

<!-- {#if log.level === 'table'}
	<ConsoleTable data={log.args[0]} columns={log.args[1]} />
{/if} -->

<div class="log console-{log.level}" style="padding-left: {level * 8}px" on:click={log.level === 'group' ? toggleGroupCollapse : undefined}>
	{#if log.count > 1}
		<div class="count">
			<span>{log.count}</span>
		</div>
	{/if}

	{#if log.level === 'trace' || log.level === 'assert'}
		<div class="arrow" class:expand={!log.collapsed} on:click={toggleGroupCollapse}>▶</div>
	{/if}

	{#if log.level === 'assert'}
		<span class="assert">Assertion failed:</span>
	{/if}

	{#if log.level === 'clear'}
		<span class="info">Console was cleared</span>
	{:else if log.level === 'unclonable'}
		<span class="info error">Message could not be cloned. Open devtools to see it</span>
	{:else if log.level === 'group'}
		<div class="arrow" class:expand={!log.collapsed}>▶</div>
		<span class="title">{log.label}</span>
	{:else if log.level.startsWith('system')}
		{#each log.args as arg}
			{arg}
		{/each}
	{:else if log.level === 'table'}
		<JSONNode value={log.args[0]} />
	{:else}
		{#each log.args as arg}
			<JSONNode value={arg} />
		{/each}
	{/if}
	{#each new Array(level - 1) as _, idx}
		<div class="outline" style="left: {idx * 15 + 15}px" />
	{/each}
</div>

{#if log.level === 'group' && !log.collapsed}
	{#each log.logs as childLog}
		<svelte:self log={childLog} level={level + 1}/>
	{/each}
{/if}

{#if (log.level === 'trace' || log.level === 'assert') && !log.collapsed}
	<div class="trace">
		{#each log.stack.split('\n').slice(2) as stack}
			<div>{stack.replace(/^\s*at\s+/, '')}</div>
		{/each}
	</div>
{/if}

<style>
	.log {
		--json-tree-string-color: rgba(255, 255, 255, 0.5);
		--arrow-sign: rgba(255, 255, 255, 0.5);
		--json-tree-font-size: var(--inputFontSize);
		--json-tree-font-family: var(--fontFamily);
		--json-tree-number-color: var(--activeColor);
		--json-tree-symbol-color: #cb3f41;
		--json-tree-boolean-color: var(--activeColor);
		--json-tree-function-color: var(--activeColor);
		/* --json-tree-number-color: #3029cf; */
		--json-tree-label-color: var(--activeColor);
		--json-tree-arrow-color: #727272;
		--json-tree-null-color: #8d8d8d;
		--json-tree-undefined-color: #8d8d8d;
		--json-tree-date-color: #8d8d8d;
		--json-tree-li-indentation: 12px;

		border-bottom: 1px solid #3A3A3A;
		border-top: 1px solid #3A3A3A;
		padding: 4px 0 3px;
		display: flex;
		position: relative;

		color: rgba(255, 255, 255, 0.5);
		/* font-weight: 700; */
	}

	.log:first-child:not(.console-error) {
		border-top: none;
	}

	.log:last-child:not(.console-error) {
		border-bottom: none;
	}

	.log:not(:first-child) {
		margin-top: -1px;
	}

	/* .log > :global(*) {
		margin-right: 10px;
	} */

	.console-warn, .console-system-warn {
		--json-tree-string-color: #F3AB26;
		background: #332B00;
		border-color: #665600;
	}

	.console-error, .console-assert {
		--json-tree-string-color: #FF8081;

		background: #2A0000;
		border-color: #5C0000;
	}

	.console-group, .arrow {
		cursor: pointer;
		user-select: none;
	}

	.log :global(.arrow) {
		margin-right: 10px;
	}

	.log :global(.String) {
		white-space: pre-wrap;
	}
	.console-trace, .console-assert {
		border-bottom: none;
	}

	.console-assert + .trace {
		background: #fff0f0;
		border-color: #fed6d7;
	}

	.trace {
		border-bottom: 1px solid #eee;
		font-size: 12px;
		font-family: var(--font-mono);
		padding: 4px 0 2px;
	}

	.trace > :global(div) {
		margin-left: 15px;
	}

	.count {
		position: relative;

		display: flex;
		justify-content: center;
		align-items: center;
		margin-right: 4px;
		
		font-size: 9px;
		padding: 0 4px;
	}

	.count:before {
		content: '';

		position: absolute;

		width: 100%;
		min-width: 16px;
		height: 16px;

		border-radius: 9px;
		background-color: var(--color-lightblack);
	}

	.count span {
		position: relative;
	}

	.outline {
		border-left: 1px solid #9c9cab;
		position: absolute;
		top: 0;
		bottom: -1px;
	}

	.arrow {
		position: absolute;
		font-size: 0.6em;
		transition: 150ms;
		transform-origin: 50% 50%;
		transform: translateY(1px) translateX(-50%);
	}

	.arrow.expand {
		transform: translateY(1px) translateX(-50%) rotateZ(90deg);
	}

	.title {
		font-family: var(--font-mono);
		font-size: 13px;
		font-weight: bold;
		padding-left: 11px;
		height: 19px;
	}

	.assert {
		padding-left: 11px;
		font-weight: bold;
		/* color: #da106e; */
	}
</style>
