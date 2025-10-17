# 🎵 Auto-Join Voice Channel Setup Guide

This guide will help you configure the bot to automatically join a voice channel on startup and stay there in 24/7 mode.

## 📋 Step 1: Get Your Channel IDs

### **Get Voice Channel ID:**

1. Open Discord
2. Go to **User Settings** → **Advanced**
3. Enable **Developer Mode** ✅
4. Right-click the **voice channel** you want the bot to join
5. Click **Copy Channel ID**

### **Get Text Channel ID (Optional):**

1. Right-click the **text channel** where you want bot notifications
2. Click **Copy Channel ID**

## ⚙️ Step 2: Update config.js

Open `config.js` and find these lines:

```javascript
defaultVoiceChannel: "", //- Voice channel ID where bot auto-joins on startup
defaultTextChannel: "", //- Text channel ID for sending messages (optional)
```

Replace with your channel IDs:

```javascript
defaultVoiceChannel: "1234567890123456789", //- Your voice channel ID
defaultTextChannel: "9876543210987654321", //- Your text channel ID (optional)
```

### **Example:**

```javascript
defaultVoiceChannel: "1098765432123456789",
defaultTextChannel: "1098765432987654321",
```

## 🚀 Step 3: Start Your Bot

```bash
node index.js
```

The bot will:

- ✅ Join the specified voice channel automatically
- ✅ Enable 24/7 mode by default
- ✅ Send a notification to the text channel (if specified)
- ✅ Wait for music commands
- ✅ Never disconnect (unless manually removed)

## 🎮 How It Works

1. **On Startup:** Bot joins your designated voice channel within 3 seconds
2. **24/7 Mode:** Automatically enabled, bot stays connected forever
3. **Ready State:** Bot is ready to receive `/play` commands
4. **Auto-Queue:** If enabled, will automatically queue related songs
5. **Persistent:** Stays connected even after restarts

## 🔧 Configuration Options

You can customize the behavior in `config.js`:

```javascript
twentyFourSeven: true,        // Stay in channel forever
autoQueue: true,              // Auto-add related songs
autoPause: false,             // Don't pause when alone
autoLeave: false,             // Never leave automatically
defaultVoiceChannel: "ID",    // Channel to auto-join
defaultTextChannel: "ID",     // Where to send notifications
```

## 💡 Tips

- **Multiple Servers:** The bot will only auto-join ONE server's voice channel (the one specified)
- **Permissions:** Make sure the bot has permission to join and speak in the voice channel
- **Text Channel:** Text channel is optional - leave empty (`""`) if you don't want notifications
- **Restart Behavior:** Bot will rejoin the channel every time it restarts

## 🎵 Using the Bot

Once connected, you can:

- `/play [song]` - Play music
- `/pause` - Pause playback
- `/skip` - Skip current song
- `/queue` - View queue
- `/volume` - Adjust volume
- `/247` - Toggle 24/7 mode (admin only)

The bot will stay in the channel waiting for your commands!

## ❌ Troubleshooting

**Bot doesn't join:**

- Check if the channel ID is correct
- Verify bot has permissions in that channel
- Check console logs for error messages

**Bot joins but disconnects:**

- Make sure `twentyFourSeven: true` in config.js
- Check if `autoLeave: false` in config.js
- Verify 24/7 mode is enabled with `/247`

**No notification message:**

- Verify text channel ID is correct
- Check bot has permission to send messages
- Text channel is optional, bot will still work without it
