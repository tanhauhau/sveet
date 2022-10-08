import { writable, type Writable, derived, get } from 'svelte/store';
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
  return sveet;
}

export interface SveetCell {
  row: number;
  column: number;
  displayValue: Writable<string>;
  formula: Writable<string> & {
    startEditing: () => void;
    stopEditing: (save: boolean) => void;
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
}) {
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
      set: (value: string) => {
        formulaValue = value;
        formula.set(value);
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
          formula.set(lastSavedFormulaValue);
        }
      }
    }
  };
}

const formulaFunctions = {
  sum: (a: string, b: string) => parseFloat(a) + parseFloat(b)
}

function createDerivedDisplayValueStore(formulaValue: string, sveet: Map<string, SveetCell>) {
  const obj = new Proxy({}, {
    get(_, propertyName) {
      if (propertyName === Symbol.unscopables) return [];
      if (Object.hasOwn(formulaFunctions, propertyName)) return formulaFunctions[propertyName as keyof typeof formulaFunctions];

      const displayValue = sveet.get(propertyName as string)?.displayValue;
      if (!displayValue) return [];
      if (detecting) {
        storesToSubscribe.push(displayValue);
      }
      return get(displayValue);
    },
    has: () => true
  });
  // '= E3';
  // 'with(sveet) { return E3 }'
  // (sveet) => { with(sveet) { return E3 } }

  const fn = new Function('sveet', `with(sveet) { ${formulaValue.replace('=', 'return ')} }`);
  const storesToSubscribe: Writable<string>[] = [];
  let detecting = true;
  fn(obj);
  detecting = false;
  const derivedStore = derived(storesToSubscribe, () => {
    return fn(obj);
  });
  return derivedStore;
}

export function getColumnName(column: number) {
  return String.fromCharCode('A'.charCodeAt(0) + column);
}
export function getRowIndex(row: number) {
  return row + 1;
}
