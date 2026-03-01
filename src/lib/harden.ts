export interface HardenSnapshot {
	id: string;
	label: string;
	timestamp: string;
	message: string;
	wordCount: number;
	diffFromPrevious?: {
		wordDelta: number;
		chaptersModified: string[];
		chaptersAdded: string[];
	};
}

export interface HardenIndex {
	snapshots: HardenSnapshot[];
}

export const STUB_HARDENS: HardenSnapshot[] = [
	{
		id: 'h001',
		label: 'incipit',
		timestamp: '2024-03-15T14:32:00',
		message: 'First draft of the opening three chapters',
		wordCount: 8450
	},
	{
		id: 'h002',
		label: 'end_act_1',
		timestamp: '2024-04-02T09:15:00',
		message: "Act 1 complete — Martin's death confirmed, Jean↔Marie arc established",
		wordCount: 21300,
		diffFromPrevious: {
			wordDelta: 12850,
			chaptersModified: ['chapter_02', 'chapter_03'],
			chaptersAdded: ['chapter_04']
		}
	},
	{
		id: 'h003',
		label: 'midpoint',
		timestamp: '2024-05-10T16:00:00',
		message: 'Midpoint reversal — Marie discovers the letter',
		wordCount: 34100,
		diffFromPrevious: {
			wordDelta: 12800,
			chaptersModified: ['chapter_05', 'chapter_06'],
			chaptersAdded: ['chapter_07']
		}
	}
];

/** Generate a sequential Harden id based on current count */
export function nextHardenId(count: number): string {
	return `h${String(count + 1).padStart(3, '0')}`;
}

