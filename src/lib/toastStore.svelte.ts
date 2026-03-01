// Singleton toast store — add/dismiss transient notifications

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
	id: number;
	message: string;
	type: ToastType;
}

let _id = 0;

function createToastStore() {
	let items = $state<ToastItem[]>([]);

	function add(message: string, type: ToastType = 'info', duration = 3500) {
		const id = ++_id;
		items = [...items, { id, message, type }];
		setTimeout(() => dismiss(id), duration);
	}

	function dismiss(id: number) {
		items = items.filter((t) => t.id !== id);
	}

	function success(message: string) { add(message, 'success'); }
	function error(message: string) { add(message, 'error', 5000); }
	function info(message: string) { add(message, 'info'); }

	return {
		get items() { return items; },
		add,
		dismiss,
		success,
		error,
		info
	};
}

export const toastStore = createToastStore();
