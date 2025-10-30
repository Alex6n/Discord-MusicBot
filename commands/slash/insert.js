const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
  .setName("insert")
  .setDescription("Add a song to play next in the queue")
  .addStringOption((option) =>
    option
      .setName("song")
      .setDescription("The song you want to play next")
      .setRequired(true)
  )
  .setRun(async (client, interaction, options) => {
    const query = interaction.options.getString("song");

    let channel = await client.getChannel(client, interaction);
    if (!channel) return;

    let player = client.manager.players.get(interaction.guild.id);
    if (!player) {
      player = client.createPlayer(interaction.channel, channel);
    }

    await interaction.deferReply();

    let res = await player.search(query, interaction.user);

    if (res.loadType === "LOAD_FAILED") {
      if (!player.queue.current) player.destroy();
      return interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("❌ | Failed to load the track. Please try again."),
        ],
      });
    } else if (res.loadType === "NO_MATCHES") {
      if (!player.queue.current) player.destroy();
      return interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("❌ | No results found for your query."),
        ],
      });
    }

    if (res.loadType === "PLAYLIST_LOADED") {
      // For playlists, add them starting from position 0 (next)
      for (let i = res.tracks.length - 1; i >= 0; i--) {
        player.queue.add(res.tracks[i], 0);
      }

      if (!player.playing && !player.paused && !player.queue.size) {
        player.play();
      }

      return interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embedColor)
            .setAuthor({
              name: "Playlist Added to Play Next",
              iconURL: client.config.iconURL,
            })
            .setDescription(`🎵 **[${res.playlist.name}](${query})**`)
            .addFields(
              {
                name: "Tracks",
                value: `\`${res.tracks.length}\` songs`,
                inline: true,
              },
              {
                name: "Duration",
                value: res.playlist.duration
                  ? `\`${client.ms(res.playlist.duration, {
                      colonNotation: true,
                    })}\``
                  : "`Unknown`",
                inline: true,
              }
            ),
        ],
      });
    } else {
      // Single track - add at position 0 (next)
      const track = res.tracks[0];
      player.queue.add(track, 0);

      if (!player.playing && !player.paused && player.queue.totalSize === 1) {
        player.play();
      }

      return interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embedColor)
            .setAuthor({
              name: "Added to Play Next",
              iconURL: client.config.iconURL,
            })
            .setDescription(`🎵 **[${track.title}](${track.uri})**`)
            .addFields(
              {
                name: "Duration",
                value: track.isStream
                  ? "`LIVE`"
                  : `\`${client.ms(track.duration, { colonNotation: true })}\``,
                inline: true,
              },
              {
                name: "Position",
                value: "`Next in Queue`",
                inline: true,
              }
            )
            .setThumbnail(track.thumbnail || client.config.iconURL),
        ],
      });
    }
  });

module.exports = command;
