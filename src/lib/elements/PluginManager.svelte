<script lang="ts">
	import { pluginStore } from '$lib/pluginStore.svelte';

	let name = $state('');
	let description = $state('');
	let shortcut = $state('');
	let script = $state('// ctx.toast("Hello from my plugin!")');
	let error = $state('');

	function add() {
		error = '';
		if (!name.trim()) { error = 'Name required'; return; }
		try { new Function('ctx', script); } catch (e) { error = 'Script syntax error: ' + (e as Error).message; return; }
		const result = pluginStore.add({ name: name.trim(), description: description.trim(), shortcut: shortcut.trim() || undefined, script });
		if (!result) { error = 'Max 10 plugins reached'; return; }
		name = ''; description = ''; shortcut = ''; script = '// ctx.toast("Hello!")';
	}
</script>

<div class="plugin-manager">
	<h3>Plugins</h3>
	<p class="hint">Plugins add custom commands to the command palette (Cmd+K).</p>

	{#if pluginStore.plugins.length > 0}
		<ul class="plugin-list">
			{#each pluginStore.plugins as p (p.id)}
				<li class="plugin-item">
					<div class="plugin-info">
						<span class="plugin-name">{p.name}</span>
						{#if p.shortcut}<kbd>{p.shortcut}</kbd>{/if}
						{#if p.description}<span class="plugin-desc">{p.description}</span>{/if}
					</div>
					<div class="plugin-actions">
						<label class="toggle">
							<input type="checkbox" checked={p.enabled} onchange={() => pluginStore.toggle(p.id)} />
							<span>{p.enabled ? 'On' : 'Off'}</span>
						</label>
						<button onclick={() => pluginStore.remove(p.id)}>Remove</button>
					</div>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="empty">No plugins yet. Add one below.</p>
	{/if}

	<details class="add-plugin">
		<summary>+ Add plugin</summary>
		<div class="form">
			<label>Name <input bind:value={name} placeholder="My Command" /></label>
			<label>Description <input bind:value={description} placeholder="What it does" /></label>
			<label>Shortcut <input bind:value={shortcut} placeholder="Ctrl+Shift+X" /></label>
			<label>Script
				<textarea bind:value={script} rows="4" spellcheck="false"></textarea>
			</label>
			{#if error}<p class="error">{error}</p>{/if}
			<button class="primary" onclick={add}>Add Plugin</button>
		</div>
	</details>
</div>

<style>
	.plugin-manager { font-size: 0.875rem; }
	h3 { margin: 0 0 0.25rem; font-size: 0.95rem; }
	.hint { color: var(--muted, #9ca3af); font-size: 0.78rem; margin: 0 0 1rem; }
	.plugin-list { list-style: none; margin: 0 0 1rem; padding: 0; }
	.plugin-item { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border, #e5e7eb); gap: 0.5rem; }
	.plugin-info { display: flex; align-items: center; gap: 0.5rem; flex: 1; }
	.plugin-name { font-weight: 600; }
	.plugin-desc { color: var(--muted, #9ca3af); font-size: 0.75rem; }
	.plugin-actions { display: flex; gap: 0.5rem; align-items: center; }
	.toggle { display: flex; align-items: center; gap: 0.25rem; cursor: pointer; font-size: 0.75rem; }
	.plugin-actions button { font-size: 0.75rem; padding: 0.2rem 0.5rem; border: 1px solid var(--border, #e5e7eb); border-radius: 4px; cursor: pointer; background: none; }
	.empty { color: var(--muted, #9ca3af); font-style: italic; margin-bottom: 1rem; }
	.add-plugin { border: 1px solid var(--border, #e5e7eb); border-radius: 8px; padding: 0.5rem 0.75rem; }
	.add-plugin summary { cursor: pointer; font-weight: 600; font-size: 0.875rem; }
	.form { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.75rem; }
	.form label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.8rem; }
	.form input, .form textarea { padding: 0.3rem 0.5rem; border: 1px solid var(--border, #e5e7eb); border-radius: 6px; font-size: 0.8rem; font-family: monospace; }
	.error { color: #dc2626; font-size: 0.75rem; margin: 0; }
	button.primary { padding: 0.4rem 0.9rem; background: var(--accent, #7c3aed); color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 0.8rem; align-self: flex-end; }
</style>
