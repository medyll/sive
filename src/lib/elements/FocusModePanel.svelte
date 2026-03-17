<script lang="ts">
	import { focusStore, AMBIENT_LABELS, type AmbientSound } from '$lib/focusStore.svelte';

	let workDraft = $state(String(focusStore.state.pomodoroMinutes));
	let breakDraft = $state(String(focusStore.state.breakMinutes));

	const SOUNDS = Object.keys(AMBIENT_LABELS) as AmbientSound[];

	function applyDurations() {
		const w = parseInt(workDraft, 10), b = parseInt(breakDraft, 10);
		if (w > 0 && b > 0) focusStore.setDurations(w, b);
	}
</script>

<div class="focus-panel">
	<section class="pomodoro">
		<h4>Pomodoro Timer</h4>
		<div class="timer-display" class:break={focusStore.state.isBreak}>
			<span class="time">{focusStore.formattedTime}</span>
			<span class="phase">{focusStore.state.pomodoroActive ? (focusStore.state.isBreak ? 'Break' : 'Focus') : 'Ready'}</span>
		</div>
		{#if focusStore.state.cycles > 0}
			<div class="cycles">🍅 × {focusStore.state.cycles}</div>
		{/if}
		<div class="timer-controls">
			{#if focusStore.state.pomodoroActive}
				<button onclick={focusStore.stopPomodoro}>⏹ Stop</button>
			{:else}
				<button class="primary" onclick={focusStore.startPomodoro}>▶ Start</button>
			{/if}
		</div>
		<div class="duration-row">
			<label>Work <input type="number" bind:value={workDraft} min="1" max="120" onchange={applyDurations} />m</label>
			<label>Break <input type="number" bind:value={breakDraft} min="1" max="60" onchange={applyDurations} />m</label>
		</div>
	</section>

	<section class="ambient">
		<h4>Ambient Sound</h4>
		<div class="sound-grid">
			{#each SOUNDS as s}
				<button
					class="sound-btn"
					class:active={focusStore.state.ambient === s}
					onclick={() => focusStore.setAmbient(s)}
				>
					{AMBIENT_LABELS[s]}
				</button>
			{/each}
		</div>
		{#if focusStore.state.ambient !== 'none'}
			<p class="ambient-note">🔊 {AMBIENT_LABELS[focusStore.state.ambient]} playing (simulated)</p>
		{/if}
	</section>
</div>

<style>
	.focus-panel { font-size: 0.875rem; display: flex; flex-direction: column; gap: 1.5rem; }
	h4 { margin: 0 0 0.75rem; font-size: 0.875rem; font-weight: 600; color: var(--muted, #6b7280); text-transform: uppercase; letter-spacing: 0.05em; }
	.timer-display { text-align: center; padding: 1rem; background: var(--surface-alt, #f9fafb); border-radius: 12px; margin-bottom: 0.75rem; }
	.timer-display.break { background: #ecfdf5; }
	.time { display: block; font-size: 2.5rem; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: 0.05em; }
	.phase { font-size: 0.75rem; color: var(--muted, #9ca3af); text-transform: uppercase; letter-spacing: 0.1em; }
	.cycles { text-align: center; font-size: 0.8rem; color: var(--muted, #9ca3af); margin-bottom: 0.5rem; }
	.timer-controls { display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 0.75rem; }
	.timer-controls button { padding: 0.4rem 1rem; border: 1px solid var(--border, #e5e7eb); border-radius: 6px; cursor: pointer; background: none; font-size: 0.875rem; }
	.timer-controls button.primary { background: var(--accent, #7c3aed); color: #fff; border-color: transparent; }
	.duration-row { display: flex; gap: 1rem; justify-content: center; }
	.duration-row label { display: flex; align-items: center; gap: 0.3rem; font-size: 0.78rem; color: var(--muted, #6b7280); }
	.duration-row input { width: 44px; padding: 0.2rem 0.3rem; border: 1px solid var(--border, #e5e7eb); border-radius: 4px; font-size: 0.78rem; text-align: center; }
	.sound-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.4rem; }
	.sound-btn { padding: 0.4rem; border: 1px solid var(--border, #e5e7eb); border-radius: 6px; cursor: pointer; background: none; font-size: 0.78rem; text-align: center; }
	.sound-btn.active { background: var(--accent-light, #ede9fe); border-color: var(--accent, #7c3aed); color: var(--accent, #7c3aed); font-weight: 600; }
	.ambient-note { font-size: 0.75rem; color: var(--muted, #9ca3af); margin: 0.5rem 0 0; text-align: center; }
</style>
