const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

const command = new SlashCommand()
  .setName("restart")
  .setDescription("Restart the bot or all PM2 bots")
  .addStringOption((option) =>
    option
      .setName("target")
      .setDescription("Which bot(s) to restart")
      .setRequired(false)
      .addChoices(
        { name: "Current Bot Only", value: "current" },
        { name: "All PM2 Bots", value: "all" },
        { name: "Flint Bot", value: "flint-bot" },
        { name: "Koko Bot", value: "koko-bot" },
        { name: "Robin Bot", value: "robin-bot" }
      )
  )
  .setRun(async (client, interaction, options) => {
    // Check if user is bot owner/admin
    if (
      interaction.user.id !== client.config.adminId &&
      !interaction.member.permissions.has("ADMINISTRATOR")
    ) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("❌ | Only administrators can restart the bot!"),
        ],
        ephemeral: true,
      });
    }

    const target = options.getString("target") || "current";

    // Handle "all" option - restart all PM2 bots
    if (target === "all") {
      await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embedColor)
            .setAuthor({
              name: "Restarting All PM2 Bots...",
              iconURL: client.config.iconURL,
            })
            .setDescription(
              "🔄 | All bots are restarting now.\n⏱️ | This should take about 10-15 seconds.\n\n**Restarting:**\n• Flint Bot\n• Koko Bot\n• Robin Bot"
            )
            .setTimestamp(),
        ],
      });

      client.log("All PM2 bots restart initiated by " + interaction.user.tag);

      try {
        // Use PM2 to restart all bots
        const { stdout, stderr } = await execPromise(
          "pm2 restart ecosystem.config.js"
        );
        client.log("PM2 restart output:", stdout);
        if (stderr) client.warn("PM2 restart stderr:", stderr);
      } catch (err) {
        client.error("Error restarting all PM2 bots:", err.message);
        try {
          await interaction.followUp({
            embeds: [
              new MessageEmbed()
                .setColor("RED")
                .setDescription(
                  `❌ | Failed to restart all bots:\n\`\`\`${err.message}\`\`\``
                ),
            ],
            ephemeral: true,
          });
        } catch (e) {
          // Ignore if we can't send follow-up
        }
      }
      return;
    }

    // Handle specific bot restart via PM2
    if (
      target === "flint-bot" ||
      target === "koko-bot" ||
      target === "robin-bot"
    ) {
      const botName =
        target.replace("-bot", "").charAt(0).toUpperCase() +
        target.replace("-bot", "").slice(1);

      await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embedColor)
            .setAuthor({
              name: `Restarting ${botName} Bot...`,
              iconURL: client.config.iconURL,
            })
            .setDescription(
              `🔄 | ${botName} bot is restarting now.\n⏱️ | This should take about 10-15 seconds.`
            )
            .setTimestamp(),
        ],
      });

      client.log(`${botName} bot restart initiated by ${interaction.user.tag}`);

      try {
        const { stdout, stderr } = await execPromise(`pm2 restart ${target}`);
        client.log(`PM2 restart ${target} output:`, stdout);
        if (stderr) client.warn(`PM2 restart ${target} stderr:`, stderr);
      } catch (err) {
        client.error(`Error restarting ${target}:`, err.message);
        try {
          await interaction.followUp({
            embeds: [
              new MessageEmbed()
                .setColor("RED")
                .setDescription(
                  `❌ | Failed to restart ${botName} bot:\n\`\`\`${err.message}\`\`\``
                ),
            ],
            ephemeral: true,
          });
        } catch (e) {
          // Ignore if we can't send follow-up
        }
      }
      return;
    }

    // Default: restart current bot only
    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setColor(client.config.embedColor)
          .setAuthor({
            name: "Restarting Bot...",
            iconURL: client.config.iconURL,
          })
          .setDescription(
            "🔄 | The bot is restarting now.\n⏱️ | This should take about 10-15 seconds."
          )
          .setTimestamp(),
      ],
    });

    client.log("Bot restart initiated by " + interaction.user.tag);

    // Destroy all players gracefully
    client.manager.players.forEach((player) => {
      try {
        player.destroy();
      } catch (err) {
        client.error("Error destroying player during restart:", err);
      }
    });

    // Wait a moment for cleanup
    setTimeout(() => {
      client.log("Restarting bot process...");
      process.exit(0); // Exit cleanly - PM2 or similar will restart it
    }, 1000);
  });

module.exports = command;
