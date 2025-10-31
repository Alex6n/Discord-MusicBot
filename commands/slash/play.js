const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");
const escapeMarkdown = require("discord.js").Util.escapeMarkdown;

const command = new SlashCommand()
  .setName("play")
  .setDescription("Searches and plays the requested song")
  .addStringOption((option) =>
    option
      .setName("query")
      .setDescription("What am I looking for?")
      .setAutocomplete(true)
      .setRequired(true)
  )
  .setRun(async (client, interaction, options) => {
    let channel = await client.getChannel(client, interaction);
    if (!channel) {
      return;
    }

    let node = await client.getLavalink(client);
    if (!node) {
      return interaction.reply({
        embeds: [client.ErrorEmbed("Lavalink node is not connected")],
      });
    }

    let player = client.createPlayer(interaction.channel, channel);

    if (player.state !== "CONNECTED") {
      player.connect();
    }

    // If player is paused, clear the queue and resume
    if (player.paused) {
      player.queue.clear();
      player.pause(false);
      client.log(`[PLAY] Player was paused - clearing queue and resuming`);
    }

    if (channel.type == "GUILD_STAGE_VOICE") {
      setTimeout(() => {
        if (interaction.guild.members.me.voice.suppress == true) {
          try {
            interaction.guild.members.me.voice.setSuppressed(false);
          } catch (e) {
            interaction.guild.members.me.voice.setRequestToSpeak(true);
          }
        }
      }, 2000); // Need this because discord api is buggy asf, and without this the bot will not request to speak on a stage - Darren
    }

    const ret = await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setColor(client.config.embedColor)
          .setDescription(":mag_right: **Searching...**"),
      ],
      fetchReply: true,
    });

    let query = options.getString("query", true);

    // Debug: Log search details
    console.log(`[PLAY] Searching for: ${query}`);
    console.log(`[PLAY] Is Spotify URL: ${query.includes("spotify.com")}`);

    let res = await player.search(query, interaction.user).catch((err) => {
      client.error(`[PLAY] Search failed for query: ${query}`);
      console.error("[PLAY] Full search error:", err);
      console.error("[PLAY] Error stack:", err.stack);
      return {
        loadType: "LOAD_FAILED",
        error: err.message,
      };
    });

    console.log(`[PLAY] Search result loadType: ${res.loadType}`);
    console.log(`[PLAY] Tracks found: ${res.tracks?.length || 0}`);

    if (res.exception) {
      console.error("[PLAY] Exception in response:", res.exception);
    }

    if (res.loadType === "LOAD_FAILED") {
      // Don't destroy player - stay connected even on error
      const errorMsg = res.error || "Unknown error occurred";
      console.error(`[PLAY] LOAD_FAILED: ${errorMsg}`);

      await interaction
        .editReply({
          embeds: [
            new MessageEmbed()
              .setColor("RED")
              .setDescription(
                `There was an error while searching.\n\`\`\`${errorMsg}\`\`\`\nTry again or use a different query.`
              ),
          ],
        })
        .catch(this.warn);
      return;
    }

    if (res.loadType === "NO_MATCHES") {
      // Don't destroy player - stay connected even when no results
      console.warn(`[PLAY] NO_MATCHES for query: ${query}`);

      await interaction
        .editReply({
          embeds: [
            new MessageEmbed()
              .setColor("RED")
              .setDescription(
                "No results were found. Try a different search term."
              ),
          ],
        })
        .catch(this.warn);
      return;
    }

    if (res.loadType === "TRACK_LOADED" || res.loadType === "SEARCH_RESULT") {
      const track = res.tracks[0];

      // Debug: Log track info
      console.log(
        `[PLAY] Track object:`,
        JSON.stringify(
          {
            title: track.title,
            author: track.author,
            uri: track.uri,
            identifier: track.identifier,
            isSeekable: track.isSeekable,
            isStream: track.isStream,
            duration: track.duration,
            thumbnail: track.thumbnail,
            isUnresolved: track.isUnresolved,
          },
          null,
          2
        )
      );

      player.queue.add(track);

      if (!player.playing && !player.paused && !player.queue.size) {
        player.play();
      }

      // For Spotify/unresolved tracks, use author + title format
      let title;
      if (track.author && track.title) {
        title = `${track.author} - ${track.title}`;
      } else if (track.title) {
        title = track.title;
      } else {
        title = "Unknown Track";
      }

      title = escapeMarkdown(title);
      title = title.replace(/\]/g, "");
      title = title.replace(/\[/g, "");

      // Handle URI safely - Spotify tracks won't have URI until resolved
      let trackUri = track.uri || null;

      let addQueueEmbed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setAuthor({ name: "Added to queue", iconURL: client.config.iconURL })
        .setDescription(trackUri ? `[${title}](${trackUri})` : title)
        .addFields(
          {
            name: "Added by",
            value: `<@${interaction.user.id}>`,
            inline: true,
          },
          {
            name: "Duration",
            value: track.isStream
              ? `\`LIVE 🔴 \``
              : track.duration > 0
              ? `\`${client.ms(track.duration, {
                  colonNotation: true,
                  secondsDecimalDigits: 0,
                })}\`
`
              : "`Unknown`",
            inline: true,
          }
        );

      try {
        const thumbnail = track.displayThumbnail
          ? track.displayThumbnail("maxresdefault")
          : track.thumbnail || null;
        if (thumbnail) {
          addQueueEmbed.setThumbnail(thumbnail);
        }
      } catch (err) {
        if (track.thumbnail) {
          addQueueEmbed.setThumbnail(track.thumbnail);
        }
      }

      if (player.queue.totalSize > 1) {
        addQueueEmbed.addFields({
          name: "Position in queue",
          value: `${player.queue.size}`,
          inline: true,
        });
      } else {
        player.queue.previous = player.queue.current;
      }

      await interaction.editReply({ embeds: [addQueueEmbed] }).catch(this.warn);
    }

    if (res.loadType === "PLAYLIST_LOADED") {
      player.queue.add(res.tracks);

      if (
        !player.playing &&
        !player.paused &&
        player.queue.totalSize === res.tracks.length
      ) {
        player.play();
      }

      let playlistEmbed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setAuthor({
          name: "Playlist added to queue",
          iconURL: client.config.iconURL,
        })
        .setThumbnail(res.tracks[0].thumbnail)
        .setDescription(`[${res.playlist.name}](${query})`)
        .addFields(
          {
            name: "Enqueued",
            value: `\`${res.tracks.length}\` songs`,
            inline: true,
          },
          {
            name: "Playlist duration",
            value: `\`${client.ms(res.playlist.duration, {
              colonNotation: true,
              secondsDecimalDigits: 0,
            })}\``,
            inline: true,
          }
        );

      await interaction.editReply({ embeds: [playlistEmbed] }).catch(this.warn);
    }

    if (ret) setTimeout(() => ret.delete().catch(this.warn), 20000);
    return ret;
  });

module.exports = command;
