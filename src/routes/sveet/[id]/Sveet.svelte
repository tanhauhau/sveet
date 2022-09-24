<script lang="ts">
	import Cell from './Cell.svelte';
	import ColHeader from './ColHeader.svelte';
	import RowHeader from './RowHeader.svelte';
	import { getColumnName, getRowIndex, createSveet } from './sveet';
	let numberOfColumns = 26;
	let numberOfRows = 50;
	const sveet = createSveet({ numberOfColumns, numberOfRows });
	let activeCell: { column: number; row: number } | null = {
		column: 0,
		row: 0
	};
</script>

<main style:--rows={numberOfRows} style:--columns={numberOfColumns}>
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
					active={activeCell?.column === column && activeCell?.row === row}
					on:select={() => {
						activeCell = { column, row };
					}}
					value={`${colName}-${rowIndex}`}
				/>
			{/each}
		{/each}

		{#each { length: numberOfColumns } as _, column}
			{@const colName = String.fromCharCode('A'.charCodeAt(0) + column)}
			<ColHeader active={activeCell?.column === column} {column} value={colName} />
		{/each}

		{#each { length: numberOfRows } as _, row}
			{@const rowIndex = String(row + 1)}
			<RowHeader active={activeCell?.row === row} {row} value={rowIndex} />
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
