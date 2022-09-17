<script>
  import Sheet from './Sheet.svelte';
  import TopBar from './TopBar.svelte';
  import BottomBar from './BottomBar.svelte';
</script>

<section class="container">
  <Sheet />
  <TopBar />
  <BottomBar />
</section>

<style>
  .container {
    display: grid;
    width: 100vw;
    height: 100vh;
    grid-template-columns: 1fr;
    grid-template-rows: 150px 1fr 50px;
    grid-template-areas: "top-bar" "sheet" "bottom-bar";
  }
</style>