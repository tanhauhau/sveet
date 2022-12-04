<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let column: number;
	export let value: string;
	export let active: boolean;
	export let element: HTMLElement;

	const dispatch = createEventDispatcher();
</script>

<div bind:this={element} class:active style:--column={column}>
	{value}
	<span on:mouseover={() => dispatch('hintResizeColumn')} />
</div>

<style>
	div {
		background-color: lightgray;
		grid-row: 1;
		grid-column: calc(var(--column) + 2);
		position: sticky;
		top: 0;
		text-align: center;
	}
	span {
		display: block;
		width: 5px;
		height: 100%;
		position: absolute;
		right: 0;
		top: 0;
	}

	.active {
		background-color: gray;
	}
</style>
