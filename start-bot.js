// Simple bot starter that loads specific bot from .env
require("dotenv").config();

const botName = process.argv[2]?.toLowerCase();

if (!botName || botName === "default") {
  // Use FLINT as default
  const envKey = "FLINT";
  const token = process.env[`${envKey}_TOKEN`];
  const clientId = process.env[`${envKey}_CLIENT_ID`];
  const clientSecret = process.env[`${envKey}_CLIENT_SECRET`] || "";
  const defaultVoiceChannel =
    process.env[`${envKey}_DEFAULT_VOICE_CHANNEL`] || "";
  const presenceStatus = process.env[`${envKey}_PRESENCE_STATUS`] || "online";
  const presenceName = process.env[`${envKey}_PRESENCE_NAME`] || "the echo";
  const presenceType = process.env[`${envKey}_PRESENCE_TYPE`] || "STREAMING";
  const presenceURL =
    process.env[`${envKey}_PRESENCE_URL`] || "https://www.twitch.tv/discord";

  process.env.token = token;
  process.env.clientId = clientId;
  process.env.clientSecret = clientSecret;
  process.env.defaultVoiceChannel = defaultVoiceChannel;
  process.env.presenceStatus = presenceStatus;
  process.env.presenceName = presenceName;
  process.env.presenceType = presenceType;
  process.env.presenceURL = presenceURL;

  console.log("Starting default bot: Flint");
  console.log(`Client ID: ${clientId}\n`);

  require("./index.js");
} else {
  // Load specific bot credentials
  const envKey = botName.toUpperCase();
  const token = process.env[`${envKey}_TOKEN`];
  const clientId = process.env[`${envKey}_CLIENT_ID`];
  const clientSecret = process.env[`${envKey}_CLIENT_SECRET`] || "";
  const defaultVoiceChannel =
    process.env[`${envKey}_DEFAULT_VOICE_CHANNEL`] || "";
  const presenceStatus = process.env[`${envKey}_PRESENCE_STATUS`] || "online";
  const presenceName = process.env[`${envKey}_PRESENCE_NAME`] || "the echo";
  const presenceType = process.env[`${envKey}_PRESENCE_TYPE`] || "STREAMING";
  const presenceURL =
    process.env[`${envKey}_PRESENCE_URL`] || "https://www.twitch.tv/discord";

  if (!token || !clientId) {
    console.error(`❌ Bot "${botName}" not found in .env`);
    console.log("\nAvailable bots:");
    console.log("  - flint (default)");
    console.log("  - koko");
    console.log("  - robin");
    console.log("\nUsage: npm start <botname>");
    console.log("Example: npm start flint");
    process.exit(1);
  }

  // Override environment variables with bot-specific settings
  process.env.token = token;
  process.env.clientId = clientId;
  process.env.clientSecret = clientSecret;
  process.env.defaultVoiceChannel = defaultVoiceChannel;
  process.env.presenceStatus = presenceStatus;
  process.env.presenceName = presenceName;
  process.env.presenceType = presenceType;
  process.env.presenceURL = presenceURL;

  console.log(
    `Starting bot: ${botName.charAt(0).toUpperCase() + botName.slice(1)}`
  );
  console.log(`Client ID: ${clientId}`);
  console.log(`Voice Channel: ${defaultVoiceChannel || "Not set"}`);
  console.log(`Status: ${presenceName}\n`);

  require("./index.js");
}
