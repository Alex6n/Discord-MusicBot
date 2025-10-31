const Controller = require("../util/Controller");
const yt = require("youtube-sr").default;

/**
 *
 * @param {import("../lib/DiscordMusicBot")} client
 * @param {import("discord.js").Interaction}interaction
 */
module.exports = async (client, interaction) => {
  if (interaction.isCommand()) {
    let command = client.slashCommands.find(
      (x) => x.name == interaction.commandName
    );
    if (!command || !command.run) {
      return interaction.reply(
        "Sorry the command you used doesn't have any run function"
      );
    }
    client.commandsRan++;
    command.run(client, interaction, interaction.options);
    return;
  }

  if (interaction.isContextMenu()) {
    let command = client.contextCommands.find(
      (x) => x.command.name == interaction.commandName
    );
    if (!command || !command.run) {
      return interaction.reply(
        "Sorry the command you used doesn't have any run function"
      );
    }
    client.commandsRan++;
    command.run(client, interaction, interaction.options);
    return;
  }

  if (interaction.isButton()) {
    if (interaction.customId.startsWith("controller")) {
      Controller(client, interaction);
    }
    if (interaction.customId.startsWith("play_saved")) {
      // Handle playing saved songs from DM
      const [_, trackUri, userId] = interaction.customId.split(":");

      // Verify the user clicking is the one who saved the song
      if (interaction.user.id !== userId) {
        return interaction.reply({
          content: "❌ | This button is only for the user who saved this song.",
          ephemeral: true,
        });
      }

      // Find which guild/voice channel the user is currently in
      let userVoiceChannel = null;
      let targetGuild = null;

      for (const [guildId, guild] of client.guilds.cache) {
        const member = guild.members.cache.get(interaction.user.id);
        if (member && member.voice.channel) {
          userVoiceChannel = member.voice.channel;
          targetGuild = guild;
          break;
        }
      }

      if (!userVoiceChannel) {
        return interaction.reply({
          content: "❌ | You must be in a voice channel to use this feature!",
          ephemeral: true,
        });
      }

      // Get or create player for that guild
      let player = client.manager.players.get(targetGuild.id);

      if (!player) {
        // Create a new player
        player = client.manager.create({
          guild: targetGuild.id,
          voiceChannel: userVoiceChannel.id,
          textChannel: userVoiceChannel.id,
          selfDeafen: client.config.serverDeafen,
          volume: client.config.defaultVolume,
        });
        player.connect();
      } else if (player.voiceChannel !== userVoiceChannel.id) {
        // Player exists but user is in a different channel
        return interaction.reply({
          content: `❌ | I'm already playing in <#${player.voiceChannel}>! Please join that channel or wait until I'm done there.`,
          ephemeral: true,
        });
      }

      // Search and add the track
      try {
        await interaction.deferReply({ ephemeral: true });

        const res = await player.search(trackUri, interaction.user);

        if (res.loadType === "LOAD_FAILED" || res.loadType === "NO_MATCHES") {
          return interaction.editReply({
            content:
              "❌ | Failed to load the track. The link might be expired or invalid.",
          });
        }

        const track = res.tracks[0];
        player.queue.add(track);

        if (!player.playing && !player.paused) {
          player.play();
        }

        const { MessageEmbed } = require("discord.js");
        const escapeMarkdown = require("discord.js").Util.escapeMarkdown;

        let title = track.title || "Unknown Track";
        title = escapeMarkdown(title);
        title = title.replace(/\]/g, "");
        title = title.replace(/\[/g, "");

        return interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(client.config.embedColor)
              .setAuthor({
                name: "Added to queue",
                iconURL: client.config.iconURL,
              })
              .setDescription(`[${title}](${track.uri || trackUri})`)
              .addFields(
                {
                  name: "Guild",
                  value: `${targetGuild.name}`,
                  inline: true,
                },
                {
                  name: "Voice Channel",
                  value: `<#${userVoiceChannel.id}>`,
                  inline: true,
                },
                {
                  name: "Position in queue",
                  value:
                    player.queue.size > 0
                      ? `${player.queue.size}`
                      : "Playing now",
                  inline: true,
                }
              ),
          ],
        });
      } catch (err) {
        client.error("Error playing saved song:", err);
        return interaction.editReply({
          content: `❌ | An error occurred: ${err.message}`,
        });
      }
    }
  }

  if (interaction.isAutocomplete()) {
    const url = interaction.options.getString("query");
    if (url === "") return;

    const match = [
      /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/,
      /^(?:spotify:|https:\/\/[a-z]+\.spotify\.com\/(track\/|user\/(.*)\/playlist\/|playlist\/))(.*)$/,
      /^https?:\/\/(?:www\.)?deezer\.com\/[a-z]+\/(track|album|playlist)\/(\d+)$/,
      /^(?:(https?):\/\/)?(?:(?:www|m)\.)?(soundcloud\.com|snd\.sc)\/(.*)$/,
      /(?:https:\/\/music\.apple\.com\/)(?:.+)?(artist|album|music-video|playlist)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)/,
    ].some(function (match) {
      return match.test(url) == true;
    });

    async function checkRegex() {
      if (match == true) {
        let choice = [];
        choice.push({ name: url, value: url });
        await interaction.respond(choice).catch(() => {});
      }
    }

    const Random = "ytsearch"[Math.floor(Math.random() * "ytsearch".length)];

    if (interaction.commandName == "play") {
      checkRegex();
      let choice = [];
      await yt
        .search(url || Random, { safeSearch: false, limit: 25 })
        .then((result) => {
          result.forEach((x) => {
            choice.push({ name: x.title, value: x.url });
          });
        });
      return await interaction.respond(choice).catch(() => {});
    } else if (result.loadType === "LOAD_FAILED" || "NO_MATCHES") return;
  }
};
