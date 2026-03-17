import { STUB_HARDENS, type HardenSnapshot } from './harden.js';

export { type HardenSnapshot } from './harden.js';
export { STUB_HARDENS } from './harden.js';

interface HardenStoreContext {
	userId?: string;
	userName?: string;
}

function createHardenStore() {
	let snapshots = $state<HardenSnapshot[]>([...STUB_HARDENS]);
	let context = $state<HardenStoreContext>({});

	return {
		get snapshots() {
			return snapshots;
		},
		setContext(ctx: HardenStoreContext) {
			context = ctx;
		},
		add(snapshot: HardenSnapshot) {
			const withUser: HardenSnapshot = {
				...snapshot,
				userId: context.userId,
				userName: context.userName
			};
			snapshots = [...snapshots, withUser];
		}
	};
}

export const hardenStore = createHardenStore();

export function nextHardenId(count: number): string {
	return `h${String(count + 1).padStart(3, '0')}`;
}
