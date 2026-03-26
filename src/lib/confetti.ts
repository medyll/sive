/**
 * confetti — Lightweight confetti animation utility
 * Creates a burst of animated confetti particles when called
 */

interface ConfettiParticle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	rotation: number;
	rotationSpeed: number;
	life: number;
	emoji: string;
	size: number;
}

const CONFETTI_EMOJIS = ['🎉', '✨', '⭐', '🌟', '💫', '🏆', '👏', '🎊'];

export function createConfetti(options: {
	x?: number;
	y?: number;
	count?: number;
	duration?: number;
	autoRemove?: boolean;
} = {}) {
	const {
		x = window.innerWidth / 2,
		y = window.innerHeight / 2,
		count = 40,
		duration = 2000,
		autoRemove = true
	} = options;

	// Check if animations are reduced
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (prefersReducedMotion) {
		// Still show emoji but no animation
		showStaticConfetti(x, y, count);
		return;
	}

	const canvas = document.createElement('canvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	canvas.style.position = 'fixed';
	canvas.style.top = '0';
	canvas.style.left = '0';
	canvas.style.pointerEvents = 'none';
	canvas.style.zIndex = '9999';
	canvas.style.width = '100vw';
	canvas.style.height = '100vh';

	document.body.appendChild(canvas);

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		canvas.remove();
		return;
	}

	const particles: ConfettiParticle[] = [];

	// Generate particles
	for (let i = 0; i < count; i++) {
		const angle = (Math.random() * Math.PI * 2);
		const velocity = 5 + Math.random() * 10;

		particles.push({
			x,
			y,
			vx: Math.cos(angle) * velocity,
			vy: Math.sin(angle) * velocity - 5, // Upward bias
			rotation: Math.random() * Math.PI * 2,
			rotationSpeed: (Math.random() - 0.5) * 0.1,
			life: 1,
			emoji: CONFETTI_EMOJIS[Math.floor(Math.random() * CONFETTI_EMOJIS.length)],
			size: 20 + Math.random() * 10
		});
	}

	const startTime = Date.now();
	const gravity = 0.2;

	function animate() {
		const elapsed = Date.now() - startTime;
		const progress = Math.min(elapsed / duration, 1);

		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Update and draw particles
		for (const particle of particles) {
			particle.life = Math.max(0, 1 - progress);

			if (particle.life <= 0) continue;

			// Physics
			particle.vy += gravity;
			particle.x += particle.vx;
			particle.y += particle.vy;
			particle.rotation += particle.rotationSpeed;

			// Fade out
			ctx.globalAlpha = particle.life;

			// Draw emoji
			ctx.save();
			ctx.translate(particle.x, particle.y);
			ctx.rotate(particle.rotation);
			ctx.font = `${particle.size}px Arial`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(particle.emoji, 0, 0);
			ctx.restore();
		}

		ctx.globalAlpha = 1;

		if (progress < 1) {
			requestAnimationFrame(animate);
		} else {
			if (autoRemove) {
				canvas.remove();
			}
		}
	}

	animate();

	return canvas;
}

/**
 * Show static confetti without animation (for prefers-reduced-motion)
 */
function showStaticConfetti(x: number, y: number, count: number) {
	const container = document.createElement('div');
	container.style.position = 'fixed';
	container.style.top = '0';
	container.style.left = '0';
	container.style.width = '100vw';
	container.style.height = '100vh';
	container.style.pointerEvents = 'none';
	container.style.zIndex = '9999';

	for (let i = 0; i < Math.min(count, 10); i++) {
		const emoji = document.createElement('span');
		emoji.textContent = CONFETTI_EMOJIS[Math.floor(Math.random() * CONFETTI_EMOJIS.length)];
		emoji.style.position = 'absolute';
		emoji.style.left = x + (Math.random() - 0.5) * 100 + 'px';
		emoji.style.top = y + (Math.random() - 0.5) * 100 + 'px';
		emoji.style.fontSize = '24px';
		emoji.style.opacity = '0.8';

		container.appendChild(emoji);
	}

	document.body.appendChild(container);

	// Remove after 2 seconds
	setTimeout(() => {
		container.remove();
	}, 2000);
}

/**
 * Play celebration sound (if enabled and available)
 */
export function playSound(type: 'success' | 'celebration' = 'celebration') {
	// Check if sounds are enabled
	const soundEnabled = localStorage.getItem('sive:sound-enabled') !== 'false';
	if (!soundEnabled) return;

	// Create simple beep sound using Web Audio API
	try {
		const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
		const now = audioContext.currentTime;

		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();

		oscillator.connect(gainNode);
		gainNode.connect(audioContext.destination);

		if (type === 'success') {
			// Two ascending beeps
			oscillator.frequency.setValueAtTime(800, now);
			oscillator.frequency.setValueAtTime(1200, now + 0.1);

			gainNode.gain.setValueAtTime(0.3, now);
			gainNode.gain.setValueAtTime(0, now + 0.2);

			oscillator.start(now);
			oscillator.stop(now + 0.2);
		} else {
			// Celebration: three beeps
			gainNode.gain.setValueAtTime(0.2, now);
			gainNode.gain.setValueAtTime(0, now + 0.1);

			oscillator.frequency.setValueAtTime(1000, now);
			oscillator.start(now);
			oscillator.stop(now + 0.1);

			gainNode.gain.setValueAtTime(0.2, now + 0.15);
			gainNode.gain.setValueAtTime(0, now + 0.25);

			oscillator.frequency.setValueAtTime(1200, now + 0.15);
			oscillator.start(now + 0.15);
			oscillator.stop(now + 0.25);

			gainNode.gain.setValueAtTime(0.2, now + 0.3);
			gainNode.gain.setValueAtTime(0, now + 0.4);

			oscillator.frequency.setValueAtTime(1400, now + 0.3);
			oscillator.start(now + 0.3);
			oscillator.stop(now + 0.4);
		}
	} catch (e) {
		// Audio context not available
	}
}
