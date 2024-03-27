<script>
	import Field from '../../ui/Field.svelte';
	import FieldGroup from '../../ui/FieldGroup.svelte';
	import Module from '../../ui/Module.svelte';
	import ButtonInput from '../../ui/fields/ButtonInput.svelte';
	import FieldInputRow from '../../ui/fields/FieldInputRow.svelte';
	import NumberInput from '../../ui/fields/NumberInput.svelte';
	import Select from '../../ui/fields/Select.svelte';
	import { audio, audioSettings, resync, tap } from './audio.js';

	$: bars = new Array($audioSettings.beatsPerMeasure)
		.fill()
		.map((v, index) => ({
			active: $audio.bar === index,
		}));

	$: console.log(bars);
</script>

<Module name="Audio">
	<Field key="bpm">
		<FieldInputRow>
			<Select
				value={$audioSettings.beatsPerMeasure}
				options={[
					{ label: '4/4', value: 4 },
					{ label: '3/4', value: 3 },
				]}
				on:change={(e) => {
					$audioSettings.beatsPerMeasure = e.detail;
				}}
			/>
			<div
				class="visualizer"
				style="--grid-template-columns: {[...bars]
					.map(() => '1fr')
					.join(' ')}"
			>
				{#each bars as bar}
					<div class="temp" class:active={bar.active}></div>
				{/each}
			</div>
		</FieldInputRow>
		<FieldInputRow --grid-template-columns="20px 20px 20px 20px 1fr">
			<ButtonInput
				label="-"
				on:click={() => {
					$audioSettings.bpm -= 1;
				}}
			/>
			<ButtonInput
				label="+"
				on:click={() => {
					$audioSettings.bpm += 1;
				}}
			/>
			<ButtonInput
				label="/2"
				on:click={() => {
					$audioSettings.bpm /= 2;
				}}
			/>
			<ButtonInput
				label="*2"
				on:click={() => {
					$audioSettings.bpm *= 2;
				}}
			/>
			<NumberInput
				value={$audioSettings.bpm}
				on:change={(e) => {
					$audioSettings.bpm = e.detail;
				}}
				step={0.01}
			/>
		</FieldInputRow>
		<FieldInputRow --grid-template-columns="1fr 1fr 1fr">
			<ButtonInput
				label="resync"
				on:click={() => {
					resync();
				}}
			/>
			<ButtonInput
				label="tap"
				on:click={() => {
					tap();
				}}
			/>
			<ButtonInput
				label="pause"
				on:click={() => {
					// pause();
				}}
			/>
		</FieldInputRow>
	</Field>
</Module>

<style>
	.visualizer {
		display: grid;
		grid-template-columns: var(--grid-template-columns);
		column-gap: var(--column-gap);
	}
	.temp {
		position: relative;
		height: var(--height-input);
		background-color: var(--color-background-input);
		border: 1px solid var(--color-border-input);
		border-radius: var(--border-radius-input);
	}

	.temp:before {
		content: '';

		position: absolute;
		top: 3px;
		left: 3px;
		right: 3px;
		bottom: 3px;

		background-color: var(--color-active);
		border-radius: calc(var(--border-radius-input) * 0.5);

		opacity: 0.2;
	}

	.temp.active:before {
		opacity: 0.5;
	}
</style>
