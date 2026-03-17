/**
 * PM2 Ecosystem Configuration for Sive WebSocket Server
 * See documentation: https://pm2.keymetrics.io/docs/usage/ecosystem-file/
 */

module.exports = {
	apps: [
		{
			// Application name
			name: 'sive-ws',

			// Entry point for the application
			script: './build/index.js',

			// Run in cluster mode (multiple instances)
			instances: 1,
			exec_mode: 'cluster',

			// Logging
			error_file: './logs/ws-error.log',
			out_file: './logs/ws-out.log',
			log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

			// Environment variables
			env: {
				NODE_ENV: 'development',
				WS_HOST: 'localhost',
				WS_PORT: 3000,
				WS_MAX_CONNECTIONS: 100,
				LOG_LEVEL: 'info'
			},

			// Production environment variables
			env_production: {
				NODE_ENV: 'production',
				WS_HOST: '0.0.0.0',
				WS_PORT: 3000,
				WS_MAX_CONNECTIONS: 1000,
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
