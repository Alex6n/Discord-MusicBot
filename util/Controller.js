const { MessageEmbed } = require("discord.js");
/**
 *
 * @param {import("../lib/DiscordMusicBot")} client
 * @param {import("discord.js").ButtonInteraction} interaction
 */
module.exports = async (client, interaction) => {
  let guild = client.guilds.cache.get(interaction.customId.split(":")[1]);
  let property = interaction.customId.split(":")[2];
  let player = client.manager.get(guild.id);

  if (!player) {
    await interaction.reply({
      embeds: [
        client.Embed("❌ | **There is no player to control in this server.**"),
      ],
    });
    setTimeout(() => {
      interaction.deleteReply();
    }, 5000);
    return;
  }
  if (!interaction.member.voice.channel) {
    const joinEmbed = new MessageEmbed()
      .setColor(client.config.embedColor)
      .setDescription(
        "❌ | **You must be in a voice channel to use this action!**"
      );
    return interaction.reply({ embeds: [joinEmbed], ephemeral: true });
  }

  if (
    interaction.guild.members.me.voice.channel &&
    !interaction.guild.members.me.voice.channel.equals(
      interaction.member.voice.channel
    )
  ) {
    const sameEmbed = new MessageEmbed()
      .setColor(client.config.embedColor)
      .setDescription(
        "❌ | **You must be in the same voice channel as me to use this action!**"
      );
    return await interaction.reply({ embeds: [sameEmbed], ephemeral: true });
  }

  if (property === "Stop") {
    player.queue.clear();
    player.stop();
    player.set("autoQueue", false);
    client.warn(
      `Player: ${player.options.guild} | Successfully stopped the player`
    );
    const msg = await interaction.channel.send({
      embeds: [client.Embed("⏹️ | **Successfully stopped the player**")],
    });
    setTimeout(() => {
      msg.delete();
    }, 5000);

    interaction.update({
      components: [client.createController(player.options.guild, player)],
    });
    return;
  }

  // if theres no previous song, return an error.
  if (property === "Replay") {
    const previousSong = player.queue.previous;
    const currentSong = player.queue.current;
    const nextSong = player.queue[0];
    if (
      !player.queue.previous ||
      player.queue.previous === player.queue.current ||
      player.queue.previous === player.queue[0]
    ) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription(`There is no previous song played.`),
        ],
      });
    }
    if (previousSong !== currentSong && previousSong !== nextSong) {
      player.queue.splice(0, 0, currentSong);
      player.play(previousSong);
      return interaction.deferUpdate();
    }
  }

  if (property === "PlayAndPause") {
    if (!player || (!player.playing && player.queue.totalSize === 0)) {
      const msg = await interaction.channel.send({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("There is no song playing right now."),
        ],
      });
      setTimeout(() => {
        msg.delete();
      }, 5000);
      return interaction.deferUpdate();
    } else {
      if (player.paused) {
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

            console.log(
              `[STATUS] Restored to: ${statusText} (track resumed via controller)`
            );
          } catch (err) {
            console.error("[STATUS] Failed to restore status:", err.message);
          }
        }
      } else {
        player.pause(true);

        // Reset bot status to default when paused
        try {
          await client.user.setPresence(client.config.presence);
          console.log(
            "[STATUS] Reset to default (track paused via controller)"
          );
        } catch (err) {
          console.error("[STATUS] Failed to reset status:", err.message);
        }
      }
      client.warn(
        `Player: ${player.options.guild} | Successfully ${
          player.paused ? "paused" : "resumed"
        } the player`
      );

      return interaction.update({
        components: [client.createController(player.options.guild, player)],
      });
    }
  }

  if (property === "Next") {
    const song = player.queue.current;
    const autoQueue = player.get("autoQueue");
    if (player.queue[0] == undefined && (!autoQueue || autoQueue === false)) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription(
              `There is nothing after [${song.title}](${song.uri}) in the queue.`
            ),
        ],
      });
    } else player.stop();
    return interaction.deferUpdate;
  }

  if (property === "Loop") {
    if (player.trackRepeat) {
      player.setTrackRepeat(false);
      player.setQueueRepeat(true);
    } else if (player.queueRepeat) {
      player.setQueueRepeat(false);
    } else {
      player.setTrackRepeat(true);
    }
    client.warn(
      `Player: ${player.options.guild} | Successfully toggled loop ${
        player.trackRepeat ? "on" : player.queueRepeat ? "queue on" : "off"
      } the player`
    );

    interaction.update({
      components: [client.createController(player.options.guild, player)],
    });
    return;
  }

  if (property === "Save") {
    if (!player.queue.current) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("There is no music playing right now."),
        ],
      });
    }

    const prettyMilliseconds = require("pretty-ms");
    const { MessageActionRow, MessageButton } = require("discord.js");

    const track = player.queue.current;

    // Create button to play the saved song
    const playButton = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId(
          `play_saved|||${track.uri || track.url}|||${interaction.user.id}`
        )
        .setLabel("Play Now")
        .setEmoji("▶️")
        .setStyle("PRIMARY")
    );

    const sendtoDmEmbed = new MessageEmbed()
      .setColor(client.config.embedColor)
      .setAuthor({
        name: "Saved track",
        iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}`,
      })
      .setDescription(`**Saved [${track.title}](${track.uri}) to your DM**`)
      .addFields(
        {
          name: "Track Duration",
          value: `\`${prettyMilliseconds(track.duration, {
            colonNotation: true,
          })}\``,
          inline: true,
        },
        {
          name: "Track Author",
          value: `\`${track.author}\``,
          inline: true,
        },
        {
          name: "Requested Guild",
          value: `\`${interaction.guild}\``,
          inline: true,
        }
      )
      .setFooter({
        text: "Click 'Play Now' to add this song to your current bot's queue",
      });

    try {
      await interaction.user.send({
        embeds: [sendtoDmEmbed],
        components: [playButton],
      });

      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embedColor)
            .setDescription("❤️ | **Track saved!** Please check your **DMs**."),
        ],
        ephemeral: true,
      });
    } catch (error) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription(
              "❌ | **Failed to send DM.** Please make sure your **DMs** are open."
            ),
        ],
        ephemeral: true,
      });
    }
  }

  return interaction.reply({
    ephemeral: true,
    content: "❌ | **Unknown controller option**",
  });
};
