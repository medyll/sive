import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
	apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * POST /api/ai/outline — Generate document outline from AI
 * 
 * Request body:
 * - content: string — Current document content (optional)
 * - topic: string — Document topic/theme (optional)
 * - style: string — Outline style (narrative, academic, screenplay)
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await request.json().catch(() => ({}));
	const { content = '', topic = '', style = 'narrative' } = body;

	if (!content && !topic) {
		return json({ error: 'Content or topic required' }, { status: 400 });
	}

	try {
		const systemPrompt = `You are a writing assistant that creates document outlines.
Return ONLY a JSON array of sections. Each section has:
- "title": section title
- "level": 1 for main sections, 2 for subsections
- "content": optional brief description

Style: ${style}
Format example:
[
  {"title": "Introduction", "level": 1, "content": "Hook the reader"},
  {"title": "Background", "level": 2, "content": "Context and history"},
  {"title": "Main Argument", "level": 1}
]`;

		const userPrompt = content
			? `Based on this document content, create an outline:\n\n${content.slice(0, 2000)}`
			: `Create an outline for a document about: ${topic}`;

		const response = await anthropic.messages.create({
			model: 'claude-sonnet-4-20250514',
			max_tokens: 1000,
			system: systemPrompt,
			messages: [
				{ role: 'user', content: userPrompt }
			]
		});

		const completion = response.content[0].type === 'text' 
			? response.content[0].text 
			: '[]';

		// Parse JSON from response
		let sections;
		try {
			// Extract JSON from response (may have markdown code blocks)
			const jsonMatch = completion.match(/\[[\s\S]*\]/);
			const jsonString = jsonMatch ? jsonMatch[0] : completion;
			sections = JSON.parse(jsonString);
		} catch (parseError) {
			console.error('Failed to parse outline JSON:', parseError);
			// Fallback: create simple outline from text
			sections = [
				{ title: 'Introduction', level: 1, content: 'Opening section' },
				{ title: 'Main Content', level: 1, content: 'Core material' },
				{ title: 'Conclusion', level: 1, content: 'Closing thoughts' }
			];
		}

		return json({ sections });
	} catch (error) {
		console.error('AI outline error:', error);
		return json({ error: 'Outline generation failed' }, { status: 500 });
	}
};
