#!/bin/bash
# Discord Music Bot Deployment Script for DigitalOcean
# Run this on your Ubuntu server

echo "🚀 Setting up Discord Music Bot on DigitalOcean..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 16
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Git
sudo apt install git -y

# Clone your repository (replace with your fork)
git clone https://github.com/SudhanPlayz/Discord-MusicBot.git
cd Discord-MusicBot

# Install dependencies
npm install

# Deploy global commands
npm run deploy

# Create production environment file
cat > .env << EOF
token=MTQyNTAwNjA0NDA1NjEyNTQ5Mg.GOnGgk.AaHxhPkAy9Mv-EkWxXAAaA7ikQKpHV1vGTASCI
clientId=1425006044056125492
clientSecret=wLTvWV8vTGk1yN6Q9DBwusRuSmt1ECu1
EOF

echo "🔧 Creating PM2 ecosystem file..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'discord-music-bot',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
EOF

# Start bot with PM2
pm2 start ecosystem.config.js

# Setup PM2 to start on boot
pm2 startup
pm2 save

# Setup firewall
sudo ufw allow 22/tcp
sudo ufw allow 4200/tcp
sudo ufw --force enable

echo "✅ Bot deployed successfully!"
echo "🎵 Your Discord Music Bot is now running 24/7!"
echo "📊 Dashboard available at: http://YOUR_DROPLET_IP:4200"
echo ""
echo "Useful commands:"
echo "  pm2 status          - Check bot status"
echo "  pm2 logs            - View bot logs"
echo "  pm2 restart all     - Restart bot"
echo "  pm2 stop all        - Stop bot"
