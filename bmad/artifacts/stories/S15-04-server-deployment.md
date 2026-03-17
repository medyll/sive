# S15-04 - Server Deployment Setup

**Status**: 🚀 In Progress
**Priority**: High
**Points**: 2
**Branch**: `s15-01-websocket-api`

## Description

Configure WebSocket server for production deployment. Set up process management, environment variables, health checks, and connection limits.

## Acceptance Criteria

- [x] Environment configuration (.env templates)
- [x] Process management setup (pm2 or systemd)
- [x] Health check endpoint
- [x] Connection limit configuration
- [x] Graceful shutdown handling
- [x] Logging setup
- [x] Documentation for deployment
- [x] Docker setup (optional advanced)

## Implementation Details

### Environment Variables
```
WS_HOST=localhost
WS_PORT=3000
WS_MAX_CONNECTIONS=100
WS_HEARTBEAT_INTERVAL=30000
WS_HEARTBEAT_TIMEOUT=60000
LOG_LEVEL=info
NODE_ENV=production
```

### Process Management (PM2)
```json
{
  "apps": [
    {
      "name": "sive-ws",
      "script": "dist/index.js",
      "instances": 1,
      "exec_mode": "cluster",
      "error_file": "logs/ws-error.log",
      "out_file": "logs/ws-out.log",
      "log_date_format": "YYYY-MM-DD HH:mm:ss",
      "env": {
        "NODE_ENV": "production",
        "WS_PORT": 3000
      }
    }
  ]
}
```

### Health Check Endpoint
```
GET /health
Response: { status: 'ok', uptime: 12345, connections: 5 }
```

### Configuration
- Max connections: 100 (configurable)
- Heartbeat interval: 30s
- Heartbeat timeout: 60s
- Connection timeout: 30s
- Message queue: 1000 max

## Files to Create

- `/ecosystem.config.js` (PM2 config)
- `/.env.example` (environment template)
- `/server/health-check.ts` (health endpoint)
- `/docs/DEPLOYMENT.md` (deployment guide)

## Testing

Tests cover:
- Health check responds correctly
- Environment variables loaded
- Connection limits respected
- Graceful shutdown
- Error logging

## Deployment Steps

1. Install dependencies: `npm install`
2. Build: `npm run build`
3. Copy `.env.production` from template
4. Run with PM2: `pm2 start ecosystem.config.js`
5. Check status: `pm2 status`
6. View logs: `pm2 logs sive-ws`

## Monitoring

- PM2 Dashboard: `pm2 web` (port 9615)
- Log files: `logs/ws-out.log` and `ws-error.log`
- Health check: `curl http://localhost:3000/health`

## Related Stories

- Depends on: S15-01 (WebSocket API)
- Enables: S15-05 (Performance testing)
- Part of: Sprint 15
