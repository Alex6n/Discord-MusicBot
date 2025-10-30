const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
  .setName("restart")
  .setDescription("Restart the bot (Admin only)")
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
