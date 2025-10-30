const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
  .setName("summon")
  .setDescription("Summons the bot to your voice channel.")
  .setRun(async (client, interaction, options) => {
    // Check if user is in a voice channel
    if (!interaction.member.voice.channel) {
      const joinEmbed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setDescription(
          "❌ | **You must be in a voice channel to use this command.**"
        );
      return interaction.reply({ embeds: [joinEmbed], ephemeral: true });
    }

    const channel = interaction.member.voice.channel;

    // Check if channel is joinable
    if (!channel.joinable) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription(
              "❌ | **I don't have permission to join your voice channel!**"
            ),
        ],
        ephemeral: true,
      });
    }

    let player = client.manager.players.get(interaction.guild.id);

    // Create player if it doesn't exist
    if (!player) {
      player = client.createPlayer(interaction.channel, channel);
    }

    // Move bot to user's channel if different
    if (player.voiceChannel !== channel.id) {
      player.setVoiceChannel(channel.id);
    }

    // Connect to voice channel
    player.connect();

    interaction.reply({
      embeds: [
        client.Embed(
          `:thumbsup: | **Successfully summoned to <#${channel.id}>!**`
        ),
      ],
    });
  });

module.exports = command;
