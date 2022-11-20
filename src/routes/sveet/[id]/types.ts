import type { Writable } from 'svelte/store';
export type ActiveCell = {
	column: number;
	row: number;
};

export interface SveetCell {
	row: number;
	column: number;
	displayValue: Writable<string>;
	formula: {
		set: (value: string, save?: boolean) => void;
		subscribe: Writable<string>['subscribe'],
		startEditing: () => void;
		stopEditing: (save: boolean) => void;
	};
}

export type Sveet = {
	sveet: Map<string, SveetCell>;
	numberOfRows: number;
	numberOfColumns: number;
	activeCell: Writable<{ column: number; row: number }> & {
		move: (deltaX: number, deltaY: number) => void
	}
};

export type SveetContext = {
	currentSveet: Sveet;
	numberOfColumns: number;
	numberOfRows: number;
};
