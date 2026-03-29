/**
 * Skill: Coherence Check
 * 
 * Detects inconsistencies between a chapter and the bible, structure, and narrator.
 * Pushes alerts to the Coherence tab via Command Bus.
 */

import type { SkillDefinition } from './skillEngine.svelte';

export const skillCoherence: SkillDefinition = {
	id: 'skill_coherence',
	description: 'Detects inconsistencies and pushes them to the UI',
	trigger: ['chapter_modified', 'explicit_request'],
	steps: [
		{
			command: 'ui.set_spinner',
			params: { visible: true },
			on_error: 'ignore'
		},
		{
			tool: 'read_bible',
			params: { projectId: '{{input.projectId}}' }
		},
		{
			tool: 'read_timeline',
			params: { projectId: '{{input.projectId}}' }
		},
		{
			tool: 'read_structure',
			params: { projectId: '{{input.projectId}}' }
		},
		{
			tool: 'read_narrator',
			params: { projectId: '{{input.projectId}}' }
		},
		{
			tool: 'read_chapter',
			params: { projectId: '{{input.projectId}}', chapterId: '{{input.chapterId}}' }
		},
		{
			tool: 'extract_chapter_states',
			params: { projectId: '{{input.projectId}}', chapterId: '{{input.chapterId}}' }
		},
		{
			prompt: `Compare chapter states against the bible, timeline, structure and narrator.

Check:
- Character/object/location status consistency
- Timeline compliance (flash-backs correctly anchored, coherent ellipses)
- POV compliance as declared in narrator.yaml
- Active narrative threads correctly referenced in structure.yaml
- Tension level consistent with the target curve

Flag each discrepancy with a confidence level (Low / Medium / High).
Never block — suggest only.

Return a JSON array (no markdown, no explanation):
[{"entity":"...","discrepancy_type":"...","confidence":"Low"|"Medium"|"High","note":"..."}]`,
			on_error: 'abort'
		},
		{
			command: 'coherence.clear',
			on_error: 'ignore'
		},
		{
			command: 'coherence.push_alerts',
			params: { alerts: '{{prompt_result}}' },
			on_error: 'notify'
		},
		{
			command: 'ui.open_tab',
			params: { tab: 'coherence' },
			on_error: 'ignore'
		},
		{
			command: 'ui.set_spinner',
			params: { visible: false },
			on_error: 'ignore'
		}
	]
};

/**
 * Skill: Version Description Generator
 */
export const skillVersionDescription: SkillDefinition = {
	id: 'skill_version_description',
	description: 'Auto-generates a Harden commit message',
	trigger: 'harden_button',
	steps: [
		{
			command: 'ui.set_spinner',
			params: { visible: true },
			on_error: 'ignore'
		},
		{
			tool: 'read_version_index',
			params: { projectId: '{{input.projectId}}' }
		},
		{
			tool: 'compare_versions',
			params: { 
				projectId: '{{input.projectId}}', 
				versionA: '{{last_version}}', 
				versionB: 'current' 
			}
		},
		{
			prompt: `Based on the diff, generate a concise version message (1-2 sentences).
Mention modified chapters, affected characters, key events.

Example: "Rewrote chapter 3, added Martin's death, updated Jean↔Marie relationship."

Return the message only, no formatting.`,
			on_error: 'abort'
		},
		{
			command: 'ui.show_modal',
			params: {
				title: 'New version',
				content: '{{prompt_result}}',
				actions: ['confirm', 'edit', 'cancel']
			},
			on_error: 'notify'
		},
		{
			command: 'harden.trigger',
			params: { 
				label: '{{input.label}}', 
				message: '{{modal_result}}' 
			},
			on_error: 'notify'
		},
		{
			command: 'timeline.refresh',
			on_error: 'ignore'
		},
		{
			command: 'ui.set_spinner',
			params: { visible: false },
			on_error: 'ignore'
		}
	]
};

