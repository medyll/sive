import { STUB_HARDENS, type HardenSnapshot } from './harden.js';

export { type HardenSnapshot } from './harden.js';
export { STUB_HARDENS } from './harden.js';

function createHardenStore() {
	let snapshots = $state<HardenSnapshot[]>([...STUB_HARDENS]);
	return {
		get snapshots() {
			return snapshots;
		},
		add(snapshot: HardenSnapshot) {
			snapshots = [...snapshots, snapshot];
		}
	};
}

export const hardenStore = createHardenStore();

export function nextHardenId(count: number): string {
	return `h${String(count + 1).padStart(3, '0')}`;
}
