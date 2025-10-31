# Multi-Bot Starter Guide

## Quick Start Commands

### Start Specific Bot

```bash
npm run start:flint    # Start Flint bot
npm run start:koko     # Start Koko bot
npm run start:robin    # Start Robin bot
```

### Start with Current .env

```bash
npm start              # Uses token and clientId from .env
```

## How It Works

All bot configurations are stored in `.env`:

```properties
# Current Active Bot (used by npm start)
token=...
clientId=...

# Flint Bot
FLINT_TOKEN=...
FLINT_CLIENT_ID=...

# Koko Bot
KOKO_TOKEN=...
KOKO_CLIENT_ID=...

# Robin Bot
ROBIN_TOKEN=...
ROBIN_CLIENT_ID=...
```

When you run `npm run start:flint`, it:

1. Loads Flint's token and client ID from `.env`
2. Overrides the current `token` and `clientId`
3. Starts the bot with Flint's credentials

## Adding New Bots

1. Open `.env`
2. Add your new bot's credentials:

```properties
# MyNewBot
MYNEWBOT_TOKEN=your_token_here
MYNEWBOT_CLIENT_ID=your_client_id_here
```

3. Add script to `package.json`:

```json
"start:mynewbot": "node start-bot.js mynewbot"
```

4. Run it:

```bash
npm run start:mynewbot
```

## Current Bots

- **Flint** - Vibing Flint#7529
- **Koko** - Wise Koko#6217
- **Robin** - Elegant Robbin#2192

## Benefits

✅ All configuration in `.env`
✅ Simple command-line interface
✅ No external JSON files
✅ Easy to add new bots
✅ Protected by `.gitignore`
