<script lang="ts">
	import type { GetStoreValue } from 'src/lib/type-utilties';

	import { createEventDispatcher, getContext, onMount, tick } from 'svelte';
	import type { SveetCell, SveetContext } from './types';
	const dispatch = createEventDispatcher();

	const { currentSveet } = getContext('sveet') as SveetContext;
	const INPUT_PADDING_X = 2;
	const INPUT_PADDING_Y = 1;

	onMount(() => {
		function onMessage(event: MessageEvent) {
			if (event.data?.type === 'sveet:edit-cell') {
				if (event.data.cell.row === row && event.data.cell.column === column) {
					startEditing();
					cell.formula.set(event.data.triggerKey);
				}
			}
		}
		window.addEventListener('message', onMessage);
		return () => window.removeEventListener('message', onMessage);
	});

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
	let style = cell.style;
	let measureSpanElement: HTMLSpanElement;
	let cellElement: HTMLDivElement;
	let cellWidth: number;

	function finishEditing(save: boolean) {
		mode = Mode.DisplayValue;
		editValue.stopEditing(save);
	}
	function startEditing() {
		cellWidth = cellElement.getBoundingClientRect().width;
		mode = Mode.Editing;
		editValue.startEditing();
	}
	let width = 0;

	$: $editValue, measureSpanElement, onEdit();

	async function onEdit() {
		if (measureSpanElement) {
			await tick();
			width = Math.max(
				cellWidth,
				measureSpanElement.getBoundingClientRect().width + INPUT_PADDING_X * 2
			);
		}
	}
	function getStyle(style: GetStoreValue<SveetCell['style']>) {
		const result: Record<string, string> = {};
		if (style.bold) result['font-weight'] = 'bold';
		if (style.italic) result['font-style'] = 'italic';
		if (style.underline || style.strikeThrough) {
			const textDecoration: string[] = [];
			if (style.underline) textDecoration.push('underline');
			if (style.strikeThrough) textDecoration.push('line-through');
			result['text-decoration'] = textDecoration.join(' ');
		}
		if (style.fontSize) {
			result['font-size'] = style.fontSize + 'px';
		}
		let css = '';
		for (const key in result) {
			css += `${key}:${result[key]};`;
		}
		return css;
	}
</script>

<div
	bind:this={cellElement}
	style="
		--row: {row};
		--column: {column};
		width: {mode === Mode.Editing ? width + 'px' : 'unset'};
		{getStyle($style)}
	"
	class:active
	on:click={() => dispatch('select')}
	on:dblclick={() => {
		if (mode === Mode.DisplayValue) {
			startEditing();
		} else {
			mode = Mode.DisplayValue;
		}
	}}
>
	{#if mode === Mode.DisplayValue}
		{$displayValue}
	{:else if mode === Mode.Editing}<input
			style:width={width + 'px'}
			style:padding={`${INPUT_PADDING_Y}px ${INPUT_PADDING_X}px`}
			autofocus
			bind:value={$editValue}
			on:blur={() => finishEditing(true)}
			on:keydown={(event) => {
				switch (event.key) {
					case 'Enter':
						finishEditing(true);
						currentSveet.activeCell.move(0, 1);
						break;
					case 'Escape':
						finishEditing(false);
						break;
				}
			}}
		/>
		<span bind:this={measureSpanElement}>{$editValue}</span>
	{/if}
</div>

<style>
	div {
		outline: 1px solid lightgray;
		grid-row: calc(var(--row) + 2);
		grid-column: calc(var(--column) + 2);
		box-sizing: border-box;
		background-color: white;
	}
	.active {
		outline-color: blueviolet;
		outline-width: 2px;
		z-index: 1;
	}
	input {
		width: 100%;
		height: 100%;
		margin: 0;
		border: 0;
		outline: 0;
		box-sizing: border-box;
	}
	input,
	span {
		font-size: 14px;
		font-family: Arial, Helvetica, sans-serif;
	}
	span {
		position: absolute;
		top: 0;
		left: 0;
		opacity: 0;
		pointer-events: none;
	}
</style>
