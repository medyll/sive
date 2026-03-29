import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	readBible,
	readTimeline,
	readStructure,
	readThemes,
	readNarrator,
	readChapter,
	readCharacterSheet,
	listChapters,
	readVersion,
	readVersionIndex,
	parseYaml,
	MCP_TOOLS,
	executeMCPTool
} from '$lib/server/mcp/tools';
import { existsSync, readFileSync } from 'fs';

// Mock fs module
vi.mock('fs', () => ({
	readFileSync: vi.fn(),
	existsSync: vi.fn(),
	readdirSync: vi.fn()
}));

// Mock path module
vi.mock('path', () => ({
	join: (...args: string[]) => args.join('/')
}));

describe('MCP Tools - Read Operations', () => {
	const mockProjectId = 'test-project';
	const mockChapterId = 'chapter_01';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('readBible', () => {
		it('returns bible.yaml content when file exists', () => {
			const mockContent = 'characters:\n  - name: John';
			vi.mocked(existsSync).mockReturnValue(true);
			vi.mocked(readFileSync).mockReturnValue(mockContent);

			const result = readBible(mockProjectId);

			expect(existsSync).toHaveBeenCalledWith(`./projects/${mockProjectId}/bible.yaml`);
			expect(result).toBe(mockContent);
		});

		it('throws error when bible.yaml not found', () => {
			vi.mocked(existsSync).mockReturnValue(false);

			expect(() => readBible(mockProjectId)).toThrow(
				`bible.yaml not found for project: ${mockProjectId}`
			);
		});
	});

	describe('readTimeline', () => {
		it('returns timeline.yaml content when file exists', () => {
			const mockContent = 'events:\n  - date: 2024-01-01';
			vi.mocked(existsSync).mockReturnValue(true);
			vi.mocked(readFileSync).mockReturnValue(mockContent);

			const result = readTimeline(mockProjectId);

			expect(result).toBe(mockContent);
		});

		it('throws error when timeline.yaml not found', () => {
			vi.mocked(existsSync).mockReturnValue(false);

			expect(() => readTimeline(mockProjectId)).toThrow(
				`timeline.yaml not found for project: ${mockProjectId}`
			);
		});
	});

	describe('readStructure', () => {
		it('returns structure.yaml content when file exists', () => {
			const mockContent = 'acts:\n  - title: Act 1';
			vi.mocked(existsSync).mockReturnValue(true);
			vi.mocked(readFileSync).mockReturnValue(mockContent);

			const result = readStructure(mockProjectId);
			expect(result).toBe(mockContent);
		});
	});

	describe('readThemes', () => {
		it('returns themes.yaml content when file exists', () => {
			const mockContent = 'themes:\n  - name: Love';
			vi.mocked(existsSync).mockReturnValue(true);
			vi.mocked(readFileSync).mockReturnValue(mockContent);

			const result = readThemes(mockProjectId);
			expect(result).toBe(mockContent);
		});
	});

	describe('readNarrator', () => {
		it('returns narrator.yaml content when file exists', () => {
			const mockContent = 'pov: first_person';
			vi.mocked(existsSync).mockReturnValue(true);
			vi.mocked(readFileSync).mockReturnValue(mockContent);

			const result = readNarrator(mockProjectId);
			expect(result).toBe(mockContent);
		});
	});

	describe('readChapter', () => {
		it('returns chapter md and yaml when both files exist', () => {
			const mockMd = '# Chapter 1\n\nContent...';
			const mockYaml = 'title: Chapter 1';
			vi.mocked(existsSync)
				.mockReturnValueOnce(true) // md check
				.mockReturnValueOnce(true); // yaml check
			vi.mocked(readFileSync)
				.mockReturnValueOnce(mockMd)
				.mockReturnValueOnce(mockYaml);

			const result = readChapter(mockProjectId, mockChapterId);

			expect(result).toEqual({ md: mockMd, yaml: mockYaml });
		});

		it('returns empty yaml when yaml file does not exist', () => {
			const mockMd = '# Chapter 1';
			vi.mocked(existsSync)
				.mockReturnValueOnce(true) // md check
				.mockReturnValueOnce(false); // yaml check
			vi.mocked(readFileSync).mockReturnValueOnce(mockMd);

			const result = readChapter(mockProjectId, mockChapterId);

			expect(result).toEqual({ md: mockMd, yaml: '' });
		});

		it('throws error when chapter markdown not found', () => {
			vi.mocked(existsSync).mockReturnValue(false);

			expect(() => readChapter(mockProjectId, mockChapterId)).toThrow(
				'Chapter markdown not found'
			);
		});
	});

	describe('readCharacterSheet', () => {
		it('returns character sheet content when file exists', () => {
			const mockContent = 'name: John\nrole: protagonist';
			vi.mocked(existsSync).mockReturnValue(true);
			vi.mocked(readFileSync).mockReturnValue(mockContent);

			const result = readCharacterSheet(mockProjectId, 'john');

			expect(result).toBe(mockContent);
		});

		it('throws error when character sheet not found', () => {
			vi.mocked(existsSync).mockReturnValue(false);

			expect(() => readCharacterSheet(mockProjectId, 'unknown')).toThrow(
				'Character sheet not found'
			);
		});
	});

	describe('listChapters', () => {
		it('returns sorted list of chapter IDs', () => {
			vi.mocked(existsSync).mockReturnValue(true);
			vi.mocked(readdirSync).mockReturnValue([
				'chapter_01.md',
				'chapter_01.yaml',
				'chapter_02.md',
				'chapter_03.md'
			]);

			const result = listChapters(mockProjectId);

			expect(result).toEqual(['chapter_01', 'chapter_02', 'chapter_03']);
		});

		it('throws error when chapters directory not found', () => {
			vi.mocked(existsSync).mockReturnValue(false);

			expect(() => listChapters(mockProjectId)).toThrow(
				'Chapters directory not found'
			);
		});
	});

	describe('parseYaml', () => {
		it('parses simple YAML to object', () => {
			const yaml = `
title: My Novel
author: John Doe
genre: Fiction
`.trim();

			const result = parseYaml(yaml);

			expect(result).toEqual({
				title: 'My Novel',
				author: 'John Doe',
				genre: 'Fiction'
			});
		});

		it('ignores comments', () => {
			const yaml = `
# This is a comment
title: Test
# Another comment
author: Jane
`.trim();

			const result = parseYaml(yaml);

			expect(result).toEqual({
				title: 'Test',
				author: 'Jane'
			});
		});

		it('throws error on invalid YAML', () => {
			expect(() => parseYaml(null as unknown as string)).toThrow(
				'Failed to parse YAML'
			);
		});
	});

	describe('MCP_TOOLS registry', () => {
		it('contains all read operation tools', () => {
			const expectedTools = [
				'read_bible',
				'read_timeline',
				'read_structure',
				'read_themes',
				'read_narrator',
				'read_chapter',
				'read_character_sheet',
				'list_chapters',
				'read_version',
				'read_version_index',
				'parse_yaml'
			];

			expect(Object.keys(MCP_TOOLS)).toEqual(expect.arrayContaining(expectedTools));
		});
	});

	describe('executeMCPTool', () => {
		it('executes tool by name with correct arguments', () => {
			vi.mocked(existsSync).mockReturnValue(true);
			vi.mocked(readFileSync).mockReturnValue('mock content');

			const result = executeMCPTool('read_bible', mockProjectId);

			expect(result).toBe('mock content');
		});

		it('throws error for unknown tool', () => {
			expect(() => executeMCPTool('unknown_tool' as never)).toThrow(
				'Unknown MCP tool: unknown_tool'
			);
		});
	});
});
