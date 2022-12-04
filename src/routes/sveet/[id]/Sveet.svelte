<script lang="ts">
	import { tick, getContext } from 'svelte';
	import ColumnResizeGuide from './ColumnResizeGuide.svelte';
	import type { ActiveCell, SveetContext } from './types';
	import Cell from './Cell.svelte';
	import ColHeader from './ColHeader.svelte';
	import RowHeader from './RowHeader.svelte';
	import { isCurrentActiveElementInput } from './utils';

	const rowHeaders: HTMLElement[] = [];
	const columnHeaders: HTMLElement[] = [];

	const { currentSveet } = getContext('sveet') as SveetContext;
	const { sveet, numberOfRows, numberOfColumns, activeCell } = currentSveet;

	let columnHeaderHeight = 20;
	let rowHeaderWidth = 50;
	let rowHeights = new Array(numberOfRows).fill(20);
	let columnWidths = new Array(numberOfRows).fill(50);
	$: increaseDecreaseRows(numberOfRows);
	$: increaseDecreaseColumns(numberOfColumns);

	let columnResizeGuidePosition:
		| { column: number; leftPosition: number; leftLimit: number }
		| undefined = undefined;

	let container: HTMLElement;

	function increaseDecreaseRows(numberOfRows: number) {
		if (rowHeights.length < numberOfRows) {
			// increase number of rows
			for (let i = rowHeights.length; i < numberOfRows + 1; i++) {
				rowHeights.push(20);
			}
			rowHeights = rowHeights;
		} else {
			// decrease number of rows
			rowHeights = rowHeights.slice(0, numberOfRows + 1);
		}
	}
	function increaseDecreaseColumns(numberOfColumns: number) {
		if (columnWidths.length < numberOfColumns) {
			// increase number of rows
			for (let i = columnWidths.length; i < numberOfColumns + 1; i++) {
				columnWidths.push(50);
			}
			columnWidths = columnWidths;
		} else {
			// decrease number of rows
			columnWidths = columnWidths.slice(0, numberOfColumns + 1);
		}
	}

	const keyDownToDelta = {
		ArrowUp: { rowDirection: -1 },
		ArrowDown: { rowDirection: 1 },
		ArrowLeft: { columnDirection: -1 },
		ArrowRight: { columnDirection: 1 }
	} as const;

	function onKeydown(event: KeyboardEvent) {
		console.log({ key: event.key });
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
			case 'Backspace': {
				if (!isCurrentActiveElementInput()) {
					const cell = sveet.getByColumnAndRow($activeCell);
					cell?.formula.set('', true);
				}
				break;
			}
			default: {
				if (event.key.length === 1) {
					if (!isCurrentActiveElementInput()) {
						window.postMessage({
							type: 'sveet:edit-cell',
							cell: $activeCell,
							triggerKey: event.key
						});
					}
				}
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

	function hintResizeColumn(column: number) {
		let targetPosition = rowHeaderWidth;
		for (let i = 0; i <= column; i++) {
			targetPosition += columnWidths[i];
		}
		columnResizeGuidePosition = {
			column,
			leftPosition: targetPosition,
			leftLimit: targetPosition - columnWidths[column]
		};
	}
	function unhintResizeColumn() {
		columnResizeGuidePosition = undefined;
	}
	function resizeColumn(event: CustomEvent<{ x: number; column: number }>) {
		const { x, column } = event.detail;
		let width = x - rowHeaderWidth;
		for (let i = 0; i < column; i++) {
			width -= columnWidths[i];
		}
		columnWidths[column] = width;
	}
</script>

<svelte:body on:keydown={onKeydown} />

<main
	bind:this={container}
	use:scrollIntoView={$activeCell}
	style:--rows={numberOfRows}
	style:--columns={numberOfColumns}
>
	<div
		style:grid-template-rows={columnHeaderHeight +
			'px ' +
			rowHeights.map((height) => height + 'px').join(' ')}
		style:grid-template-columns={rowHeaderWidth +
			'px ' +
			columnWidths.map((width) => width + 'px').join(' ')}
	>
		{#each { length: numberOfColumns } as _, column}
			{#each { length: numberOfRows } as _, row}
				<Cell
					cell={sveet.getByColumnAndRow({ column, row })}
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
				on:hintResizeColumn={() => hintResizeColumn(column)}
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
	<ColumnResizeGuide
		{columnHeaderHeight}
		{container}
		{columnResizeGuidePosition}
		on:unhintResizeColumn={unhintResizeColumn}
		on:resize={resizeColumn}
	/>
</main>

<style>
	main {
		background-color: peachpuff;
		grid-area: sheet;
		overflow: scroll;
		z-index: var(--z-index-main);
		position: relative;
	}
	div {
		display: grid;
	}
</style>
