<script lang="ts">
	import { tick, getContext } from 'svelte';
	import type { ActiveCell } from './types';
	import Cell from './Cell.svelte';
	import ColHeader from './ColHeader.svelte';
	import RowHeader from './RowHeader.svelte';
	import { getColumnName, getRowIndex, createSveet } from './sveet';
	import {isCurrentActiveElementInput} from './utils';

	const rowHeaders: HTMLElement[] = [];
	const columnHeaders: HTMLElement[] = [];

	const { activeCell, current_sveet } = getContext('sveet');
	const { sveet, numberOfRows, numberOfColumns } = current_sveet;

	const keyDownToDelta = {
		ArrowUp: { rowDirection: -1 },
		ArrowDown: { rowDirection: 1 },
		ArrowLeft: { columnDirection: -1 },
		ArrowRight: { columnDirection: 1 }
	} as const;

	function onKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowUp':
			case 'ArrowDown':
			case 'ArrowLeft':
			case 'ArrowRight': {
				if (!isCurrentActiveElementInput()) {
					const controlPressed = event.metaKey || event.ctrlKey;
					moveActiveCell(keyDownToDelta[event.key], { allTheWay: controlPressed });
					event.preventDefault();
				}
				break;
			}
		}
	}

	function moveActiveCell(
		{ rowDirection = 0, columnDirection = 0 },
		{ allTheWay }: { allTheWay: boolean }
	) {
		if (allTheWay) {
			if (rowDirection === -1) {
				$activeCell.row = 0;
			} else if (rowDirection === 1) {
				$activeCell.row = numberOfRows - 1;
			}
			if (columnDirection === -1) {
				$activeCell.column = 0;
			} else if (columnDirection === 1) {
				$activeCell.column = numberOfColumns - 1;
			}
		} else {
			$activeCell.row = Math.max(Math.min($activeCell.row + rowDirection, numberOfRows - 1), 0);
			$activeCell.column = Math.max(
				Math.min($activeCell.column + columnDirection, numberOfColumns - 1),
				0
			);
		}
	}

	function scrollIntoView(container: HTMLElement, activeCell: ActiveCell) {
		function _scrollIntoView(activeCell: ActiveCell) {
			let activeCellLeft = rowHeaders[0].getBoundingClientRect().width,
				activeCellTop = columnHeaders[0].getBoundingClientRect().height;
			let activeCellWidth = columnHeaders[activeCell.column].getBoundingClientRect().width;
			let activeCellHeight = rowHeaders[activeCell.row].getBoundingClientRect().height;
			for (let i = 0; i < activeCell.column; i++) {
				activeCellLeft += columnHeaders[i].getBoundingClientRect().width;
			}
			for (let i = 0; i < activeCell.row; i++) {
				activeCellTop += rowHeaders[i].getBoundingClientRect().height;
			}

			const margin = {
				left: rowHeaders[0].getBoundingClientRect().width + 15,
				right: 15,
				top: columnHeaders[0].getBoundingClientRect().height + 15,
				bottom: 15
			};

			let newScrollX = container.scrollLeft;
			let newScrollY = container.scrollTop;

			// left side
			if (activeCellLeft < container.scrollLeft + margin.left) {
				newScrollX = activeCellLeft - margin.left;
			}
			// right side
			if (activeCellLeft + activeCellWidth > container.scrollLeft + container.clientWidth) {
				newScrollX = activeCellLeft + activeCellWidth + margin.right - container.clientWidth;
			}
			// top side
			if (activeCellTop < container.scrollTop + margin.top) {
				newScrollY = activeCellTop - margin.top;
			}
			// bottom side
			if (activeCellTop + activeCellHeight > container.scrollTop + container.clientHeight) {
				newScrollY = activeCellTop + activeCellHeight + margin.right - container.clientHeight;
			}

			container.scrollTo({ left: newScrollX, top: newScrollY, behavior: 'smooth' });
		}

		waitForBindingForColumnRowHeadersToFinish().then(() => _scrollIntoView(activeCell));
		return {
			update: _scrollIntoView
		};
	}
	function waitForBindingForColumnRowHeadersToFinish() {
		return tick();
	}
</script>

<svelte:body on:keydown={onKeydown} />

<main
	use:scrollIntoView={$activeCell}
	style:--rows={numberOfRows}
	style:--columns={numberOfColumns}
>
	<div>
		{#each { length: numberOfColumns } as _, column}
			{@const colName = getColumnName(column)}
			{#each { length: numberOfRows } as _, row}
				{@const rowIndex = getRowIndex(row)}
				{@const cellName = colName + rowIndex}
				<Cell
					cell={sveet.get(cellName)}
					{row}
					{column}
					active={$activeCell?.column === column && $activeCell?.row === row}
					on:select={() => {
						$activeCell = { column, row };
					}}
				/>
			{/each}
		{/each}

		{#each { length: numberOfColumns } as _, column}
			{@const colName = String.fromCharCode('A'.charCodeAt(0) + column)}
			<ColHeader
				bind:element={columnHeaders[column]}
				active={$activeCell?.column === column}
				{column}
				value={colName}
			/>
		{/each}

		{#each { length: numberOfRows } as _, row}
			{@const rowIndex = String(row + 1)}
			<RowHeader
				bind:element={rowHeaders[row]}
				active={$activeCell?.row === row}
				{row}
				value={rowIndex}
			/>
		{/each}
	</div>
</main>

<style>
	main {
		background-color: peachpuff;
		grid-area: sheet;
		overflow: scroll;
	}
	div {
		display: grid;
		grid-template-rows: repeat(calc(var(--rows) + 1), 20px);
		grid-template-columns: repeat(calc(var(--columns) + 1), minmax(50px, 1fr));
	}
</style>
