import type { Writable } from 'svelte/store';

export type GetStoreValue<Store> = Store extends Writable<infer Value>
  ? Value
  : never;
