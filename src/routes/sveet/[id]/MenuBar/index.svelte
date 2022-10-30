<script lang="ts">
	import { menu as menuData } from './menu';
	import Dropdown from './Dropdown.svelte';
	let showDropdownMode = false;
	let menuCurrentlyShowing: string | null = null;

	function clickOutside(node: HTMLElement, callback: () => void) {
		function onClick(event) {
			if (!node.contains(event.target)) {
				callback();
			}
		}
		document.body.addEventListener('click', onClick);
		return {
			update(newCallback: () => void) {
				callback = newCallback;
			},
			destroy() {
				document.body.removeEventListener('click', onClick);
			}
		};
	}
</script>

<menu
	use:clickOutside={() => {
		if (menuCurrentlyShowing) {
			menuCurrentlyShowing = null;
			showDropdownMode = false;
		}
	}}
>
	{#each menuData as { name, children }}
		<li

			on:click={() => {
				showDropdownMode = true;
				menuCurrentlyShowing = name;
			}}
			on:mouseover={() => {
				if (showDropdownMode) {
					menuCurrentlyShowing = name;
				}
			}}
		>
			{name}
			{#if menuCurrentlyShowing === name}
				<Dropdown menuChild={children} --top-position="100%" --left-position="0"/>
			{/if}
		</li>
	{/each}
</menu>

<style>
	menu {
		height: 24px;
		background: white;
		border-bottom: 1px solid #333;
		margin: 0;
		padding: 0 8px;
	}
	li {
		display: inline-block;
		list-style-type: none;
		padding: 2px 4px;
		position: relative;
	}
	li:hover {
		background-color: #0001;
	}
</style>
