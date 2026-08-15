/**
 * PM2 Ecosystem Configuration for Sive
 * See documentation: https://pm2.keymetrics.io/docs/usage/ecosystem-file/
 */

module.exports = {
	apps: [
		{
			// Application name
			name: 'sive',

			// Entry point for the application
			script: './build/index.js',

			// Single instance, fork mode. Several server modules hold state in
			// process memory (notifications, skill engine, AI router and its API
			// keys), so a second instance would answer requests with a different
			// view of the world. Revisit once that state is persisted.
			instances: 1,
			exec_mode: 'fork',

			// Logging
			error_file: './logs/error.log',
			out_file: './logs/out.log',
			log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

			// Environment variables
			env: {
				NODE_ENV: 'development',
				HOST: 'localhost',
				PORT: 3000,
				LOG_LEVEL: 'info'
			},

			// Production environment variables
			env_production: {
				NODE_ENV: 'production',
				HOST: '0.0.0.0',
				PORT: 3000,
				LOG_LEVEL: 'warn'
			},

			// Restart policy
			autorestart: true,
			max_restarts: 10,
			min_uptime: '10s',

			// Graceful shutdown
			kill_timeout: 5000,
			wait_ready: true,
			listen_timeout: 10000,

			// Watch mode (reload on file changes in dev)
			watch: process.env.NODE_ENV === 'development' ? ['src'] : false,
			ignore_watch: ['node_modules', '.git', 'logs', 'dist'],

			// Memory and CPU limits
			max_memory_restart: '500M',

			// Process behavior
			merge_logs: false,
			combine_logs: false
		}
	],

	// Global settings
	deploy: {
		production: {
			user: 'nodejs',
			host: 'your-production-server.com',
			ref: 'origin/main',
			repo: 'git@github.com:your-org/sive.git',
			path: '/var/www/sive',
			'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
		},
		staging: {
			user: 'nodejs',
			host: 'staging-server.com',
			ref: 'origin/develop',
			repo: 'git@github.com:your-org/sive.git',
			path: '/var/www/sive-staging',
			'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging'
		}
	}
};
