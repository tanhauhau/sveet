<script>
  import {actions} from './actions';
</script>

<div>
  {#each actions as {title, icon,action}}
    <img src={icon} alt={title} />
  {/each}
</div>

<style>
  div {
    padding: 4px 8px;
    border-bottom: 1px solid var(--border-color);
  }
  img:hover {
    background: var(--hover-color);
  }
</style>