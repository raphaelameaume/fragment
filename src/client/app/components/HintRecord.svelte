<div class="record-hint">
	<span class="label">REC</span>
</div>

<style>
	.record-hint {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;

		background: rgba(0, 0, 0, 0.5);
	}
	.label {
		position: absolute;
		top: 4px;
		right: 4px;
		z-index: 2;

		display: flex;
		place-items: center;

		height: 16px;
		padding: 0 2px;

		color: var(--color-red);
		font-size: 10px;

		border: 1px solid var(--color-red);
		border-radius: 2px;
	}

	.label:before {
		--size: 6px;
		content: '';

		width: var(--size);
		height: var(--size);
		margin: 0 3px 0 1px;

		background-color: var(--color-red);
		border-radius: 50%;

		animation: fade 1s ease-in-out infinite;
	}

	@keyframes fade {
		0% {
			opacity: 0;
		}

		50% {
			opacity: 1;
		}

		100% {
			opacity: 0;
		}
	}
</style>
