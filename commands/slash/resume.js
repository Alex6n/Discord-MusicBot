const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
  .setName("resume")
  .setDescription("Resume current track")
  .setRun(async (client, interaction, options) => {
    let channel = await client.getChannel(client, interaction);
    if (!channel) {
      return;
    }

    let player;
    if (client.manager) {
      player = client.manager.players.get(interaction.guild.id);
    } else {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("Lavalink node is not connected"),
        ],
      });
    }

    if (!player) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("There is no song playing right now."),
        ],
        ephemeral: true,
      });
    }

    if (!player.paused) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("Current track is already resumed"),
        ],
        ephemeral: true,
      });
    }
    player.pause(false);

    // Restore bot status to current track when resumed
    if (player.queue.current) {
      try {
        const track = player.queue.current;
        let statusText = "the echo";

        if (track.title) {
          const title = track.title;

          if (title.includes(" - ")) {
            const parts = title.split(" - ");
            let artist = parts[0].trim();
            artist = artist.replace(/\s*\(.*?\)\s*$/g, "").trim();
            artist = artist.replace(/\s*\[.*?\]\s*$/g, "").trim();

            if (artist && artist.length > 0) {
              statusText = artist;
            }
          } else {
            statusText = title;
            statusText = statusText.replace(/\s*\(.*?\)\s*$/g, "").trim();
            statusText = statusText.replace(/\s*\[.*?\]\s*$/g, "").trim();
          }
        }

        const currentPresence = client.config.presence || {};
        const currentActivity = currentPresence.activities?.[0] || {};

        await client.user.setPresence({
          status: currentPresence.status || "online",
          activities: [
            {
              name: statusText,
              type: currentActivity.type || "STREAMING",
              url: currentActivity.url || "https://www.twitch.tv/discord",
            },
          ],
        });

        console.log(`[STATUS] Restored to: ${statusText} (track resumed)`);
      } catch (err) {
        console.error("[STATUS] Failed to restore status:", err.message);
      }
    }

    return interaction.reply({
      embeds: [
        new MessageEmbed()
          .setColor(client.config.embedColor)
          .setDescription(`⏯ **Resumed!**`),
      ],
    });
  });

module.exports = command;
