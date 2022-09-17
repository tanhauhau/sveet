<script lang="ts">
	import Cell from './Cell.svelte';
	import ColHeader from './ColHeader.svelte';
	import RowHeader from './RowHeader.svelte';
	let numOfColumns = 26;
	let numOfRows = 50;
	let activeCell: { column: number; row: number } | null = {
		column: 0,
		row: 0
	};
</script>

<main style:--rows={numOfRows} style:--columns={numOfColumns}>
	<div>
		{#each { length: numOfColumns } as _, column}
			{@const colName = String.fromCharCode('A'.charCodeAt(0) + column)}
			{#each { length: numOfRows } as _, row}
				{@const rowIndex = row + 1}
				<Cell
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

		{#each { length: numOfColumns } as _, column}
			{@const colName = String.fromCharCode('A'.charCodeAt(0) + column)}
			<ColHeader active={activeCell?.column === column} {column} value={colName} />
		{/each}

		{#each { length: numOfRows } as _, row}
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
