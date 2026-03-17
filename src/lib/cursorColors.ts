const PALETTE = [
	'#6366f1', // indigo
	'#f43f5e', // rose
	'#10b981', // emerald
	'#f59e0b', // amber
	'#0ea5e9', // sky
	'#8b5cf6', // violet
	'#ec4899', // pink
	'#14b8a6'  // teal
];

function hashUserId(userId: string): number {
	let h = 0;
	for (let i = 0; i < userId.length; i++) {
		h = (Math.imul(31, h) + userId.charCodeAt(i)) | 0;
	}
	return Math.abs(h);
}

export function getCursorColor(userId: string): string {
	return PALETTE[hashUserId(userId) % PALETTE.length];
}

export { PALETTE };
