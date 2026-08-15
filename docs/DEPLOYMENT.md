# Deployment Guide

This guide covers deploying Sive to a production server.

## Prerequisites

- Node.js 18+ installed
- PM2 for process management: `npm install -g pm2`
- Git for deployment
- Linux/macOS recommended (Windows requires WSL)

## Local Development

### Setup

1. Copy environment template:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with local values (optional for development)

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`

### Development Mode

For development with auto-reload:

```bash
# Terminal 1: SvelteKit dev server
npm run dev

pm2 start ecosystem.config.js --watch
```

## Production Deployment

### Step 1: Server Setup

```bash
# SSH to production server
ssh your-user@your-server.com

# Create application directory
mkdir -p /var/www/sive
cd /var/www/sive

# Clone repository
git clone https://github.com/your-org/sive.git .
```

### Step 2: Environment Configuration

```bash
# Copy and configure environment variables
cp .env.example .env.production
nano .env.production

# Required production settings:
NODE_ENV=production
HOST=0.0.0.0              # Listen on all interfaces
PORT=3000
LOG_LEVEL=warn
```

### Step 3: Install Dependencies & Build

```bash
npm install --omit=dev
npm run build
```

### Step 4: Start with PM2

```bash
# Start the application
pm2 start ecosystem.config.js --env production

# Save PM2 process list for auto-restart on reboot
pm2 save
pm2 startup

# Verify it's running
pm2 status
pm2 logs sive
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | development | Environment mode |
| `HOST` | localhost | Bind address |
| `PORT` | 3000 | Server port |
| `WS_HEARTBEAT_INTERVAL` | 30000 | Heartbeat interval (ms) |
| `WS_HEARTBEAT_TIMEOUT` | 60000 | Client timeout (ms) |
| `LOG_LEVEL` | info | Logging level |

### Performance Tuning

For high-traffic scenarios:

```bash
# Increase file descriptor limit
ulimit -n 65536

# Increase TCP backlog
sysctl -w net.core.somaxconn=65535

# Adjust nodejs
NODE_OPTIONS="--max-old-space-size=4096"  # More memory
```

## Monitoring

### Health Check

```bash
# Check server health
curl http://localhost:3000/health

# Expected response:
# {"status": "ok", "uptime": 12345, "connections": 5}
```

### PM2 Dashboard

```bash
# Start PM2 web dashboard
pm2 web

# Access at http://localhost:9615
```

### View Logs

```bash
# Real-time logs
pm2 logs sive

# Last 100 lines
pm2 logs sive --lines 100

# Specific log file
tail -f logs/ws-error.log
tail -f logs/ws-out.log
```

### Process Status

```bash
# Check running processes
pm2 status

# Monitor CPU/Memory
pm2 monit
```

## Scaling

### Multi-Worker Setup

Not currently supported. `ecosystem.config.js` pins the app to a single fork-mode
instance on purpose — see the note under Load Balancing.

### Load Balancing

> **Before scaling out, read this.** Several server modules keep their state in
> process memory rather than in the database — notifications, the skill engine,
> the AI router and its API keys. Running more than one instance means a request
> can land on a process that knows nothing about what the previous one did, and
> a restart drops the state entirely. Run a single instance until that state is
> persisted.

Use nginx as a reverse proxy:

```nginx
upstream sive {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://sive;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## SSL/TLS Setup

```bash
# Let's Encrypt with certbot
certbot --nginx -d your-domain.com
```

Serving over HTTPS is not optional: `hooks.server.ts` sends
`Strict-Transport-Security`, and session cookies are only safe over TLS.

## Troubleshooting

### Port Already in Use

```bash
# Find process on port 3000
lsof -i :3000

# Kill process (get PID from above)
kill -9 <PID>

# Or change port in .env
PORT=3001
```

### High Memory Usage

```bash
# Check memory
pm2 monit

# Restart to clear memory leaks
pm2 restart sive

# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=2048" pm2 start ecosystem.config.js
```

### Connection Timeouts

Check `.env` settings:
```
WS_HEARTBEAT_INTERVAL=30000   # How often to send heartbeat
WS_HEARTBEAT_TIMEOUT=60000    # How long before considering client dead
WS_CONNECTION_TIMEOUT=30000   # Initial connection timeout
```

### Logs Show Errors

```bash
# Check logs
pm2 logs sive --err

# Increase verbosity
LOG_LEVEL=debug

# Restart
pm2 restart sive
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] `.env.production` created and secured
- [ ] Dependencies installed with `--omit=dev`
- [ ] Build completed: `npm run build`
- [ ] PM2 started: `pm2 start ecosystem.config.js --env production`
- [ ] Health check passing: `curl localhost:3000/health`
- [ ] PM2 processes saved: `pm2 save`
- [ ] PM2 startup configured: `pm2 startup`
- [ ] Logs reviewed for errors: `pm2 logs`
- [ ] Monitoring set up: `pm2 web` or `pm2 monit`

## Updating

```bash
# Pull latest code
git pull origin main

# Install new dependencies
npm install --omit=dev

# Rebuild
npm run build

# Reload with zero downtime
pm2 reload sive
```

## Support

For issues or questions:
1. Check logs: `pm2 logs sive`
2. Review configuration: `cat .env.production`
3. Check health: `curl localhost:3000/health`
4. Restart if needed: `pm2 restart sive`

See [Architecture Documentation](../bmad/artifacts/architecture.md) for system design details.
