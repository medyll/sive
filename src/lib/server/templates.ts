/**
 * Document template store — built-in + user-defined templates
 */

export type TemplateCategory = 'fiction' | 'nonfiction' | 'business' | 'poetry' | 'general';

export interface Template {
	id: string;
	name: string;
	description: string;
	content: string;
	category: TemplateCategory;
	builtIn: boolean;
}

export type NewTemplate = Omit<Template, 'id' | 'builtIn'>;

const MAX_USER_TEMPLATES = 20;

// ── Built-in templates ────────────────────────────────────────────────────

const BUILT_IN: Template[] = [
	{
		id: 'builtin:short-story',
		name: 'Short Story',
		description: 'Classic three-act structure with protagonist, conflict, and resolution.',
		category: 'fiction',
		builtIn: true,
		content: `# [Story Title]

## Act I — The Setup

Introduce your protagonist in their ordinary world. Establish what they want and what stands in their way.

[Your opening scene here…]

## Act II — The Confrontation

The conflict escalates. Your protagonist faces obstacles, makes choices, and is changed by the journey.

[Rising action and turning point…]

## Act III — The Resolution

The climax arrives. Conflicts resolve — or don't. Show how your protagonist has changed.

[Your ending here…]`
	},
	{
		id: 'builtin:novel-chapter',
		name: 'Novel Chapter',
		description: 'Scene-by-scene chapter outline with hooks and transitions.',
		category: 'fiction',
		builtIn: true,
		content: `# Chapter [N]: [Chapter Title]

**POV Character:**
**Setting:**
**Time:**

---

## Scene 1

[Opening hook — drop the reader into action or tension]

## Scene 2

[Rising stakes or new information]

## Scene 3

[Chapter climax or cliffhanger]

---

*Chapter end note (optional — internal continuity, threads to follow up):*`
	},
	{
		id: 'builtin:blog-post',
		name: 'Blog Post',
		description: 'SEO-friendly structure with intro, body sections, and CTA.',
		category: 'nonfiction',
		builtIn: true,
		content: `# [Post Title]

*[One-sentence summary for the reader and search engines]*

---

## Introduction

Hook the reader with a question, surprising fact, or relatable problem. State what they'll gain from reading.

## [Section 1 Heading]

Your first main point. Use concrete examples and evidence.

## [Section 2 Heading]

Your second main point. Keep paragraphs short — 3-4 sentences max.

## [Section 3 Heading]

Your third main point. Include a quote, data point, or story.

## Conclusion

Summarise the key takeaways. End with a call to action or thought-provoking question.

---

*Tags: [tag1, tag2, tag3]*`
	},
	{
		id: 'builtin:essay',
		name: 'Essay',
		description: 'Five-paragraph essay with thesis, arguments, and conclusion.',
		category: 'nonfiction',
		builtIn: true,
		content: `# [Essay Title]

## Introduction

Provide context for your topic. End with a clear thesis statement:

> **Thesis:** [Your central argument in one sentence.]

## Body Paragraph 1 — [First Argument]

Topic sentence. Supporting evidence. Analysis. Transition.

## Body Paragraph 2 — [Second Argument]

Topic sentence. Supporting evidence. Analysis. Transition.

## Body Paragraph 3 — [Third Argument / Counter-argument]

Topic sentence. Acknowledge the opposing view, then refute it with evidence.

## Conclusion

Restate your thesis in new words. Summarise your arguments. End with a broader implication or call to action.`
	},
	{
		id: 'builtin:meeting-notes',
		name: 'Meeting Notes',
		description: 'Structured notes with attendees, agenda, decisions, and action items.',
		category: 'business',
		builtIn: true,
		content: `# Meeting Notes — [Date]

**Meeting:** [Meeting Name / Project]
**Date:** [Date & Time]
**Attendees:** [Names]
**Facilitator:** [Name]

---

## Agenda

1. [Item 1]
2. [Item 2]
3. [Item 3]

## Discussion

### [Agenda Item 1]
-
-

### [Agenda Item 2]
-
-

## Decisions Made

- [ ] [Decision 1]
- [ ] [Decision 2]

## Action Items

| Action | Owner | Due |
|--------|-------|-----|
| [Task] | [Name] | [Date] |

## Next Meeting

**Date:** [Date]
**Agenda preview:** [Items to discuss]`
	},
	{
		id: 'builtin:poem',
		name: 'Poem',
		description: 'Free-verse poem scaffold with stanza breaks and line guidance.',
		category: 'poetry',
		builtIn: true,
		content: `# [Poem Title]

*[Epigraph or dedication — optional]*

---

[First stanza — establish image, mood, or voice]
[Second line]
[Third line]

[Second stanza — develop or complicate the opening]
[Second line]
[Third line]

[Third stanza — turn, surprise, or deepening]
[Second line]
[Third line]

[Final stanza — resolution or open ending]
[Second line]
[Third line]

---

*[Notes on form, inspiration, or revision — optional]*`
	}
];

// ── User template store ───────────────────────────────────────────────────

const userStore = new Map<string, Template[]>();

function getUserList(userId: string): Template[] {
	if (!userStore.has(userId)) userStore.set(userId, []);
	return userStore.get(userId)!;
}

export function getBuiltIn(): Template[] {
	return BUILT_IN;
}

export function getUserTemplates(userId: string): Template[] {
	return [...getUserList(userId)];
}

export function getAllTemplates(userId: string): Template[] {
	return [...BUILT_IN, ...getUserList(userId)];
}

export function saveUserTemplate(userId: string, input: NewTemplate): Template | null {
	const list = getUserList(userId);
	if (list.length >= MAX_USER_TEMPLATES) return null;

	const template: Template = {
		...input,
		id: `user:${userId}:${crypto.randomUUID()}`,
		builtIn: false
	};
	list.push(template);
	return template;
}

export function deleteUserTemplate(userId: string, id: string): boolean {
	const list = getUserList(userId);
	const idx = list.findIndex((t) => t.id === id && !t.builtIn);
	if (idx === -1) return false;
	list.splice(idx, 1);
	return true;
}

export function getTemplate(userId: string, id: string): Template | undefined {
	return getAllTemplates(userId).find((t) => t.id === id);
}

export function applyTemplate(
	template: Template,
	title?: string
): { title: string; content: string } {
	return {
		title: title || template.name,
		content: template.content
	};
}
