<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SveetCell } from './sveet';
	const dispatch = createEventDispatcher();

	export let row: number;
	export let column: number;
	export let active: boolean;
	export let cell: SveetCell;

	enum Mode {
		Editing,
		DisplayValue,
		DisplayFormula
	}

	let mode = Mode.DisplayValue;
	let editValue = cell.formula;
	let displayValue = cell.displayValue;

	function finishEditing(save: boolean) {
		mode = Mode.DisplayValue;
		editValue.stopEditing(save);
	}
</script>

<div
	style:--row={row}
	style:--column={column}
	class:active
	on:click={() => dispatch('select')}
	on:dblclick={() => {
		if (mode === Mode.DisplayValue) {
			mode = Mode.Editing;
			editValue.startEditing();
		} else {
			mode = Mode.DisplayValue;
		}
	}}
>
	{#if mode === Mode.DisplayValue}
		{$displayValue}
	{:else if mode === Mode.Editing}<input
			autofocus
			bind:value={$editValue}
			on:blur={() => finishEditing(true)}
			on:keydown|stopPropagation={(event) => {
				switch(event.key) {
					case 'Enter':
						finishEditing(true);
						break;
					case 'Escape':
						finishEditing(false);
						break;
				}
			}}
		/>
	{/if}
</div>

<style>
	div {
		outline: 1px solid lightgray;
		grid-row: calc(var(--row) + 2);
		grid-column: calc(var(--column) + 2);
	}
	.active {
		outline-color: blueviolet;
		outline-width: 2px;
	}
	input {
		width: 100%;
		height: 100%;
		margin: 0;
		border: 0;
		outline: 0;
		box-sizing: border-box;
	}
</style>
