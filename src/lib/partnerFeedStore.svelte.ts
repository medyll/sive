/**
 * partnerFeedStore — aggregates partner activity into a grouped, readable feed
 *
 * Reads from activityStore, filters to events from followed partners,
 * groups by day, and tracks unread count.
 * 
 * Emits partner_activity notifications when new events arrive.
 */

import { activityStore, type ActivityEvent } from './activityStore.svelte';
import { partnersStore } from './partnersStore.svelte';
import { notificationStore } from './notificationStore.svelte';

const UNREAD_KEY = 'sive:feed-last-read';
const LAST_EVENT_COUNT_KEY = 'sive:feed-lastEventCount';

export interface FeedGroup {
	label: string; // "Today", "Yesterday", "This week", date string
	events: ActivityEvent[];
}

function dayLabel(timestamp: number): string {
	const now = new Date();
	const d = new Date(timestamp);

	const todayStr = now.toDateString();
	const dStr = d.toDateString();

	if (dStr === todayStr) return 'Today';

	const yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);
	if (dStr === yesterday.toDateString()) return 'Yesterday';

	const weekAgo = new Date(now);
	weekAgo.setDate(now.getDate() - 6);
	if (d >= weekAgo) return 'This Week';

	return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function typeLabel(event: ActivityEvent): string {
	switch (event.type) {
		case 'badge_earned':
			return `🏆 ${event.displayName} earned the "${event.payload.badgeName}" badge`;
		case 'streak_milestone':
			return `🔥 ${event.displayName} hit a ${event.payload.days}-day streak!`;
		case 'leaderboard_entry':
			return `📊 ${event.displayName} reached #${event.payload.rank} on the leaderboard`;
		case 'goal_completed':
			return `✅ ${event.displayName} completed their daily goal (${(event.payload.words as number).toLocaleString()} words)`;
		default:
			return `${event.displayName} had some activity`;
	}
}

function createPartnerFeedStore() {
	function getLastRead(): number {
		if (typeof localStorage === 'undefined') return 0;
		return Number(localStorage.getItem(UNREAD_KEY) ?? 0);
	}

	function markRead(): void {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(UNREAD_KEY, String(Date.now()));
		}
	}

	/** Get all events from followed partners, newest first */
	function getPartnerEvents(): ActivityEvent[] {
		const following = new Set(partnersStore.getFollowing());
		if (following.size === 0) return [];
		return activityStore.state.events.filter((e) => following.has(e.userId));
	}

	/** Group partner events by day label */
	function getGroupedFeed(limit = 50): FeedGroup[] {
		const events = getPartnerEvents().slice(0, limit);
		const groups = new Map<string, ActivityEvent[]>();

		for (const event of events) {
			const label = dayLabel(event.timestamp);
			if (!groups.has(label)) groups.set(label, []);
			groups.get(label)!.push(event);
		}

		// S70-05: Emit partner activity notification if new events since last check
		if (typeof localStorage !== 'undefined') {
			const lastCount = Number(localStorage.getItem(LAST_EVENT_COUNT_KEY) ?? 0);
			const currentCount = events.length;
			if (currentCount > lastCount && currentCount > 0) {
				const newCount = currentCount - lastCount;
				queueMicrotask(() => {
					notificationStore.notify(
						'partner_activity',
						`${newCount} new activit${newCount === 1 ? 'y' : 'ies'} from your writing partners`,
						{ count: newCount }
					);
				});
			}
			localStorage.setItem(LAST_EVENT_COUNT_KEY, String(currentCount));
		}

		return [...groups.entries()].map(([label, evs]) => ({ label, events: evs }));
	}

	/** Count partner events since last read */
	function getUnreadCount(): number {
		const lastRead = getLastRead();
		return getPartnerEvents().filter((e) => e.timestamp > lastRead).length;
	}

	return { getPartnerEvents, getGroupedFeed, getUnreadCount, markRead, typeLabel };
}

export const partnerFeedStore = createPartnerFeedStore();
