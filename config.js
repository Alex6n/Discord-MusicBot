module.exports = {
  helpCmdPerPage: 10, //- Number of commands per page of help command
  lyricsMaxResults: 5, //- Number of results for lyrics command (Do not touch this value if you don't know what you are doing)
  adminId: "YOUR_DISCORD_USER_ID", //- Replace with YOUR Discord ID (right-click your name → Copy User ID)
  token: process.env.token || "", //- Bot's Token
  clientId: process.env.clientId || "", //- ID of the bot
  clientSecret: process.env.clientSecret || "", //- Client Secret of the bot
  port: 4200, //- Port of the API and Dashboard
  scopes: ["identify", "guilds", "applications.commands"], //- Discord OAuth2 Scopes
  inviteScopes: ["bot", "applications.commands"], // Invite link scopes
  serverDeafen: false, //- If you want bot to stay deafened
  defaultVolume: 100, //- Sets the default volume of the bot, You can change this number anywhere from 1 to 100
  supportServer: "https://discord.gg/sbySMS7m3v", //- Support Server Link
  Issues: "https://github.com/SudhanPlayz/Discord-MusicBot/issues", //- Bug Report Link
  permissions: 277083450689, //- Bot Inviting Permissions
  disconnectTime: 30000, //- How long should the bot wait before disconnecting from the voice channel (in miliseconds). Set to 1 for instant disconnect.
  twentyFourSeven: true, //- When set to true, the bot will never disconnect from the voice channel
  autoQueue: true, //- When set to true, related songs will automatically be added to the queue
  autoPause: false, //- When set to true, music will automatically be paused if everyone leaves the voice channel
  autoLeave: false, //- When set to true, the bot will automatically leave when no one is in the voice channel (can be combined with 24/7 to always be in voice channel until everyone leaves; if 24/7 is on disconnectTime will add a disconnect delay after everyone leaves.)
  defaultVoiceChannel: "1346157984182702206", //- Voice channel ID where bot auto-joins on startup (leave empty to disable)
  defaultTextChannel: "", //- Text channel ID for sending messages (optional, leave empty to disable)

  // Spotify Configuration (Get credentials from https://developer.spotify.com/dashboard)
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID || "", //- Spotify Client ID
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "", //- Spotify Client Secret
  },

  debug: false, //- Debug mode
  cookieSecret: "CodingWithSudhan is epic", //- Cookie Secret
  website: process.env.WEBSITE_URL || "http://localhost:4200", //- without the / at the end
  // You need a lavalink server for this bot to work!!!!
  // Lavalink server; public lavalink -> https://lavalink-list.darrennathanael.com/; create one yourself -> https://darrennathanael.com/post/how-to-lavalink
  nodes: [
    {
      identifier: "Main Node", //- Used for indentifier in stats commands.
      host: "lava-v3.ajieblogs.eu.org", //- Working public Lavalink server
      port: 443, // The port that lavalink is listening to. This must be a number!
      password: "https://dsc.gg/ajidevserver", //- The password of the lavalink server.
      retryAmount: 200, //- The amount of times to retry connecting to the node if connection got dropped.
      retryDelay: 40, //- Delay between reconnect attempts if connection is lost.
      secure: true, //- SSL enabled for this public server
    },
  ],
  embedColor: "#2f3136", //- Color of the embeds, hex supported
  presence: {
    // PresenceData object | https://discord.js.org/#/docs/main/stable/typedef/PresenceData
    status: "online", //- You can have online, idle, dnd and invisible (Note: invisible makes people think the bot is offline)
    activities: [
      {
        name: "the echo", //- Status Text (will change dynamically when playing music)
        type: "STREAMING", //- PLAYING, WATCHING, LISTENING, STREAMING
        url: "https://www.twitch.tv/discord", //- Streaming URL (required for purple status)
      },
    ],
  },
  iconURL: "https://cdn.darrennathanael.com/icons/spinning_disk.gif", //- This icon will be in every embed's author field
};
