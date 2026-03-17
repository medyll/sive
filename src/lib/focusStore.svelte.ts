/**
 * Focus mode enhancements — Pomodoro timer + ambient sounds
 */

export type AmbientSound = 'none' | 'rain' | 'cafe' | 'forest' | 'white-noise';

interface FocusState {
	pomodoroActive: boolean;
	pomodoroMinutes: number;   // work duration
	breakMinutes: number;
	secondsLeft: number;
	isBreak: boolean;
	cycles: number;
	ambient: AmbientSound;
}

const STORAGE_KEY = 'sive:focus';

function loadPrefs(): Partial<FocusState> {
	if (typeof localStorage === 'undefined') return {};
	try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); } catch { return {}; }
}

function createFocusStore() {
	const prefs = loadPrefs();
	let state = $state<FocusState>({
		pomodoroActive: false,
		pomodoroMinutes: prefs.pomodoroMinutes ?? 25,
		breakMinutes: prefs.breakMinutes ?? 5,
		secondsLeft: (prefs.pomodoroMinutes ?? 25) * 60,
		isBreak: false,
		cycles: 0,
		ambient: prefs.ambient ?? 'none'
	});

	let ticker: ReturnType<typeof setInterval> | null = null;

	function startPomodoro() {
		if (ticker) clearInterval(ticker);
		state = { ...state, pomodoroActive: true, isBreak: false, secondsLeft: state.pomodoroMinutes * 60 };
		ticker = setInterval(() => {
			if (state.secondsLeft <= 1) {
				// Switch phase
				const isBreak = !state.isBreak;
				const cycles = isBreak ? state.cycles : state.cycles + 1;
				state = {
					...state,
					isBreak,
					cycles,
					secondsLeft: isBreak ? state.breakMinutes * 60 : state.pomodoroMinutes * 60
				};
				if (typeof window !== 'undefined') {
					window.dispatchEvent(new CustomEvent('pomodoro:phase', { detail: { isBreak, cycles } }));
				}
			} else {
				state = { ...state, secondsLeft: state.secondsLeft - 1 };
			}
		}, 1000);
	}

	function stopPomodoro() {
		if (ticker) { clearInterval(ticker); ticker = null; }
		state = { ...state, pomodoroActive: false, secondsLeft: state.pomodoroMinutes * 60 };
	}

	function setDurations(work: number, brk: number) {
		state = { ...state, pomodoroMinutes: work, breakMinutes: brk, secondsLeft: work * 60 };
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ pomodoroMinutes: work, breakMinutes: brk, ambient: state.ambient }));
		}
	}

	function setAmbient(sound: AmbientSound) {
		state = { ...state, ambient: sound };
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ pomodoroMinutes: state.pomodoroMinutes, breakMinutes: state.breakMinutes, ambient: sound }));
		}
	}

	const formattedTime = $derived(() => {
		const m = Math.floor(state.secondsLeft / 60).toString().padStart(2, '0');
		const s = (state.secondsLeft % 60).toString().padStart(2, '0');
		return `${m}:${s}`;
	});

	return {
		get state() { return state; },
		get formattedTime() { return formattedTime(); },
		startPomodoro,
		stopPomodoro,
		setDurations,
		setAmbient
	};
}

export const focusStore = createFocusStore();

export const AMBIENT_LABELS: Record<AmbientSound, string> = {
	none: 'No sound',
	rain: '🌧 Rain',
	cafe: '☕ Café',
	forest: '🌲 Forest',
	'white-noise': '〰 White noise'
};
