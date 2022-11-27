import type { Writable } from 'svelte/store';
export type ActiveCell = {
	column: number;
	row: number;
};

export type SveetCellStyle = {
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
	strikeThrough?: boolean;
	fontSize?: number;
};

export interface SveetCell {
	row: number;
	column: number;
	displayValue: Writable<string>;
	formula: {
		set: (value: string, save?: boolean) => void;
		subscribe: Writable<string>['subscribe'];
		startEditing: () => void;
		stopEditing: (save: boolean) => void;
	};
	style: Writable<SveetCellStyle> & {
		setStyle: <T extends keyof SveetCellStyle>(key: T, value: SveetCellStyle[T]) => void;
		toggleStyle: (key: keyof SveetCellStyle) => void;
	};
}

export type Sveet = {
	sveet: {
		get(address: string): SveetCell;
		set(address: string, cell: SveetCell): void;
		getByColumnAndRow(columnAndRow: { column: number; row: number }): SveetCell;
	};
	numberOfRows: number;
	numberOfColumns: number;
	activeCell: Writable<{ column: number; row: number }> & {
		move: (deltaX: number, deltaY: number) => void;
	};
};

export type SveetContext = {
	currentSveet: Sveet;
	numberOfColumns: number;
	numberOfRows: number;
};
