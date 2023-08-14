<script>
	export let name;
	export let nesting = 0;
	export let collapsed = false;

	function handleClick() {
		collapsed = !collapsed;
	}
</script>

<div
	class="field-group"
	class:collapsed
	style="--nesting: {nesting}; --nested: {nesting > 0 ? 1 : 0}"
>
	<header class="header">
		<button class="header__action" on:click={handleClick}>
			<svg
				class="header__icon"
				width="24"
				height="24"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M10.75 8.75L14.25 12L10.75 15.25"
				/>
			</svg>
			<span class="field-group__name">{name}</span>
		</button>
	</header>
	<div class="content">
		<slot />
	</div>
</div>

<style>
	.field-group {
		--left: calc(12px * (var(--nesting, -1)));
		--left1: calc(12px * ((var(--nesting, -1) + 1)));

		position: relative;

		display: grid;
		width: 100%;
	}

	/* .field-group:after {
    content: "";

    position: absolute;
    left: 0;
    bottom: 0px;
    
    width: 15px;
    height: 1px;
    
    background-color: #323233;
} */

	.header {
		position: relative;
		padding: 3px 6px 3px 0px;
	}

	.field-group:after {
		content: '';

		position: absolute;
		left: var(--left);
		bottom: 0;

		width: calc(100% - var(--left));
		height: 1px;

		background-color: var(--color-spacing);
	}

	.field-group:not(.collapsed) .header:after {
		content: '';

		position: absolute;
		left: var(--left);
		bottom: 0;

		width: calc(100% - var(--left));
		height: 1px;

		background-color: var(--color-spacing);
	}

	.header__action {
		display: flex;
		align-items: center;
		width: 100%;
		text-align: left;

		background: transparent;
		cursor: pointer;

		padding-left: calc(12px * (var(--nesting)));
	}

	:global(.field-group .field__infos) {
		padding-left: 12px;
	}

	:global(.field-group .field:last-child:after) {
		background-color: transparent;
	}

	.header__icon {
		padding-bottom: 1px;

		background: transparent;
		cursor: pointer;
		outline: 0;
	}

	.header__icon {
		padding-bottom: 1px;

		color: #f0f0f0;
		transform: rotate(90deg);
		opacity: 0.5;
		transition: opacity 0.1s ease;
	}

	.header__action:hover .header__icon {
		opacity: 1;
	}

	.field-group.collapsed .header__icon {
		transform: rotate(0deg);
	}

	.field-group__name {
		color: #f0f0f0;

		font-size: 11px;
		font-weight: 700;
		/* text-transform: uppercase; */

		opacity: 0.75;
		transition: opacity 0.1s ease;
	}

	.content {
		position: relative;

		margin-left: calc(12px * (var(--nesting, 0)));

		border-left: 1px solid #323233;
	}

	.content:before {
		content: '';

		position: absolute;
		left: 12px;
		top: 0;
		bottom: 0;
		z-index: 1;

		width: 1px;
		height: 100%;

		background-color: #323233;
	}

	.header__action:hover .field-group__name,
	.header__action:focus-visible .field-group__name {
		opacity: 1;
	}

	.field-group.collapsed .content {
		display: none;
	}
</style>
