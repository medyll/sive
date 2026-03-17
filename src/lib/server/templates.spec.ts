import { describe, it, expect, beforeEach } from 'vitest';
import {
	getBuiltIn,
	getUserTemplates,
	getAllTemplates,
	saveUserTemplate,
	deleteUserTemplate,
	getTemplate,
	applyTemplate
} from './templates';

const USER = 'test-user-1';
const USER2 = 'test-user-2';

// Reset user store between tests via module-level isolation
beforeEach(() => {
	// Delete all user templates to reset state
	const list = getUserTemplates(USER);
	list.forEach((t) => deleteUserTemplate(USER, t.id));
	const list2 = getUserTemplates(USER2);
	list2.forEach((t) => deleteUserTemplate(USER2, t.id));
});

describe('getBuiltIn', () => {
	it('returns 6 built-in templates', () => {
		expect(getBuiltIn()).toHaveLength(6);
	});

	it('all built-in templates have non-empty content', () => {
		getBuiltIn().forEach((t) => {
			expect(t.content.length).toBeGreaterThan(10);
		});
	});

	it('includes Short Story, Blog Post, Essay, Meeting Notes, Poem, Novel Chapter', () => {
		const names = getBuiltIn().map((t) => t.name);
		expect(names).toContain('Short Story');
		expect(names).toContain('Blog Post');
		expect(names).toContain('Essay');
		expect(names).toContain('Meeting Notes');
		expect(names).toContain('Poem');
		expect(names).toContain('Novel Chapter');
	});

	it('all built-in templates have builtIn=true', () => {
		getBuiltIn().forEach((t) => expect(t.builtIn).toBe(true));
	});
});

describe('saveUserTemplate', () => {
	it('saves a template and returns it', () => {
		const t = saveUserTemplate(USER, {
			name: 'My Template',
			description: 'Test',
			content: '# Hello',
			category: 'general'
		});
		expect(t).not.toBeNull();
		expect(t!.name).toBe('My Template');
		expect(t!.builtIn).toBe(false);
		expect(t!.id).toMatch(/^user:/);
	});

	it('respects max 20 limit', () => {
		for (let i = 0; i < 20; i++) {
			saveUserTemplate(USER, { name: `T${i}`, description: '', content: 'x', category: 'general' });
		}
		const result = saveUserTemplate(USER, {
			name: 'Overflow',
			description: '',
			content: 'x',
			category: 'general'
		});
		expect(result).toBeNull();
	});
});

describe('deleteUserTemplate', () => {
	it('deletes a user template', () => {
		const t = saveUserTemplate(USER, {
			name: 'Del Me',
			description: '',
			content: 'x',
			category: 'general'
		});
		expect(deleteUserTemplate(USER, t!.id)).toBe(true);
		expect(getUserTemplates(USER)).toHaveLength(0);
	});

	it('returns false for non-existent id', () => {
		expect(deleteUserTemplate(USER, 'user:nope:fake')).toBe(false);
	});

	it('does not delete built-in templates', () => {
		const builtinId = getBuiltIn()[0].id;
		expect(deleteUserTemplate(USER, builtinId)).toBe(false);
	});

	it('does not delete another user\'s template', () => {
		const t = saveUserTemplate(USER, {
			name: 'Mine',
			description: '',
			content: 'x',
			category: 'general'
		});
		expect(deleteUserTemplate(USER2, t!.id)).toBe(false);
		expect(getUserTemplates(USER)).toHaveLength(1);
	});
});

describe('getAllTemplates', () => {
	it('returns built-in + user templates combined', () => {
		saveUserTemplate(USER, { name: 'Custom', description: '', content: 'x', category: 'general' });
		const all = getAllTemplates(USER);
		expect(all.length).toBe(getBuiltIn().length + 1);
	});
});

describe('getTemplate', () => {
	it('finds built-in template by id', () => {
		const id = getBuiltIn()[0].id;
		const t = getTemplate(USER, id);
		expect(t).toBeDefined();
		expect(t!.builtIn).toBe(true);
	});

	it('finds user template by id', () => {
		const saved = saveUserTemplate(USER, {
			name: 'Find Me',
			description: '',
			content: 'y',
			category: 'general'
		});
		expect(getTemplate(USER, saved!.id)).toBeDefined();
	});

	it('returns undefined for unknown id', () => {
		expect(getTemplate(USER, 'nope')).toBeUndefined();
	});
});

describe('applyTemplate', () => {
	it('returns template content and provided title', () => {
		const t = getBuiltIn()[0];
		const result = applyTemplate(t, 'My Story');
		expect(result.title).toBe('My Story');
		expect(result.content).toBe(t.content);
	});

	it('falls back to template name when title is omitted', () => {
		const t = getBuiltIn()[0];
		const result = applyTemplate(t);
		expect(result.title).toBe(t.name);
	});
});
