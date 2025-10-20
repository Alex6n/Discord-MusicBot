const { MessageEmbed } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");

const command = new SlashCommand()
  .setName("status")
  .setDescription("Change the bot's status color and activity")
  .addStringOption((option) =>
    option
      .setName("color")
      .setDescription("Choose the status color")
      .setRequired(true)
      .addChoices(
        { name: "🟢 Green (Online)", value: "online" },
        { name: "🟣 Purple (Streaming)", value: "streaming" },
        { name: "🟠 Idle (Away)", value: "idle" },
        { name: "🔴 Red (Do Not Disturb)", value: "dnd" }
      )
  )
  .addStringOption((option) =>
    option
      .setName("text")
      .setDescription("Status text to display (optional)")
      .setRequired(false)
  )
  .addStringOption((option) =>
    option
      .setName("type")
      .setDescription("Activity type (optional)")
      .setRequired(false)
      .addChoices(
        { name: "Playing", value: "PLAYING" },
        { name: "Watching", value: "WATCHING" },
        { name: "Listening", value: "LISTENING" },
        { name: "Streaming", value: "STREAMING" }
      )
  )
  .setRun(async (client, interaction) => {
    // Check if user is bot owner/admin
    if (
      interaction.user.id !== client.config.adminId &&
      !interaction.member.permissions.has("ADMINISTRATOR")
    ) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription(
              "❌ Only administrators can change the bot's status!"
            ),
        ],
        ephemeral: true,
      });
    }

    const colorChoice = interaction.options.getString("color");
    const statusText =
      interaction.options.getString("text") ||
      client.config.presence.activities[0].name;
    const activityType = interaction.options.getString("type") || "STREAMING";

    let newPresence = {
      activities: [
        {
          name: statusText,
          type: activityType,
        },
      ],
    };

    // Set status based on color choice
    if (colorChoice === "streaming") {
      // Purple status requires STREAMING type + URL
      newPresence.status = "online";
      newPresence.activities[0].type = "STREAMING";
      newPresence.activities[0].url = "https://www.twitch.tv/discord";
    } else {
      // Other colors use status field
      newPresence.status = colorChoice;
    }

    // Update bot's presence
    try {
      await client.user.setPresence(newPresence);

      // Update config for persistence (optional - only in memory)
      client.config.presence = newPresence;

      const colorEmojis = {
        online: "🟢 Green",
        streaming: "🟣 Purple",
        idle: "🟠 Idle",
        dnd: "🔴 Red",
      };

      const embed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setAuthor({
          name: "Status Updated",
          iconURL: client.config.iconURL,
        })
        .setDescription(
          `✅ Bot status has been changed!\n\n` +
            `**Color:** ${colorEmojis[colorChoice]}\n` +
            `**Activity:** ${activityType}\n` +
            `**Text:** ${statusText}`
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      client.error(error);
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("❌ Failed to update status: " + error.message),
        ],
        ephemeral: true,
      });
    }
  });

module.exports = command;
