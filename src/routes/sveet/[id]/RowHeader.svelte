<script lang="ts">
	export let row: number;
	export let value: string;
	export let active: boolean;
	export let element: HTMLElement;
</script>

<div bind:this={element} class:active style:--row={row}>{value}</div>

<style>
	div {
		background-color: lightgray;
		grid-row: calc(var(--row) + 2);
		grid-column: 1;
		position: sticky;
		left: 0;
		text-align: center;
	}
	.active {
		background-color: gray;
	}
</style>
