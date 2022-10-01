<script lang="ts">
	export let column: number;
	export let value: string;
	export let active: boolean;
	export let element: HTMLElement;
</script>

<div bind:this={element} class:active style:--column={column}>{value}</div>

<style>
	div {
		background-color: lightgray;
		grid-row: 1;
		grid-column: calc(var(--column) + 2);
		position: sticky;
		top: 0;
		text-align: center;
	}
	.active {
		background-color: gray;
	}
</style>
