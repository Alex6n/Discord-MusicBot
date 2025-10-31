require("dotenv").config();
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const getConfig = require("../util/getConfig");
const LoadCommands = require("../util/loadCommands");

(async () => {
  // Get bot name from command line or use default (Flint)
  const botName = process.argv[2]?.toUpperCase() || "FLINT";
  const token = process.env[`${botName}_TOKEN`];
  const clientId = process.env[`${botName}_CLIENT_ID`];

  if (!token || !clientId) {
    console.error(`❌ Bot "${botName}" not found in .env`);
    console.log("\nAvailable bots: FLINT, KOKO, ROBIN");
    console.log("\nUsage: node deploy/deployGlobal.js <botname>");
    console.log("Example: node deploy/deployGlobal.js FLINT");
    process.exit(1);
  }

  console.log(`Deploying commands for ${botName} bot...`);

  const rest = new REST({ version: "9" }).setToken(token);
  const commands = await LoadCommands().then((cmds) => {
    return [].concat(cmds.slash).concat(cmds.context);
  });

  console.log("Deploying commands to global...");
  await rest
    .put(Routes.applicationCommands(clientId), {
      body: commands,
    })
    .catch(console.log);
  console.log("Successfully deployed commands!");
})();
