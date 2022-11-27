<script lang="ts">
	import rightIcon from '@fluentui/svg-icons/icons/caret_right_16_filled.svg';
	import { getContext } from 'svelte';
	import type { SveetContext } from '../types';
	import type { Menu, MenuItem } from './menu';
	export let menuChild: Array<Menu | MenuItem>;

	let menuCurrentlyShowing: string | null = null;

	const { currentSveet } = getContext('sveet') as SveetContext;
	const { sveet, activeCell } = currentSveet;
</script>

<div>
	<menu>
		{#each menuChild as menu}
			{@const { type } = menu}
			{#if type === 'divider'}
				<hr />
			{:else}
				{@const { name, icon, children } = menu}
				<!-- svelte-ignore a11y-mouse-events-have-key-events -->
				<li
					on:mouseover={() => {
						menuCurrentlyShowing = name;
					}}
					on:click={() => {
						if (menu.action) {
							menu.action({ cell: sveet.getByColumnAndRow($activeCell) });
						}
					}}
				>
					{#if icon}<img src={icon} />{/if}
					<span>{name}</span>
					{#if children}
						<img src={rightIcon} />
						{#if menuCurrentlyShowing === name}
							<svelte:self menuChild={children} --top-position={0} --left-position="100%" />
						{/if}
					{/if}
				</li>
			{/if}
		{/each}
	</menu>
</div>

<style>
	div {
		position: absolute;
		top: var(--top-position);
		left: var(--left-position);
		background-color: white;
		box-shadow: black 1px 1px 1px;
		z-index: 1;
	}
	menu {
		padding: 0;
		margin: 0;
	}
	li {
		list-style-type: none;
		position: relative;
		padding: 4px 8px;
		min-width: 180px;
		max-width: 80vw;
		display: flex;
		align-items: center;
	}
	li:hover {
		background-color: var(--hover-color);
	}
	span {
		flex: 1;
	}
	hr {
		height: 1px;
		background: #eee;
		outline: none;
		border: none;
	}
</style>
