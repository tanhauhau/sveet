<script lang="ts">
	import caret_down_20_filled from '@fluentui/svg-icons/icons/caret_down_20_filled.svg';
	import math_formula_20_filled from '@fluentui/svg-icons/icons/math_formula_20_filled.svg';
	import { getContext } from 'svelte';
	import { getColumnName, getRowIndex, fromColumnName, fromRowIndex } from '../sveet';
	const { activeCell, current_sveet } = getContext('sveet');

	function onAddressChange(event) {
		const newAddress = event.currentTarget.value;
		const match = newAddress.match(/^([A-Z]+)([0-9]+)$/i);
		if (match) {
			$activeCell = {
				column: fromColumnName(match[1].toUpperCase()),
				row: fromRowIndex(match[2])
			};
			event.currentTarget.blur();
		} else {
			alert('The name given to this range is invalid.');
			const value = getColumnName($activeCell.column) + getRowIndex($activeCell.row);
			event.currentTarget.value = value;
			event.currentTarget.setSelectionRange(0, value.length);
		}
	}

	function startEditing() {
		formula.startEditing();
	}
	function finishEditing(save: boolean) {
		formula.stopEditing(save);
	}

	$: cellName = getColumnName($activeCell.column) + getRowIndex($activeCell.row);
	$: formula = current_sveet.sveet.get(cellName).formula;
</script>

<div>
	<input on:change={onAddressChange} value={cellName} />
	<span><img src={caret_down_20_filled} /></span>
	<span class="divider" />
	<span class="fx"><img src={math_formula_20_filled} /></span>
	<span class="divider" />
	<input
		class="formula"
		bind:value={$formula}
		on:keydown={(event) => {
			switch (event.key) {
				case 'Enter':
					finishEditing(true);
					$activeCell = {
						column: $activeCell.column,
						row: $activeCell.row + 1
					};
					break;
				case 'Escape':
					finishEditing(false);
					break;
			}
		}}
		on:focus={() => {
			startEditing()
		}}
		on:blur={() => {
			finishEditing(true);
		}}
	/>
</div>

<style>
	div {
		display: flex;
		align-items: center;
		border-bottom: 1px solid var(--border-color);
	}
	.divider {
		margin: 4px 2px;
		width: 1px;
		height: 20px;
		background-color: var(--border-color);
	}
	.fx {
		margin: 0 4px;
	}
	.formula {
		flex: 1;
	}
	input {
		border: 0;
	}
</style>
