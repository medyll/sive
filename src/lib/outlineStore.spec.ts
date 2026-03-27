/**
 * outlineStore.spec.ts — Unit tests for outline store
 * 
 * S73-06: Unit Tests — AI Features
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { outlineStore } from './outlineStore.svelte';

// Mock localStorage
global.localStorage = {
	getItem: vi.fn().mockReturnValue(null),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
	length: 0,
	key: vi.fn()
} as any;

describe('outlineStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		outlineStore.reset();
	});

	describe('setLoading', () => {
		it('sets loading state to true', () => {
			outlineStore.setLoading(true);
			expect(outlineStore.isLoading).toBe(true);
		});

		it('clears error when loading starts', () => {
			outlineStore.setError('Previous error');
			outlineStore.setLoading(true);
			expect(outlineStore.error).toBeNull();
		});

		it('persists to localStorage', () => {
			outlineStore.setLoading(true);
			expect(localStorage.setItem).toHaveBeenCalled();
		});
	});

	describe('setSections', () => {
		it('sets outline sections', () => {
			const sections = [
				{ id: '1', title: 'Introduction', level: 1 },
				{ id: '2', title: 'Background', level: 2 }
			];
			
			outlineStore.setSections(sections, 'doc-123');
			
			expect(outlineStore.sections).toEqual(sections);
			expect(outlineStore.state.documentId).toBe('doc-123');
		});

		it('sets generatedAt timestamp', () => {
			const before = Date.now();
			const sections = [{ id: '1', title: 'Test', level: 1 }];
			outlineStore.setSections(sections, 'doc-123');
			const after = Date.now();
			
			const generatedAt = new Date(outlineStore.state.generatedAt!).getTime();
			expect(generatedAt).toBeGreaterThanOrEqual(before);
			expect(generatedAt).toBeLessThanOrEqual(after);
		});

		it('sets loading to false', () => {
			outlineStore.setLoading(true);
			outlineStore.setSections([], 'doc-123');
			expect(outlineStore.isLoading).toBe(false);
		});

		it('clears error', () => {
			outlineStore.setError('Error');
			outlineStore.setSections([], 'doc-123');
			expect(outlineStore.error).toBeNull();
		});
	});

	describe('setError', () => {
		it('sets error message', () => {
			outlineStore.setError('Test error');
			expect(outlineStore.error).toBe('Test error');
		});

		it('sets loading to false', () => {
			outlineStore.setLoading(true);
			outlineStore.setError('Error');
			expect(outlineStore.isLoading).toBe(false);
		});
	});

	describe('clear', () => {
		it('resets to default state', () => {
			const sections = [{ id: '1', title: 'Test', level: 1 }];
			outlineStore.setSections(sections, 'doc-123');
			outlineStore.clear();
			
			expect(outlineStore.sections).toEqual([]);
			expect(outlineStore.state.documentId).toBeNull();
			expect(outlineStore.state.generatedAt).toBeNull();
		});
	});

	describe('insertAtCursor', () => {
		it('generates markdown outline from sections', () => {
			const sections = [
				{ id: '1', title: 'Introduction', level: 1 },
				{ id: '2', title: 'Background', level: 2 },
				{ id: '3', title: 'Conclusion', level: 1 }
			];
			outlineStore.setSections(sections, 'doc-123');
			
			const result = outlineStore.insertAtCursor('');
			
			expect(result).toContain('# Introduction');
			expect(result).toContain('## Background');
			expect(result).toContain('# Conclusion');
		});

		it('appends existing content', () => {
			const sections = [{ id: '1', title: 'Test', level: 1 }];
			outlineStore.setSections(sections, 'doc-123');
			
			const result = outlineStore.insertAtCursor('Existing content');
			
			expect(result).toContain('Existing content');
		});
	});

	describe('flatSections', () => {
		it('flattens nested sections', () => {
			const sections = [
				{ 
					id: '1', 
					title: 'Main', 
					level: 1,
					children: [
						{ id: '2', title: 'Sub', level: 2 }
					]
				}
			];
			outlineStore.setSections(sections, 'doc-123');
			
			expect(outlineStore.flatSections.length).toBe(2);
			expect(outlineStore.flatSections[0].title).toBe('Main');
			expect(outlineStore.flatSections[1].title).toBe('Sub');
		});
	});

	describe('sectionCount', () => {
		it('returns number of top-level sections', () => {
			const sections = [
				{ id: '1', title: 'One', level: 1 },
				{ id: '2', title: 'Two', level: 1 },
				{ id: '3', title: 'Three', level: 1 }
			];
			outlineStore.setSections(sections, 'doc-123');
			
			expect(outlineStore.sectionCount).toBe(3);
		});
	});

	describe('reset', () => {
		it('resets all state to defaults', () => {
			const sections = [{ id: '1', title: 'Test', level: 1 }];
			outlineStore.setSections(sections, 'doc-123');
			outlineStore.reset();
			
			expect(outlineStore.sections).toEqual([]);
			expect(outlineStore.isLoading).toBe(false);
			expect(outlineStore.error).toBeNull();
		});
	});
});
