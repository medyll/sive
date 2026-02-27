// Unit tests for data-loader.ts
import { describe, it, expect } from 'vitest';
import {
  loadThemes,
  loadStructure,
  loadNarrator,
  loadCharacterSheet,
  loadBible,
  loadTimeline,
  loadChapter
} from './data-loader';

// Test themes.yaml
describe('loadThemes', () => {
  it('should load themes, motifs, and symbols', () => {
    const data = loadThemes('src/data/themes.yaml');
    expect(data.themes).toBeDefined();
    expect(data.motifs).toBeDefined();
    expect(data.symbols).toBeDefined();
    expect(data.themes[0].id).toBe('theme_redemption');
    expect(data.motifs[0].id).toBe('motif_water');
    expect(data.symbols[0].id).toBe('symbol_seine');
  });
});

// Test structure.yaml
describe('loadStructure', () => {
  it('should load structure with acts and narrativeThreads', () => {
    const structure = loadStructure('src/data/structure.yaml');
    expect(structure.model).toBe('three_acts');
    expect(structure.acts.length).toBeGreaterThan(0);
    expect(structure.narrativeThreads.length).toBeGreaterThan(0);
    expect(structure.tensionCurve.length).toBeGreaterThan(0);
  });
});

// Test narrator.yaml
describe('loadNarrator', () => {
  it('should load narrator config', () => {
    const narrator = loadNarrator('src/data/narrator.yaml');
    expect(narrator.type).toBe('heterodiegetic');
    expect(narrator.pov_exceptions.length).toBeGreaterThan(0);
    expect(narrator.rules.length).toBeGreaterThan(0);
  });
});

// Test character sheet
describe('loadCharacterSheet', () => {
  it('should load detailed character sheet', () => {
    const sheet = loadCharacterSheet('src/data/character_jean_dupont.yaml');
    expect(sheet.id).toBe('jean_dupont');
    expect(sheet.biography).toBeDefined();
    expect(sheet.psychology).toBeDefined();
    expect(sheet.voice).toBeDefined();
    expect(sheet.narrativeArc).toBeDefined();
  });
});

// Test bible.yaml
describe('loadBible', () => {
  it('should load bible with characters, locations, objects, vehicles, relations', () => {
    const bible = loadBible('src/data/bible.yaml');
    expect(bible.characters.length).toBeGreaterThan(0);
    expect(bible.locations.length).toBeGreaterThan(0);
    expect(bible.objects.length).toBeGreaterThan(0);
    expect(bible.vehicles.length).toBeGreaterThan(0);
    expect(bible.relations.length).toBeGreaterThan(0);
  });
});

// Test timeline.yaml
describe('loadTimeline', () => {
  it('should load timeline with events and ellipses', () => {
    const timeline = loadTimeline('src/data/timeline.yaml');
    expect(timeline.timeUnit).toBe('day');
    expect(timeline.events.length).toBeGreaterThan(0);
    expect(timeline.ellipses.length).toBeGreaterThan(0);
  });
});

// Test chapter yaml
describe('loadChapter', () => {
  it('should load chapter with states, keyEvents, transitions', () => {
    const chapter = loadChapter('src/data/chapter_07.yaml');
    expect(chapter.chapterRef).toBe('chapter_07');
    expect(chapter.states.characters.length).toBeGreaterThan(0);
    expect(chapter.states.objects.length).toBeGreaterThan(0);
    expect(chapter.states.vehicles.length).toBeGreaterThan(0);
    expect(chapter.keyEvents.length).toBeGreaterThan(0);
    expect(chapter.transitions.length).toBeGreaterThan(0);
  });
});
