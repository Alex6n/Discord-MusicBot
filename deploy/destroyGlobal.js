require("dotenv").config();
const { Client, Intents } = require("discord.js");

// Get bot name from command line argument (default: FLINT)
const botName = process.argv[2]?.toUpperCase() || "FLINT";
const token = process.env[`${botName}_TOKEN`];

// Validate bot configuration
if (!token) {
  console.error(`❌ Bot "${botName}" not found in .env file`);
  console.log('\nAvailable bots: FLINT, KOKO, ROBIN');
  console.log('\nUsage: node deploy/destroyGlobal.js <botname>');
  console.log('Example: node deploy/destroyGlobal.js FLINT');
  process.exit(1);
}

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

console.log(`Connecting as ${botName} bot to delete global commands...`);
client.login(token);

client.on("ready", async () => {
  const commands = await client.application.commands.fetch();

  if (commands.size === 0) {
    console.log(`Could not find any global commands for ${botName}.`);
    process.exit();
  }

  console.log(`Found ${commands.size} global commands for ${botName}. Deleting...`);
  let deletedCount = 0;

  commands.forEach(async (command) => {
    await client.application.commands.delete(command.id);
    console.log(`Slash Command with ID ${command.id} (${command.name}) has been deleted.`);
    deletedCount++;

    if (deletedCount === commands.size) {
      console.log(`✅ Successfully deleted all global slash commands for ${botName}.`);
      process.exit();
    }
  });
});
