# Spotify Debugging Guide

## Current Issue

When playing Spotify links, you're getting:

```
No results were found. Try a different search term.
```

And in logs:

```
Failed to renew Spotify token: Unexpected token '<', "<?xml vers"... is not valid JSON
```

This means Spotify API is returning an HTML error page instead of JSON.

## Common Causes

### 1. Invalid Credentials Format

Your credentials look correct:

- Client ID: `3317537b2d344ac18ddf07eb00136242` (32 chars ✓)
- Client Secret: `bc9e855c071a4a599e32840dfc769caa` (32 chars ✓)

### 2. Spotify App Not Activated

Go to https://developer.spotify.com/dashboard

- Click your app
- Verify it shows "Development mode"
- If you see any warnings, click "Edit Settings"

### 3. Wrong Redirect URI

Even though the bot doesn't use redirect URIs for this type of auth:

- Go to app settings
- Click "Edit Settings"
- Under "Redirect URIs" add: `http://localhost`
- Click "Add"
- Click "Save"

### 4. Credentials Copy/Paste Error

Double-check you copied the FULL credentials:

1. Go to: https://developer.spotify.com/dashboard
2. Click your app: "Discord Music Bot"
3. Copy Client ID (should be exactly 32 characters)
4. Click "Show Client Secret"
5. Copy Client Secret (should be exactly 32 characters)

Compare with your .env file:

```bash
# On VPS:
cat ~/FlockTogether/.env | grep SPOTIFY

# On local:
cat .env | grep SPOTIFY
```

## Testing Now

With the new logging added, run:

```bash
npm start
```

Then try a Spotify link in Discord:

```
!play https://open.spotify.com/track/6dgUya35uoZfk4f5Q4f4z7
```

## What to Look For in Logs

You should now see detailed logs like:

```
[PLAY] Searching for: https://open.spotify.com/track/6dgUya35uoZfk4f5Q4f4z7
[PLAY] Is Spotify URL: true
[PLAY] Search result loadType: TRACK_LOADED or NO_MATCHES
[PLAY] Tracks found: 1 or 0
```

If you see:

```
[PLAY] Full search error: [error details]
[PLAY] Error stack: [stack trace]
```

This will tell us exactly what's failing!

## Alternative: Try Different Spotify Plugin

If the issue persists, we can try:

1. Updating to newer version of `better-erela.js-spotify`
2. Using different Spotify plugin
3. Falling back to YouTube-only (no Spotify)

## Quick Fix to Test

Try these Spotify links (they're known to work):

```
!play https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp
!play https://open.spotify.com/track/60nZcImufyMA1MKQY3dcCH
!play spotify:track:6dgUya35uoZfk4f5Q4f4z7
```

## Next Steps

Run the bot with new logging and share:

1. The startup logs (especially Spotify config section)
2. The logs when you try to play a Spotify link
3. Any error messages with full details

This will help identify the exact issue!
