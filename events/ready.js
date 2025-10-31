/**
 *
 * @param {import("../lib/DiscordMusicBot")} client
 */
module.exports = (client) => {
  client.manager.init(client.user.id);
  client.user.setPresence(client.config.presence);
  client.log("Successfully Logged in as " + client.user.tag);

  // Auto-join default voice channel on startup
  if (client.config.defaultVoiceChannel) {
    setTimeout(() => {
      const voiceChannel = client.channels.cache.get(
        client.config.defaultVoiceChannel
      );

      if (!voiceChannel) {
        client.warn(
          "Default voice channel not found. Please check the channel ID in config.js"
        );
        return;
      }

      if (
        voiceChannel.type !== "GUILD_VOICE" &&
        voiceChannel.type !== "GUILD_STAGE_VOICE"
      ) {
        client.warn("Default channel is not a voice channel!");
        return;
      }

      // Get or create player
      let player = client.manager.players.get(voiceChannel.guild.id);

      if (!player) {
        // Create player if it doesn't exist
        player = client.manager.create({
          guild: voiceChannel.guild.id,
          voiceChannel: voiceChannel.id,
          textChannel: client.config.defaultTextChannel || voiceChannel.id,
          selfDeafen: client.config.serverDeafen,
          volume: client.config.defaultVolume,
        });

        // Set 24/7 mode
        player.set("twentyFourSeven", true);
        player.set("autoQueue", client.config.autoQueue);
        player.set("autoPause", client.config.autoPause);
        player.set("autoLeave", false);

        // Connect to voice channel
        player.connect();

        client.log(
          `Auto-joined voice channel: ${voiceChannel.name} in ${voiceChannel.guild.name}`
        );

        // Send notification to text channel if specified
        if (client.config.defaultTextChannel) {
          const textChannel = client.channels.cache.get(
            client.config.defaultTextChannel
          );
          if (textChannel) {
            const { MessageEmbed } = require("discord.js");
            textChannel.send({
              embeds: [
                new MessageEmbed()
                  .setColor(client.config.embedColor)
                  .setAuthor({
                    name: "Bot Started in 24/7 Mode",
                    iconURL: client.config.iconURL,
                  })
                  .setDescription(
                    `🎵 Connected to <#${voiceChannel.id}>\n\n✅ 24/7 Mode: **Enabled**\n🔊 Ready for music commands!`
                  )
                  .setTimestamp(),
              ],
            });
          }
        }
      } else if (!player.voiceChannel) {
        // Player exists but not connected
        player.setVoiceChannel(voiceChannel.id);
        player.connect();
        client.log(`Reconnected to voice channel: ${voiceChannel.name}`);
      }
    }, 3000); // Wait 3 seconds for bot to fully initialize
  }
};
