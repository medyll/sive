export interface StyleValues {
  cynicism: number;
  complexity: number;
  rhythm: number;
  density: number;
}

const DEFAULT: StyleValues = { cynicism: 50, complexity: 50, rhythm: 50, density: 50 };

function createStyleStore() {
  let values = $state<StyleValues>({ ...DEFAULT });

  function set(key: keyof StyleValues, value: number) {
    values[key] = value;
  }

  return {
    get values() { return values; },
    set
  };
}

export const styleStore = createStyleStore();
