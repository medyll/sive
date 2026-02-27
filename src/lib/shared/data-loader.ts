// Data loader for Sive YAML project files
// Uses types from types.ts
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import {
  Theme, Motif, Symbol, NarrativeThread, StructureSchema, ProjectFileTree,
  CharacterSheet, ChapterSchema, TimelineSchema, CharacterEntry, LocationEntry, ObjectEntry, VehicleEntry, RelationEntry
} from './types/types';

// Utility to load and parse a YAML file
export function loadYamlFile<T>(filePath: string): T {
  const absPath = path.resolve(filePath);
  const content = fs.readFileSync(absPath, 'utf8');
  return yaml.load(content) as T;
}

// Example: load themes.yaml
export function loadThemes(filePath = 'src/data/themes.yaml'): { themes: Theme[]; motifs: Motif[]; symbols: Symbol[] } {
  return loadYamlFile(filePath);
}

// Example: load structure.yaml
export function loadStructure(filePath = 'src/data/structure.yaml'): StructureSchema {
  return loadYamlFile(filePath);
}

// Example: load narrator.yaml (returns any, can be refined)
export function loadNarrator(filePath = 'src/data/narrator.yaml'): any {
  return loadYamlFile(filePath);
}

// Example: load a character sheet
export function loadCharacterSheet(filePath: string): CharacterSheet {
  return loadYamlFile(filePath);
}

// Example: load bible.yaml
export function loadBible(filePath = 'src/data/bible.yaml'): {
  characters: CharacterEntry[];
  locations: LocationEntry[];
  objects: ObjectEntry[];
  vehicles: VehicleEntry[];
  relations: RelationEntry[];
} {
  return loadYamlFile(filePath);
}

// Example: load timeline.yaml
export function loadTimeline(filePath = 'src/data/timeline.yaml'): TimelineSchema {
  return loadYamlFile(filePath);
}

// Example: load chapter yaml
export function loadChapter(filePath: string): ChapterSchema {
  return loadYamlFile(filePath);
}
