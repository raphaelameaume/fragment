<div class="icon-cross">
	<div class="icon-cross-side"></div>
	<div class="icon-cross-side"></div>
</div>

<style>
	.icon-cross {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.icon-cross-side {
		--size: 10px;
		position: absolute;
		top: calc(50% - 1px);
		left: calc(50% - var(--size) * 0.5);
		width: var(--size);
		height: 2px;

		transform: rotate(45deg);

		background-color: #551717;
	}

	.icon-cross-side:last-child {
		transform: rotate(-45deg);
	}
</style>
