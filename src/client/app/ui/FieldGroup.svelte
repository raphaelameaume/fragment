<script>
	let { name, collapsed = false, children, onchange = () => {} } = $props();

	function handleClick() {
		collapsed = !collapsed;
		onchange(collapsed);
	}
</script>

<div class="field-group {collapsed ? 'collapsed' : ''}">
	<header class="header">
		<button class="header__action" onclick={handleClick}>
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
		{@render children?.()}
	</div>
</div>

<style>
	.field-group {
		position: relative;

		display: grid;
		width: 100%;
	}

	.field-group:after {
		content: '';

		position: absolute;
		left: 0;
		bottom: 0px;

		width: 12px;
		height: 1px;

		background-color: var(--fragment-spacing-color);
	}

	.header {
		padding: 3px 6px;
		border-bottom: 1px solid var(--fragment-spacing-color);
	}

	.header__action {
		display: flex;
		align-items: center;
		width: 100%;
		text-align: left;

		background: transparent;
		cursor: pointer;
		outline: 0;
	}

	.header__icon {
		padding-bottom: 1px;

		color: var(--fragment-text-color);
		transform: rotate(90deg);
		opacity: 0.5;
		transition: opacity 0.1s ease;
	}

	:global(body:not(.fragment-dragging)) .header__action:hover .header__icon,
	.header__action:focus-visible .header__icon {
		opacity: 1;
	}

	.field-group.collapsed .header__icon {
		transform: rotate(0deg);
	}

	.field-group__name {
		color: var(--fragment-text-color);

		font-size: 11px;
		font-weight: 700;
		/* text-transform: uppercase; */

		opacity: 0.75;
		transition: opacity 0.1s ease;
	}

	:global(body:not(.fragment-dragging))
		.header__action:hover
		.field-group__name,
	.header__action:focus-visible .field-group__name {
		opacity: 1;
	}

	.content {
		margin-left: 12px;
		border-left: 1px solid var(--fragment-spacing-color);
	}

	.field-group.collapsed .content {
		display: none;
	}
</style>
