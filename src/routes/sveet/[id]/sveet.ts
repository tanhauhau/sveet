import { writable, type Writable, derived, get } from 'svelte/store';
import type { SveetCell } from './types';
export function createSveet({
	numberOfRows,
	numberOfColumns
}: {
	numberOfRows: number;
	numberOfColumns: number;
}) {
	const sveet = new Map();
	for (let r = 0; r < numberOfRows; r++) {
		for (let c = 0; c < numberOfColumns; c++) {
			const columnName = getColumnName(c);
			const rowIndex = getRowIndex(r);
			const cell = createSveetCell({ row: r, column: c, sveet });
			sveet.set(columnName + rowIndex, cell);
		}
	}
	const activeCell = writable({
		column: 0,
		row: 0
	});

	return {
		sveet,
		numberOfRows,
		numberOfColumns,
		activeCell: {
			...activeCell,
			move: (deltaX: number, deltaY: number) => {
				activeCell.update(({ column, row }) => {
					return {
						column: column + deltaX,
						row: row + deltaY
					};
				});
			}
		}
	};
}

function createSveetCell({
	row,
	column,
	sveet
}: {
	row: number;
	column: number;
	sveet: Map<string, SveetCell>;
}): SveetCell {
	const displayValue = writable('');
	let formulaValue = '';
	let lastSavedFormulaValue: string;
	let cleanup: () => void;
	const formula = writable(formulaValue);

	return {
		row,
		column,
		displayValue,
		formula: {
			set(value: string, save?: boolean) {
				formulaValue = value;
				formula.set(value);
				if (save) {
					this.stopEditing(true);
				}
			},
			subscribe: formula.subscribe,
			startEditing() {
				console.log(`Start editing cell ${row},${column}`);
				lastSavedFormulaValue = formulaValue;
			},
			stopEditing(save: boolean) {
				console.log(`Stop editing cell ${row},${column}`);
				if (save) {
					if (formulaValue.startsWith('=')) {
						if (typeof cleanup === 'function') {
							cleanup();
						}
						// doing some formula
						const derivedStore = createDerivedDisplayValueStore(formulaValue, sveet);
						cleanup = derivedStore.subscribe((newDisplayValue) =>
							displayValue.set(newDisplayValue)
						);
					} else {
						// normal cell value
						displayValue.set(formulaValue);
					}
				} else {
					formula.set((formulaValue = lastSavedFormulaValue));
				}
			}
		}
	};
}

const formulaFunctions = {
	sum(a, b) {
		return a + b;
	}
};

function createDerivedDisplayValueStore(formulaValue: string, sveet: Map<string, SveetCell>) {
	const obj = new Proxy(
		{},
		{
			get(_, propertyName) {
				if (propertyName === Symbol.unscopables) return [];
				if (propertyName in formulaFunctions) return formulaFunctions[propertyName];

				const displayValue = sveet.get(propertyName as string).displayValue;
				if (detecting) {
					storesToSubscribe.push(displayValue);
				}
				return get(displayValue);
			},
			has(_, key) {
				return true;
			}
		}
	);
	// '= E3';
	// 'with(sveet) { return E3 }'
	// (sveet) => { with(sveet) { return E3 } }

	const fn = new Function('sveet', `with(sveet) { ${formulaValue.replace('=', 'return ')} }`);
	let storesToSubscribe = [];
	let detecting = true;
	fn(obj);
	detecting = false;
	const derivedStore = derived(storesToSubscribe, () => {
		return fn(obj);
	});
	return derivedStore;
}

const A_CHARCODE = 'A'.charCodeAt(0);
export function getColumnName(column: number) {
	return String.fromCharCode(A_CHARCODE + column);
}
export function getRowIndex(row: number) {
	return row + 1;
}

export function fromColumnName(column: string): number {
	let result = 0;
	for (let index = column.length - 1, base = 1; index >= 0; index--, base *= 26) {
		const value = column.charCodeAt(index) - A_CHARCODE;
		result += value * base;
	}
	return result;
}
export function fromRowIndex(row: string): number {
	return Number(row) - 1;
}
