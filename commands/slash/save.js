const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const prettyMilliseconds = require("pretty-ms");

const command = new SlashCommand()
  .setName("save")
  .setDescription("Saves current song to your DM's")
  .setRun(async (client, interaction) => {
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
            .setDescription("There is no music playing right now."),
        ],
        ephemeral: true,
      });
    }

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

    return interaction.reply({
      embeds: [
        new MessageEmbed()
          .setColor(client.config.embedColor)
          .setDescription(
            "Please check your **DMs**. If you didn't receive any message from me please make sure your **DMs** are open"
          ),
      ],
      ephemeral: true,
    });
  });

module.exports = command;
