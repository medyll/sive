import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import SuggestionItem from './SuggestionItem.svelte';
import type { SuggestionData } from '$lib/suggestionsStore.svelte.js';

const modSuggestion: SuggestionData = {
  id: 'sug-1',
  type: 'modification',
  before: 'He walked fast.',
  after: 'He strode with purpose.',
  context: 'Para. 2'
};

const addSuggestion: SuggestionData = {
  id: 'sug-2',
  type: 'addition',
  after: 'The rain fell steadily.',
  context: 'Para. 4'
};

const delSuggestion: SuggestionData = {
  id: 'sug-3',
  type: 'deletion',
  before: 'It was very interesting.',
  context: 'Para. 6'
};

describe('SuggestionItem', () => {
  it('renders context and type badge', async () => {
    render(SuggestionItem, { suggestion: modSuggestion, onAccept: vi.fn(), onReject: vi.fn() });
    await expect.element(page.getByText('Para. 2')).toBeVisible();
    await expect.element(page.getByText('modification')).toBeVisible();
  });

  it('modification shows both before (del) and after (ins) text', async () => {
    const { container } = render(SuggestionItem, { suggestion: modSuggestion, onAccept: vi.fn(), onReject: vi.fn() });
    expect(container.querySelector('del.diff-del')?.textContent).toBe('He walked fast.');
    expect(container.querySelector('ins.diff-ins')?.textContent).toBe('He strode with purpose.');
  });

  it('addition shows only ins text', async () => {
    const { container } = render(SuggestionItem, { suggestion: addSuggestion, onAccept: vi.fn(), onReject: vi.fn() });
    expect(container.querySelector('ins.diff-ins')?.textContent).toBe('The rain fell steadily.');
    expect(container.querySelector('del')).toBeNull();
  });

  it('deletion shows only del text', async () => {
    const { container } = render(SuggestionItem, { suggestion: delSuggestion, onAccept: vi.fn(), onReject: vi.fn() });
    expect(container.querySelector('del.diff-del')?.textContent).toBe('It was very interesting.');
    expect(container.querySelector('ins')).toBeNull();
  });

  it('Accept button calls onAccept with the suggestion id', async () => {
    const onAccept = vi.fn();
    render(SuggestionItem, { suggestion: modSuggestion, onAccept, onReject: vi.fn() });
    await page.getByRole('button', { name: 'Accept suggestion' }).click();
    expect(onAccept).toHaveBeenCalledWith('sug-1');
  });

  it('Reject button calls onReject with the suggestion id', async () => {
    const onReject = vi.fn();
    render(SuggestionItem, { suggestion: modSuggestion, onAccept: vi.fn(), onReject });
    await page.getByRole('button', { name: 'Reject suggestion' }).click();
    expect(onReject).toHaveBeenCalledWith('sug-1');
  });

  it('has role="article" on the card', async () => {
    const { container } = render(SuggestionItem, { suggestion: modSuggestion, onAccept: vi.fn(), onReject: vi.fn() });
    expect(container.querySelector('article.suggestion-item')).not.toBeNull();
  });
});
