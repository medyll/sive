export type DiffType = 'equal' | 'insert' | 'delete';
export interface DiffChunk { type: DiffType; text: string; }

/** Line-level LCS diff */
export function computeDiff(a: string, b: string): DiffChunk[] {
	const aLines = a.split('\n');
	const bLines = b.split('\n');
	const m = aLines.length, n = bLines.length;

	// LCS table
	const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
	for (let i = 1; i <= m; i++)
		for (let j = 1; j <= n; j++)
			dp[i][j] = aLines[i-1] === bLines[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);

	const chunks: DiffChunk[] = [];
	let i = m, j = n;
	const ops: { type: DiffType; line: string }[] = [];

	while (i > 0 || j > 0) {
		if (i > 0 && j > 0 && aLines[i-1] === bLines[j-1]) {
			ops.push({ type: 'equal', line: aLines[--i] }); j--;
		} else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
			ops.push({ type: 'insert', line: bLines[--j] });
		} else {
			ops.push({ type: 'delete', line: aLines[--i] });
		}
	}

	ops.reverse();

	// Merge consecutive same-type chunks
	for (const op of ops) {
		const last = chunks[chunks.length - 1];
		if (last && last.type === op.type) {
			last.text += '\n' + op.line;
		} else {
			chunks.push({ type: op.type, text: op.line });
		}
	}

	return chunks;
}

export function renderDiffHtml(chunks: DiffChunk[]): string {
	return chunks.map((c) => {
		const escaped = c.text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
		if (c.type === 'insert') return `<ins>${escaped}</ins>`;
		if (c.type === 'delete') return `<del>${escaped}</del>`;
		return `<span>${escaped}</span>`;
	}).join('\n');
}
