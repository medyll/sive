<script lang="ts">
	import { GOAL_TEMPLATES, getTemplatesByGrouping, formatTemplateDescription } from '$lib/goalTemplates';
	import { goalsStore } from '$lib/writingGoalsStore.svelte';
	import { toastStore } from '$lib/toastStore.svelte';

	interface Props {
		onClose?: () => void;
	}

	let { onClose }: Props = $props();

	const templates = getTemplatesByGrouping();
	let selectedTemplateId = $state<string | null>(null);

	function applyTemplate(templateId: string) {
		const template = GOAL_TEMPLATES.find((t) => t.id === templateId);
		if (!template) return;

		goalsStore.setDailyTarget(template.dailyTarget);
		selectedTemplateId = templateId;
		toastStore.success(`Applied "${template.name}" template — ${template.dailyTarget} words/day`);

		setTimeout(() => {
			if (onClose) onClose();
		}, 1000);
	}

	function close() {
		if (onClose) onClose();
	}
</script>

<div class="modal-overlay" onclick={(e) => e.target === e.currentTarget && close()}>
	<div class="modal-content" role="dialog" aria-labelledby="modal-title">
		<div class="modal-header">
			<h2 id="modal-title" class="modal-title">Goal Templates</h2>
			<button class="close-btn" onclick={close} aria-label="Close">✕</button>
		</div>

		<div class="modal-body">
			<p class="intro-text">Choose a template to quickly set your daily writing target:</p>

			<!-- Challenge Templates -->
			{#if templates.challenges.length > 0}
				<div class="template-group">
					<h3 class="group-title">🏆 Challenges</h3>
					<div class="templates-grid">
						{#each templates.challenges as template (template.id)}
							<button
								class="template-card"
								class:selected={selectedTemplateId === template.id}
								onclick={() => applyTemplate(template.id)}
							>
								<div class="template-icon">{template.icon}</div>
								<div class="template-name">{template.name}</div>
								<div class="template-target">{template.dailyTarget} words/day</div>
								<div class="template-duration">{template.duration}</div>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Daily Templates -->
			{#if templates.daily.length > 0}
				<div class="template-group">
					<h3 class="group-title">📝 Daily Goals</h3>
					<div class="templates-grid">
						{#each templates.daily as template (template.id)}
							<button
								class="template-card"
								class:selected={selectedTemplateId === template.id}
								onclick={() => applyTemplate(template.id)}
							>
								<div class="template-icon">{template.icon}</div>
								<div class="template-name">{template.name}</div>
								<div class="template-target">{template.dailyTarget} words/day</div>
								<div class="template-duration">{template.duration}</div>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Weekly Templates -->
			{#if templates.weekly.length > 0}
				<div class="template-group">
					<h3 class="group-title">📊 Weekly Goals</h3>
					<div class="templates-grid">
						{#each templates.weekly as template (template.id)}
							<button
								class="template-card"
								class:selected={selectedTemplateId === template.id}
								onclick={() => applyTemplate(template.id)}
							>
								<div class="template-icon">{template.icon}</div>
								<div class="template-name">{template.name}</div>
								<div class="template-target">{template.dailyTarget} words/day</div>
								<div class="template-duration">{template.duration}</div>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<div class="info-box">
				<p>💡 <strong>Tip:</strong> You can adjust your daily target anytime in settings. Templates are just a starting point!</p>
			</div>
		</div>

		<div class="modal-footer">
			<button class="btn-cancel" onclick={close}>Cancel</button>
			{#if selectedTemplateId}
				<p class="selection-hint">Template applied! ✓</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}

	.modal-content {
		background: var(--color-surface, #f9fafb);
		border-radius: 0.5rem;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
		max-width: 600px;
		max-height: 80vh;
		overflow-y: auto;
		width: 90%;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid var(--color-border, #e5e7eb);
	}

	.modal-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text, #1f2937);
		margin: 0;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: var(--color-muted, #6b7280);
		cursor: pointer;
		padding: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-btn:hover {
		color: var(--color-text, #1f2937);
	}

	.modal-body {
		padding: 1.5rem;
	}

	.intro-text {
		color: var(--color-muted, #6b7280);
		margin-bottom: 1.5rem;
		font-size: 0.95rem;
	}

	.template-group {
		margin-bottom: 2rem;
	}

	.group-title {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--color-text, #1f2937);
		margin-bottom: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.7;
	}

	.templates-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 0.75rem;
	}

	.template-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem;
		background: var(--color-base, #fff);
		border: 2px solid var(--color-border, #e5e7eb);
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.2s;
		text-align: center;
	}

	.template-card:hover {
		border-color: var(--color-accent, #7c3aed);
		background: color-mix(in srgb, var(--color-accent, #7c3aed) 5%, var(--color-base, #fff));
	}

	.template-card.selected {
		border-color: var(--color-accent, #7c3aed);
		background: color-mix(in srgb, var(--color-accent, #7c3aed) 10%, var(--color-base, #fff));
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent, #7c3aed) 20%, transparent);
	}

	.template-icon {
		font-size: 2rem;
	}

	.template-name {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--color-text, #1f2937);
	}

	.template-target {
		font-size: 0.75rem;
		color: var(--color-accent, #7c3aed);
		font-weight: 600;
	}

	.template-duration {
		font-size: 0.7rem;
		color: var(--color-muted, #6b7280);
	}

	.info-box {
		margin-top: 1.5rem;
		padding: 1rem;
		background: color-mix(in srgb, #3b82f6 5%, var(--color-surface, #f9fafb));
		border-left: 3px solid #3b82f6;
		border-radius: 0.25rem;
		font-size: 0.85rem;
		color: var(--color-text, #1f2937);
	}

	.info-box p {
		margin: 0;
	}

	.modal-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-top: 1px solid var(--color-border, #e5e7eb);
	}

	.btn-cancel {
		padding: 0.5rem 1rem;
		background: var(--color-border, #e5e7eb);
		border: none;
		border-radius: 0.375rem;
		color: var(--color-text, #1f2937);
		cursor: pointer;
		font-weight: 500;
		transition: background 0.2s;
	}

	.btn-cancel:hover {
		background: #d1d5db;
	}

	.selection-hint {
		color: #16a34a;
		font-weight: 600;
		margin: 0;
		font-size: 0.9rem;
	}
</style>
