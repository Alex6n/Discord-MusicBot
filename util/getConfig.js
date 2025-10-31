const dotenv = require("dotenv").config();

module.exports = () => {
  return new Promise((res, rej) => {
    try {
      // Build config directly from environment variables
      const config = {
        helpCmdPerPage: parseInt(process.env.helpCmdPerPage) || 5,
        lyricsMaxResults: parseInt(process.env.lyricsMaxResults) || 5,
        adminId: process.env.adminId || "394472489641574400",
        token: process.env.token || "",
        clientId: process.env.clientId || "",
        clientSecret: process.env.clientSecret || "",
        port: parseInt(process.env.port) || 4200,
        scopes: ["identify", "guilds", "applications.commands"],
        inviteScopes: ["bot", "applications.commands"],
        serverDeafen: process.env.serverDeafen === "true",
        defaultVolume: parseInt(process.env.defaultVolume) || 35,
        supportServer:
          process.env.supportServer || "https://discord.gg/tqCq7aUZFK",
        Issues:
          process.env.issuesLink ||
          "https://github.com/SudhanPlayz/Discord-MusicBot/issues",
        permissions: parseInt(process.env.permissions) || 277083450689,
        disconnectTime: parseInt(process.env.disconnectTime) || 30000,
        twentyFourSeven: process.env.twentyFourSeven === "true",
        autoQueue: process.env.autoQueue === "true",
        autoPause: process.env.autoPause === "true",
        autoLeave: process.env.autoLeave === "true",
        defaultVoiceChannel: process.env.defaultVoiceChannel || "",
        defaultTextChannel: process.env.defaultTextChannel || "",
        spotify: {
          clientId: process.env.SPOTIFY_CLIENT_ID || "",
          clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
        },
        debug: process.env.debug === "true",
        cookieSecret: process.env.cookieSecret || "CodingWithSudhan is epic",
        website: process.env.WEBSITE_URL || "http://localhost:4200",
        nodes: [
          {
            identifier: "Main Node",
            host: process.env.LAVALINK_HOST || "lava-v3.ajieblogs.eu.org",
            port: parseInt(process.env.LAVALINK_PORT) || 443,
            password:
              process.env.LAVALINK_PASSWORD || "https://dsc.gg/ajidevserver",
            retryAmount: parseInt(process.env.LAVALINK_RETRY_AMOUNT) || 200,
            retryDelay: parseInt(process.env.LAVALINK_RETRY_DELAY) || 40,
            secure: process.env.LAVALINK_SECURE === "true",
          },
        ],
        embedColor: process.env.embedColor || "#2f3136",
        presence: {
          status: process.env.presenceStatus || "online",
          activities: [
            {
              name: process.env.presenceName || "the echo",
              type: process.env.presenceType || "STREAMING",
              url: process.env.presenceURL || "https://www.twitch.tv/discord",
            },
          ],
        },
        iconURL:
          process.env.iconURL ||
          "https://cdn.darrennathanael.com/icons/spinning_disk.gif",
      };

      res(config);
    } catch (err) {
      rej("Failed to load configuration: " + err.message);
    }
  });
};
