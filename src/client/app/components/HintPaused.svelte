<div class="paused-hint">
	<div class="label">
		<svg width="10" height="6">
			<rect
				x="2"
				y="0"
				width="2"
				height="8"
				fill="var(--color)"
				rx="1"
				ry="1"
			/>
			<rect
				x="5"
				y="0"
				width="2"
				height="8"
				fill="var(--color)"
				rx="1"
				ry="1"
			/>
		</svg>
		<span>paused</span>
	</div>
</div>

<style>
	.paused-hint {
		--color: #ffffff;

		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;

		width: 100%;

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

		color: var(--color);
		font-size: 10px;

		border: 1px solid var(--color);
		border-radius: 2px;
		text-transform: uppercase;
	}

	/* .label:before {
		--size: 6px;
		content: '';

		width: var(--size);
		height: var(--size);
		margin: 0 3px 0 1px;

		background-color: var(--color);
		border-radius: 50%;

		animation: fade 1s ease-in-out infinite;
	} */

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
