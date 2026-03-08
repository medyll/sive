# WebSocket Server Deployment Guide

This guide covers deploying the Sive WebSocket server for real-time collaboration features.

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

The WebSocket server will be available at `http://localhost:3000`

### Development Mode

For development with auto-reload:

```bash
# Terminal 1: SvelteKit dev server
npm run dev

# Terminal 2: WebSocket server (if separate)
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
WS_HOST=0.0.0.0              # Listen on all interfaces
WS_PORT=3000
WS_MAX_CONNECTIONS=1000      # Higher for production
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
pm2 logs sive-ws
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | development | Environment mode |
| `WS_HOST` | localhost | Bind address |
| `WS_PORT` | 3000 | Server port |
| `WS_MAX_CONNECTIONS` | 100 | Max concurrent connections |
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
WS_MAX_CONNECTIONS=10000    # More connections
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
pm2 logs sive-ws

# Last 100 lines
pm2 logs sive-ws --lines 100

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

For horizontal scaling across multiple cores:

```javascript
// In ecosystem.config.js
instances: 'max',  // Use all available CPU cores
exec_mode: 'cluster'
```

### Load Balancing

Use nginx as reverse proxy:

```nginx
upstream websocket {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## SSL/TLS Setup

For secure WebSocket (WSS):

```bash
# Generate self-signed certificate (dev only)
openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.crt -days 365 -nodes

# Or use Let's Encrypt with certbot
certbot certonly --standalone -d your-domain.com
```

Update `.env`:
```
WS_HTTPS=true
WS_CERT_PATH=/path/to/server.crt
WS_KEY_PATH=/path/to/server.key
```

## Troubleshooting

### Port Already in Use

```bash
# Find process on port 3000
lsof -i :3000

# Kill process (get PID from above)
kill -9 <PID>

# Or change port in .env
WS_PORT=3001
```

### High Memory Usage

```bash
# Check memory
pm2 monit

# Restart to clear memory leaks
pm2 restart sive-ws

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
pm2 logs sive-ws --err

# Increase verbosity
LOG_LEVEL=debug

# Restart
pm2 restart sive-ws
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
pm2 reload sive-ws
```

## Support

For issues or questions:
1. Check logs: `pm2 logs sive-ws`
2. Review configuration: `cat .env.production`
3. Check health: `curl localhost:3000/health`
4. Restart if needed: `pm2 restart sive-ws`

See [Architecture Documentation](../bmad/artifacts/architecture.md) for system design details.
