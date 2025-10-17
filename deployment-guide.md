# Quick Setup Commands for DigitalOcean

# 1. SSH into your droplet

ssh root@YOUR_DROPLET_IP

# 2. Run the automated setup

curl -O https://raw.githubusercontent.com/SudhanPlayz/Discord-MusicBot/v5/deploy.sh
chmod +x deploy.sh
./deploy.sh

# 3. Check if bot is running

pm2 status

# 4. View logs

pm2 logs

# 5. Access dashboard

# http://YOUR_DROPLET_IP:4200

# Useful PM2 commands:

pm2 restart discord-music-bot # Restart bot
pm2 stop discord-music-bot # Stop bot  
pm2 start discord-music-bot # Start bot
pm2 delete discord-music-bot # Remove bot
