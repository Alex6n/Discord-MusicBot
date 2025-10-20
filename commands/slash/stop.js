const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
  .setName("stop")
  .setDescription(
    "Stops whatever the bot is playing and clears the queue (stays in voice channel)"
  )

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
            .setDescription("I'm not in a channel."),
        ],
        ephemeral: true,
      });
    }

    // Always clear queue and stop, but never leave channel (24/7 mode)
    player.queue.clear();
    player.stop();
    player.set("autoQueue", false);

    interaction.reply({
      embeds: [
        new MessageEmbed()
          .setColor(client.config.embedColor)
          .setDescription(
            `:stop_button: | **Stopped playback and cleared queue!**\n\nI'll stay in the channel and wait for your next command.`
          ),
      ],
    });
  });

module.exports = command;
