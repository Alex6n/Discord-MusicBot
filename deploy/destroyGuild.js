//Deletes every commands from every server yikes!!1!!11!!
require("dotenv").config();
const readline = require("readline");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

// Get bot name from command line argument (default: FLINT)
const botName = process.argv[2]?.toUpperCase() || "FLINT";
const token = process.env[`${botName}_TOKEN`];
const clientId = process.env[`${botName}_CLIENT_ID`];

// Validate bot configuration
if (!token || !clientId) {
  console.error(`❌ Bot "${botName}" not found in .env file`);
  console.log("\nAvailable bots: FLINT, KOKO, ROBIN");
  console.log("\nUsage:");
  console.log(
    "  node deploy/destroyGuild.js <botname>           - Delete guild commands"
  );
  console.log(
    "  node deploy/destroyGuild.js <botname> --global  - Delete global commands"
  );
  console.log("\nExample: node deploy/destroyGuild.js FLINT");
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async () => {
  const rest = new REST({ version: "9" }).setToken(token);

  if (!process.argv.includes("--global")) {
    rl.question(
      "Enter the guild id you wanted to delete commands: ",
      async (guild) => {
        console.log(
          `Evil bot has been started to delete ${botName}'s guild commands...`
        );
        await rest
          .put(Routes.applicationGuildCommands(clientId, guild), {
            body: [],
          })
          .catch(console.log);
        console.log("Evil bot has done the deed, exiting...");
        rl.close();
      }
    );
  } else {
    console.log(
      `Evil bot has been started to delete ${botName}'s global commands...`
    );
    await rest
      .put(Routes.applicationCommands(clientId), {
        body: [],
      })
      .catch(console.log);
    console.log("Evil bot has done the deed, exiting...");
    process.exit();
  }
})();
