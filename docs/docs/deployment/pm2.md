# PM2 Configuration

Guide to using PM2 for process management in production.

## Overview

PM2 is a production process manager for Node.js applications. It:

- ✅ Keeps applications running
- ✅ Auto-restarts on crashes
- ✅ Manages multiple processes
- ✅ Provides monitoring and logging
- ✅ Handles startup on server reboot

## Installation

```bash
# Install PM2 globally
npm install -g pm2

# Verify installation
pm2 --version
```

## Ecosystem Configuration

The project includes `ecosystem.config.js` for managing all three services:

```javascript
module.exports = {
  apps: [
    {
      name: 'accessibility-frontend',
      script: 'yarn',
      args: 'build && yarn preview',
      cwd: './',
      env: {
        NODE_ENV: 'production',
        PORT: 5173,
      },
    },
    {
      name: 'accessibility-backend',
      script: 'tsx',
      args: 'server/index.ts',
      cwd: './',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'accessibility-docs',
      script: 'yarn',
      args: 'build && yarn serve',
      cwd: './docs',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
    },
  ],
};
```

## Starting Services

### Start All Services

```bash
# Start all services defined in ecosystem.config.js
pm2 start ecosystem.config.js --env production

# Verify services started
pm2 status
```

### Start Individual Service

```bash
# Start specific service
pm2 start ecosystem.config.js --only accessibility-backend

# Start by name
pm2 start app.js --name "my-app"
```

## Managing Services

### View Status

```bash
# View all processes
pm2 status

# View detailed information
pm2 info accessibility-backend

# View real-time monitoring
pm2 monit
```

### View Logs

```bash
# View all logs
pm2 logs

# View specific service logs
pm2 logs accessibility-backend

# View last 100 lines
pm2 logs --lines 100

# Follow logs in real-time
pm2 logs --follow
```

### Restart Services

```bash
# Restart all services
pm2 restart all

# Restart specific service
pm2 restart accessibility-backend

# Restart with graceful shutdown
pm2 gracefulReload all
```

### Stop Services

```bash
# Stop all services
pm2 stop all

# Stop specific service
pm2 stop accessibility-backend

# Stop and delete from PM2
pm2 delete accessibility-backend
```

## Auto-Start on Server Reboot

### Setup Startup

```bash
# Generate startup script
pm2 startup

# Follow the instructions to set up auto-start
# Usually requires running a sudo command

# Verify setup
pm2 startup systemd -u $USER --hp /home/$USER
```

### Save Configuration

```bash
# Save current PM2 configuration
pm2 save

# Restore configuration after reboot
pm2 resurrect
```

### Disable Auto-Start

```bash
# Remove startup script
pm2 unstartup systemd -u $USER --hp /home/$USER
```

## Monitoring

### Real-Time Monitoring

```bash
# View real-time resource usage
pm2 monit
```

### Log Rotation

```bash
# Install log rotation module
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### Health Monitoring

```bash
# View process health
pm2 status

# Check for crashes
pm2 logs --err

# View memory usage
pm2 monit
```

## Troubleshooting

### Service Won't Start

```bash
# Check logs
pm2 logs

# Check error logs
pm2 logs --err

# Verify configuration
pm2 describe ecosystem.config.js

# Try starting manually
pm2 start ecosystem.config.js --no-daemon
```

### Service Keeps Crashing

```bash
# View crash logs
pm2 logs --err

# Check application logs
pm2 logs accessibility-backend

# Increase restart delay
# Edit ecosystem.config.js and add:
# min_memory_restart: '100M'
```

### High Memory Usage

```bash
# View memory usage
pm2 monit

# Set memory limit
# Edit ecosystem.config.js and add:
# max_memory_restart: '500M'

# Restart service
pm2 restart all
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :3001

# Kill process
kill -9 <PID>

# Or change port in ecosystem.config.js
```

## Advanced Configuration

### Cluster Mode

```javascript
{
  name: 'app',
  script: 'app.js',
  instances: 4,  // Number of instances
  exec_mode: 'cluster',
}
```

### Watch Mode

```javascript
{
  name: 'app',
  script: 'app.js',
  watch: true,  // Restart on file changes
  ignore_watch: ['node_modules', 'logs'],
}
```

### Environment Variables

```javascript
{
  name: 'app',
  script: 'app.js',
  env: {
    NODE_ENV: 'production',
    PORT: 3001,
  },
}
```

## Common Commands

```bash
# List all processes
pm2 list

# View process details
pm2 info <app-name>

# View logs
pm2 logs

# Restart all
pm2 restart all

# Stop all
pm2 stop all

# Delete all
pm2 delete all

# Save configuration
pm2 save

# Restore configuration
pm2 resurrect

# View startup script
pm2 startup

# Remove startup script
pm2 unstartup
```

## See Also

- [Deployment Overview](./overview) - Deployment guide
- [Production Deployment](./production) - Production setup
- [Nginx Configuration](./nginx) - Nginx setup

