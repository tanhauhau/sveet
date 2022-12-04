<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let columnHeaderHeight: number;
	export let container: HTMLElement;
	export let columnResizeGuidePosition:
		| { leftPosition: number; column: number; leftLimit: number }
		| undefined;

	const dispatch = createEventDispatcher();

	let x: number = 0;
	let startDragging = false;

	$: if (columnResizeGuidePosition?.leftPosition) x = columnResizeGuidePosition.leftPosition;
	$: shouldShow = startDragging || columnResizeGuidePosition !== undefined;

	function drag(element: HTMLDivElement) {
		element.addEventListener('mousedown', onMouseDown);
		let scrollX = 0;
		let column: number;
		let leftLimit: number;
		function onMouseDown() {
			document.body.addEventListener('mousemove', onMouseMove);
			document.body.addEventListener('mouseup', onMouseUp);
			startDragging = true;
			scrollX = container.scrollLeft;
			column = columnResizeGuidePosition!.column;
			leftLimit = columnResizeGuidePosition!.leftLimit;
		}
		function onMouseMove(event: MouseEvent) {
			x = Math.max(leftLimit + 10, event.clientX + scrollX);
		}
		function onMouseUp() {
			startDragging = false;
			document.body.removeEventListener('mousemove', onMouseMove);
			document.body.removeEventListener('mouseup', onMouseUp);
			dispatch('resize', { x, column });
		}
		return {
			destroy() {
				element.removeEventListener('mousedown', onMouseDown);
				document.body.removeEventListener('mousemove', onMouseMove);
				document.body.removeEventListener('mouseup', onMouseUp);
			}
		};
	}
</script>

<div
	class="container"
	style:--column-header-height={columnHeaderHeight + 'px'}
	style:transform={`translateX(${x}px)`}
	style:opacity={shouldShow ? 1 : 0}
	style:pointer-events={shouldShow ? 'initial' : 'none'}
	class:dragging={startDragging}
	use:drag
>
	<div
		class="headerGuide"
		on:mouseout={() => {
			if (!startDragging && columnResizeGuidePosition) {
				dispatch('unhintResizeColumn');
			}
		}}
	/>
	<div class="columnGuide" />
</div>

<style>
	.container {
		position: absolute;
		top: 0;
		left: calc(-1 * var(--guide-width));
		z-index: 1000;
		height: 100%;
		--guide-width: 5px;
		--guide-color: violet;
	}
	.headerGuide {
		width: var(--guide-width);
		height: var(--column-header-height);
		background: var(--guide-color);
		cursor: e-resize;
	}
	.columnGuide {
		width: 1px;
		height: 100%;
		background: var(--guide-color);
		margin-left: calc((var(--guide-width) - 1px) / 2);
		opacity: 0;
	}

	.dragging .columnGuide {
		opacity: 1;
	}
</style>