/**
 * Skill: Review Mode Audit
 */
export const skillReview: SkillDefinition = {
	id: 'skill_review',
	description: 'Produces a complete audit report on a given scope',
	trigger: 'review_mode',
	steps: [
		{
			command: 'ui.set_spinner',
			params: { visible: true },
			on_error: 'ignore'
		},
		{
			tool: 'read_bible',
			params: { projectId: '{{input.projectId}}' }
		},
		{
			tool: 'read_timeline',
			params: { projectId: '{{input.projectId}}' }
		},
		{
			tool: 'read_structure',
			params: { projectId: '{{input.projectId}}' }
		},
		{
			tool: 'read_themes',
			params: { projectId: '{{input.projectId}}' }
		},
		{
			tool: 'read_narrator',
			params: { projectId: '{{input.projectId}}' }
		},
		{
			tool: 'read_chapter',
			params: { projectId: '{{input.projectId}}', chapterId: '{{input.chapterId}}' }
		},
		{
			prompt: `Analyse the narrative text and produce a structured JSON report:

1. Inconsistencies (characters, objects, timeline, flash-backs)
2. POV and focalization compliance
3. Unresolved open narrative threads
4. Tension curve consistency vs structure.yaml target
5. Theme and motif presence and consistency (themes.yaml)
6. Character voices — compliance with declared register and tics
7. Language tics and lexical repetitions
8. Narrative density (ellipsis vs detailed scene)

No text modifications. Report only.

Return JSON:
{
  "inconsistencies": [{"section": "...", "items": ["..."]}],
  "pov": {"compliance": "...", "notes": ["..."]},
  "narrative_threads": {"open": ["..."], "unresolved": ["..."]},
  "tension": {"curve": "...", "consistency": "..."},
  "themes": {"present": ["..."], "missing": ["..."]},
  "voices": [{"name": "...", "notes": ["..."]}],
  "style": {"tics": ["..."], "repetitions": ["..."]}
}`,
			on_error: 'abort'
		},
		{
			command: 'app.navigate_to',
			params: { screen: 'review' },
			on_error: 'ignore'
		},
		{
			command: 'review.push_report',
			params: { report: '{{prompt_result}}' },
			on_error: 'notify'
		},
		{
			command: 'ui.set_spinner',
			params: { visible: false },
			on_error: 'ignore'
		}
	]
};

/**
 * Skill: Style Analysis
 */
export const skillStyle: SkillDefinition = {
	id: 'skill_style',
	description: 'Stylistic analysis of a selected passage',
	trigger: ['analyse_passage_button', 'text_selection'],
	steps: [
		{
			command: 'ui.set_spinner',
			params: { visible: true },
			on_error: 'ignore'
		},
		{
			tool: 'read_narrator',
			params: { projectId: '{{input.projectId}}' }
		},
		{
			tool: 'editor.get_selection',
			params: {}
		},
		{
			prompt: `Analyse the selected passage according to the ingested style profile.

Check:
- Language tics (repeated words, filler phrases)
- Sentence rhythm (too many short/long sentences)
- Narrative density (show vs tell balance)
- Character voice consistency

Format: JSON list of signals with location and improvement suggestion.
[{"location":"Para. N","signal":"...","suggestion":"..."}]`,
			on_error: 'abort'
		},
		{
			command: 'style.clear',
			on_error: 'ignore'
		},
		{
			command: 'style.push_signals',
			params: { signals: '{{prompt_result}}' },
			on_error: 'notify'
		},
		{
			command: 'ui.open_tab',
			params: { tab: 'style' },
			on_error: 'ignore'
		},
		{
			command: 'ui.set_spinner',
			params: { visible: false },
			on_error: 'ignore'
		}
	]
};

/**
 * Export all built-in skills
 */
export const builtInSkills: SkillDefinition[] = [
	skillCoherence,
	skillVersionDescription,
	skillReview,
	skillStyle
];
