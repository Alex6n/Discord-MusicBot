//JotaroKujo0525 note, this is a deed that i should've done a long time ago
require("dotenv").config();

// Debug: Check if environment variables are loaded
console.log("=== Environment Variables Check ===");
console.log("Bot Token:", process.env.token ? "✓ Loaded" : "✗ Missing");
console.log(
  "Spotify Client ID:",
  process.env.SPOTIFY_CLIENT_ID ? "✓ Loaded" : "✗ Missing"
);
console.log(
  "Spotify Client Secret:",
  process.env.SPOTIFY_CLIENT_SECRET ? "✓ Loaded" : "✗ Missing"
);
console.log("===================================\n");

const DiscordMusicBot = require("./lib/DiscordMusicBot");
const { exec } = require("child_process");

if (process.env.REPL_ID) {
  console.log(
    "Replit system detected, initiating special `unhandledRejection` event listener."
  );
  process.on("unhandledRejection", (reason, promise) => {
    promise.catch((err) => {
      if (err.status === 429) {
        console.log(
          "something went wrong whilst trying to connect to discord gateway, resetting..."
        );
        exec("kill 1");
      }
    });
  });
}

const client = new DiscordMusicBot();

console.log("Make sure to fill in the config.js before starting the bot.");

const getClient = () => client;

module.exports = {
  getClient,
};
