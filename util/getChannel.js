/**
 *
 * @param {import("../lib/DiscordMusicBot")} client
 * @param {import("discord.js").GuildCommandInteraction} interaction
 * @returns
 */
module.exports = async (client, interaction) => {
  return new Promise(async (resolve) => {
    if (!interaction.member.voice.channel) {
      await interaction.reply({
        embeds: [
          client.ErrorEmbed(
            "You must be in a voice channel to use this command!"
          ),
        ],
      });
      return resolve(false);
    }

    // Check if bot is in a different channel
    if (
      interaction.guild.members.me.voice.channel &&
      interaction.member.voice.channel.id !==
        interaction.guild.members.me.voice.channel.id
    ) {
      // Bot is in a different channel - check if we should move or reject
      const botVoiceChannel = interaction.guild.members.me.voice.channel;
      const membersInBotChannel = botVoiceChannel.members.filter(
        (m) => !m.user.bot
      ).size;

      // If the bot's current channel is empty (no human users), move to user's channel
      if (!membersInBotChannel || membersInBotChannel === 0) {
        // Get the player and move it
        const player = client.manager.players.get(interaction.guild.id);
        if (player) {
          player.setVoiceChannel(interaction.member.voice.channel.id);
          player.connect();
          client.log(
            `[PLAY] Moved bot from empty channel to ${interaction.member.voice.channel.name}`
          );
        }
        // Continue to allow the command
      } else {
        // Bot is actively being used in another channel
        await interaction.reply({
          embeds: [
            client.ErrorEmbed(
              "You must be in the same voice channel as me to use this command!"
            ),
          ],
        });
        return resolve(false);
      }
    }

    if (!interaction.member.voice.channel.joinable) {
      await interaction.reply({
        embeds: [
          client.ErrorEmbed(
            "I don't have enough permission to join your voice channel!"
          ),
        ],
      });
      return resolve(false);
    }

    resolve(interaction.member.voice.channel);
  });
};
