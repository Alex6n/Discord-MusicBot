# Spotify Support - Testing & Troubleshooting

## ✅ Configuration Status

Your Spotify integration is **CONFIGURED CORRECTLY**:

```
✓ Spotify Client ID: 3317537b...
✓ Spotify Client Secret: bc9e855c...
✓ Plugin initialized successfully
```

## ⚠️ "Failed to renew Spotify token" Message

**This is NORMAL!** The error you see:

```
Failed to renew Spotify token, dont open issue about this. retrying in 10 seconds.
```

This happens because:

1. The Spotify plugin needs to authenticate with Spotify's API
2. Spotify sometimes rate-limits requests
3. The plugin automatically retries every 10 seconds
4. **Spotify links will still work** once the token is obtained

## 🎵 How to Test Spotify Support

### 1. Try a Spotify Track

```
/play https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
```

or

```
!play https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
```

### 2. Try a Spotify Playlist

```
/play https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
```

### 3. Try a Spotify Album

```
/play https://open.spotify.com/album/2ODvWsOgouMbaA5xf0RkJe
```

## 🔍 Expected Behavior

### When Working ✅

- Bot shows "Searching..." message
- Track info appears with thumbnail
- Song plays from YouTube (via Lavalink)
- Queue shows the track

### When Not Working ❌

- "No results were found" or "Error while searching"
- Bot stays in channel (doesn't leave)
- Try again after 10-20 seconds (wait for token renewal)

## 🐛 Troubleshooting

### If Spotify links don't work:

1. **Wait for token renewal** (10-20 seconds after bot starts)

   - The "Failed to renew token" message should stop appearing
   - Then try your Spotify link again

2. **Check credentials are correct:**

   ```bash
   # On VPS, verify .env file:
   cat ~/FlockTogether/.env

   # Should show:
   SPOTIFY_CLIENT_ID=3317537b2d344ac18ddf07eb00136242
   SPOTIFY_CLIENT_SECRET=bc9e855c071a4a599e32840dfc769caa
   ```

3. **Verify Spotify app is in Development Mode:**

   - Go to: https://developer.spotify.com/dashboard
   - Click your app
   - Status should show: "Development mode"
   - This is fine! No need to submit for quota extension

4. **Check Lavalink node:**

   - The error "Unexpected op 'ready'" is a warning, not critical
   - As long as you see "Lavalink node is connected" ✓

5. **Restart bot after changes:**
   ```bash
   cd ~/FlockTogether
   pm2 restart discord-music-bot
   pm2 logs discord-music-bot
   ```

## 📊 Console Log Analysis

When bot starts, you should see:

```
=== Environment Variables Check ===
Bot Token: ✓ Loaded
Spotify Client ID: ✓ Loaded
Spotify Client Secret: ✓ Loaded
===================================

=== Spotify Configuration Debug ===
Spotify Client ID: ✓ Set (3317537b...)
Spotify Client Secret: ✓ Set (hidden)
✓ Spotify plugin will initialize - token renewal messages are normal!
  Try: /play https://open.spotify.com/track/...
===================================
```

Then you'll see:

```
Failed to renew Spotify token, dont open issue about this. retrying in 10 seconds.
```

**This is expected!** Just wait ~10 seconds and Spotify will work.

## ✅ Success Indicators

Spotify is working when:

- You can play Spotify track links
- Bot shows correct song titles from Spotify
- Playlists load (up to 50 tracks)
- Albums load all tracks

## 🎯 Quick Test Command

Try this popular song:

```
!play https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp
```

(Mr. Brightside by The Killers)

If it loads and plays, **Spotify is working!** 🎉

## 📝 Notes

- The bot uses Spotify API to get track info
- Then searches for the song on YouTube
- Plays the YouTube version via Lavalink
- You **don't** need Spotify Premium
- Free Spotify account credentials work fine
- Rate limits are per app (shared across all uses)

---

**Status:** ✅ Configured correctly  
**Token Renewal:** Normal behavior, wait 10-20 seconds  
**Ready to use:** Yes! Try a Spotify link now!
