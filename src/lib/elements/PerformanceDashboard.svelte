/**
 * Performance Metrics Dashboard
 * 
 * Tracks and displays Core Web Vitals and app performance.
 */

<script lang="ts">
	import { onMount } from 'svelte';
	
	interface Metric {
		name: string;
		value: number;
		rating: 'good' | 'needs-improvement' | 'poor';
		thresholds: { good: number; poor: number };
		unit: string;
	}
	
	let metrics = $state<Metric[]>([
		{
			name: 'LCP',
			value: 0,
			rating: 'good',
			thresholds: { good: 2500, poor: 4000 },
			unit: 'ms'
		},
		{
			name: 'FID',
			value: 0,
			rating: 'good',
			thresholds: { good: 100, poor: 300 },
			unit: 'ms'
		},
		{
			name: 'CLS',
			value: 0,
			rating: 'good',
			thresholds: { good: 0.1, poor: 0.25 },
			unit: ''
		},
		{
			name: 'FCP',
			value: 0,
			rating: 'good',
			thresholds: { good: 1800, poor: 3000 },
			unit: 'ms'
		},
		{
			name: 'TTFB',
			value: 0,
			rating: 'good',
			thresholds: { good: 800, poor: 1800 },
			unit: 'ms'
		}
	]);
	
	let navigationTiming = $state<NavigationTiming | null>(null);
	
	onMount(() => {
		// Observe Core Web Vitals
		observeLCP();
		observeFID();
		observeCLS();
		observeFCP();
		
		// Get navigation timing
		if (typeof performance !== 'undefined') {
			const entries = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
			if (entries) {
				navigationTiming = entries;
				metrics.find(m => m.name === 'TTFB')!.value = entries.responseStart;
			}
		}
	});
	
	function observeLCP() {
		if (!('PerformanceObserver' in window)) return;
		
		const observer = new PerformanceObserver((list) => {
			const entries = list.getEntries();
			const lastEntry = entries[entries.length - 1];
			updateMetric('LCP', lastEntry.startTime);
		});
		
		observer.observe({ entryTypes: ['largest-contentful-paint'] });
	}
	
	function observeFID() {
		if (!('PerformanceObserver' in window)) return;
		
		// FID is deprecated, using INP instead
		const observer = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				updateMetric('FID', entry.processingStart - entry.startTime);
			}
		});
		
		observer.observe({ entryTypes: ['first-input', 'interaction'] });
	}
	
	function observeCLS() {
		if (!('PerformanceObserver' in window)) return;
		
		let clsValue = 0;
		
		const observer = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (!entry.hadRecentInput) {
					clsValue += (entry as LayoutShift).value;
				}
			}
			updateMetric('CLS', clsValue);
		});
		
		observer.observe({ entryTypes: ['layout-shift'] });
	}
	
	function observeFCP() {
		if (!('PerformanceObserver' in window)) return;
		
		const observer = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (entry.name === 'first-contentful-paint') {
					updateMetric('FCP', entry.startTime);
				}
			}
		});
		
		observer.observe({ entryTypes: ['paint'] });
	}
	
	function updateMetric(name: string, value: number) {
		const metric = metrics.find(m => m.name === name);
		if (!metric) return;
		
		metric.value = value;
		
		if (value <= metric.thresholds.good) {
			metric.rating = 'good';
		} else if (value <= metric.thresholds.poor) {
			metric.rating = 'needs-improvement';
		} else {
			metric.rating = 'poor';
		}
	}
	
	function getRatingColor(rating: string): string {
		switch (rating) {
			case 'good': return 'text-green-600';
			case 'needs-improvement': return 'text-yellow-600';
			case 'poor': return 'text-red-600';
		}
	}
	
	function getRatingBg(rating: string): string {
		switch (rating) {
			case 'good': return 'bg-green-100';
			case 'needs-improvement': return 'bg-yellow-100';
			case 'poor': return 'bg-red-100';
		}
	}
	
	function formatValue(metric: Metric): string {
		if (metric.unit === 'ms') {
			return `${Math.round(metric.value)} ms`;
		}
		return metric.value.toFixed(3);
	}
</script>

<div class="performance-dashboard p-4 space-y-4">
	<h3 class="text-lg font-semibold">Performance Metrics</h3>
	
	<div class="grid grid-cols-2 md:grid-cols-5 gap-4">
		{#each metrics as metric}
			<div class="p-4 border rounded-lg {getRatingBg(metric.rating)}">
				<div class="text-sm text-muted mb-1">{metric.name}</div>
				<div class="text-2xl font-bold {getRatingColor(metric.rating)}">
					{formatValue(metric)}
				</div>
				<div class="text-xs text-muted mt-1 capitalize">{metric.rating.replace('-', ' ')}</div>
			</div>
		{/each}
	</div>
	
	{#if navigationTiming}
		<div class="border-t pt-4">
			<h4 class="font-semibold mb-2">Navigation Timing</h4>
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
				<div>
					<div class="text-muted">DNS Lookup</div>
					<div class="font-mono">{Math.round(navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart)} ms</div>
				</div>
				<div>
					<div class="text-muted">TCP Connection</div>
					<div class="font-mono">{Math.round(navigationTiming.connectEnd - navigationTiming.connectStart)} ms</div>
				</div>
				<div>
					<div class="text-muted">DOM Content Loaded</div>
					<div class="font-mono">{Math.round(navigationTiming.domContentLoadedEventEnd)} ms</div>
				</div>
				<div>
					<div class="text-muted">Full Load</div>
					<div class="font-mono">{Math.round(navigationTiming.loadEventEnd)} ms</div>
				</div>
			</div>
		</div>
	{/if}
</div>
