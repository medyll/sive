export interface SuggestionData {
  id: string;
  type: 'addition' | 'modification' | 'deletion';
  before?: string;
  after?: string;
  context?: string;
}

export const STUB_SUGGESTIONS: SuggestionData[] = [
  {
    id: 'sug-1',
    type: 'modification',
    before: 'Jean walked quickly toward the door.',
    after: 'Jean strode toward the door, jaw set.',
    context: 'Para. 2 — Action sequence'
  },
  {
    id: 'sug-2',
    type: 'addition',
    after: 'The rain had started again, thin and relentless.',
    context: 'Para. 4 — After "He lit a cigarette."'
  },
  {
    id: 'sug-3',
    type: 'deletion',
    before: 'It was a very interesting development.',
    context: 'Para. 6 — Redundant observation'
  }
];

function createSuggestionsStore() {
  let items = $state<SuggestionData[]>([]);

  function setItems(data: SuggestionData[]) {
    items = [...data];
  }

  function accept(id: string) {
    items = items.filter((s) => s.id !== id);
  }

  function reject(id: string) {
    items = items.filter((s) => s.id !== id);
  }

  function acceptAll() {
    items = [];
  }

  return {
    get items() { return items; },
    setItems,
    accept,
    reject,
    acceptAll
  };
}

export const suggestionsStore = createSuggestionsStore();
