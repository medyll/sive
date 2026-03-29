<script lang="ts">
	export interface Version {
		id: string;
		label: string;
		message: string;
		created_at: string;
		author: string;
		authorColor?: string;
		collaborators?: string[];
		isMerge?: boolean;
	}
	
	export let versions: Version[] = $state([]);
	export let selectedVersion: Version | null = $state(null);
	export let showCollaborators = $state(true);
	
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);
		
		if (diffMins < 1) return 'just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString();
	}
	
	function getVersionIcon(version: Version): string {
		if (version.isMerge) return '🔀';
		return '📝';
	}
</script>

<div class="collaborative-versioning p-4 space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-semibold">Version History</h3>
		<label class="flex items-center gap-2 text-sm">
			<input type="checkbox" bind:checked={showCollaborators} />
			Show collaborators
		</label>
	</div>
	
	{#if versions.length === 0}
		<div class="text-sm text-muted italic">No versions yet</div>
	{:else}
		<div class="space-y-2">
			{#each versions as version (version.id)}
				<div 
					class="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors
						{selectedVersion?.id === version.id ? 'border-primary bg-primary/5' : ''}"
					onclick={() => selectedVersion = version}
				>
					<div class="flex items-start gap-3">
						<span class="text-xl">{getVersionIcon(version)}</span>
						<div class="flex-1 min-w-0">
							<div class="font-medium truncate">{version.label}</div>
							<div class="text-sm text-muted truncate">{version.message}</div>
							<div class="flex items-center gap-2 mt-1 text-xs text-muted">
								<span>{version.author}</span>
								<span>·</span>
								<span>{formatDate(version.created_at)}</span>
								{#if version.collaborators && version.collaborators.length > 1 && showCollaborators}
									<span>·</span>
									<span class="flex items-center gap-1">
										<span class="w-2 h-2 rounded-full bg-blue-500"></span>
										{version.collaborators.length} collaborators
									</span>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
	
	{#if selectedVersion}
		<div class="border-t pt-4 mt-4">
			<h4 class="font-semibold mb-2">Version Details</h4>
			<div class="space-y-2 text-sm">
				<div><strong>ID:</strong> {selectedVersion.id}</div>
				<div><strong>Author:</strong> {selectedVersion.author}</div>
				<div><strong>Created:</strong> {formatDate(selectedVersion.created_at)}</div>
				<div><strong>Message:</strong> {selectedVersion.message}</div>
				{#if selectedVersion.collaborators?.length}
					<div>
						<strong>Collaborators:</strong>
						<div class="flex gap-1 mt-1">
							{#each selectedVersion.collaborators as collaborator}
								<span class="px-2 py-0.5 bg-muted rounded text-xs">{collaborator}</span>
							{/each}
						</div>
					</div>
				{/if}
			</div>
			<div class="flex gap-2 mt-4">
				<button class="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90">
					Preview
				</button>
				<button class="px-3 py-1.5 text-xs bg-muted rounded hover:bg-muted/80">
					Compare
				</button>
				<button class="px-3 py-1.5 text-xs bg-muted rounded hover:bg-muted/80">
					Restore
				</button>
			</div>
		</div>
	{/if}
</div>
