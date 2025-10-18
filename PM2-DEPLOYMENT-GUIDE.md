# Discord Music Bot - PM2 Deployment Guide (Ubuntu VPS)

This guide will help you deploy and run the Discord Music Bot on your Ubuntu VPS using PM2 for process management.

## Prerequisites

Before starting, ensure you're logged into your Ubuntu VPS via SSH.

## Step 1: Install Node.js and npm

```bash
# Update package list
sudo apt update

# Install Node.js 18.x (LTS) and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

## Step 2: Install PM2 Globally

```bash
# Install PM2
sudo npm install -g pm2

# Verify installation
pm2 --version
```

## Step 3: Upload or Clone Bot Files

### Option A: Clone from GitHub (if you have a repository)

```bash
# Navigate to your preferred directory
cd ~

# Clone your repository
git clone https://github.com/YOUR_USERNAME/Discord-MusicBot.git
cd Discord-MusicBot
```

### Option B: Upload files via SCP (from your local machine)

```bash
# On your local machine (Windows PowerShell):
scp -r "e:\Code\Discord-MusicBot" username@your-vps-ip:~/
```

Then on your VPS:

```bash
cd ~/Discord-MusicBot
```

## Step 4: Install Dependencies

```bash
# Install main bot dependencies
npm install

# Install dashboard dependencies (if using dashboard)
cd dashboard
npm install
cd ..
```

## Step 5: Configure Environment Variables

```bash
# Create .env file
nano .env
```

Add your configuration:

```env
token=YOUR_BOT_TOKEN_HERE
clientId=YOUR_CLIENT_ID
clientSecret=YOUR_CLIENT_SECRET
```

**Press `Ctrl + X`, then `Y`, then `Enter` to save and exit.**

## Step 6: Configure config.js

```bash
# Edit config.js
nano config.js
```

Make sure these settings are correct:

- `token: process.env.token`
- `clientId: "YOUR_CLIENT_ID"`
- `defaultVoiceChannel: "YOUR_VOICE_CHANNEL_ID"`
- Lavalink server settings

**Press `Ctrl + X`, then `Y`, then `Enter` to save and exit.**

## Step 7: Start Bot with PM2

### Basic Start

```bash
# Start the bot
pm2 start index.js --name discord-music-bot

# View logs
pm2 logs discord-music-bot
```

### Advanced Start (Recommended)

Create a PM2 ecosystem file for better configuration:

```bash
# Create ecosystem config
nano ecosystem.config.js
```

Add this configuration:

```javascript
module.exports = {
  apps: [
    {
      name: "discord-music-bot",
      script: "index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
    },
  ],
};
```

**Press `Ctrl + X`, then `Y`, then `Enter` to save.**

Start using ecosystem file:

```bash
# Create logs directory
mkdir -p logs

# Start with ecosystem config
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save
```

## Step 8: Enable PM2 Startup on Reboot

```bash
# Generate startup script
pm2 startup systemd

# This will output a command like:
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u YOUR_USER --hp /home/YOUR_USER

# Copy and run the command it shows

# Save current process list to auto-restart on reboot
pm2 save
```

## Step 9: Verify Bot is Running

```bash
# Check PM2 process list
pm2 list

# View real-time logs
pm2 logs discord-music-bot

# View monitoring dashboard
pm2 monit

# Check bot status in Discord
# - Bot should appear online
# - Try commands: !play, !help, /play, /help
```

## PM2 Management Commands

### Process Control

```bash
# Stop the bot
pm2 stop discord-music-bot

# Restart the bot
pm2 restart discord-music-bot

# Delete from PM2
pm2 delete discord-music-bot

# Restart all processes
pm2 restart all
```

### Monitoring

```bash
# View logs (live)
pm2 logs discord-music-bot

# View last 200 lines of logs
pm2 logs discord-music-bot --lines 200

# View only error logs
pm2 logs discord-music-bot --err

# Clear logs
pm2 flush

# Interactive monitoring
pm2 monit
```

### Information

```bash
# Show detailed info about the bot process
pm2 show discord-music-bot

# Show process list
pm2 list

# Show memory/CPU usage
pm2 status
```

### Updates and Maintenance

```bash
# After making code changes:
cd ~/Discord-MusicBot
git pull  # If using git
pm2 restart discord-music-bot

# Update dependencies
npm install
pm2 restart discord-music-bot

# Update PM2 itself
npm install -g pm2@latest
pm2 update
```

## Troubleshooting

### Bot Won't Start

```bash
# Check logs for errors
pm2 logs discord-music-bot --err

# Try running manually to see errors
node index.js

# Check if port 4200 is already in use
sudo lsof -i :4200
```

### High Memory Usage

```bash
# Restart to clear memory
pm2 restart discord-music-bot

# Set memory limit in ecosystem.config.js
# max_memory_restart: '500M'
```

### Bot Goes Offline After Some Time

```bash
# Check if process crashed
pm2 list

# View error logs
pm2 logs discord-music-bot --err

# Ensure auto-restart is enabled
pm2 show discord-music-bot | grep "autorestart"
```

### Permission Issues

```bash
# Fix ownership of files
sudo chown -R $USER:$USER ~/Discord-MusicBot

# Fix npm permissions
sudo chown -R $USER:$USER ~/.npm
```

## Firewall Configuration (Optional)

If using dashboard on port 4200:

```bash
# Allow port 4200 for dashboard
sudo ufw allow 4200/tcp

# Check firewall status
sudo ufw status
```

## Security Best Practices

1. **Never commit .env file to GitHub**

   ```bash
   # Ensure .env is in .gitignore
   echo ".env" >> .gitignore
   ```

2. **Secure your VPS**

   ```bash
   # Update system regularly
   sudo apt update && sudo apt upgrade -y

   # Setup firewall
   sudo ufw enable
   sudo ufw allow ssh
   ```

3. **Use SSH keys instead of passwords**

4. **Regularly backup your config.js and .env**
   ```bash
   cp .env .env.backup
   cp config.js config.js.backup
   ```

## Quick Reference Card

```bash
# Start bot
pm2 start ecosystem.config.js

# View logs
pm2 logs

# Restart after changes
pm2 restart discord-music-bot

# Stop bot
pm2 stop discord-music-bot

# Check status
pm2 list

# View monitoring
pm2 monit
```

## What PM2 Does

✅ **Keeps bot running 24/7** - Automatically restarts if it crashes  
✅ **Auto-start on server reboot** - Bot starts when VPS restarts  
✅ **Log management** - Captures all console output  
✅ **Resource monitoring** - Track CPU and memory usage  
✅ **Zero-downtime restarts** - Update bot without extended downtime  
✅ **Cluster mode** - Can run multiple instances (not needed for Discord bots)

## Need Help?

- PM2 Documentation: https://pm2.keymetrics.io/docs/usage/quick-start/
- Bot Issues: Check `logs/err.log` and `pm2 logs discord-music-bot --err`
- Discord Developer Portal: https://discord.com/developers/applications

---

**Your bot is now running 24/7 on your VPS! 🎉**
